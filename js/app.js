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
import { memoryMonitor } from './modules/utils/memory-monitor.js'; // 메모리 누수 방지 모니터링 시스템
import { cleanupVerifier } from './modules/utils/cleanup-verifier.js'; // Cleanup 검증 시스템

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
        
        // 메모리 누수 방지 시스템 초기화
        this.setupMemoryLeakPrevention();
        
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
    
    /**
     * 메모리 누수 방지 시스템 설정
     */
    setupMemoryLeakPrevention() {
        try {
            // 메모리 모니터링 활성화
            if (typeof memoryMonitor !== 'undefined' && memoryMonitor) {
                console.log('AppManager: 메모리 모니터링 시스템 활성화됨');
                
                // 메모리 누수 이벤트 리스너
                window.addEventListener('memoryLeak', (event) => {
                    console.error('AppManager: 메모리 누수 감지됨', event.detail);
                    this.handleMemoryLeak(event.detail);
                });
                
                // 메모리 경고 이벤트 리스너
                window.addEventListener('memoryWarning', (event) => {
                    console.warn('AppManager: 메모리 경고', event.detail);
                    this.handleMemoryWarning(event.detail);
                });
            } else {
                console.warn('AppManager: 메모리 모니터링 시스템을 사용할 수 없습니다.');
            }
            
            // Cleanup 검증 시스템 활성화
            if (typeof cleanupVerifier !== 'undefined' && cleanupVerifier) {
                console.log('AppManager: Cleanup 검증 시스템 활성화됨');
                
                // Cleanup 이벤트 리스너
                window.addEventListener('cleanupVerifier:issues', (event) => {
                    console.warn('AppManager: Cleanup 이슈 발견', event.detail);
                });
                
                window.addEventListener('cleanupVerifier:timeout', (event) => {
                    console.error('AppManager: Cleanup 타임아웃', event.detail);
                });
            } else {
                console.warn('AppManager: Cleanup 검증 시스템을 사용할 수 없습니다.');
            }
            
            // 개발자 도구에 메모리 모니터링 추가 (안전한 방식)
            if (this.devTools && typeof memoryMonitor !== 'undefined' && memoryMonitor) {
                try {
                    // 메서드 존재 여부 확인 후 호출
                    if (typeof this.devTools.addMemoryMonitor === 'function') {
                        this.devTools.addMemoryMonitor(memoryMonitor);
                        console.log('AppManager: 개발자 도구에 메모리 모니터 추가됨');
                    } else {
                        console.log('AppManager: 개발자 도구에 메모리 모니터 기능이 없습니다.');
                    }
                } catch (error) {
                    console.warn('AppManager: 개발자 도구에 메모리 모니터 추가 실패:', error);
                }
            }
            
            console.log('AppManager: 메모리 누수 방지 시스템 설정 완료');
            
        } catch (error) {
            console.error('AppManager: 메모리 누수 방지 시스템 설정 실패:', error);
            // 시스템 설정 실패해도 앱은 정상 동작해야 함
        }
    }
    
    /**
     * 메모리 누수 처리
     * @param {Object} leakInfo - 누수 정보
     */
    handleMemoryLeak(leakInfo) {
        try {
            console.error('AppManager: 메모리 누수 감지됨', leakInfo);
            
            // 강제 정리 수행
            this.performEmergencyCleanup();
            
            // 사용자에게 알림 (필요시)
            this.notifyMemoryIssue('memory_leak', leakInfo);
        } catch (error) {
            console.error('AppManager: 메모리 누수 처리 중 오류:', error);
        }
    }
    
    /**
     * 메모리 경고 처리
     * @param {Object} warningInfo - 경고 정보
     */
    handleMemoryWarning(warningInfo) {
        try {
            console.warn('AppManager: 메모리 경고', warningInfo);
            
            // 예방적 정리 수행
            this.performPreventiveCleanup();
            
            // 사용자에게 알림 (필요시)
            this.notifyMemoryIssue('memory_warning', warningInfo);
        } catch (error) {
            console.error('AppManager: 메모리 경고 처리 중 오류:', error);
        }
    }
    
    /**
     * 응급 정리 수행
     */
    performEmergencyCleanup() {
        try {
            console.log('AppManager: 응급 정리 수행 중...');
            
            // 모든 모듈 강제 정리
            this.cleanup();
            
            // 가비지 컬렉션 힌트
            if (typeof window.gc === 'function') {
                window.gc();
            }
            
            // 메모리 스냅샷 기록
            if (typeof memoryMonitor !== 'undefined' && memoryMonitor) {
                memoryMonitor.recordMemorySnapshot();
            }
            
            console.log('AppManager: 응급 정리 완료');
            
        } catch (error) {
            console.error('AppManager: 응급 정리 실패:', error);
        }
    }
    
    /**
     * 예방적 정리 수행
     */
    performPreventiveCleanup() {
        try {
            console.log('AppManager: 예방적 정리 수행 중...');
            
            // 현재 탭만 정리
            if (this.tabManager && typeof this.tabManager.cleanupCurrentTab === 'function') {
                this.tabManager.cleanupCurrentTab();
            }
            
            // 메모리 스냅샷 기록
            if (typeof memoryMonitor !== 'undefined' && memoryMonitor) {
                memoryMonitor.recordMemorySnapshot();
            }
            
            console.log('AppManager: 예방적 정리 완료');
            
        } catch (error) {
            console.error('AppManager: 예방적 정리 실패:', error);
        }
    }
    
    /**
     * 메모리 이슈 알림
     * @param {string} type - 이슈 타입
     * @param {Object} info - 이슈 정보
     */
    notifyMemoryIssue(type, info) {
        try {
            // 개발 모드에서만 콘솔에 상세 정보 출력
            if (AppInfo.isDevelopment) {
                console.group(`🚨 메모리 이슈: ${type}`);
                console.log('상세 정보:', info);
                
                // 안전한 메모리 상태 확인
                if (typeof memoryMonitor !== 'undefined' && memoryMonitor) {
                    console.log('현재 메모리 상태:', memoryMonitor.getMemoryInfo());
                } else {
                    console.log('현재 메모리 상태: N/A');
                }
                
                // 안전한 TabManager 통계 확인
                if (this.tabManager && typeof this.tabManager.getStats === 'function') {
                    console.log('TabManager 통계:', this.tabManager.getStats());
                } else {
                    console.log('TabManager 통계: N/A');
                }
                
                console.groupEnd();
            }
            
            // 필요시 사용자에게 토스트 메시지 표시
            // toastManager.show('메모리 사용량이 높습니다. 페이지를 새로고침해주세요.', 'warning');
        } catch (error) {
            console.error('AppManager: 메모리 이슈 알림 중 오류:', error);
        }
    }
    
    /**
     * 앱 매니저 정리 (강화된 버전)
     */
    async cleanup() {
        const cleanupId = (typeof cleanupVerifier !== 'undefined' && cleanupVerifier) ? 
            cleanupVerifier.startCleanup('AppManager', { 
                appManager: true, 
                timestamp: Date.now() 
            }) : null;
        
        try {
            // 탭 매니저 정리
            if (this.tabManager && typeof this.tabManager.cleanup === 'function') {
                await this.tabManager.cleanup();
            }
            
            // 네비게이션 모니터 정리
            if (this.navigationMonitor && typeof this.navigationMonitor.cleanup === 'function') {
                this.navigationMonitor.cleanup();
            }
            
            // 데스크톱 레이아웃 컨트롤러 정리
            if (this.desktopLayoutController && typeof this.desktopLayoutController.cleanup === 'function') {
                this.desktopLayoutController.cleanup();
            }
            
            // 데스크톱 레이아웃 매니저 정리
            if (this.desktopLayoutManager && typeof this.desktopLayoutManager.cleanup === 'function') {
                this.desktopLayoutManager.cleanup();
            }
            
            // 개발자 도구 정리
            if (this.devTools && typeof this.devTools.cleanup === 'function') {
                this.devTools.cleanup();
            }
            
            // 인증 관리자 정리
            if (this.authManager && typeof this.authManager.cleanup === 'function') {
                this.authManager.cleanup();
            }
            
            // 여행 로그 서비스 정리
            if (typeof travelLogService !== 'undefined' && travelLogService && typeof travelLogService.cleanup === 'function') {
                travelLogService.cleanup();
            }
            
            // 메모리 모니터링 시스템 정리
            if (typeof memoryMonitor !== 'undefined' && memoryMonitor && typeof memoryMonitor.cleanup === 'function') {
                memoryMonitor.cleanup();
            }
            
            // Cleanup 검증 시스템 정리
            if (typeof cleanupVerifier !== 'undefined' && cleanupVerifier && typeof cleanupVerifier.cleanup === 'function') {
                cleanupVerifier.cleanup();
            }
            
            // 정리 완료 추적
            if (cleanupId && typeof cleanupVerifier !== 'undefined' && cleanupVerifier) {
                cleanupVerifier.finishCleanup(cleanupId, { success: true });
            }
            
            console.log('AppManager cleaned up with memory leak prevention');
            
        } catch (error) {
            // 정리 실패 추적
            if (cleanupId && typeof cleanupVerifier !== 'undefined' && cleanupVerifier) {
                cleanupVerifier.failCleanup(cleanupId, error);
            }
            
            console.error('AppManager cleanup failed:', error);
            // 정리 실패해도 앱은 계속 동작해야 함
        }
    }
}


// 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 앱 매니저 초기화
    const appManager = new AppManager();
    
    // 전역 변수로 설정 (페이지 언로드 시 정리를 위해)
    window.appManager = appManager;
    
    // PHASE 4: 개발자 도구에서 전역 설정 처리
    appManager.devTools.setupAppManager(appManager);
    appManager.devTools.setupTabManager(appManager);
});

// 페이지 언로드 시 정리 (강화된 버전)
window.addEventListener('beforeunload', async () => {
    try {
        console.log('페이지 언로드: 메모리 누수 방지 정리 시작');
        
        // 앱 매니저 정리
        if (window.appManager && typeof window.appManager.cleanup === 'function') {
            await window.appManager.cleanup();
        }
        
        // 메모리 모니터링 최종 스냅샷
        if (typeof memoryMonitor !== 'undefined' && memoryMonitor && typeof memoryMonitor.recordMemorySnapshot === 'function') {
            memoryMonitor.recordMemorySnapshot();
        }
        
        console.log('페이지 언로드: 메모리 누수 방지 정리 완료');
        
    } catch (error) {
        console.error('페이지 언로드 정리 중 오류:', error);
    }
});