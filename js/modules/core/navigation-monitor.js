/**
 * 네비게이션 모니터링 모듈
 * Page Visibility API와 네비게이션 상태 모니터링을 담당
 * 
 * @version 1.0.0
 * @since 2024-12-29
 * @author REDIPX
 */

export class NavigationMonitor {
    constructor(appManager) {
        this.appManager = appManager;
        this.isInitialized = false;
        
        // Page Visibility API 관련 상태
        this.lastVisibleState = null;
        this.navigationCheckInterval = null;
        
        // 이벤트 리스너 추적
        this.eventListeners = [];
        
        this.init();
    }
    
    /**
     * 네비게이션 모니터 초기화
     */
    init() {
        if (this.isInitialized) {
            console.warn('NavigationMonitor is already initialized');
            return;
        }
        
        try {
            this.setupPageVisibilityHandling();
            this.isInitialized = true;
            console.log('NavigationMonitor initialized successfully');
        } catch (error) {
            console.error('NavigationMonitor initialization failed:', error);
        }
    }
    
    /**
     * Page Visibility API 설정 - 네비게이션 탭 사라짐 문제 해결
     */
    setupPageVisibilityHandling() {
        // 페이지 가시성 변경 감지
        const visibilityChangeHandler = () => {
            if (document.hidden) {
                // 페이지가 백그라운드로 이동
                console.log('페이지가 백그라운드로 이동');
                this.handlePageHidden();
            } else {
                // 페이지가 포그라운드로 복귀
                console.log('페이지가 포그라운드로 복귀');
                this.handlePageVisible();
            }
        };
        
        // 윈도우 포커스 이벤트도 처리
        const focusHandler = () => {
            console.log('윈도우 포커스 복귀');
            this.handlePageVisible();
        };
        
        const blurHandler = () => {
            console.log('윈도우 포커스 잃음');
            this.handlePageHidden();
        };
        
        // 이벤트 리스너 등록
        this.addEventListener(document, 'visibilitychange', visibilityChangeHandler);
        this.addEventListener(window, 'focus', focusHandler);
        this.addEventListener(window, 'blur', blurHandler);
        
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
        if (!this.appManager.isLoggedIn) {
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
            isLoggedIn: this.appManager.isLoggedIn,
            currentTab: this.appManager.tabManager ? this.appManager.tabManager.getCurrentTab() : null,
            isDesktopMode: this.appManager.desktopLayoutManager ? this.appManager.desktopLayoutManager.isDesktopMode() : false
        };
    }
    
    /**
     * 페이지가 다시 보일 때 처리 - 네비게이션 탭 복원
     */
    handlePageVisible() {
        // 로그인 상태 확인
        if (!this.appManager.isLoggedIn) {
            return;
        }
        
        // 네비게이션 탭 상태 복원
        this.restoreNavigationState();
        
        // 현재 탭이 있다면 새로고침
        if (this.appManager.tabManager && this.appManager.tabManager.getCurrentTab()) {
            this.appManager.tabManager.refreshCurrentTab();
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
            if (this.appManager.desktopLayoutManager && !this.appManager.desktopLayoutManager.isDesktopMode()) {
                tabNavigation.style.display = 'flex';
            }
            
            console.log('네비게이션 상태가 복원되었습니다.');
        } catch (error) {
            console.error('네비게이션 상태 복원 실패:', error);
        }
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
    
    /**
     * 이벤트 리스너 추가 (메모리 관리용)
     * @param {HTMLElement} element - 이벤트를 바인딩할 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }
    
    /**
     * 네비게이션 모니터 정리
     */
    cleanup() {
        // 모든 이벤트 리스너 제거
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        
        // 네비게이션 모니터링 중지
        this.stopNavigationMonitoring();
        
        // 상태 초기화
        this.isInitialized = false;
        this.lastVisibleState = null;
        
        console.log('NavigationMonitor cleaned up');
    }
    
    /**
     * 현재 가시성 상태 반환
     * @returns {Object|null} 마지막 가시성 상태
     */
    getLastVisibleState() {
        return this.lastVisibleState;
    }
    
    /**
     * 모니터링 상태 확인
     * @returns {boolean} 모니터링 중인지 여부
     */
    isMonitoring() {
        return this.navigationCheckInterval !== null;
    }
}
