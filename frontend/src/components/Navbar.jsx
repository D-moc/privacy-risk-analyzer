import { useEffect, useRef, useState } from "react";
import { Search, Globe, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";

import GoogleTranslate from "./GoogleTranslate";

function Navbar() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en",
  );

  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const [results, setResults] = useState([]);

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

  const searchReports = async (value) => {
    try {
      const token = await auth.currentUser.getIdToken();

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/search?q=${value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setResults(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navigate = useNavigate();

 const handleLanguageChange = (e) => {
  const lang = e.target.value;

  setLanguage(lang);
  localStorage.setItem("language", lang);

  let attempts = 0;

  const interval = setInterval(() => {
    const combo =
      document.querySelector(".goog-te-combo");

    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(
        new Event("change")
      );

      clearInterval(interval);
    }

    attempts++;

    if (attempts > 10) {
      clearInterval(interval);
    }
  }, 500);
};

useEffect(() => {
  const savedLang =
    localStorage.getItem("language");

  if (
    savedLang &&
    savedLang !== "en"
  ) {
    setTimeout(() => {
      const combo =
        document.querySelector(
          ".goog-te-combo"
        );

      if (combo) {
        combo.value = savedLang;
        combo.dispatchEvent(
          new Event("change")
        );
      }
    }, 2000);
  }
}, []);

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
  bg-white
  backdrop-blur-xl
  border-b
  border-slate-200
  px-3 md:px-6 lg:px-8
  flex
  items-center
  gap-2
  z-40
  shadow-sm
"
      >
        {/* Search */}

        <div
  ref={searchRef}
  className="
    relative
    flex-1
    min-w-0
    ml-14
    lg:ml-0
  "
>
          <Search
            size={18}
            className="
    absolute
    left-4
    top-1/2
    -translate-y-1/2
    text-cyan-500
  "
          />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);

              if (e.target.value.trim().length > 1) {
                searchReports(e.target.value);
              } else {
                setResults([]);
              }
            }}
            placeholder="Search reports, policies, risks..."
            className="
    w-full
    h-12
    rounded-2xl
    border-2
    border-cyan-100
    bg-white
    pl-11
    pr-4
    text-sm
    text-slate-700
    placeholder:text-slate-400
    shadow-sm
    focus:outline-none
    focus:ring-4
    focus:ring-cyan-100
    focus:border-cyan-500
  "
          />
          {results.length > 0 && (
            <div
              className="
      absolute
      top-14
      w-full
      bg-white
      border
      border-slate-200
      rounded-2xl
      shadow-xl
      overflow-hidden
      z-50
    "
            >
              {results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate("/history");
                    setResults([]);
                    setSearch("");
                  }}
                  className="
          p-4
          cursor-pointer
          hover:bg-slate-50
          border-b
          border-slate-100
        "
                >
                  <p className="font-medium">{item.policy_name}</p>

                  <p
                    className="
            text-sm
            text-slate-500
          "
                  >
                    Risk: {item.risk_level}
                  </p>
                </div>
              ))}
            </div>
          )}
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
                      hidden md:block
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
