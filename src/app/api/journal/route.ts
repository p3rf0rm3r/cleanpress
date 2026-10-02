import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !["administrateur", "gerant"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit") || 50);

  const result = await db.execute(
    sql`SELECT j.id, j.action, j.details, j.date_action as "dateAction",
        u.nom as "utilisateurNom", u.prenom as "utilisateurPrenom", u.role as "utilisateurRole"
      FROM journal j
      LEFT JOIN utilisateurs u ON j.utilisateur_id = u.id
      ORDER BY j.date_action DESC
      LIMIT ${limit}`
  );

  return NextResponse.json({ journal: result.rows });
}