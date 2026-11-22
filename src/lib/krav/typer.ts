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
  antallHendelser: number;
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

export interface Hendelseside {
  hendelser: Kravhendelse[];
  neste: number | null;
}
