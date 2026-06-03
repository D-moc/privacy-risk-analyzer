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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm"
            >

              <div className="aspect-video rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center">

                <Puzzle
                  size={80}
                  className="text-cyan-500"
                />

                <h3 className="mt-4 text-xl font-semibold text-slate-800">
                  Extension Preview
                </h3>

                <p className="mt-2 text-slate-500 text-center">
                  Add screenshots or demo images here once
                  the extension is developed.
                </p>

              </div>

            </motion.div>

            {/* Features */}

            <div className="grid md:grid-cols-3 gap-6 mt-10">

              <FeatureCard
                icon={<ScanSearch size={22} />}
                title="One-Click Analysis"
                desc="Scan privacy policies instantly from any website."
              />

              <FeatureCard
                icon={<Brain size={22} />}
                title="AI Summaries"
                desc="Convert complex legal language into simple explanations."
              />

              <FeatureCard
                icon={<Shield size={22} />}
                title="Risk Detection"
                desc="Identify tracking, data sharing, and privacy concerns."
              />

            </div>

            {/* Download Section */}

            <div className="mt-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-10 text-center text-white">

              <h2 className="text-3xl font-bold">
                Browser Extension Launching Soon
              </h2>

              <p className="mt-4 text-cyan-50 max-w-2xl mx-auto">
                We're currently building the PrivacyLens extension.
                Once released, you'll be able to analyze privacy
                policies without leaving the page.
              </p>

              <button
                disabled
                className="mt-8 px-6 py-3 rounded-xl bg-white/20 border border-white/30 cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                <Download size={18} />
                Download Extension (Coming Soon)
              </button>

            </div>

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

      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-slate-600">
        {desc}
      </p>
    </div>
  );
}

export default Extension;