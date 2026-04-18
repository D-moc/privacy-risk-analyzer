import { FaEnvelope, FaGlobe, FaLinkedin, FaTwitter } from "react-icons/fa";

function Footer() {

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-gradient-to-r from-gray-50 to-gray-100 border-t mt-16">

      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10 text-gray-600">

        {/* BRAND */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Privacy<span className="text-blue-600">AI</span>
          </h2>

          <p className="mt-3 text-sm leading-relaxed">
            Making privacy policies simple, transparent, and understandable
            using AI-powered insights.
          </p>
        </div>

        {/* LINKS */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>

          <ul className="space-y-2 text-sm">

            <li
              onClick={() => scrollTo("home")}
              className="hover:text-blue-600 cursor-pointer transition"
            >
              Home
            </li>

            <li
              onClick={() => scrollTo("about")}
              className="hover:text-blue-600 cursor-pointer transition"
            >
              About
            </li>

            <li
              onClick={() => scrollTo("team")}
              className="hover:text-blue-600 cursor-pointer transition"
            >
              Team
            </li>

            <li
              onClick={() => scrollTo("contact")}
              className="hover:text-blue-600 cursor-pointer transition"
            >
              Contact
            </li>

          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>

          <div className="flex items-center gap-2 text-sm hover:text-blue-600 transition cursor-pointer">
            <FaEnvelope />
            <a href="mailto:privacyai@email.com">
              privacyai@email.com
            </a>
          </div>

          <div className="flex items-center gap-2 text-sm mt-3 hover:text-blue-600 transition cursor-pointer">
            <FaGlobe />
            <a href="#" target="_blank" rel="noreferrer">
              www.privacyai.com
            </a>
          </div>

          {/* SOCIAL */}
          <div className="flex gap-5 mt-5 text-lg">

            <a href="#" target="_blank" rel="noreferrer">
              <FaLinkedin className="hover:text-blue-600 hover:scale-110 transition" />
            </a>

            <a href="#" target="_blank" rel="noreferrer">
              <FaTwitter className="hover:text-blue-600 hover:scale-110 transition" />
            </a>

          </div>
        </div>

      </div>

      {/* DIVIDER */}
      <div className="w-full flex justify-center">
        <div className="h-[2px] w-2/3 bg-gradient-to-r from-teal-400 via-blue-500 to-cyan-400 opacity-60"></div>
      </div>

      {/* COPYRIGHT */}
      <div className="text-center text-sm text-gray-500 py-6">
        © 2026{" "}
        <span className="font-semibold text-gray-800">PrivacyAI</span>. All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;