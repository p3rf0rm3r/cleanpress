"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/services", label: "Services" },
    { href: "/depot-en-ligne", label: "Déposer" },
  ];

  return (
    <nav className="navbar no-print">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <div className="navbar-logo-icon">✦</div>
          <div className="navbar-logo-text">
            Clean<span>Press</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`navbar-link ${pathname === l.href ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/suivi" className="navbar-btn">
            🔍 Suivre un ticket
          </Link>
          <Link href="/connexion" className="btn btn-outline btn-sm">
            Connexion
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#E4E8E4] px-4 py-4 flex flex-col gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`navbar-link ${pathname === l.href ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/suivi"
            className="navbar-btn text-center mt-2"
            onClick={() => setMobileOpen(false)}
          >
            🔍 Suivre un ticket
          </Link>
          <Link
            href="/connexion"
            className="btn btn-outline btn-sm text-center"
            onClick={() => setMobileOpen(false)}
          >
            Connexion
          </Link>
        </div>
      )}
    </nav>
  );
}