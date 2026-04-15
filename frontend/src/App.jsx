import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import ChatbotDrawer from "./components/ChatbotDrawer"; // 🔥 ADD THIS

import Home from "./pages/Home";
import About from "./pages/About";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

function AppWrapper() {
  const location = useLocation();

  return (
    <>
      <Navbar />

      {/* 🔥 TOAST */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover
        theme="light"
      />

      {/* 🔥 ROUTES */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* MAIN */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* DASHBOARD */}
          <Route path="/dashboard" element={<Dashboard />} />

        </Routes>
      </AnimatePresence>

      {/* 🔥 FLOATING CHATBOT (GLOBAL) */}
      <ChatbotDrawer />

    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;