import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { ilike, or } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q") || "";
  if (q.length < 2) {
    return NextResponse.json({ clients: [] });
  }

  const results = await db
    .select()
    .from(clients)
    .where(
      or(
        ilike(clients.nom, `%${q}%`),
        ilike(clients.prenom, `%${q}%`),
        ilike(clients.telephone, `%${q}%`)
      )
    )
    .limit(10);

  return NextResponse.json({ clients: results });
}