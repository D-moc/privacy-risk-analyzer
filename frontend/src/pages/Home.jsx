import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="bg-[#f8f6f2] min-h-screen flex items-center justify-center px-6"
    >
      <div className="text-center max-w-4xl">

        {/* MAIN HEADING */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold leading-tight text-gray-900"
        >
          Understand Privacy Policies
        </motion.h1>

        {/* SUB HEADING */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl text-blue-600 mt-4 font-semibold"
        >
          Before You Accept
        </motion.h2>

        {/* DESCRIPTION */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-gray-600 text-lg"
        >
          AI-powered analysis that simplifies privacy policies into clear,
          understandable insights so you can make informed decisions.
        </motion.p>

        {/* CTA BUTTON */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 flex justify-center"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl shadow-md hover:bg-blue-700 transition text-lg font-medium"
          >
            Get Started
          </button>
        </motion.div>

      </div>
    </section>
  );
}

export default Home;