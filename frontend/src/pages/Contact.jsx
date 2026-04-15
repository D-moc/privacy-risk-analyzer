import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import emailjs from "@emailjs/browser";
import { useState } from "react";
import { toast } from "react-toastify";

function Contact() {
  const [form, setForm] = useState({
    user_name: "",
    user_email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  // HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // SEND EMAIL
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
      .then(
        () => {
          toast.success("Message sent successfully 🚀");
          setForm({ user_name: "", user_email: "", message: "" });
          setLoading(false);
        },
        (error) => {
          toast.error("Failed to send message ❌");
          console.log(error);
          setLoading(false);
        }
      );
  };

  return (
    <div className="bg-[#f8f6f2] min-h-screen text-gray-800">

      <Navbar />

      {/* HEADER */}
      <div className="pt-32 text-center px-6 max-w-3xl mx-auto">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-gray-900"
        >
          Get in Touch
        </motion.h1>

        <p className="mt-4 text-gray-600 text-lg">
          Have questions? We’d love to hear from you.
        </p>

      </div>

      {/* MAIN */}
      <div className="mt-16 px-6 md:px-16 max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

        {/* FORM */}
        <motion.form
          onSubmit={sendEmail}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-xl shadow-md border"
        >

          <h2 className="text-xl font-semibold mb-6">
            Send a Message
          </h2>

          <input
            type="text"
            name="user_name"
            value={form.user_name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full border p-3 rounded mb-4 focus:border-blue-500"
            required
          />

          <input
            type="email"
            name="user_email"
            value={form.user_email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full border p-3 rounded mb-4 focus:border-blue-500"
            required
          />

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your Message"
            rows="5"
            className="w-full border p-3 rounded mb-4 focus:border-blue-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>

        </motion.form>

        {/* INFO */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center gap-6"
        >

          <InfoCard icon={<Mail />} title="Email" value="support@privacyai.com" />
          <InfoCard icon={<Phone />} title="Phone" value="+91 9876543210" />
          <InfoCard icon={<MapPin />} title="Location" value="Mumbai, India" />

        </motion.div>

      </div>

      <div className="h-20"></div>

    </div>
  );
}

/* INFO CARD */
function InfoCard({ icon, title, value }) {
  return (
    <div className="flex items-center gap-4 bg-white p-5 rounded-xl shadow border hover:shadow-md transition">
      <div className="text-blue-600">{icon}</div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-gray-600 text-sm">{value}</p>
      </div>
    </div>
  );
}

export default Contact;