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
                            <button class="profile-avatar-edit" id="profile-avatar-edit" title="프로필 이미지 변경">
                                <span class="camera-icon">📷</span>
                            </button>
                            <input type="file" id="profile-image-input" accept="image/*" style="display: none;">
                        </div>
                        <div class="profile-info">
                            <div class="profile-name" id="profile-name">여행자</div>
                            <div class="profile-bio" id="profile-bio" contenteditable="true" data-placeholder="한마디 메시지를 입력하세요...">I am new to TravelLog.</div>
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
        
        // 햄버거 메뉴 HTML 생성
        const menuHTML = this.getHamburgerMenuHTML();
        
        // 메뉴를 body에 추가
        document.body.insertAdjacentHTML('beforeend', menuHTML);
        
        // 애니메이션을 위해 약간의 지연 후 show 클래스 추가
        requestAnimationFrame(() => {
            const overlay = document.querySelector('.hamburger-menu-overlay');
            const menu = document.querySelector('.hamburger-menu');
            
            if (overlay && menu) {
                overlay.classList.add('show');
                menu.classList.add('show');
            }
        });
        
        // 메뉴 이벤트 바인딩
        this.bindHamburgerMenuEvents();
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
            
            // 애니메이션 완료 후 DOM에서 제거
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
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
        this.dispatchEvent('showMessage', {
            type: 'info',
            message: '로그아웃 기능은 추후 구현 예정입니다.'
        });
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
        // 프로필 이미지 업로드 버튼
        const avatarEditBtn = document.getElementById('profile-avatar-edit');
        const imageInput = document.getElementById('profile-image-input');
        
        if (avatarEditBtn && imageInput) {
            this.eventManager.add(avatarEditBtn, 'click', () => {
                imageInput.click();
            });
            
            this.eventManager.add(imageInput, 'change', (e) => {
                this.handleImageUpload(e);
            });
        }

        // 프로필 이름 편집
        const profileName = document.getElementById('profile-name');
        if (profileName) {
            this.eventManager.add(profileName, 'click', () => {
                this.editProfileName();
            });
        }

        // 프로필 한마디 편집
        const profileBio = document.getElementById('profile-bio');
        if (profileBio) {
            this.eventManager.add(profileBio, 'blur', () => {
                this.saveProfileBio();
            });
            
            this.eventManager.add(profileBio, 'keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    profileBio.blur();
                }
            });
        }
    }

    /**
     * 이미지 업로드를 처리합니다
     * @param {Event} event - 파일 입력 이벤트
     */
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 파일 크기 검증 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            this.dispatchEvent('showMessage', {
                type: 'error',
                message: '이미지 크기는 5MB 이하여야 합니다.'
            });
            return;
        }

        // 이미지 타입 검증
        if (!file.type.startsWith('image/')) {
            this.dispatchEvent('showMessage', {
                type: 'error',
                message: '이미지 파일만 업로드할 수 있습니다.'
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.updateProfileImage(e.target.result);
            this.saveProfileData();
        };
        reader.readAsDataURL(file);
    }

    /**
     * 프로필 이미지를 업데이트합니다
     * @param {string} imageData - 이미지 데이터 URL
     */
    updateProfileImage(imageData) {
        const profileImage = document.querySelector('.profile-image');
        const placeholder = document.querySelector('.profile-avatar-placeholder');
        
        if (profileImage && placeholder) {
            profileImage.src = imageData;
            profileImage.style.display = 'block';
            placeholder.style.display = 'none';
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
     * 프로필 한마디를 저장합니다
     */
    saveProfileBio() {
        const profileBio = document.getElementById('profile-bio');
        if (!profileBio) return;

        const bio = profileBio.textContent.trim();
        this.saveProfileData();
    }

    /**
     * 프로필 데이터를 저장합니다
     */
    saveProfileData() {
        const profileData = {
            name: document.getElementById('profile-name')?.textContent || '여행자',
            bio: document.getElementById('profile-bio')?.textContent || 'I am new to TravelLog.',
            image: document.querySelector('.profile-image')?.src || null
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
            const savedData = localStorage.getItem('travelLog_profile');
            if (savedData) {
                const profileData = JSON.parse(savedData);
                
                const profileName = document.getElementById('profile-name');
                const profileBio = document.getElementById('profile-bio');
                
                if (profileName && profileData.name) {
                    profileName.textContent = profileData.name;
                }
                
                if (profileBio && profileData.bio) {
                    profileBio.textContent = profileData.bio;
                }
                
                if (profileData.image) {
                    this.updateProfileImage(profileData.image);
                }
            }
        } catch (error) {
            console.error('프로필 데이터 로드 실패:', error);
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
        
        if (this.eventManager) {
            this.eventManager.cleanup();
        }
        this.container = null;
    }
}

export { HubView };
