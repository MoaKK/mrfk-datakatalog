"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BeskrivelseRedigerer } from "@/components/objekttype/beskrivelse-redigerer";
import { EgenskapDialog } from "@/components/objekttype/egenskap-dialog";
import { UtvidbarTekst } from "@/components/objekttype/utvidbar-tekst";
import { ViktighetBadge } from "@/components/viktighet-badge";
import type { Kravdata } from "@/lib/krav/typer";
import { erRedigerbar, PAKREVDE_VIKTIGHETER } from "@/lib/krav/standard";
import type { Egenskapstype } from "@/lib/nvdb/schemas";

interface Props {
  vegobjekttypeId: number;
  egenskaper: Egenskapstype[];
  krav?: Kravdata["egenskaper"];
  kanRedigere?: boolean;
  visNvdbBeskrivelse?: boolean;
  visAlleEgenskaper?: boolean;
  onKreves?: (egenskapstypeId: number, kreves: boolean) => void;
  onBeskrivelse?: (egenskapstypeId: number, beskrivelse: string) => Promise<void>;
}

export function EgenskapTabell({
  vegobjekttypeId,
  egenskaper,
  krav,
  kanRedigere = false,
  visNvdbBeskrivelse = false,
  visAlleEgenskaper = false,
  onKreves,
  onBeskrivelse,
}: Props) {
  const [valgtId, setValgtId] = useState<number | null>(null);
  const lagreBeskrivelse = (id: number) => (tekst: string) =>
    onBeskrivelse ? onBeskrivelse(id, tekst) : Promise.resolve();

  const synlige = egenskaper
    .filter(
      (e) =>
        erRedigerbar(e) &&
        (kanRedigere ||
          visAlleEgenskaper ||
          PAKREVDE_VIKTIGHETER.has(e.viktighet) ||
          krav?.[String(e.id)]?.kreves === true ||
          !!krav?.[String(e.id)]?.beskrivelse),
    )
    .sort((a, b) => (a.sorteringsnummer ?? 0) - (b.sorteringsnummer ?? 0));

  const bildetekst = kanRedigere
    ? "Som admin ser du alle egenskaper. Andre ser bare de som er påkrevd i NVDB, krysset av eller har en kommentar."
    : visAlleEgenskaper
      ? "Viser alle egenskaper."
      : null;

  const valgt = valgtId === null ? null : (egenskaper.find((e) => e.id === valgtId) ?? null);

  return (
    <>
    <Table className="border md:table-fixed [&_tr>*:first-child]:border-r md:[&_tr>*:nth-child(2)]:border-r">
      <TableHeader className="[&_th]:underline [&_th]:underline-offset-4">
        <TableRow className="border-b-2 hover:bg-transparent">
          <TableHead className="md:w-[40%]" title="Egenskapstypene i NVDB, med NVDB sitt krav">
            Egenskaper
          </TableHead>
          <TableHead
            className="w-16 text-center md:w-40"
            title="Vegavdelingens krav: om egenskapen må være med ved innlevering"
          >
            <span className="md:hidden">Krav</span>
            <span className="hidden md:inline">Krav til innlevering</span>
          </TableHead>
          <TableHead className="hidden md:table-cell" title="Vegavdelingens kommentar til egenskapen">
            Kommentar
          </TableHead>
        </TableRow>
      </TableHeader>
      {bildetekst && <TableCaption className="text-left">{bildetekst}</TableCaption>}
      <TableBody>
        {synlige.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={3} className="py-6 text-center whitespace-normal text-muted-foreground">
              Ingen egenskaper er påkrevd, krysset av eller kommentert for denne objekttypen.
            </TableCell>
          </TableRow>
        )}
        {synlige.map((e) => {
          const k = krav?.[String(e.id)];
          return (
            <TableRow key={e.id}>
              <TableCell
                className="cursor-pointer align-top whitespace-normal wrap-break-word transition-colors hover:bg-muted/60"
                title={`Klikk for å vise detaljer for egenskapen ${e.navn}`}
                onClick={(hendelse) => {
                  const mal = hendelse.target as HTMLElement;
                  if (mal.closest("button, a, textarea, input, [role='checkbox']")) return;
                  setValgtId(e.id);
                }}
              >
                <span className="flex flex-wrap items-center gap-2 font-medium">
                  <button
                    type="button"
                    title={`Klikk for å vise detaljer for egenskapen ${e.navn}`}
                    className="cursor-pointer text-left underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                    onClick={() => setValgtId(e.id)}
                  >
                    {e.navn}
                  </button>
                  <ViktighetBadge viktighet={e.viktighet} />
                </span>
                {visNvdbBeskrivelse && e.beskrivelse && (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    <UtvidbarTekst tekst={e.beskrivelse} hva="NVDB sin beskrivelse" />
                  </span>
                )}
                {e.veiledning && (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    <UtvidbarTekst tekst={e.veiledning} hva="forklaringen fra NVDB" />
                  </span>
                )}
                {(k?.beskrivelse || kanRedigere) && (
                  <span className="mt-2 block md:hidden">
                    <BeskrivelseRedigerer
                      verdi={k?.beskrivelse ?? null}
                      navn={e.navn}
                      kanRedigere={kanRedigere}
                      onLagre={lagreBeskrivelse(e.id)}
                    />
                  </span>
                )}
              </TableCell>
              <TableCell className="align-top">
                <Checkbox
                  disabled={!kanRedigere}
                  checked={k?.kreves ?? false}
                  onCheckedChange={(c) => onKreves?.(e.id, c === true)}
                  className="mx-auto"
                  aria-label={`Krav til innlevering: ${e.navn}`}
                  title={
                    kanRedigere
                      ? `Marker om ${e.navn} må være med ved innlevering`
                      : `${e.navn}: ${k?.kreves ? "må være med ved innlevering" : "ikke krav til innlevering"}`
                  }
                />
              </TableCell>
              <TableCell className="hidden align-top whitespace-normal wrap-anywhere md:table-cell">
                <BeskrivelseRedigerer
                  verdi={k?.beskrivelse ?? null}
                  navn={e.navn}
                  kanRedigere={kanRedigere}
                  onLagre={lagreBeskrivelse(e.id)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
    <EgenskapDialog
      egenskap={valgt}
      vegobjekttypeId={vegobjekttypeId}
      krav={valgt ? krav?.[String(valgt.id)] : undefined}
      kanRedigere={kanRedigere}
      onOpenChange={(open) => {
        if (!open) setValgtId(null);
      }}
      onKreves={valgt ? (kreves) => onKreves?.(valgt.id, kreves) : undefined}
      onBeskrivelse={valgt ? lagreBeskrivelse(valgt.id) : undefined}
    />
    </>
  );
}
