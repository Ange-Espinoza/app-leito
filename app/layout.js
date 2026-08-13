import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata = {
  title: "App Leito",
  description: "Su horario de la semana, bonitop 💛",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "App Leito" },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F4EDFF",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
