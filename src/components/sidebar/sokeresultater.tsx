"use client";

import { useEffect, useRef, useState } from "react";
import { ObjekttypeMeny } from "@/components/sidebar/objekttype-meny";
import { Skeleton } from "@/components/ui/skeleton";
import type { Sokeresultat } from "@/lib/nvdb/sok";

const PER_SIDE = 20;

interface Props {
  resultater: Sokeresultat[];
  erElektro?: (id: number, kategorier: number[]) => boolean;
}

export function Sokeresultater({ resultater, erElektro }: Props) {
  const [antall, setAntall] = useState(PER_SIDE);
  const bunnRef = useRef<HTMLDivElement>(null);
  const flereIgjen = antall < resultater.length;

  useEffect(() => {
    const bunn = bunnRef.current;
    if (!bunn || !flereIgjen) return;
    const observer = new IntersectionObserver(
      ([oppforing]) => {
        if (oppforing.isIntersecting) setAntall((a) => a + PER_SIDE);
      },
      { rootMargin: "160px" },
    );
    observer.observe(bunn);
    return () => observer.disconnect();
  }, [flereIgjen, antall]);

  return (
    <>
      <span className="px-2 pb-1 text-xs text-muted-foreground">
        {resultater.length} treff
      </span>
      <ObjekttypeMeny
        resultater={resultater.slice(0, antall)}
        erElektro={erElektro}
        etikettKlasse="sticky top-0 z-10 bg-sidebar"
      />
      {flereIgjen && (
        <div ref={bunnRef} className="px-2 py-2">
          <Skeleton className="h-8 w-full" />
        </div>
      )}
    </>
  );
}
