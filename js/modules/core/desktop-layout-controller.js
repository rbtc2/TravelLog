/**
 * 데스크톱 레이아웃 컨트롤러 모듈
 * 데스크톱 레이아웃 토글 버튼과 관련 기능을 관리
 * 
 * @version 1.0.0
 * @since 2024-12-29
 * @author REDIPX
 */

export class DesktopLayoutController {
    constructor(desktopLayoutManager) {
        this.desktopLayoutManager = desktopLayoutManager;
        this.isInitialized = false;
        this.eventListeners = [];
        
        this.init();
    }
    
    /**
     * 데스크톱 레이아웃 컨트롤러 초기화
     */
    init() {
        if (this.isInitialized) {
            console.warn('DesktopLayoutController is already initialized');
            return;
        }
        
        try {
            this.addDesktopLayoutToggle();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('DesktopLayoutController initialized successfully');
        } catch (error) {
            console.error('DesktopLayoutController initialization failed:', error);
        }
    }
    
    /**
     * 데스크톱 레이아웃 토글 버튼 추가
     */
    addDesktopLayoutToggle() {
        // 모바일 디바이스나 태블릿에서는 토글 버튼을 표시하지 않음
        if (this.isMobileDevice() || window.innerWidth < 1024) {
            // 기존 버튼이 있다면 제거
            const existingToggle = document.querySelector('.desktop-layout-toggle');
            if (existingToggle) {
                existingToggle.remove();
            }
            return;
        }
        
        // 기존 버튼 제거
        const existingToggle = document.querySelector('.desktop-layout-toggle');
        if (existingToggle) {
            existingToggle.remove();
        }
        
        // 토글 버튼 생성
        const toggleButton = document.createElement('button');
        toggleButton.className = 'desktop-layout-toggle';
        toggleButton.innerHTML = `
            <span class="toggle-icon">🖥️</span>
            <span class="toggle-text">데스크톱 모드</span>
        `;
        toggleButton.title = '데스크톱 레이아웃 토글';
        
        // 버튼 클릭 이벤트
        const clickHandler = async () => {
            await this.handleToggleClick();
        };
        
        toggleButton.addEventListener('click', clickHandler);
        this.eventListeners.push({ element: toggleButton, event: 'click', handler: clickHandler });
        
        // 버튼을 페이지에 추가
        document.body.appendChild(toggleButton);
        
        // 데스크톱 모드일 때 버튼 숨김
        this.updateDesktopToggleButton();
    }
    
    /**
     * 토글 버튼 클릭 처리
     */
    async handleToggleClick() {
        try {
            const isDesktopMode = this.desktopLayoutManager.isDesktopMode();
            
            if (isDesktopMode) {
                // 데스크톱 모드에서 모바일 모드로 전환
                await this.desktopLayoutManager.switchMode('mobile');
            } else {
                // 모바일 모드에서 데스크톱 모드로 전환
                await this.desktopLayoutManager.switchMode('desktop');
            }
            this.updateDesktopToggleButton();
        } catch (error) {
            console.error('데스크톱 레이아웃 토글 실패:', error);
        }
    }
    
    /**
     * 데스크톱 토글 버튼 업데이트
     */
    updateDesktopToggleButton() {
        const toggleButton = document.querySelector('.desktop-layout-toggle');
        if (!toggleButton) return;
        
        const isDesktopMode = this.desktopLayoutManager.isDesktopMode();
        const icon = toggleButton.querySelector('.toggle-icon');
        const text = toggleButton.querySelector('.toggle-text');
        
        if (isDesktopMode) {
            // 데스크톱 모드일 때 버튼 숨김
            toggleButton.style.display = 'none';
        } else {
            // 모바일 모드일 때 버튼 표시
            toggleButton.style.display = 'flex';
            if (icon) icon.textContent = '🖥️';
            if (text) text.textContent = '데스크톱 모드';
        }
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 레이아웃 모드 변경 이벤트 리스너 등록
        const layoutChangeHandler = (event) => {
            this.updateDesktopToggleButton();
        };
        
        window.addEventListener('layoutModeChanged', layoutChangeHandler);
        this.eventListeners.push({ element: window, event: 'layoutModeChanged', handler: layoutChangeHandler });
        
        // 화면 크기 변경 시 토글 버튼 관리
        const resizeHandler = () => {
            this.handleResize();
        };
        
        window.addEventListener('resize', resizeHandler);
        this.eventListeners.push({ element: window, event: 'resize', handler: resizeHandler });
    }
    
    /**
     * 화면 크기 변경 처리
     */
    handleResize() {
        // 디바운싱 적용
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.addDesktopLayoutToggle();
        }, 150);
    }
    
    /**
     * 모바일 디바이스 감지
     */
    isMobileDevice() {
        // User Agent 기반 모바일 디바이스 감지
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
        
        // 터치 지원 여부 확인
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // 화면 크기와 터치 지원을 종합적으로 판단
        const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
        const isSmallScreen = window.innerWidth <= 768;
        
        return (isMobileUA || (hasTouch && isSmallScreen));
    }
    
    /**
     * 로그인 후 데스크톱 레이아웃 초기화
     */
    async initializeAfterLogin() {
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
     * 데스크톱 레이아웃 컨트롤러 정리
     */
    cleanup() {
        // 모든 이벤트 리스너 제거
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        
        // 타이머 정리
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        // 토글 버튼 제거
        const toggleButton = document.querySelector('.desktop-layout-toggle');
        if (toggleButton) {
            toggleButton.remove();
        }
        
        // 상태 초기화
        this.isInitialized = false;
        
        console.log('DesktopLayoutController cleaned up');
    }
    
    /**
     * 컨트롤러 상태 확인
     * @returns {Object} 컨트롤러 상태
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isDesktopMode: this.desktopLayoutManager.isDesktopMode(),
            hasToggleButton: !!document.querySelector('.desktop-layout-toggle'),
            eventListenersCount: this.eventListeners.length
        };
    }
}
