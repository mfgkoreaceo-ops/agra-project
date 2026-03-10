"use client";

import React, { useState, useEffect } from "react";
import { User, ShieldCheck, Upload, Save } from "lucide-react";

export default function MyProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [isEditingInfo, setIsEditingInfo] = useState(false);

    const [editName, setEditName] = useState("");
    const [editRole, setEditRole] = useState("");
    const [editJobTitle, setEditJobTitle] = useState("");
    const [editStoreName, setEditStoreName] = useState("");
    const [editPhone, setEditPhone] = useState("");

    const [editAddress, setEditAddress] = useState("");
    const [editBankName, setEditBankName] = useState("");
    const [editAccountNumber, setEditAccountNumber] = useState("");

    // We mock file states for the UI
    const [idCardFile, setIdCardFile] = useState<File | null>(null);
    const [bankbookFile, setBankbookFile] = useState<File | null>(null);
    const [healthCertFile, setHealthCertFile] = useState<File | null>(null);
    const [editHealthCertExp, setEditHealthCertExp] = useState("");

    const [myData, setMyData] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("hr_user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            // Simulate fetching my sensitive details (Bank, ID Card)
            // Or use DB fields now that they exist
            setMyData({
                address: "", // managed by user.address mostly, but fallback here
                bankName: "국민은행", // fallback if DB empty
                accountNumber: "",
                idCardUrl: false,
                bankbookUrl: false,
                healthCertificateUrl: false,
            });
            fetch(`/api/hr/profile?employeeNumber=${parsedUser.employeeNumber}`)
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setUser(data.user);
                        setEditAddress(data.user.address || "");
                        setMyData({
                            address: data.user.address || "",
                            bankName: data.user.bankName || "국민은행",
                            accountNumber: data.user.accountNumber || "",
                            idCardUrl: !!data.user.idCardUrl,
                            bankbookUrl: !!data.user.bankbookUrl,
                            healthCertificateUrl: !!data.user.healthCertificateUrl,
                            healthCertificateExp: data.user.healthCertificateExp || null
                        });
                        if (data.user.healthCertificateExp) {
                            setEditHealthCertExp(new Date(data.user.healthCertificateExp).toISOString().split('T')[0]);
                        }
                    } else {
                        setUser(parsedUser);
                    }
                })
                .catch(() => setUser(parsedUser));
        }
    }, []);

    const formatPhone = (phone: string | null | undefined) => {
        if (!phone) return "미등록";
        const clean = phone.replace(/[^0-9]/g, '');
        if (clean.length === 11) {
            return clean.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        } else if (clean.length === 10) {
            return clean.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }
        return phone;
    };

    if (!user || !myData) return <div style={{ padding: "2rem" }}>데이터를 불러오는 중입니다...</div>;

    const handleOpenEdit = () => {
        setEditName(user.name || "");
        setEditRole(user.role || "");
        setEditJobTitle(user.jobTitle || "");
        setEditStoreName(user.storeName || user.storeId || "");
        setEditPhone(user.phone || "");
        setEditAddress(user.address || myData.address || "");
        setEditBankName(myData.bankName || "");
        setEditAccountNumber(myData.accountNumber || "");
        setEditHealthCertExp(myData.healthCertificateExp ? new Date(myData.healthCertificateExp).toISOString().split('T')[0] : "");
        setIdCardFile(null);
        setBankbookFile(null);
        setHealthCertFile(null);
        setIsEditingInfo(true);
    };

    const handleSaveInfo = async () => {
        try {
            // Send update to real database
            const res = await fetch("/api/hr/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeNumber: user.employeeNumber,
                    name: editName,
                    role: editRole,
                    jobTitle: editJobTitle,
                    storeName: editStoreName,
                    phone: editPhone.replace(/[^0-9]/g, ''), // Strip hyphens on save
                    address: editAddress,
                    bankName: editBankName,
                    accountNumber: editAccountNumber,
                    idCardUrl: idCardFile ? "uploaded" : undefined, // simple mock representation
                    bankbookUrl: bankbookFile ? "uploaded" : undefined,
                    healthCertificateUrl: healthCertFile ? "uploaded" : undefined,
                    healthCertificateExp: editHealthCertExp || undefined,
                })
            });

            if (!res.ok) {
                alert("서버 오류로 인해 업데이트에 실패했습니다.");
                return;
            }

            // Update the local user session info & cache
            const updatedUser = { ...user, name: editName, role: editRole, jobTitle: editJobTitle, storeName: editStoreName, phone: editPhone.replace(/[^0-9]/g, ''), address: editAddress };
            setUser(updatedUser);
            localStorage.setItem("hr_user", JSON.stringify({ ...JSON.parse(localStorage.getItem("hr_user") || "{}"), name: editName, role: editRole, jobTitle: editJobTitle, storeName: editStoreName, phone: editPhone.replace(/[^0-9]/g, '') }));

            // Update the display mock for sensitive files
            setMyData({
                ...myData,
                bankName: editBankName,
                accountNumber: editAccountNumber,
                idCardUrl: idCardFile ? true : myData.idCardUrl,
                bankbookUrl: bankbookFile ? true : myData.bankbookUrl,
                healthCertificateUrl: healthCertFile ? true : myData.healthCertificateUrl,
                healthCertificateExp: editHealthCertExp || myData.healthCertificateExp,
            });

            setIsEditingInfo(false);
            alert("개인정보가 성공적으로 통합 임직원 명부에 업데이트되었습니다.");
        } catch (err) {
            console.error(err);
            alert("네트워크 통신 오류가 발생했습니다.");
        }
    };

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>나의 정보 설정</h1>
                <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                    개인 주소, 계좌번호 및 신분증 사본 등 나의 기본 정보를 관리합니다.
                </p>
            </div>

            <div style={{ background: "white", padding: "2rem", borderRadius: "1rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", maxWidth: "800px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#4b5563" }}>
                        <User size={24} color="#1e3a8a" />
                        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600, color: "#111827" }}>기본 인적 사항 및 보안 문서</h3>
                    </div>
                </div>

                <div style={{ padding: "1.25rem", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.5rem", marginBottom: "2rem", display: "flex", gap: "0.75rem", color: "#166534", fontSize: "0.9rem" }}>
                    <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                    <p style={{ margin: 0, lineHeight: 1.5 }}>
                        <strong>보안 데이터 알림:</strong> 이곳에 등록된 상세 거주지 주소, 신분증 사본, 급여 계좌 및 통장 사본 정보는 <strong>본인과 본사 인사팀 최고 관리자(HR Admin)만 열람</strong>할 수 있도록 시스템 구조적으로 암호화 및 차단되어 있습니다. 소속 매장의 점장 또는 부문장에게도 노출되지 않습니다.
                    </p>
                </div>

                {isEditingInfo ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.9rem", color: "#374151", marginBottom: "0.5rem", fontWeight: 600 }}>본인 이름</label>
                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="이름을 입력하세요" style={{ width: "100%", padding: "0.85rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.95rem" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.9rem", color: "#374151", marginBottom: "0.5rem", fontWeight: 600 }}>직책 / 직급</label>
                                <select value={editJobTitle} onChange={(e) => setEditJobTitle(e.target.value)} style={{ width: "100%", padding: "0.85rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.95rem" }}>
                                    <option value="">직급/직책 선택</option>
                                    <option value="대표이사 (CEO)">대표이사 (CEO)</option>
                                    <option value="전무/관리 본부장">전무/관리 본부장</option>
                                    <option value="임원실 비서실장">임원실 비서실장</option>
                                    <option value="영업본부장">영업본부장</option>
                                    <option value="팀장">팀장</option>
                                    <option value="선임대리">선임대리</option>
                                    <option value="점장">점장</option>
                                    <option value="주방장">주방장</option>
                                    <option value="홀매니저">홀매니저</option>
                                    <option value="사원">사원</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.9rem", color: "#374151", marginBottom: "0.5rem", fontWeight: 600 }}>근무 매장 / 소속</label>
                                <input type="text" value={editStoreName} onChange={(e) => setEditStoreName(e.target.value)} placeholder="예: 코엑스점, 인사팀" style={{ width: "100%", padding: "0.85rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.95rem" }} />
                            </div>
                        </div>

                        <hr style={{ borderTop: "1px solid #e5e7eb", margin: "0.5rem 0" }} />

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.9rem", color: "#374151", marginBottom: "0.5rem", fontWeight: 600 }}>연락처 (휴대폰)</label>
                                <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="010-XXXX-XXXX" style={{ width: "100%", padding: "0.85rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.95rem" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.9rem", color: "#374151", marginBottom: "0.5rem", fontWeight: 600 }}>거주지 주소</label>
                                <input type="text" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="상세 주소를 입력해주세요" style={{ width: "100%", padding: "0.85rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.95rem" }} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: "block", fontSize: "0.9rem", color: "#374151", marginBottom: "0.5rem", fontWeight: 600 }}>급여 수령 은행명</label>
                                <input type="text" value={editBankName} onChange={(e) => setEditBankName(e.target.value)} placeholder="예: 신한은행, 국민은행" style={{ width: "100%", padding: "0.85rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.95rem" }} />
                            </div>
                            <div style={{ flex: 2 }}>
                                <label style={{ display: "block", fontSize: "0.9rem", color: "#374151", marginBottom: "0.5rem", fontWeight: 600 }}>급여 계좌번호 ('-' 제외 숫자만)</label>
                                <input type="text" value={editAccountNumber} onChange={(e) => setEditAccountNumber(e.target.value)} placeholder="계좌번호를 입력하세요" style={{ width: "100%", padding: "0.85rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.95rem" }} />
                            </div>
                        </div>

                        <hr style={{ borderTop: "1px solid #e5e7eb", margin: "1rem 0" }} />

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.9rem", color: "#374151", marginBottom: "0.5rem", fontWeight: 600 }}>주민등록증 / 신분증 사본 (입사 구비용)</label>
                                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #d1d5db", borderRadius: "0.5rem", padding: "2rem", cursor: "pointer", backgroundColor: idCardFile ? "#eff6ff" : "#f9fafb", transition: "all 0.2s" }}>
                                    <Upload size={28} color={idCardFile ? "#3b82f6" : "#9ca3af"} style={{ marginBottom: "0.75rem" }} />
                                    <span style={{ fontSize: "0.9rem", fontWeight: 500, color: idCardFile ? "#1d4ed8" : "#6b7280" }}>{idCardFile ? idCardFile.name : "클릭하여 이미지 파일 업로드"}</span>
                                    <span style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.5rem" }}>최대 5MB, JPG/PNG 지원</span>
                                    <input type="file" accept="image/*,.pdf" onChange={(e) => setIdCardFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
                                </label>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.9rem", color: "#374151", marginBottom: "0.5rem", fontWeight: 600 }}>개인 통장 사본 (급여 이체용)</label>
                                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #d1d5db", borderRadius: "0.5rem", padding: "2rem", cursor: "pointer", backgroundColor: bankbookFile ? "#eff6ff" : "#f9fafb", transition: "all 0.2s" }}>
                                    <Upload size={28} color={bankbookFile ? "#3b82f6" : "#9ca3af"} style={{ marginBottom: "0.75rem" }} />
                                    <span style={{ fontSize: "0.9rem", fontWeight: 500, color: bankbookFile ? "#1d4ed8" : "#6b7280" }}>{bankbookFile ? bankbookFile.name : "클릭하여 이미지 파일 업로드"}</span>
                                    <span style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.5rem" }}>온라인 뱅킹 캡쳐본 가능</span>
                                    <input type="file" accept="image/*,.pdf" onChange={(e) => setBankbookFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
                                </label>
                            </div>

                            {user.brand !== 'HQ' && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={{ display: "block", fontSize: "0.9rem", color: "#374151", fontWeight: 600 }}>보건증 (음식점 종사자 필수)</label>
                                    <label style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #d1d5db", borderRadius: "0.5rem", padding: "1.5rem", cursor: "pointer", backgroundColor: healthCertFile ? "#eff6ff" : "#f9fafb", transition: "all 0.2s" }}>
                                        <Upload size={28} color={healthCertFile ? "#3b82f6" : "#9ca3af"} style={{ marginBottom: "0.75rem" }} />
                                        <span style={{ fontSize: "0.9rem", fontWeight: 500, color: healthCertFile ? "#1d4ed8" : "#6b7280" }}>{healthCertFile ? healthCertFile.name : "클릭하여 보건증 파일 업로드"}</span>
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => setHealthCertFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
                                    </label>
                                    <input
                                        type="date"
                                        value={editHealthCertExp}
                                        onChange={(e) => setEditHealthCertExp(e.target.value)}
                                        style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.9rem", marginTop: "0.25rem" }}
                                        title="보건증 만료일 지정"
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                            <button onClick={() => setIsEditingInfo(false)} style={{ padding: "0.75rem 1.5rem", backgroundColor: "white", border: "1px solid #d1d5db", borderRadius: "0.5rem", color: "#374151", fontWeight: 500, cursor: "pointer" }}>취소</button>
                            <button onClick={handleSaveInfo} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", backgroundColor: "#1e3a8a", border: "none", borderRadius: "0.5rem", color: "white", fontWeight: 600, cursor: "pointer" }}>
                                <Save size={18} /> 정보 덮어쓰기 및 저장
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "1.5rem" }}>
                                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>본인 이름 / 직급</p>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <p style={{ margin: 0, fontSize: "1.1rem", color: "#111827", fontWeight: 600 }}>{user.name}</p>
                                    <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", backgroundColor: "#f3f4f6", color: "#4b5563", borderRadius: "0.25rem", fontSize: "0.85rem", fontWeight: 600 }}>{user.jobTitle || user.role}</span>
                                </div>
                            </div>
                            <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "1.5rem" }}>
                                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>사원 번호 (ID)</p>
                                <p style={{ margin: 0, fontSize: "1.1rem", color: "#111827", fontWeight: 500 }}>{user.employeeNumber || "미등록"}</p>
                            </div>

                            <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "1.5rem" }}>
                                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>소속 브랜드 / 부서</p>
                                <p style={{ margin: 0, fontSize: "1.1rem", color: "#111827", fontWeight: 500 }}>
                                    {user.brand || "AGRA"} / {user.department || "매장"}
                                </p>
                            </div>
                            <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "1.5rem" }}>
                                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>근무 매장 (사업장)</p>
                                <p style={{ margin: 0, fontSize: "1.1rem", color: "#111827", fontWeight: 500 }}>{user.storeName || user.storeId || "미등록"}</p>
                            </div>

                            <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "1.5rem" }}>
                                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>휴대폰 연락처</p>
                                <p style={{ margin: 0, fontSize: "1.1rem", color: "#111827", fontWeight: 500 }}>{formatPhone(user.phone)}</p>
                            </div>
                            <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "1.5rem" }}>
                                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>입사일</p>
                                <p style={{ margin: 0, fontSize: "1.1rem", color: "#111827", fontWeight: 500 }}>
                                    {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "미등록"}
                                </p>
                            </div>

                            <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "1.5rem" }}>
                                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>2단계 인증 (2FA) 설정 상태</p>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: user.is2faEnabled ? "#10b981" : "#ef4444" }}></div>
                                    <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: user.is2faEnabled ? "#059669" : "#dc2626" }}>
                                        {user.is2faEnabled ? "사용 중 (보안 강함)" : "미사용 (설정 권장)"}
                                    </p>
                                </div>
                            </div>
                            <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "1.5rem" }}>
                                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>현 거주지 주소</p>
                                <p style={{ margin: 0, fontSize: "1.1rem", color: "#111827", fontWeight: 500 }}>{user.address || myData.address || "미등록"}</p>
                            </div>
                            <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "1.5rem" }}>
                                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>급여 수령 계좌</p>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", backgroundColor: "#eff6ff", color: "#2563eb", borderRadius: "0.25rem", fontSize: "0.85rem", fontWeight: 600 }}>{myData.bankName || "미등록"}</span>
                                    <p style={{ margin: 0, fontSize: "1.1rem", color: "#111827", fontWeight: 500, letterSpacing: "1px" }}>{myData.accountNumber || "등록된 계좌가 없습니다."}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: user.brand !== 'HQ' ? "1fr 1fr 1fr" : "1fr 1fr", gap: "1rem", padding: "1.5rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>인사 기록용 신분증 사본</p>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: myData.idCardUrl ? "#10b981" : "#ef4444" }}></div>
                                    <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: myData.idCardUrl ? "#059669" : "#dc2626" }}>
                                        {myData.idCardUrl ? "정상 제출 완료" : "미제출 (요청 요망)"}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>급여 이체용 통장 사본</p>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: myData.bankbookUrl ? "#10b981" : "#ef4444" }}></div>
                                    <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: myData.bankbookUrl ? "#059669" : "#dc2626" }}>
                                        {myData.bankbookUrl ? "정상 제출 완료" : "미제출 (요청 요망)"}
                                    </p>
                                </div>
                            </div>
                            {user.brand !== 'HQ' && (
                                <div>
                                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>매장용 보건증 (유효기간)</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: myData.healthCertificateUrl ? "#10b981" : "#ef4444" }}></div>
                                        <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: myData.healthCertificateUrl ? "#059669" : "#dc2626" }}>
                                            {myData.healthCertificateUrl ? `제출됨 (~${myData.healthCertificateExp ? new Date(myData.healthCertificateExp).toLocaleDateString() : '?'})` : "미제출 (필수)"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                            <button onClick={handleOpenEdit} style={{ padding: "0.75rem 1.5rem", backgroundColor: "white", border: "1px solid #d1d5db", borderRadius: "0.5rem", color: "#111827", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}>
                                정보 갱신 및 사본 업데이트
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
