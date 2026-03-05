"use client";

import React, { useEffect, useState, useMemo } from "react";
import { FileCheck, Search, Filter, Upload, Image as ImageIcon, Trash2 } from "lucide-react";

export default function CertificateAdminPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sealImage, setSealImage] = useState<string | null>(null);

    useEffect(() => {
        setSealImage(localStorage.getItem("company_seal_image"));
        const fetchRecords = async () => {
            try {
                const res = await fetch("/api/hr/certificates");
                if (res.ok) {
                    const data = await res.json();
                    setRecords(data.records || []);
                }
            } catch (error) {
                console.error("Failed to fetch certificate records:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);

    const filteredRecords = useMemo(() => {
        if (!searchQuery.trim()) return records;
        const q = searchQuery.toLowerCase();
        return records.filter(r => 
            r.employee.name.toLowerCase().includes(q) ||
            r.employee.employeeNumber.toLowerCase().includes(q) ||
            r.employee.brand.toLowerCase().includes(q) ||
            r.purpose.toLowerCase().includes(q)
        );
    }, [records, searchQuery]);

    const handleSealUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Str = event.target?.result as string;
            localStorage.setItem("company_seal_image", base64Str);
            setSealImage(base64Str);
            alert("회사 직인(인감) 이미지가 등록되었습니다.");
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveSeal = () => {
        if(confirm("등록된 직인 이미지를 삭제하시겠습니까? (기본 '직인' 텍스트로 대체됩니다)")) {
            localStorage.removeItem("company_seal_image");
            setSealImage(null);
        }
    };

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>증명서 발급 내역 및 설정</h1>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                        전사 임직원의 재직증명서 등 증명서 발급 기록 조회 및 공용 회사 직인(인감) 설정
                    </p>
                </div>
                
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    {/* Search Box */}
                    <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex", alignItems: "center" }}>
                            <Search size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="이름, 사번, 목적 검색..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ 
                                padding: "0.6rem 1rem 0.6rem 2.2rem", 
                                borderRadius: "0.5rem", 
                                border: "1px solid #d1d5db", 
                                fontSize: "0.9rem",
                                outline: "none",
                                width: "250px"
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Seal Upload Section */}
            <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "80px", height: "80px", backgroundColor: "#f9fafb", border: "1px dashed #d1d5db", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        {sealImage ? (
                            <img src={sealImage} alt="현재 직인" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                        ) : (
                            <ImageIcon size={24} color="#9ca3af" />
                        )}
                    </div>
                    <div>
                        <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "#374151" }}>회사 직인 (인감) 설정</h3>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
                            이곳에 업로드된 투명 배경(PNG) 이미지가 전사 직원의 재직증명서 하단에 자동 날인됩니다.
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", backgroundColor: "#3b82f6", color: "white", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 500 }}>
                        <Upload size={16} /> 인감 파일 업로드
                        <input type="file" accept="image/png, image/jpeg" style={{ display: "none" }} onChange={handleSealUpload} />
                    </label>
                    {sealImage && (
                         <button onClick={handleRemoveSeal} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", backgroundColor: "white", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 500 }}>
                             <Trash2 size={16} /> 삭제
                         </button>
                    )}
                </div>
            </div>

            <div style={{ backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280" }}>발급 일시</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280" }}>사번</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280" }}>이름 (소속)</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280" }}>증명서 종류</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280" }}>제출 몯적</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280" }}>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#6b7280", fontSize: "0.95rem" }}>
                                    데이터 불러오는 중...
                                </td>
                            </tr>
                        ) : filteredRecords.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#6b7280", fontSize: "0.95rem" }}>
                                    발급 내역이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            filteredRecords.map((record) => (
                                <tr key={record.id} style={{ borderBottom: "1px solid #e5e7eb", transition: "background-color 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "#f9fafb"} onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#4b5563" }}>
                                        {new Date(record.issuedAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#111827", fontWeight: 500 }}>
                                        {record.employee.employeeNumber}
                                    </td>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#4b5563" }}>
                                        <span style={{ fontWeight: 500, color: "#111827" }}>{record.employee.name}</span>
                                        <br/>
                                        <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{record.employee.brand} / {record.employee.department}</span>
                                    </td>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#4b5563" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <FileCheck size={16} color="#3b82f6" />
                                            {record.type === "CERTIFICATE_OF_EMPLOYMENT" ? "재직증명서" : record.type}
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#4b5563" }}>
                                        {record.purpose}
                                    </td>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", textAlign: "center" }}>
                                        <span style={{ padding: "0.25rem 0.75rem", backgroundColor: "#ecfdf5", color: "#10b981", borderRadius: "1rem", fontSize: "0.8rem", fontWeight: 500 }}>
                                            완료
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
