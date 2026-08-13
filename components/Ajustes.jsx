"use client";

export default function Ajustes({ prefs, onChange, onReset, tieneSemana }) {
  return (
    <div className="al-root al-bg-main">
      <div className="al-scroll">
        <div className="al-title">Ajustes</div>

        <div className="al-ajustes-card">
          <div className="al-ajustes-row">
            <div>
              <div className="al-ajustes-k">Cómo te llamo</div>
              <div className="al-ajustes-hint">Solo para hablarte bonito</div>
            </div>
            <input
              className="al-ajustes-v-input"
              value={prefs.nombre}
              onChange={(e) => onChange({ nombre: e.target.value })}
            />
          </div>
          <div className="al-ajustes-row">
            <div>
              <div className="al-ajustes-k">Nombre en la planilla</div>
              <div className="al-ajustes-hint">Así aparece en la lista</div>
            </div>
            <input
              className="al-ajustes-v-input"
              value={prefs.searchName}
              onChange={(e) => onChange({ searchName: e.target.value })}
            />
          </div>
          <div className="al-ajustes-row">
            <div>
              <div className="al-ajustes-k">Local</div>
              <div className="al-ajustes-hint">Sale en el detalle de cada turno</div>
            </div>
            <input
              className="al-ajustes-v-input"
              value={prefs.storeName}
              onChange={(e) => onChange({ storeName: e.target.value })}
            />
          </div>
        </div>

        {tieneSemana && (
          <button type="button" className="al-btn-outline" onClick={onReset}>
            Subir otra semana
          </button>
        )}

        <div className="al-ajustes-about">
          El botón «Mandarle mi semana a mi amorcito» abre el menú para compartir de tu teléfono (WhatsApp, Mensajes...) con la semana ya escrita, para que la mandes con un toque.
        </div>
      </div>
    </div>
  );
}
