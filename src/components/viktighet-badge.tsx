import { Badge } from "@/components/ui/badge";
import { VIKTIGHET_TEKST } from "@/lib/nvdb/schemas";

const VARIANT = {
  PÅKREVD_ABSOLUTT: "absolutt",
  PÅKREVD_IKKE_ABSOLUTT: "pakrevd",
  BETINGET: "betinget",
  OPSJONELL: "opsjonell",
  MINDRE_VIKTIG: "mindre",
} as const;

export function ViktighetBadge({ viktighet }: { viktighet: string }) {
  const variant = VARIANT[viktighet as keyof typeof VARIANT];
  if (!variant) return null;
  const tekst = VIKTIGHET_TEKST[viktighet];

  return (
    <Badge variant={variant} title={`Krav i NVDB: ${tekst}`}>
      {tekst}
    </Badge>
  );
}
