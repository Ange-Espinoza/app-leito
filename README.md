# App Leito 💛

App para que Leito suba la foto de su horario del Pequeño César y le arme la semana solita — pantalla "Tu semana", "Con quién te toca", y un botón para mandarle la semana a su amorcito. Diseño hecho en Claude Design (ver `../App Leito.dc.html` para el mockup original); esta carpeta es la implementación real.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y pega tu GEMINI_API_KEY ahí (gratis, sin tarjeta: aistudio.google.com/apikey)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

- `app/page.js` — punto de entrada, renderiza `<AppLeito />`.
- `app/api/scan/route.js` — proxy server-side hacia la API de Gemini (la llave nunca llega al teléfono).
- `components/` — pantallas (Inicio, Scan, Semana, Crew, Ajustes, DaySheet) y estilos (`app-leito.css`).
- `lib/schedule.js`, `lib/scanner.js`, `lib/weekModel.js` — parseo de turnos, orquestación del escaneo real, y el modelo de datos que arma cada pantalla.
- `public/mascotas/` — las imágenes de Purín del diseño original.

## Publicarla de verdad

Ver [`COMO_PUBLICAR.md`](./COMO_PUBLICAR.md) — guía paso a paso sin dar por hecho que sabes programar.
