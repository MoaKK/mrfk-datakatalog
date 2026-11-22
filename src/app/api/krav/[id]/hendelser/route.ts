import { connection, NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { hentHendelser } from "@/lib/krav/hendelser";

const idSchema = z.string().regex(/^\d{1,7}$/).transform(Number);
const markorSchema = z.string().regex(/^\d{1,10}$/).transform(Number).nullable();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  const id = idSchema.safeParse((await params).id);
  const for_ = markorSchema.safeParse(req.nextUrl.searchParams.get("for"));
  if (!id.success || !for_.success) {
    return NextResponse.json({ feil: "Ugyldig forespørsel" }, { status: 400 });
  }
  try {
    const side = await hentHendelser(id.data, for_.data);
    return NextResponse.json(side, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ feil: "Kunne ikke hente hendelsesloggen" }, { status: 500 });
  }
}
