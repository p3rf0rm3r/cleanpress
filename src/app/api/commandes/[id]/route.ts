import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const result = await db.execute(
    sql`SELECT c.id, c.ticket, c.statut, c.date_depot as "dateDepot",
        c.date_retrait as "dateRetrait", c.date_remise as "dateRemise",
        c.montant_total as "montantTotal", c.site_id as "siteId",
        cl.id as "clientId", cl.nom as "clientNom", cl.prenom as "clientPrenom",
        cl.telephone as "clientTelephone", cl.email as "clientEmail",
        s.nom as "siteNom"
      FROM commandes c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN sites s ON c.site_id = s.id
      WHERE c.id = ${Number(id)}`
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
  }

  const commande = result.rows[0] as Record<string, unknown>;

  // Get articles
  const articlesResult = await db.execute(
    sql`SELECT a.id, a.description, a.quantite, a.prix_unitaire as "prixUnitaire",
        a.sous_total as "sousTotal", a.statut,
        sv.nom as "serviceNom"
      FROM articles a
      LEFT JOIN services sv ON a.service_id = sv.id
      WHERE a.commande_id = ${Number(id)}`
  );

  // Get paiements
  const paiementsResult = await db.execute(
    sql`SELECT p.id, p.mode, p.montant, p.reference, p.date_paiement as "datePaiement"
      FROM paiements p
      WHERE p.commande_id = ${Number(id)}`
  );

  // Get factures
  const facturesResult = await db.execute(
    sql`SELECT f.id, f.numero, f.montant, f.date_facture as "dateFacture"
      FROM factures f
      WHERE f.commande_id = ${Number(id)}`
  );

  return NextResponse.json({
    commande,
    articles: articlesResult.rows,
    paiements: paiementsResult.rows,
    factures: facturesResult.rows,
  });
}