import "server-only";
import { and, desc, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { kravhendelse } from "@/db/schema";
import type { Hendelseside } from "@/lib/krav/typer";

export const HENDELSER_PER_SIDE = 10;

export async function hentHendelser(
  vegobjekttypeId: number,
  forId: number | null,
): Promise<Hendelseside> {
  const rader = await db
    .select({
      id: kravhendelse.id,
      beskrivelse: kravhendelse.beskrivelse,
      tidspunkt: kravhendelse.tidspunkt,
    })
    .from(kravhendelse)
    .where(
      and(
        eq(kravhendelse.vegobjekttypeId, vegobjekttypeId),
        forId === null ? undefined : lt(kravhendelse.id, forId),
      ),
    )
    .orderBy(desc(kravhendelse.id))
    .limit(HENDELSER_PER_SIDE + 1);

  const side = rader.slice(0, HENDELSER_PER_SIDE);

  return {
    hendelser: side.map((h) => ({
      id: h.id,
      beskrivelse: h.beskrivelse,
      tidspunkt: h.tidspunkt.toISOString(),
    })),
    neste: rader.length > HENDELSER_PER_SIDE ? side[side.length - 1].id : null,
  };
}
