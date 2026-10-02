import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { paiements, commandes, factures } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { generateFactureNumero, logAction, libelleModePaiement } from "@/lib/db-helpers";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["receptionniste", "gerant", "administrateur"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { commandeId, mode, montant, reference } = body;

  if (!commandeId || !mode || !montant) {
    return NextResponse.json(
      { error: "Commande, mode et montant requis." },
      { status: 400 }
    );
  }

  // Get commande
  const [cmd] = await db
    .select()
    .from(commandes)
    .where(eq(commandes.id, Number(commandeId)))
    .limit(1);

  if (!cmd) {
    return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
  }

  // Check not overpaying
  const paidResult = await db.execute(
    sql`SELECT COALESCE(SUM(montant::numeric), 0) as total FROM paiements WHERE commande_id = ${Number(commandeId)}`
  );
  const alreadyPaid = Number((paidResult.rows[0] as Record<string, unknown>).total);
  const remaining = Number(cmd.montantTotal) - alreadyPaid;

  if (Number(montant) > remaining) {
    return NextResponse.json(
      { error: `Montant supérieur au reste à payer (${remaining} FCFA).` },
      { status: 400 }
    );
  }

  // Create payment
  const [paiement] = await db
    .insert(paiements)
    .values({
      commandeId: Number(commandeId),
      mode: mode as "especes" | "mobile_money",
      montant: String(montant),
      reference: reference || null,
      recuParId: session.userId,
    })
    .returning();

  // Generate invoice
  const numeroFacture = await generateFactureNumero();
  const [facture] = await db
    .insert(factures)
    .values({
      numero: numeroFacture,
      paiementId: paiement.id,
      commandeId: Number(commandeId),
      montant: String(montant),
    })
    .returning();

  await logAction(
    session.userId,
    "Encaissement",
    `Ticket ${cmd.ticket} – ${montant} FCFA – ${libelleModePaiement(mode)}`
  );

  return NextResponse.json({
    success: true,
    paiement,
    facture,
    resteApayer: remaining - Number(montant),
  });
}