import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sites } from "@/db/schema";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET – Liste des sites
export async function GET() {
  const result = await db.execute(
    sql`SELECT id, nom, adresse, telephone, actif FROM sites ORDER BY nom`
  );
  return NextResponse.json({ sites: result.rows });
}

// POST – Créer un site (admin seulement)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "administrateur") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { nom, adresse, telephone } = body;

  if (!nom) {
    return NextResponse.json({ error: "Nom requis." }, { status: 400 });
  }

  const [site] = await db
    .insert(sites)
    .values({ nom, adresse: adresse || null, telephone: telephone || null })
    .returning();

  return NextResponse.json({ success: true, site });
}