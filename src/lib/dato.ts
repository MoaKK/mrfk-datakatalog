const DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Oslo",
});

const DATO_OG_TID = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});

export function formaterDato(iso: string) {
  return DATO.format(new Date(iso));
}

export function formaterDatoOgTid(iso: string) {
  return DATO_OG_TID.format(new Date(iso));
}
