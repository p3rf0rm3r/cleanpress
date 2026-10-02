"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  user: {
    nom: string;
    prenom: string;
    role: string;
    siteId: number | null;
  };
}

interface NavLink {
  href: string;
  label: string;
  icon: string;
}

const roleMenus: Record<string, NavLink[]> = {
  administrateur: [
    { href: "/admin", label: "Tableau de bord", icon: "📊" },
    { href: "/admin/sites", label: "Sites", icon: "🏢" },
    { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "👥" },
    { href: "/admin/journal", label: "Journal d'actions", icon: "📋" },
  ],
  gerant: [
    { href: "/gerant", label: "Tableau de bord", icon: "📊" },
    { href: "/gerant/commandes", label: "Commandes", icon: "📦" },
    { href: "/gerant/services", label: "Grille tarifaire", icon: "💰" },
    { href: "/gerant/utilisateurs", label: "Comptes & droits", icon: "👥" },
    { href: "/gerant/avis", label: "Avis clients", icon: "⭐" },
    { href: "/gerant/journal", label: "Journal", icon: "📋" },
  ],
  receptionniste: [
    { href: "/reception", label: "Accueil", icon: "🏠" },
    { href: "/reception/nouveau-depot", label: "Nouveau dépôt", icon: "➕" },
    { href: "/reception/recherche", label: "Recherche", icon: "🔍" },
    { href: "/reception/demandes", label: "Demandes en ligne", icon: "📨" },
  ],
  agent: [
    { href: "/agent", label: "Traitement", icon: "🔧" },
  ],
};

const roleLabels: Record<string, string> = {
  administrateur: "Administrateur",
  gerant: "Gérant",
  receptionniste: "Réceptionniste",
  agent: "Agent",
};

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = roleMenus[user.role] || [];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/connexion");
  };

  return (
    <>
      {/* Mobile toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E4E8E4] px-4 h-14 flex items-center justify-between">
        <button
          className="sidebar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
        <div style={{ fontWeight: 800, fontSize: "1.125rem" }}>
          Clean<span style={{ color: "var(--vert-accent)" }}>Press</span>
        </div>
        <div style={{ width: 30 }} />
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay open"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <Link href="/" className="sidebar-logo">
          <div className="sidebar-logo-icon">✦</div>
          <div className="sidebar-logo-text">
            Clean<span>Press</span>
          </div>
        </Link>

        <nav className="sidebar-nav">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== `/${user.role}` &&
                link.href !== "/reception" &&
                link.href !== "/agent" &&
                link.href !== "/admin" &&
                link.href !== "/gerant" &&
                pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="sidebar-link-icon">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user.prenom[0]}
              {user.nom[0]}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user.prenom} {user.nom}
              </div>
              <div className="sidebar-user-role">
                {roleLabels[user.role]}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              marginTop: "0.75rem",
              width: "100%",
              padding: "0.5rem",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "10px",
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.8125rem",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}