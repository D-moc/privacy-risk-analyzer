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
                AI-Powered Privacy Policy Analyzer
              </h1>

              <p className="mt-5 text-lg text-slate-600 max-w-8xl leading-relaxed">
                PrivacyLens helps users understand privacy policies
                instantly by transforming complex legal documents into
                simple, actionable insights using AI.
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4">
                  <span className="text-xl">🤖</span>
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                  AI Analysis
                </h3>

                <p className="mt-3 text-slate-600">
                  Automatically scans privacy policies and identifies
                  important clauses, hidden risks, and critical user rights.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                  <span className="text-xl">🛡️</span>
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                  Risk Detection
                </h3>

                <p className="mt-3 text-slate-600">
                  Highlights potential privacy concerns such as
                  excessive tracking, third-party sharing, and
                  data retention issues.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                  <span className="text-xl">📄</span>
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                  Simple Summaries
                </h3>

                <p className="mt-3 text-slate-600">
                  Converts legal jargon into easy-to-understand
                  summaries so users can make informed decisions.
                </p>
              </motion.div>

            </div>

            {/* Privacy Policy Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-10 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-slate-900">
                What is a Privacy Policy?
              </h2>

              <p className="mt-4 text-slate-600 leading-relaxed">
                A privacy policy is a legal document that explains how an
                organization collects, stores, uses, and shares personal
                information. Most users skip reading these policies because
                they are lengthy and difficult to understand.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-8">

                <div className="bg-slate-50 rounded-2xl p-5">
                  <h3 className="font-semibold text-slate-900">
                    Common Information Covered
                  </h3>

                  <ul className="mt-4 space-y-3 text-slate-600">
                    <li>✓ Data collection practices</li>
                    <li>✓ Third-party sharing policies</li>
                    <li>✓ Cookie and tracking technologies</li>
                    <li>✓ Data retention periods</li>
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5">
                  <h3 className="font-semibold text-slate-900">
                    Why It Matters
                  </h3>

                  <ul className="mt-4 space-y-3 text-slate-600">
                    <li>✓ Protect personal information</li>
                    <li>✓ Understand data usage</li>
                    <li>✓ Identify privacy risks</li>
                    <li>✓ Make informed choices</li>
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
                PrivacyLens empowers users by leveraging AI to simplify
                legal language, identify risks, and provide clear insights
                into how their data is handled online.
              </p>
            </motion.div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default About;