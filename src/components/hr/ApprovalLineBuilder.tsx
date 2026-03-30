"use client";

import React, { useState, useEffect } from "react";
import { Search, UserPlus, Info, PlusCircle, X, ChevronUp, ChevronDown } from "lucide-react";

export interface ApprovalStepInput {
  userId: string;
  name: string;
  displayTitle: string;
  storeName: string;
  department: string;
  type: 'APPROVER' | 'REFERENCE';
  isFinal: boolean;
  order?: number;
}

interface ApprovalLineBuilderProps {
  currentUser: any;
  steps: ApprovalStepInput[];
  setSteps: (steps: ApprovalStepInput[]) => void;
  documentType: "LEAVE" | "RESIGNATION" | "INCIDENT";
}

export default function ApprovalLineBuilder({ currentUser, steps, setSteps, documentType }: ApprovalLineBuilderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/hr/users/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.users || []);
      } catch (e) {
        console.error("Failed to search users", e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addUser = (user: any, type: 'APPROVER' | 'REFERENCE') => {
    if (steps.some(s => s.userId === user.id)) {
      alert("이미 결재선에 포함된 인원입니다.");
      return;
    }
    
    const newSteps = [...steps, {
      userId: user.id,
      name: user.name,
      displayTitle: user.displayTitle,
      storeName: user.storeName || "",
      department: user.department || "",
      type,
      isFinal: false
    }];
    setSteps(newSteps);
    setSearchQuery("");
  };

  const removeUser = (userId: string) => {
    setSteps(steps.filter(s => s.userId !== userId));
  };

  const setFinal = (userId: string) => {
    setSteps(steps.map(s => {
      if (s.userId === userId && s.type === 'APPROVER') return { ...s, isFinal: true };
      if (s.type === 'APPROVER') return { ...s, isFinal: false }; // Only one final approver allowed usually
      return s;
    }));
  };

  const moveUp = (index: number) => {
    const approvers = steps.filter(s => s.type === 'APPROVER');
    if (index === 0) return;
    const item = approvers[index];
    approvers[index] = approvers[index - 1];
    approvers[index - 1] = item;
    
    // Merge back
    const refs = steps.filter(s => s.type === 'REFERENCE');
    setSteps([...approvers, ...refs]);
  };

  const moveDown = (index: number) => {
    const approvers = steps.filter(s => s.type === 'APPROVER');
    if (index === approvers.length - 1) return;
    const item = approvers[index];
    approvers[index] = approvers[index + 1];
    approvers[index + 1] = item;
    
    // Merge back
    const refs = steps.filter(s => s.type === 'REFERENCE');
    setSteps([...approvers, ...refs]);
  };

  const approvers = steps.filter(s => s.type === 'APPROVER');
  const references = steps.filter(s => s.type === 'REFERENCE');

  return (
    <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", marginBottom: "1.5rem" }}>
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: "#111827", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <UserPlus size={18} /> 결재선 지정
      </h3>
      
      <div style={{ backgroundColor: "#eff6ff", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#1d4ed8", display: "flex", gap: "0.5rem" }}>
        <Info size={16} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
        <div>
          <p style={{ margin: "0 0 0.5rem 0", fontWeight: 600 }}>권장 결재 라인 가이드</p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <li><strong>매장 일반:</strong> 기안자 &rarr; 매장 관리자 (전결)</li>
            <li><strong>매장 관리자:</strong> 기안자 &rarr; 영업본부/영업본부장 (전결)</li>
            <li><strong>본사 직원:</strong> 기안자 &rarr; 팀장 &rarr; 관리본부장 (전결)</li>
            <li><strong>임원급:</strong> 기안자 &rarr; 대표이사 (전결)</li>
          </ul>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "#f9fafb" }}>
          <Search size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="이름, 매장 혹은 부서 검색하여 추가..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: "none", backgroundColor: "transparent", outline: "none", width: "100%", marginLeft: "0.5rem", fontSize: "0.9rem" }}
          />
        </div>

        {searchQuery.trim().length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "0.5rem", marginTop: "0.25rem", zIndex: 50, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", maxHeight: "250px", overflowY: "auto" }}>
            {isSearching ? (
              <div style={{ padding: "1rem", textAlign: "center", color: "#6b7280", fontSize: "0.9rem" }}>검색 중...</div>
            ) : searchResults.length === 0 ? (
              <div style={{ padding: "1rem", textAlign: "center", color: "#6b7280", fontSize: "0.9rem" }}>검색 결과가 없습니다.</div>
            ) : (
              searchResults.map(u => (
                <div key={u.id} style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.95rem" }}>{u.name} <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "normal" }}>({u.displayTitle})</span></div>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.25rem" }}>{u.storeName || "본사"} / {u.department || "-"}</div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => addUser(u, 'APPROVER')} style={{ padding: "0.25rem 0.5rem", backgroundColor: "#3b82f6", color: "white", borderRadius: "0.25rem", fontSize: "0.8rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}><PlusCircle size={12}/>결재자</button>
                    <button onClick={() => addUser(u, 'REFERENCE')} style={{ padding: "0.25rem 0.5rem", backgroundColor: "#f3f4f6", color: "#374151", borderRadius: "0.25rem", fontSize: "0.8rem", border: "1px solid #d1d5db", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}><PlusCircle size={12}/>참조</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        {/* Approvers Section */}
        <div>
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: "#4b5563" }}>결재자 ({approvers.length}명) - 순서대로 결재가 진행됩니다</h4>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", overflow: "hidden" }}>
            {approvers.length === 0 ? (
              <div style={{ padding: "1rem", textAlign: "center", color: "#9ca3af", fontSize: "0.9rem" }}>지정된 결재자가 없습니다.</div>
            ) : (
              approvers.map((s, idx) => (
                <div key={s.userId} style={{ padding: "0.75rem 1rem", borderBottom: idx < approvers.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: s.isFinal ? "#fef3c7" : "white" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#9ca3af" }}>
                      <button onClick={(e) => { e.preventDefault(); moveUp(idx); }} style={{ background: "none", border: "none", cursor: idx > 0 ? "pointer" : "default", opacity: idx > 0 ? 1 : 0.3 }}><ChevronUp size={16} /></button>
                      <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>{idx + 1}</span>
                      <button onClick={(e) => { e.preventDefault(); moveDown(idx); }} style={{ background: "none", border: "none", cursor: idx < approvers.length - 1 ? "pointer" : "default", opacity: idx < approvers.length - 1 ? 1 : 0.3 }}><ChevronDown size={16} /></button>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.9rem" }}>{s.name} <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "normal" }}>({s.displayTitle})</span></div>
                      <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{s.storeName || "본사"} / {s.department || "-"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", color: "#d97706", cursor: "pointer", fontWeight: 600 }}>
                      <input type="radio" checked={s.isFinal || false} onChange={() => setFinal(s.userId)} style={{ accentColor: "#d97706" }} /> 전결
                    </label>
                    <button onClick={(e) => { e.preventDefault(); removeUser(s.userId); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center" }}><X size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* References Section */}
        <div>
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: "#4b5563" }}>참조 ({references.length}명) - 결재 완료 시 알림 및 열람 권한</h4>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", overflow: "hidden" }}>
             {references.length === 0 ? (
              <div style={{ padding: "1rem", textAlign: "center", color: "#9ca3af", fontSize: "0.9rem" }}>지정된 참조가 없습니다.</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "0.75rem 1rem", backgroundColor: "white" }}>
                {references.map((s) => (
                  <div key={s.userId} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.5rem", backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "1rem", fontSize: "0.85rem", color: "#374151" }}>
                    <span>{s.name} ({s.displayTitle})</span>
                    <button onClick={(e) => { e.preventDefault(); removeUser(s.userId); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center", padding: 0 }}><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
