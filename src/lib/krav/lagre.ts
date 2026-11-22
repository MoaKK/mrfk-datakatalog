"use server";

import { headers } from "next/headers";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { egenskapskrav, kravhendelse, objekttypekrav } from "@/db/schema";
import { auth, erAdminEpost } from "@/lib/auth";
import { kravendringSchema } from "@/lib/krav/endring";
import { hentVegobjekttype } from "@/lib/nvdb/client";
import { SKJULTE_EGENSKAPSTYPER } from "@/lib/nvdb/schemas";

export type Lagreresultat = { ok: true } | { ok: false; feil: string };

function tekstHendelse(hva: string, forrige: string | null, ny: string | null) {
  if ((forrige ?? "") === (ny ?? "")) return null;
  if (!ny) return `Admin fjernet ${hva}`;
  return forrige ? `Admin endret ${hva}` : `Admin la til ${hva}`;
}

export async function lagreKravendring(input: unknown): Promise<Lagreresultat> {
  const sesjon = await auth.api.getSession({ headers: await headers() });
  if (!sesjon || !erAdminEpost(sesjon.user.email)) {
    return { ok: false, feil: "Du må være innlogget som admin." };
  }

  const parsed = kravendringSchema.safeParse(input);
  if (!parsed.success) return { ok: false, feil: "Ugyldige data." };
  const endring = parsed.data;
  const vegobjekttypeId = endring.vegobjekttypeId;

  let type;
  try {
    type = await hentVegobjekttype(vegobjekttypeId);
  } catch {
    return { ok: false, feil: "Fant ikke vegobjekttypen i NVDB." };
  }

  const brukerId = sesjon.user.id;
  const loggfor = (beskrivelse: string | null) =>
    beskrivelse
      ? db.insert(kravhendelse).values({
          vegobjekttypeId,
          beskrivelse: beskrivelse.slice(0, 300),
          utfortAv: brukerId,
        })
      : null;

  try {
    if (
      endring.type === "fkb" ||
      endring.type === "fkbKommentar" ||
      endring.type === "tilleggsinformasjon" ||
      endring.type === "elektro"
    ) {
      const [forrige] = await db
        .select()
        .from(objekttypekrav)
        .where(eq(objekttypekrav.vegobjekttypeId, vegobjekttypeId))
        .limit(1);

      let objektfelt;
      let hendelse: string | null;
      if (endring.type === "fkb") {
        objektfelt = { fkb: endring.fkb };
        hendelse =
          (forrige?.fkb ?? false) === endring.fkb
            ? null
            : endring.fkb
              ? "Admin markerte at objektet skal registreres i FKB"
              : "Admin markerte at objektet ikke skal registreres i FKB";
      } else if (endring.type === "fkbKommentar") {
        const ny = endring.kommentar || null;
        objektfelt = { fkbKommentar: ny };
        hendelse = tekstHendelse("kommentar på FKB", forrige?.fkbKommentar ?? null, ny);
      } else if (endring.type === "tilleggsinformasjon") {
        const ny = endring.tekst || null;
        objektfelt = { tilleggsinformasjon: ny };
        hendelse = tekstHendelse(
          "tilleggsinformasjon fra Geodata",
          forrige?.tilleggsinformasjon ?? null,
          ny,
        );
      } else {
        objektfelt = { elektro: endring.elektro };
        hendelse =
          (forrige?.elektro ?? false) === endring.elektro
            ? null
            : endring.elektro
              ? "Admin markerte objektet som elektro-objekt"
              : "Admin fjernet markeringen som elektro-objekt";
      }

      const skriv = db
        .insert(objekttypekrav)
        .values({ vegobjekttypeId, ...objektfelt, oppdatertAv: brukerId })
        .onConflictDoUpdate({
          target: objekttypekrav.vegobjekttypeId,
          set: { ...objektfelt, oppdatert: sql`now()`, oppdatertAv: brukerId },
        });
      const logg = loggfor(hendelse);
      if (logg) await db.batch([skriv, logg]);
      else await skriv;
      return { ok: true };
    }

    const egenskap = type.egenskapstyper.find((e) => e.id === endring.egenskapstypeId);
    if (
      !egenskap ||
      SKJULTE_EGENSKAPSTYPER.has(egenskap.egenskapstype) ||
      egenskap.egenskapstype === "Geometri" ||
      egenskap.viktighet === "HISTORISK"
    ) {
      return { ok: false, feil: "Egenskapen hører ikke til denne vegobjekttypen." };
    }

    const [forrige] = await db
      .select()
      .from(egenskapskrav)
      .where(
        and(
          eq(egenskapskrav.vegobjekttypeId, vegobjekttypeId),
          eq(egenskapskrav.egenskapstypeId, endring.egenskapstypeId),
        ),
      )
      .limit(1);

    let felt;
    let hendelse: string | null;
    if (endring.type === "kreves") {
      felt = { kreves: endring.kreves };
      hendelse =
        (forrige?.kreves ?? false) === endring.kreves
          ? null
          : endring.kreves
            ? `Admin krysset av «${egenskap.navn}» som krav til innlevering`
            : `Admin fjernet «${egenskap.navn}» som krav til innlevering`;
    } else {
      const ny = endring.beskrivelse || null;
      felt = { beskrivelse: ny };
      hendelse = tekstHendelse(`kommentar på «${egenskap.navn}»`, forrige?.beskrivelse ?? null, ny);
    }

    const skriv = db
      .insert(egenskapskrav)
      .values({
        vegobjekttypeId,
        egenskapstypeId: endring.egenskapstypeId,
        ...felt,
        oppdatertAv: brukerId,
      })
      .onConflictDoUpdate({
        target: [egenskapskrav.vegobjekttypeId, egenskapskrav.egenskapstypeId],
        set: { ...felt, oppdatert: sql`now()`, oppdatertAv: brukerId },
      });
    const logg = loggfor(hendelse);
    if (logg) await db.batch([skriv, logg]);
    else await skriv;
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, feil: "Kunne ikke lagre. Prøv igjen." };
  }
}
