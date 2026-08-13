// Turno parsing + schedule math. Ported from the working "Mi Semana" prototype
// (uploads/app.txt), adapted to the App Leito hour-axis model (decimal hours,
// where a shift past midnight is e.g. 25 = 01:00 the next day).

export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const CORTOS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
export const LETRAS = ["L", "M", "M", "J", "V", "S", "D"];

const MESES = {
  ene: 0, jan: 0, feb: 1, mar: 2, abr: 3, apr: 3, may: 4, jun: 5, jul: 6,
  ago: 7, aug: 7, sep: 8, set: 8, oct: 9, nov: 10, dic: 11, dec: 11,
};

export function normalizar(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function primerNombre(n) {
  return String(n || "").trim().split(/\s+/)[0] || "";
}

export function listaConY(nombres) {
  const a = nombres.filter(Boolean);
  if (a.length === 0) return "";
  if (a.length === 1) return a[0];
  return a.slice(0, -1).join(", ") + " y " + a[a.length - 1];
}

// Parses "HH:MM-HH:MM" (or with h/./ separators, "a"/"hasta" between) into
// decimal hours on the App Leito axis: e.g. "18:30-01:00" -> { s: 18.5, e: 25 }.
export function leerTurno(bruto) {
  if (!bruto) return null;
  const t = String(bruto).trim();
  if (!t || /^(libre|-|—|s\/t)$/i.test(t)) return null;
  const m = t.match(/(\d{1,2})[:.h](\d{2})\s*(?:a|-|–|—|hasta)\s*(\d{1,2})[:.h](\d{2})/i);
  if (!m) return { bruto: t, ok: false };
  let s = (+m[1]) + (+m[2]) / 60;
  let e = (+m[3]) + (+m[4]) / 60;
  if (e <= s) e += 24;
  return { bruto: t, ok: true, s, e, duracion: e - s, cruzaMedianoche: e > 24 };
}

export function franja(s) {
  if (s < 12) return "manana";
  if (s < 17) return "tarde";
  return "noche";
}

export function fmtHora(v) {
  const h = Math.floor(((v % 24) + 24) % 24);
  const m = Math.round((v - Math.floor(v)) * 60);
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

export function duracionTxt(h) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return mm ? `${hh} h ${mm}` : `${hh} h`;
}

// Overlap in hours between two [s,e) ranges on the same axis.
export function solape(aS, aE, bS, bE) {
  return Math.max(0, Math.min(aE, bE) - Math.max(aS, bS));
}

export function leerFecha(f) {
  const m = String(f || "").match(/(\d{1,2})\s*[-/ .]\s*([A-Za-zÁÉÍÓÚáéíóú]{3,})/);
  if (!m) return null;
  const mes = MESES[m[2].slice(0, 3).toLowerCase()];
  if (mes === undefined) return null;
  return { dia: +m[1], mes };
}

export function esHoy(f) {
  const d = leerFecha(f);
  if (!d) return false;
  const hoy = new Date();
  return d.dia === hoy.getDate() && d.mes === hoy.getMonth();
}

// A rotating, stable-per-name color for the little dot next to a coworker.
const DOTS = ["#FFD86E", "#C0A8EC", "#FFB38A", "#8FD0AE", "#F2A0C0", "#8FB6E8"];
export function colorPara(nombre) {
  let x = 0;
  const s = String(nombre || "");
  for (let i = 0; i < s.length; i++) x += s.charCodeAt(i);
  return DOTS[x % DOTS.length];
}

// Resizes an image file client-side (mirrors app.txt's prepararImagen) and
// returns both a preview data URL and the raw base64 payload to send to the
// scan API.
export async function prepararImagen(file) {
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error("No se pudo abrir el archivo."));
    r.readAsDataURL(file);
  });
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("Ese archivo no es una imagen que se pueda abrir. Prueba con JPG o PNG."));
    i.src = dataUrl;
  });
  const MAX = 1568;
  const escala = Math.min(1, MAX / Math.max(img.width, img.height));
  const w = Math.round(img.width * escala);
  const h = Math.round(img.height * escala);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const jpeg = c.toDataURL("image/jpeg", 0.9);
  return { preview: jpeg, base64: jpeg.split(",")[1] };
}

// ── localStorage helpers (no backend account, everything lives on the phone) ──
const KEY_PREFS = "app-leito:prefs";
const KEY_SEMANA = "app-leito:semana";

export function cargarPrefs() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY_PREFS);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function guardarPrefs(prefs) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY_PREFS, JSON.stringify(prefs)); } catch { /* sin storage, da igual */ }
}

export function cargarSemanaGuardada() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY_SEMANA);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function guardarSemana(datos) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY_SEMANA, JSON.stringify(datos)); } catch { /* sin storage, da igual */ }
}

export function borrarSemanaGuardada() {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(KEY_SEMANA); } catch { /* sin storage, da igual */ }
}
