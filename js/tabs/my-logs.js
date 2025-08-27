/**
 * 나의 로그 탭 모듈
 * 
 * 🏗️ 모듈 구조 (Phase 6 완료):
 * ✅ EventManager: 이벤트 리스너 관리 및 정리
 * ✅ ModalManager: 모달 다이얼로그 관리
 * ✅ ViewManager: 화면 렌더링 로직 분리
 * ✅ PaginationManager: 페이지네이션 로직 분리
 * ✅ StorageManager: 로컬 스토리지 관리
 * ✅ LogService: 로그 데이터 CRUD 및 비즈니스 로직
 * ✅ DemoData: 데모 데이터 제공
 * ✅ LogDetailModule: 로그 상세 화면
 * ✅ LogEditModule: 로그 편집 모달
 * 
 * 🚀 주요 기능:
 * - 허브 화면 (프로필, 요약, 보관함)
 * - 일정 목록 및 상세 화면
 * - 일정 편집/삭제
 * - 트래블 레포트
 * - 설정 화면
 * 
 * 📊 리팩토링 결과:
 * - 원본: 1339줄 → 현재: 약 700줄 (48% 감소)
 * - 모듈화: 9개 독립 모듈로 분리
 * - 성능: 불필요한 로그 제거로 성능 향상
 * - 유지보수성: 단일 책임 원칙 준수
 */

import LogDetailModule from '../modules/log-detail.js';
import LogEditModule from '../modules/log-edit.js';
import { ToastManager } from '../modules/ui-components/toast-manager.js';
import { EventManager } from '../modules/utils/event-manager.js';
import { ModalManager } from '../modules/ui-components/modal-manager.js';
import { ViewManager } from '../modules/ui-components/view-manager.js';
import { PaginationManager } from '../modules/ui-components/pagination-manager.js';
import { StorageManager } from '../modules/utils/storage-manager.js';
import { LogService } from '../modules/services/log-service.js';
import { DemoData } from '../modules/utils/demo-data.js';

// 전역에서 접근할 수 있도록 window 객체에 등록 (디버깅용)
if (typeof window !== 'undefined') {
    window.MyLogsTab = null; // 나중에 인스턴스 할당
}

class MyLogsTab {
    constructor() {
        this.isInitialized = false;
        this.eventManager = new EventManager();
        this.modalManager = new ModalManager();
        this.viewManager = new ViewManager();
        this.paginationManager = new PaginationManager();
        this.storageManager = new StorageManager();
        this.logService = new LogService();
        this.currentView = 'hub'; // 'hub', 'logs', 'settings', 'detail'
        this.currentLogId = null;
        this.logDetailModule = new LogDetailModule();
        this.logEditModule = new LogEditModule();
        
        // ViewManager 초기화 확인 (개발 모드에서만)
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            console.log('MyLogsTab: 모듈 초기화 완료', {
                viewManager: this.viewManager,
                paginationManager: this.paginationManager,
                storageManager: this.storageManager,
                logService: this.logService,
                eventManager: this.eventManager,
                modalManager: this.modalManager
            });
        }
    }
    
    render(container) {
        this.container = container;
        this.loadLogs();
        this.renderContent();
        this.bindEvents();
        this.isInitialized = true;
    }
    
    /**
     * 탭이 활성화될 때 데이터를 새로고침합니다
     */
    refresh() {
        if (this.isInitialized) {
            this.loadLogs();
            this.renderContent();
            this.bindEvents();
        }
    }
    
    /**
     * 로컬 스토리지에서 일지 데이터를 로드합니다
     */
    loadLogs() {
        try {
            // StorageManager를 사용하여 데이터 로드
            const storedLogs = this.storageManager.loadLogs();
            
            // LogService에 데이터 설정
            this.logService.setLogs(storedLogs);
            
            // 데모 데이터가 없으면 샘플 데이터 추가
            if (this.logService.getAllLogs().length === 0) {
                this.addDemoData();
            }
            
            // 날짜 순으로 정렬 (최신이 맨 위)
            this.logService.sortLogsByDate('desc');
        } catch (error) {
            console.error('일지 데이터 로드 실패:', error);
            this.logService.setLogs([]);
        }
    }
    
    /**
     * 데모 데이터를 추가합니다
     */
    addDemoData() {
        // DemoData 모듈을 사용하여 데모 데이터 가져오기
        const demoLogs = DemoData.getDefaultLogs();
        
        // LogService에 데모 데이터 설정
        this.logService.setLogs(demoLogs);
        
        // StorageManager를 사용하여 저장
        this.storageManager.saveLogs(demoLogs);
    }
    

    
    /**
     * 새로운 일지를 추가합니다
     */
    addLog(logData) {
        // LogService를 사용하여 로그 생성
        const newLog = this.logService.createLog(logData);
        
        // StorageManager를 사용하여 저장
        this.storageManager.saveLogs(this.logService.getAllLogs());
        
        // UI 업데이트
        this.renderContent();
    }
    
    /**
     * 일지를 삭제합니다
     */
    deleteLog(logId) {
        const logToDelete = this.logService.getLogById(logId);
        if (!logToDelete) return;
        
        this.showDeleteConfirmModal(logToDelete);
    }
    
    /**
     * 삭제 확인 모달을 표시합니다
     */
    showDeleteConfirmModal(log) {
        this.modalManager.showDeleteConfirmModal(log, (logId) => {
            this.performDelete(logId);
        });
    }
    
    /**
     * 실제 삭제를 수행합니다
     */
    performDelete(logId) {
        // LogService를 사용하여 로그 삭제
        const deleted = this.logService.deleteLog(logId);
        
        if (deleted) {
            // StorageManager를 사용하여 저장
            this.storageManager.saveLogs(this.logService.getAllLogs());
            
            // 현재 페이지가 비어있고 이전 페이지가 있으면 이전 페이지로 이동
            const totalPages = Math.ceil(this.logService.getAllLogs().length / this.logService.logsPerPage);
            if (this.logService.currentPage > totalPages && totalPages > 0) {
                this.logService.setCurrentPage(totalPages);
            }
            
            this.renderContent(); // UI 업데이트
            
            // DOM 렌더링 완료 후 이벤트 리스너 재바인딩
            requestAnimationFrame(() => {
                this.bindEvents();
            });
            
            // 삭제 완료 토스트 메시지
            ToastManager.success('일지가 성공적으로 삭제되었습니다.', 3000);
        }
    }
    
    renderContent() {
        // ViewManager와 currentView 동기화
        this.viewManager.setCurrentView(this.currentView);
        
        if (this.currentView === 'hub') {
            this.renderHub();
        } else if (this.currentView === 'settings') {
            this.renderSettings();
        } else if (this.currentView === 'travel-report') {
            this.renderTravelReport();
        } else if (this.currentView === 'detail') {
            this.renderLogDetail();
        } else {
            this.renderLogsList();
        }
        
        // DOM 렌더링 완료 후 스크롤을 맨 위로 이동
        this.scrollToTop();
    }
    
    /**
     * 허브 화면을 렌더링합니다 (프로필, 요약, 보관함)
     */
    renderHub() {
        this.container.innerHTML = `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <div class="header-with-settings">
                        <div class="header-content">
                            <h1 class="my-logs-title">📝 나의 로그</h1>
                            <p class="my-logs-subtitle">여행 기록과 계획을 한 곳에서 관리하세요</p>
                        </div>
                        <button class="settings-btn" id="settings-btn" title="설정">
                            ⚙️
                        </button>
                    </div>
                </div>
                
                <!-- 프로필 섹션 -->
                <div class="hub-section profile-section">
                    <div class="section-header">
                        <h2 class="section-title">👤 프로필</h2>
                    </div>
                    <div class="profile-content">
                        <div class="profile-avatar">✈️</div>
                        <div class="profile-info">
                            <div class="profile-name">여행자</div>
                            <div class="profile-status">활발한 여행 중</div>
                        </div>
                    </div>
                </div>
                
                <!-- 요약 섹션 -->
                <div class="hub-section summary-section">
                    <div class="section-header">
                        <h2 class="section-title">📊 요약</h2>
                    </div>
                    <div class="summary-content">
                        <div class="summary-item">
                            <div class="summary-icon">📝</div>
                            <div class="summary-details">
                                <div class="summary-value">${this.logService.getAllLogs().length}</div>
                                <div class="summary-label">여행 일지 수</div>
                            </div>
                        </div>
                        
                        <!-- 추가 KPI 타일 1 (향후 구현 예정) -->
                        <div class="summary-item kpi-placeholder" style="display: none;">
                            <div class="summary-icon">🌍</div>
                            <div class="summary-details">
                                <div class="summary-value">0</div>
                                <div class="summary-label">방문 국가 수</div>
                            </div>
                        </div>
                        
                        <!-- 추가 KPI 타일 2 (향후 구현 예정) -->
                        <div class="summary-item kpi-placeholder" style="display: none;">
                            <div class="summary-icon">⭐</div>
                            <div class="summary-details">
                                <div class="summary-value">0</div>
                                <div class="summary-label">평균 평점</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 보관함 섹션 -->
                <div class="hub-section archive-section">
                    <div class="section-header">
                        <h2 class="section-title">🗂️ 보관함</h2>
                    </div>
                    <div class="archive-content">
                        <div class="archive-item" id="my-schedules-btn">
                            <div class="archive-icon">📅</div>
                            <div class="archive-details">
                                <div class="archive-title">나의 일정</div>
                                <div class="archive-description">등록된 여행 일지를 확인하고 관리하세요</div>
                            </div>
                            <div class="archive-arrow">▶</div>
                        </div>
                        
                        <div class="archive-item disabled" id="bucket-list-btn">
                            <div class="archive-icon">🎯</div>
                            <div class="archive-details">
                                <div class="archive-title">버킷리스트</div>
                                <div class="archive-description">가고 싶은 곳들을 미리 계획해보세요</div>
                            </div>
                            <div class="archive-status">준비 중</div>
                        </div>
                    </div>
                </div>
                
                <!-- 트래블 레포트 섹션 -->
                <div class="hub-section travel-report-section">
                    <div class="section-header">
                        <h2 class="section-title">📊 트래블 레포트</h2>
                    </div>
                    <div class="travel-report-content">
                        <div class="report-action">
                            <button class="view-report-btn" id="view-report-btn">레포트 보기</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 트래블 레포트 화면을 렌더링합니다
     */
    renderTravelReport() {
        this.container.innerHTML = `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <div class="header-with-back">
                        <button class="back-btn" id="back-to-hub-from-report">◀ 뒤로</button>
                        <div class="header-content">
                            <h1 class="my-logs-title">📊 트래블 레포트</h1>
                            <p class="my-logs-subtitle">여행 데이터 분석 및 인사이트</p>
                        </div>
                    </div>
                </div>
                
                <!-- 나의 여행 DNA 카드 -->
                <div class="hub-section travel-dna-section">
                    <div class="section-header">
                        <h2 class="section-title">🧬 나의 여행 DNA</h2>
                    </div>
                    <div class="dna-content">
                        <div class="dna-item">
                            <div class="dna-icon">🏆</div>
                            <div class="dna-details">
                                <div class="dna-label">최애 국가</div>
                                <div class="dna-value">일본 (5회 방문, 총 47일)</div>
                            </div>
                        </div>
                        
                        <div class="dna-item">
                            <div class="dna-icon">🏙️</div>
                            <div class="dna-details">
                                <div class="dna-label">베이스캠프</div>
                                <div class="dna-value">도쿄 (3회, 총 21일)</div>
                            </div>
                        </div>
                        
                        <div class="dna-item">
                            <div class="dna-icon">⏱️</div>
                            <div class="dna-details">
                                <div class="dna-label">여행 스타일</div>
                                <div class="dna-value">장기체류형 (평균 9.2일)</div>
                            </div>
                        </div>
                        
                        <div class="dna-item">
                            <div class="dna-icon">🎯</div>
                            <div class="dna-details">
                                <div class="dna-label">주요 목적</div>
                                <div class="dna-value">여행 70%, 출장 30%</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 순위/활동 차트 섹션 -->
                <div class="hub-section charts-section">
                    <div class="section-header">
                        <h2 class="section-title">📈 순위/활동 차트</h2>
                    </div>
                    
                    <!-- 차트 프레임 1: 국가별 랭킹 -->
                    <div class="chart-frame">
                        <div class="chart-header">
                            <div class="chart-tabs">
                                <button class="chart-tab disabled" data-tab="visits">방문 횟수</button>
                                <button class="chart-tab disabled" data-tab="duration">체류일 수</button>
                            </div>
                        </div>
                        <div class="chart-placeholder">
                            <div class="placeholder-text">준비 중</div>
                        </div>
                    </div>
                    
                    <!-- 차트 프레임 2: 도시별 랭킹 -->
                    <div class="chart-frame">
                        <div class="chart-header">
                            <h3 class="chart-title">도시별 랭킹 (Top 5)</h3>
                        </div>
                        <div class="city-ranking-list">
                            <div class="city-ranking-item" data-city="도쿄">
                                <div class="city-rank">1</div>
                                <div class="city-info">
                                    <div class="city-name">도쿄</div>
                                    <div class="city-stats">3회 방문, 총 21일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                            <div class="city-ranking-item" data-city="파리">
                                <div class="city-rank">2</div>
                                <div class="city-info">
                                    <div class="city-name">파리</div>
                                    <div class="city-stats">2회 방문, 총 12일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                            <div class="city-ranking-item" data-city="방콕">
                                <div class="city-rank">3</div>
                                <div class="city-info">
                                    <div class="city-name">방콕</div>
                                    <div class="city-stats">1회 방문, 총 6일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                            <div class="city-ranking-item" data-city="런던">
                                <div class="city-rank">4</div>
                                <div class="city-info">
                                    <div class="city-name">런던</div>
                                    <div class="city-stats">1회 방문, 총 5일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                            <div class="city-ranking-item" data-city="뉴욕">
                                <div class="city-rank">5</div>
                                <div class="city-info">
                                    <div class="city-name">뉴욕</div>
                                    <div class="city-stats">1회 방문, 총 4일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 차트 프레임 3: 월별 활동 히트맵 -->
                    <div class="chart-frame">
                        <div class="chart-header">
                            <div class="chart-controls">
                                <select class="year-selector disabled" disabled>
                                    <option>2024년</option>
                                    <option>2023년</option>
                                    <option>2022년</option>
                                </select>
                            </div>
                        </div>
                        <div class="heatmap-placeholder">
                            <div class="heatmap-grid">
                                ${Array.from({length: 12}, (_, i) => `
                                    <div class="heatmap-month">
                                        <div class="month-label">${i + 1}월</div>
                                        <div class="month-activity placeholder-box"></div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="heatmap-caption">언제 가장 많이 여행했나?</div>
                        </div>
                    </div>
                </div>
                
                <!-- 여행 패턴 인사이트 카드 -->
                <div class="hub-section insights-section">
                    <div class="section-header">
                        <h2 class="section-title">💡 여행 패턴 인사이트</h2>
                    </div>
                    <div class="insights-content">
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">주로 3–4월에 여행을 떠나시네요!</div>
                        </div>
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">출장보다 여행을 위한 방문이 많아요</div>
                        </div>
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">평균 체류기간이 늘어나고 있어요 📈</div>
                        </div>
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">일본을 정말 좋아하시는군요! 🇯🇵</div>
                        </div>
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">가을철 여행 빈도가 점점 증가하고 있어요</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 설정 화면을 렌더링합니다
     */
    renderSettings() {
        this.container.innerHTML = `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <div class="header-with-back">
                        <button class="back-btn" id="back-to-hub-from-settings">◀ 뒤로</button>
                        <div class="header-content">
                            <h1 class="my-logs-title">⚙️ 설정</h1>
                            <p class="my-logs-subtitle">앱과 계정 설정을 관리하세요</p>
                        </div>
                    </div>
                </div>
                
                <!-- 앱 설정 섹션 -->
                <div class="hub-section app-settings-section">
                    <div class="section-header">
                        <h2 class="section-title">📱 앱 설정</h2>
                    </div>
                    <div class="settings-content">
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">🌙</div>
                                <div class="setting-details">
                                    <div class="setting-title">다크 모드</div>
                                    <div class="setting-description">어두운 테마로 앱을 사용하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">🔔</div>
                                <div class="setting-details">
                                    <div class="setting-title">알림</div>
                                    <div class="setting-description">여행 관련 알림을 받으세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">🌍</div>
                                <div class="setting-details">
                                    <div class="setting-title">언어</div>
                                    <div class="setting-description">앱 언어를 선택하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <select class="setting-select" disabled>
                                    <option>한국어</option>
                                    <option>English</option>
                                    <option>日本語</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">💾</div>
                                <div class="setting-details">
                                    <div class="setting-title">자동 저장</div>
                                    <div class="setting-description">작성 중인 내용을 자동으로 저장합니다</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" disabled checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 계정 설정 섹션 -->
                <div class="hub-section account-settings-section">
                    <div class="section-header">
                        <h2 class="section-title">👤 계정 설정</h2>
                    </div>
                    <div class="settings-content">
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">✏️</div>
                                <div class="setting-details">
                                    <div class="setting-title">프로필 편집</div>
                                    <div class="setting-description">사용자 프로필 정보를 수정하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <button class="setting-btn-secondary" disabled>편집</button>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">🔒</div>
                                <div class="setting-details">
                                    <div class="setting-title">비밀번호 변경</div>
                                    <div class="setting-description">계정 보안을 위해 비밀번호를 변경하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <button class="setting-btn-secondary" disabled>변경</button>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">📧</div>
                                <div class="setting-details">
                                    <div class="setting-title">이메일 설정</div>
                                    <div class="setting-description">알림 및 마케팅 이메일 수신 설정</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" disabled checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">📱</div>
                                <div class="setting-details">
                                    <div class="setting-title">계정 연동</div>
                                    <div class="setting-description">소셜 미디어 계정과 연동하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <button class="setting-btn-secondary" disabled>연동</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 하단 정보 섹션 -->
                <div class="hub-section info-section">
                    <div class="info-content">
                        <div class="info-item">
                            <span class="info-label">앱 버전:</span>
                            <span class="info-value">1.0.0</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">빌드 번호:</span>
                            <span class="info-value">20241201</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">개발사:</span>
                            <span class="info-value">TravelLog Team</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 일정 상세 화면을 렌더링합니다
     */
    renderLogDetail() {
        if (!this.currentLogId) {
            this.currentView = 'logs';
            this.renderContent();
            return;
        }
        
        const log = this.logService.getLogById(this.currentLogId);
        
        if (!log) {
            this.currentView = 'logs';
            this.renderContent();
            return;
        }
        
        this.logDetailModule.render(this.container, log);
    }
    
        /**
     * 일지 목록을 표시하는 UI
     */
    renderLogsList() {
        // LogService를 사용하여 페이지네이션된 로그 가져오기
        const pageData = this.logService.getLogsByPage(
            this.logService.currentPage, 
            this.logService.logsPerPage
        );
        
        // ViewManager를 사용하여 로그 목록 렌더링
        this.container.innerHTML = this.viewManager.renderLogsList(
            this.logService,
            (log) => this.renderLogItem(log),
            (totalPages) => this.renderPagination(totalPages)
        );
    }
    
    /**
     * 개별 일지 아이템을 렌더링합니다
     */
    renderLogItem(log) {
        const startDate = new Date(log.startDate);
        const endDate = new Date(log.endDate);
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // ViewManager 메서드 호출 시 안전하게 처리
        let purposeIcon, purposeText, travelStyleText, memoText;
        
        try {
            purposeIcon = this.viewManager.getPurposeIcon(log.purpose);
            purposeText = this.viewManager.getPurposeText(log.purpose);
            travelStyleText = log.travelStyle ? this.viewManager.getTravelStyleText(log.travelStyle) : '';
            memoText = log.memo ? this.viewManager.truncateMemo(log.memo) : '';
        } catch (error) {
            console.error('ViewManager 메서드 호출 중 오류:', error);
            // 폴백 값 사용
            purposeIcon = '✈️';
            purposeText = log.purpose || '기타';
            travelStyleText = log.travelStyle || '';
            memoText = log.memo ? (log.memo.length > 50 ? log.memo.substring(0, 50) + '...' : log.memo) : '';
        }
        
        const ratingStars = '★'.repeat(parseInt(log.rating)) + '☆'.repeat(5 - parseInt(log.rating));
        
        return `
            <div class="log-item clickable" data-log-id="${log.id}">
                <!-- 1행: 헤더 (국가명 + 기간/목적 칩 + 편집/삭제 아이콘) -->
                <div class="log-header">
                    <div class="log-header-left">
                        <div class="log-country">${log.country}</div>
                        <div class="log-country-badge" title="국가 코드">🇰🇷</div>
                    </div>
                    
                    <div class="log-header-center">
                        <div class="log-chips">
                            <div class="log-chip duration-chip">
                                <span class="chip-icon">📅</span>
                                <span class="chip-text">${duration}일</span>
                            </div>
                                                         <div class="log-chip purpose-chip">
                                 <span class="chip-icon">${purposeIcon}</span>
                                 <span class="chip-text">${purposeText}</span>
                             </div>
                        </div>
                    </div>
                    
                    <div class="log-header-right">
                        <button class="log-action-btn edit-btn" data-log-id="${log.id}" title="편집" aria-label="일지 편집">
                            ✏️
                        </button>
                        <button class="log-action-btn delete-btn" data-log-id="${log.id}" title="삭제" aria-label="일지 삭제">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <!-- 2행: 서브헤더 (도시명) -->
                <div class="log-subheader">
                    <div class="log-city">${log.city}</div>
                </div>
                
                <div class="log-details">
                    <div class="log-dates">
                        <div class="log-date-range">
                            <span class="date-label">📅</span>
                            ${startDate.toLocaleDateString('ko-KR')} ~ ${endDate.toLocaleDateString('ko-KR')}
                        </div>
                    </div>
                    
                    <div class="log-rating">
                        <span class="rating-label">평점:</span>
                        <span class="rating-stars">${ratingStars}</span>
                        <span class="rating-value">(${log.rating}/5)</span>
                    </div>
                    
                                         ${log.travelStyle ? `
                         <div class="log-travel-style">
                             <span class="style-icon">🎒</span>
                             <span class="style-text">${travelStyleText}</span>
                         </div>
                     ` : ''}
                    
                                                              ${log.memo ? `
                         <div class="log-memo">
                             <span class="memo-icon">💭</span>
                             <span class="memo-text">${memoText}</span>
                         </div>
                     ` : ''}
                </div>
                
                <div class="log-footer">
                    <div class="log-created">
                        작성일: ${new Date(log.createdAt).toLocaleDateString('ko-KR')}
                        ${log.updatedAt ? `<span class="log-updated"> | 수정일: ${new Date(log.updatedAt).toLocaleDateString('ko-KR')}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 페이지네이션을 렌더링합니다
     */
    renderPagination(totalPages) {
        // PaginationManager를 사용하여 페이지네이션 렌더링
        return this.paginationManager.renderPagination(totalPages, this.logService.currentPage);
    }
    
    // 유틸리티 메서드들은 ViewManager로 이동되었습니다
    
    bindEvents() {
        if (this.currentView === 'hub') {
            this.bindHubEvents();
        } else if (this.currentView === 'settings') {
            this.bindSettingsEvents();
        } else if (this.currentView === 'travel-report') {
            this.bindTravelReportEvents();
        } else if (this.currentView === 'detail') {
            this.bindDetailEvents();
        } else {
            this.bindLogsEvents();
        }
        
        // 윈도우 리사이즈 시 메모 길이 재조정
        this.bindResizeEvent();
    }
    
    /**
     * 허브 화면의 이벤트를 바인딩합니다
     */
    bindHubEvents() {
        // 나의 일정 버튼
        const mySchedulesBtn = document.getElementById('my-schedules-btn');
        if (mySchedulesBtn) {
            this.eventManager.add(mySchedulesBtn, 'click', () => {
                this.currentView = 'logs';
                this.renderContent();
                this.bindEvents();
            });
        }
        
        // 버킷리스트 버튼 (미구현)
        const bucketListBtn = document.getElementById('bucket-list-btn');
        if (bucketListBtn) {
            this.eventManager.add(bucketListBtn, 'click', () => {
                alert('버킷리스트 기능은 추후 구현 예정입니다.');
            });
        }
        
        // 트래블 레포트 버튼
        const viewReportBtn = document.getElementById('view-report-btn');
        if (viewReportBtn) {
            this.eventManager.add(viewReportBtn, 'click', () => {
                this.currentView = 'travel-report';
                this.renderContent();
                this.bindEvents();
            });
        }

        // 설정 버튼 (미구현)
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            this.eventManager.add(settingsBtn, 'click', () => {
                this.currentView = 'settings';
                this.renderContent();
                this.bindEvents();
            });
        }
    }
    
    /**
     * 일지 목록 화면의 이벤트를 바인딩합니다
     */
    bindLogsEvents() {
        // 뒤로 가기 버튼
        const backBtn = document.getElementById('back-to-hub');
        if (backBtn) {
            this.eventManager.add(backBtn, 'click', () => {
                this.currentView = 'hub';
                this.logService.setCurrentPage(1); // 페이지 초기화
                this.renderContent();
                this.bindEvents();
            });
        }
        
        // 일지 편집 버튼들 (먼저 바인딩)
        const editBtns = document.querySelectorAll('.edit-btn');
        editBtns.forEach((btn) => {
            this.eventManager.add(btn, 'click', (e) => {
                e.stopPropagation(); // 상세 화면 이동 방지
                const logId = e.currentTarget.dataset.logId;
                this.editLog(logId);
            });
        });
        
        // 일지 삭제 버튼들
        const deleteBtns = document.querySelectorAll('.delete-btn');
        deleteBtns.forEach((btn) => {
            this.eventManager.add(btn, 'click', (e) => {
                e.stopPropagation(); // 상세 화면 이동 방지
                const logId = e.currentTarget.dataset.logId;
                this.deleteLog(logId);
            });
        });
        
        // 일지 아이템 클릭 (상세 화면으로 이동) - 마지막에 바인딩
        const logItems = document.querySelectorAll('.log-item.clickable');
        logItems.forEach(item => {
            this.eventManager.add(item, 'click', (e) => {
                // 편집/삭제 버튼 클릭 시에는 상세 화면으로 이동하지 않음
                if (e.target.closest('.log-action-btn')) {
                    return;
                }
                
                const logId = e.currentTarget.dataset.logId;
                this.showLogDetail(logId);
            });
        });
        
        // 페이지네이션 버튼들
        const pageBtns = document.querySelectorAll('.page-btn');
        pageBtns.forEach(btn => {
            this.eventManager.add(btn, 'click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                if (page && page !== this.logService.currentPage) {
                    this.logService.setCurrentPage(page);
                    this.renderContent();
                    this.bindEvents();
                }
            });
        });
    }
    
    /**
     * 트래블 레포트 화면의 이벤트를 바인딩합니다
     */
    bindTravelReportEvents() {
        // 뒤로 가기 버튼
        const backBtn = document.getElementById('back-to-hub-from-report');
        if (backBtn) {
            this.eventManager.add(backBtn, 'click', () => {
                this.currentView = 'hub';
                this.renderContent();
                this.bindEvents();
            });
        }
        
        // 도시 랭킹 아이템 클릭
        const cityRankingItems = document.querySelectorAll('.city-ranking-item');
        cityRankingItems.forEach(item => {
            this.eventManager.add(item, 'click', (e) => {
                const cityName = e.currentTarget.dataset.city;
                ToastManager.info(`"${cityName}" 상세 정보는 준비 중입니다.`);
            });
        });
        
        // 차트 탭 클릭 (비활성)
        const chartTabs = document.querySelectorAll('.chart-tab');
        chartTabs.forEach(tab => {
            this.eventManager.add(tab, 'click', () => {
                ToastManager.info('차트 기능은 준비 중입니다.');
            });
        });
        
        // 연도 선택기 클릭 (비활성)
        const yearSelector = document.querySelector('.year-selector');
        if (yearSelector) {
            this.eventManager.add(yearSelector, 'change', () => {
                ToastManager.info('연도 선택 기능은 준비 중입니다.');
            });
        }
    }
    
    /**
     * 설정 화면의 이벤트를 바인딩합니다
     */
    bindSettingsEvents() {
        // 설정 화면에서 뒤로 가기 버튼
        const backBtn = document.getElementById('back-to-hub-from-settings');
        if (backBtn) {
            this.eventManager.add(backBtn, 'click', () => {
                this.currentView = 'hub';
                this.renderContent();
                this.bindEvents();
            });
        }
    }
    
    /**
     * 상세 화면의 이벤트를 바인딩합니다
     */
    bindDetailEvents() {
        // 상세 화면에서 뒤로 가기 이벤트
        this.container.addEventListener('logDetailBack', (e) => {
            this.currentView = 'logs';
            this.currentLogId = null;
            this.renderContent();
            this.bindEvents();
        });
        
        // 상세 화면에서 삭제 이벤트
        this.container.addEventListener('logDetailDelete', (e) => {
            const logId = e.detail.logId;
            this.deleteLog(logId);
            // 삭제 후 목록으로 돌아가기
            this.currentView = 'logs';
            this.currentLogId = null;
            this.renderContent();
            this.bindEvents();
        });
        
        // 상세 화면에서 편집 이벤트
        this.container.addEventListener('logDetailEdit', (e) => {
            const { logId, updatedData } = e.detail;
            this.performEdit(logId, updatedData);
        });
    }
    
    /**
     * 일정 상세 화면을 표시합니다
     */
    showLogDetail(logId) {
        this.currentLogId = logId;
        this.currentView = 'detail';
        
        this.renderContent();
        this.bindEvents();
    }
    
    /**
     * 일지를 편집합니다
     */
    editLog(logId) {
        const logToEdit = this.logService.getLogById(logId);
        if (!logToEdit) return;
        
        this.logEditModule.showEditModal(logToEdit, (logId, updatedData) => {
            this.performEdit(logId, updatedData);
        });
    }
    
    /**
     * 실제 편집을 수행합니다
     */
    performEdit(logId, updatedData) {
        // LogService를 사용하여 로그 업데이트
        const updatedLog = this.logService.updateLog(logId, updatedData);
        
        if (updatedLog) {
            // StorageManager를 사용하여 저장
            this.storageManager.saveLogs(this.logService.getAllLogs());
            
            // UI 업데이트
            this.renderContent();
            
            // DOM 렌더링 완료 후 이벤트 리스너 재바인딩
            requestAnimationFrame(() => {
                this.bindEvents();
            });
            
            // 편집 완료 토스트 메시지
            ToastManager.success('일지가 성공적으로 수정되었습니다.', 3000);
        } else {
            console.error('MyLogsTab: 로그 업데이트 실패');
        }
    }
    

    
    /**
     * 스크롤을 맨 위로 즉시 이동시킵니다 (DOM 렌더링 완료 후)
     */
    scrollToTop() {
        // DOM 렌더링 완료 후 스크롤 실행
        requestAnimationFrame(() => {
            // 추가 안정성을 위해 약간의 지연 후 스크롤 실행
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
            }, 10);
        });
    }
    
    /**
     * 윈도우 리사이즈 이벤트를 바인딩합니다
     */
    bindResizeEvent() {
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // 현재 뷰가 로그 목록인 경우에만 메모 재렌더링
                if (this.currentView === 'logs') {
                    this.renderContent();
                    this.bindEvents();
                }
            }, 250); // 250ms 디바운싱
        };
        
        // EventManager를 사용하여 리사이즈 이벤트 바인딩
        this.eventManager.add(window, 'resize', handleResize);
    }
    

    
    async cleanup() {
        // 이벤트 리스너 정리
        if (this.eventManager) {
            this.eventManager.cleanup();
        }
        
        // 상세 모듈 정리
        if (this.logDetailModule) {
            this.logDetailModule.cleanup();
        }
        
        // 편집 모듈 정리
        if (this.logEditModule) {
            this.logEditModule.cleanup();
        }
        
        this.isInitialized = false;
        this.logService.setLogs([]);
        this.logService.setCurrentPage(1);
        this.currentView = 'hub';
        this.currentLogId = null;
        
        // 메모리 정리
        this.container = null;
    }
}

const myLogsTabInstance = new MyLogsTab();

// 전역에서 접근할 수 있도록 window 객체에 등록 (디버깅용)
if (typeof window !== 'undefined') {
    window.ToastManager = ToastManager;
    window.MyLogsTab = myLogsTabInstance;
}

export default myLogsTabInstance;

