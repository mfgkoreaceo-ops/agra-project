"use client";

import { Users, ShoppingBag, Eye, TrendingUp, Plus } from "lucide-react";
import "./admin.css";

export default function AdminDashboard() {
    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">대시보드 개요</h1>
                    <p className="admin-subtitle">환영합니다, 관리자님. 오늘의 주요 현황입니다.</p>
                </div>
                <div className="admin-actions">
                    <button className="btn-primary">
                        <Plus size={16} />
                        <span>새 게시물</span>
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon bg-blue">
                        <Eye size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>페이지 뷰</h3>
                        <p className="stat-value">24,592</p>
                        <span className="stat-trend positive">
                            <TrendingUp size={14} /> +12.5% 이번 주
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon bg-gold">
                        <ShoppingBag size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>예약 클릭 수</h3>
                        <p className="stat-value">1,248</p>
                        <span className="stat-trend positive">
                            <TrendingUp size={14} /> +8.2% 이번 주
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon bg-purple">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>활성 사용자</h3>
                        <p className="stat-value">892</p>
                        <span className="stat-trend neutral">
                            안정적
                        </span>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-content">
                <div className="card recent-activity">
                    <h3 className="card-title">최근 활동</h3>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-indicator add"></div>
                            <div className="activity-details">
                                <p>새 메뉴 항목 추가: <strong>Butter Chicken Makhani</strong></p>
                                <span>2시간 전 (최고 관리자)</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-indicator edit"></div>
                            <div className="activity-details">
                                <p>매장 운영시간 업데이트: <strong>Agra Centerfield (Yeoksam)</strong></p>
                                <span>5시간 전 (편집자)</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-indicator system"></div>
                            <div className="activity-details">
                                <p>새 프로모션 배너 활성화: <strong>"Spring Festival Set"</strong></p>
                                <span>어제 14:00 (시스템)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card quick-links">
                    <h3 className="card-title">빠른 작업</h3>
                    <div className="action-buttons-grid">
                        <button className="action-btn">
                            메뉴 가격 업데이트
                        </button>
                        <button className="action-btn">
                            새 배너 업로드
                        </button>
                        <button className="action-btn">
                            새 지점 추가
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
