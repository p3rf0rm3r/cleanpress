import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q") || "";
  if (q.length < 2) {
    return NextResponse.json({ commandes: [] });
  }

  const results = await db.execute(
    sql`SELECT c.id, c.ticket, c.statut, c.date_depot as "dateDepot",
        c.montant_total as "montantTotal",
        cl.nom as "clientNom", cl.prenom as "clientPrenom",
        cl.telephone as "clientTelephone",
        (SELECT COALESCE(SUM(p.montant::numeric), 0) FROM paiements p WHERE p.commande_id = c.id) as "totalPaye"
      FROM commandes c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE cl.nom ILIKE ${"%" + q + "%"}
        OR cl.prenom ILIKE ${"%" + q + "%"}
        OR c.ticket ILIKE ${"%" + q + "%"}
      ORDER BY c.cree_le DESC
      LIMIT 20`
  );

  return NextResponse.json({ commandes: results.rows });
}