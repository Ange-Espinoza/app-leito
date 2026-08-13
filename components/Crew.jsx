"use client";

export default function Crew({ storeName, vista }) {
  const algunoCargando = vista.workDays.some((d) => d.matesEstado === "cargando");

  return (
    <div className="al-root al-bg-main">
      <div className="al-scroll">
        <div style={{ padding: "0 6px" }}>
          <div className="al-title">Con quién te toca</div>
          <div className="al-subtitle">Esta semana en el {storeName}</div>
        </div>

        {vista.topMateName && (
          <div className="al-crew-hero">
            <div className="al-crew-hero-label">CON QUIEN MÁS COMPARTES</div>
            <div className="al-crew-hero-name">{vista.topMateName}</div>
            <div className="al-crew-hero-meta">{vista.topMateMeta}</div>
          </div>
        )}

        {vista.crew.length > 0 && (
          <div className="al-rank-card">
            <div className="al-eyebrow">EL RANKING DE LA SEMANA</div>
            <div className="al-rank-list">
              {vista.crew.map((p, i) => (
                <div key={i}>
                  <div className="al-rank-row-head">
                    <div className="al-rank-name">{p.n}</div>
                    <div className="al-rank-meta">{p.meta}</div>
                  </div>
                  <div className="al-rank-bar-track">
                    <div className="al-rank-bar-fill" style={{ width: p.w, background: p.barBg }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {algunoCargando && <div className="al-mate-loading" style={{ marginTop: 10, textAlign: "center" }}>Todavía viendo con quién compartes algunos días…</div>}

        <div className="al-eyebrow" style={{ margin: "20px 6px 10px" }}>TURNO POR TURNO</div>
        <div className="al-turn-list">
          {vista.workDays.map((d) => (
            <div className="al-turn-card" key={d.i}>
              <div className="al-turn-head">
                <div className="al-turn-day">{d.full}</div>
                <div className="al-turn-tag" style={{ background: d.tagBg, color: d.tagFg }}>{d.range}</div>
              </div>
              <div className="al-mates">
                {d.matesEstado === "cargando" && <div className="al-mate-loading">Buscando compañeros…</div>}
                {d.matesEstado === "listo" && d.crewRows.length === 0 && <div className="al-mate-loading">Turno en solitario</div>}
                {d.crewRows.map((m, i) => (
                  <div className="al-mate-row" key={i}>
                    <div className="al-mate-dot" style={{ background: m.dot }} />
                    <div className="al-mate-name">{m.n}</div>
                    <div className="al-mate-tag" style={{ background: m.tagBg, color: m.tagFg }}>{m.tag}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <img src="/mascotas/purin-amigos.png" alt="Purín con sus amigos" style={{ display: "block", width: "100%", height: "auto", marginTop: 14 }} />
        <div className="al-alone">Nunca estás solo en el turno 💛</div>
      </div>
    </div>
  );
}
