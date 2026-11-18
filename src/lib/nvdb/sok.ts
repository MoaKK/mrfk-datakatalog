import type { VegobjekttypeIndeks } from "@/lib/nvdb/schemas";
import { tilDatakategori, type Datakategori } from "@/lib/nvdb/kategori";

export interface Sokevalg {
  tekst: string;
  kategoriId: number | null;
  sortering: "navn" | "nummer";
  bareElektro: boolean;
  visSomListe: boolean;
}

export const STANDARD_SOKEVALG: Sokevalg = {
  tekst: "",
  kategoriId: null,
  sortering: "navn",
  bareElektro: false,
  visSomListe: false,
};

export interface Sokeresultat {
  type: VegobjekttypeIndeks;
}

export type Sokegrupper = Record<Datakategori, Sokeresultat[]>;

export function sokVegobjekttyper(indeks: VegobjekttypeIndeks[], valg: Sokevalg): Sokegrupper {
  const q = valg.tekst.trim().toLowerCase();
  const erNummer = /^\d+$/.test(q);
  const grupper: Sokegrupper = { "1": [], "2": [], "3": [], annet: [] };

  for (const type of indeks) {
    if (valg.kategoriId !== null && !type.kategorier.includes(valg.kategoriId)) continue;

    const match =
      q.length === 0 ||
      type.navn.toLowerCase().includes(q) ||
      (erNummer && String(type.id).startsWith(q));

    if (match) grupper[tilDatakategori(type.hovedkategori)].push({ type });
  }

  for (const gruppe of Object.values(grupper)) sorterResultater(gruppe, valg.sortering);
  return grupper;
}
export function sorterResultater(liste: Sokeresultat[], sortering: Sokevalg["sortering"]) {
  return liste.sort((a, b) =>
    sortering === "nummer" ? a.type.id - b.type.id : a.type.navn.localeCompare(b.type.navn, "nb"),
  );
}
