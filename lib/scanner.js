import { DIAS, leerTurno, normalizar } from "./schedule";

async function preguntarProxy(base64, instruccion) {
  const r = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64, instruccion }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data.error) throw new Error(data.error || `La lectura falló (código ${r.status}).`);
  return data.texto || "";
}

// Step 1: find the person's row and their 7-day turns.
export async function buscarPersona(base64, nombreBuscado) {
  const instruccion = `Esta imagen es una planilla de horarios de trabajo. Cada fila es una persona (RUT, NOMBRE Y APELLIDO, CARGO, HORAS) seguida de 7 columnas de días (Lunes a Domingo), cada una con el turno de esa persona ese día o la palabra LIBRE.

Busca la fila cuya columna NOMBRE Y APELLIDO contenga "${nombreBuscado.trim()}" (ignora mayúsculas y tildes).

Responde SOLO con un objeto JSON válido. Sin markdown, sin backticks, sin texto antes ni después:
{
  "encontrado": true,
  "periodo": "el rango de fechas del título de la planilla",
  "nombre": "el nombre completo tal cual aparece en la fila",
  "cargo": "el cargo de esa fila",
  "horas": "el número de la columna HORAS",
  "dias": [
    {"dia": "Lunes", "fecha": "10-Aug", "turno": "12:30-21:00"}
  ],
  "candidatos": []
}

Reglas estrictas:
- "dias" debe traer exactamente 7 objetos, en orden Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo.
- "fecha" es la que aparece en el encabezado de esa columna.
- Si el día está libre, pon "turno": "LIBRE".
- Copia las horas exactamente como se ven, en formato HH:MM-HH:MM. Revisa dos veces que estás leyendo la fila correcta y no una vecina.
- No incluyas el RUT en la respuesta.
- Si más de una persona coincide con el nombre, usa la primera y pon los nombres completos de las otras en "candidatos".
- Si no encuentras a nadie, responde {"encontrado": false, "candidatos": [nombres parecidos]}.`;

  const texto = await preguntarProxy(base64, instruccion);
  const limpio = texto.replace(/```json/gi, "").replace(/```/g, "").trim();
  const a = limpio.indexOf("{"), b = limpio.lastIndexOf("}");
  if (a === -1 || b === -1) throw new Error("La respuesta no vino en el formato esperado. Vuelve a intentarlo.");
  return JSON.parse(limpio.slice(a, b + 1));
}

// Step 2: for one worked day, read who else has a shift that column.
export async function leerEquipoDia(base64, ficha, indiceDia) {
  const d = ficha.dias[indiceDia];
  const instruccion = `Esta imagen es una planilla de horarios de trabajo. Las primeras columnas son RUT, NOMBRE Y APELLIDO, CARGO y HORAS, y después vienen 7 columnas de días.

Mira SOLO la columna del día "${d.dia || DIAS[indiceDia]}"${d.fecha ? ` (encabezado "${d.fecha}")` : ""}. Recórrela de arriba abajo y, por cada fila que tenga un turno con horas, escribe una línea con este formato exacto:

nombre de pila y primer apellido|turno|cargo

Ejemplo:
Catalina Cerda|09:00-17:30|MAESTRO
Patricio Garabito|08:00-16:30|LIDER

Reglas estrictas:
- Una línea por persona. Sin numerar, sin viñetas, sin markdown, sin encabezado ni comentarios.
- Salta las filas que digan LIBRE en esa columna.
- No incluyas nunca el RUT.
- Copia el turno exactamente como se ve, en formato HH:MM-HH:MM.
- Cuida de no correrte de fila: el nombre y el turno tienen que ser de la misma línea de la tabla.`;

  const texto = await preguntarProxy(base64, instruccion);
  const yo = normalizar(ficha.nombre);
  return texto.split("\n")
    .map((l) => l.trim())
    .filter((l) => l.includes("|"))
    .map((l) => {
      const p = l.split("|").map((x) => x.trim());
      return { nombre: p[0], turno: p[1], cargo: (p[2] || "").toUpperCase() };
    })
    .filter((p) => {
      const t = leerTurno(p.turno);
      return p.nombre && p.turno && t && t.ok;
    })
    .filter((p) => {
      const partes = normalizar(p.nombre).split(/\s+/).filter(Boolean);
      return !(partes.length && partes.every((x) => yo.includes(x)));
    })
    .map((p) => {
      const t = leerTurno(p.turno);
      return { nombre: p.nombre, cargo: p.cargo, s: t.s, e: t.e };
    });
}

// Converts the raw "ficha" from buscarPersona into the week[] shape the
// render layer (lib/weekModel.js) expects.
export function fichaAWeek(ficha) {
  return ficha.dias.map((d) => {
    const t = leerTurno(d.turno);
    if (t && t.ok) {
      return { fecha: d.fecha, off: false, s: t.s, e: t.e, matesEstado: "cargando" };
    }
    return { fecha: d.fecha, off: true, turnoBruto: t ? t.bruto : d.turno, matesEstado: "listo" };
  });
}
