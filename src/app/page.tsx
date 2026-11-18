import { Signpost } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function Home() {
  return (
    <Empty className="border">
      <EmptyHeader className="max-w-xl">
        <EmptyMedia variant="icon">
          <Signpost />
        </EmptyMedia>
        <EmptyTitle>Velg en vegobjekt i menyen til venstre</EmptyTitle>
        <EmptyDescription>
          Denne siden viser hvilke egenskaper Geodata i Møre og Romsdal fylkeskommune krever at
          entreprenører og innmålere fyller ut når de leverer data til kontroll i Datafangst. For
          hvert vegobjekt har Geodata angitt hvilke egenskaper som skal være med i leveranser. Velg
          eller søk etter et vegobjekt i menyen for å se kravene.
        </EmptyDescription>
        <EmptyDescription>
          Mange egenskaper som er viktige for fylkeskommunen, blant annet for drift, vedlikehold og
          trafikkinformasjon, er ikke alltid angitt som påkrevde i NVDB. Derfor blir de ofte ikke
          fylt ut, og vi må be om at dataene leveres på nytt. Her har vi angitt hvilke egenskaper vi
          i tillegg krever i innleveringer, slik at kontrollen i Datafangst blir enklere og mer
          effektiv, både for oss og for innmålere.
        </EmptyDescription>
        <EmptyDescription>
          Vegobjektene, egenskapene, beskrivelsene og NVDB sine egne krav hentes direkte fra NVDB
          sitt API og er ikke endret. Geodata legger bare til egne krav og veiledende kommentarer.
          Siden er ikke den offisielle datakatalogen for NVDB. Den finner du hos{" "}
          <a
            href="https://datakatalogen.atlas.vegvesen.no/"
            target="_blank"
            rel="noopener noreferrer"
            title="Åpne den offisielle datakatalogen for NVDB hos Statens vegvesen i en ny fane"
          >
            Statens vegvesen
          </a>
          .
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
