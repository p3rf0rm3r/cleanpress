// ============================================================
// CleanPress – Helpers base de données
// ============================================================
import { db } from "@/db";
import { sql } from "drizzle-orm";

/** Génère un numéro de ticket unique : CP-2026-000123 */
export async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const result = await db.execute(
    sql`SELECT nextval('ticket_seq') as seq`
  );
  const seq = Number((result.rows[0] as Record<string, unknown>).seq);
  return `CP-${year}-${String(seq).padStart(6, "0")}`;
}

/** Génère un numéro de facture séquentiel sans trou : FAC-2026-000001 */
export async function generateFactureNumero(): Promise<string> {
  const year = new Date().getFullYear();
  const result = await db.execute(
    sql`SELECT nextval('facture_seq') as seq`
  );
  const seq = Number((result.rows[0] as Record<string, unknown>).seq);
  return `FAC-${year}-${String(seq).padStart(6, "0")}`;
}

/** Crée les séquences SQL si elles n'existent pas */
export async function ensureSequences(): Promise<void> {
  await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1`);
  await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS facture_seq START 1`);
}

/** Formater un montant en FCFA */
export function formatMontant(montant: number | string): string {
  const num = typeof montant === "string" ? parseFloat(montant) : montant;
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + " FCFA";
}

/** Formater une date en français */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Libellé des statuts */
export function libelleStatut(statut: string): string {
  const map: Record<string, string> = {
    deposee: "Déposée",
    en_traitement: "En traitement",
    prete: "Prête",
    remise: "Remise",
  };
  return map[statut] || statut;
}

/** Libellé des modes de paiement */
export function libelleModePaiement(mode: string): string {
  const map: Record<string, string> = {
    especes: "Espèces",
    mobile_money: "Mobile Money",
  };
  return map[mode] || mode;
}

/** Libellé des rôles */
export function libelleRole(role: string): string {
  const map: Record<string, string> = {
    administrateur: "Administrateur",
    gerant: "Gérant",
    receptionniste: "Réceptionniste",
    agent: "Agent de traitement",
  };
  return map[role] || role;
}

/** Enregistrer une action dans le journal */
export async function logAction(
  utilisateurId: number | null,
  action: string,
  details?: string
): Promise<void> {
  const { journal } = await import("@/db/schema");
  await db.insert(journal).values({
    utilisateurId,
    action,
    details: details || null,
  });
}