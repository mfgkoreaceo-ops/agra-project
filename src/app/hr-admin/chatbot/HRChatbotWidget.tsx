"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { useAuth } from "../AuthContext";
import { useHR } from "../HRContext";
import { classifyIntent } from "./hr_knowledge";

type Message = {
    id: number;
    text: string;
    sender: "bot" | "user";
};

export default function HRChatbotWidget() {
    const { session } = useAuth();
    const { hrState } = useHR();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "안녕하세요! 아그라 헬프데스크 봇입니다.\n사내 규정이나 본인의 인사/급여 정보에 대해 물어보세요. (예: '내 남은 연차 알려줘', '경조사 규정 어떻게 돼?')", sender: "bot" }
    ]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim() || !session) return;

        const newMsg: Message = { id: Date.now(), text: inputText, sender: "user" };
        setMessages(prev => [...prev, newMsg]);
        setInputText("");

        // Simulate Network Delay + NLP Processing
        setTimeout(() => {
            const intent = classifyIntent(newMsg.text);
            let responseText = "죄송합니다. 질문의 의도를 파악하지 못했습니다. 규정집 파일이나 담당 부서에 문의해 주세요.";

            // RBAC DB Lookup Logic
            if (intent === "intent_my_leave") {
                const myData = hrState.employees.find(e => e.id === session.uid);
                if (myData) {
                    const remaining = myData.annualLeaveTotal - myData.annualLeaveUsed;
                    responseText = `${session.name}님의 올해 총 발생 연차는 ${myData.annualLeaveTotal}일이며, 현재 **${remaining}일** 남았습니다.`;
                }
            } else if (intent === "intent_my_salary") {
                const myData = hrState.employees.find(e => e.id === session.uid);
                if (myData) {
                    responseText = `보안 인증 확인: ${session.name}님의 이번 달 계약 기본급(또는 실수령 예상액)은 **${myData.baseSalary.toLocaleString()}원** 입니다. (상세 내역은 급여 대장을 참조하세요)`;
                }
            } else if (intent === "intent_blocked") {
                responseText = "⚠️ 보안 알림: 해당 정보(타인의 민감 정보, 매출 등)는 조회 권한이 없습니다. (접근 거부됨)";
            } else if (typeof intent === "object" && intent.type === "intent_rag") {
                responseText = `[사내 규정 DB 검색 결과]\n\n${intent.content}`;
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, text: responseText, sender: "bot" }]);
        }, 800);
    };

    if (!session) return null;

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{ position: "fixed", bottom: "2rem", right: "2rem", width: "3.5rem", height: "3.5rem", borderRadius: "50%", backgroundColor: "#1f2937", color: "white", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", border: "none", cursor: "pointer", zIndex: 50, transition: "transform 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                    <MessageCircle size={28} />
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
