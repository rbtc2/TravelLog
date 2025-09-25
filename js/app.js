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
import { mobileOptimizer } from './modules/optimization/mobile-optimizer.js'; // Phase 1: 모바일 최적화 모듈
import { TabManager } from './modules/core/tab-manager.js'; // Phase 2: 탭 관리 모듈

// Phase 1: 모바일 최적화는 별도 모듈로 분리됨
// Phase 2: 탭 관리는 별도 모듈로 분리됨
// mobileOptimizer는 자동으로 초기화됩니다.

class AppManager {
    constructor() {
        this.isLoggedIn = false;
        this.isHandlingLoginSuccess = false;
        this.authManager = null;
        
        // Page Visibility API 관련 상태
        this.lastVisibleState = null;
        this.navigationCheckInterval = null;
        
        // PHASE 1: 데스크톱 레이아웃 매니저 초기화
        this.desktopLayoutManager = new DesktopLayoutManager();
        
        // PHASE 2: 탭 매니저 초기화
        this.tabManager = new TabManager(this);
        
            // Z-Index 충돌 관리 시스템 초기화
            this.zIndexManager = window.zIndexManager;
            
            
            // Stacking Context 디버깅 도구 초기화
            this.stackingContextDebugger = window.stackingContextDebugger;
        
        // DOM 요소들
        this.loginScreen = document.getElementById('login-screen');
        this.mainApp = document.getElementById('main-app');
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        this.updateAppInfo();
        
        // Page Visibility API 설정 - 네비게이션 탭 사라짐 문제 해결
        this.setupPageVisibilityHandling();
        
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
     * Page Visibility API 설정 - 네비게이션 탭 사라짐 문제 해결
     */
    setupPageVisibilityHandling() {
        // 페이지 가시성 변경 감지
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 페이지가 백그라운드로 이동
                console.log('페이지가 백그라운드로 이동');
                this.handlePageHidden();
            } else {
                // 페이지가 포그라운드로 복귀
                console.log('페이지가 포그라운드로 복귀');
                this.handlePageVisible();
            }
        });
        
        // 윈도우 포커스 이벤트도 처리
        window.addEventListener('focus', () => {
            console.log('윈도우 포커스 복귀');
            this.handlePageVisible();
        });
        
        window.addEventListener('blur', () => {
            console.log('윈도우 포커스 잃음');
            this.handlePageHidden();
        });
        
        // 네비게이션 상태 주기적 확인 (안전장치)
        this.startNavigationMonitoring();
    }
    
    /**
     * 네비게이션 상태 주기적 모니터링 시작
     */
    startNavigationMonitoring() {
        // 기존 인터벌 정리
        if (this.navigationCheckInterval) {
            clearInterval(this.navigationCheckInterval);
        }
        
        // 5초마다 네비게이션 상태 확인
        this.navigationCheckInterval = setInterval(() => {
            this.checkNavigationState();
        }, 5000);
    }
    
    /**
     * 네비게이션 상태 확인 및 복원
     */
    checkNavigationState() {
        // 로그인 상태가 아니면 확인하지 않음
        if (!this.isLoggedIn) {
            return;
        }
        
        const tabNavigation = document.getElementById('tab-navigation');
        const mainApp = document.getElementById('main-app');
        
        if (!tabNavigation || !mainApp) {
            return;
        }
        
        // 메인 앱이 숨겨져 있거나 네비게이션이 숨겨져 있는 경우 복원
        if (mainApp.classList.contains('hidden') || 
            tabNavigation.style.display === 'none' ||
            tabNavigation.style.visibility === 'hidden') {
            
            console.log('네비게이션 상태 이상 감지, 복원 시도');
            this.restoreNavigationState();
        }
    }
    
    /**
     * 페이지가 숨겨질 때 처리
     */
    handlePageHidden() {
        // 현재 상태 저장
        this.lastVisibleState = {
            isLoggedIn: this.isLoggedIn,
            currentTab: this.tabManager.getCurrentTab(),
            isDesktopMode: this.desktopLayoutManager ? this.desktopLayoutManager.isDesktopMode() : false
        };
    }
    
    /**
     * 페이지가 다시 보일 때 처리 - 네비게이션 탭 복원
     */
    handlePageVisible() {
        // 로그인 상태 확인
        if (!this.isLoggedIn) {
            return;
        }
        
        // 네비게이션 탭 상태 복원
        this.restoreNavigationState();
        
        // 현재 탭이 있다면 새로고침
        if (this.tabManager.getCurrentTab()) {
            this.tabManager.refreshCurrentTab();
        }
    }
    
    /**
     * 네비게이션 상태 복원
     */
    restoreNavigationState() {
        try {
            const tabNavigation = document.getElementById('tab-navigation');
            const mainApp = document.getElementById('main-app');
            
            if (!tabNavigation || !mainApp) {
                console.warn('네비게이션 요소를 찾을 수 없습니다.');
                return;
            }
            
            // 메인 앱이 숨겨져 있다면 표시
            if (mainApp.classList.contains('hidden')) {
                mainApp.classList.remove('hidden');
            }
            
            // 네비게이션 탭이 숨겨져 있다면 표시
            if (tabNavigation.style.display === 'none') {
                tabNavigation.style.display = 'flex';
            }
            
            // 데스크톱 모드가 아닌 경우에만 모바일 네비게이션 표시
            if (this.desktopLayoutManager && !this.desktopLayoutManager.isDesktopMode()) {
                tabNavigation.style.display = 'flex';
            }
            
            console.log('네비게이션 상태가 복원되었습니다.');
        } catch (error) {
            console.error('네비게이션 상태 복원 실패:', error);
        }
    }
    
    // refreshCurrentTab 메서드는 TabManager로 이동됨
    
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
        // 탭 이벤트 바인딩은 TabManager에서 처리됨
        // TabManager는 생성자에서 자동으로 이벤트를 바인딩합니다
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
        this.tabManager.loadTab('home'); // 기본 탭 로드

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
        
        // 탭 매니저 정리
        this.tabManager.cleanup();
        
        // 네비게이션 모니터링 정리
        this.stopNavigationMonitoring();
    }
    
    /**
     * 네비게이션 모니터링 중지
     */
    stopNavigationMonitoring() {
        if (this.navigationCheckInterval) {
            clearInterval(this.navigationCheckInterval);
            this.navigationCheckInterval = null;
        }
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
    
    // switchTab 메서드는 TabManager로 이동됨
    
    // loadTab 메서드는 TabManager로 이동됨
    
    // loadTabModule 메서드는 TabManager로 이동됨
    
    // renderTabContent 메서드는 TabManager로 이동됨
    
    // renderDesktopTabContent 메서드는 TabManager로 이동됨
    
    // cleanupDesktopTab 메서드는 TabManager로 이동됨
    
    // cleanupCurrentTab 메서드는 TabManager로 이동됨
    
    // updateTabUI 메서드는 TabManager로 이동됨
    
    // showLoading 메서드는 TabManager로 이동됨
    
    // showError 메서드는 TabManager로 이동됨
    
    // showPlaceholder 메서드는 TabManager로 이동됨
    
    // scrollToTop 메서드는 TabManager로 이동됨
    
    // 로그아웃 기능
    async logout() {
        try {
            if (this.authManager) {
                await this.authManager.logout();
            }
            
            this.isLoggedIn = false;
            this.tabManager.cleanup();
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
    
    // PHASE 2: 전역 TabManager 설정 (데스크톱 레이아웃에서 탭 전환 지원)
    window.TabManager = {
        switchTab: (tabName) => {
            if (appManager && appManager.tabManager) {
                appManager.tabManager.switchTab(tabName);
            }
        }
    };
    
    // 디버깅용 전역 함수들
    window.testGoogleLogin = () => {
        console.log('Google 로그인 테스트 시작');
        const googleBtn = document.getElementById('google-login-btn');
        if (googleBtn) {
            console.log('Google 버튼 찾음, 클릭 시뮬레이션');
            googleBtn.click();
        } else {
            console.error('Google 로그인 버튼을 찾을 수 없습니다');
        }
    };
    
    window.testToast = (message = '테스트 토스트 메시지') => {
        console.log('토스트 테스트 시작');
        if (window.toastManager) {
            window.toastManager.show(message, 'info');
        } else {
            console.error('toastManager를 찾을 수 없습니다');
        }
    };
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    // 모든 탭 모듈 정리
    // 실제 구현에서는 각 모듈의 cleanup 메서드 호출
});