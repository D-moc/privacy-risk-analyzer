import { motion } from "framer-motion";
import { FaLinkedin, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Team() {
  return (
    <>
      <Sidebar />

      <div className="ml-0 lg:ml-72">
        <Navbar />

        <main className="pt-24 px-4 md:px-6 lg:px-8 pb-8 min-h-screen bg-slate-50">

          {/* Header */}

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Meet Our Team
            </h1>

            <p className="mt-4 text-slate-500 text-lg">
              The passionate team building PrivacyLens to make
              privacy policies understandable for everyone.
            </p>
          </div>

          {/* Team Grid */}

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

            <TeamCard
              image="/TeamPhotos/dinesh.png"
              name="Dinesh Bishokarma"
              role="Frontend Developer"
              desc="Focused on building modern user experiences, responsive interfaces, and intuitive workflows."
              linkedin="https://linkedin.com/in/your-linkedin"
              instagram="https://instagram.com/your-instagram"
              twitter="https://x.com/your-twitter"
            />

            <TeamCard
              image="/TeamPhotos/dinesh.png"
              name="Team Member"
              role="Backend Developer"
              desc="Designs APIs, database architecture, and ensures seamless backend integration."
              linkedin="https://linkedin.com"
              instagram="https://instagram.com"
              twitter="https://x.com"
            />

            <TeamCard
              image="/TeamPhotos/dinesh.png"
              name="Team Member"
              role="AI Engineer"
              desc="Works on NLP models, risk detection systems, and AI-powered policy analysis."
              linkedin="https://linkedin.com"
              instagram="https://instagram.com"
              twitter="https://x.com"
            />

          </div>

        </main>
      </div>
    </>
  );
}

function TeamCard({
  image,
  name,
  role,
  desc,
  linkedin,
  instagram,
  twitter,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="
        bg-white
        rounded-3xl
        p-8
        border
        border-slate-200
        shadow-sm
        hover:shadow-xl
        transition-all
        text-center
      "
    >
      {/* Profile Image */}

      <img
        src={image}
        alt={name}
        className="
          w-32
          h-32
          rounded-full
          object-cover
          mx-auto
          border-4
          border-cyan-100
          shadow-md
        "
      />

      {/* Name */}

      <h3 className="mt-5 text-xl font-bold text-slate-900">
        {name}
      </h3>

      {/* Role */}

      <p className="mt-1 text-cyan-600 font-medium">
        {role}
      </p>

      {/* Description */}

      <p className="mt-4 text-slate-500 text-sm leading-relaxed">
        {desc}
      </p>

      {/* Socials */}

      <div className="mt-6 flex justify-center gap-3">

        <a
          href={linkedin}
          target="_blank"
          rel="noreferrer"
          className="
            w-10
            h-10
            rounded-xl
            bg-blue-50
            text-blue-600
            flex
            items-center
            justify-center
            hover:scale-110
            transition
          "
        >
          <FaLinkedin size={18} />
        </a>

        <a
          href={instagram}
          target="_blank"
          rel="noreferrer"
          className="
            w-10
            h-10
            rounded-xl
            bg-pink-50
            text-pink-600
            flex
            items-center
            justify-center
            hover:scale-110
            transition
          "
        >
          <FaInstagram size={18} />
        </a>

        <a
          href={twitter}
          target="_blank"
          rel="noreferrer"
          className="
            w-10
            h-10
            rounded-xl
            bg-slate-100
            text-slate-700
            flex
            items-center
            justify-center
            hover:scale-110
            transition
          "
        >
          <FaXTwitter size={18} />
        </a>

      </div>

    </motion.div>
  );
}

export default Team;