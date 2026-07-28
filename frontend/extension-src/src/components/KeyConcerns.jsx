import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Bot, Users } from "lucide-react";
import RecommendationCard from "./RecommendationCard";

const IMPORTANT = new Set(["critical", "severe"]);

function FindingGroup({ title, icon: Icon, findings, emptyMessage }) {
  const [showAll, setShowAll] = useState(false);

  const important = findings.filter((f) => IMPORTANT.has(f.severity));
  const rest = findings.filter((f) => !IMPORTANT.has(f.severity));
  const visible = showAll ? [...important, ...rest] : important;

  return (
    <div className="mb-3">
      <p className="mb-2 flex items-center gap-1.5 px-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-secondary">
        <Icon size={11} />
        {title}
      </p>

      {visible.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-success/25 bg-success/10 px-3 py-2.5">
          <CheckCircle2 size={15} className="text-success" />
          <p className="text-[11.5px] font-medium text-text-primary">{emptyMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {visible.map((f, i) => (
            <RecommendationCard key={`${f.label}-${i}`} finding={f} index={i} />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 w-full rounded-lg py-1.5 text-[10.5px] font-semibold text-accent-blue hover:bg-white/5"
        >
          {showAll ? "Show fewer" : `Show ${rest.length} more minor point${rest.length > 1 ? "s" : ""}`}
        </motion.button>
      )}
    </div>
  );
}

export default function KeyConcerns({ findings, source }) {
  const all = findings || [];
  const detectorFindings = all.filter((f) => f.origin === "detector");
  const aiFindings = all.filter((f) => f.origin === "groq" || f.origin === "tosdr");

  const isTosdr = source === "tosdr";

  return (
    <div className="mx-4 mb-3">
      <FindingGroup
        title="Our Detection"
        icon={ShieldCheck}
        findings={detectorFindings}
        emptyMessage="No concerns found by our own checks"
      />

      <FindingGroup
        title={isTosdr ? "ToS;DR Community Findings" : "Groq AI Suggestions"}
        icon={isTosdr ? Users : Bot}
        findings={aiFindings}
        emptyMessage={
          isTosdr ? "No additional community-reviewed points" : "Groq found nothing further to flag"
        }
      />
    </div>
  );
}
