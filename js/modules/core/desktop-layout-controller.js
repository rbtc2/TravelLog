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
