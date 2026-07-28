import { motion } from "framer-motion";
import { Search, Settings, Sparkles } from "lucide-react";

export default function Header({ onOpenSettings }) {
  return (
    <div className="relative overflow-hidden px-4 pt-4 pb-3 shrink-0">
      <div
        className="absolute inset-0 -z-10 opacity-90"
        style={{
          background:
            "radial-gradient(120% 100% at 0% 0%, #6366F1 0%, transparent 55%), radial-gradient(120% 100% at 100% 0%, #8B5CF6 0%, transparent 55%), linear-gradient(180deg, #111827 0%, #0B0F19 100%)",
        }}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15"
          >
            <Search size={17} className="text-white" strokeWidth={2.25} />
          </motion.div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[13.5px] font-semibold tracking-tight text-text-primary">
                PrivacyLens
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-1.5 py-[1px] text-[9px] font-semibold text-accent-violet ring-1 ring-white/10">
                <Sparkles size={9} />
                AI
              </span>
            </div>
            <p className="text-[10px] text-text-secondary">Privacy Investigator</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.06, rotate: 20 }}
          whileTap={{ scale: 0.92 }}
          onClick={onOpenSettings}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-text-secondary hover:bg-white/14 hover:text-text-primary transition-colors"
          aria-label="Settings"
        >
          <Settings size={15} />
        </motion.button>
      </div>
    </div>
  );
}
