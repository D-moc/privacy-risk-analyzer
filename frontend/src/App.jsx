import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";

import Navbar from "./components/Navbar";
import ChatbotDrawer from "./components/ChatbotDrawer";

import Home from "./pages/Home";
import About from "./pages/About";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";

function App() {
  const location = useLocation();

  return (
    <div className="bg-[#f8f6f2] min-h-screen overflow-x-hidden">

      {/* NAVBAR */}
      <Navbar />

      {/* CONTENT */}
      <div className="pt-[80px]">

        {/* TOAST */}
        <ToastContainer />

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>

            {/* ONE PAGE */}
            <Route
              path="/"
              element={
                <>
                  <section id="home"><Home /></section>
                  <section id="about"><About /></section>
                  <section id="team"><Team /></section>
                  <section id="contact"><Contact /></section>
                  <Footer />
                </>
              }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />

          </Routes>
        </AnimatePresence>

      </div>

      {/* CHATBOT */}
      <ChatbotDrawer />

    </div>
  );
}

export default App;