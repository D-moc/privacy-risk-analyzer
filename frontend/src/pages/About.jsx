import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

function About() {
  return (
    <div className="bg-[#f8f6f2] min-h-screen text-gray-800">

      <Navbar />

      {/* HERO */}
      <div className="pt-32 text-center px-6 max-w-4xl mx-auto">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-gray-900"
        >
          About PrivacyAI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-gray-600 text-lg"
        >
          We simplify complex privacy policies into clear, understandable insights
          using AI so users can make informed decisions.
        </motion.p>

      </div>

      {/* WHAT IS PRIVACY POLICY */}
      <div className="mt-20 px-6 md:px-16 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900">
            What is a Privacy Policy?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A privacy policy is a legal document that explains how a company
            collects, uses, stores, and shares your personal data.
          </p>

          <p className="mt-3 text-gray-600">
            Most users don’t read it because it’s long and complex.
            That’s where our AI helps.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-xl shadow border"
        >
          <ul className="space-y-3 text-gray-700">
            <li>✔ Data collection details</li>
            <li>✔ Third-party sharing</li>
            <li>✔ Cookie usage</li>
            <li>✔ Data retention rules</li>
          </ul>
        </motion.div>

      </div>

      {/* WHY THIS PROJECT */}
      <div className="mt-24 px-6 md:px-16 max-w-5xl mx-auto text-center">

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-gray-900"
        >
          Why We Built This
        </motion.h2>

        <p className="mt-6 text-gray-600 leading-relaxed">
          In today’s digital world, users are forced to accept privacy policies
          without understanding them. These documents are often lengthy and
          written in legal language.
        </p>

        <p className="mt-3 text-gray-600">
          PrivacyAI solves this by analyzing policies and presenting them
          in simple, easy-to-understand language.
        </p>

      </div>

      {/* FEATURES */}
      <div className="mt-24 px-6 md:px-16 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

        <FeatureCard
          title="AI Analysis"
          desc="Automatically reads and analyzes policies using NLP models."
        />

        <FeatureCard
          title="Risk Score"
          desc="Gives a clear score (0–100) to show how safe a policy is."
        />

        <FeatureCard
          title="Simple Summary"
          desc="Converts complex text into easy, readable explanations."
        />

      </div>

      {/* SPACING BOTTOM */}
      <div className="h-20"></div>

    </div>
  );
}

/* FEATURE CARD */
function FeatureCard({ title, desc }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition"
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-3 text-gray-600">{desc}</p>
    </motion.div>
  );
}

export default About;