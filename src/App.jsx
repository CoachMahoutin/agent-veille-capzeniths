import { useState, useEffect } from "react";

// ── STYLES ──────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("czv-s")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.id = "czv-s";
  s.textContent = `
    .czv *{box-sizing:border-box;}
    .czv{font-family:'Outfit',sans-serif;background:#FAF8F5;min-height:100vh;color:#2D1B4E;}
    .czv-serif{font-family:'DM Serif Display',serif;}
    .czv-card{background:#fff;border-radius:18px;border:1px solid rgba(45,10,62,.08);box-shadow:0 1px 4px rgba(45,10,62,.06),0 6px 20px rgba(45,10,62,.04);}
    .czv-sel{appearance:none;width:100%;padding:11px 15px;border:1.5px solid rgba(45,10,62,.15);border-radius:10px;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23F5A623' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 14px center;color:#2D1B4E;font-family:'Outfit',sans-serif;font-size:14px;outline:none;cursor:pointer;transition:all .2s;}
    .czv-sel:focus{border-color:#F5A623;box-shadow:0 0 0 3px rgba(245,166,35,.12);}
    .czv-btn{background:#F5A623;color:#2D0A3E;border:none;border-radius:13px;padding:15px 32px;font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;width:100%;}
    .czv-btn:hover:not(:disabled){background:#E09A1A;box-shadow:0 4px 20px rgba(245,166,35,.35);transform:translateY(-1px);}
    .czv-btn:disabled{opacity:.38;cursor:not-allowed;}
    .czv-btn-sm{background:transparent;color:#7C6A8E;border:1px solid rgba(45,10,62,.15);border-radius:8px;padding:5px 12px;font-family:'Outfit',sans-serif;font-size:11px;font-weight:500;cursor:pointer;transition:all .15s;}
    .czv-btn-sm:hover{border-color:#F5A623;color:#F5A623;}
    .czv-type-opt{flex:1;padding:10px 8px;text-align:center;border-radius:11px;cursor:pointer;border:1.5px solid rgba(45,10,62,.12);background:#fff;font-family:'Outfit',sans-serif;font-size:12px;font-weight:500;color:#7C6A8E;transition:all .18s;user-select:none;}
    .czv-type-opt:hover{border-color:#F5A623;color:#F5A623;}
    .czv-type-opt.sel{border-color:#F5A623;background:#F5A623;color:#2D0A3E;font-weight:700;}
    @keyframes czvUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes czvSpin{to{transform:rotate(360deg)}}
    @keyframes czvPulse{0%,100%{opacity:.5}50%{opacity:1}}
    .czv-up{animation:czvUp .4s ease forwards;}
    .czv-up1{animation:czvUp .4s .1s ease both;}
    .czv-up2{animation:czvUp .4s .2s ease both;}
    .czv-up3{animation:czvUp .4s .3s ease both;}
    .czv-up4{animation:czvUp .4s .4s ease both;}
  `;
  document.head.appendChild(s);
};

// ── SYNC SUPABASE ────────────────────────────────────────────────
const syncToSupabase = async (table, data, agent) => {
  try {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, action: 'insert', data, agent }),
    });
  } catch (e) {
    console.warn('Sync Supabase échouée:', e.message);
  }
};

// ── LOGO ────────────────────────────────────────────────────────
const Logo = ({ height = 32 }) => (
  <svg viewBox="0 0 210 60" height={height} style={{ display: "block" }} xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="28" fill="#2D0A3E" />
    <rect x="14" y="37" width="9" height="9" rx="1.5" fill="#F5A623" />
    <rect x="26" y="28" width="9" height="18" rx="1.5" fill="#F5A623" />
    <rect x="38" y="18" width="9" height="28" rx="1.5" fill="#F5A623" />
    <polygon points="42.5,6.5 43.8,10.2 47.7,10.3 44.6,12.7 45.7,16.5 42.5,14.2 39.3,16.5 40.4,12.7 37.3,10.3 41.2,10.2" fill="#F5A623" />
    <text x="66" y="41" fontFamily="'Outfit',sans-serif" fontSize="25" fontWeight="700" fill="#F5A623">Cap</text>
    <text x="109" y="41" fontFamily="'Outfit',sans-serif" fontSize="25" fontWeight="700" fill="#9B8ED4">Zeniths</text>
  </svg>
);

// ── DONNÉES ─────────────────────────────────────────────────────
const SECTEURS = [
  { id: "general", label: "🌐 Tous secteurs" },
  { id: "commerce", label: "🛒 Commerce / Retail" },
  { id: "restauration", label: "🍽️ Restauration / Hôtellerie" },
  { id: "btp", label: "🏗️ BTP / Artisanat" },
  { id: "services", label: "💼 Services aux entreprises" },
  { id: "conseil", label: "🎓 Conseil / Formation" },
  { id: "sante", label: "🏥 Santé / Bien-être" },
  { id: "tech", label: "💻 Tech / Numérique" },
  { id: "transport", label: "🚛 Transport / Logistique" },
  { id: "industrie", label: "⚙️ Industrie / Production" },
];

const TYPES = [
  { id: "defaillances", label: "📉 Défaillances", desc: "Chiffres & stats" },
  { id: "reglementaire", label: "⚖️ Réglementaire", desc: "Alertes légales" },
  { id: "sectorielle", label: "📊 Sectorielle", desc: "Tendances marché" },
  { id: "complete", label: "🔍 Complète", desc: "Tout en un" },
];

const PERIODES = [
  { id: "mois", label: "Dernier mois" },
  { id: "trimestre", label: "Dernier trimestre" },
  { id: "annee", label: "Dernière année" },
];

// ── SYSTEM PROMPT ────────────────────────────────────────────────
const buildSystem = () => `Tu es l'Agent Veille de CapZeniths, cabinet spécialisé en prévention défaillance business pour dirigeants TPE/PME français.
Tu n'as pas accès à internet. Utilise tes connaissances internes pour fournir des données de référence fiables sur les défaillances d'entreprises en France.
Priorité : chiffres officiels (Banque de France, INSEE, Altares, CMA, CCI), actualité réglementaire (URSSAF, ACRE, TVA, social).
Style : factuel, chiffré, direct. Cite les sources et les années de référence.
IMPORTANT : Réponds UNIQUEMENT avec un objet JSON valide, sans backticks, sans texte avant ou après.
Format exact attendu :
{"date_rapport":"<jj/mm/aaaa>","secteur":"<secteur>","periode":"<période>","chiffres_cles":[{"label":"","valeur":"","source":"","tendance":"hausse|baisse|stable"}],"alertes":[{"type":"CRITIQUE|IMPORTANT|INFO","titre":"","description":""}],"tendances":["<tendance 1>","<tendance 2>","<tendance 3>"],"opportunites_capzeniths":["<profil prospect à cibler>","<profil prospect>"],"synthese":"<2-3 phrases directes actionnables>","sources":["<source + date>"]}`;

// ── COULEURS ALERTE ──────────────────────────────────────────────
const alertStyle = (type) => ({
  CRITIQUE: { bg: "#FFF5F5", border: "#FCA5A5", dot: "#EF4444", text: "#991B1B", badge: "#EF4444" },
  IMPORTANT: { bg: "#FFFBF0", border: "#FCD34D", dot: "#F59E0B", text: "#78350F", badge: "#F59E0B" },
  INFO: { bg: "#F0F9FF", border: "#BAE6FD", dot: "#0EA5E9", text: "#0C4A6E", badge: "#0EA5E9" },
}[type] || { bg: "#FAFAF8", border: "#E5E7EB", dot: "#9CA3AF", text: "#374151", badge: "#9CA3AF" });

const tendColor = (t) => t === "hausse" ? "#EF4444" : t === "baisse" ? "#10B981" : "#F59E0B";
const tendIcon = (t) => t === "hausse" ? "↗" : t === "baisse" ? "↘" : "→";

// ── PARSE JSON ROBUSTE ───────────────────────────────────────────
const parseJSON = (raw) => {
  // 1. Supprimer les blocs ```json ... ``` ou ``` ... ```
  let cleaned = raw.replace(/```json[\s\S]*?```/g, m => m.slice(7, -3).trim());
  cleaned = cleaned.replace(/```[\s\S]*?```/g, m => m.slice(3, -3).trim());
  cleaned = cleaned.trim();

  // 2. Extraire le premier objet JSON trouvé
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Aucun JSON trouvé dans la réponse");

  return JSON.parse(match[0]);
};

// ── COMPOSANT PRINCIPAL ──────────────────────────────────────────
export default function AgentVeille() {
  const [form, setForm] = useState({ secteur: "general", type: "complete", periode: "trimestre" });
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [loadPct, setLoadPct] = useState(0);
  const [report, setReport] = useState(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { injectStyles(); }, []);

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const sec = SECTEURS.find(s => s.id === form.secteur);
  const typ = TYPES.find(t => t.id === form.type);
  const per = PERIODES.find(p => p.id === form.periode);

  const MSGS = [
    "Connexion aux sources de données…",
    "Recherche des derniers chiffres de défaillances…",
    "Analyse des tendances sectorielles…",
    "Vérification des alertes réglementaires…",
    "Compilation du rapport de veille…",
  ];

  const launch = async () => {
    setErr(""); setLoading(true); setLoadPct(8);
    let mi = 0; setLoadMsg(MSGS[0]);
    const iv = setInterval(() => {
      mi = Math.min(mi + 1, MSGS.length - 1);
      setLoadMsg(MSGS[mi]);
      setLoadPct(Math.round((mi / (MSGS.length - 1)) * 85));
    }, 2500);

    try {
      const secteurLabel = SECTEURS.find(s => s.id === form.secteur)?.label.replace(/^\S+\s/, "");
      const typeLabel = TYPES.find(t => t.id === form.type)?.label.replace(/^\S+\s/, "");
      const periodeLabel = PERIODES.find(p => p.id === form.periode)?.label;

      const query = `Effectue une veille "${typeLabel}" pour le secteur "${secteurLabel}" en France sur la période "${periodeLabel}".
Données attendues : chiffres défaillances entreprises TPE/PME, tendances, alertes réglementaires récentes, données Banque de France / INSEE / Altares.
Génère le rapport JSON structuré avec données chiffrées. Réponds UNIQUEMENT avec le JSON, sans aucun texte avant ou après.`;

      const res = await fetch("/api/veille", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: buildSystem(),
          messages: [{ role: "user", content: query }],
        }),
      });

      // FIX 1 : Vérifier le statut HTTP avant de parser
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`Erreur serveur ${res.status} : ${errData.error || 'Réponse inattendue'}`);
      }

      const data = await res.json();

      // FIX 2 : Vérifier que data.content existe
      if (!data.content || !Array.isArray(data.content)) {
        throw new Error(`Réponse API invalide : ${JSON.stringify(data).slice(0, 120)}`);
      }

      const raw = data.content
        .map(b => b.type === "text" ? b.text : "")
        .filter(Boolean)
        .join("");

      if (!raw) throw new Error("Réponse vide de l'API");

      // FIX 3 : Parse JSON robuste
      const parsed = parseJSON(raw);
      setReport(parsed);
      clearInterval(iv);
      setLoadPct(100);

      // SYNC SUPABASE
      const alertes = parsed.alertes || [];
      const niveauMax = alertes.some(a => a.type === 'CRITIQUE') ? 'CRITIQUE'
        : alertes.some(a => a.type === 'IMPORTANT') ? 'IMPORTANT' : 'INFO';
      await syncToSupabase('veilles', {
        type_veille:   form.type,
        secteur:       secteurLabel || form.secteur,
        periode:       periodeLabel || form.periode,
        chiffres_cles: JSON.stringify(parsed.chiffres_cles || []),
        alertes:       JSON.stringify(alertes),
        tendances:     (parsed.tendances || []).join(' | '),
        opportunites:  (parsed.opportunites_capzeniths || []).join(' | '),
        niveau_alerte: niveauMax,
      }, 'veille');

    } catch (e) {
      clearInterval(iv);
      // FIX 4 : Afficher le vrai message d'erreur
      console.error("Erreur Agent Veille:", e);
      setErr(`Erreur : ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyReport = () => {
    if (!report) return;
    const txt = `RAPPORT VEILLE CAPZENITHS — ${report.date_rapport}
Secteur : ${report.secteur} | Période : ${report.periode}

SYNTHÈSE
${report.synthese}

CHIFFRES CLÉS
${(report.chiffres_cles || []).map(c => `• ${c.label} : ${c.valeur} (${c.source})`).join("\n")}

ALERTES
${(report.alertes || []).map(a => `[${a.type}] ${a.titre} — ${a.description}`).join("\n")}

TENDANCES
${(report.tendances || []).map(t => `• ${t}`).join("\n")}

OPPORTUNITÉS CAPZENITHS
${(report.opportunites_capzeniths || []).map(o => `• ${o}`).join("\n")}

SOURCES
${(report.sources || []).join("\n")}`;
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // ── LOADING ──
  if (loading) return (
    <div className="czv" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem" }}>
      <div className="czv-card czv-up" style={{ padding: "52px 40px", textAlign: "center", maxWidth: 400, width: "100%" }}>
        <div style={{ fontSize: 48, marginBottom: 18 }}>🔍</div>
        <div className="czv-serif" style={{ fontSize: 22, color: "#2D0A3E", marginBottom: 8, fontStyle: "italic" }}>Veille en cours</div>
        <div style={{ fontSize: 14, color: "#7C6A8E", marginBottom: 32, lineHeight: 1.65 }}>{loadMsg}</div>
        <div style={{ height: 3, background: "rgba(245,166,35,.15)", borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ height: "100%", background: "#F5A623", width: `${loadPct}%`, transition: "width .7s cubic-bezier(.4,0,.2,1)", borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 12, color: "#B8A898", fontWeight: 600 }}>{loadPct}%</div>
      </div>
    </div>
  );

  // ── RAPPORT ──
  if (report) return (
    <div className="czv">
      <nav style={{ background: "#FFF8E8", borderBottom: "2px solid #F5A623", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo height={30} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", color: "rgba(45,10,62,.4)", textTransform: "uppercase" }}>Rapport Veille</span>
            <button onClick={() => { setReport(null); setErr(""); }} className="czv-btn-sm">← Nouvelle veille</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 20px 56px" }}>
        <div className="czv-up" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#B8A898", marginBottom: 8, textTransform: "uppercase" }}>
                Rapport du {report.date_rapport} · {report.periode}
              </div>
              <div className="czv-serif" style={{ fontSize: 28, color: "#2D0A3E", lineHeight: 1.2 }}>{report.secteur}</div>
            </div>
            <button onClick={copyReport} className="czv-btn-sm" style={copied ? { borderColor: "#10B981", color: "#10B981" } : {}}>
              {copied ? "✓ Copié" : "📋 Copier le rapport"}
            </button>
          </div>
        </div>

        <div className="czv-card czv-up1" style={{ padding: "22px 26px", marginBottom: 16, borderTop: "4px solid #F5A623" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#B8A898", marginBottom: 10, textTransform: "uppercase" }}>Synthèse</div>
          <p style={{ margin: 0, fontSize: 15, color: "#2D1B4E", lineHeight: 1.85 }}>{report.synthese}</p>
        </div>

        {(report.chiffres_cles || []).length > 0 && (
          <div className="czv-up2" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#B8A898", marginBottom: 12, textTransform: "uppercase" }}>Chiffres clés</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
              {(report.chiffres_cles || []).map((c, i) => (
                <div key={i} className="czv-card" style={{ padding: "16px 18px" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", color: "#B8A898", marginBottom: 6, textTransform: "uppercase" }}>{c.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: "#2D0A3E", fontFamily: "'DM Serif Display',serif" }}>{c.valeur}</span>
                    <span style={{ fontSize: 16, color: tendColor(c.tendance), fontWeight: 700 }}>{tendIcon(c.tendance)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#B8A898" }}>{c.source}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(report.alertes || []).length > 0 && (
          <div className="czv-up3" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#B8A898", marginBottom: 12, textTransform: "uppercase" }}>Alertes</div>
            {(report.alertes || []).map((a, i) => {
              const st = alertStyle(a.type);
              return (
                <div key={i} style={{ padding: "14px 18px", borderRadius: 13, border: `1.5px solid ${st.border}`, background: st.bg, marginBottom: 8, display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: st.dot, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: st.badge, color: "#fff", letterSpacing: ".06em" }}>{a.type}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: st.text }}>{a.titre}</span>
                    </div>
                    <div style={{ fontSize: 13, color: st.text, lineHeight: 1.65 }}>{a.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="czv-up4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div className="czv-card" style={{ padding: "20px 22px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#B8A898", marginBottom: 12, textTransform: "uppercase" }}>Tendances</div>
            {(report.tendances || []).map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 9, fontSize: 13, color: "#3D2A5C", lineHeight: 1.6 }}>
                <span style={{ color: "#9B8ED4", fontWeight: 700, flexShrink: 0 }}>→</span><span>{t}</span>
              </div>
            ))}
          </div>
          <div className="czv-card" style={{ padding: "20px 22px", borderTop: "3px solid #F5A623" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#F5A623", marginBottom: 12, textTransform: "uppercase" }}>Opportunités CapZeniths</div>
            {(report.opportunites_capzeniths || []).map((o, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 9, fontSize: 13, color: "#3D2A5C", lineHeight: 1.6 }}>
                <span style={{ color: "#F5A623", fontWeight: 700, flexShrink: 0 }}>✦</span><span>{o}</span>
              </div>
            ))}
          </div>
        </div>

        {(report.sources || []).length > 0 && (
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "#FAFAF8", border: "1px solid rgba(45,10,62,.07)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#B8A898", marginBottom: 6, textTransform: "uppercase" }}>Sources</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(report.sources || []).map((src, i) => (
                <span key={i} style={{ fontSize: 11, color: "#7C6A8E", padding: "3px 10px", borderRadius: 20, background: "#fff", border: "1px solid rgba(45,10,62,.1)" }}>{src}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── FORMULAIRE ──
  return (
    <div className="czv">
      <div style={{ background: "#FFF8E8", borderBottom: "2px solid #F5A623", padding: "0 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", height: 56, display: "flex", alignItems: "center" }}>
          <Logo height={30} />
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg,#2D0A3E 0%,#1A0652 100%)", padding: "52px 24px 60px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div className="czv-up" style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".16em", color: "rgba(245,166,35,.55)", textTransform: "uppercase", marginBottom: 12 }}>Agent Veille</div>
          <div className="czv-serif czv-up1" style={{ fontSize: 40, color: "#F0E8FC", lineHeight: 1.15, marginBottom: 12 }}>
            Veille défaillances<br />
            <span style={{ fontStyle: "italic", color: "rgba(245,166,35,.75)" }}>& tendances sectorielles</span>
          </div>
          <div className="czv-up2" style={{ fontSize: 14, color: "rgba(240,232,252,.5)", maxWidth: 460, lineHeight: 1.75 }}>
            Données de référence — défaillances TPE/PME, tendances sectorielles, alertes réglementaires.
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "-26px auto 0", padding: "0 20px 56px", position: "relative", zIndex: 1 }}>
        <div className="czv-card czv-up3" style={{ padding: "34px 34px 38px" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".14em", color: "#B8A898", marginBottom: 12, textTransform: "uppercase" }}>Type de veille</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {TYPES.map(t => (
                <div key={t.id} onClick={() => sf("type", t.id)} className={`czv-type-opt${form.type === t.id ? " sel" : ""}`} style={{ padding: "12px 14px", textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 11, opacity: .7 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".14em", color: "#B8A898", marginBottom: 8, textTransform: "uppercase" }}>Secteur d'activité</div>
            <select className="czv-sel" value={form.secteur} onChange={e => sf("secteur", e.target.value)}>
              {SECTEURS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".14em", color: "#B8A898", marginBottom: 8, textTransform: "uppercase" }}>Période</div>
            <div style={{ display: "flex", gap: 8 }}>
              {PERIODES.map(p => (
                <div key={p.id} onClick={() => sf("periode", p.id)} className={`czv-type-opt${form.periode === p.id ? " sel" : ""}`}>
                  {p.label}
                </div>
              ))}
            </div>
          </div>

          {err && (
            <div style={{ fontSize: 13, color: "#991B1B", marginBottom: 16, padding: "10px 15px", background: "#FEE2E2", borderRadius: 10 }}>
              ⚠️ {err}
            </div>
          )}

          <button className="czv-btn" onClick={launch}>
            → Lancer la veille {typ?.label.split(" ")[0]} · {sec?.label.split(" ").slice(1).join(" ")}
          </button>
        </div>
      </div>
    </div>
  );
}
