import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const CIRCUMFERENCE = 2 * Math.PI * 52;

// Same convention as the website's RiskMeter.jsx — one number, higher
// means riskier, shown consistently everywhere (popup, in-page overlay,
// toolbar badge, website). Previously this card inverted the score into
// a "privacy score" (100 - riskScore) while the toolbar badge and the
// website both showed the raw score directly — the same scan could show
// two different numbers depending on where you looked.
function bandFor(score) {
  if (score >= 70) return { label: "High Risk", color: "#EF4444" };
  if (score >= 40) return { label: "Moderate Risk", color: "#F59E0B" };
  return { label: "Low Risk", color: "#22C55E" };
}

export default function PrivacyScoreCard({ riskScore }) {
  const score = Math.max(0, Math.min(100, riskScore));
  const { label, color } = bandFor(score);
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const duration = 700;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(eased * score));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [score]);

  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-4 mb-3 flex items-center gap-4 rounded-3xl glass px-5 py-4"
    >
      <div className="relative h-[92px] w-[92px] shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(148,163,184,0.14)" strokeWidth="9" />
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[26px] font-bold leading-none text-text-primary">{display}</span>
          <span className="text-[9px] text-text-secondary">% Risk</span>
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-[10.5px] uppercase tracking-wide text-text-secondary">
          Overall Risk Score
        </p>
        <p className="text-[17px] font-semibold" style={{ color }}>
          {label}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-text-secondary">
          {score >= 70
            ? "This policy raises serious privacy concerns."
            : score >= 40
            ? "Some practices here are worth a closer look."
            : "This policy looks respectful of your privacy."}
        </p>
      </div>
    </motion.div>
  );
}
