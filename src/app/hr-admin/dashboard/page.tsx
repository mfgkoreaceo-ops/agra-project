"use client";

import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useHR } from "../HRContext";
import { CreditCard, Calendar, Eye, EyeOff, LayoutDashboard, Plus, X, AlertCircle, AlertTriangle, Save, Upload, User, ShieldCheck } from "lucide-react";

export default function PersonalDashboard() {
    const { session } = useAuth();
    const { hrState, updateHRState } = useHR();
    const [showSalary, setShowSalary] = useState(false);
    const [showLeaveForm, setShowLeaveForm] = useState(false);
    const [leaveStart, setLeaveStart] = useState("");
    const [leaveEnd, setLeaveEnd] = useState("");
    const [leaveReason, setLeaveReason] = useState("");

    // Personal Info Edit State
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editAddress, setEditAddress] = useState("");
    const [editBankName, setEditBankName] = useState("");
    const [editAccountNumber, setEditAccountNumber] = useState("");
    const [idCardFile, setIdCardFile] = useState<File | null>(null);
    const [bankbookFile, setBankbookFile] = useState<File | null>(null);
    const [healthCertFile, setHealthCertFile] = useState<File | null>(null);
    const [healthCertIssueDate, setHealthCertIssueDate] = useState("");

    // Add return null to prevent rendering issues if session is somehow not ready
    if (!session) return null;

    // Find personal data
    const myData = hrState.employees.find(e => e.id === session.uid);
    if (!myData) return <div>직원 정보를 찾을 수 없습니다.</div>;

    // Initialize edit form when opening
    const handleOpenEdit = () => {
        setEditAddress(myData.address || "");
        setEditBankName(myData.bankName || "");
        setEditAccountNumber(myData.accountNumber || "");
        setIdCardFile(null);
        setBankbookFile(null);
        setHealthCertFile(null);
        setHealthCertIssueDate(""); // They must re-enter if they upload a new one
        setIsEditingInfo(true);
    };

    const handleSaveInfo = async () => {
        const expDate = healthCertIssueDate ? new Date(new Date(healthCertIssueDate).setFullYear(new Date(healthCertIssueDate).getFullYear() + 1)).toISOString() : myData.healthCertificateExp;

        const updatedEmployee = {
            ...myData,
            address: editAddress,
            bankName: editBankName,
            accountNumber: editAccountNumber,
            idCardUrl: idCardFile ? `virtual-path-to-id-${Date.now()}` : myData.idCardUrl,
            bankbookUrl: bankbookFile ? `virtual-path-to-bank-${Date.now()}` : myData.bankbookUrl,
            healthCertificateUrl: healthCertFile ? `virtual-path-to-health-${Date.now()}` : myData.healthCertificateUrl,
            healthCertificateExp: expDate,
        };

        const newEmployees = hrState.employees.map(e => e.id === session.uid ? updatedEmployee : e);
        updateHRState({ employees: newEmployees });

        try {
            await fetch('/api/hr/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeNumber: session.uid,
                    address: editAddress,
                    bankName: editBankName,
                    accountNumber: editAccountNumber,
                    healthCertificateUrl: updatedEmployee.healthCertificateUrl,
                    healthCertificateExp: updatedEmployee.healthCertificateExp
                })
            });
        } catch (e) {
            console.error("Failed to sync personal info to DB", e);
        }

        setIsEditingInfo(false);
        alert("개인정보가 성공적으로 업데이트되었습니다.");
    };

    const remainingLeave = myData.annualLeaveTotal - myData.annualLeaveUsed;

    // Check health certificate expiration status
    let healthCertWarning = false;
    let daysToHealthCertExp = null;
    if (myData.healthCertificateExp) {
        const expDate = new Date(myData.healthCertificateExp);
        const diffTime = expDate.getTime() - new Date().getTime();
        daysToHealthCertExp = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysToHealthCertExp <= 30) {
            healthCertWarning = true;
        }
    } else {
        healthCertWarning = true; // No cert uploaded
    }

    // Calculate Pending Leaves
    const myPendingRecords = hrState.leaveRecords.filter(r => r.employeeId === session.uid && r.status === "Pending");
    const pendingDays = myPendingRecords.reduce((sum, r) => sum + r.daysUsed, 0);
    const availableToRequest = remainingLeave - pendingDays;

    const leavePercentage = (myData.annualLeaveUsed / myData.annualLeaveTotal) * 100;

    const calculateDays = (start: string, end: string) => {
        if (!start || !end) return 0;
        const d1 = new Date(start);
        const d2 = new Date(end);
        if (d2 < d1) return -1;
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
    };

    const daysRequested = calculateDays(leaveStart, leaveEnd);

    const handleSubmitLeave = () => {
        if (!leaveStart || !leaveEnd || !leaveReason) {
            alert("모든 필드를 입력해주세요.");
            return;
        }
        if (daysRequested <= 0) {
            alert("종료일은 시작일보다 빠를 수 없습니다.");
            return;
        }
        if (daysRequested > availableToRequest) {
            alert(`잔여 연차(${availableToRequest}일)를 초과하여 신청할 수 없습니다. (신청일: ${daysRequested}일)`);
            return;
        }

        const newRecord = {
            id: `leave-${Date.now()}`,
            employeeId: session.uid,
            startDate: leaveStart,
            endDate: leaveEnd,
            daysUsed: daysRequested,
            reason: leaveReason,
            status: "Pending" as "Pending",
            requestDate: new Date().toISOString().split("T")[0]
        };

        updateHRState({ leaveRecords: [newRecord, ...hrState.leaveRecords] });
        setShowLeaveForm(false);
        setLeaveStart(""); setLeaveEnd(""); setLeaveReason("");
        alert("연차 신청이 완료되었습니다. 관리자 승인을 대기합니다.");
    };

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    안녕하세요, {session.name} 님 👋
                </h2>
                <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                    {session.brand} {myData.storeName} | {session.role}
                </p>
            </div>

            {session.role === "HR Admin" ? (
                <div style={{ padding: "4rem 2rem", background: "white", borderRadius: "0.75rem", border: "1px solid #e5e7eb", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <LayoutDashboard size={48} color="#9ca3af" style={{ margin: "0 auto 1.5rem auto" }} />
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>관리자 대시보드</h3>
                    <p style={{ color: "#6b7280", fontSize: "0.95rem", maxWidth: "400px", margin: "0 auto" }}>
                        인사팀 최고 관리자 계정은 개별 인사위젯 대신 [전체 직원 명부] 및 [근태 승인 관리] 탭에서 모든 임직원의 통합 데이터를 관리합니다.<br /><br />
                        임직원의 민감 정보(주소, 계좌, 사본) 열람 및 수정은 좌측 메뉴의 <strong>[전체 직원 명부]</strong>에서 해당 직원을 클릭하여 진행해 주세요.
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

                        {/* Salary Widget */}
                        <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#4f46e5" }}>
                                    <CreditCard size={20} />
                                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#111827" }}>당월 급여 명세</h3>
                                </div>
                                <button
                                    onClick={() => setShowSalary(!showSalary)}
                                    style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", transition: "background 0.2s" }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                    {showSalary ? <><EyeOff size={16} /> 숨기기</> : <><Eye size={16} /> 보기</>}
                                </button>
                            </div>

                            <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px dashed #e5e7eb" }}>
                                <p style={{ margin: 0, color: "#6b7280", fontSize: "0.85rem", marginBottom: "0.25rem" }}>실 수령액 (Net Pay)</p>
                                {showSalary ? (
                                    <h4 style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#111827" }}>
                                        {myData.baseSalary.toLocaleString()} <span style={{ fontSize: "1rem", color: "#6b7280", fontWeight: "normal" }}>원</span>
                                    </h4>
                                ) : (
                                    <div style={{ height: "40px", display: "flex", alignItems: "center" }}>
                                        <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#d1d5db", letterSpacing: "4px", lineHeight: 1 }}>••••••••</div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                                <div style={{ color: "#6b7280" }}>지급 계좌</div>
                                <div style={{ fontWeight: 500, color: "#374151" }}>{myData.bankName} {showSalary ? myData.accountNumber : "••••-••-••••"}</div>
                            </div>
                        </div>

                        {/* Leave Widget */}
                        <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#059669" }}>
                                    <Calendar size={20} />
                                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#111827" }}>나의 연차 현황</h3>
                                </div>
                                <button onClick={() => setShowLeaveForm(true)} className="btn-hr btn-hr-outline" style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.5rem", fontSize: "0.85rem", borderColor: "#10b981", color: "#10b981" }}>
                                    <Plus size={14} /> 연차 신청
                                </button>
                            </div>

                            <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
                                <div>
                                    <p style={{ margin: 0, color: "#6b7280", fontSize: "0.85rem" }}>실사용 가능 연차</p>
                                    <h4 style={{ margin: "0.25rem 0 0 0", fontSize: "1.75rem", fontWeight: "bold", color: availableToRequest > 3 ? "#059669" : "#dc2626" }}>
                                        {availableToRequest} <span style={{ fontSize: "1rem", color: "#6b7280", fontWeight: "normal" }}>일</span>
                                    </h4>
                                    {pendingDays > 0 && (
                                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#d97706" }}>승인 대기 중: {pendingDays}일</p>
                                    )}
                                </div>
                                <div>
                                    <p style={{ margin: 0, color: "#6b7280", fontSize: "0.85rem" }}>총 발생 연차</p>
                                    <h4 style={{ margin: "0.25rem 0 0 0", fontSize: "1.75rem", fontWeight: "bold", color: "#374151" }}>
                                        {myData.annualLeaveTotal} <span style={{ fontSize: "1rem", color: "#6b7280", fontWeight: "normal" }}>일</span>
                                    </h4>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ marginBottom: "0.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                                    <span>사용률</span>
                                    <span>{leavePercentage.toFixed(0)}% 사용</span>
                                </div>
                                <div style={{ width: "100%", height: "8px", backgroundColor: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                                    <div style={{ width: `${Math.min(100, leavePercentage)}%`, height: "100%", backgroundColor: leavePercentage > 90 ? "#dc2626" : "#059669", transition: "width 0.5s ease-out" }}></div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827", margin: "0 0 1rem 0" }}>사내 공지 (Notice)</h3>
                        <div style={{ padding: "1.5rem", border: "1px dashed #d1d5db", borderRadius: "0.375rem", backgroundColor: "#f9fafb", color: "#4b5563", fontSize: "0.95rem" }}>
                            <strong>[인사팀]</strong> 2026년 상반기 성과급 지급은 3월 10일에 각 급여 계좌로 입금될 예정입니다. 자세한 내용은 이메일을 확인해 주세요.
                        </div>
                    </div>

                    {/* Personal Info Edit Widget */}
                    <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#4b5563" }}>
                                <User size={20} />
                                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#111827" }}>개인정보 관리</h3>
                            </div>
                        </div>

                        {healthCertWarning && (
                            <div style={{ padding: "1rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.5rem", marginBottom: "1.5rem", display: "flex", gap: "0.75rem", color: "#b91c1c" }}>
                                <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                                <div>
                                    <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.95rem", fontWeight: "bold" }}>보건증 등재 필요 / 만료 임박</h4>
                                    <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.5 }}>
                                        {daysToHealthCertExp !== null
                                            ? `보건증 만료일이 ${daysToHealthCertExp}일 남았습니다. (만료일: ${new Date(myData.healthCertificateExp!).toLocaleDateString()}) 원활한 매장 근무를 위해 기간 내에 갱신 후 재업로드 해주시기 바랍니다.`
                                            : "보건증이 아직 시스템에 등재되지 않았습니다. 매장 근무 전에 반드시 보건증을 업로드해주세요."}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div style={{ padding: "1rem", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.5rem", marginBottom: "1.5rem", display: "flex", gap: "0.5rem", color: "#166534", fontSize: "0.85rem" }}>
                            <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                            <p style={{ margin: 0, lineHeight: 1.5 }}>
                                <strong>보안 알림:</strong> 이곳에 등록된 개인 주소, 주민등록증 사본, 급여 계좌 및 통장 사본은 <strong>본인과 인사팀 최고 관리자(HR Admin)만 열람</strong>할 수 있습니다. 각 매장 점장 및 부분장 등 다른 관리자에게는 절대 노출되지 않는 민감 정보입니다.
                            </p>
                        </div>

                        {isEditingInfo ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", color: "#374151", marginBottom: "0.25rem" }}>거주지 주소</label>
                                    <input type="text" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="상세 주소를 입력해주세요" style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.25rem" }} />
                                </div>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: "block", fontSize: "0.85rem", color: "#374151", marginBottom: "0.25rem" }}>급여 은행명</label>
                                        <input type="text" value={editBankName} onChange={(e) => setEditBankName(e.target.value)} placeholder="예: 신한은행" style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.25rem" }} />
                                    </div>
                                    <div style={{ flex: 2 }}>
                                        <label style={{ display: "block", fontSize: "0.85rem", color: "#374151", marginBottom: "0.25rem" }}>급여 계좌번호 (- 제외)</label>
                                        <input type="text" value={editAccountNumber} onChange={(e) => setEditAccountNumber(e.target.value)} placeholder="계좌번호 입력" style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.25rem" }} />
                                    </div>
                                </div>

                                <hr style={{ borderTop: "1px solid #e5e7eb", margin: "1rem 0" }} />

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.85rem", color: "#374151", marginBottom: "0.5rem", fontWeight: "bold" }}>신분증 사본 (주민/면허증)</label>
                                        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #d1d5db", borderRadius: "0.5rem", padding: "1.5rem", cursor: "pointer", backgroundColor: idCardFile ? "#eff6ff" : "#f9fafb" }}>
                                            <Upload size={24} color={idCardFile ? "#3b82f6" : "#9ca3af"} style={{ marginBottom: "0.5rem" }} />
                                            <span style={{ fontSize: "0.85rem", color: idCardFile ? "#1d4ed8" : "#6b7280" }}>{idCardFile ? idCardFile.name : "클릭하여 이미지 업로드"}</span>
                                            <input type="file" accept="image/*,.pdf" onChange={(e) => setIdCardFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
                                        </label>
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.85rem", color: "#374151", marginBottom: "0.5rem", fontWeight: "bold" }}>통장 사본 (급여 계좌)</label>
                                        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #d1d5db", borderRadius: "0.5rem", padding: "1.5rem", cursor: "pointer", backgroundColor: bankbookFile ? "#eff6ff" : "#f9fafb" }}>
                                            <Upload size={24} color={bankbookFile ? "#3b82f6" : "#9ca3af"} style={{ marginBottom: "0.5rem" }} />
                                            <span style={{ fontSize: "0.75rem", color: bankbookFile ? "#1d4ed8" : "#6b7280", textAlign: "center", wordBreak: "break-all" }}>{bankbookFile ? bankbookFile.name : "업로드"}</span>
                                            <input type="file" accept="image/*,.pdf" onChange={(e) => setBankbookFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
                                        </label>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <label style={{ display: "block", fontSize: "0.85rem", color: "#374151", marginBottom: "0.5rem", fontWeight: "bold" }}>보건증 사본</label>
                                        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #d1d5db", borderRadius: "0.5rem", padding: "1rem", cursor: "pointer", backgroundColor: healthCertFile ? "#eff6ff" : "#f9fafb", flex: 1 }}>
                                            <Upload size={20} color={healthCertFile ? "#3b82f6" : "#9ca3af"} style={{ marginBottom: "0.25rem" }} />
                                            <span style={{ fontSize: "0.75rem", color: healthCertFile ? "#1d4ed8" : "#6b7280", textAlign: "center", wordBreak: "break-all" }}>{healthCertFile ? healthCertFile.name : "업로드"}</span>
                                            <input type="file" accept="image/*,.pdf" onChange={(e) => setHealthCertFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
                                        </label>
                                        {healthCertFile && (
                                            <div style={{ marginTop: "0.5rem" }}>
                                                <label style={{ display: "block", fontSize: "0.75rem", color: "#ef4444", marginBottom: "0.25rem", fontWeight: "bold" }}>발급일 입력 (필수)*</label>
                                                <input type="date" required value={healthCertIssueDate} onChange={e => setHealthCertIssueDate(e.target.value)} style={{ width: "100%", padding: "0.5rem", fontSize: "0.8rem", border: "1px solid #fca5a5", borderRadius: "0.25rem", backgroundColor: "#fef2f2" }} />
                                                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.7rem", color: "#6b7280" }}>발급일로부터 1년이 만료일로 지정됩니다.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                                    <button onClick={() => setIsEditingInfo(false)} className="btn-hr btn-hr-outline">취소</button>
                                    <button onClick={handleSaveInfo} className="btn-hr btn-hr-primary" style={{ display: "flex", alignItems: "center", gap: "0.25rem", backgroundColor: "#1f2937", borderColor: "#1f2937" }}>
                                        <Save size={16} /> 변경 내용 저장
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>거주지 주소</p>
                                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "1rem", color: "#111827", fontWeight: 500 }}>{myData.address || "미등록"}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>급여 계좌</p>
                                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "1rem", color: "#111827", fontWeight: 500 }}>{myData.bankName} {myData.accountNumber || "미등록"}</p>
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem" }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>신분증 사본 제출</p>
                                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.95rem", fontWeight: "bold", color: myData.idCardUrl ? "#059669" : "#dc2626" }}>
                                            {myData.idCardUrl ? "제출 완료" : "미제출"}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>통장 사본 제출</p>
                                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.95rem", fontWeight: "bold", color: myData.bankbookUrl ? "#059669" : "#dc2626" }}>
                                            {myData.bankbookUrl ? "제출 완료" : "미제출"}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>보건증 만료일</p>
                                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.95rem", fontWeight: "bold", color: healthCertWarning ? "#dc2626" : "#059669" }}>
                                            {myData.healthCertificateExp ? new Date(myData.healthCertificateExp).toLocaleDateString() : "미제출"}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <button onClick={handleOpenEdit} className="btn-hr btn-hr-outline" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                        정보 및 사본 업데이트
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Leave Request Form Modal */}
            {showLeaveForm && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "0.5rem", width: "450px", maxWidth: "90%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#111827" }}>연차 신청서</h3>
                            <button onClick={() => setShowLeaveForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
                                <X size={20} />
                            </button>
                        </div>

                        {availableToRequest <= 0 ? (
                            <div style={{ display: "flex", gap: "0.5rem", padding: "1rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "0.25rem", marginBottom: "1.5rem" }}>
                                <AlertCircle size={20} />
                                <span>사용 가능한 잔여 연차가 없습니다. 신청이 불가능합니다.</span>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: "block", fontSize: "0.85rem", color: "#374151", marginBottom: "0.25rem" }}>시작일</label>
                                        <input type="date" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.25rem" }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: "block", fontSize: "0.85rem", color: "#374151", marginBottom: "0.25rem" }}>종료일</label>
                                        <input type="date" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.25rem" }} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: "2rem" }}>
                                    <label style={{ display: "block", fontSize: "0.85rem", color: "#374151", marginBottom: "0.25rem" }}>사유</label>
                                    <input type="text" placeholder="예: 개인 사정, 가족 행사 등" value={leaveReason} onChange={e => setLeaveReason(e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.25rem" }} />
                                </div>

                                {daysRequested > 0 && (
                                    <div style={{ padding: "0.75rem", backgroundColor: "#f3f4f6", borderRadius: "0.25rem", marginBottom: "1.5rem", fontSize: "0.9rem", color: "#374151", display: "flex", justifyContent: "space-between" }}>
                                        <span>신청 일수: <strong>{daysRequested}일</strong></span>
                                        <span style={{ color: daysRequested > availableToRequest ? "#dc2626" : "#059669" }}>
                                            (잔여 연차: {availableToRequest}일)
                                        </span>
                                    </div>
                                )}
                            </>
                        )}

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                            <button onClick={() => setShowLeaveForm(false)} className="btn-hr btn-hr-outline">취소</button>
                            <button onClick={handleSubmitLeave} disabled={availableToRequest <= 0 || daysRequested <= 0 || daysRequested > availableToRequest || !leaveStart || !leaveEnd || !leaveReason} className="btn-hr btn-hr-primary" style={{ opacity: (availableToRequest <= 0 || daysRequested <= 0 || daysRequested > availableToRequest || !leaveStart || !leaveEnd || !leaveReason) ? 0.5 : 1 }}>
                                신청 상신
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
