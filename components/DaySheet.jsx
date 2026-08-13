"use client";

import { fmtHora, duracionTxt } from "../lib/schedule";

export default function DaySheet({ day, storeName, editing, draft, onClose, onEditToggle, onBump, reminderOn, onToggleReminder }) {
  if (!day) return null;
  const s = editing && draft ? draft.s : day.s;
  const e = editing && draft ? draft.e : day.e;
  const chip = day.off ? "libre" : duracionTxt(e - s);
  const chipBg = day.off ? "#EADEFF" : "#FFF0BF";
  const chipFg = day.off ? "#6B4FA8" : "#8A6A18";

  return (
    <div className="al-sheet-overlay">
      <div className="al-sheet-backdrop" onClick={onClose} />
      <div className="al-sheet-panel">
        <div className="al-sheet-handle" />
        <div className="al-sheet-head">
          <div style={{ minWidth: 0 }}>
            <div className="al-sheet-title">{day.full}</div>
            <div className="al-sheet-store">{day.off ? "Sin turno" : `${storeName} · MAESTRO`}</div>
          </div>
          <div className="al-sheet-chip" style={{ background: chipBg, color: chipFg }}>{chip}</div>
        </div>

        {!day.off && (
          <>
            <div className="al-sheet-work">
              <div className="al-sheet-time-col">
                <div className="al-sheet-time-label">ENTRAS</div>
                <div className="al-sheet-time-val">{fmtHora(s)}</div>
                {editing && (
                  <div className="al-edit-row">
                    <button type="button" className="al-edit-btn" onClick={() => onBump("s", -0.5)}>−</button>
                    <button type="button" className="al-edit-btn" onClick={() => onBump("s", 0.5)}>+</button>
                  </div>
                )}
              </div>
              <div className="al-sheet-time-sep" />
              <div className="al-sheet-time-col">
                <div className="al-sheet-time-label">SALES</div>
                <div className="al-sheet-time-val al-end">{fmtHora(e)}</div>
                {editing && (
                  <div className="al-edit-row">
                    <button type="button" className="al-edit-btn" onClick={() => onBump("e", -0.5)}>−</button>
                    <button type="button" className="al-edit-btn" onClick={() => onBump("e", 0.5)}>+</button>
                  </div>
                )}
              </div>
            </div>

            <div className="al-sheet-mates-block">
              <div className="al-eyebrow">TE TOCA CON</div>
              <div className="al-mates" style={{ marginTop: 10 }}>
                {day.matesEstado === "cargando" && <div className="al-mate-loading">Buscando compañeros…</div>}
                {day.matesEstado === "listo" && day.crewRows.length === 0 && <div className="al-mate-loading">Turno en solitario</div>}
                {day.crewRows.map((m, i) => (
                  <div className="al-mate-row" key={i}>
                    <div className="al-mate-dot" style={{ background: m.dot }} />
                    <div className="al-mate-name">{m.n}</div>
                    <div className="al-mate-tag" style={{ background: m.tagBg, color: m.tagFg }}>{m.tag}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="al-sheet-toggle-row">
              <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                <div className="al-sheet-toggle-title">Recordarme 1 h antes</div>
                <div className="al-sheet-toggle-hint">{reminderOn ? `Te aviso a las ${fmtHora(s - 1)} (si tienes la app abierta)` : "Apagado"}</div>
              </div>
              <button type="button" className="al-toggle" style={{ background: reminderOn ? "#8B6FC9" : "#E4DAF6" }} onClick={onToggleReminder}>
                <span className="al-toggle-knob" style={{ left: reminderOn ? "24px" : "3px" }} />
              </button>
            </div>
          </>
        )}

        {day.off && (
          <div className="al-sheet-free">
            <div className="al-sheet-free-icon">
              <div style={{ position: "absolute", left: 17, top: 22, width: 7, height: 8, borderRadius: "50%", background: "#7A5FB8" }} />
              <div style={{ position: "absolute", right: 17, top: 22, width: 7, height: 8, borderRadius: "50%", background: "#7A5FB8" }} />
              <div style={{ position: "absolute", left: "50%", top: 34, transform: "translateX(-50%)", width: 16, height: 9, border: "2px solid #7A5FB8", borderTop: "none", borderRadius: "0 0 16px 16px" }} />
            </div>
            <div className="al-sheet-free-title">Día libre</div>
            <div className="al-sheet-free-sub">Nada de pizzas hoy. Duerme rico. 💛</div>
          </div>
        )}

        <div className="al-sheet-actions">
          <button type="button" className="al-sheet-btn-close" onClick={onClose}>Cerrar</button>
          {!day.off && (
            <button type="button" className="al-sheet-btn-save" onClick={onEditToggle}>
              {editing ? "Guardar cambios" : "Editar horas"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
