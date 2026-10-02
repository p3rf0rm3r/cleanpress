import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !["gerant", "administrateur"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const siteId = req.nextUrl.searchParams.get("siteId");
  const siteFilter = siteId ? Number(siteId) : session.siteId;

  // Stats globales
  const statsQuery = sql`
    SELECT 
      (SELECT COUNT(*) FROM commandes ${siteFilter ? sql`WHERE site_id = ${siteFilter}` : sql``}) as total_commandes,
      (SELECT COUNT(*) FROM commandes WHERE statut = 'deposee' ${siteFilter ? sql`AND site_id = ${siteFilter}` : sql``}) as deposees,
      (SELECT COUNT(*) FROM commandes WHERE statut = 'en_traitement' ${siteFilter ? sql`AND site_id = ${siteFilter}` : sql``}) as en_traitement,
      (SELECT COUNT(*) FROM commandes WHERE statut = 'prete' ${siteFilter ? sql`AND site_id = ${siteFilter}` : sql``}) as pretes,
      (SELECT COUNT(*) FROM commandes WHERE statut = 'remise' ${siteFilter ? sql`AND site_id = ${siteFilter}` : sql``}) as remises,
      (SELECT COALESCE(SUM(montant_total::numeric), 0) FROM commandes ${siteFilter ? sql`WHERE site_id = ${siteFilter}` : sql``}) as chiffre_affaires,
      (SELECT COALESCE(SUM(p.montant::numeric), 0) FROM paiements p JOIN commandes c ON p.commande_id = c.id ${siteFilter ? sql`WHERE c.site_id = ${siteFilter}` : sql``}) as total_encaisse,
      (SELECT COALESCE(SUM(c.montant_total::numeric), 0) FROM commandes c WHERE c.statut != 'remise' ${siteFilter ? sql`AND c.site_id = ${siteFilter}` : sql``}) -
      (SELECT COALESCE(SUM(p.montant::numeric), 0) FROM paiements p JOIN commandes c ON p.commande_id = c.id WHERE c.statut != 'remise' ${siteFilter ? sql`AND c.site_id = ${siteFilter}` : sql``}) as impayes
  `;

  const statsResult = await db.execute(statsQuery);
  const stats = statsResult.rows[0] as Record<string, unknown>;

  // Commandes récentes
  const recentResult = await db.execute(
    sql`SELECT c.id, c.ticket, c.statut, c.date_depot as "dateDepot",
        c.montant_total as "montantTotal",
        cl.nom as "clientNom", cl.prenom as "clientPrenom",
        (SELECT COALESCE(SUM(p.montant::numeric), 0) FROM paiements p WHERE p.commande_id = c.id) as "totalPaye"
      FROM commandes c
      LEFT JOIN clients cl ON c.client_id = cl.id
      ${siteFilter ? sql`WHERE c.site_id = ${siteFilter}` : sql``}
      ORDER BY c.cree_le DESC
      LIMIT 10`
  );

  // Notes moyennes
  const notesResult = await db.execute(
    sql`SELECT COALESCE(AVG(note::numeric), 0) as moyenne, COUNT(*) as total
      FROM avis a
      JOIN commandes c ON a.commande_id = c.id
      ${siteFilter ? sql`WHERE c.site_id = ${siteFilter}` : sql``}`
  );

  // CA par jour (7 derniers jours)
  const caJoursResult = await db.execute(
    sql`SELECT DATE(c.date_depot) as jour,
        COALESCE(SUM(p.montant::numeric), 0) as ca
      FROM commandes c
      LEFT JOIN paiements p ON p.commande_id = c.id
      WHERE c.date_depot >= NOW() - INTERVAL '7 days'
        ${siteFilter ? sql`AND c.site_id = ${siteFilter}` : sql``}
      GROUP BY DATE(c.date_depot)
      ORDER BY jour`
  );

  return NextResponse.json({
    stats: {
      totalCommandes: Number(stats.total_commandes),
      deposees: Number(stats.deposees),
      enTraitement: Number(stats.en_traitement),
      pretes: Number(stats.pretes),
      remises: Number(stats.remises),
      chiffreAffaires: Number(stats.chiffre_affaires),
      totalEncaisse: Number(stats.total_encaisse),
      impayes: Number(stats.impayes),
    },
    commandesRecentes: recentResult.rows,
    noteMoyenne: Number((notesResult.rows[0] as Record<string, unknown>)?.moyenne || 0),
    totalAvis: Number((notesResult.rows[0] as Record<string, unknown>)?.total || 0),
    caParJour: caJoursResult.rows,
  });
}