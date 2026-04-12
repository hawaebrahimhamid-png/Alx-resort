import { useState, useRef, useEffect } from "react";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ STEP 1: CREATE REF (INSIDE COMPONENT)
  const chatEndRef = useRef(null);

  // ✅ STEP 2: AUTO SCROLL (INSIDE COMPONENT)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!message) return;

    const userMsg = { role: "user", text: message };

    setChat((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        type: "couple",
      }),
    });

    const data = await res.json();

    setChat((prev) => [...prev, { role: "ai", text: data.reply }]);
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* HEADER */}
      <div className="bg-green-600 text-white p-4 text-center text-xl font-bold">
        AI Resort Chat 💬
      </div>

      {/* CHAT BOX */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.map((c, i) => (
          <div
            key={i}
            className={`flex ${
              c.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs text-sm shadow
              ${
                c.role === "user"
                  ? "bg-green-500 text-white"
                  : "bg-white text-black"
              }`}
            >
              {c.text}
            </div>
          </div>
        ))}

        {/* typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-2xl shadow text-sm">
              AI is typing...
            </div>
          </div>
        )}

        {/* ✅ STEP 3: SCROLL TARGET (VERY IMPORTANT) */}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 bg-white flex gap-2">
        <input
          className="flex-1 border rounded-full px-4 py-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className={`px-4 py-2 rounded-full text-white
          ${loading ? "bg-gray-400" : "bg-green-600"}`}
        >
          Send
        </button>
      </div>
    </div>
  );
}
