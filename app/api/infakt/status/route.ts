import { NextRequest, NextResponse } from "next/server";
import { getClientFromRequest } from "@/lib/infakt/server-helper";

export async function GET(req: NextRequest) {
  try {
    const client = getClientFromRequest(req);
    const result = await client.testConnection();

    return NextResponse.json({
      ...result,
      isEnvConfigured: Boolean(process.env.INFAKT_API_KEY && process.env.INFAKT_API_KEY.trim().length > 0),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Błąd podczas sprawdzania połączenia",
      },
      { status: 500 }
    );
  }
}
