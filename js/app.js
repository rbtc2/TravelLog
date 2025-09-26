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


class AppManager {
    constructor() {
        this.isLoggedIn = false;
        this.isHandlingLoginSuccess = false;
        this.authManager = null;
        
        this.desktopLayoutManager = new DesktopLayoutManager();
        this.tabManager = new TabManager(this);
        this.navigationMonitor = new NavigationMonitor(this);
        this.devTools = new DevTools();
        this.desktopLayoutController = new DesktopLayoutController(this.desktopLayoutManager);
        
        this.setupMemoryLeakPrevention();
        this.zIndexManager = window.zIndexManager;
        
        // DOM 요소들
        this.loginScreen = document.getElementById('login-screen');
        this.mainApp = document.getElementById('main-app');
        
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
        
        try {
            await this.desktopLayoutManager.initialize();
        } catch (error) {
            console.warn('데스크톱 레이아웃 매니저 초기화 실패:', error);
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
        // TabManager에서 자동으로 이벤트 바인딩 처리
    }
    
    loginSuccess() {
        // 중복 호출 방지
        if (this.isHandlingLoginSuccess) {
            return;
        }
        this.isHandlingLoginSuccess = true;

        this.isLoggedIn = true;
        this.showMainApp();
        
        this.desktopLayoutController.initializeAfterLogin();
        this.tabManager.loadTab('home');

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
        
        this.tabManager.cleanup();
        this.navigationMonitor.cleanup();
    }
    
    showLoginScreen() {
        this.loginScreen.style.display = 'flex';
        this.mainApp.classList.add('hidden');
        
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
    
    /**
     * 로그아웃 기능
     */
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
        if (typeof memoryMonitor !== 'undefined' && memoryMonitor) {
            console.log('AppManager: 메모리 모니터링 시스템 활성화됨');
            
            window.addEventListener('memoryLeak', (event) => {
                console.error('AppManager: 메모리 누수 감지됨', event.detail);
                this.handleMemoryLeak(event.detail);
            });
            
            window.addEventListener('memoryWarning', (event) => {
                console.warn('AppManager: 메모리 경고', event.detail);
                this.handleMemoryWarning(event.detail);
            });
        } else {
            console.warn('AppManager: 메모리 모니터링 시스템을 사용할 수 없습니다.');
        }
        
        if (typeof cleanupVerifier !== 'undefined' && cleanupVerifier) {
            console.log('AppManager: Cleanup 검증 시스템 활성화됨');
            
            window.addEventListener('cleanupVerifier:issues', (event) => {
                console.warn('AppManager: Cleanup 이슈 발견', event.detail);
            });
            
            window.addEventListener('cleanupVerifier:timeout', (event) => {
                console.error('AppManager: Cleanup 타임아웃', event.detail);
            });
        } else {
            console.warn('AppManager: Cleanup 검증 시스템을 사용할 수 없습니다.');
        }
        
        if (this.devTools && typeof memoryMonitor !== 'undefined' && memoryMonitor) {
            try {
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
        }
    }
    
    /**
     * 메모리 누수 처리
     * @param {Object} leakInfo - 누수 정보
     */
    handleMemoryLeak(leakInfo) {
        try {
            console.error('AppManager: 메모리 누수 감지됨', leakInfo);
            
            this.performEmergencyCleanup();
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
            
            this.performPreventiveCleanup();
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
            
            this.cleanup();
            
            if (typeof window.gc === 'function') {
                window.gc();
            }
            
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
            
            if (this.tabManager && typeof this.tabManager.cleanupCurrentTab === 'function') {
                this.tabManager.cleanupCurrentTab();
            }
            
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
            if (AppInfo.isDevelopment) {
                console.group(`🚨 메모리 이슈: ${type}`);
                console.log('상세 정보:', info);
                
                if (typeof memoryMonitor !== 'undefined' && memoryMonitor) {
                    console.log('현재 메모리 상태:', memoryMonitor.getMemoryInfo());
                } else {
                    console.log('현재 메모리 상태: N/A');
                }
                
                if (this.tabManager && typeof this.tabManager.getStats === 'function') {
                    console.log('TabManager 통계:', this.tabManager.getStats());
                } else {
                    console.log('TabManager 통계: N/A');
                }
                
                console.groupEnd();
            }
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
            if (this.tabManager && typeof this.tabManager.cleanup === 'function') {
                await this.tabManager.cleanup();
            }
            
            if (this.navigationMonitor && typeof this.navigationMonitor.cleanup === 'function') {
                this.navigationMonitor.cleanup();
            }
            
            if (this.desktopLayoutController && typeof this.desktopLayoutController.cleanup === 'function') {
                this.desktopLayoutController.cleanup();
            }
            
            if (this.desktopLayoutManager && typeof this.desktopLayoutManager.cleanup === 'function') {
                this.desktopLayoutManager.cleanup();
            }
            
            if (this.devTools && typeof this.devTools.cleanup === 'function') {
                this.devTools.cleanup();
            }
            
            if (this.authManager && typeof this.authManager.cleanup === 'function') {
                this.authManager.cleanup();
            }
            
            if (typeof travelLogService !== 'undefined' && travelLogService && typeof travelLogService.cleanup === 'function') {
                travelLogService.cleanup();
            }
            
            if (typeof memoryMonitor !== 'undefined' && memoryMonitor && typeof memoryMonitor.cleanup === 'function') {
                memoryMonitor.cleanup();
            }
            
            if (typeof cleanupVerifier !== 'undefined' && cleanupVerifier && typeof cleanupVerifier.cleanup === 'function') {
                cleanupVerifier.cleanup();
            }
            
            if (cleanupId && typeof cleanupVerifier !== 'undefined' && cleanupVerifier) {
                cleanupVerifier.finishCleanup(cleanupId, { success: true });
            }
            
            console.log('AppManager cleaned up with memory leak prevention');
            
        } catch (error) {
            if (cleanupId && typeof cleanupVerifier !== 'undefined' && cleanupVerifier) {
                cleanupVerifier.failCleanup(cleanupId, error);
            }
            
            console.error('AppManager cleanup failed:', error);
        }
    }
}


// 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    const appManager = new AppManager();
    window.appManager = appManager;
    
    appManager.devTools.setupAppManager(appManager);
    appManager.devTools.setupTabManager(appManager);
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', async () => {
    try {
        console.log('페이지 언로드: 메모리 누수 방지 정리 시작');
        
        if (window.appManager && typeof window.appManager.cleanup === 'function') {
            await window.appManager.cleanup();
        }
        
        if (typeof memoryMonitor !== 'undefined' && memoryMonitor && typeof memoryMonitor.recordMemorySnapshot === 'function') {
            memoryMonitor.recordMemorySnapshot();
        }
        
        console.log('페이지 언로드: 메모리 누수 방지 정리 완료');
        
    } catch (error) {
        console.error('페이지 언로드 정리 중 오류:', error);
    }
});