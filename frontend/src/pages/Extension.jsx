import { motion } from "framer-motion";
import {
  Download,
  ShieldCheck,
  Search,
  Sparkles,
  Zap,
  MessageCircle,
  Fingerprint,
  ScrollText,
  ChevronRight,
  Compass,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Privacy Score",
    desc: "A single 0-100 score for any site, computed from a hybrid of ToS;DR's human-reviewed database and AI analysis — never just an AI guess alone.",
  },
  {
    icon: Search,
    title: "Key Clues",
    desc: "Only the findings that actually matter to you, in plain English — no legal jargon, no wall of text, ranked by severity.",
  },
  {
    icon: Fingerprint,
    title: "Data Practices",
    desc: "A clear, research-backed breakdown of what's collected, shared, or unmentioned across contact info, location, cookies, and more.",
  },
  {
    icon: Zap,
    title: "Auto-Scan",
    desc: "Turn it on and every site gets analyzed the moment it loads — a result card appears right on the page, no clicking required.",
  },
  {
    icon: Compass,
    title: "Finds the real policy on its own",
    desc: "On a homepage or the wrong page? The extension automatically finds and follows the site's real privacy policy, terms, or cookie policy link — you never have to hunt for the right page yourself.",
  },
  {
    icon: MessageCircle,
    title: "Ask AI",
    desc: "Have a specific question about a policy? Ask it directly and get a plain-language answer grounded in that exact policy.",
  },
  {
    icon: Sparkles,
    title: "Synced History",
    desc: "Sign in once and every scan you run — from the extension or the website — shows up in your account's history automatically.",
  },
  {
    icon: ScrollText,
    title: "Data Exposure Ledger",
    desc: "A running record of exactly which companies hold which category of your data — contact info, location, financial, and more — built automatically as you scan.",
  },
];

const STEPS = [
  {
    title: "Download the extension",
    desc: "Click the download button above to get privacylens-extension.zip.",
  },
  {
    title: "Extract the ZIP file",
    desc: "Unzip it anywhere on your computer — you'll load this folder directly.",
  },
  {
    title: "Open chrome://extensions",
    desc: "Type this into your Chrome address bar and press Enter.",
  },
  {
    title: "Turn on Developer mode",
    desc: "Toggle it in the top-right corner of that page.",
  },
  {
    title: "Click \"Load unpacked\"",
    desc: "Select the folder you extracted in step 2.",
  },
  {
    title: "You're set",
    desc: "Pin the PrivacyLens icon to your toolbar and visit any site to try it.",
  },
];

function Extension() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 lg:ml-72">
        <Navbar />

        <main className="pt-28 px-6 md:px-8 pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-100 text-sm font-medium">
                <ShieldCheck size={14} />
                Available now
              </span>

              <h1 className="mt-5 text-5xl font-bold text-slate-900">
                PrivacyLens Browser Extension
              </h1>

              <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
                Analyze any site's privacy policy right from your browser — real-time
                risk scores, plain-English findings, and a data practices breakdown,
                synced with your account here on the website.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href={`${import.meta.env.VITE_API_URL}/api/extension/download`}
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:opacity-90 transition"
                >
                  <Download size={18} />
                  Download Extension
                </a>
                <a
                  href="#install-steps"
                  className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  How to install
                  <ChevronRight size={16} />
                </a>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Not yet on the Chrome Web Store — install it directly in a few clicks below.
              </p>
            </motion.div>

            {/* Features */}
            <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <f.icon size={22} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Install steps */}
            <motion.div
              id="install-steps"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="mt-20 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-slate-900 text-center">
                Install in under a minute
              </h2>
              <p className="mt-3 text-slate-600 text-center max-w-xl mx-auto">
                No Chrome Web Store review needed — you're loading it directly,
                the same way developers test their own extensions.
              </p>

              <div className="mt-10 grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                {STEPS.map((step, i) => (
                  <div
                    key={step.title}
                    className="flex gap-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
                  >
                    <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 text-white font-bold flex items-center justify-center text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{step.title}</h4>
                      <p className="mt-1 text-sm text-slate-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Extension;
