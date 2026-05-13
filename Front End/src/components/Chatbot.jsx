import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import API_BASE_URL from "../apiConfig";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am UniSchedule AI. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(API_BASE_URL + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#1a431e",
          color: "white",
          border: "none",
          boxShadow: "0 4px 12px rgba(26,67,30,0.3)",
          cursor: "pointer",
          display: isOpen ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          transition: "transform 0.2s"
        }}
      >
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "350px",
          height: "500px",
          maxWidth: "calc(100vw - 48px)",
          maxHeight: "calc(100vh - 48px)",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 1000,
          overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{ background: "#1a431e", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Bot size={20} />
              <span style={{ fontWeight: "600", fontSize: "16px" }}>UniSchedule AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: "4px" }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", background: "#f8fafb", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: msg.sender === 'user' ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: "16px",
                  borderBottomRightRadius: msg.sender === 'user' ? "4px" : "16px",
                  borderBottomLeftRadius: msg.sender === 'bot' ? "4px" : "16px",
                  background: msg.sender === 'user' ? "#1a431e" : "white",
                  color: msg.sender === 'user' ? "white" : "#333",
                  border: msg.sender === 'bot' ? "1px solid #eee" : "none",
                  fontSize: "13px",
                  lineHeight: "1.4",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "white", padding: "12px 16px", borderRadius: "16px", borderBottomLeftRadius: "4px", border: "1px solid #eee", display: "flex", gap: "4px", alignItems: "center" }}>
                  <div style={{ width: "6px", height: "6px", background: "#ccc", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both" }}></div>
                  <div style={{ width: "6px", height: "6px", background: "#ccc", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.2s" }}></div>
                  <div style={{ width: "6px", height: "6px", background: "#ccc", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: "12px 16px", background: "white", borderTop: "1px solid #eee", display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: "20px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              style={{ width: "40px", height: "40px", borderRadius: "50%", background: input.trim() && !isTyping ? "#1a431e" : "#e0e0e0", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() && !isTyping ? "pointer" : "default", transition: "background 0.2s" }}
            >
              <Send size={18} style={{ marginLeft: "-2px" }} />
            </button>
          </form>
        </div>
      )}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}
