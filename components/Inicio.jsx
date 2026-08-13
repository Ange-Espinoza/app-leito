"use client";

import { useRef } from "react";

const HOY_LARGO = new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

export default function Inicio({ nombre, searchName, storeName, onArchivo, error }) {
  const fileRef = useRef(null);

  function elegir(e) {
    const f = e.target.files && e.target.files[0];
    if (f) onArchivo(f);
    e.target.value = "";
  }

  return (
    <div className="al-root al-bg-main">
      <div className="al-inicio">
        <div className="al-inicio-today">{HOY_LARGO}</div>
        <div className="al-inicio-hello">¡Hola, {nombre}!</div>
        <img src="/mascotas/purin-pizza.png" alt="Purín con pizza" className="al-inicio-mascot" />
        <div className="al-inicio-card">
          <div className="al-inicio-card-title">Pásame la foto y yo la leo</div>
          <div className="al-inicio-card-sub">
            Busco <b style={{ color: "#7A5FB8" }}>{searchName}</b> en la planilla del {storeName} y te armo la semana solita.
          </div>
          <button type="button" className="al-btn-primary" onClick={() => fileRef.current?.click()}>
            Subir la foto del horario
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={elegir} />
        </div>
        {error && (
          <div className="al-scan-error" style={{ marginBottom: 20 }}>
            <h4>{error.t}</h4>
            <p>{error.d}</p>
          </div>
        )}
      </div>
    </div>
  );
}
