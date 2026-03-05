"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";

type Message = {
    id: number;
    text: string;
    sender: "bot" | "user";
};

export default function HRChatbotWidget() {
    const [user, setUser] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "안녕하세요! 아그라 HR 헬프데스크 봇입니다.\n사내 규정이나 본인의 연차/급여 정보에 대해 물어보세요.\n(예: '내 남은 연차 알려줘', '월급날 언제야?')", sender: "bot" }
    ]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("hr_user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || !user) return;

        const newMsg: Message = { id: Date.now(), text: inputText, sender: "user" };
        setMessages(prev => [...prev, newMsg]);
        setInputText("");

        try {
            const res = await fetch("/api/hr/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: newMsg.text, employeeNumber: user.employeeNumber })
            });
            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: data.response, sender: "bot" }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: `오류 발생: ${data.error}`, sender: "bot" }]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "서버 응답 지연: 네트워크를 확인해 주세요.", sender: "bot" }]);
        }
    };

    if (!user) return null;

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: "fixed", bottom: "2rem", right: "2rem",
                        padding: "0.8rem 1.5rem", borderRadius: "99px",
                        backgroundColor: "#1e3a8a", color: "white",
                        display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
                        border: "none", cursor: "pointer", zIndex: 50, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        fontWeight: 600, fontSize: "0.95rem"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
                        e.currentTarget.style.backgroundColor = "#1e40af";
                        e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1) translateY(0)";
                        e.currentTarget.style.backgroundColor = "#1e3a8a";
                        e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)";
                    }}
                >
                    <MessageCircle size={24} />
                    <span>HR 챗봇 문의</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{ position: "fixed", bottom: "2rem", right: "2rem", width: "380px", height: "600px", maxHeight: "80vh", backgroundColor: "white", borderRadius: "1rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", display: "flex", flexDirection: "column", zIndex: 50, border: "1px solid #e5e7eb", overflow: "hidden" }}>

                    {/* Header */}
                    <div style={{ backgroundColor: "#1f2937", color: "white", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Bot size={22} color="#fcd34d" />
                            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>HR 지능형 헬프데스크</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", display: "flex" }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat History */}
                    <div style={{ flex: 1, padding: "1.25rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: "#f9fafb" }}>
                        {messages.map((msg) => (
                            <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", gap: "0.5rem", alignItems: "flex-end" }}>
                                {msg.sender === "bot" && (
                                    <div style={{ backgroundColor: "#e5e7eb", width: "32px", height: "32px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                                        <Bot size={18} color="#4b5563" />
                                    </div>
                                )}

                                <div style={{
                                    maxWidth: "75%",
                                    padding: "0.75rem 1rem",
                                    borderRadius: "1rem",
                                    backgroundColor: msg.sender === "user" ? "#1f2937" : "white",
                                    color: msg.sender === "user" ? "white" : "#111827",
                                    border: msg.sender === "user" ? "none" : "1px solid #e5e7eb",
                                    fontSize: "0.9rem",
                                    lineHeight: 1.5,
                                    whiteSpace: "pre-wrap",
                                    boxShadow: msg.sender === "bot" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                                    borderBottomRightRadius: msg.sender === "user" ? "0.25rem" : "1rem",
                                    borderBottomLeftRadius: msg.sender === "bot" ? "0.25rem" : "1rem",
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: "1rem", backgroundColor: "white", borderTop: "1px solid #e5e7eb", display: "flex", gap: "0.5rem" }}>
                        <input
                            type="text"
                            placeholder="질문을 입력하세요..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            style={{ flex: 1, padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "99rem", fontSize: "0.9rem", outline: "none" }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputText.trim()}
                            style={{ width: "2.8rem", height: "2.8rem", borderRadius: "50%", backgroundColor: inputText.trim() ? "#1f2937" : "#e5e7eb", color: "white", display: "flex", justifyContent: "center", alignItems: "center", border: "none", cursor: inputText.trim() ? "pointer" : "not-allowed", transition: "background 0.2s" }}
                        >
                            <Send size={18} style={{ marginLeft: "-2px" }} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
