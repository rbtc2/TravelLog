/**
 * HubView - 허브 화면 (프로필, 요약, 보관함) 렌더링 및 이벤트 처리
 * 
 * 🎯 책임:
 * - 허브 화면 UI 렌더링
 * - 허브 화면 이벤트 바인딩
 * - 프로필, 요약, 보관함 섹션 관리
 * 
 * @class HubView
 */
import { EventManager } from '../../../modules/utils/event-manager.js';

class HubView {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
    }

    /**
     * 허브 화면을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    render(container) {
        this.container = container;
        this.container.innerHTML = this.getHubHTML();
        this.bindEvents();
    }

    /**
     * 허브 화면 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getHubHTML() {
        const totalLogs = this.controller.getAllLogs().length;
        
        return `
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
                                <div class="summary-value">${totalLogs}</div>
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
                        <h2 class="section-title">📁 보관함</h2>
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
     * 허브 화면의 이벤트를 바인딩합니다
     */
    bindEvents() {
        // 나의 일정 버튼
        const mySchedulesBtn = document.getElementById('my-schedules-btn');
        if (mySchedulesBtn) {
            this.eventManager.add(mySchedulesBtn, 'click', () => {
                this.onNavigateToLogs();
            });
        }
        
        // 버킷리스트 버튼 (미구현)
        const bucketListBtn = document.getElementById('bucket-list-btn');
        if (bucketListBtn) {
            this.eventManager.add(bucketListBtn, 'click', () => {
                this.onBucketListClick();
            });
        }
        
        // 트래블 레포트 버튼
        const viewReportBtn = document.getElementById('view-report-btn');
        if (viewReportBtn) {
            this.eventManager.add(viewReportBtn, 'click', () => {
                this.onNavigateToTravelReport();
            });
        }

        // 설정 버튼
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            this.eventManager.add(settingsBtn, 'click', () => {
                this.onNavigateToSettings();
            });
        }
    }

    /**
     * 로그 목록으로 이동
     */
    onNavigateToLogs() {
        this.dispatchEvent('navigate', { view: 'logs' });
    }

    /**
     * 트래블 레포트로 이동
     */
    onNavigateToTravelReport() {
        this.dispatchEvent('navigate', { view: 'travel-report' });
    }

    /**
     * 설정으로 이동
     */
    onNavigateToSettings() {
        this.dispatchEvent('navigate', { view: 'settings' });
    }

    /**
     * 버킷리스트 클릭 (미구현)
     */
    onBucketListClick() {
        this.dispatchEvent('showMessage', { 
            type: 'info', 
            message: '버킷리스트 기능은 추후 구현 예정입니다.' 
        });
    }

    /**
     * 커스텀 이벤트를 발생시킵니다
     * @param {string} eventName - 이벤트 이름
     * @param {Object} detail - 이벤트 상세 정보
     */
    dispatchEvent(eventName, detail) {
        if (this.container) {
            const event = new CustomEvent(`hubView:${eventName}`, { detail });
            this.container.dispatchEvent(event);
        }
    }

    /**
     * View 정리
     */
    cleanup() {
        if (this.eventManager) {
            this.eventManager.cleanup();
        }
        this.container = null;
    }
}

export { HubView };
