const fs = require('fs');
const path = require('path');

const pageTemplate = (title, description, docField, docUrlField, isHealthCert) => '"use client";\n' +
'\n' +
'import React, { useState, useEffect, useMemo } from "react";\n' +
'import { Search, ArrowUpDown, Download, Image as ImageIcon } from "lucide-react";\n' +
'import MultiSelectFilter from "@/components/MultiSelectFilter";\n' +
'\n' +
'type Employee = {\n' +
'    id: string;\n' +
'    employeeNumber: string;\n' +
'    name: string;\n' +
'    brand: string;\n' +
'    storeName: string;\n' +
'    department: string;\n' +
'    role: string;\n' +
'    status: string;\n' +
'    idCardUrl?: string | null;\n' +
'    bankbookUrl?: string | null;\n' +
'    healthCertificateUrl?: string | null;\n' +
'    healthCertificateExp?: string | null;\n' +
'};\n' +
'\n' +
'const getSmartStoreDepartmentDisplay = (emp: Employee) => {\n' +
'    if (!emp) return "-";\n' +
'    const store = emp.storeName?.trim() || "";\n' +
'    const dept = emp.department?.trim() || "";\n' +
'    if (!dept || dept === "-") return store;\n' +
'    if (!store || store === "-") return dept;\n' +
'    if (store === dept) return store;\n' +
'    if (store === "본사") return dept;\n' +
'    if (store.includes(dept)) return store;\n' +
'    if (dept.includes(store)) return dept;\n' +
'    return `${store} / ${dept}`;\n' +
'};\n' +
'\n' +
'export default function DocumentTrackerPage() {\n' +
'    const [employees, setEmployees] = useState<Employee[]>([]);\n' +
'    const [loading, setLoading] = useState(true);\n' +
'    const [searchTerm, setSearchTerm] = useState("");\n' +
'    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);\n' +
'    const [storeFilter, setStoreFilter] = useState<string[]>([]);\n' +
'    \n' +
'    useEffect(() => {\n' +
'        const fetchEmployees = async () => {\n' +
'            setLoading(true);\n' +
'            try {\n' +
'                const storedUser = localStorage.getItem("hr_user");\n' +
'                if (!storedUser) return;\n' +
'                const user = JSON.parse(storedUser);\n' +
'                const res = await fetch(`/api/hr/employees?requesterId=${user.employeeNumber}&_t=${Date.now()}`);\n' +
'                const data = await res.json();\n' +
'                setEmployees(Array.isArray(data) ? data.filter(e => e.status !== "RESIGNED" && e.status !== "퇴사") : []);\n' +
'            } catch (error) {\n' +
'                console.error("Failed to load employees for docs", error);\n' +
'            } finally {\n' +
'                setLoading(false);\n' +
'            }\n' +
'        };\n' +
'        fetchEmployees();\n' +
'    }, []);\n' +
'\n' +
'    const storeList = useMemo(() => {\n' +
'        const stores = new Set<string>();\n' +
'        employees.forEach(emp => { if (emp.storeName) stores.add(emp.storeName); });\n' +
'        return Array.from(stores).sort();\n' +
'    }, [employees]);\n' +
'\n' +
'    const handleSort = (key: string) => {\n' +
'        let direction: "asc" | "desc" = "asc";\n' +
'        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";\n' +
'        setSortConfig({ key, direction });\n' +
'    };\n' +
'\n' +
'    const hasDocument = (emp: Employee) => !!emp["' + docUrlField + '" as keyof Employee];\n' +
'\n' +
'    const sortedAndFiltered = useMemo(() => {\n' +
'        let result = [...employees];\n' +
'\n' +
'        if (searchTerm) {\n' +
'            const lowerSearch = searchTerm.toLowerCase();\n' +
'            result = result.filter(e =>\n' +
'                e.name.toLowerCase().includes(lowerSearch) ||\n' +
'                e.employeeNumber.toLowerCase().includes(lowerSearch) ||\n' +
'                (e.storeName && e.storeName.toLowerCase().includes(lowerSearch))\n' +
'            );\n' +
'        }\n' +
'\n' +
'        if (storeFilter.length > 0) {\n' +
'            result = result.filter(e => storeFilter.includes(e.storeName));\n' +
'        }\n' +
'\n' +
'        if (sortConfig) {\n' +
'            result.sort((a, b) => {\n' +
'                let aValue: any = "";\n' +
'                let bValue: any = "";\n' +
'\n' +
'                if (sortConfig.key === "status") {\n' +
'                    aValue = hasDocument(a) ? 1 : 0;\n' +
'                    bValue = hasDocument(b) ? 1 : 0;\n' +
'                } else if (sortConfig.key === "exp" && ' + isHealthCert + ') {\n' +
'                    aValue = a.healthCertificateExp ? new Date(a.healthCertificateExp as string).getTime() : 0;\n' +
'                    bValue = b.healthCertificateExp ? new Date(b.healthCertificateExp as string).getTime() : 0;\n' +
'                } else {\n' +
'                    aValue = a[sortConfig.key as keyof Employee] || "";\n' +
'                    bValue = b[sortConfig.key as keyof Employee] || "";\n' +
'                }\n' +
'\n' +
'                if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;\n' +
'                if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;\n' +
'                return 0;\n' +
'            });\n' +
'        }\n' +
'        return result;\n' +
'    }, [employees, searchTerm, sortConfig, storeFilter]);\n' +
'\n' +
'    return (\n' +
'        <div style={{ paddingBottom: "3rem" }}>\n' +
'            <div style={{ marginBottom: "2rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start" }}>\n' +
'                <div>\n' +
'                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>' + title + '</h1>\n' +
'                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>' + description + '</p>\n' +
'                </div>\n' +
'                \n' +
'                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "flex-end" }}>\n' +
'                    <div style={{ position: "relative" }}>\n' +
'                        <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} size={18} />\n' +
'                        <input\n' +
'                            type="text"\n' +
'                            placeholder="이름, 사번 검색"\n' +
'                            value={searchTerm}\n' +
'                            onChange={(e) => setSearchTerm(e.target.value)}\n' +
'                            style={{ padding: "0.6rem 1rem 0.6rem 2.5rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "0.9rem", width: "200px", outline: "none" }}\n' +
'                        />\n' +
'                    </div>\n' +
'                </div>\n' +
'            </div>\n' +
'\n' +
'            <div className="responsive-table-container" style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>\n' +
'                <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse" }}>\n' +
'                    <thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#f9fafb" }}>\n' +
'                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>\n' +
'                            <th onClick={() => handleSort("employeeNumber")} style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563", cursor: "pointer", whiteSpace: "nowrap" }}>\n' +
'                                사번 <ArrowUpDown size={12} style={{ display: "inline" }} />\n' +
'                            </th>\n' +
'                            <th onClick={() => handleSort("name")} style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563", cursor: "pointer", whiteSpace: "nowrap" }}>\n' +
'                                이름 <ArrowUpDown size={12} style={{ display: "inline" }} />\n' +
'                            </th>\n' +
'                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563", whiteSpace: "nowrap" }}>\n' +
'                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>\n' +
'                                    <span>소속</span>\n' +
'                                    <MultiSelectFilter options={storeList} selectedValues={storeFilter} onChange={setStoreFilter} placeholder="전체 소속" />\n' +
'                                </div>\n' +
'                            </th>\n' +
'                            <th onClick={() => handleSort("status")} style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563", cursor: "pointer", whiteSpace: "nowrap" }}>\n' +
'                                등록 여부 <ArrowUpDown size={12} style={{ display: "inline" }} />\n' +
'                            </th>\n' +
'                            ' + (isHealthCert ? '<th onClick={() => handleSort("exp")} style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563", cursor: "pointer", whiteSpace: "nowrap" }}>\n                                만료일 <ArrowUpDown size={12} style={{ display: "inline" }} />\n                            </th>\n' : '') +
'                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563", whiteSpace: "nowrap" }}>\n' +
'                                첨부 파일\n' +
'                            </th>\n' +
'                        </tr>\n' +
'                    </thead>\n' +
'                    <tbody>\n' +
'                        {loading && <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>로딩 중...</td></tr>}\n' +
'                        {!loading && sortedAndFiltered.length === 0 && <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>직원이 없습니다.</td></tr>}\n' +
'                        {sortedAndFiltered.map(r => (\n' +
'                            <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>\n' +
'                                <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#111827" }}>{r.employeeNumber}</td>\n' +
'                                <td style={{ padding: "1rem", fontSize: "1rem", color: "#111827", fontWeight: 600 }}>{r.name}</td>\n' +
'                                <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#4b5563" }}>{getSmartStoreDepartmentDisplay(r)}</td>\n' +
'                                <td style={{ padding: "1rem", textAlign: "center" }}>\n' +
'                                    {hasDocument(r) \n' +
'                                        ? <span style={{ padding: "0.3rem 0.75rem", backgroundColor: "#d1fae5", color: "#059669", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 600 }}>등록완료</span>\n' +
'                                        : <span style={{ padding: "0.3rem 0.75rem", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 600 }}>미등록</span>}\n' +
'                                </td>\n' +
'                                ' + (isHealthCert ? '<td style={{ padding: "1rem", textAlign: "center", fontSize: "0.9rem", color: "#4b5563" }}>\n                                    {r.healthCertificateExp ? new Date(r.healthCertificateExp).toLocaleDateString() : "-"}\n                                </td>\n' : '') +
'                                <td style={{ padding: "1rem", textAlign: "center" }}>\n' +
'                                    {hasDocument(r) && (\n' +
'                                        <a href={r["' + docUrlField + '" as keyof Employee] as string} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#2563eb", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>\n' +
'                                            <ImageIcon size={16} /> 보기\n' +
'                                        </a>\n' +
'                                    )}\n' +
'                                </td>\n' +
'                            </tr>\n' +
'                        ))}\n' +
'                    </tbody>\n' +
'                </table>\n' +
'            </div>\n' +
'        </div>\n' +
'    );\n' +
'}\n';

const configs = [
    { dir: 'id-cards', title: '임직원 신분증 관리', desc: '전사 임직원의 신분증 사본 등록 현황을 조회합니다.', field: 'idCardUrl', isHealth: false },
    { dir: 'bankbooks', title: '임직원 통장사본 관리', desc: '전사 임직원의 급여 통장사본 등록 현황을 조회합니다.', field: 'bankbookUrl', isHealth: false },
    { dir: 'health-certs', title: '임직원 보건증 관리', desc: '전사 임직원의 보건증 등록 및 만료 현황을 조회합니다.', field: 'healthCertificateUrl', isHealth: true }
];

configs.forEach(c => {
    const dpath = path.join('src/app/hr-portal-admin/team', c.dir);
    if (!fs.existsSync(dpath)) {
        fs.mkdirSync(dpath, { recursive: true });
    }
    fs.writeFileSync(path.join(dpath, 'page.tsx'), pageTemplate(c.title, c.desc, c.field, c.field, c.isHealth));
    console.log(`Generated ${c.dir}`);
});
