import {
  CORTOS, LETRAS, DIAS, franja, fmtHora, duracionTxt, solape, colorPara,
  primerNombre, listaConY, esHoy,
} from "./schedule";

// Same visual axis as the App Leito mockup: the week grid spans from 8:00 to
// 26:00 (02:00 the next day), covering every real shift including closes.
export const EJE_INICIO = 8;
export const EJE_LARGO = 18;

export const PALETA = {
  manana: { bg: "linear-gradient(170deg,#FFE9A3,#FFD05C)", fg: "#7A5B12", sh: "0 4px 10px rgba(222,175,60,.34)", chipBg: "#FFF0BF", chipFg: "#8A6A18" },
  tarde: { bg: "linear-gradient(170deg,#DCCBF5,#C0A8EC)", fg: "#4A3A72", sh: "0 4px 10px rgba(160,133,222,.34)", chipBg: "#EFE7FC", chipFg: "#5B4192" },
  noche: { bg: "linear-gradient(170deg,#9A7FD6,#7154B4)", fg: "#FFFFFF", sh: "0 4px 12px rgba(113,84,180,.42)", chipBg: "#EADEFF", chipFg: "#6B4FA8" },
};

function pct(v) {
  return `${Math.max(0, Math.min(100, (v / EJE_LARGO) * 100)).toFixed(2)}%`;
}

/**
 * Builds the full render-ready view of a scanned week.
 * `week` is an array of 7 entries (Lunes..Domingo):
 *   { fecha, off, s, e, turnoBruto, mates: [{nombre,s,e,cargo}]|null|undefined, matesEstado }
 * `edits` is a map { [dayIndex]: {s,e} } of hand-edited hours.
 */
export function computeVista(week, edits = {}) {
  const dias = week.map((d, i) => (edits[i] ? { ...d, ...edits[i] } : d));

  const days = dias.map((d, i) => {
    const on = !d.off;
    const hrs = on ? d.e - d.s : 0;
    const f = on ? franja(d.s) : null;
    const pal = on ? PALETA[f] : PALETA.tarde;
    const isToday = esHoy(d.fecha);

    const rows = (d.mates || []).map((m) => {
      const same = on && m.s === d.s && m.e === d.e;
      const juntos = on ? solape(d.s, d.e, m.s, m.e) : 0;
      return {
        n: m.nombre, dot: colorPara(m.nombre), same, juntos, cargo: m.cargo,
        tag: same ? "mismo turno" : duracionTxt(juntos) + " juntos",
        tagBg: same ? "#FFF0BF" : "#F2ECFA",
        tagFg: same ? "#8A6A18" : "#7A5FB8",
      };
    }).sort((a, b) => b.juntos - a.juntos);

    return {
      i, off: !!d.off, on, isToday,
      fecha: d.fecha,
      short: CORTOS[i], letter: LETRAS[i], full: `${DIAS[i]}${d.fecha ? " " + d.fecha.replace(/-/g, " ") : ""}`,
      num: (d.fecha || "").match(/^\d{1,2}/)?.[0] || "",
      s: on ? d.s : null, e: on ? d.e : null,
      top: on ? pct(d.s - EJE_INICIO) : "0%",
      h: on ? pct(hrs) : "0%",
      startLabel: on ? fmtHora(d.s) : "",
      endLabel: on ? fmtHora(d.e) : "",
      range: on ? `${fmtHora(d.s)}–${fmtHora(d.e)}` : "",
      turnoBruto: d.turnoBruto || "",
      blockBg: pal.bg, blockFg: pal.fg, blockShadow: pal.sh,
      tagBg: pal.chipBg, tagFg: pal.chipFg,
      trackBg: isToday ? "#F7F1FF" : "#FBF9F4",
      headColor: isToday ? "#7A5FB8" : "#C6BAD8",
      numColor: isToday ? "#fff" : "#8B8095",
      numBg: isToday ? "#6B4FA8" : "transparent",
      crewRows: rows,
      matesEstado: d.matesEstado || (on ? "cargando" : "listo"),
    };
  });

  const trabajados = days.filter((d) => d.on);
  const totalH = trabajados.reduce((a, d) => a + (d.e - d.s), 0);
  const cierres = trabajados.filter((d) => d.e > 24).length;
  const today = days.find((d) => d.isToday) || null;

  const acc = {};
  days.forEach((d) => {
    if (!d.on) return;
    d.crewRows.forEach((m) => {
      if (m.juntos <= 0) return;
      if (!acc[m.n]) acc[m.n] = { n: m.n, h: 0, veces: 0 };
      acc[m.n].h += m.juntos;
      acc[m.n].veces += 1;
    });
  });
  const rankRaw = Object.values(acc).sort((a, b) => b.h - a.h).slice(0, 5);
  const topH = rankRaw.length ? rankRaw[0].h : 1;
  const crew = rankRaw.map((r) => ({
    n: r.n, dot: colorPara(r.n), barBg: colorPara(r.n),
    meta: `${duracionTxt(r.h)} · ${r.veces} ${r.veces === 1 ? "turno" : "turnos"}`,
    w: `${Math.round((r.h / topH) * 100)}%`,
  }));

  return {
    days,
    workDays: days.filter((d) => d.on),
    today,
    todayMates: today ? listaConY(today.crewRows.map((r) => primerNombre(r.n))) : "",
    weekTotal: duracionTxt(totalH),
    totalH,
    stats: [
      { n: trabajados.length, l: "TURNOS" },
      { n: 7 - trabajados.length, l: "LIBRES" },
      { n: duracionTxt(totalH), l: "EN EL LOCAL" },
      { n: cierres, l: "CIERRES" },
    ],
    crew,
    topMateName: rankRaw.length ? rankRaw[0].n : "",
    topMateMeta: rankRaw.length ? `${duracionTxt(rankRaw[0].h)} juntos en ${rankRaw[0].veces} ${rankRaw[0].veces === 1 ? "turno" : "turnos"}` : "",
    hourMarks: [8, 12, 16, 20, 24].map((h) => ({ label: fmtHora(h), top: pct(h - EJE_INICIO) })),
  };
}

// Plain-text summary for sharing (Web Share API / clipboard).
export function textoParaCompartir(vista, nombre, tienda, periodo) {
  const lineas = vista.days.map((d) => {
    if (!d.on) return `${d.short}  ·  libre`;
    const con = d.crewRows.length ? ` · con ${listaConY(d.crewRows.map((r) => primerNombre(r.n)))}` : "";
    return `${d.short} ${d.num}  ·  ${d.startLabel}–${d.endLabel}${con}`;
  });
  return [
    `💛 La semana de ${nombre} en ${tienda}`,
    periodo || "",
    "",
    ...lineas,
    "",
    `Total: ${vista.weekTotal} en el local`,
  ].filter(Boolean).join("\n");
}
