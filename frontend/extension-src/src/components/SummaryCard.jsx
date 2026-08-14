import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function SummaryCard({ text, citation }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-4 mb-3 rounded-2xl px-3.5 py-3"
      style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(139,92,246,0.10))",
        border: "1px solid rgba(139,92,246,0.2)",
      }}
    >
      <div className="flex gap-2.5">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        >
          <Sparkles size={12} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[11.5px] leading-relaxed text-text-primary">{text}</p>
          {citation && (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-[9px] text-text-secondary/70 hover:text-text-secondary hover:underline"
            >
              {citation.text}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
