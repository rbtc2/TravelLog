/**
 * 개발자 도구 모듈
 * 개발 및 디버깅을 위한 전역 함수들과 도구들을 제공
 * 
 * @version 1.0.0
 * @since 2024-12-29
 * @author REDIPX
 */

import DevelopmentValidator from '../utils/development-validator.js';

export class DevTools {
    constructor() {
        this.isInitialized = false;
        this.devValidator = null;
        this.globalFunctions = new Map();
        
        this.init();
    }
    
    /**
     * 개발자 도구 초기화
     */
    init() {
        if (this.isInitialized) {
            console.warn('DevTools is already initialized');
            return;
        }
        
        try {
            this.setupGlobalFunctions();
            this.setupDevelopmentValidator();
            this.setupDebuggingFunctions();
            this.setupGlobalManagers();
            
            this.isInitialized = true;
            console.log('🛠️ TravelLog 개발자 도구가 로드되었습니다.');
            this.showUsageInstructions();
        } catch (error) {
            console.error('DevTools initialization failed:', error);
        }
    }
    
    /**
     * 전역 함수들 설정
     */
    setupGlobalFunctions() {
        // TravelLogDev 전역 객체 설정
        window.TravelLogDev = {
            // 기능 상태 확인
            checkFeatureStatus: async (featureName) => {
                const { FeatureManager } = await import('../../config/app-config.js');
                return FeatureManager.getFeatureStatus(featureName);
            },
            
            // 모든 기능 상태 확인
            getAllFeatureStatus: async () => {
                const { FeatureManager } = await import('../../config/app-config.js');
                return FeatureManager.generateFeatureReport();
            },
            
            // 의존성 검증
            validateDependencies: async () => {
                const { QuickValidator } = await import('../utils/dependency-validator.js');
                return QuickValidator.validateTravelReport();
            },
            
            // 기능 활성화/비활성화
            toggleFeature: async (featureName, status) => {
                const { FeatureManager } = await import('../../config/app-config.js');
                FeatureManager.updateFeatureStatus(featureName, status);
                console.log(`기능 ${featureName}이 ${status}로 변경되었습니다.`);
            },
            
            // 개발자 도구 정보
            getInfo: () => {
                return {
                    version: '1.0.0',
                    features: [
                        'checkFeatureStatus',
                        'getAllFeatureStatus', 
                        'validateDependencies',
                        'toggleFeature',
                        'getInfo'
                    ],
                    usage: {
                        checkFeature: 'TravelLogDev.checkFeatureStatus("travelDNA")',
                        validate: 'TravelLogDev.validateDependencies()',
                        toggle: 'TravelLogDev.toggleFeature("featureName", true)'
                    }
                };
            }
        };
        
        // 전역 함수 등록
        this.globalFunctions.set('TravelLogDev', window.TravelLogDev);
    }
    
    /**
     * 개발 검증기 설정
     */
    setupDevelopmentValidator() {
        // 개발 모드에서만 활성화
        if (this.isDevelopmentMode()) {
            try {
                this.devValidator = new DevelopmentValidator();
                window.devValidator = this.devValidator;
                console.log('🔍 CSS-DOM 실시간 검증기가 활성화되었습니다.');
            } catch (error) {
                console.error('개발 검증기 초기화 실패:', error);
            }
        }
    }
    
    /**
     * 디버깅 함수들 설정
     */
    setupDebuggingFunctions() {
        // Google 로그인 테스트
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
        
        // 토스트 테스트
        window.testToast = (message = '테스트 토스트 메시지') => {
            console.log('토스트 테스트 시작');
            if (window.toastManager) {
                window.toastManager.show(message, 'info');
            } else {
                console.error('toastManager를 찾을 수 없습니다');
            }
        };
        
        // 앱 상태 확인
        window.checkAppStatus = () => {
            const status = {
                isLoggedIn: window.appManager ? window.appManager.isLoggedIn : false,
                currentTab: window.appManager && window.appManager.tabManager ? 
                    window.appManager.tabManager.getCurrentTab() : null,
                theme: window.themeManager ? window.themeManager.getCurrentTheme() : 'unknown',
                isDesktopMode: window.appManager && window.appManager.desktopLayoutManager ? 
                    window.appManager.desktopLayoutManager.isDesktopMode() : false,
                devValidator: window.devValidator ? 'active' : 'inactive'
            };
            console.log('앱 상태:', status);
            return status;
        };
        
        // 전역 함수 등록
        this.globalFunctions.set('testGoogleLogin', window.testGoogleLogin);
        this.globalFunctions.set('testToast', window.testToast);
        this.globalFunctions.set('checkAppStatus', window.checkAppStatus);
    }
    
    /**
     * 전역 매니저들 설정
     */
    setupGlobalManagers() {
        // 테마 매니저 전역 설정
        if (window.themeManager) {
            console.log('테마 매니저 초기화 중...');
            console.log('현재 테마:', window.themeManager.getCurrentTheme());
            console.log('테마 정보:', window.themeManager.getThemeInfo());
        }
    }
    
    /**
     * 개발 모드 확인
     * @returns {boolean} 개발 모드인지 여부
     */
    isDevelopmentMode() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.search.includes('dev=true');
    }
    
    /**
     * 사용법 안내 표시
     */
    showUsageInstructions() {
        console.log('사용법: TravelLogDev.checkFeatureStatus("travelDNA")');
        console.log('사용법: TravelLogDev.validateDependencies()');
        console.log('사용법: TravelLogDev.toggleFeature("featureName", true)');
        console.log('사용법: checkAppStatus() - 앱 상태 확인');
        console.log('사용법: testGoogleLogin() - Google 로그인 테스트');
        console.log('사용법: testToast("메시지") - 토스트 테스트');
    }
    
    /**
     * 전역 TabManager 설정
     * @param {Object} appManager - 앱 매니저 인스턴스
     */
    setupTabManager(appManager) {
        window.TabManager = {
            switchTab: (tabName) => {
                if (appManager && appManager.tabManager) {
                    appManager.tabManager.switchTab(tabName);
                }
            }
        };
    }
    
    /**
     * 전역 AppManager 설정
     * @param {Object} appManager - 앱 매니저 인스턴스
     */
    setupAppManager(appManager) {
        window.appManager = appManager;
    }
    
    /**
     * 전역 함수 추가
     * @param {string} name - 함수 이름
     * @param {Function} func - 함수
     */
    addGlobalFunction(name, func) {
        window[name] = func;
        this.globalFunctions.set(name, func);
    }
    
    /**
     * 전역 함수 제거
     * @param {string} name - 함수 이름
     */
    removeGlobalFunction(name) {
        if (window[name]) {
            delete window[name];
            this.globalFunctions.delete(name);
        }
    }
    
    /**
     * 등록된 전역 함수 목록 반환
     * @returns {Array} 전역 함수 이름 목록
     */
    getGlobalFunctions() {
        return Array.from(this.globalFunctions.keys());
    }
    
    /**
     * 개발자 도구 정리
     */
    cleanup() {
        // 전역 함수들 제거
        this.globalFunctions.forEach((func, name) => {
            if (window[name]) {
                delete window[name];
            }
        });
        this.globalFunctions.clear();
        
        // 개발 검증기 정리
        if (this.devValidator && typeof this.devValidator.cleanup === 'function') {
            this.devValidator.cleanup();
        }
        this.devValidator = null;
        
        // 상태 초기화
        this.isInitialized = false;
        
        console.log('DevTools cleaned up');
    }
    
    /**
     * 개발자 도구 상태 확인
     * @returns {Object} 개발자 도구 상태
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isDevelopmentMode: this.isDevelopmentMode(),
            globalFunctionsCount: this.globalFunctions.size,
            devValidatorActive: this.devValidator !== null,
            globalFunctions: this.getGlobalFunctions()
        };
    }
}
