"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { BeskrivelseRedigerer } from "@/components/objekttype/beskrivelse-redigerer";
import { UtvidbarTekst } from "@/components/objekttype/utvidbar-tekst";
import { ViktighetBadge } from "@/components/viktighet-badge";
import type { Egenskapskrav } from "@/lib/krav/typer";
import type { Egenskapstype } from "@/lib/nvdb/schemas";
import { vegkartEgenskap, vegkartTillattVerdi } from "@/lib/nvdb/vegkart";
import { TOPPLINJE_KNAPP } from "@/lib/topplinje";

interface Props {
  egenskap: Egenskapstype | null;
  vegobjekttypeId: number;
  krav?: Egenskapskrav;
  kanRedigere: boolean;
  onOpenChange: (open: boolean) => void;
  onKreves?: (kreves: boolean) => void;
  onBeskrivelse?: (tekst: string) => Promise<void>;
}

function VegkartLenke({ href, hva }: { href: string; hva: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto shrink-0 px-2 py-1"
      nativeButton={false}
      render={
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Vis ${hva} i NVDB vegkart (åpnes i ny fane)`}
        />
      }
    >
      <Image src="/vegvesen-merke.png" alt="" width={14} height={14} />
      Vis i vegkart
    </Button>
  );
}

function Seksjon({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-sm font-medium">{tittel}</h3>
      {children}
    </section>
  );
}

export function EgenskapDialog({
  egenskap,
  vegobjekttypeId,
  krav,
  kanRedigere,
  onOpenChange,
  onKreves,
  onBeskrivelse,
}: Props) {
  const verdier = [...(egenskap?.tillatte_verdier ?? [])].sort(
    (a, b) => (a.sorteringsnummer ?? 0) - (b.sorteringsnummer ?? 0),
  );

  return (
    <ResponsiveDialog open={egenskap !== null} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        {egenskap && (
          <>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle className="flex flex-wrap items-center gap-2 pr-8 text-lg">
                {egenskap.navn}
                <ViktighetBadge viktighet={egenskap.viktighet} />
              </ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Egenskapstype i NVDB (id: {egenskap.id})
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>

            <ResponsiveDialogBody className="flex flex-col gap-4 pt-2">
              {egenskap.beskrivelse && (
                <Seksjon tittel="Beskrivelse">
                  <span className="text-sm text-muted-foreground">
                    <UtvidbarTekst tekst={egenskap.beskrivelse} hva="beskrivelsen" />
                  </span>
                </Seksjon>
              )}

              {egenskap.veiledning && (
                <Seksjon tittel="Hvorfor kravet gjelder">
                  <span className="text-sm text-muted-foreground">
                    <UtvidbarTekst tekst={egenskap.veiledning} hva="forklaringen fra NVDB" />
                  </span>
                </Seksjon>
              )}

              <Separator />

              <Field orientation="horizontal">
                <Checkbox
                  id={`dialog-krav-${egenskap.id}`}
                  disabled={!kanRedigere}
                  checked={krav?.kreves ?? false}
                  onCheckedChange={(c) => onKreves?.(c === true)}
                  title={
                    kanRedigere
                      ? `Marker om ${egenskap.navn} må være med ved innlevering`
                      : undefined
                  }
                />
                <FieldLabel htmlFor={`dialog-krav-${egenskap.id}`} className="font-normal">
                  {krav?.kreves
                    ? "Krav til innlevering fra Geodata"
                    : "Ikke krav til innlevering fra Geodata"}
                </FieldLabel>
              </Field>

              {(krav?.beskrivelse || kanRedigere) && (
                <Seksjon tittel="Kommentar fra Geodata">
                  <BeskrivelseRedigerer
                    verdi={krav?.beskrivelse ?? null}
                    navn={egenskap.navn}
                    kanRedigere={kanRedigere}
                    onLagre={onBeskrivelse ?? (() => Promise.resolve())}
                  />
                </Seksjon>
              )}

              <Separator />

              <span className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-medium">
                  {verdier.length > 0 ? `Tillatte verdier (${verdier.length})` : "Verdi"}
                </h3>
                <VegkartLenke
                  href={vegkartEgenskap(vegobjekttypeId, egenskap.id)}
                  hva={`objekter med ${egenskap.navn} utfylt`}
                />
              </span>

              {verdier.length > 0 ? (
                <ul className="flex flex-col">
                  {verdier.map((v, i) => (
                    <li key={v.id} className="flex flex-col">
                      {i > 0 && <Separator />}
                      <span className="flex items-center justify-between gap-2 py-1.5">
                        <span className="text-sm">
                          {v.verdi ?? v.kortnavn ?? "Uten navn"}{" "}
                          <span className="text-xs text-muted-foreground tabular-nums">
                            (id: {v.id})
                          </span>
                        </span>
                        <VegkartLenke
                          href={vegkartTillattVerdi(vegobjekttypeId, egenskap.id, v.id)}
                          hva={`objekter der ${egenskap.navn} er ${v.verdi ?? v.id}`}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Fritt felt uten faste verdier ({egenskap.egenskapstype.toLowerCase()}).
                </span>
              )}
            </ResponsiveDialogBody>

            <ResponsiveDialogFooter>
              <Button
                variant="outline"
                className={TOPPLINJE_KNAPP}
                onClick={() => onOpenChange(false)}
                title="Lukk"
              >
                Lukk
              </Button>
            </ResponsiveDialogFooter>
          </>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
