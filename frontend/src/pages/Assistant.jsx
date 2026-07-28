import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLocation } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Assistant() {
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Welcome to PrivacyLens AI Assistant. Ask me anything about privacy policies, risks, cookies, data collection, or security.",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const policyData = location.state || null;

  const suggestions = [
    "Is this privacy policy safe?",
    "What data is collected?",
    "Can they share my data?",
    "Explain privacy risks simply",
  ];

  const sendMessage = async (customMessage = null) => {
    const text = customMessage || input;

    if (!text.trim()) return;

    const userMessage = {
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setLoading(true);

    try {
      const response = await axios.post( `${import.meta.env.VITE_API_URL}/api/chat`, {
        question: text,
        policy_data: policyData,
      });

      const reply = response.data.answer;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 lg:ml-72">
        <Navbar />

        <main className="pt-28 px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}

            <div className="mb-10">
              <h1 className="mt-5 text-5xl font-bold text-slate-900">
                Privacy Policy Assistant
              </h1>

              <p className="mt-5 text-lg text-slate-600 max-w-8xl mx-auto">
                Get instant answers about privacy policies, data collection
                practices, risks, cookies, and security concerns.
              </p>
            </div>

            {/* Suggestions */}

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {suggestions.map((item, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(item)}
                  className="
bg-white
border
border-slate-200
rounded-2xl
p-4
text-left
hover:border-cyan-400
hover:-translate-y-1
hover:shadow-md
transition-all
"
                >
                  <p className="text-sm text-slate-700">{item}</p>
                </button>
              ))}
            </div>

            {/* Chat Box */}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">
                  AI Conversation
                </h2>
              </div>

              <div className="h-150 overflow-y-auto p-6 space-y-5">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex gap-3 max-w-[75%] ${
                        msg.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          msg.role === "user"
                            ? "bg-cyan-500 text-white"
                            : "bg-white border border-slate-200 text-slate-800 shadow-sm"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User size={18} />
                        ) : (
                          <Bot size={18} />
                        )}
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-cyan-500 text-white"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Bot size={18} />
                    </div>

                    <div className="bg-slate-100 rounded-2xl px-4 py-3 animate-pulse">
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}

              <div className="border-t border-slate-100 p-4 flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask anything about privacy policies..."
                  className="flex-1 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />

                <button
                  onClick={() => sendMessage()}
                  className="w-12 h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center hover:bg-cyan-600 transition"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Assistant;
