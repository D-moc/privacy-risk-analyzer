import { motion } from "framer-motion";
import {
  Database,
  MapPin,
  CreditCard,
  Activity,
  Fingerprint,
  Cookie,
  CheckCircle2,
  MinusCircle,
} from "lucide-react";

// Format follows what's actually proven at scale for this exact problem
// (Apple's App Privacy labels, Google Play's Data Safety section) rather
// than an invented percentage score: each data type gets one of three
// plain states instead of a 0-100 number.
const ICONS = {
  "Contact Info": Database,
  "Location": MapPin,
  "Financial Info": CreditCard,
  "Browsing & Usage Activity": Activity,
  "Device & Identifiers": Fingerprint,
  "Cookies & Tracking": Cookie,
};

const STATUS_META = {
  not_mentioned: { text: "Not mentioned", color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  collected: { text: "Collected", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  shared: { text: "Shared", color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
};

export default function DataPractices({ dataPractices }) {
  const dataTypes = dataPractices?.data_types || [];
  const protections = dataPractices?.protections || [];
  if (!dataTypes.length) return null;

  return (
    <div className="mx-4 mb-3">
      <p className="mb-2 px-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-secondary">
        Data Practices
      </p>

      <div className="flex flex-col gap-1.5">
        {dataTypes.map((item, i) => {
          const Icon = ICONS[item.label] || Database;
          const meta = STATUS_META[item.status] || STATUS_META.not_mentioned;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="flex items-center justify-between rounded-xl glass px-3 py-2"
            >
              <span className="flex items-center gap-2 text-[11.5px] font-medium text-text-primary">
                <Icon size={13} className="text-text-secondary" />
                {item.label}
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ color: meta.color, background: meta.bg }}
              >
                {meta.text}
              </span>
            </motion.div>
          );
        })}
      </div>

      {protections.length > 0 && (
        <div className="mt-3 flex flex-col gap-1">
          {protections.map((p) => (
            <div key={p.label} className="flex items-center gap-2 px-1 py-0.5">
              {p.present ? (
                <CheckCircle2 size={13} className="shrink-0 text-success" />
              ) : (
                <MinusCircle size={13} className="shrink-0 text-text-secondary/50" />
              )}
              <span className={`text-[11px] ${p.present ? "text-text-primary" : "text-text-secondary/70"}`}>
                {p.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
