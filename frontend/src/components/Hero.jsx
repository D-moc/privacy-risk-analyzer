import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  FileText,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function Hero({ stats }) {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white p-10 shadow-sm">
      {/* Background */}

      <div className="absolute inset-0">
        <div
          className="
            absolute
            -left-20
            top-0
            h-full
            w-80
          "
        />

        <div
          className="
            absolute
            -right-20
            bottom-0
            h-full
            w-80
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(to_right,#e5e7eb15_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb15_1px,transparent_1px)]
            bg-size-[40px_40px]
          "
        />
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="
  relative
  z-10
  flex
  flex-col
  lg:flex-row
  items-center
  justify-between
  gap-10
"
      >
        <div className="flex-1">
          {/* Badge */}

          <div
            className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-cyan-200
            bg-cyan-50
            px-4
            py-2
            text-sm
            font-medium
            text-cyan-700
          "
          >
            <Sparkles size={16} />
            Privacy Intelligence Center
          </div>

          {/* Heading */}

          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-tight text-slate-900">
            Monitor, Analyze &
            <br />
            Strengthen Your
            <br />
            Digital Privacy
          </h1>

          {/* Subtitle */}

          <p className="mt-5 max-w-xl text-lg text-slate-500">
            Run privacy audits, identify threats, generate reports and receive
            AI powered recommendations to improve your online security posture.
          </p>

          {/* Status Pills */}

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
              {stats.threats_found === 0
                ? "✓ System Secure"
                : "⚠ Threats Detected"}
            </div>

            <div className="px-3 py-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 text-sm font-medium">
              {stats.total_scans} Scans Completed
            </div>

            <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium">
              AI Monitoring Active
            </div>
          </div>

          {/* Actions */}

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="
              h-12
              px-6
              rounded-xl
              bg-linear-to-r
              from-cyan-500
              to-blue-600
              text-white
              font-semibold
              flex
              items-center
              gap-2
              shadow-lg
              shadow-cyan-500/20
              hover:scale-[1.02]
              transition
            "
            >
              <Search size={18} />
              Run Privacy Scan
            </button>

            <button
              onClick={() => navigate("/history")}
              className="
              h-12
              px-6
              rounded-xl
              border
              border-slate-300
              bg-white
              text-slate-700
              font-medium
              flex
              items-center
              gap-2
              hover:bg-slate-50
              transition
            "
            >
              <FileText size={18} />
              View Reports
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <motion.div
          className="
    hidden
    lg:flex
    flex-1
    justify-center
    items-center
  "
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            width="450"
            height="450"
            viewBox="0 0 450 450"
            className="drop-shadow-xl"
          >
            {/* Connections */}

            <line
              x1="225"
              y1="225"
              x2="100"
              y2="100"
              stroke="#06b6d4"
              strokeWidth="3"
              opacity="0.4"
            />

            <line
              x1="225"
              y1="225"
              x2="350"
              y2="100"
              stroke="#3b82f6"
              strokeWidth="3"
              opacity="0.4"
            />

            <line
              x1="225"
              y1="225"
              x2="100"
              y2="350"
              stroke="#06b6d4"
              strokeWidth="3"
              opacity="0.4"
            />

            <line
              x1="225"
              y1="225"
              x2="350"
              y2="350"
              stroke="#3b82f6"
              strokeWidth="3"
              opacity="0.4"
            />

            {/* Center */}

            <circle
              cx="225"
              cy="225"
              r="75"
              fill="#ffffff"
              stroke="#06b6d4"
              strokeWidth="4"
            />

            <text
              x="225"
              y="215"
              textAnchor="middle"
              fill="#0f172a"
              fontSize="22"
              fontWeight="bold"
            >
              Privacy
            </text>

            <text
              x="225"
              y="245"
              textAnchor="middle"
              fill="#0891b2"
              fontSize="14"
            >
              AI Engine
            </text>

            {/* Policies */}

            <circle
              cx="100"
              cy="100"
              r="50"
              fill="#ecfeff"
              stroke="#06b6d4"
              strokeWidth="3"
            />

            <text
              x="100"
              y="105"
              textAnchor="middle"
              fill="#334155"
              fontSize="14"
            >
              Policies
            </text>

            {/* Analysis */}

            <circle
              cx="350"
              cy="100"
              r="50"
              fill="#eff6ff"
              stroke="#3b82f6"
              strokeWidth="3"
            />

            <text
              x="350"
              y="105"
              textAnchor="middle"
              fill="#334155"
              fontSize="14"
            >
              Analysis
            </text>

            {/* Reports */}

            <circle
              cx="100"
              cy="350"
              r="50"
              fill="#ecfeff"
              stroke="#06b6d4"
              strokeWidth="3"
            />

            <text
              x="100"
              y="355"
              textAnchor="middle"
              fill="#334155"
              fontSize="14"
            >
              Reports
            </text>

            {/* Risk */}

            <circle
              cx="350"
              cy="350"
              r="50"
              fill="#eff6ff"
              stroke="#3b82f6"
              strokeWidth="3"
            />

            <text
              x="350"
              y="355"
              textAnchor="middle"
              fill="#334155"
              fontSize="14"
            >
              Risk
            </text>
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;
