import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, X, Menu } from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout } = useContext(AuthContext);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const profileRef = useRef(null);

  const userName = localStorage.getItem("userName") || "User";
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";

  const profileImage = localStorage.getItem(`profileImage_${userEmail}`);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      localStorage.setItem(`profileImage_${userEmail}`, reader.result);

      window.location.reload();
    };

    reader.readAsDataURL(file);
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Scan",
      path: "/scan",
    },
    {
      name: "About",
      path: "/about",
    },
    {
      name: "Privacy AI",
      path: "/assistant",
    },
    {
      name: "Policy Compare",
      path: "/compare",
    },
    {
      name: "History",
      path: "/history",
    },
    {
      name: "Data Ledger",
      path: "/ledger",
    },
    {
      name: "Teams",
      path: "/team",
    },
    {
      name: "Contact",
      path: "/contact",
    },
    {
      name: "Chrome Extension",
      path: "/extension",
    },
  ];

  const handleLogout = () => {
    logout();

    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <>
      {/* Mobile Hamburger */}

      <button
        onClick={() => setSidebarOpen(true)}
        className="
    lg:hidden
    fixed
    top-5
    left-3
    z-70
    w-11
    h-11
    rounded-xl
    bg-white
    border
    border-slate-200
    shadow-md
    flex
    items-center
    justify-center
  "
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="
          lg:hidden
          fixed
          inset-0
          bg-black/40
          z-40
        "
        />
      )}

      <aside
        className={`
        fixed
        left-0
        top-0
        w-72
        h-screen
        bg-white
      dark:border-slate-800
        flex
        flex-col
        z-50
        transition-transform
        duration-300

        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Logo */}

        <div className="h-20 px-5 flex items-center border-b border-slate-200">
          <div
            onClick={() => {
              navigate("/dashboard");
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer w-full"
          >
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="PrivacyLens"
                className="
      w-12
      h-12
      rounded-xl
      object-cover
    "
              />

              <h1 className="text-xl font-bold text-slate-900">
                Privacy
                <span className="text-cyan-600">Lens</span>
              </h1>
            </div>

            {/* Mobile Close */}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(false);
              }}
              className="
              lg:hidden
              p-2
              rounded-lg
              hover:bg-slate-100
            "
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-3">
            Menu
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const active = location.pathname === item.path;

              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-base font-semibold ${
                    active
                      ? "bg-cyan-50 text-cyan-700 border-l-4 border-cyan-500"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Profile Section */}
        <div
          ref={profileRef}
          className="shrink-0 px-3 py-4  space-y-2"
        >
          {/* Profile Card */}
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {userName}
              </p>

              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-[10px] font-medium max-w-full truncate">
                  {userEmail}
                </span>
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-4">
              <div className="flex justify-end w-full">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="p-1 rounded-lg hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-100">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <p className="mt-3 text-sm font-medium text-slate-700 text-center break-all">
                  {userEmail}
                </p>

                <label className="mt-4 cursor-pointer px-4 py-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:opacity-90 transition">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all text-sm font-medium"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
