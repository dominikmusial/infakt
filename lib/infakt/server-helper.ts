import { NextRequest } from "next/server";
import { InfaktClient } from "./client";
import { InfaktEnvironment } from "./types";

export function getClientFromRequest(req: NextRequest): InfaktClient {
  const customKey = req.headers.get("x-infakt-api-key") || undefined;
  const customEnv = (req.headers.get("x-infakt-environment") as InfaktEnvironment) || undefined;

  return new InfaktClient({
    apiKey: customKey || process.env.INFAKT_API_KEY,
    environment: customEnv || (process.env.INFAKT_ENVIRONMENT as InfaktEnvironment) || "sandbox",
  });
}

