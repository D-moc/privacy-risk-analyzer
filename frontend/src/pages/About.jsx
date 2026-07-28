import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function About() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="ml-0 lg:ml-72">

        {/* Fixed Navbar */}
        <Navbar />

        {/* Content */}
        <main className="pt-28 px-6 md:px-8 pb-8">

          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h1 className="mt-5 text-5xl font-bold text-slate-900">
                A privacy policy analyzer that cross-checks itself
              </h1>

              <p className="mt-5 text-lg text-slate-600 max-w-8xl leading-relaxed">
                PrivacyLens turns dense privacy policies into a risk score
                and plain-English findings — using a mix of human-reviewed
                data, two purpose-trained machine learning models, and AI,
                so no single source has the final say.
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4">
                  <span className="text-xl">🤝</span>
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                  Human-reviewed first, AI second
                </h3>

                <p className="mt-3 text-slate-600">
                  Every scan checks ToS;DR's community-reviewed database
                  first. Only when a site isn't covered there does AI (Groq)
                  step in to generate findings from scratch.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                  <span className="text-xl">🧠</span>
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                  Two trained models, not just prompts
                </h3>

                <p className="mt-3 text-slate-600">
                  A topic-detection model (trained on 115 real, industry-diverse
                  policies) and a severity model (trained on ToS;DR's own
                  ratings) cross-check every AI-generated finding and confirm
                  whether a protection is actually granted — not just mentioned.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm md:col-span-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                  <span className="text-xl">🛡️</span>
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                  Manipulative design detection
                </h3>

                <p className="mt-3 text-slate-600">
                  Flags dark patterns — vague data-sharing language, forced
                  consent, and other manipulative wording — as critical
                  findings on their own, not buried in the fine print.
                </p>
              </motion.div>

            </div>

            {/* How a scan actually works */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-10 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-slate-900">
                Finds the real policy on its own
              </h2>

              <p className="mt-4 text-slate-600 leading-relaxed">
                Paste a homepage or a company's domain — not just the exact
                privacy policy page — and PrivacyLens automatically discovers
                and follows the real privacy policy, terms, or cookie policy
                link itself, whether you're scanning from this website or the
                Chrome extension. You never have to go hunting for the right
                sub-page.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-8">

                <div className="bg-slate-50 rounded-2xl p-5">
                  <h3 className="font-semibold text-slate-900">
                    What every scan checks
                  </h3>

                  <ul className="mt-4 space-y-3 text-slate-600">
                    <li>✓ Data collection & sharing practices</li>
                    <li>✓ Retention, deletion, and opt-out rights</li>
                    <li>✓ International data transfer disclosure</li>
                    <li>✓ Manipulative "dark pattern" wording</li>
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5">
                  <h3 className="font-semibold text-slate-900">
                    Beyond a single scan
                  </h3>

                  <ul className="mt-4 space-y-3 text-slate-600">
                    <li>✓ Data Exposure Ledger tracks who holds what</li>
                    <li>✓ History keeps every past scan searchable</li>
                    <li>✓ Compare two policies side by side</li>
                    <li>✓ Chrome extension scans as you browse</li>
                  </ul>
                </div>

              </div>
            </motion.div>

            {/* Mission Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-8 text-white"
            >
              <h2 className="text-3xl font-bold">
                Our Mission
              </h2>

              <p className="mt-4 text-cyan-50 leading-relaxed max-w-4xl">
                Privacy policies should be transparent and understandable.
                PrivacyLens combines human-reviewed data, trained models, and
                AI — each cross-checking the others — to simplify legal
                language and give you a clear, trustworthy read on how your
                data is actually handled.
              </p>
            </motion.div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default About;
