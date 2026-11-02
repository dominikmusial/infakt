import { NextRequest, NextResponse } from "next/server";
import { getClientFromRequest } from "@/lib/infakt/server-helper";

export async function GET(
  req: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const { uuid } = params;
    if (!uuid) {
      return NextResponse.json({ error: "Brak identyfikatora UUID faktury" }, { status: 400 });
    }

    const client = getClientFromRequest(req);
    const pdfArrayBuffer = await client.getInvoicePdf(uuid, "original");

    return new Response(pdfArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="faktura-${uuid}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Błąd pobierania pliku PDF faktury" },
      { status: 500 }
    );
  }
}
