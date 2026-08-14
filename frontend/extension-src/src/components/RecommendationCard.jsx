import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";

const STYLE_BY_SEVERITY = {
  critical: { icon: XCircle, color: "#EF4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)" },
  severe: { icon: XCircle, color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
  moderate: { icon: AlertTriangle, color: "#F59E0B", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.22)" },
  good: { icon: CheckCircle2, color: "#22C55E", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.22)" },
};

export default function RecommendationCard({ finding, index }) {
  const style = STYLE_BY_SEVERITY[finding.severity] || STYLE_BY_SEVERITY.moderate;
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      whileHover={{ x: 2 }}
      className="flex items-start gap-2.5 rounded-xl px-3 py-2.5"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      <Icon size={15} className="mt-[1px] shrink-0" style={{ color: style.color }} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[11.5px] font-medium leading-snug text-text-primary">{finding.label}</p>
          {finding.verified && (
            <span
              title="Independently cross-checked by our trained model — it agrees with this severity"
              className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/8 px-1.5 py-0.5 text-[8.5px] font-semibold text-text-secondary"
            >
              <ShieldCheck size={9} />
              Verified
            </span>
          )}
        </div>
        {finding.detail && (
          <p className="mt-0.5 text-[10px] leading-snug text-text-secondary">{finding.detail}</p>
        )}
      </div>
    </motion.div>
  );
}
