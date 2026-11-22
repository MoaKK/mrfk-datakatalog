"use client";

import { useEffect, useRef, useState } from "react";
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
import { useHendelser } from "@/hooks/use-krav";
import { formaterDatoOgTid } from "@/lib/dato";

interface Props {
  vegobjekttypeId: number;
  antall: number | undefined;
}

function Hendelsesliste({ vegobjekttypeId }: { vegobjekttypeId: number }) {
  const hendelser = useHendelser(vegobjekttypeId);
  const listeRef = useRef<HTMLOListElement>(null);
  const bunnRef = useRef<HTMLLIElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = hendelser;

  useEffect(() => {
    const bunn = bunnRef.current;
    if (!bunn || !hasNextPage) return;
    const observer = new IntersectionObserver(
      ([oppforing]) => {
        if (oppforing.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { root: listeRef.current, rootMargin: "80px" },
    );
    observer.observe(bunn);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (hendelser.isPending) return <Skeleton className="h-16 w-full" />;
  if (hendelser.isError) {
    return <span className="text-sm text-destructive">Kunne ikke hente hendelsesloggen.</span>;
  }

  const alle = hendelser.data.pages.flatMap((s) => s.hendelser);
  if (alle.length === 0) {
    return (
      <span className="text-sm text-muted-foreground">
        Ingen endringer er registrert på dette objektet ennå.
      </span>
    );
  }

  return (
    <ol ref={listeRef} className="flex max-h-96 flex-col overflow-y-auto pr-2">
      {alle.map((h, i) => (
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
      {hasNextPage && (
        <li ref={bunnRef} className="pt-3">
          {isFetchingNextPage && <Skeleton className="h-8 w-full" />}
        </li>
      )}
    </ol>
  );
}

export function HendelsesloggKort({ vegobjekttypeId, antall }: Props) {
  const [apen, setApen] = useState(false);

  return (
    <Card className="gap-0 py-0">
      <Accordion onValueChange={(verdi) => setApen(verdi.length > 0)}>
        <AccordionItem value="hendelseslogg">
          <AccordionTrigger
            className="items-center px-6 py-5 text-base font-semibold hover:no-underline"
            title="Vis eller skjul endringene Geodata har gjort på dette objektet"
          >
            <span className="flex items-center gap-2">
              Hendelseslogg
              {antall !== undefined && (
                <Badge variant="secondary" title={`${antall} endringer`}>
                  {antall}
                </Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            {apen && <Hendelsesliste vegobjekttypeId={vegobjekttypeId} />}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
