import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { commandes, articles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { libelleStatut, logAction } from "@/lib/db-helpers";
import { sendSms } from "@/lib/sms";

const transitions: Record<string, string[]> = {
  deposee: ["en_traitement"],
  en_traitement: ["prete"],
  prete: ["remise"],
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { statut } = body;

  // Get current commande
  const [cmd] = await db
    .select()
    .from(commandes)
    .where(eq(commandes.id, Number(id)))
    .limit(1);

  if (!cmd) {
    return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
  }

  // Check valid transition
  const allowed = transitions[cmd.statut] || [];
  if (!allowed.includes(statut)) {
    return NextResponse.json(
      { error: `Transition non autorisée : ${libelleStatut(cmd.statut)} → ${libelleStatut(statut)}` },
      { status: 400 }
    );
  }

  // Check payment for remise
  if (statut === "remise") {
    const payResult = await db.execute(
      sql`SELECT COALESCE(SUM(montant::numeric), 0) as total FROM paiements WHERE commande_id = ${Number(id)}`
    );
    const totalPaye = Number((payResult.rows[0] as Record<string, unknown>).total);
    if (totalPaye < Number(cmd.montantTotal)) {
      return NextResponse.json(
        { error: "La commande doit être entièrement payée avant la remise." },
        { status: 400 }
      );
    }
  }

  // Update statut
  const updateData: Record<string, unknown> = { statut };
  if (statut === "remise") {
    updateData.dateRemise = new Date();
  }

  await db
    .update(commandes)
    .set(updateData)
    .where(eq(commandes.id, Number(id)));

  // Update articles statut too
  await db
    .update(articles)
    .set({ statut: statut as "deposee" | "en_traitement" | "prete" | "remise" })
    .where(eq(articles.commandeId, Number(id)));

  // If prete, send SMS
  if (statut === "prete") {
    const clientResult = await db.execute(
      sql`SELECT cl.telephone FROM clients cl 
          JOIN commandes c ON c.client_id = cl.id 
          WHERE c.id = ${Number(id)}`
    );
    if (clientResult.rows.length > 0) {
      const tel = (clientResult.rows[0] as Record<string, unknown>).telephone as string;
      await sendSms(tel, `CleanPress : Votre commande ${cmd.ticket} est prête. Venez la récupérer !`);
    }
  }

  await logAction(
    session.userId,
    "Changement de statut",
    `Ticket ${cmd.ticket} → ${libelleStatut(statut)}`
  );

  return NextResponse.json({ success: true });
}