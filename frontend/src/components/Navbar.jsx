import { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Sun, Moon, Menu, X } from "lucide-react";

function Navbar() {
  const { theme, setTheme } = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔥 LOAD USER FROM LOCAL STORAGE
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");

    if (token && email) {
      setUser(email);
    }
  }, []);

  // 🔥 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");

    setUser(null);
    navigate("/login");
  };

  // 🔥 Active route
  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md border-b"
          : "bg-white/70 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex justify-between items-center">

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="text-xl font-bold cursor-pointer"
        >
          🔐 Privacy<span className="text-blue-600">AI</span>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex gap-8">

          <NavItem label="Home" path="/" navigate={navigate} active={isActive("/")} />
          <NavItem label="About" path="/about" navigate={navigate} active={isActive("/about")} />
          <NavItem label="Team" path="/team" navigate={navigate} active={isActive("/team")} />
          <NavItem label="Extension" path="/extension" navigate={navigate} active={isActive("/extension")} />
          <NavItem label="Contact" path="/contact" navigate={navigate} active={isActive("/contact")} />

        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center gap-3">

          {/* THEME */}
          <button
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            className="p-2 border rounded hover:bg-gray-100 transition"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {!user ? (
            <>
              {/* LOGIN */}
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-1 border rounded hover:bg-gray-100 transition"
              >
                Login
              </button>

              {/* SIGNUP */}
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Signup
              </button>
            </>
          ) : (
            <>
              {/* USER EMAIL */}
              <span className="text-sm font-medium text-gray-700">
                {user}
              </span>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          )}

        </div>

        {/* MOBILE BUTTON */}
        <button onClick={() => setOpen(!open)} className="md:hidden">
          {open ? <X /> : <Menu />}
        </button>

      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-4 bg-white border-t">

          <MobileItem label="Home" onClick={() => navigate("/")} />
          <MobileItem label="About" onClick={() => navigate("/about")} />
          <MobileItem label="Team" onClick={() => navigate("/team")} />
          <MobileItem label="Extension" onClick={() => navigate("/extension")} />
          <MobileItem label="Contact" onClick={() => navigate("/contact")} />

          {!user ? (
            <>
              <MobileItem label="Login" onClick={() => navigate("/login")} />
              <MobileItem label="Signup" onClick={() => navigate("/signup")} />
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600">{user}</span>
              <MobileItem label="Logout" onClick={handleLogout} />
            </>
          )}

        </div>
      )}
    </nav>
  );
}

/* NAV ITEM */
function NavItem({ label, path, navigate, active }) {
  return (
    <button
      onClick={() => navigate(path)}
      className="relative text-sm font-medium"
    >
      <span className={active ? "text-blue-600" : "hover:text-blue-600 transition"}>
        {label}
      </span>

      <span
        className={`absolute left-0 -bottom-1 h-[2px] bg-blue-600 transition-all duration-300 ${
          active ? "w-full" : "w-0 hover:w-full"
        }`}
      ></span>
    </button>
  );
}

/* MOBILE ITEM */
function MobileItem({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left hover:text-blue-600 transition"
    >
      {label}
    </button>
  );
}

export default Navbar;