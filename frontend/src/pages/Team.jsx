import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

function Team() {
  return (
    <div className="bg-[#f8f6f2] min-h-screen text-gray-800">

      <Navbar />

      {/* HEADER */}
      <div className="pt-32 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Meet Our Team
        </h1>
        <p className="mt-4 text-gray-600 max-w-xl mx-auto">
          The minds behind PrivacyAI — building smarter, safer digital experiences.
        </p>
      </div>

      {/* TEAM CARDS */}
      <div className="mt-16 grid md:grid-cols-3 gap-8 px-6 md:px-16 max-w-6xl mx-auto">

        <TeamCard
          name="Dinesh Bishokarma"
          role="Frontend Developer"
          desc="Focused on building clean UI and user-friendly experiences."
        />

        <TeamCard
          name="Team Member"
          role="Backend Developer"
          desc="Handles APIs, data processing, and system logic."
        />

        <TeamCard
          name="Team Member"
          role="AI Engineer"
          desc="Works on NLP models and AI-powered analysis."
        />

      </div>

    </div>
  );
}

/* TEAM CARD */
function TeamCard({ name, role, desc }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition text-center"
    >
      {/* PROFILE IMAGE */}
      <img
        src="https://via.placeholder.com/120"
        alt="profile"
        className="mx-auto rounded-full w-24 h-24 object-cover"
      />

      {/* NAME */}
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        {name}
      </h3>

      {/* ROLE */}
      <p className="text-blue-600 text-sm font-medium">
        {role}
      </p>

      {/* DESCRIPTION */}
      <p className="mt-3 text-gray-600 text-sm">
        {desc}
      </p>
    </motion.div>
  );
}

export default Team;