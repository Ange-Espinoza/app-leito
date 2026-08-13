"use client";

const TITULOS = {
  buscando: "Mirando tu planilla…",
  equipo: (n) => `¡Te encontré, ${n}!`,
};
const SUBS = {
  buscando: "Buscando tu nombre en la lista",
  equipo: "Viendo con quién compartes cada turno…",
};

export default function Scan({ estado, nombre, imagenPreview, error, noEncontrado, candidatos, onReintentar, onElegirCandidato, onCancelar }) {
  if (error) {
    return (
      <div className="al-root al-bg-scan">
        <div className="al-scan">
          <div className="al-scan-title">No se pudo leer la foto</div>
          <div className="al-scan-error">
            <h4>{error.t}</h4>
            <p>{error.d}</p>
          </div>
          <div className="al-scan-actions">
            <button type="button" className="al-btn-primary" style={{ marginTop: 18, maxWidth: 260 }} onClick={onReintentar}>
              Intentar de nuevo
            </button>
          </div>
          <button type="button" className="al-link-center" style={{ marginTop: 14 }} onClick={onCancelar}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (noEncontrado) {
    return (
      <div className="al-root al-bg-scan">
        <div className="al-scan">
          <div className="al-scan-title">No apareció ese nombre</div>
          <div className="al-scan-sub">Revisa cómo está escrito en la planilla, o prueba con el apellido</div>
          {candidatos && candidatos.length > 0 && (
            <div className="al-chip-row">
              {candidatos.map((c, i) => (
                <button key={i} type="button" className="al-chip" onClick={() => onElegirCandidato(c)}>{c}</button>
              ))}
            </div>
          )}
          <img src="/mascotas/purin-pizza.png" alt="Purín esperando" className="al-scan-mascot" />
          <button type="button" className="al-link-center" style={{ marginTop: 18 }} onClick={onCancelar}>
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  const titulo = typeof TITULOS[estado] === "function" ? TITULOS[estado](nombre) : TITULOS[estado] || TITULOS.buscando;
  const sub = SUBS[estado] || SUBS.buscando;

  return (
    <div className="al-root al-bg-scan">
      <div className="al-scan">
        <div className="al-scan-title">{titulo}</div>
        <div className="al-scan-sub">{sub}</div>
        <div className="al-scan-sheet-wrap">
          <div className="al-scan-sheet">
            <div className="al-scan-sheet-title">TU PLANILLA</div>
            {imagenPreview && (
              <img src={imagenPreview} alt="Planilla" style={{ width: "100%", borderRadius: 8, display: "block" }} />
            )}
            {estado === "buscando" && <div className="al-scan-sweep" />}
          </div>
          {estado === "equipo" && (
            <div className="al-scan-found">¡Eres tú, {nombre}! ✓</div>
          )}
        </div>
        <div className="al-scan-dots">
          {[0, 1].map((i) => (
            <div key={i} className="al-scan-dot" style={{ background: (estado === "equipo" ? 2 : 1) > i ? "#8B6FC9" : "#E4DAF6" }} />
          ))}
        </div>
        <img src="/mascotas/purin-pizza.png" alt="Purín esperando" className="al-scan-mascot" />
      </div>
    </div>
  );
}
