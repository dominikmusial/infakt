import { NextRequest, NextResponse } from "next/server";
import { getClientFromRequest } from "@/lib/infakt/server-helper";
import { CreateInvoicePayload } from "@/lib/infakt/types";

export async function GET(req: NextRequest) {
  try {
    const client = getClientFromRequest(req);
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 25;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;

    const data = await client.getInvoices({ limit, offset, order: "invoice_date:desc" });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Błąd pobierania faktur" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = getClientFromRequest(req);
    const body = await req.json();

    // Prosta walidacja wymaganych pól
    if (!body.client_company_name) {
      return NextResponse.json(
        { error: "Nazwa kontrahenta jest wymagana" },
        { status: 400 }
      );
    }

    if (!body.services || !Array.isArray(body.services) || body.services.length === 0) {
      return NextResponse.json(
        { error: "Faktura musi zawierać co najmniej jedną pozycję usługi/towaru" },
        { status: 400 }
      );
    }

    const payload: CreateInvoicePayload = {
      payment_method: body.payment_method || "transfer",
      invoice_date: body.invoice_date || new Date().toISOString().slice(0, 10),
      sale_date: body.sale_date || new Date().toISOString().slice(0, 10),
      payment_date: body.payment_date || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      client_company_name: body.client_company_name,
      client_tax_code: body.client_tax_code,
      client_street: body.client_street,
      client_building_number: body.client_building_number,
      client_post_code: body.client_post_code,
      client_city: body.client_city,
      client_country: body.client_country || "PL",
      notes: body.notes,
      services: body.services.map((s: any) => ({
        name: s.name,
        quantity: Number(s.quantity) || 1,
        unit: s.unit || "szt.",
        unit_net_price: Number(s.unit_net_price),
        net_price: Number(s.net_price),
        tax_price: Number(s.tax_price),
        gross_price: Number(s.gross_price),
        tax_symbol: s.tax_symbol || "23",
      })),
    };

    const newInvoice = await client.createInvoice(payload);
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Błąd wystawiania faktury" },
      { status: 500 }
    );
  }
}
