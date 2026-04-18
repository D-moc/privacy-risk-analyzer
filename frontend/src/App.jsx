import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

function Divider() {
  return (
    <div className="w-full flex justify-center py-6">
      <div className="h-[4px] w-2/3 rounded-full bg-gradient-to-r from-teal-400 via-blue-500 to-cyan-400 opacity-80"></div>
    </div>
  );
}

function AppWrapper() {
  const location = useLocation();

  return (
    <div className="bg-[#f8f6f2] min-h-screen overflow-x-hidden">

      {/* NAVBAR */}
      <Navbar />

      {/* CONTENT */}
      <div className="pt-[80px]">

        {/* TOAST */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          pauseOnHover
          theme="light"
        />

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>

            {/* ONE PAGE */}
            <Route
              path="/"
              element={
                <>
                  <section id="home">
                    <Home />
                  </section>

                  <Divider />

                  <section id="about">
                    <About />
                  </section>

                  <Divider />

                  <section id="team">
                    <Team />
                  </section>

                  <Divider />

                  <section id="contact">
                    <Contact />
                  </section>
                  <Footer />
                </>
              }
            />

            {/* OTHER ROUTES */}
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

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;