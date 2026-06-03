import { useEffect, useState } from "react";
import { Search, Globe, Moon, Sun } from "lucide-react";

import GoogleTranslate from "./GoogleTranslate";

function Navbar() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en",
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;

    setLanguage(lang);

    localStorage.setItem("language", lang);

    const combo = document.querySelector(".goog-te-combo");

    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event("change"));
    }
  };

  return (
    <>
      {/* Hidden Google Translate */}
      <div className="hidden">
        <GoogleTranslate />
      </div>

      <header
        className="
          fixed
          top-0
          left-0
          lg:left-72
          right-0
          h-20
          bg-white/80
          backdrop-blur-xl
          border-b
          border-slate-200
          px-4 md:px-6 lg:px-8
          flex
          items-center
          justify-between
          z-40
          shadow-sm
        "
      >
        {/* Search */}

        <div className="hidden md:block relative w-full max-w-2xl">
          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            placeholder="Search reports, scans..."
            className="
              w-full
              h-12
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              pl-12
              pr-4
              text-sm
              text-slate-700
              placeholder:text-slate-400
              focus:outline-none
              focus:ring-2
              focus:ring-cyan-500
              focus:border-transparent
            "
          />
        </div>

        {/* Right */}

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Language */}

          <div
            className="
              flex
              items-center
              gap-2
              px-4
              h-12
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
            "
          >
            <Globe size={18} className="text-slate-500" />

            <select
              value={language}
              onChange={handleLanguageChange}
              className="
                      hidden sm:block
                      bg-transparent
                      text-sm
                      text-slate-700
                      outline-none
                      cursor-pointer
                    "
              >
              <option value="en">English</option>

              <option value="hi">हिन्दी</option>

              <option value="mr">Marathi</option>
            </select>
          </div>

          {/* Theme Toggle */}

          <button
            onClick={toggleTheme}
            className="
              w-12
              h-12
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
              flex
              items-center
              justify-center
              hover:bg-slate-50
              transition
            "
          >
            {theme === "light" ? (
              <Moon size={18} className="text-slate-600" />
            ) : (
              <Sun size={18} className="text-yellow-500" />
            )}
          </button>
        </div>
      </header>
    </>
  );
}

export default Navbar;
