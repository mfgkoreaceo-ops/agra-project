"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import CryptoJS from "crypto-js";

// Ensure a fallback key exists for development if env var is missing
const SECRET_KEY = process.env.NEXT_PUBLIC_HR_ENCRYPTION_KEY || "fallback_agra_hr_secret_key_2026";

// --- Types & Interfaces ---

export type Brand = "AGRA" | "NOYA" | "HQ";
export type EmploymentType = "Full-Time" | "Contract" | "Part-Time";
export type EmployeeRole = "Store Manager" | "Area Manager" | "Assistant Manager" | "Chef" | "Kitchen Staff" | "Hall Staff" | "HR Admin";
export type EmployeeStatus = "Active" | "On Leave" | "Resigned";

export interface Employee {
    id: string;
    employeeNumber: string;
    name: string;
    brand: Brand;
    storeId: string;
    storeName: string;
    department: string;
    role: EmployeeRole;
    employmentType: EmploymentType;
    status: EmployeeStatus;
    phone: string;
    email: string;
    address: string;
    joinDate: string;
    resignationDate?: string;
    annualLeaveTotal: number;
    annualLeaveUsed: number;
    baseSalary: number;
    bankName: string;
    accountNumber: string;
    bankbookUrl?: string; // 통장 사본
    idCardUrl?: string; // 신분증 사본
    healthCertificateUrl?: string | null;
    healthCertificateExp?: string | null;
}

export interface LeaveRecord {
    id: string;
    employeeId: string;
    startDate: string;
    endDate: string;
    daysUsed: number;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
    requestDate: string;
}

export interface PayrollRecord {
    id: string;
    employeeId: string;
    month: string;
    baseSalary: number;
    bonus: number;
    deductions: number;
    netPay: number;
    paymentDate: string;
    status: "Draft" | "Paid";
}

export interface HRState {
    employees: Employee[];
    leaveRecords: LeaveRecord[];
    payrollRecords: PayrollRecord[];
}

// --- Dummy Init Data ---

const defaultHRState: HRState = {
    employees: [
        {
            id: "emp-1", employeeNumber: "AG-2024-001", name: "인사팀 관리자", brand: "HQ", storeId: "hq", storeName: "본사",
            department: "운영팀", role: "HR Admin", employmentType: "Full-Time", status: "Active",
            phone: "010-1234-5678", email: "admin@agra.co.kr", address: "서울시 종로구", joinDate: "2024-01-15",
            annualLeaveTotal: 15, annualLeaveUsed: 3, baseSalary: 4500000, bankName: "신한은행", accountNumber: "110-123-456789"
        },
        {
            id: "emp-2", employeeNumber: "AG-2025-012", name: "이점장", brand: "AGRA", storeId: "1", storeName: "아그라 센터필드점",
            department: "매장운영", role: "Store Manager", employmentType: "Full-Time", status: "Active",
            phone: "010-2345-6789", email: "store1@agra.co.kr", address: "서울시 강남구", joinDate: "2025-03-01",
            annualLeaveTotal: 12, annualLeaveUsed: 5, baseSalary: 3800000, bankName: "국민은행", accountNumber: "987-65-43210"
        },
        {
            id: "emp-2-5", employeeNumber: "AG-2023-011", name: "최부분", brand: "AGRA", storeId: "area-1", storeName: "강남지역본부",
            department: "매장운영", role: "Area Manager", employmentType: "Full-Time", status: "Active",
            phone: "010-9999-8888", email: "area1@agra.co.kr", address: "서울시 강남구", joinDate: "2023-01-10",
            annualLeaveTotal: 15, annualLeaveUsed: 1, baseSalary: 5000000, bankName: "신한은행", accountNumber: "123-456-789"
        },
        {
            id: "emp-3", employeeNumber: "NY-2025-005", name: "박주방", brand: "NOYA", storeId: "noya-1", storeName: "노야 강남점",
            department: "주방", role: "Chef", employmentType: "Full-Time", status: "Active",
            phone: "010-3456-7890", email: "chef@noya.co.kr", address: "경기도 성남시", joinDate: "2025-06-10",
            annualLeaveTotal: 12, annualLeaveUsed: 1, baseSalary: 4000000, bankName: "우리은행", accountNumber: "1002-123-45678"
        }
    ],
    leaveRecords: [
        {
            id: "leave-dummy-1",
            employeeId: "emp-2", // 이점장 (Store Manager)
            startDate: "2026-03-20",
            endDate: "2026-03-21",
            daysUsed: 2,
            reason: "개인 사유",
            status: "Pending",
            requestDate: "2026-02-26"
        }
    ],
    payrollRecords: []
};

// --- Context Setup ---

type HRContextType = {
    hrState: HRState;
    updateHRState: (newState: Partial<HRState>) => void;
};

const HRContext = createContext<HRContextType | undefined>(undefined);

// --- Provider ---

export function HRProvider({ children }: { children: React.ReactNode }) {
    const [hrState, setHrState] = useState<HRState>(defaultHRState);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load and Decrypt
    useEffect(() => {
        const encryptedStored = localStorage.getItem("agra_hr_db_secure");
        if (encryptedStored) {
            try {
                // Decrypt
                const bytes = CryptoJS.AES.decrypt(encryptedStored, SECRET_KEY);
                const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
                if (decryptedData) {
                    setHrState(JSON.parse(decryptedData));
                }
            } catch (e) {
                console.error("Failed to decrypt HR data from LocalStorage:", e);
                // Fallback to default if decryption fails (e.g. key change or corrupt data)
                setHrState(defaultHRState);
            }
        }
        setIsLoaded(true);
    }, []);

    // Update and Encrypt
    const updateHRState = (newState: Partial<HRState>) => {
        const updated = { ...hrState, ...newState };
        setHrState(updated);
        try {
            // Encrypt
            const cipherText = CryptoJS.AES.encrypt(JSON.stringify(updated), SECRET_KEY).toString();
            localStorage.setItem("agra_hr_db_secure", cipherText);
        } catch (error) {
            console.error("Failed to encrypt and save HR data:", error);
            alert("HR 데이터 저장 중 오류가 발생했습니다.");
        }
    };

    if (!isLoaded) return null; // Hydration mismatch prevention

    return (
        <HRContext.Provider value={{ hrState, updateHRState }}>
            {children}
        </HRContext.Provider>
    );
}

export function useHR() {
    const context = useContext(HRContext);
    if (context === undefined) {
        throw new Error("useHR must be used within an HRProvider");
    }
    return context;
}
