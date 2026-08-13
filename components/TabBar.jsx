"use client";

const TABS = [
  { key: "semana", label: "Semana", w: "18px", r: "6px" },
  { key: "crew", label: "Con quién", w: "24px", r: "999px" },
  { key: "scan", label: "Foto", w: "20px", r: "7px" },
  { key: "ajustes", label: null, w: "18px", r: "50%" },
];

export default function TabBar({ active, onChange, onScan, nombre }) {
  return (
    <nav className="al-tabbar">
      {TABS.map((t) => {
        const isActive = active === t.key;
        const fg = isActive ? "#5B4192" : "#C6BAD8";
        return (
          <button
            key={t.key}
            type="button"
            className="al-tab"
            style={{ background: isActive ? "#EADEFF" : "transparent" }}
            onClick={() => (t.key === "scan" ? onScan() : onChange(t.key))}
          >
            <span className="al-tab-icon" style={{ width: t.w, borderRadius: t.r, borderColor: fg }} />
            <span className="al-tab-label" style={{ color: fg }}>{t.key === "ajustes" ? nombre : t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
