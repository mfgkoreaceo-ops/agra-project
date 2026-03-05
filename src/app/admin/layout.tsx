"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    UtensilsCrossed,
    Store,
    Image as ImageIcon,
    Settings,
    LogOut
} from "lucide-react";
import "./admin.css";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Skip auth check if already on the login page
        if (pathname === "/admin/login") {
            setIsAuthenticated(true);
            return;
        }

        const isAdmin = localStorage.getItem("isAdmin");
        if (!isAdmin) {
            router.push("/admin/login");
        } else {
            setIsAuthenticated(true);
        }
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem("isAdmin");
        router.push("/admin/login");
    };

    // Don't render the sidebar if we're on the login page or not authenticated yet
    if (!isAuthenticated) return null;

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <h2>AGRA CMS</h2>
                    <span className="admin-version">v1.0</span>
                </div>

                <nav className="admin-nav">
                    <Link href="/admin" className={`admin-nav-item ${pathname === '/admin' ? 'active' : ''}`}>
                        <LayoutDashboard size={18} />
                        대시보드
                    </Link>
                    <Link href="/admin/menu" className={`admin-nav-item ${pathname === '/admin/menu' ? 'active' : ''}`}>
                        <UtensilsCrossed size={18} />
                        메뉴 관리
                    </Link>
                    <Link href="/admin/stores" className={`admin-nav-item ${pathname === '/admin/stores' ? 'active' : ''}`}>
                        <Store size={18} />
                        매장 관리
                    </Link>
                    <Link href="/admin/banners" className={`admin-nav-item ${pathname === '/admin/banners' ? 'active' : ''}`}>
                        <ImageIcon size={18} />
                        팝업 및 배너
                    </Link>
                    <Link href="/admin/settings" className={`admin-nav-item ${pathname === '/admin/settings' ? 'active' : ''}`}>
                        <Settings size={18} />
                        기본 설정
                    </Link>
                </nav>

                <div className="admin-footer">
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <LogOut size={18} />
                        로그아웃
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}
