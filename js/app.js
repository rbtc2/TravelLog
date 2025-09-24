/**
 * TravelLog 메인 애플리케이션
 * 로그인 화면과 탭 관리 및 동적 모듈 로딩을 담당
 */

import { AppInfo } from './config/app-config.js';
import { themeManager } from './modules/utils/theme-manager.js';
import DesktopLayoutManager from './modules/desktop-layout-manager.js'; // PHASE 1: 데스크톱 레이아웃 매니저
import AuthManager from './modules/auth/auth-manager.js'; // 인증 관리자
import PasswordResetHandler from './modules/auth/password-reset-handler.js'; // 비밀번호 재설정 핸들러
import EmailConfirmationHandler from './modules/auth/email-confirmation-handler.js'; // 이메일 확인 핸들러
import { travelLogService } from './modules/services/travel-log-service.js'; // 여행 로그 서비스
import ZIndexManager from './modules/utils/z-index-manager.js'; // Z-Index 충돌 관리 시스템
import StackingContextDebugger from './modules/utils/stacking-context-debugger.js'; // Stacking Context 디버깅 도구
import DevelopmentValidator from './modules/utils/development-validator.js'; // 개발 시 실시간 검증기

// 모바일 환경 최적화
(function() {
    'use strict';
    
    // 터치 이벤트 최적화
    let touchStartY = 0;
    let touchStartX = 0;
    let isScrolling = false;
    let scrollTimeout;
    
    // 터치 시작 이벤트
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        isScrolling = false;
        
        // 스크롤 타임아웃 초기화
        clearTimeout(scrollTimeout);
    }, { passive: true });
    
    // 터치 이동 이벤트 (가로 스크롤 방지, 스크롤 중일 때는 방해하지 않음)
    document.addEventListener('touchmove', function(e) {
        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        const deltaY = Math.abs(touchY - touchStartY);
        const deltaX = Math.abs(touchX - touchStartX);
        
        // 세로 스크롤 감지
        if (deltaY > 10) {
            isScrolling = true;
            // 스크롤 중임을 표시
            document.body.classList.add('is-scrolling');
            
            // 스크롤 종료 후 클래스 제거
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('is-scrolling');
                isScrolling = false;
            }, 150);
        }
        
        // 가로 스크롤만 방지하고, 스크롤 중일 때는 방해하지 않음
        if (deltaX > deltaY && deltaX > 10 && e.cancelable && !isScrolling) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // 더블 탭 줌 방지 (스크롤 중일 때는 방해하지 않음)
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300 && e.cancelable && !isScrolling) {
            // 더블 탭이면서 취소 가능하고 스크롤 중이 아닌 경우에만 방지
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
    
    // 입력 필드 포커스 시 줌 방지
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // 입력 필드가 화면 중앙에 오도록 스크롤
            setTimeout(() => {
                this.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 300);
        });
    });
    
    // 모바일 키보드 표시 시 레이아웃 조정
    let initialViewportHeight = window.innerHeight;
    window.addEventListener('resize', function() {
        if (window.innerHeight < initialViewportHeight) {
            // 키보드가 표시됨
            document.body.style.height = window.innerHeight + 'px';
        } else {
            // 키보드가 숨겨짐
            document.body.style.height = '100vh';
        }
    });
    
    // 터치 피드백 효과 최적화
    const touchElements = document.querySelectorAll('button, .tab-btn, .login-btn, .demo-btn, a');
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            if (!isScrolling) {
                this.style.transform = 'scale3d(0.98, 0.98, 1)';
            }
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale3d(1, 1, 1)';
        }, { passive: true });
    });
    
    // 스크롤 성능 최적화를 위한 추가 설정
    document.addEventListener('DOMContentLoaded', function() {
        // 모든 스크롤 가능한 요소에 최적화 적용
        const scrollableElements = document.querySelectorAll('*');
        scrollableElements.forEach(element => {
            const style = window.getComputedStyle(element);
            if (style.overflow === 'auto' || style.overflow === 'scroll' || style.overflowY === 'auto' || style.overflowY === 'scroll') {
                element.style.webkitOverflowScrolling = 'touch';
                element.style.transform = 'translate3d(0, 0, 0)';
                element.style.backfaceVisibility = 'hidden';
            }
        });
    });
})();

class AppManager {
    constructor() {
        this.currentTab = null;
        this.tabModules = new Map();
        this.isLoggedIn = false;
        this.isHandlingLoginSuccess = false;
        this.authManager = null;
        
        // PHASE 1: 데스크톱 레이아웃 매니저 초기화
        this.desktopLayoutManager = new DesktopLayoutManager();
        
            // Z-Index 충돌 관리 시스템 초기화
            this.zIndexManager = window.zIndexManager;
            
            
            // Stacking Context 디버깅 도구 초기화
            this.stackingContextDebugger = window.stackingContextDebugger;
        
        // DOM 요소들
        this.loginScreen = document.getElementById('login-screen');
        this.mainApp = document.getElementById('main-app');
        this.tabContent = document.getElementById('tab-content');
        this.tabButtons = document.querySelectorAll('.tab-btn');
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        this.updateAppInfo();
        
        // 이메일 확인 핸들러 초기화 (URL 토큰 확인)
        try {
            const emailConfirmationHandler = new EmailConfirmationHandler();
            await emailConfirmationHandler.initialize();
        } catch (error) {
            console.error('이메일 확인 핸들러 초기화 실패:', error);
        }

        // 비밀번호 재설정 핸들러 초기화 (URL 토큰 확인)
        try {
            const passwordResetHandler = new PasswordResetHandler();
            await passwordResetHandler.initialize();
        } catch (error) {
            console.error('비밀번호 재설정 핸들러 초기화 실패:', error);
        }

        // 인증 관리자 초기화
        try {
            this.authManager = new AuthManager();
        } catch (error) {
            console.error('인증 관리자 초기화 실패:', error);
            this.showLoginScreen();
        }

        // 여행 로그 서비스 초기화
        try {
            await travelLogService.initialize();
        } catch (error) {
            console.error('여행 로그 서비스 초기화 실패:', error);
        }
        
        // PHASE 1: 데스크톱 레이아웃 매니저 초기화
        try {
            await this.desktopLayoutManager.initialize();
            
            // 데스크톱 레이아웃 토글 버튼 추가
            this.addDesktopLayoutToggle();
            
            // 레이아웃 모드 변경 이벤트 리스너 등록
            window.addEventListener('layoutModeChanged', (event) => {
                this.updateDesktopToggleButton();
            });
        } catch (error) {
            console.warn('데스크톱 레이아웃 매니저 초기화 실패:', error);
        }
    }
    
    /**
     * PHASE 1: 데스크톱 레이아웃 토글 버튼 추가
     */
    addDesktopLayoutToggle() {
        // 데스크톱에서만 표시
        if (window.innerWidth < 1024) return;
        
        // 기존 버튼 제거
        const existingToggle = document.querySelector('.desktop-layout-toggle');
        if (existingToggle) {
            existingToggle.remove();
        }
        
        // 토글 버튼 생성
        const toggleButton = document.createElement('button');
        toggleButton.className = 'desktop-layout-toggle';
        toggleButton.innerHTML = `
            <span class="icon">🖥️</span>
            <span>데스크톱 모드</span>
        `;
        
        // 이벤트 리스너 추가
        toggleButton.addEventListener('click', () => {
            this.toggleDesktopLayout();
        });
        
        // 버튼을 body에 추가
        document.body.appendChild(toggleButton);
        
        // 데스크톱 모드일 때 버튼 숨김
        this.updateDesktopToggleButton();
    }
    
    /**
     * PHASE 1: 데스크톱 레이아웃 토글
     */
    async toggleDesktopLayout() {
        try {
            if (this.desktopLayoutManager.isDesktopMode()) {
                await this.desktopLayoutManager.switchMode('mobile');
            } else {
                await this.desktopLayoutManager.switchMode('desktop');
            }
            this.updateDesktopToggleButton();
        } catch (error) {
            console.error('데스크톱 레이아웃 토글 실패:', error);
        }
    }
    
    /**
     * PHASE 1: 데스크톱 토글 버튼 업데이트
     */
    updateDesktopToggleButton() {
        const toggleButton = document.querySelector('.desktop-layout-toggle');
        if (!toggleButton) return;
        
        if (this.desktopLayoutManager.isDesktopMode()) {
            toggleButton.innerHTML = `
                <span class="icon">📱</span>
                <span>모바일 모드</span>
            `;
            toggleButton.style.display = 'none'; // 데스크톱 모드에서는 숨김
        } else {
            toggleButton.innerHTML = `
                <span class="icon">🖥️</span>
                <span>데스크톱 모드</span>
            `;
            toggleButton.style.display = 'flex'; // 모바일 모드에서는 표시
        }
    }
    
    /**
     * PHASE 1: 로그인 후 데스크톱 레이아웃 초기화
     */
    async initializeDesktopLayoutAfterLogin() {
        try {
            // 데스크톱 레이아웃 매니저 재초기화
            await this.desktopLayoutManager.initialize();
            
            // 데스크톱 토글 버튼 다시 추가
            this.addDesktopLayoutToggle();
            
            console.log('로그인 후 데스크톱 레이아웃 초기화 완료');
        } catch (error) {
            console.warn('로그인 후 데스크톱 레이아웃 초기화 실패:', error);
        }
    }
    
    /**
     * 앱 정보를 업데이트합니다
     */
    updateAppInfo() {
        try {
            const versionInfo = AppInfo.getVersionInfo();
            const appInfo = AppInfo.getAppInfo();
            
            // 페이지 제목 업데이트
            document.title = appInfo.title;
            
            // 앱 정보 요소들 업데이트
            const versionElement = document.querySelector('.app-version');
            const buildElement = document.querySelector('.app-build');
            const developerElement = document.querySelector('.app-developer');
            
            if (versionElement) {
                versionElement.textContent = `v${versionInfo.version}`;
            }
            
            if (buildElement) {
                buildElement.textContent = `Build ${versionInfo.buildNumber}`;
            }
            
            if (developerElement) {
                developerElement.textContent = `by ${versionInfo.developer}`;
            }
            
            console.log('앱 정보가 업데이트되었습니다:', AppInfo.getAppInfoString());
        } catch (error) {
            console.error('앱 정보 업데이트 실패:', error);
        }
    }
    
    bindEvents() {
        // 탭 버튼 클릭
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }
    
    loginSuccess() {
        // 중복 호출 방지
        if (this.isHandlingLoginSuccess) {
            return;
        }
        this.isHandlingLoginSuccess = true;

        this.isLoggedIn = true;
        this.showMainApp();
        
        // PHASE 1 수정: 로그인 성공 후 데스크톱 레이아웃 재초기화
        this.initializeDesktopLayoutAfterLogin();
        this.loadTab('home'); // 기본 탭 로드

        // 상태 리셋
        setTimeout(() => {
            this.isHandlingLoginSuccess = false;
        }, 2000);
    }

    /**
     * 로그아웃 성공을 처리합니다
     */
    logoutSuccess() {
        this.isLoggedIn = false;
        this.showLoginScreen();
        
        // 현재 탭 정리
        this.cleanupCurrentTab();
        
        // 탭 상태 초기화
        this.currentTab = null;
        this.tabModules.clear();
    }
    
    showLoginScreen() {
        this.loginScreen.style.display = 'flex';
        this.mainApp.classList.add('hidden');
        
        // PHASE 1 수정: 로그인 화면에서 데스크톱 토글 버튼 숨김
        const toggleButton = document.querySelector('.desktop-layout-toggle');
        if (toggleButton) {
            toggleButton.style.display = 'none';
        }
    }
    
    showMainApp() {
        if (this.loginScreen) {
            this.loginScreen.style.display = 'none';
        }

        if (this.mainApp) {
            this.mainApp.classList.remove('hidden');
        }
    }
    
    async switchTab(tabName) {
        try {
            // 현재 탭 정리
            await this.cleanupCurrentTab();
            
            // 새 탭 로드
            const module = await this.loadTabModule(tabName);
            
            // PHASE 1: 데스크톱 레이아웃에서 탭 콘텐츠 렌더링
            if (this.desktopLayoutManager.isDesktopMode()) {
                await this.renderDesktopTabContent(module, tabName);
            } else {
                await this.renderTabContent(module);
            }
            
            // 모든 탭에 대해 데이터 새로고침 (데모 데이터 생성 포함)
            if (module.default && typeof module.default.refresh === 'function') {
                module.default.refresh();
            }
            
            // UI 업데이트
            this.updateTabUI(tabName);
            
            // 현재 탭 업데이트
            this.currentTab = tabName;
            
            // 탭 전환 후 스크롤을 상단으로 이동
            this.scrollToTop();
            
        } catch (error) {
            console.error(`탭 전환 실패: ${tabName}`, error);
            this.showError(tabName, error);
        }
    }
    
    async loadTab(tabName) {
        try {
            // 로딩 상태 표시
            this.showLoading();
            
            // 동적 모듈 로드
            const module = await this.loadTabModule(tabName);
            
            // 탭 콘텐츠 렌더링
            await this.renderTabContent(module);
            
            this.currentTab = tabName;
            
            // 탭 로드 후 스크롤을 상단으로 이동
            this.scrollToTop();
            
        } catch (error) {
            console.error(`탭 로드 실패: ${tabName}`, error);
            this.showError(tabName, error);
        }
    }
    
    async loadTabModule(tabName) {
        // 이미 로드된 모듈이 있다면 재사용
        if (this.tabModules.has(tabName)) {
            return this.tabModules.get(tabName);
        }
        
        // 동적 import로 모듈 로드
        let moduleName = tabName;
        if (tabName === 'my-logs') {
            moduleName = 'my-logs';
        } else if (tabName === 'search') {
            moduleName = 'search';
        }
        const module = await import(`./tabs/${moduleName}.js`);
        this.tabModules.set(tabName, module);
        
        return module;
    }
    
    async renderTabContent(module) {
        if (module && module.default && typeof module.default.render === 'function') {
            this.tabContent.innerHTML = '';
            await module.default.render(this.tabContent);
        } else {
            this.showPlaceholder();
        }
    }
    
    /**
     * PHASE 1: 데스크톱 레이아웃에서 탭 콘텐츠 렌더링
     */
    async renderDesktopTabContent(module, tabName) {
        const desktopGrid = document.querySelector('.desktop-grid');
        if (!desktopGrid) {
            console.warn('데스크톱 그리드 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        // 기존 콘텐츠 정리
        desktopGrid.innerHTML = '';
        
        // 탭별 데스크톱 최적화 렌더링
        if (module && module.default && typeof module.default.render === 'function') {
            // 임시 컨테이너 생성
            const tempContainer = document.createElement('div');
            tempContainer.className = 'desktop-tab-content';
            tempContainer.style.width = '100%';
            tempContainer.style.gridColumn = '1 / -1';
            
            // 모듈 렌더링
            await module.default.render(tempContainer);
            this.currentTabModule = module.default;
            
            // 그리드에 추가
            desktopGrid.appendChild(tempContainer);
        } else {
            desktopGrid.innerHTML = '<div class="error-message">탭을 로드할 수 없습니다.</div>';
        }
    }
    
    /**
     * PHASE 1: 데스크톱 레이아웃에서 탭 정리
     */
    async cleanupDesktopTab() {
        const desktopGrid = document.querySelector('.desktop-grid');
        if (desktopGrid) {
            // 기존 탭 모듈 정리
            if (this.currentTabModule && typeof this.currentTabModule.cleanup === 'function') {
                try {
                    await this.currentTabModule.cleanup();
                } catch (error) {
                    console.error('데스크톱 탭 정리 실패:', error);
                }
            }
            
            // 그리드 콘텐츠 정리
            desktopGrid.innerHTML = '';
        }
    }
    
    async cleanupCurrentTab() {
        // PHASE 1: 데스크톱 레이아웃에서 탭 정리
        if (this.desktopLayoutManager.isDesktopMode()) {
            await this.cleanupDesktopTab();
        }
        
        if (this.currentTab && this.tabModules.has(this.currentTab)) {
            const module = this.tabModules.get(this.currentTab);
            
            // 모듈에 cleanup 메서드가 있다면 호출
            if (module.default && typeof module.default.cleanup === 'function') {
                try {
                    await module.default.cleanup();
                } catch (error) {
                    console.error(`탭 정리 실패: ${this.currentTab}`, error);
                }
            }
        }
    }
    
    updateTabUI(activeTabName) {
        // 기존 모바일 탭 버튼 업데이트
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === activeTabName);
        });
        
        // PHASE 1: 데스크톱 사이드바 네비게이션 업데이트
        if (this.desktopLayoutManager.isDesktopMode()) {
            this.desktopLayoutManager.updateDesktopSidebar(activeTabName);
        }
    }
    
    showLoading() {
        this.tabContent.innerHTML = `
            <div class="tab-loading">
                <div class="loading-spinner"></div>
                <span>탭을 로딩 중...</span>
            </div>
        `;
    }
    
    showError(tabName, error) {
        this.tabContent.innerHTML = `
            <div class="tab-placeholder">
                <div class="tab-placeholder-icon">⚠️</div>
                <div class="tab-placeholder-title">오류 발생</div>
                <div class="tab-placeholder-description">
                    ${tabName} 탭을 로드하는 중 오류가 발생했습니다.<br>
                    잠시 후 다시 시도해주세요.
                </div>
            </div>
        `;
    }
    
    showPlaceholder() {
        this.tabContent.innerHTML = `
            <div class="tab-placeholder">
                <div class="tab-placeholder-icon">📱</div>
                <div class="tab-placeholder-title">준비 중</div>
                <div class="tab-placeholder-description">
                    이 탭의 기능은 현재 개발 중입니다.<br>
                    곧 새로운 기능을 만나보실 수 있습니다.
                </div>
            </div>
        `;
    }
    
    /**
     * 스크롤을 맨 위로 즉시 이동시킵니다
     * 탭 전환 시 사용자 경험을 개선하기 위해 구현
     */
    scrollToTop() {
        // DOM이 완전히 렌더링될 때까지 대기
        requestAnimationFrame(() => {
            // 윈도우 스크롤을 맨 위로 이동
            window.scrollTo({ 
                top: 0, 
                left: 0, 
                behavior: 'instant' 
            });
            
            // 탭 콘텐츠 컨테이너도 스크롤 초기화
            if (this.tabContent) {
                this.tabContent.scrollTop = 0;
                this.tabContent.scrollLeft = 0;
            }
        });
    }
    
    // 로그아웃 기능
    async logout() {
        try {
            if (this.authManager) {
                await this.authManager.logout();
            }
            
            this.isLoggedIn = false;
            this.currentTab = null;
            this.tabModules.clear();
            this.showLoginScreen();
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    }
}

// 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 테마 매니저 초기화 (앱 시작 전)
    console.log('테마 매니저 초기화 중...');
    console.log('현재 테마:', themeManager.getCurrentTheme());
    console.log('테마 정보:', themeManager.getThemeInfo());
    
    // 전역에서 테마 매니저 접근 가능하도록 설정
    window.themeManager = themeManager;
    
    // Phase 1: 개발자 도구용 전역 함수들 추가
    window.TravelLogDev = {
        // 기능 상태 확인
        checkFeatureStatus: async (featureName) => {
            const { FeatureManager } = await import('./config/app-config.js');
            return FeatureManager.getFeatureStatus(featureName);
        },
        
        // 모든 기능 상태 확인
        getAllFeatureStatus: async () => {
            const { FeatureManager } = await import('./config/app-config.js');
            return FeatureManager.generateFeatureReport();
        },
        
        // 의존성 검증
        validateDependencies: async () => {
            const { QuickValidator } = await import('./modules/utils/dependency-validator.js');
            return QuickValidator.validateTravelReport();
        },
        
        // 기능 활성화/비활성화
        toggleFeature: async (featureName, status) => {
            const { FeatureManager } = await import('./config/app-config.js');
            FeatureManager.updateFeatureStatus(featureName, status);
            console.log(`기능 ${featureName}이 ${status}로 변경되었습니다.`);
        }
    };
    
    console.log('🛠️ TravelLog 개발자 도구가 로드되었습니다.');
    console.log('사용법: TravelLogDev.checkFeatureStatus("travelDNA")');
    console.log('사용법: TravelLogDev.validateDependencies()');
    
    // 개발 검증기 초기화 (개발 모드에서만)
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.search.includes('dev=true')) {
        const devValidator = new DevelopmentValidator();
        window.devValidator = devValidator;
        console.log('🔍 CSS-DOM 실시간 검증기가 활성화되었습니다.');
    }
    
    // 앱 매니저 초기화
    const appManager = new AppManager();
    
    // 전역으로 설정 (AuthManager에서 참조)
    window.appManager = appManager;
    
    // PHASE 1: 전역 TabManager 설정 (데스크톱 레이아웃에서 탭 전환 지원)
    window.TabManager = {
        switchTab: (tabName) => {
            if (appManager && typeof appManager.switchTab === 'function') {
                appManager.switchTab(tabName);
            }
        }
    };
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    // 모든 탭 모듈 정리
    // 실제 구현에서는 각 모듈의 cleanup 메서드 호출
});
