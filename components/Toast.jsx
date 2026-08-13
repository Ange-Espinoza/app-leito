"use client";

export default function Toast({ mensaje }) {
  if (!mensaje) return null;
  return <div className="al-toast">{mensaje}</div>;
}
