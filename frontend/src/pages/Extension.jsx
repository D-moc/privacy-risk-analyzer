import { motion } from "framer-motion";
import {
  Puzzle,
  Shield,
  ScanSearch,
  Brain,
  Download,
  Clock,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Extension() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 lg:ml-72">
        <Navbar />

        <main className="pt-28 px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-100 text-sm font-medium">
                <Clock size={14} />
                Coming Soon
              </span>

              <h1 className="mt-5 text-5xl font-bold text-slate-900">
                PrivacyLens Browser Extension
              </h1>

              <p className="mt-5 text-lg text-slate-600 max-w-3xl mx-auto">
                Analyze privacy policies directly in your browser with
                AI-powered insights, privacy scores, and risk detection.
              </p>
            </motion.div>

            {/* Preview */}

            {/* Future Extension Preview */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="
    mt-12
    rounded-[32px]
    border
    border-slate-200
    bg-white
    overflow-hidden
    shadow-sm
  "
            >
              {/* Fake Browser Header */}

              <div className="h-14 border-b border-slate-200 px-5 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />

                <div
                  className="
        ml-4
        flex-1
        h-8
        rounded-lg
        bg-slate-100
        flex
        items-center
        px-4
        text-sm
        text-slate-500
      "
                >
                  privacy-policy-page.com
                </div>
              </div>

              {/* Extension Mockup */}

              <div className="grid lg:grid-cols-[1fr_320px] gap-0 h-[500px]">
                {/* Website Side */}

                <div className="border-r border-slate-200 p-8 bg-slate-50">
                  <div className="h-6 w-64 rounded bg-slate-300" />

                  <div className="mt-8 space-y-4">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-3 rounded bg-slate-200 ${
                          i % 3 === 0 ? "w-11/12" : "w-full"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="bg-white p-6">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo.jpg"
                      alt="PrivacyLens"
                      className="w-10 h-10 rounded-xl"
                    />

                    <div>
                      <h3 className="font-bold text-slate-900">PrivacyLens</h3>

                      <p className="text-xs text-slate-500">
                        AI Policy Analyzer
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-sm text-slate-500">Privacy Score</p>

                    <h2 className="text-4xl font-bold text-cyan-600">82%</h2>
                  </div>

                  <div className="mt-8 space-y-3">
                    <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                      Encryption Detected
                    </div>

                    <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                      Data Retention Clause
                    </div>

                    <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                      Third-Party Tracking
                    </div>
                  </div>

                  <button
                    disabled
                    className="
      mt-8
      w-full
      h-11
      rounded-xl
      bg-slate-100
      text-slate-400
      font-medium
    "
                  >
                    Analyze Policy
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
        {icon}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>

      <p className="mt-2 text-slate-600">{desc}</p>
    </div>
  );
}

export default Extension;
