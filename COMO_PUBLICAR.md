# Cómo dejar "App Leito" funcionando de verdad en el teléfono

No necesitas saber programación para esto — son dos pasos, ambos con formularios normales, como crear cualquier cuenta. Te los explico como si fuera la primera vez que haces algo así.

## Antes de empezar: qué es cada cosa

- **La app ya está construida** (todo lo que ves en las capturas: la semana, "Con quién te toca", el botón de mandar). Lo que falta es solo "prenderla" en internet para que Leito pueda abrirla desde su teléfono.
- **Para que lea la foto de verdad** (y no sea un dibujito simulado), la app necesita una llave que le permite pedirle a Gemini (la IA de Google) que mire la imagen. Esta llave usa el **plan gratis de Google** — no pide tarjeta de crédito, y el límite de uso gratis es muchísimo más de lo que vas a necesitar (una foto nueva por semana).
- **Para que la app tenga una dirección web** (algo como `app-leito.vercel.app` que Leito pueda abrir), la subimos a un servicio gratis llamado Vercel.

## Paso 1 — Consigue la llave de lectura (Google, gratis)

1. Entra a **aistudio.google.com/apikey** con tu cuenta de Google (la misma de Gmail, no necesitas crear una cuenta nueva).
2. Toca **"Create API key"** (crear llave). Te da una llave (empieza con `AI...`) — cópiala y guárdala en un lugar seguro por ahora, es como una contraseña, no la compartas.
3. Listo, no hay que agregar tarjeta ni pagar nada. Eso es todo.

## Paso 2 — Sube la app a Vercel (gratis)

1. Entra a **vercel.com** y crea una cuenta gratis.
2. Cuando te pregunte cómo quieres empezar, la forma más simple es conectar una cuenta de **GitHub** (si no tienes, te la crea el mismo Vercel al tiro, es gratis también) y subir esta carpeta (`app-leito`) como un proyecto nuevo ahí.
3. Vercel va a detectar solo que es un proyecto Next.js — no hay que tocar nada de configuración.
4. Antes de darle a "Deploy", busca la sección **"Environment Variables"** (variables de entorno) y agrega una:
   - Nombre: `GEMINI_API_KEY`
   - Valor: la llave que copiaste en el Paso 1
5. Dale a **Deploy**. En un par de minutos te va a dar un link (algo como `https://app-leito.vercel.app`).

## Paso 3 — Instálala en el teléfono de Leito

1. Abre ese link en Safari (si es iPhone) o Chrome (si es Android).
2. Toca el botón de compartir/opciones del navegador y elige **"Agregar a pantalla de inicio"**.
3. Le queda un ícono de Purín en la pantalla como cualquier app — así ya no tiene que abrir el navegador cada vez.

## Y si esto se siente como mucho...

No necesitas hacerlo sola. Si prefieres, puedes:

- Pedirle a este mismo Claude (o a otra sesión de Claude Code) que te ayude a hacer el Paso 2 en vivo, mirando la pantalla contigo.
- O simplemente decirme cuando tengas la cuenta de Vercel lista (y la llave de Google) y seguimos desde ahí — yo me encargo de que quede bien conectado.

## Una nota sobre el botón de mandar

El botón **"Mandarle mi semana a mi amorcito"** no manda nada por sí solo a un número de teléfono — abre el mismo menú de compartir que usa el teléfono para WhatsApp, Mensajes, etc., con la semana ya escrita y lista. Leito toca el botón, elige tu chat, y la manda. Así no necesitamos guardar tu número en ningún lado.

## Lo que la app todavía no hace

- El "widget de pantalla de bloqueo" que se veía en el diseño (pantalla 1d) no está incluido — eso requiere una app nativa de verdad (no una página web), es un proyecto bastante más grande. Por ahora la app funciona perfecto agregada a la pantalla de inicio.
- El recordatorio "1 h antes" se guarda, pero solo avisa dentro de la app mientras está abierta — no manda notificaciones si el teléfono está bloqueado. Avísame si en algún momento quieres que esto sea un recordatorio de verdad (notificación push) y lo agregamos.
