import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";

import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Contact() {
  const [form, setForm] = useState({
    user_name: "",
    user_email: "",
    subject: "",
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
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      )
      .then(() => {
        toast.success("Message sent successfully");

        setForm({
          user_name: "",
          user_email: "",
          subject: "",
          message: "",
        });

        setLoading(false);
      })
      .catch((error) => {
        console.log(error);

        toast.error("Failed to send message");

        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 lg:ml-72">
        <Navbar />

        <main className="pt-28 px-6 md:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl font-bold text-slate-900">
                How Can We Help?
              </h1>

              <p
                className="
    mt-5
    text-lg
    text-slate-600
    max-w-3xl
    mx-auto
    text-center
    leading-relaxed
  "
              >
                Have a question, feature request, bug report, or partnership
                idea?
              </p>
            </motion.div>

            <div className="max-w-2xl mx-auto">
              {/* Contact Form */}

              <motion.form
                onSubmit={sendEmail}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="
    bg-white
    rounded-4xl
    border
    border-slate-200
    p-8
    lg:p-10
    shadow-sm
    hover:shadow-lg
    transition-all
  "
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Send a Message
                </h2>
                <p className="text-slate-500 mb-8">
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </p>

                <div className="space-y-5">
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="user_name"
                      value={form.user_name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      required
                      className="
                        w-full
                        px-4
                        py-3
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-50
                        focus:outline-none
                        focus:ring-2
                        focus:ring-cyan-500
                      "
                    />

                    <input
                      type="email"
                      name="user_email"
                      value={form.user_email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      required
                      className="
                        w-full
                        px-4
                        py-3
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-50
                        focus:outline-none
                        focus:ring-2
                        focus:ring-cyan-500
                      "
                    />
                  </div>

                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Subject"
                    required
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-2xl
                      border
                      border-slate-200
                      bg-slate-50
                      focus:outline-none
                      focus:ring-2
                      focus:ring-cyan-500
                    "
                  />

                  <textarea
                    rows="6"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    required
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-2xl
                      border
                      border-slate-200
                      bg-slate-50
                      resize-none
                      focus:outline-none
                      focus:ring-2
                      focus:ring-cyan-500
                    "
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      w-full
                      h-14
                      rounded-2xl
                      bg-linear-to-r
                      from-cyan-500
                      to-blue-600
                      text-white
                      font-semibold
                      flex
                      items-center
                      justify-center
                      gap-2
                      hover:scale-[1.01]
                      transition
                      shadow-lg
                      shadow-cyan-500/20
                    "
                  >
                    <Send size={18} />

                    {loading ? "Sending Message..." : "Send Message"}
                  </button>
                </div>
              </motion.form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
        {icon}
      </div>

      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>

        <p className="text-slate-600">{value}</p>
      </div>
    </div>
  );
}

export default Contact;
