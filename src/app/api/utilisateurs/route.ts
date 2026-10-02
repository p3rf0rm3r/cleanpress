import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { utilisateurs } from "@/db/schema";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET – Liste des utilisateurs
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !["administrateur", "gerant"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const siteId = req.nextUrl.searchParams.get("siteId");

  const result = await db.execute(
    sql`SELECT u.id, u.nom, u.prenom, u.email, u.role, u.actif,
        u.site_id as "siteId", s.nom as "siteNom"
      FROM utilisateurs u
      LEFT JOIN sites s ON u.site_id = s.id
      ${siteId ? sql`WHERE u.site_id = ${Number(siteId)}` : sql``}
      ${session.role === "gerant" && session.siteId ? sql`WHERE u.site_id = ${session.siteId}` : sql``}
      ORDER BY u.nom`
  );

  return NextResponse.json({ utilisateurs: result.rows });
}

// POST – Créer un utilisateur (admin/gérant)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["administrateur", "gerant"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { nom, prenom, email, motDePasse, role, siteId } = body;

  if (!nom || !prenom || !email || !motDePasse || !role) {
    return NextResponse.json(
      { error: "Tous les champs sont requis." },
      { status: 400 }
    );
  }

  // Gérant can't create admins
  if (session.role === "gerant" && role === "administrateur") {
    return NextResponse.json(
      { error: "Vous ne pouvez pas créer un administrateur." },
      { status: 403 }
    );
  }

  const hash = await bcrypt.hash(motDePasse, 10);

  const [user] = await db
    .insert(utilisateurs)
    .values({
      nom,
      prenom,
      email,
      motDePasse: hash,
      role: role as "administrateur" | "gerant" | "receptionniste" | "agent",
      siteId: siteId ? Number(siteId) : session.siteId,
    })
    .returning();

  return NextResponse.json({
    success: true,
    user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role },
  });
}