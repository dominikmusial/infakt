import { NextRequest, NextResponse } from "next/server";
import { getClientFromRequest } from "@/lib/infakt/server-helper";
import { CreateClientPayload } from "@/lib/infakt/types";

export async function GET(req: NextRequest) {
  try {
    const client = getClientFromRequest(req);
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;

    const data = await client.getClients({ limit, offset });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Błąd pobierania kontrahentów" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = getClientFromRequest(req);
    const body = await req.json();

    if (!body.company_name) {
      return NextResponse.json(
        { error: "Nazwa firmy / klienta jest wymagana" },
        { status: 400 }
      );
    }

    const payload: CreateClientPayload = {
      company_name: body.company_name,
      tax_id: body.tax_id ? String(body.tax_id).replace(/[^0-9A-Z]/gi, "") : undefined,
      street: body.street,
      building_number: body.building_number,
      door_number: body.door_number,
      post_code: body.post_code,
      city: body.city,
      country_code: body.country_code || "PL",
      email: body.email,
      phone: body.phone,
    };

    const newClient = await client.createClient(payload);
    return NextResponse.json(newClient, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Błąd dodawania kontrahenta" },
      { status: 500 }
    );
  }
}
