"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

interface User {
  userId: number;
  nom: string;
  prenom: string;
  role: string;
  siteId: number | null;
}

export default function AppLayout({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data) => {
        if (!data.user || !allowedRoles.includes(data.user.role)) {
          router.push("/connexion");
          return;
        }
        setUser(data.user);
      })
      .catch(() => {
        router.push("/connexion");
      })
      .finally(() => setLoading(false));
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--fond)",
        }}
      >
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="app-layout">
      <Sidebar user={user} />
      <main className="main-content">
        <div style={{ paddingTop: "0" }}>{children}</div>
      </main>
    </div>
  );
}