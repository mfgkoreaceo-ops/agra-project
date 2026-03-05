"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { useHR, Employee, EmployeeRole, Brand } from "./HRContext";

const AUTH_SECRET = process.env.NEXT_PUBLIC_HR_ENCRYPTION_KEY || "fallback_agra_hr_secret_key_2026";

// --- Types ---

export interface SessionData {
    uid: string; // employeeId
    employeeNumber: string;
    name: string;
    role: EmployeeRole;
    brand: Brand;
    storeId: string;
    timestamp: number;
}

type AuthContextType = {
    session: SessionData | null;
    isLoaded: boolean;
    login: (employeeNumber: string, passwordMock: string) => boolean;
    logout: () => void;
};

// --- Context ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { hrState } = useHR();
    const [session, setSession] = useState<SessionData | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem("agra_hr_session");
        if (storedToken) {
            try {
                const bytes = CryptoJS.AES.decrypt(storedToken, AUTH_SECRET);
                const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
                if (decryptedData) {
                    const parsed = JSON.parse(decryptedData) as SessionData;
                    // Check if session expired (e.g., after 24 hours) - simplified for MVP
                    const oneDay = 24 * 60 * 60 * 1000;
                    if (Date.now() - parsed.timestamp < oneDay) {
                        setSession(parsed);
                    } else {
                        localStorage.removeItem("agra_hr_session"); // expired
                    }
                }
            } catch (e) {
                console.error("Invalid session token", e);
                localStorage.removeItem("agra_hr_session");
            }
        }
        setIsLoaded(true);
    }, []);

    const login = (employeeNumber: string, passwordMock: string): boolean => {
        // In this MVP, any password "1234" works if the employeeNumber exists in HRContext
        if (passwordMock !== "1234") return false;

        const employee = hrState.employees.find(e => e.employeeNumber === employeeNumber);

        if (employee) {
            const newSession: SessionData = {
                uid: employee.id,
                employeeNumber: employee.employeeNumber,
                name: employee.name,
                role: employee.role,
                brand: employee.brand,
                storeId: employee.storeId,
                timestamp: Date.now()
            };

            setSession(newSession);

            // Encrypt session token
            const token = CryptoJS.AES.encrypt(JSON.stringify(newSession), AUTH_SECRET).toString();
            localStorage.setItem("agra_hr_session", token);
            return true;
        }
        return false;
    };

    const logout = () => {
        setSession(null);
        localStorage.removeItem("agra_hr_session");
    };

    return (
        <AuthContext.Provider value={{ session, isLoaded, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
