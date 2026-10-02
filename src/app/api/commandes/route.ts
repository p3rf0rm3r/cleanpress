import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { commandes, articles, clients } from "@/db/schema";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { generateTicketNumber, logAction } from "@/lib/db-helpers";

// GET – Liste des commandes (avec filtres)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const statut = req.nextUrl.searchParams.get("statut");
  const q = req.nextUrl.searchParams.get("q");
  const siteId = req.nextUrl.searchParams.get("siteId");

  const results = await db.execute(
    sql`SELECT c.id, c.ticket, c.statut, c.date_depot as "dateDepot", 
        c.date_retrait as "dateRetrait", c.date_remise as "dateRemise",
        c.montant_total as "montantTotal", c.site_id as "siteId",
        cl.nom as "clientNom", cl.prenom as "clientPrenom", 
        cl.telephone as "clientTelephone", cl.id as "clientId",
        s.nom as "siteNom",
        (SELECT COUNT(*) FROM paiements p WHERE p.commande_id = c.id) as "paye"
      FROM commandes c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN sites s ON c.site_id = s.id
      WHERE 1=1
        ${statut && statut !== "tous" ? sql`AND c.statut = ${statut}` : sql``}
        ${siteId ? sql`AND c.site_id = ${Number(siteId)}` : sql``}
        ${q ? sql`AND (cl.nom ILIKE ${"%" + q + "%"} OR cl.prenom ILIKE ${"%" + q + "%"} OR c.ticket ILIKE ${"%" + q + "%"})` : sql``}
      ORDER BY c.cree_le DESC
      LIMIT 100`
  );

  return NextResponse.json({ commandes: results.rows });
}

// POST – Créer une commande
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["receptionniste", "gerant", "administrateur"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, siteId, dateRetrait, articles: articlesData } = body;

  if (!clientId || !siteId || !articlesData || articlesData.length === 0) {
    return NextResponse.json(
      { error: "Client, site et articles requis." },
      { status: 400 }
    );
  }

  // Generate ticket
  const ticket = await generateTicketNumber();

  // Calculate total
  let montantTotal = 0;
  for (const art of articlesData) {
    montantTotal += art.prixUnitaire * art.quantite;
  }

  // Create commande
  const [commande] = await db
    .insert(commandes)
    .values({
      ticket,
      clientId: Number(clientId),
      siteId: Number(siteId),
      statut: "deposee",
      dateRetrait: dateRetrait ? new Date(dateRetrait) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      montantTotal: String(montantTotal),
      creeParId: session.userId,
    })
    .returning();

  // Create articles
  for (const art of articlesData) {
    await db.insert(articles).values({
      commandeId: commande.id,
      serviceId: Number(art.serviceId),
      description: art.description || null,
      quantite: Number(art.quantite),
      prixUnitaire: String(art.prixUnitaire),
      sousTotal: String(art.prixUnitaire * art.quantite),
      statut: "deposee",
    });
  }

  await logAction(session.userId, "Création de commande", `Ticket ${ticket}`);

  return NextResponse.json({ success: true, commande, ticket });
}