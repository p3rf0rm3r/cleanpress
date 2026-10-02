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

  const result = await db.execute(
    sql`SELECT a.id, a.note, a.commentaire, a.cree_le as "creeLe",
        c.ticket, cl.nom as "clientNom", cl.prenom as "clientPrenom"
      FROM avis a
      JOIN commandes c ON a.commande_id = c.id
      JOIN clients cl ON a.client_id = cl.id
      ${siteId ? sql`WHERE c.site_id = ${Number(siteId)}` : sql``}
      ORDER BY a.cree_le DESC
      LIMIT 50`
  );

  return NextResponse.json({ avis: result.rows });
}