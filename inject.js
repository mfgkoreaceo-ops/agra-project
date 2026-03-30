const fs = require('fs');

const file = 'src/app/hr-portal-admin/announcements/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace categories const with state & fetcher
content = content.replace(
    /const categories = \["전체", .*"재무팀 공지"\];/,
    `const [categories, setCategories] = useState<string[]>(["전체", "일반 공지", "인사 관련 서식 파일", "인사 관련 매뉴얼", "업무 마감일", "매장 보험 증서", "재무팀 공지"]);
    const [showCategorySetting, setShowCategorySetting] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [editCatTarget, setEditCatTarget] = useState("");
    const [editCatValue, setEditCatValue] = useState("");

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/hr/announcements/categories");
            if(res.ok) {
               const data = await res.json();
               if(data.categories) setCategories(data.categories);
            }
        } catch(e){}
    };
    useEffect(() => { fetchCategories(); }, []);`
);

// 2. Add Category Admin Buttons
content = content.replace(
    /\{canManage && !showForm && \(\s*<button\s*onClick=\{\(\) => setShowForm\(true\)\}/,
    `{canManage && !showForm && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            onClick={() => setShowCategorySetting(true)}
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", backgroundColor: "white", color: "#4b5563", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer" }}
                        >
                            카테고리 관리
                        </button>
                    <button
                        onClick={() => setShowForm(true)}`
);
content = content.replace(
    /<Plus size=\{18\} \/> 새 공지 등록\s*<\/button>\s*\)\}/,
    `<Plus size={18} /> 새 공지 등록
                    </button>
                    </div>
                )}`
);

// 3. Make the table scrollable
content = content.replace(
    /overflow: "hidden" \}\}>\s*<table style=\{\{ width: "100%",/g,
    `overflowY: "auto", maxHeight: "65vh" }}>
                <table style={{ width: "100%",`
);

// 4. Inject Modal Component
const modalJsx = `
            {/* Category Setting Modal */}
            {showCategorySetting && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "1rem", width: "100%", maxWidth: "500px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
                            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "bold" }}>카테고리 관리</h3>
                            <button onClick={() => setShowCategorySetting(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}><X size={24} /></button>
                        </div>
                        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <input type="text" value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="새 카테고리 이름" style={{ flex: 1, padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.5rem" }} />
                                <button onClick={async () => {
                                    if(!newCatName) return;
                                    const res = await fetch('/api/hr/announcements/categories', { method: 'POST', body: JSON.stringify({newCategory: newCatName})});
                                    if(res.ok) { fetchCategories(); setNewCatName(""); }
                                }} style={{ padding: "0.5rem 1rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>추가</button>
                            </div>
                            <div style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", overflow: "hidden" }}>
                                {categories.filter(c => c !== '전체').map(c => (
                                    <div key={c} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderBottom: "1px solid #f3f4f6" }}>
                                        {editCatTarget === c ? (
                                            <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                                                <input type="text" value={editCatValue} onChange={e=>setEditCatValue(e.target.value)} style={{ flex: 1, padding: "0.2rem 0.5rem" }} />
                                                <button onClick={async () => {
                                                    if(!editCatValue) return;
                                                    const res = await fetch('/api/hr/announcements/categories', { method: 'PUT', body: JSON.stringify({oldCategory: c, newCategory: editCatValue})});
                                                    if(res.ok) { fetchCategories(); fetchNotices(); setEditCatTarget(""); }
                                                }} style={{ padding: "0.2rem 0.5rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "0.2rem", cursor: "pointer" }}>저장</button>
                                                <button onClick={() => setEditCatTarget("")} style={{ padding: "0.2rem 0.5rem" }}>취소</button>
                                            </div>
                                        ) : (
                                            <>
                                                <span>{c}</span>
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <button onClick={() => { setEditCatTarget(c); setEditCatValue(c); }} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer" }}>수정</button>
                                                    <button onClick={async () => {
                                                        if(confirm('이 카테고리를 삭제하시겠습니까? 관련 게시글은 일반 공지로 이동됩니다.')){
                                                            const res = await fetch('/api/hr/announcements/categories', { method: 'DELETE', body: JSON.stringify({targetCategory: c})});
                                                            if(res.ok) { fetchCategories(); fetchNotices(); }
                                                        }
                                                    }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>삭제</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
`;

content = content.replace('{/* Viewing / Editing Modal */}', modalJsx + '\n            {/* Viewing / Editing Modal */}');

fs.writeFileSync(file, content);
console.log('Injection successful');
