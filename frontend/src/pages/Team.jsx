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

        <main className="pt-28 px-6 md:px-8 pb-8">

          {/* Header */}

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-slate-900">
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
              role="Backend Developer"
              desc="Develops backend services, APIs, database integration, and core application logic powering PrivacyLens."
              linkedin="https://www.linkedin.com/in/imdineshbk/"
              instagram="https://www.instagram.com/__.dinesh.bk/"
              twitter="https://x.com/imdineshbk"
            />

            <TeamCard
              image="/TeamPhotos/dhaarmi.jpg"
              name="Dhaarmi Gala"
              role="AI Engineer"
              desc="Builds AI-powered privacy analysis systems, risk detection models, and intelligent policy insight generation."
              linkedin="https://www.linkedin.com/in/dhaarmigala/"
              instagram="https://www.instagram.com/dhaarmigala/"
              twitter="https://x.com/dhaarmigala"
            />

            <TeamCard
              image="/TeamPhotos/aamir.jpg"
              name="Aamir Arsiwala"
              role="Tester"
              desc="Responsible for quality assurance, testing privacy analysis workflows, identifying bugs, and ensuring a smooth user experience."
              linkedin="https://www.linkedin.com/in/aamir-arsiwala/"
              instagram="https://www.instagram.com/aamir.909/"
              twitter="https://x.com/aamir.909"
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
          w-36
          h-36
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