import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticket: string }> }
) {
  const { ticket } = await params;

  const result = await db.execute(
    sql`SELECT c.id, c.ticket, c.statut, c.date_depot as "dateDepot",
        c.date_retrait as "dateRetrait", c.date_remise as "dateRemise",
        c.montant_total as "montantTotal",
        cl.nom as "clientNom", cl.prenom as "clientPrenom",
        (SELECT COALESCE(SUM(p.montant::numeric), 0) FROM paiements p WHERE p.commande_id = c.id) as "totalPaye"
      FROM commandes c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.ticket = ${ticket.toUpperCase()}`
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Ticket non trouvé" }, { status: 404 });
  }

  const commande = result.rows[0] as Record<string, unknown>;

  // Get articles
  const articlesResult = await db.execute(
    sql`SELECT a.description, a.quantite, sv.nom as "serviceNom"
      FROM articles a
      LEFT JOIN services sv ON a.service_id = sv.id
      WHERE a.commande_id = ${(commande as Record<string, unknown>).id}`
  );

  // Get avis
  const avisResult = await db.execute(
    sql`SELECT note, commentaire FROM avis WHERE commande_id = ${(commande as Record<string, unknown>).id}`
  );

  return NextResponse.json({
    commande,
    articles: articlesResult.rows,
    avis: avisResult.rows.length > 0 ? avisResult.rows[0] : null,
  });
}