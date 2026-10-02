import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { nom, prenom, telephone, email, adresse } = body;

  if (!nom || !telephone) {
    return NextResponse.json(
      { error: "Nom et téléphone requis." },
      { status: 400 }
    );
  }

  const [client] = await db
    .insert(clients)
    .values({ nom, prenom: prenom || null, telephone, email: email || null, adresse: adresse || null })
    .returning();

  return NextResponse.json({ success: true, client });
}