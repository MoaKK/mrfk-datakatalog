import type { Egenskapskrav, Kravdata } from "@/lib/krav/typer";
import { SKJULTE_EGENSKAPSTYPER, type Egenskapstype } from "@/lib/nvdb/schemas";

export const PAKREVDE_VIKTIGHETER = new Set(["PÅKREVD_ABSOLUTT", "PÅKREVD_IKKE_ABSOLUTT"]);

export type EgenskapInfo = Pick<Egenskapstype, "id" | "egenskapstype" | "viktighet">;

export function erRedigerbar(e: EgenskapInfo) {
  return (
    !SKJULTE_EGENSKAPSTYPER.has(e.egenskapstype) &&
    e.egenskapstype !== "Geometri" &&
    e.viktighet !== "HISTORISK"
  );
}

export function redigerbareIder(egenskaper: EgenskapInfo[]) {
  return egenskaper.filter(erRedigerbar).map((e) => e.id);
}

export function pakrevdeIder(egenskaper: EgenskapInfo[]) {
  return egenskaper
    .filter((e) => erRedigerbar(e) && PAKREVDE_VIKTIGHETER.has(e.viktighet))
    .map((e) => e.id);
}

export function standardKrav(egenskaper: EgenskapInfo[]): Record<string, Egenskapskrav> {
  return Object.fromEntries(
    pakrevdeIder(egenskaper).map((id) => [String(id), { kreves: true, beskrivelse: null }]),
  );
}

export function effektiveKrav(
  data: Kravdata | undefined,
  egenskaper: EgenskapInfo[],
): Record<string, Egenskapskrav> | undefined {
  if (!data) return undefined;
  return data.vurdert ? data.egenskaper : { ...standardKrav(egenskaper), ...data.egenskaper };
}
