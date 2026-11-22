"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formaterDatoOgTid } from "@/lib/dato";
import type { Kravhendelse } from "@/lib/krav/typer";

interface Props {
  hendelser: Kravhendelse[] | undefined;
}

export function HendelsesloggKort({ hendelser }: Props) {
  return (
    <Card className="gap-0 py-0">
      <Accordion>
        <AccordionItem value="hendelseslogg">
          <AccordionTrigger
            className="items-center px-6 py-5 text-base font-semibold hover:no-underline"
            title="Vis eller skjul endringene Geodata har gjort på dette objektet"
          >
            <span className="flex items-center gap-2">
              Hendelseslogg
              {hendelser && (
                <Badge variant="secondary" title={`${hendelser.length} endringer`}>
                  {hendelser.length}
                </Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            {!hendelser ? (
              <Skeleton className="h-16 w-full" />
            ) : hendelser.length === 0 ? (
              <span className="text-sm text-muted-foreground">
                Ingen endringer er registrert på dette objektet ennå.
              </span>
            ) : (
              <ol className="flex max-h-96 flex-col overflow-y-auto">
                {hendelser.map((h, i) => (
                  <li key={h.id} className="flex flex-col">
                    {i > 0 && <Separator className="my-2" />}
                    <span className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4">
                      <time
                        dateTime={h.tidspunkt}
                        className="shrink-0 text-xs text-muted-foreground tabular-nums sm:w-32"
                      >
                        {formaterDatoOgTid(h.tidspunkt)}
                      </time>
                      <span className="text-sm">{h.beskrivelse}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
