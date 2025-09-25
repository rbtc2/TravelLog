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
// StackingContextDebugger와 DevelopmentValidator는 DevTools에서 관리됨
import { mobileOptimizer } from './modules/optimization/mobile-optimizer.js'; // Phase 1: 모바일 최적화 모듈
import { TabManager } from './modules/core/tab-manager.js'; // Phase 2: 탭 관리 모듈
import { NavigationMonitor } from './modules/core/navigation-monitor.js'; // Phase 3: 네비게이션 모니터링 모듈
import { DevTools } from './modules/dev/dev-tools.js'; // Phase 4: 개발자 도구 모듈
import { DesktopLayoutController } from './modules/core/desktop-layout-controller.js'; // Phase 5: 데스크톱 레이아웃 컨트롤러

// Phase 1: 모바일 최적화는 별도 모듈로 분리됨
// Phase 2: 탭 관리는 별도 모듈로 분리됨
// Phase 3: 네비게이션 모니터링은 별도 모듈로 분리됨
// Phase 4: 개발자 도구는 별도 모듈로 분리됨
// Phase 5: 데스크톱 레이아웃 컨트롤러는 별도 모듈로 분리됨
// mobileOptimizer는 자동으로 초기화됩니다.

class AppManager {
    constructor() {
        this.isLoggedIn = false;
        this.isHandlingLoginSuccess = false;
        this.authManager = null;
        
        // Page Visibility API 관련 상태는 NavigationMonitor로 이동됨
        
        // PHASE 1: 데스크톱 레이아웃 매니저 초기화
        this.desktopLayoutManager = new DesktopLayoutManager();
        
        // PHASE 2: 탭 매니저 초기화
        this.tabManager = new TabManager(this);
        
        // PHASE 3: 네비게이션 모니터 초기화
        this.navigationMonitor = new NavigationMonitor(this);
        
        // PHASE 4: 개발자 도구 초기화
        this.devTools = new DevTools();
        
        // PHASE 5: 데스크톱 레이아웃 컨트롤러 초기화
        this.desktopLayoutController = new DesktopLayoutController(this.desktopLayoutManager);
        
            // Z-Index 충돌 관리 시스템 초기화
            this.zIndexManager = window.zIndexManager;
            
            // Stacking Context 디버깅 도구는 DevTools에서 관리됨
        
        // DOM 요소들
        this.loginScreen = document.getElementById('login-screen');
        this.mainApp = document.getElementById('main-app');
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        this.updateAppInfo();
        
        // Page Visibility API 설정은 NavigationMonitor에서 자동으로 처리됨
        
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
        } catch (error) {
            console.warn('데스크톱 레이아웃 매니저 초기화 실패:', error);
        }
        
        // PHASE 5: 데스크톱 레이아웃 컨트롤러는 자동으로 초기화됨
    }
    
    // addDesktopLayoutToggle 메서드는 DesktopLayoutController로 이동됨
    
    // toggleDesktopLayout 메서드는 DesktopLayoutController로 이동됨
    
    // updateDesktopToggleButton 메서드는 DesktopLayoutController로 이동됨
    
    // initializeDesktopLayoutAfterLogin 메서드는 DesktopLayoutController로 이동됨
    
    // setupPageVisibilityHandling 메서드는 NavigationMonitor로 이동됨
    
    // startNavigationMonitoring 메서드는 NavigationMonitor로 이동됨
    
    // checkNavigationState 메서드는 NavigationMonitor로 이동됨
    
    // handlePageHidden 메서드는 NavigationMonitor로 이동됨
    
    // handlePageVisible 메서드는 NavigationMonitor로 이동됨
    
    // restoreNavigationState 메서드는 NavigationMonitor로 이동됨
    
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
        
        // PHASE 5: 로그인 성공 후 데스크톱 레이아웃 재초기화
        this.desktopLayoutController.initializeAfterLogin();
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
        this.navigationMonitor.cleanup();
    }
    
    // stopNavigationMonitoring 메서드는 NavigationMonitor로 이동됨
    
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
    // 앱 매니저 초기화
    const appManager = new AppManager();
    
    // PHASE 4: 개발자 도구에서 전역 설정 처리
    appManager.devTools.setupAppManager(appManager);
    appManager.devTools.setupTabManager(appManager);
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    // 모든 탭 모듈 정리
    // 실제 구현에서는 각 모듈의 cleanup 메서드 호출
});