import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./components/GlassChat.css"; // Your CSS
import chatbotimg from "./assets/jarvis2.png";

function App() {
  const [prompt, setPrompt] = useState("");
  const [chat, setChat] = useState([
    { sender: "ai", text: "Hello! I am Jarvis. How can I help you today?" },
  ]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // 🎙️ Text-to-speech function for AI replies
const speakText = (text) => {
  // 🧹 Clean the text to remove symbols, markdown, etc.
  const cleanText = text
    .replace(/[*_#~`<>^{}[\]|\\]/g, "") // remove markdown symbols
    .replace(/\s{2,}/g, " ")             // collapse multiple spaces
    .replace(/https?:\/\/\S+/g, "")      // remove URLs
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "en-IN"; // Indian accent
  utterance.pitch = 1;
  utterance.rate = 1.3;

  // 🎙️ Dynamically switch between male/female voices (if available)
  const voices = speechSynthesis.getVoices();
  const indianVoices = voices.filter(v => v.lang === "en-IN");
  if (indianVoices.length > 0) {
    // alternate randomly or use preferred
    utterance.voice = indianVoices[Math.floor(Math.random() * indianVoices.length)];
  }

  speechSynthesis.cancel(); // stop ongoing speech
  speechSynthesis.speak(utterance);
};

  // Send prompt to backend and get AI response
  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    const userMessage = { sender: "user", text: prompt };
    setChat((prev) => [...prev, userMessage]);
    const userPrompt = prompt;
    setPrompt("");

    try {
     const res = await axios.post("http://127.0.0.1:8000/ask", { prompt: userPrompt });

      const aiReply = res.data.reply || "Sorry, I didn’t catch that.";
      const aiMessage = { sender: "ai", text: aiReply };

      setChat((prev) => [...prev, aiMessage]);
      speakText(aiReply); // 🔊 Speak AI reply aloud
    } catch (err) {
      console.error("Error fetching AI response:", err);
      const errorMsg = "Error: Unable to connect to Jarvis backend.";
      setChat((prev) => [...prev, { sender: "ai", text: errorMsg }]);
      speakText(errorMsg); // Speak error as well
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendPrompt();
  };
  // 🆕 Start a new chat (clear messages)
const startNewChat = () => {
  // Stop any current speech
  speechSynthesis.cancel();

  // Reset chat with Jarvis greeting
  setChat([{ sender: "ai", text: "Hello! I am Jarvis. How can I help you today?" }]);
};
// 🧠 When a preset question (nav link) is clicked
const askPresetQuestion = async (question) => {
  // Stop any current speech
  speechSynthesis.cancel();

  // Show user's question in chat
  setChat((prev) => [...prev, { sender: "user", text: question }]);

  try {
    const res = await axios.post("http://127.0.0.1:8000/ask", { prompt: question });
    const aiReply = res.data.reply || "Sorry, I didn’t catch that.";
    const aiMessage = { sender: "ai", text: aiReply };
    setChat((prev) => [...prev, aiMessage]);
    speakText(aiReply); // 🎙️ Speak Jarvis reply
  } catch (err) {
    console.error("Error fetching AI response:", err);
    const errorMsg = "Error: Unable to connect to Jarvis backend.";
    setChat((prev) => [...prev, { sender: "ai", text: errorMsg }]);
    speakText(errorMsg);
  }
};


  return (
    <div className="app-background">
       {/* LEFT PANEL */}
      <div className="left-panel">
        <div className="user-section">👤 User</div>
       <ul className="nav-links">
  <li onClick={() => askPresetQuestion("Tell me a clever programming joke.")}>
    💻 Tell me a clever programming joke.
  </li>
  <li onClick={() => askPresetQuestion("What's the weather like today?")}>
    🌤️ What's the weather like today?
  </li>
  <li onClick={() => askPresetQuestion("Recommend a good book.")}>
    📚 Recommend a good book.
  </li>
  <li onClick={() => askPresetQuestion("What's the latest tech news?")}>
    📰 What's the latest tech news?
  </li>
  <li className="active">🏠 Home</li>
  <li
    className="active"
    onClick={startNewChat}
    style={{ cursor: "pointer" }}
  >
    💬 New Chat
  </li>
</ul>

      </div>

      {/* CHAT AREA */}
      <div className="chat-container">
        <h2 className="chat-header">Jarvis Chat</h2>
        <h5 className="chat-subheader" style={{ textAlign: "center", color: "#bbb", marginTop: "-5px" }}>
      Created by Prachi
    </h5>
        <div className="chat-messages">
          {chat.map((c, idx) => (
            <div key={idx} className={`message ${c.sender}`}>
              {c.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
          />
          <button onClick={sendPrompt}>Send</button>
        </div>
      </div>
 {/* RIGHT PANEL */}
      <div className="right-panel">
        <div className="trending-section">
          <h4>Top Features</h4>
          <div className="tag">1. Smart Conversational Intelligence</div>
          <div className="tag">2. Secure & Privacy-focused</div>
          <div className="tag">3. Instant, Real-time Replies</div>
          <div className="tag">4. Voice Interaction (Text-to-Speech)</div>
        </div>

        <div className="quick-actions">
          <h4>Quick Actions</h4>
         <footer className="footer">
  <p>© {new Date().getFullYear()} Jarvis AI | Created by Prachi. All rights reserved.</p>
</footer>
        </div>
      </div>
      {/* Floating Jarvis image */}
      <img src={chatbotimg} alt="Chatbot" className="chatbot-float" />
    </div>
  );
}

export default App;
