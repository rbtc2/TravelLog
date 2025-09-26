/**
 * HubView - 허브 화면 (프로필, 요약, 보관함) 렌더링 및 이벤트 처리
 * 
 * 🎯 책임:
 * - 허브 화면 UI 렌더링
 * - 허브 화면 이벤트 바인딩
 * - 모듈 간 조정 및 통합
 * 
 * 📦 모듈 구성:
 * - ScrollManager: 스크롤 이벤트 관리
 * - LogoutManager: 로그아웃 처리 관리
 * - ProfileManager: 프로필 데이터 관리
 * - HamburgerMenuManager: 햄버거 메뉴 관리
 * 
 * @class HubView
 * @version 2.0.0 (리팩토링 완료)
 * @since 2025-09-25
 */
import { EventManager } from '../../../modules/utils/event-manager.js';
import { ScrollManager } from '../../../modules/utils/ScrollManager.js';
import { LogoutManager } from '../../../modules/managers/LogoutManager.js';
import { ProfileManager } from '../../../modules/managers/ProfileManager.js';
import { HamburgerMenuManager } from '../../../modules/ui-components/HamburgerMenuManager.js';

class HubView {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.scrollManager = new ScrollManager();
        this.logoutManager = new LogoutManager(this.eventManager, this.dispatchEvent.bind(this));
        this.profileManager = new ProfileManager(this.eventManager, this.dispatchEvent.bind(this));
        this.hamburgerMenuManager = new HamburgerMenuManager(this.eventManager, this.scrollManager, this.dispatchEvent.bind(this));
        this.container = null;
    }

    /**
     * 허브 화면을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    render(container) {
        this.container = container;
        // 허브 뷰 CSS 네임스페이스 클래스 추가
        this.container.classList.add('hub-view');
        this.container.innerHTML = this.getHubHTML();
        this.bindEvents();
        this.bindCustomEventListeners();
        this.profileManager.loadProfileData();
    }

    /**
     * 허브 화면 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getHubHTML() {
        const totalLogs = this.controller.getAllLogs().length;
        const stats = this.controller.getBasicStats();
        
        return `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <div class="header-with-settings">
                        <div class="header-content">
                            <h1 class="my-logs-title">📝 나의 로그</h1>
                            <p class="my-logs-subtitle">여행 기록과 계획을 한 곳에서 관리하세요</p>
                        </div>
                        <button class="settings-btn" id="settings-btn" title="메뉴">
                            ☰
                        </button>
                    </div>
                </div>
                
                <!-- 프로필 섹션 (Simple Style) -->
                <div class="hub-section profile-section">
                    <div class="profile-content">
                        <div class="profile-avatar-container">
                            <div class="profile-avatar" id="profile-avatar">
                                <img src="" alt="프로필 이미지" class="profile-image" style="display: none;">
                                <div class="profile-avatar-placeholder">✈️</div>
                            </div>
                        </div>
                        <div class="profile-info">
                            <div class="profile-name" id="profile-name">여행자</div>
                            <div class="profile-bio" id="profile-bio" data-placeholder="한마디 메시지를 입력하세요...">I am new to TravelLog.</div>
                        </div>
                    </div>
                    
                    <!-- 통계 섹션 -->
                    <div class="profile-stats">
                        <div class="stat-item">
                            <div class="stat-value" id="stat-trips">${totalLogs}</div>
                            <div class="stat-label">일지 수</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" id="stat-countries">${stats.visitedCountries}</div>
                            <div class="stat-label">나라 수</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" id="stat-cities">${stats.visitedCities}</div>
                            <div class="stat-label">도시 수</div>
                        </div>
                    </div>
                    
                    <!-- 액션 버튼들 -->
                    <div class="profile-action-buttons">
                        <button class="profile-action-btn primary-btn" id="my-map-btn">
                            <div class="btn-icon">📖</div>
                            <div class="btn-text">여행 도감</div>
                        </button>
                        <button class="profile-action-btn secondary-btn" id="travel-report-btn">
                            <div class="btn-icon">📊</div>
                            <div class="btn-text">트래블 레포트</div>
                        </button>
                        <button class="profile-action-btn share-btn" id="share-btn" title="공유">
                            <div class="btn-icon">📤</div>
                        </button>
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
        
        // 여행 도감 버튼
        const myMapBtn = document.getElementById('my-map-btn');
        if (myMapBtn) {
            this.eventManager.add(myMapBtn, 'click', () => {
                this.onNavigateToMyMap();
            });
        }
        
        // 트래블 레포트 버튼
        const travelReportBtn = document.getElementById('travel-report-btn');
        if (travelReportBtn) {
            this.eventManager.add(travelReportBtn, 'click', () => {
                this.onNavigateToTravelReport();
            });
        }
        
        // 공유 버튼
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            this.eventManager.add(shareBtn, 'click', () => {
                this.onShareClick();
            });
        }

        // 햄버거 메뉴 버튼
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            this.eventManager.add(settingsBtn, 'click', () => {
                this.hamburgerMenuManager.showHamburgerMenu();
            });
        }

        // 프로필 이벤트 바인딩
        this.profileManager.bindProfileEvents();
    }

    /**
     * 커스텀 이벤트 리스너를 바인딩합니다
     */
    bindCustomEventListeners() {
        // 로그아웃 이벤트 리스너
        this.container.addEventListener('hubView:logout', () => {
            this.onLogout();
        });
    }

    /**
     * 로그 목록으로 이동
     */
    onNavigateToLogs() {
        this.dispatchEvent('navigate', { view: 'logs' });
    }

    /**
     * 여행 도감으로 이동
     */
    onNavigateToMyMap() {
        // 여행 도감으로 이동
        this.dispatchEvent('navigate', { view: 'collection' });
    }

    /**
     * 트래블 레포트로 이동
     */
    onNavigateToTravelReport() {
        // 트래블 레포트로 이동
        this.dispatchEvent('navigate', { view: 'travelReport' });
    }

    /**
     * 공유 버튼 클릭
     */
    onShareClick() {
        this.dispatchEvent('showMessage', {
            type: 'info',
            message: '공유 기능은 추후 구현 예정입니다.'
        });
    }

    /**
     * 설정으로 이동
     */
    onNavigateToSettings() {
        this.dispatchEvent('navigate', { view: 'settings' });
    }




    /**
     * 프로필로 이동
     */
    onNavigateToProfile() {
        this.dispatchEvent('navigate', { view: 'profile' });
    }

    /**
     * 프리미엄 모드로 이동
     */
    onNavigateToPremium() {
        this.dispatchEvent('showMessage', {
            type: 'info',
            message: '프리미엄 모드 기능은 추후 구현 예정입니다.'
        });
    }

    /**
     * 서포트로 이동
     */
    onNavigateToSupport() {
        this.dispatchEvent('showMessage', {
            type: 'info',
            message: '서포트 기능은 추후 구현 예정입니다.'
        });
    }

    /**
     * 로그아웃
     */
    onLogout() {
        this.logoutManager.onLogout();
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
        // 각 매니저들의 cleanup 호출
        if (this.hamburgerMenuManager) {
            this.hamburgerMenuManager.cleanup();
        }
        
        if (this.scrollManager) {
            this.scrollManager.cleanup();
        }
        
        if (this.logoutManager) {
            this.logoutManager.cleanup();
        }
        
        if (this.profileManager) {
            this.profileManager.cleanup();
        }
        
        if (this.eventManager && typeof this.eventManager.cleanup === 'function') {
            try {
                this.eventManager.cleanup();
            } catch (error) {
                console.warn('HubView: EventManager 정리 중 오류 (무시됨):', error.message);
            }
        }
        
        this.container = null;
    }
}

export { HubView };
