import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function AccordionSection({ icon: Icon, title, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-1.5 overflow-hidden rounded-2xl glass">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-[11.5px] font-medium text-text-primary">
          {Icon && <Icon size={13} className="text-text-secondary" />}
          {title}
          {typeof count === "number" && (
            <span className="rounded-full bg-white/8 px-1.5 py-[1px] text-[9px] font-semibold text-text-secondary">
              {count}
            </span>
          )}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-text-secondary" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
