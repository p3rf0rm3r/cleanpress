import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { utilisateurs } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { logAction } from "@/lib/db-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, motDePasse } = body;

    if (!email || !motDePasse) {
      return NextResponse.json(
        { error: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(utilisateurs)
      .where(eq(utilisateurs.email, email))
      .limit(1);

    if (!user || user.actif !== 1) {
      return NextResponse.json(
        { error: "Identifiants incorrects." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!valid) {
      return NextResponse.json(
        { error: "Identifiants incorrects." },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.id,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      siteId: user.siteId,
    });

    await logAction(user.id, "Connexion", `${user.prenom} ${user.nom}`);

    // Redirect based on role
    const redirectMap: Record<string, string> = {
      administrateur: "/admin",
      gerant: "/gerant",
      receptionniste: "/reception",
      agent: "/agent",
    };

    return NextResponse.json({
      success: true,
      redirect: redirectMap[user.role] || "/",
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        siteId: user.siteId,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}