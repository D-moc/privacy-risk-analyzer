import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("home");

  const navigate = useNavigate();

  // LOAD USER
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    if (token && email) setUser(email);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  // SCROLL TO SECTION
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // 🔥 ACTIVE SECTION DETECTION
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "team", "contact"];

      let current = "home";

      sections.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          const top = section.offsetTop - 120;
          if (window.scrollY >= top) {
            current = id;
          }
        }
      });

      setActive(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-gradient-to-r from-teal-500 via-blue-500 to-cyan-500 shadow-md">

      <div className="w-full px-6 md:px-12 h-[80px] flex justify-between items-center">

        {/* LOGO */}
        <div
          onClick={() => scrollTo("home")}
          className="text-2xl font-bold cursor-pointer tracking-tight text-white"
        >
          Privacy<span className="text-gray-200">AI</span>
        </div>

        {/* MENU */}
        <div className="hidden md:flex gap-12 items-center">

          <NavItem label="Home" id="home" active={active} onClick={scrollTo} />
          <NavItem label="About" id="about" active={active} onClick={scrollTo} />
          <NavItem label="Team" id="team" active={active} onClick={scrollTo} />
          <NavItem label="Contact" id="contact" active={active} onClick={scrollTo} />

        </div>

        {/* RIGHT */}
        <div className="hidden md:flex items-center gap-4">

          {!user ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-lg border border-white/40 text-white hover:bg-white/20 transition"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="px-5 py-2 rounded-lg bg-white text-blue-600 font-semibold shadow hover:scale-105 transition"
              >
                Signup
              </button>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-white">
                {user}
              </span>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* MOBILE */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
}

/* 🔥 NAV ITEM */
function NavItem({ label, id, active, onClick }) {
  const isActive = active === id;

  return (
    <button
      onClick={() => onClick(id)}
      className="relative text-lg font-semibold tracking-wide text-white/90 hover:text-white transition"
    >
      {label}

      {/* 🔥 UNDERLINE (FIXED + ACTIVE) */}
      <span
        className={`absolute left-0 -bottom-1 h-[3px] w-full bg-white rounded-full origin-left transform transition-transform duration-300 ${
          isActive ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </button>
  );
}

export default Navbar;