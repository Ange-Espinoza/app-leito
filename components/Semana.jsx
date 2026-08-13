"use client";

import { duracionTxt } from "../lib/schedule";

function horaAhoraDecimal() {
  const n = new Date();
  return n.getHours() + n.getMinutes() / 60;
}

function progresoHoy(today) {
  if (!today || !today.on) return null;
  const ahora = horaAhoraDecimal();
  const dur = today.e - today.s;
  let llevas, resta;
  if (ahora < today.s) { llevas = 0; resta = dur; }
  else if (ahora > today.e) { llevas = dur; resta = 0; }
  else { llevas = ahora - today.s; resta = today.e - ahora; }
  return { llevas, resta, pct: Math.round((llevas / dur) * 100) };
}

export default function Semana({ nombre, storeName, periodo, vista, onDayTap, onShare, onVerFoto, compartiendo }) {
  const today = vista.today;
  const prog = progresoHoy(today);

  return (
    <div className="al-root al-bg-main">
      <div className="al-scroll">
        <div className="al-head-row">
          <div style={{ minWidth: 0 }}>
            <div className="al-title">Tu semana</div>
            <div className="al-subtitle">{periodo || ""} · {storeName}</div>
          </div>
          <div className="al-week-chip">{vista.weekTotal}</div>
        </div>

        {today && (
          <div className="al-hero">
            <div className="al-hero-row">
              <div style={{ minWidth: 0 }}>
                <div className="al-hero-label">HOY, {today.short} {today.num}</div>
                <div className="al-hero-value">
                  {today.on ? today.range.replace("–", " → ") : "Libre"}
                </div>
              </div>
              {today.on && (
                <div className="al-hero-right">
                  <div className="al-hero-sub">TE QUEDAN</div>
                  <div className="al-hero-left">{duracionTxt(prog.resta)}</div>
                </div>
              )}
            </div>
            {today.on && (
              <>
                <div className="al-hero-bar-track">
                  <div className="al-hero-bar-fill" style={{ width: `${Math.max(2, prog.pct)}%` }} />
                </div>
                <div className="al-hero-foot">
                  Llevas {duracionTxt(prog.llevas)}
                  {today.crewRows.length > 0 && <> · te toca con {today.crewRows.map((r) => r.n.split(" ")[0]).join(", ")}</>}
                </div>
              </>
            )}
          </div>
        )}

        <div className="al-stats-row">
          {vista.stats.map((s, i) => (
            <div className="al-stat-card" key={i}>
              <div className="al-stat-n">{s.n}</div>
              <div className="al-stat-l">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="al-week-card">
          <div className="al-week-row">
            <div className="al-axis">
              <div className="al-axis-spacer" />
              <div className="al-axis-track">
                {vista.hourMarks.map((m, i) => (
                  <div className="al-axis-mark" key={i} style={{ top: m.top }}>{m.label}</div>
                ))}
              </div>
            </div>
            <div className="al-days-row">
              {vista.days.map((d) => (
                <button type="button" className="al-day-col" key={d.i} onClick={() => onDayTap(d.i)}>
                  <div className="al-day-letter" style={{ color: d.headColor }}>{d.letter}</div>
                  <div className="al-day-num" style={{ color: d.numColor, background: d.numBg }}>{d.num || ""}</div>
                  <div className="al-day-track" style={{ background: d.trackBg }}>
                    {d.off ? (
                      <div className="al-day-off">
                        <div className="al-day-off-label">LIBRE</div>
                      </div>
                    ) : (
                      <div className="al-day-block" style={{ top: d.top, height: d.h, background: d.blockBg, boxShadow: d.blockShadow }}>
                        <div className="al-day-block-start" style={{ color: d.blockFg }}>{d.startLabel}</div>
                        <div className="al-day-block-end" style={{ color: d.blockFg }}>{d.endLabel}</div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="al-legend-row">
            <div className="al-legend-item"><div className="al-legend-dot" style={{ background: "#FFD05C" }} /><span className="al-legend-label">mañana</span></div>
            <div className="al-legend-item"><div className="al-legend-dot" style={{ background: "#C0A8EC" }} /><span className="al-legend-label">tarde</span></div>
            <div className="al-legend-item"><div className="al-legend-dot" style={{ background: "#7154B4" }} /><span className="al-legend-label">noche</span></div>
            <div className="al-legend-item"><div className="al-legend-dot" style={{ background: "transparent", border: "2px dashed #DCD1F0" }} /><span className="al-legend-label">libre</span></div>
          </div>
        </div>

        <div className="al-mascot-wrap">
          <img src="/mascotas/purin-cocinero.png" alt="Purín cocinero" className="al-mascot-img" />
        </div>
        <button type="button" className="al-send-btn" onClick={onShare} disabled={compartiendo}>
          {compartiendo ? "Enviando…" : `Mandarle mi semana a mi amorcito`}
        </button>
        <button type="button" className="al-link-center" onClick={onVerFoto}>Ver la planilla original</button>
        <div className="al-foot-note">Los turnos salen de una foto: si algo no calza, la planilla manda.</div>
      </div>
    </div>
  );
}
