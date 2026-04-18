import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { MessageCircle, X } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function ChatbotDrawer() {
  const { analysisData } = useContext(AppContext);
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! Ask me anything about this privacy policy.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const panelRef = useRef();
  const bottomRef = useRef();

  // CLOSE ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getRiskLabel = () => {
    if (!analysisData) return null;

    if (analysisData.risk_score < 30)
      return { text: "SAFE", color: "bg-green-500" };

    if (analysisData.risk_score < 70)
      return { text: "MODERATE", color: "bg-yellow-500" };

    return { text: "RISKY", color: "bg-red-500" };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const contextText = analysisData
        ? `Summary: ${analysisData.summary}, Risk: ${analysisData.risk_score}`
        : "No policy analyzed.";

      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `Explain simply. Give SAFE / MODERATE / RISKY.\n${contextText}`,
            },
            userMsg,
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const reply = res.data.choices[0].message.content;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);

    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ AI error. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const risk = getRiskLabel();

  return (
    <>
      {/* FLOAT BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition z-50"
      >
        <MessageCircle />
      </button>

      {/* PANEL */}
      <div
        ref={panelRef}
        className={`fixed right-6 top-[80px] h-[85%] w-[380px] bg-white rounded-3xl shadow-2xl border transition-all duration-300 z-50 ${
          open ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
        }`}
      >

        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-3xl">
          <div>
            <h3 className="font-semibold text-lg text-gray-800">
              Privacy Assistant
            </h3>

            {risk && (
              <span className={`text-white text-xs px-2 py-1 rounded ${risk.color}`}>
                {risk.text}
              </span>
            )}
          </div>

          <button onClick={() => setOpen(false)}>
            <X className="text-gray-500 hover:text-black" />
          </button>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-sm">

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`px-4 py-2 rounded-2xl max-w-[75%] ${
                msg.role === "user"
                  ? "bg-blue-600 text-white self-end"
                  : "bg-gray-100 text-gray-800 self-start"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="bg-gray-100 px-4 py-2 rounded-2xl animate-pulse w-fit">
              Typing...
            </div>
          )}

          <div ref={bottomRef}></div>
        </div>

        {/* INPUT */}
        <div className="p-3 border-t flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700"
          >
            Send
          </button>
        </div>

        {/* LOGIN CTA */}
        {!user && (
          <div className="p-3 border-t flex justify-between text-sm">
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-green-600 hover:underline"
            >
              Sign up
            </button>
          </div>
        )}

      </div>
    </>
  );
}

export default ChatbotDrawer;