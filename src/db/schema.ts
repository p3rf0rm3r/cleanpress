// ============================================================
// CleanPress – Schéma de base de données (Drizzle ORM / PostgreSQL)
// ============================================================
import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  decimal,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────
export const roleEnum = pgEnum("role", [
  "administrateur",
  "gerant",
  "receptionniste",
  "agent",
]);

export const statutCommandeEnum = pgEnum("statut_commande", [
  "deposee",
  "en_traitement",
  "prete",
  "remise",
]);

export const modePaiementEnum = pgEnum("mode_paiement", [
  "especes",
  "mobile_money",
]);

export const statutDemandeEnum = pgEnum("statut_demande", [
  "en_attente",
  "confirmee",
  "rejetee",
]);

// ─── Sites ───────────────────────────────────────────────────
export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 150 }).notNull(),
  adresse: text("adresse"),
  telephone: varchar("telephone", { length: 30 }),
  actif: integer("actif").notNull().default(1), // 1 = actif, 0 = inactif
  creeLe: timestamp("cree_le", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Utilisateurs ────────────────────────────────────────────
export const utilisateurs = pgTable(
  "utilisateurs",
  {
    id: serial("id").primaryKey(),
    nom: varchar("nom", { length: 120 }).notNull(),
    prenom: varchar("prenom", { length: 120 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    motDePasse: varchar("mot_de_passe", { length: 255 }).notNull(),
    role: roleEnum("role").notNull(),
    siteId: integer("site_id").references(() => sites.id, {
      onDelete: "set null",
    }),
    actif: integer("actif").notNull().default(1),
    creeLe: timestamp("cree_le", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("utilisateurs_email_idx").on(t.email)]
);

// ─── Clients ─────────────────────────────────────────────────
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 120 }).notNull(),
  prenom: varchar("prenom", { length: 120 }),
  telephone: varchar("telephone", { length: 30 }).notNull(),
  email: varchar("email", { length: 200 }),
  adresse: text("adresse"),
  creeLe: timestamp("cree_le", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Services (grille tarifaire) ─────────────────────────────
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 150 }).notNull(),
  description: text("description"),
  tarifUnitaire: decimal("tarif_unitaire", {
    precision: 10,
    scale: 2,
  }).notNull(),
  siteId: integer("site_id").references(() => sites.id, {
    onDelete: "cascade",
  }),
  actif: integer("actif").notNull().default(1),
  creeLe: timestamp("cree_le", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Commandes ───────────────────────────────────────────────
export const commandes = pgTable(
  "commandes",
  {
    id: serial("id").primaryKey(),
    ticket: varchar("ticket", { length: 30 }).notNull(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id),
    siteId: integer("site_id")
      .notNull()
      .references(() => sites.id),
    statut: statutCommandeEnum("statut").notNull().default("deposee"),
    dateDepot: timestamp("date_depot", { withTimezone: true })
      .notNull()
      .defaultNow(),
    dateRetrait: timestamp("date_retrait", { withTimezone: true }),
    dateRemise: timestamp("date_remise", { withTimezone: true }),
    montantTotal: decimal("montant_total", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0.00"),
    creeParId: integer("cree_par_id").references(() => utilisateurs.id),
    creeLe: timestamp("cree_le", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("commandes_ticket_idx").on(t.ticket)]
);

// ─── Articles (lignes de commande) ───────────────────────────
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  commandeId: integer("commande_id")
    .notNull()
    .references(() => commandes.id, { onDelete: "cascade" }),
  serviceId: integer("service_id")
    .notNull()
    .references(() => services.id),
  description: varchar("description", { length: 255 }),
  quantite: integer("quantite").notNull().default(1),
  prixUnitaire: decimal("prix_unitaire", {
    precision: 10,
    scale: 2,
  }).notNull(),
  sousTotal: decimal("sous_total", { precision: 10, scale: 2 }).notNull(),
  statut: statutCommandeEnum("statut").notNull().default("deposee"),
});

// ─── Paiements ───────────────────────────────────────────────
export const paiements = pgTable("paiements", {
  id: serial("id").primaryKey(),
  commandeId: integer("commande_id")
    .notNull()
    .references(() => commandes.id),
  mode: modePaiementEnum("mode").notNull(),
  montant: decimal("montant", { precision: 10, scale: 2 }).notNull(),
  reference: varchar("reference", { length: 100 }),
  datePaiement: timestamp("date_paiement", { withTimezone: true })
    .notNull()
    .defaultNow(),
  recuParId: integer("recu_par_id").references(() => utilisateurs.id),
});

// ─── Factures ────────────────────────────────────────────────
export const factures = pgTable(
  "factures",
  {
    id: serial("id").primaryKey(),
    numero: varchar("numero", { length: 30 }).notNull(),
    paiementId: integer("paiement_id")
      .notNull()
      .references(() => paiements.id),
    commandeId: integer("commande_id")
      .notNull()
      .references(() => commandes.id),
    montant: decimal("montant", {
      precision: 10,
      scale: 2,
    }).notNull(),
    dateFacture: timestamp("date_facture", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("factures_numero_idx").on(t.numero)]
);

// ─── Demandes de dépôt en ligne ──────────────────────────────
export const demandesDepot = pgTable("demandes_depot", {
  id: serial("id").primaryKey(),
  clientNom: varchar("client_nom", { length: 120 }).notNull(),
  clientPrenom: varchar("client_prenom", { length: 120 }),
  clientTelephone: varchar("client_telephone", { length: 30 }).notNull(),
  clientEmail: varchar("client_email", { length: 200 }),
  description: text("description"),
  dateSouhaitee: timestamp("date_souhaitee", { withTimezone: true }),
  siteId: integer("site_id").references(() => sites.id),
  statut: statutDemandeEnum("statut").notNull().default("en_attente"),
  creeLe: timestamp("cree_le", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Avis ────────────────────────────────────────────────────
export const avis = pgTable("avis", {
  id: serial("id").primaryKey(),
  commandeId: integer("commande_id")
    .notNull()
    .references(() => commandes.id),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  note: integer("note").notNull(), // 1–5
  commentaire: text("commentaire"),
  creeLe: timestamp("cree_le", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── SMS log ─────────────────────────────────────────────────
export const smsLog = pgTable("sms_log", {
  id: serial("id").primaryKey(),
  numero: varchar("numero", { length: 30 }).notNull(),
  message: text("message").notNull(),
  statut: varchar("statut", { length: 20 }).notNull().default("envoye"),
  envoyeLe: timestamp("envoye_le", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Journal d'actions (audit log) ───────────────────────────
export const journal = pgTable("journal", {
  id: serial("id").primaryKey(),
  utilisateurId: integer("utilisateur_id").references(
    () => utilisateurs.id
  ),
  action: varchar("action", { length: 255 }).notNull(),
  details: text("details"),
  dateAction: timestamp("date_action", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ═══ Relations ═══════════════════════════════════════════════

export const sitesRelations = relations(sites, ({ many }) => ({
  utilisateurs: many(utilisateurs),
  services: many(services),
  commandes: many(commandes),
}));

export const utilisateursRelations = relations(utilisateurs, ({ one }) => ({
  site: one(sites, {
    fields: [utilisateurs.siteId],
    references: [sites.id],
  }),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  commandes: many(commandes),
  avis: many(avis),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  site: one(sites, { fields: [services.siteId], references: [sites.id] }),
  articles: many(articles),
}));

export const commandesRelations = relations(commandes, ({ one, many }) => ({
  client: one(clients, {
    fields: [commandes.clientId],
    references: [clients.id],
  }),
  site: one(sites, { fields: [commandes.siteId], references: [sites.id] }),
  articles: many(articles),
  paiements: many(paiements),
  factures: many(factures),
  avis: many(avis),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  commande: one(commandes, {
    fields: [articles.commandeId],
    references: [commandes.id],
  }),
  service: one(services, {
    fields: [articles.serviceId],
    references: [services.id],
  }),
}));

export const paiementsRelations = relations(paiements, ({ one, many }) => ({
  commande: one(commandes, {
    fields: [paiements.commandeId],
    references: [commandes.id],
  }),
  factures: many(factures),
}));

export const facturesRelations = relations(factures, ({ one }) => ({
  paiement: one(paiements, {
    fields: [factures.paiementId],
    references: [paiements.id],
  }),
  commande: one(commandes, {
    fields: [factures.commandeId],
    references: [commandes.id],
  }),
}));

export const avisRelations = relations(avis, ({ one }) => ({
  commande: one(commandes, {
    fields: [avis.commandeId],
    references: [commandes.id],
  }),
  client: one(clients, {
    fields: [avis.clientId],
    references: [clients.id],
  }),
}));