// ============================================================
// CleanPress – Seed : données de test
// ============================================================
import { db } from "@/db";
import {
  sites,
  utilisateurs,
  clients,
  services,
  commandes,
  articles,
  paiements,
  factures,
  avis,
  journal,
} from "@/db/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function seed(): Promise<string> {
  // Ensure sequences
  await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1`);
  await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS facture_seq START 1`);

  // Check if already seeded
  const existing = await db.execute(sql`SELECT COUNT(*) as cnt FROM sites`);
  if (Number((existing.rows[0] as Record<string, unknown>).cnt) > 0) {
    return "Base déjà initialisée.";
  }

  // ─── Sites ──────────────────────────────────────────
  const [site1] = await db
    .insert(sites)
    .values({
      nom: "CleanPress Akpakpa",
      adresse: "123 Rue des Artisans, Akpakpa, Cotonou",
      telephone: "+229 97 00 00 01",
    })
    .returning();

  const [site2] = await db
    .insert(sites)
    .values({
      nom: "CleanPress Calavi",
      adresse: "45 Avenue de la Paix, Calavi",
      telephone: "+229 97 00 00 02",
    })
    .returning();

  // ─── Utilisateurs (mots de passe : "password123") ───
  const hash = await bcrypt.hash("password123", 10);

  const [admin] = await db
    .insert(utilisateurs)
    .values({
      nom: "Dossou",
      prenom: "Admin",
      email: "admin@cleanpress.bj",
      motDePasse: hash,
      role: "administrateur",
      siteId: null,
    })
    .returning();

  const [gerant1] = await db
    .insert(utilisateurs)
    .values({
      nom: "Agbessi",
      prenom: "Marie",
      email: "marie@cleanpress.bj",
      motDePasse: hash,
      role: "gerant",
      siteId: site1.id,
    })
    .returning();

  const [recep1] = await db
    .insert(utilisateurs)
    .values({
      nom: "Koudjo",
      prenom: "Sophie",
      email: "sophie@cleanpress.bj",
      motDePasse: hash,
      role: "receptionniste",
      siteId: site1.id,
    })
    .returning();

  const [agent1] = await db
    .insert(utilisateurs)
    .values({
      nom: "Tossou",
      prenom: "Paul",
      email: "paul@cleanpress.bj",
      motDePasse: hash,
      role: "agent",
      siteId: site1.id,
    })
    .returning();

  // ─── Clients ────────────────────────────────────────
  const [client1] = await db
    .insert(clients)
    .values({
      nom: "Hounkpatin",
      prenom: "Jean",
      telephone: "+229 96 11 22 33",
      email: "jean@gmail.com",
      adresse: "Cotonou, Akpakpa",
    })
    .returning();

  const [client2] = await db
    .insert(clients)
    .values({
      nom: "Adjovi",
      prenom: "Fatima",
      telephone: "+229 97 44 55 66",
      email: "fatima@gmail.com",
    })
    .returning();

  const [client3] = await db
    .insert(clients)
    .values({
      nom: "Gbegan",
      prenom: "Kofi",
      telephone: "+229 94 77 88 99",
    })
    .returning();

  // ─── Services ───────────────────────────────────────
  const [svc1] = await db
    .insert(services)
    .values({
      nom: "Nettoyage à sec – Costume",
      description: "Nettoyage à sec complet d'un costume (veste + pantalon)",
      tarifUnitaire: "3500",
      siteId: site1.id,
    })
    .returning();

  const [svc2] = await db
    .insert(services)
    .values({
      nom: "Lavage – Chemise",
      description: "Lavage, repassage et pliage d'une chemise",
      tarifUnitaire: "1500",
      siteId: site1.id,
    })
    .returning();

  const [svc3] = await db
    .insert(services)
    .values({
      nom: "Repassage – Robe",
      description: "Repassage vapeur d'une robe",
      tarifUnitaire: "2000",
      siteId: site1.id,
    })
    .returning();

  const [svc4] = await db
    .insert(services)
    .values({
      nom: "Lavage – Draps",
      description: "Lavage complet d'un jeu de draps",
      tarifUnitaire: "2500",
      siteId: site1.id,
    })
    .returning();

  const [svc5] = await db
    .insert(services)
    .values({
      nom: "Nettoyage à sec – Manteau",
      description: "Nettoyage à sec d'un manteau",
      tarifUnitaire: "4000",
      siteId: site1.id,
    })
    .returning();

  // ─── Commandes ──────────────────────────────────────
  const ticket1 = "CP-2026-000001";
  const ticket2 = "CP-2026-000002";
  const ticket3 = "CP-2026-000003";
  const ticket4 = "CP-2026-000004";

  const [cmd1] = await db
    .insert(commandes)
    .values({
      ticket: ticket1,
      clientId: client1.id,
      siteId: site1.id,
      statut: "remise",
      dateDepot: new Date("2026-01-10T09:00:00Z"),
      dateRetrait: new Date("2026-01-13T09:00:00Z"),
      dateRemise: new Date("2026-01-13T14:00:00Z"),
      montantTotal: "7000",
      creeParId: recep1.id,
    })
    .returning();

  const [cmd2] = await db
    .insert(commandes)
    .values({
      ticket: ticket2,
      clientId: client2.id,
      siteId: site1.id,
      statut: "prete",
      dateDepot: new Date("2026-01-12T10:30:00Z"),
      dateRetrait: new Date("2026-01-15T10:30:00Z"),
      montantTotal: "4500",
      creeParId: recep1.id,
    })
    .returning();

  const [cmd3] = await db
    .insert(commandes)
    .values({
      ticket: ticket3,
      clientId: client1.id,
      siteId: site1.id,
      statut: "en_traitement",
      dateDepot: new Date("2026-01-14T08:15:00Z"),
      dateRetrait: new Date("2026-01-17T08:15:00Z"),
      montantTotal: "5500",
      creeParId: recep1.id,
    })
    .returning();

  const [cmd4] = await db
    .insert(commandes)
    .values({
      ticket: ticket4,
      clientId: client3.id,
      siteId: site1.id,
      statut: "deposee",
      dateDepot: new Date(),
      dateRetrait: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      montantTotal: "6000",
      creeParId: recep1.id,
    })
    .returning();

  // ─── Articles ───────────────────────────────────────
  await db.insert(articles).values([
    {
      commandeId: cmd1.id,
      serviceId: svc1.id,
      description: "Costume noir",
      quantite: 2,
      prixUnitaire: "3500",
      sousTotal: "7000",
      statut: "remise",
    },
    {
      commandeId: cmd2.id,
      serviceId: svc2.id,
      description: "Chemise blanche",
      quantite: 3,
      prixUnitaire: "1500",
      sousTotal: "4500",
      statut: "prete",
    },
    {
      commandeId: cmd3.id,
      serviceId: svc3.id,
      description: "Robe longue",
      quantite: 1,
      prixUnitaire: "2000",
      sousTotal: "2000",
      statut: "en_traitement",
    },
    {
      commandeId: cmd3.id,
      serviceId: svc4.id,
      description: "Draps blancs",
      quantite: 1,
      prixUnitaire: "2500",
      sousTotal: "2500",
      statut: "en_traitement",
    },
    {
      commandeId: cmd3.id,
      serviceId: svc2.id,
      description: "Chemise bleue",
      quantite: 2,
      prixUnitaire: "1500",
      sousTotal: "3000",
      statut: "deposee",
    },
    {
      commandeId: cmd4.id,
      serviceId: svc5.id,
      description: "Manteau en laine",
      quantite: 1,
      prixUnitaire: "4000",
      sousTotal: "4000",
      statut: "deposee",
    },
    {
      commandeId: cmd4.id,
      serviceId: svc2.id,
      description: "Chemise à carreaux",
      quantite: 2,
      prixUnitaire: "1500",
      sousTotal: "3000",
      statut: "deposee",
    },
  ]);

  // Correction montant cmd3
  await db
    .update(commandes)
    .set({ montantTotal: "7500" })
    .where(sql`id = ${cmd3.id}`);

  // Correction montant cmd4
  await db
    .update(commandes)
    .set({ montantTotal: "7000" })
    .where(sql`id = ${cmd4.id}`);

  // ─── Paiements ──────────────────────────────────────
  const [pay1] = await db
    .insert(paiements)
    .values({
      commandeId: cmd1.id,
      mode: "especes",
      montant: "7000",
      recuParId: recep1.id,
    })
    .returning();

  const [pay2] = await db
    .insert(paiements)
    .values({
      commandeId: cmd2.id,
      mode: "mobile_money",
      montant: "4500",
      reference: "MM-20260112-001",
      recuParId: recep1.id,
    })
    .returning();

  // ─── Factures ───────────────────────────────────────
  await db.insert(factures).values([
    {
      numero: "FAC-2026-000001",
      paiementId: pay1.id,
      commandeId: cmd1.id,
      montant: "7000",
    },
    {
      numero: "FAC-2026-000002",
      paiementId: pay2.id,
      commandeId: cmd2.id,
      montant: "4500",
    },
  ]);

  // ─── Avis ───────────────────────────────────────────
  await db.insert(avis).values([
    {
      commandeId: cmd1.id,
      clientId: client1.id,
      note: 5,
      commentaire: "Excellent service, costume impeccable !",
    },
    {
      commandeId: cmd2.id,
      clientId: client2.id,
      note: 4,
      commentaire: "Très bien, je recommande.",
    },
  ]);

  // ─── Journal ────────────────────────────────────────
  await db.insert(journal).values([
    {
      utilisateurId: recep1.id,
      action: "Création de commande",
      details: `Ticket ${ticket1}`,
    },
    {
      utilisateurId: recep1.id,
      action: "Création de commande",
      details: `Ticket ${ticket2}`,
    },
    {
      utilisateurId: agent1.id,
      action: "Changement de statut",
      details: `Ticket ${ticket1} → En traitement`,
    },
    {
      utilisateurId: agent1.id,
      action: "Changement de statut",
      details: `Ticket ${ticket1} → Prête`,
    },
    {
      utilisateurId: recep1.id,
      action: "Encaissement",
      details: `Ticket ${ticket1} – 7000 FCFA – Espèces`,
    },
    {
      utilisateurId: recep1.id,
      action: "Remise",
      details: `Ticket ${ticket1}`,
    },
  ]);

  return "✅ Données de test insérées avec succès.";
}