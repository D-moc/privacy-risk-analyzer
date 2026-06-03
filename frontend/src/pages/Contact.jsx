import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";

import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Contact() {
  const [form, setForm] = useState({
    user_name: "",
    user_email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const sendEmail = (e) => {
    e.preventDefault();

    setLoading(true);

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        form,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        toast.success(
          "Message sent successfully 🚀"
        );

        setForm({
          user_name: "",
          user_email: "",
          message: "",
        });

        setLoading(false);
      })
      .catch((error) => {
        console.log(error);

        toast.error(
          "Failed to send message ❌"
        );

        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar />

      <div className="ml-0 lg:ml-72">

        <Navbar />

        <main className="pt-28 px-8 pb-8">

          <div className="max-w-7xl mx-auto">

            {/* Header */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <span className="inline-flex px-4 py-1 rounded-full bg-cyan-50 text-cyan-600 text-sm font-medium border border-cyan-100">
                Contact Us
              </span>

              <h1 className="mt-5 text-5xl font-bold text-slate-900">
                Get In Touch
              </h1>

              <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                Have questions, suggestions, or feedback?
                We'd love to hear from you.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">

              {/* Contact Form */}

              <motion.form
                onSubmit={sendEmail}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Send a Message
                </h2>

                <div className="space-y-5">

                  <input
                    type="text"
                    name="user_name"
                    value={form.user_name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />

                  <input
                    type="email"
                    name="user_email"
                    value={form.user_email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />

                  <textarea
                    rows="6"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Your Message"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <Send size={18} />

                    {loading
                      ? "Sending..."
                      : "Send Message"}
                  </button>

                </div>
              </motion.form>

              {/* Contact Info */}

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >

                <InfoCard
                  icon={<Mail size={22} />}
                  title="Email"
                  value="support@privacylens.com"
                />

                <InfoCard
                  icon={<Phone size={22} />}
                  title="Phone"
                  value="+91 9876543210"
                />

                <InfoCard
                  icon={<MapPin size={22} />}
                  title="Location"
                  value="Mumbai, Maharashtra, India"
                />

                {/* Vision Card */}

                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-8 text-white">

                  <h3 className="text-2xl font-bold">
                    PrivacyLens
                  </h3>

                  <p className="mt-4 text-cyan-50 leading-relaxed">
                    Empowering users with AI-driven
                    privacy policy analysis and
                    transparent insights into data
                    collection, tracking, and online
                    privacy risks.
                  </p>

                </div>

              </motion.div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

function InfoCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
        {icon}
      </div>

      <div>
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <p className="text-slate-600">
          {value}
        </p>
      </div>
    </div>
  );
}

export default Contact;