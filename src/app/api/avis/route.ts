import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { avis, commandes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ticket, note, commentaire } = body;

  if (!ticket || !note || note < 1 || note > 5) {
    return NextResponse.json(
      { error: "Ticket et note (1-5) requis." },
      { status: 400 }
    );
  }

  // Find commande
  const [cmd] = await db
    .select()
    .from(commandes)
    .where(eq(commandes.ticket, ticket.toUpperCase()))
    .limit(1);

  if (!cmd) {
    return NextResponse.json({ error: "Ticket non trouvé" }, { status: 404 });
  }

  if (cmd.statut !== "remise") {
    return NextResponse.json(
      { error: "Vous ne pouvez noter qu'après la remise." },
      { status: 400 }
    );
  }

  // Check not already rated
  const existing = await db
    .select()
    .from(avis)
    .where(eq(avis.commandeId, cmd.id))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Cette commande a déjà été notée." },
      { status: 400 }
    );
  }

  await db.insert(avis).values({
    commandeId: cmd.id,
    clientId: cmd.clientId,
    note: Number(note),
    commentaire: commentaire || null,
  });

  return NextResponse.json({ success: true });
}