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
        this.isLoggingOut = false;
        this.scrollPosition = undefined;
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
        this.loadProfileData();
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
                this.showHamburgerMenu();
            });
        }

        // 프로필 이미지 업로드 이벤트
        this.bindProfileEvents();
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
     * 햄버거 메뉴를 보여줍니다
     */
    showHamburgerMenu() {
        // 기존 메뉴가 있다면 제거
        this.hideHamburgerMenu();
        
        // 현재 스크롤 위치 저장 (tab-content 기준)
        const tabContent = document.getElementById('tab-content');
        this.scrollPosition = tabContent ? tabContent.scrollTop : (window.pageYOffset || document.documentElement.scrollTop);
        
        // 햄버거 메뉴 HTML 생성
        const menuHTML = this.getHamburgerMenuHTML();
        
        // 메뉴를 body에 추가 (애니메이션 전에 미리 추가)
        document.body.insertAdjacentHTML('beforeend', menuHTML);
        
        // body 스크롤 비활성화 (메뉴 추가 후)
        document.body.classList.add('hamburger-menu-open');
        
        // 스크롤 위치 고정 (transform 대신 scrollTop 사용)
        if (tabContent) {
            // 스크롤 위치를 0으로 설정하여 고정
            tabContent.scrollTop = 0;
            // 현재 위치를 CSS 변수로 저장 (시각적 위치 유지)
            tabContent.style.setProperty('--scroll-offset', `-${this.scrollPosition}px`);
        } else {
            document.body.style.top = `-${this.scrollPosition}px`;
        }
        
        // 애니메이션을 위해 약간의 지연 후 show 클래스 추가
        // 레이아웃이 안정화된 후 애니메이션 시작
        setTimeout(() => {
            const overlay = document.querySelector('.hamburger-menu-overlay');
            const menu = document.querySelector('.hamburger-menu');
            
            if (overlay && menu) {
                overlay.classList.add('show');
                menu.classList.add('show');
            }
        }, 10); // 10ms 지연으로 레이아웃 안정화
        
        // 메뉴 이벤트 바인딩
        this.bindHamburgerMenuEvents();
        
        // 스크롤 이벤트 완전 차단
        this.preventScrollEvents();
    }

    /**
     * 햄버거 메뉴를 숨깁니다
     */
    hideHamburgerMenu() {
        const overlay = document.querySelector('.hamburger-menu-overlay');
        const menu = document.querySelector('.hamburger-menu');
        
        if (overlay && menu) {
            overlay.classList.remove('show');
            menu.classList.remove('show');
            
            // 애니메이션 완료 후 DOM에서 제거 및 스크롤 복원
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                
                // 스크롤 이벤트 차단 해제
                this.restoreScrollEvents();
                
                // body 스크롤 복원
                document.body.classList.remove('hamburger-menu-open');
                document.body.style.top = '';
                
                // 탭 콘텐츠 스크롤 복원
                const tabContent = document.getElementById('tab-content');
                if (tabContent) {
                    // CSS 변수 제거
                    tabContent.style.removeProperty('--scroll-offset');
                }
                
                // 스크롤 위치 복원
                if (this.scrollPosition !== undefined) {
                    if (tabContent) {
                        // 약간의 지연 후 스크롤 위치 복원 (레이아웃 안정화 후)
                        requestAnimationFrame(() => {
                            tabContent.scrollTop = this.scrollPosition;
                        });
                    } else {
                        window.scrollTo(0, this.scrollPosition);
                    }
                    this.scrollPosition = undefined;
                }
            }, 300);
        }
    }

    /**
     * 스크롤 이벤트를 완전히 차단합니다
     */
    preventScrollEvents() {
        // 스크롤 이벤트 차단 함수
        this.scrollPreventHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        
        // 휠 이벤트 차단
        this.wheelPreventHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        
        // 터치 이벤트 차단
        this.touchPreventHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        
        // 키보드 스크롤 이벤트 차단
        this.keyPreventHandler = (e) => {
            const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40]; // 스페이스, Page Up/Down, Home, End, 방향키
            if (scrollKeys.includes(e.keyCode)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
        
        // 이벤트 리스너 등록
        document.addEventListener('scroll', this.scrollPreventHandler, { passive: false, capture: true });
        document.addEventListener('wheel', this.wheelPreventHandler, { passive: false, capture: true });
        document.addEventListener('touchmove', this.touchPreventHandler, { passive: false, capture: true });
        document.addEventListener('keydown', this.keyPreventHandler, { passive: false, capture: true });
        
        // 탭 콘텐츠에도 적용
        const tabContent = document.getElementById('tab-content');
        if (tabContent) {
            tabContent.addEventListener('scroll', this.scrollPreventHandler, { passive: false, capture: true });
            tabContent.addEventListener('wheel', this.wheelPreventHandler, { passive: false, capture: true });
            tabContent.addEventListener('touchmove', this.touchPreventHandler, { passive: false, capture: true });
        }
    }
    
    /**
     * 스크롤 이벤트 차단을 해제합니다
     */
    restoreScrollEvents() {
        // 이벤트 리스너 제거
        if (this.scrollPreventHandler) {
            document.removeEventListener('scroll', this.scrollPreventHandler, { capture: true });
            document.removeEventListener('wheel', this.wheelPreventHandler, { capture: true });
            document.removeEventListener('touchmove', this.touchPreventHandler, { capture: true });
            document.removeEventListener('keydown', this.keyPreventHandler, { capture: true });
            
            // 탭 콘텐츠에서도 제거
            const tabContent = document.getElementById('tab-content');
            if (tabContent) {
                tabContent.removeEventListener('scroll', this.scrollPreventHandler, { capture: true });
                tabContent.removeEventListener('wheel', this.wheelPreventHandler, { capture: true });
                tabContent.removeEventListener('touchmove', this.touchPreventHandler, { capture: true });
            }
        }
        
        // 핸들러 정리
        this.scrollPreventHandler = null;
        this.wheelPreventHandler = null;
        this.touchPreventHandler = null;
        this.keyPreventHandler = null;
    }

    /**
     * 햄버거 메뉴 HTML을 생성합니다
     */
    getHamburgerMenuHTML() {
        return `
            <div class="hamburger-menu-overlay" id="hamburger-menu-overlay">
                <div class="hamburger-menu" id="hamburger-menu">
                    <div class="hamburger-menu-header">
                        <h2 class="hamburger-menu-title">메뉴</h2>
                        <button class="hamburger-menu-close" id="hamburger-menu-close">×</button>
                    </div>
                    <div class="hamburger-menu-content">
                        <div class="hamburger-menu-section">
                            <h3 class="hamburger-menu-section-title">설정</h3>
                            <button class="hamburger-menu-item" id="menu-profile">
                                <span class="hamburger-menu-item-icon">👤</span>
                                <span class="hamburger-menu-item-text">프로필</span>
                                <span class="hamburger-menu-item-arrow">▶</span>
                            </button>
                            <button class="hamburger-menu-item" id="menu-settings">
                                <span class="hamburger-menu-item-icon">⚙️</span>
                                <span class="hamburger-menu-item-text">설정</span>
                                <span class="hamburger-menu-item-arrow">▶</span>
                            </button>
                        </div>
                        
                        <div class="hamburger-menu-section">
                            <h3 class="hamburger-menu-section-title">지원</h3>
                            <button class="hamburger-menu-item" id="menu-premium">
                                <span class="hamburger-menu-item-icon">⭐</span>
                                <span class="hamburger-menu-item-text">프리미엄 모드</span>
                                <span class="hamburger-menu-item-arrow">▶</span>
                            </button>
                            <button class="hamburger-menu-item" id="menu-support">
                                <span class="hamburger-menu-item-icon">❓</span>
                                <span class="hamburger-menu-item-text">서포트</span>
                                <span class="hamburger-menu-item-arrow">▶</span>
                            </button>
                        </div>
                        
                        <div class="hamburger-menu-section">
                            <button class="hamburger-menu-item version-info" id="menu-version">
                                <span class="hamburger-menu-item-text">버전 1.0.0</span>
                            </button>
                            <button class="hamburger-menu-item logout" id="menu-logout">
                                <span class="hamburger-menu-item-icon">🚪</span>
                                <span class="hamburger-menu-item-text">로그아웃</span>
                                <span class="hamburger-menu-item-arrow">▶</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 햄버거 메뉴 이벤트를 바인딩합니다
     */
    bindHamburgerMenuEvents() {
        // 메뉴 닫기 버튼
        const closeBtn = document.getElementById('hamburger-menu-close');
        const overlay = document.getElementById('hamburger-menu-overlay');
        
        if (closeBtn) {
            this.eventManager.add(closeBtn, 'click', () => {
                this.hideHamburgerMenu();
            });
        }
        
        if (overlay) {
            this.eventManager.add(overlay, 'click', (e) => {
                if (e.target === overlay) {
                    this.hideHamburgerMenu();
                }
            });
        }
        
        // ESC 키로 메뉴 닫기
        this.eventManager.add(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideHamburgerMenu();
            }
        });
        
        // 메뉴 아이템들
        const profileBtn = document.getElementById('menu-profile');
        const settingsBtn = document.getElementById('menu-settings');
        const premiumBtn = document.getElementById('menu-premium');
        const supportBtn = document.getElementById('menu-support');
        const logoutBtn = document.getElementById('menu-logout');
        
        if (profileBtn) {
            this.eventManager.add(profileBtn, 'click', () => {
                this.hideHamburgerMenu();
                this.onNavigateToProfile();
            });
        }
        
        if (settingsBtn) {
            this.eventManager.add(settingsBtn, 'click', () => {
                this.hideHamburgerMenu();
                this.onNavigateToSettings();
            });
        }
        
        if (premiumBtn) {
            this.eventManager.add(premiumBtn, 'click', () => {
                this.hideHamburgerMenu();
                this.onNavigateToPremium();
            });
        }
        
        if (supportBtn) {
            this.eventManager.add(supportBtn, 'click', () => {
                this.hideHamburgerMenu();
                this.onNavigateToSupport();
            });
        }
        
        if (logoutBtn) {
            this.eventManager.add(logoutBtn, 'click', () => {
                this.hideHamburgerMenu();
                this.onLogout();
            });
        }
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
        // 중복 로그아웃 방지
        if (this.isLoggingOut) {
            return;
        }
        this.isLoggingOut = true;
        
        this.showLogoutConfirmation();
    }

    /**
     * 로그아웃 확인 모달을 표시합니다
     */
    showLogoutConfirmation() {
        const modal = document.createElement('div');
        modal.className = 'logout-confirmation-modal';
        modal.innerHTML = `
            <div class="logout-confirmation-overlay">
                <div class="logout-confirmation-content">
                    <div class="logout-confirmation-header">
                        <h3 class="logout-confirmation-title">로그아웃</h3>
                        <p class="logout-confirmation-message">정말로 로그아웃하시겠습니까?</p>
                    </div>
                    <div class="logout-confirmation-actions">
                        <button class="logout-confirmation-btn cancel-btn" id="logout-cancel">
                            취소
                        </button>
                        <button class="logout-confirmation-btn confirm-btn" id="logout-confirm">
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 이벤트 바인딩
        const cancelBtn = document.getElementById('logout-cancel');
        const confirmBtn = document.getElementById('logout-confirm');
        const overlay = modal.querySelector('.logout-confirmation-overlay');

        if (cancelBtn) {
            this.eventManager.add(cancelBtn, 'click', () => {
                this.hideLogoutConfirmation(modal);
            });
        }

        if (confirmBtn) {
            this.eventManager.add(confirmBtn, 'click', () => {
                this.performLogout(modal);
            });
        }

        if (overlay) {
            this.eventManager.add(overlay, 'click', (e) => {
                if (e.target === overlay) {
                    this.hideLogoutConfirmation(modal);
                }
            });
        }

        // 모달 표시 애니메이션
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }

    /**
     * 로그아웃 확인 모달을 숨깁니다
     */
    hideLogoutConfirmation(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            // 모달이 숨겨질 때 로그아웃 상태 리셋
            this.isLoggingOut = false;
        }, 300);
    }

    /**
     * 실제 로그아웃을 수행합니다
     */
    async performLogout(modal) {
        try {
            // 로딩 상태 표시
            const confirmBtn = document.getElementById('logout-confirm');
            if (confirmBtn) {
                confirmBtn.disabled = true;
                confirmBtn.textContent = '로그아웃 중...';
            }

            // AuthService를 통해 로그아웃
            const { authService } = await import('../../../modules/services/auth-service.js');
            await authService.signOut();

            // 모달 숨기기
            this.hideLogoutConfirmation(modal);

        } catch (error) {
            console.error('로그아웃 실패:', error);
            
            // 에러 메시지 표시
            this.dispatchEvent('showMessage', {
                type: 'error',
                message: '로그아웃 중 오류가 발생했습니다.'
            });

            // 버튼 상태 복원
            const confirmBtn = document.getElementById('logout-confirm');
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = '로그아웃';
            }
        } finally {
            // 로그아웃 상태 리셋
            this.isLoggingOut = false;
        }
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
     * 프로필 관련 이벤트를 바인딩합니다
     */
    bindProfileEvents() {

        // 프로필 이름 편집
        const profileName = document.getElementById('profile-name');
        if (profileName) {
            this.eventManager.add(profileName, 'click', () => {
                this.editProfileName();
            });
        }

    }



    /**
     * 프로필 이름을 편집합니다
     */
    editProfileName() {
        const profileName = document.getElementById('profile-name');
        if (!profileName) return;

        const currentName = profileName.textContent;
        const newName = prompt('이름을 입력하세요:', currentName);
        
        if (newName && newName.trim() && newName !== currentName) {
            profileName.textContent = newName.trim();
            this.saveProfileData();
        }
    }


    /**
     * 프로필 데이터를 저장합니다
     */
    saveProfileData() {
        const profileData = {
            name: document.getElementById('profile-name')?.textContent || '여행자'
        };

        try {
            localStorage.setItem('travelLog_profile', JSON.stringify(profileData));
            this.dispatchEvent('showMessage', {
                type: 'success',
                message: '프로필이 저장되었습니다.'
            });
        } catch (error) {
            console.error('프로필 저장 실패:', error);
            this.dispatchEvent('showMessage', {
                type: 'error',
                message: '프로필 저장에 실패했습니다.'
            });
        }
    }

    /**
     * 저장된 프로필 데이터를 로드합니다
     */
    loadProfileData() {
        try {
            // 먼저 실제 사용자 정보에서 이름을 가져옵니다
            this.loadUserProfileName();
            
            // 그 다음 로컬 프로필 데이터를 로드합니다
            const savedData = localStorage.getItem('travelLog_profile');
            if (savedData) {
                const profileData = JSON.parse(savedData);
                // 프로필 데이터 로드 (이미지 제외)
            }
        } catch (error) {
            console.error('프로필 데이터 로드 실패:', error);
        }
    }

    /**
     * 실제 사용자 정보에서 프로필 이름을 로드합니다
     */
    loadUserProfileName() {
        try {
            // AuthController를 통해 현재 사용자 정보 가져오기
            if (window.appManager && window.appManager.authManager && window.appManager.authManager.authController) {
                const currentUser = window.appManager.authManager.authController.getCurrentUser();
                if (currentUser && currentUser.user_metadata && currentUser.user_metadata.full_name) {
                    const profileName = document.getElementById('profile-name');
                    if (profileName) {
                        profileName.textContent = currentUser.user_metadata.full_name;
                        console.log('사용자 이름 로드됨:', currentUser.user_metadata.full_name);
                        return;
                    }
                }
            }
            
            // AuthController가 없거나 사용자 정보가 없는 경우 기본값 사용
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.textContent = '여행자';
                console.log('기본 이름 사용: 여행자');
            }
        } catch (error) {
            console.error('사용자 프로필 이름 로드 실패:', error);
            // 오류 발생 시 기본값 사용
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.textContent = '여행자';
            }
        }
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
        // 햄버거 메뉴 정리
        this.hideHamburgerMenu();
        
        // 스크롤 이벤트 차단 해제
        this.restoreScrollEvents();
        
        if (this.eventManager) {
            this.eventManager.cleanup();
        }
        this.container = null;
    }
}

export { HubView };
