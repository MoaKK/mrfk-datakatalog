import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { egenskapskrav, kravhendelse, objekttypekrav } from "@/db/schema";
import type { Kravdata } from "@/lib/krav/typer";

const MAKS_HENDELSER = 200;

export async function hentKrav(vegobjekttypeId: number): Promise<Kravdata> {
  const [egenskaper, objekt, hendelser] = await Promise.all([
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
      .select({
        id: kravhendelse.id,
        beskrivelse: kravhendelse.beskrivelse,
        tidspunkt: kravhendelse.tidspunkt,
      })
      .from(kravhendelse)
      .where(eq(kravhendelse.vegobjekttypeId, vegobjekttypeId))
      .orderBy(desc(kravhendelse.tidspunkt), desc(kravhendelse.id))
      .limit(MAKS_HENDELSER),
  ]);

  const tidspunkter = [
    ...egenskaper.map((e) => e.oppdatert.getTime()),
    ...objekt.map((o) => o.oppdatert.getTime()),
    ...hendelser.map((h) => h.tidspunkt.getTime()),
  ];

  return {
    fkb: objekt[0]?.fkb ?? false,
    fkbKommentar: objekt[0]?.fkbKommentar ?? null,
    tilleggsinformasjon: objekt[0]?.tilleggsinformasjon ?? null,
    elektro: objekt[0]?.elektro ?? false,
    egenskaper: Object.fromEntries(
      egenskaper.map((e) => [String(e.egenskapstypeId), { kreves: e.kreves, beskrivelse: e.beskrivelse }]),
    ),
    sistRevidert: tidspunkter.length > 0 ? new Date(Math.max(...tidspunkter)).toISOString() : null,
    hendelser: hendelser.map((h) => ({
      id: h.id,
      beskrivelse: h.beskrivelse,
      tidspunkt: h.tidspunkt.toISOString(),
    })),
  };
}
