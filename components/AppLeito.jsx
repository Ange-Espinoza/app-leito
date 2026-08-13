"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./app-leito.css";
import Inicio from "./Inicio";
import Scan from "./Scan";
import Semana from "./Semana";
import Crew from "./Crew";
import Ajustes from "./Ajustes";
import DaySheet from "./DaySheet";
import TabBar from "./TabBar";
import Toast from "./Toast";
import { prepararImagen, cargarPrefs, guardarPrefs, cargarSemanaGuardada, guardarSemana, borrarSemanaGuardada } from "../lib/schedule";
import { buscarPersona, leerEquipoDia, fichaAWeek } from "../lib/scanner";
import { computeVista, textoParaCompartir } from "../lib/weekModel";

const PREFS_DEFAULT = { nombre: "Leito", searchName: "LEONARDO ANTONIO", storeName: "Pequeño César" };

export default function AppLeito() {
  const [listo, setListo] = useState(false);
  const [prefs, setPrefs] = useState(PREFS_DEFAULT);
  const [pantalla, setPantalla] = useState("inicio");

  const [imagen, setImagen] = useState(null); // { preview, base64 } — session only, never persisted
  const [ficha, setFicha] = useState(null);
  const [week, setWeek] = useState(null);
  const [edits, setEdits] = useState({});
  const [reminders, setReminders] = useState({});

  const [scanEstado, setScanEstado] = useState("buscando");
  const [scanError, setScanError] = useState(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [candidatos, setCandidatos] = useState([]);

  const [openDay, setOpenDay] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  const [toast, setToast] = useState("");
  const [compartiendo, setCompartiendo] = useState(false);
  const [verFoto, setVerFoto] = useState(false);

  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function flash(msg) {
    setToast(msg);
    timers.current.push(setTimeout(() => setToast(""), 2400));
  }

  // ── load saved state on mount ──
  // One-time hydration from localStorage (not a live external subscription,
  // so useSyncExternalStore would be overkill here).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const p = cargarPrefs();
    if (p) setPrefs({ ...PREFS_DEFAULT, ...p });
    const saved = cargarSemanaGuardada();
    if (saved && saved.ficha && saved.week) {
      setFicha(saved.ficha);
      setWeek(saved.week);
      setEdits(saved.edits || {});
      setReminders(saved.reminders || {});
      setPantalla("semana");
    }
    setListo(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ── persist schedule (never the photo) whenever it changes ──
  useEffect(() => {
    if (!listo || !ficha || !week) return;
    guardarSemana({ ficha, week, edits, reminders });
  }, [listo, ficha, week, edits, reminders]);

  function cambiarPrefs(patch) {
    setPrefs((p) => {
      const np = { ...p, ...patch };
      guardarPrefs(np);
      return np;
    });
  }

  // ── coworker loading for one day, updates `week` progressively ──
  function cargarCompaneros(baseFicha, base64, wk) {
    wk.forEach((d, i) => {
      if (d.off) return;
      leerEquipoDia(base64, baseFicha, i)
        .then((mates) => setWeek((prev) => prev && prev.map((x, j) => (j === i ? { ...x, mates, matesEstado: "listo" } : x))))
        .catch(() => setWeek((prev) => prev && prev.map((x, j) => (j === i ? { ...x, mates: [], matesEstado: "error" } : x))));
    });
  }

  async function buscar(base64, nombreBuscado) {
    setScanEstado("buscando");
    setScanError(null);
    setNoEncontrado(false);
    setPantalla("scan");
    try {
      const j = await buscarPersona(base64, nombreBuscado);
      if (!j.encontrado) {
        setNoEncontrado(true);
        setCandidatos(j.candidatos || []);
        return;
      }
      setFicha(j);
      const wk = fichaAWeek(j);
      setWeek(wk);
      setEdits({});
      setReminders({});
      setScanEstado("equipo");
      cargarCompaneros(j, base64, wk);
      timers.current.push(setTimeout(() => {
        setPantalla("semana");
        flash("¡Listo! Tu semana quedó guardada 💛");
      }, 850));
    } catch (e) {
      setScanError({ t: "No se pudo armar el horario", d: e.message || "Inténtalo de nuevo." });
    }
  }

  async function onArchivo(file) {
    try {
      const img = await prepararImagen(file);
      setImagen(img);
      buscar(img.base64, prefs.searchName);
    } catch (e) {
      setPantalla("scan");
      setScanError({ t: "No se pudo leer la imagen", d: e.message });
    }
  }

  function reintentar() {
    if (imagen) buscar(imagen.base64, prefs.searchName);
    else setPantalla("inicio");
  }
  function volverDeError() {
    setPantalla("inicio");
    setScanError(null);
    setNoEncontrado(false);
  }
  function elegirCandidato(nombre) {
    cambiarPrefs({ searchName: nombre });
    if (imagen) buscar(imagen.base64, nombre);
  }

  function resetTodo() {
    borrarSemanaGuardada();
    setFicha(null); setWeek(null); setEdits({}); setReminders({});
    setImagen(null); setOpenDay(null); setEditing(false); setDraft(null);
    setPantalla("inicio");
  }

  const vista = useMemo(() => (week ? computeVista(week, edits) : null), [week, edits]);

  function bump(field, delta) {
    setDraft((d) => {
      const nd = { ...(d || {}) };
      nd[field] = Math.max(6, Math.min(27, (nd[field] ?? 0) + delta));
      if (nd.e <= nd.s) nd.e = nd.s + 1;
      return nd;
    });
  }
  function editToggle() {
    if (!editing) {
      const day = vista.days[openDay];
      setDraft({ s: day.s, e: day.e });
      setEditing(true);
    } else {
      setEdits((prev) => ({ ...prev, [openDay]: { s: draft.s, e: draft.e } }));
      setEditing(false);
      setDraft(null);
      flash("Cambiado. Yo me acuerdo por ti 💛");
    }
  }

  async function compartir() {
    if (!vista) return;
    setCompartiendo(true);
    const texto = textoParaCompartir(vista, prefs.nombre, prefs.storeName, ficha?.periodo);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: `La semana de ${prefs.nombre}`, text: texto });
        flash("¡Semana enviada! 💌");
      } else {
        await navigator.clipboard.writeText(texto);
        flash("Copiado — pégalo en tu chat con tu amorcito 💌");
      }
    } catch (e) {
      if (e && e.name === "AbortError") { /* user closed the share sheet, nothing to do */ }
      else {
        try {
          await navigator.clipboard.writeText(texto);
          flash("No se pudo abrir compartir — lo copié para que lo pegues 💛");
        } catch {
          flash("No se pudo compartir ni copiar. Intenta de nuevo.");
        }
      }
    } finally {
      setCompartiendo(false);
    }
  }

  if (!listo) return null;

  if (pantalla === "inicio") {
    return <Inicio nombre={prefs.nombre} searchName={prefs.searchName} storeName={prefs.storeName} onArchivo={onArchivo} />;
  }

  if (pantalla === "scan") {
    return (
      <Scan
        estado={scanEstado}
        nombre={prefs.nombre}
        imagenPreview={imagen?.preview}
        error={scanError}
        noEncontrado={noEncontrado}
        candidatos={candidatos}
        onReintentar={reintentar}
        onElegirCandidato={elegirCandidato}
        onCancelar={volverDeError}
      />
    );
  }

  // semana / crew / ajustes share the tab bar + day sheet + toast
  return (
    <>
      {pantalla === "semana" && vista && (
        <Semana
          nombre={prefs.nombre}
          storeName={prefs.storeName}
          periodo={ficha?.periodo}
          vista={vista}
          onDayTap={(i) => { setOpenDay(i); setEditing(false); setDraft(null); }}
          onShare={compartir}
          compartiendo={compartiendo}
          onVerFoto={() => (imagen ? setVerFoto(true) : flash("Sube la foto de nuevo para verla otra vez"))}
        />
      )}
      {pantalla === "crew" && vista && <Crew storeName={prefs.storeName} vista={vista} />}
      {pantalla === "ajustes" && (
        <Ajustes prefs={prefs} onChange={cambiarPrefs} onReset={resetTodo} tieneSemana={!!week} />
      )}

      <TabBar
        active={pantalla}
        onChange={setPantalla}
        onScan={() => setPantalla("inicio")}
        nombre={prefs.nombre}
      />

      {openDay !== null && vista && (
        <DaySheet
          day={vista.days[openDay]}
          storeName={prefs.storeName}
          editing={editing}
          draft={draft}
          onClose={() => { setOpenDay(null); setEditing(false); setDraft(null); }}
          onEditToggle={editToggle}
          onBump={bump}
          reminderOn={!!reminders[openDay]}
          onToggleReminder={() => setReminders((r) => ({ ...r, [openDay]: !r[openDay] }))}
        />
      )}

      {verFoto && imagen && (
        <div className="al-sheet-overlay" onClick={() => setVerFoto(false)}>
          <div className="al-sheet-backdrop" />
          <img
            src={imagen.preview}
            alt="Planilla original"
            style={{ position: "relative", zIndex: 1, maxWidth: "92%", maxHeight: "80vh", margin: "10vh auto", display: "block", borderRadius: 12, boxShadow: "0 20px 50px rgba(0,0,0,.4)" }}
          />
        </div>
      )}

      <Toast mensaje={toast} />
    </>
  );
}
