/**
 * HamburgerMenuManager - 햄버거 메뉴 관리자
 * 
 * 🎯 책임:
 * - 햄버거 메뉴 표시 및 숨김
 * - 햄버거 메뉴 이벤트 관리
 * - 스크롤 관리와 연동
 * - 메뉴 애니메이션 처리
 * 
 * @class HamburgerMenuManager
 * @version 1.0.0
 * @since 2024-12-29
 */
class HamburgerMenuManager {
    constructor(eventManager, scrollManager, dispatchEvent) {
        this.eventManager = eventManager;
        this.scrollManager = scrollManager;
        this.dispatchEvent = dispatchEvent;
        this.isMenuVisible = false;
        this.currentOverlay = null;
        this.currentMenu = null;
    }

    /**
     * 햄버거 메뉴를 표시합니다
     */
    showHamburgerMenu() {
        // 기존 메뉴가 있다면 제거
        this.hideHamburgerMenu();
        
        // 현재 스크롤 위치 저장 (tab-content 기준)
        const tabContent = document.getElementById('tab-content');
        this.scrollManager.saveScrollPosition(tabContent);
        
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
            // ScrollManager를 사용하여 CSS 변수 설정
            this.scrollManager.setScrollOffset(tabContent);
        } else {
            document.body.style.top = `-${this.scrollManager.scrollPosition || 0}px`;
        }
        
        // 애니메이션을 위해 약간의 지연 후 show 클래스 추가
        // 레이아웃이 안정화된 후 애니메이션 시작
        setTimeout(() => {
            const overlay = document.querySelector('.hamburger-menu-overlay');
            const menu = document.querySelector('.hamburger-menu');
            
            if (overlay && menu) {
                overlay.classList.add('show');
                menu.classList.add('show');
                this.currentOverlay = overlay;
                this.currentMenu = menu;
                this.isMenuVisible = true;
            }
        }, 10); // 10ms 지연으로 레이아웃 안정화
        
        // 메뉴 이벤트 바인딩
        this.bindHamburgerMenuEvents();
        
        // 스크롤 이벤트 완전 차단
        this.scrollManager.preventScroll(tabContent);
    }

    /**
     * 햄버거 메뉴를 숨깁니다
     */
    hideHamburgerMenu() {
        const overlay = this.currentOverlay || document.querySelector('.hamburger-menu-overlay');
        const menu = this.currentMenu || document.querySelector('.hamburger-menu');
        
        if (overlay && menu) {
            overlay.classList.remove('show');
            menu.classList.remove('show');
            
            // 애니메이션 완료 후 DOM에서 제거 및 스크롤 복원
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                
                // 탭 콘텐츠 요소 가져오기 (먼저 선언)
                const tabContent = document.getElementById('tab-content');
                
                // 스크롤 이벤트 차단 해제
                this.scrollManager.restoreScroll(tabContent);
                
                // body 스크롤 복원
                document.body.classList.remove('hamburger-menu-open');
                document.body.style.top = '';
                
                // 탭 콘텐츠 스크롤 복원
                if (tabContent) {
                    // ScrollManager를 사용하여 CSS 변수 제거
                    this.scrollManager.removeScrollOffset(tabContent);
                }
                
                // 스크롤 위치 복원
                this.scrollManager.restoreScrollPosition(tabContent);
                
                // 상태 초기화
                this.isMenuVisible = false;
                this.currentOverlay = null;
                this.currentMenu = null;
            }, 300);
        }
    }

    /**
     * 햄버거 메뉴 HTML을 생성합니다
     * @returns {string} 메뉴 HTML 문자열
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
                this.dispatchEvent('navigate', { view: 'profile' });
            });
        }
        
        if (settingsBtn) {
            this.eventManager.add(settingsBtn, 'click', () => {
                this.hideHamburgerMenu();
                this.dispatchEvent('navigate', { view: 'settings' });
            });
        }
        
        if (premiumBtn) {
            this.eventManager.add(premiumBtn, 'click', () => {
                this.hideHamburgerMenu();
                this.dispatchEvent('showMessage', {
                    type: 'info',
                    message: '프리미엄 모드 기능은 추후 구현 예정입니다.'
                });
            });
        }
        
        if (supportBtn) {
            this.eventManager.add(supportBtn, 'click', () => {
                this.hideHamburgerMenu();
                this.dispatchEvent('showMessage', {
                    type: 'info',
                    message: '서포트 기능은 추후 구현 예정입니다.'
                });
            });
        }
        
        if (logoutBtn) {
            this.eventManager.add(logoutBtn, 'click', () => {
                this.hideHamburgerMenu();
                // 로그아웃 이벤트 발생
                this.dispatchEvent('logout');
            });
        }
    }

    /**
     * 메뉴가 현재 표시되어 있는지 반환합니다
     * @returns {boolean} 메뉴 표시 여부
     */
    isMenuOpen() {
        return this.isMenuVisible;
    }

    /**
     * HamburgerMenuManager를 정리합니다
     */
    cleanup() {
        // 메뉴가 열려있다면 닫기
        this.hideHamburgerMenu();
        
        // 상태 초기화
        this.isMenuVisible = false;
        this.currentOverlay = null;
        this.currentMenu = null;
    }
}

export { HamburgerMenuManager };
