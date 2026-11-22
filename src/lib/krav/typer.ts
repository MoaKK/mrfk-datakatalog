export interface Egenskapskrav {
  kreves: boolean;
  beskrivelse: string | null;
}

export interface Kravdata {
  fkb: boolean;
  fkbKommentar: string | null;
  tilleggsinformasjon: string | null;
  elektro: boolean;
  egenskaper: Record<string, Egenskapskrav>;
  sistRevidert: string | null;
  hendelser: Kravhendelse[];
}

export interface Kravhendelse {
  id: number;
  beskrivelse: string;
  tidspunkt: string;
}

export interface Kravoversikt {
  medKrav: number[];
  elektro: number[];
}
