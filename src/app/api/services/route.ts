import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services, sites } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET – Liste des services (public pour la page tarifs)
export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId");

  let result;
  if (siteId) {
    result = await db.execute(
      sql`SELECT s.id, s.nom, s.description, s.tarif_unitaire as "tarifUnitaire",
          s.actif, s.site_id as "siteId", st.nom as "siteNom"
        FROM services s
        LEFT JOIN sites st ON s.site_id = st.id
        WHERE s.actif = 1 AND s.site_id = ${Number(siteId)}
        ORDER BY s.nom`
    );
  } else {
    result = await db.execute(
      sql`SELECT s.id, s.nom, s.description, s.tarif_unitaire as "tarifUnitaire",
          s.actif, s.site_id as "siteId", st.nom as "siteNom"
        FROM services s
        LEFT JOIN sites st ON s.site_id = st.id
        WHERE s.actif = 1
        ORDER BY s.nom`
    );
  }

  return NextResponse.json({ services: result.rows });
}

// POST – Créer un service (gérant/admin)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["gerant", "administrateur"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { nom, description, tarifUnitaire, siteId } = body;

  if (!nom || !tarifUnitaire || !siteId) {
    return NextResponse.json(
      { error: "Nom, tarif et site requis." },
      { status: 400 }
    );
  }

  const [service] = await db
    .insert(services)
    .values({
      nom,
      description: description || null,
      tarifUnitaire: String(tarifUnitaire),
      siteId: Number(siteId),
    })
    .returning();

  return NextResponse.json({ success: true, service });
}