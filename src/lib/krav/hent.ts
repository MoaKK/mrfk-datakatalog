import "server-only";
import { count, eq, max } from "drizzle-orm";
import { db } from "@/db";
import { egenskapskrav, kravhendelse, objekttypekrav } from "@/db/schema";
import type { Kravdata } from "@/lib/krav/typer";

export async function hentKrav(vegobjekttypeId: number): Promise<Kravdata> {
  const [egenskaper, objekt, logg] = await Promise.all([
    db
      .select({
        egenskapstypeId: egenskapskrav.egenskapstypeId,
        kreves: egenskapskrav.kreves,
        beskrivelse: egenskapskrav.beskrivelse,
        oppdatert: egenskapskrav.oppdatert,
      })
      .from(egenskapskrav)
      .where(eq(egenskapskrav.vegobjekttypeId, vegobjekttypeId)),
    db
      .select({
        fkb: objekttypekrav.fkb,
        fkbKommentar: objekttypekrav.fkbKommentar,
        tilleggsinformasjon: objekttypekrav.tilleggsinformasjon,
        elektro: objekttypekrav.elektro,
        oppdatert: objekttypekrav.oppdatert,
      })
      .from(objekttypekrav)
      .where(eq(objekttypekrav.vegobjekttypeId, vegobjekttypeId))
      .limit(1),
    db
      .select({ antall: count(), sist: max(kravhendelse.tidspunkt) })
      .from(kravhendelse)
      .where(eq(kravhendelse.vegobjekttypeId, vegobjekttypeId)),
  ]);

  const tidspunkter = [
    ...egenskaper.map((e) => e.oppdatert.getTime()),
    ...objekt.map((o) => o.oppdatert.getTime()),
    ...(logg[0]?.sist ? [new Date(logg[0].sist).getTime()] : []),
  ];

  return {
    fkb: objekt[0]?.fkb ?? false,
    fkbKommentar: objekt[0]?.fkbKommentar ?? null,
    tilleggsinformasjon: objekt[0]?.tilleggsinformasjon ?? null,
    elektro: objekt[0]?.elektro ?? false,
    egenskaper: Object.fromEntries(
      egenskaper.map((e) => [String(e.egenskapstypeId), { kreves: e.kreves, beskrivelse: e.beskrivelse }]),
    ),
    vurdert: egenskaper.length > 0,
    sistRevidert: tidspunkter.length > 0 ? new Date(Math.max(...tidspunkter)).toISOString() : null,
    antallHendelser: Number(logg[0]?.antall ?? 0),
  };
}
