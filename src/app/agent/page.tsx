"use client";

import { useEffect, useState, useCallback } from "react";

interface ArticleTraitement {
  articleId: number;
  description: string;
  quantite: number;
  serviceNom: string;
  commandeId: number;
  ticket: string;
  dateRetrait: string;
  clientNom: string;
  clientPrenom: string;
  statut: string;
}

const statutLabels: Record<string, string> = {
  deposee: "Déposée",
  en_traitement: "En traitement",
  prete: "Prête",
  remise: "Remise",
};

const nextStatut: Record<string, string> = {
  deposee: "en_traitement",
  en_traitement: "prete",
};

export default function AgentPage() {
  const [articles, setArticles] = useState<ArticleTraitement[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all commandes with status deposee or en_traitement
      const res = await fetch("/api/commandes?statut=tous");
      const data = await res.json();
      const cmdes = data.commandes || [];

      // Filter relevant commandes
      const relevant = cmdes.filter(
        (c: Record<string, unknown>) =>
          c.statut === "deposee" || c.statut === "en_traitement"
      );

      // Fetch articles for each commande
      const allArticles: ArticleTraitement[] = [];
      for (const cmd of relevant) {
        const artRes = await fetch(`/api/commandes/${cmd.id}`);
        const artData = await artRes.json();
        for (const art of artData.articles || []) {
          allArticles.push({
            articleId: art.id,
            description: art.description,
            quantite: art.quantite,
            serviceNom: art.serviceNom,
            commandeId: Number(cmd.id),
            ticket: cmd.ticket,
            dateRetrait: cmd.dateRetrait,
            clientNom: cmd.clientNom,
            clientPrenom: cmd.clientPrenom,
            statut: art.statut,
          });
        }
      }

      // Sort by date retrait
      allArticles.sort(
        (a, b) =>
          new Date(a.dateRetrait).getTime() - new Date(b.dateRetrait).getTime()
      );

      setArticles(allArticles);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleAdvance = async (commandeId: number, currentStatut: string) => {
    const next = nextStatut[currentStatut];
    if (!next) return;

    setUpdating(commandeId);
    try {
      const res = await fetch(`/api/commandes/${commandeId}/statut`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: next }),
      });

      if (res.ok) {
        fetchArticles();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch {
      alert("Erreur réseau.");
    } finally {
      setUpdating(null);
    }
  };

  const isUrgent = (dateRetrait: string) => {
    const d = new Date(dateRetrait);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    return diff < 24 * 60 * 60 * 1000; // less than 24h
  };

  return (
    <>
      <div className="main-header">
        <div>
          <h1 className="page-title">Traitement des articles</h1>
          <p className="page-subtitle">
            Articles triés par date de retrait — mettez à jour leur statut
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchArticles}>
          🔄 Actualiser
        </button>
      </div>

      <div className="main-body">
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔧</div>
            <h3>Tout est à jour !</h3>
            <p>Aucun article en attente de traitement.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Description</th>
                  <th>Qté</th>
                  <th>Date retrait</th>
                  <th>Statut article</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((art) => (
                  <tr
                    key={art.articleId}
                    style={{
                      background: isUrgent(art.dateRetrait)
                        ? "rgba(231, 76, 60, 0.05)"
                        : undefined,
                    }}
                  >
                    <td>
                      <span className="ticket-number" style={{ fontSize: "0.8125rem" }}>
                        {art.ticket}
                      </span>
                    </td>
                    <td>
                      {art.clientPrenom} {art.clientNom}
                    </td>
                    <td style={{ fontWeight: 600 }}>{art.serviceNom}</td>
                    <td style={{ color: "var(--secondaire)" }}>
                      {art.description || "—"}
                    </td>
                    <td style={{ textAlign: "center" }}>{art.quantite}</td>
                    <td>
                      <span
                        style={{
                          color: isUrgent(art.dateRetrait)
                            ? "var(--rouge)"
                            : "var(--texte)",
                          fontWeight: isUrgent(art.dateRetrait) ? 700 : 400,
                        }}
                      >
                        {new Date(art.dateRetrait).toLocaleDateString("fr-FR")}
                        {isUrgent(art.dateRetrait) && " ⚠"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${art.statut}`}>
                        {statutLabels[art.statut]}
                      </span>
                    </td>
                    <td>
                      {nextStatut[art.statut] && (
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={updating === art.commandeId}
                          onClick={() =>
                            handleAdvance(art.commandeId, art.statut)
                          }
                        >
                          {updating === art.commandeId
                            ? "..."
                            : art.statut === "deposee"
                              ? "→ En traitement"
                              : "→ Prête"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}