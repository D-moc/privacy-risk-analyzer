import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

function Segmented({ options, value, onChange }) {
  return (
    <div className="flex gap-1 rounded-xl bg-white/6 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
            value === opt.value
              ? "bg-white/12 text-text-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPanel({ settings, updateSettings, auth, onClose }) {
  const [apiUrl, setApiUrl] = useState(settings.apiUrl);

  return (
    <motion.div
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-10 flex flex-col bg-bg-primary"
    >
      <div className="flex items-center justify-between px-4 py-3.5">
        <span className="text-[13px] font-semibold text-text-primary">Settings</span>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/8 text-text-secondary hover:bg-white/14"
        >
          <X size={13} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <p className="mb-2 mt-1 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
          Scanning
        </p>
        <Segmented
          options={[
            { value: true, label: "Auto-scan every visit" },
            { value: false, label: "On demand only" },
          ]}
          value={settings.autoScan}
          onChange={(autoScan) => updateSettings({ autoScan })}
        />
        <p className="mt-1.5 text-[10px] leading-snug text-text-secondary/80">
          {settings.autoScan
            ? "Scans automatically the moment any page loads, with a result card on the page itself. Clicking this icon always shows the latest scan too."
            : "Only scans when you click this icon — starts immediately, no extra button needed."}
        </p>

        <p className="mb-2 mt-5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
          Risk Sensitivity
        </p>
        <Segmented
          options={[
            { value: "relaxed", label: "Relaxed" },
            { value: "moderate", label: "Moderate" },
            { value: "strict", label: "Strict" },
          ]}
          value={settings.preference}
          onChange={(preference) => updateSettings({ preference })}
        />
        <p className="mt-1.5 text-[10px] leading-snug text-text-secondary/80">
          Strict flags more things as risky; relaxed is more lenient.
        </p>

        <p className="mb-2 mt-5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
          API Server (advanced)
        </p>
        <input
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          onBlur={() => updateSettings({ apiUrl: apiUrl.trim().replace(/\/$/, "") })}
          className="w-full rounded-lg bg-white/6 px-2.5 py-2 text-[11px] text-text-primary outline-none focus:ring-1 focus:ring-accent-indigo"
        />
        <p className="mt-1.5 text-[10px] leading-snug text-text-secondary/80">
          Only change this if you're running your own PrivacyLens backend.
        </p>

        <div className="mt-5 rounded-xl bg-white/5 px-3 py-2.5 text-center text-[10.5px] text-text-secondary">
          {auth ? `Signed in as ${auth.email || "unknown"}` : "Not signed in — sign in on the PrivacyLens website to sync."}
        </div>
      </div>
    </motion.div>
  );
}
