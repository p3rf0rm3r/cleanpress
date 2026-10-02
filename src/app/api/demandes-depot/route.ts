import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { demandesDepot } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET – Liste des demandes (réceptionniste/gérant)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const statut = req.nextUrl.searchParams.get("statut");

  const result = await db.execute(
    sql`SELECT d.id, d.client_nom as "clientNom", d.client_prenom as "clientPrenom",
        d.client_telephone as "clientTelephone", d.client_email as "clientEmail",
        d.description, d.date_souhaitee as "dateSouhaitee",
        d.site_id as "siteId", d.statut, d.cree_le as "creeLe",
        s.nom as "siteNom"
      FROM demandes_depot d
      LEFT JOIN sites s ON d.site_id = s.id
      ${statut ? sql`WHERE d.statut = ${statut}` : sql``}
      ORDER BY d.cree_le DESC`
  );

  return NextResponse.json({ demandes: result.rows });
}

// POST – Créer une demande (public)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientNom, clientPrenom, clientTelephone, clientEmail, description, dateSouhaitee, siteId } = body;

  if (!clientNom || !clientTelephone) {
    return NextResponse.json(
      { error: "Nom et téléphone requis." },
      { status: 400 }
    );
  }

  const [demande] = await db
    .insert(demandesDepot)
    .values({
      clientNom,
      clientPrenom: clientPrenom || null,
      clientTelephone,
      clientEmail: clientEmail || null,
      description: description || null,
      dateSouhaitee: dateSouhaitee ? new Date(dateSouhaitee) : null,
      siteId: siteId ? Number(siteId) : null,
      statut: "en_attente",
    })
    .returning();

  return NextResponse.json({ success: true, demande });
}