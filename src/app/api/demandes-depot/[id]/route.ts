import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { demandesDepot } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !["receptionniste", "gerant", "administrateur"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { statut } = body;

  if (!["confirmee", "rejetee"].includes(statut)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  await db
    .update(demandesDepot)
    .set({ statut: statut as "confirmee" | "rejetee" })
    .where(eq(demandesDepot.id, Number(id)));

  return NextResponse.json({ success: true });
}