/**
 * 모바일 환경 최적화 모듈
 * 터치 이벤트, 스크롤, 키보드 처리를 담당
 * 
 * @version 1.0.0
 * @since 2024-12-29
 * @author REDIPX
 */

export class MobileOptimizer {
    constructor() {
        this.isInitialized = false;
        this.touchState = {
            startY: 0,
            startX: 0,
            isScrolling: false,
            scrollTimeout: null
        };
        this.keyboardState = {
            initialViewportHeight: window.innerHeight,
            lastTouchEnd: 0
        };
        this.eventListeners = [];
        
        this.init();
    }
    
    /**
     * 모바일 최적화 초기화
     */
    init() {
        if (this.isInitialized) {
            console.warn('MobileOptimizer is already initialized');
            return;
        }
        
        try {
            this.setupTouchOptimization();
            this.setupScrollOptimization();
            this.setupKeyboardHandling();
            this.setupTouchFeedback();
            this.setupScrollPerformanceOptimization();
            
            this.isInitialized = true;
            console.log('MobileOptimizer initialized successfully');
        } catch (error) {
            console.error('MobileOptimizer initialization failed:', error);
        }
    }
    
    /**
     * 터치 이벤트 최적화 설정
     */
    setupTouchOptimization() {
        // 터치 시작 이벤트
        const touchStartHandler = (e) => {
            this.touchState.startY = e.touches[0].clientY;
            this.touchState.startX = e.touches[0].clientX;
            this.touchState.isScrolling = false;
            
            // 스크롤 타임아웃 초기화
            clearTimeout(this.touchState.scrollTimeout);
        };
        
        // 터치 이동 이벤트 (가로 스크롤 방지, 스크롤 중일 때는 방해하지 않음)
        const touchMoveHandler = (e) => {
            const touchY = e.touches[0].clientY;
            const touchX = e.touches[0].clientX;
            const deltaY = Math.abs(touchY - this.touchState.startY);
            const deltaX = Math.abs(touchX - this.touchState.startX);
            
            // 세로 스크롤 감지
            if (deltaY > 10) {
                this.touchState.isScrolling = true;
                // 스크롤 중임을 표시
                document.body.classList.add('is-scrolling');
                
                // 스크롤 종료 후 클래스 제거
                clearTimeout(this.touchState.scrollTimeout);
                this.touchState.scrollTimeout = setTimeout(() => {
                    document.body.classList.remove('is-scrolling');
                    this.touchState.isScrolling = false;
                }, 150);
            }
            
            // 가로 스크롤만 방지하고, 스크롤 중일 때는 방해하지 않음
            if (deltaX > deltaY && deltaX > 10 && e.cancelable && !this.touchState.isScrolling) {
                e.preventDefault();
            }
        };
        
        // 더블 탭 줌 방지
        const touchEndHandler = (e) => {
            const now = (new Date()).getTime();
            if (now - this.keyboardState.lastTouchEnd <= 300 && e.cancelable && !this.touchState.isScrolling) {
                // 더블 탭이면서 취소 가능하고 스크롤 중이 아닌 경우에만 방지
                e.preventDefault();
            }
            this.keyboardState.lastTouchEnd = now;
        };
        
        // 이벤트 리스너 등록
        this.addEventListener(document, 'touchstart', touchStartHandler, { passive: true });
        this.addEventListener(document, 'touchmove', touchMoveHandler, { passive: false });
        this.addEventListener(document, 'touchend', touchEndHandler, { passive: false });
    }
    
    /**
     * 스크롤 최적화 설정
     */
    setupScrollOptimization() {
        // 입력 필드 포커스 시 줌 방지
        const setupInputFocus = () => {
            const inputs = document.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                const focusHandler = function() {
                    // 입력 필드가 화면 중앙에 오도록 스크롤
                    setTimeout(() => {
                        this.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 300);
                };
                
                this.addEventListener(input, 'focus', focusHandler);
            });
        };
        
        // DOM이 로드된 후 입력 필드 설정
        if (document.readyState === 'loading') {
            this.addEventListener(document, 'DOMContentLoaded', setupInputFocus);
        } else {
            setupInputFocus();
        }
    }
    
    /**
     * 키보드 처리 설정
     */
    setupKeyboardHandling() {
        // 모바일 키보드 표시 시 레이아웃 조정
        const resizeHandler = () => {
            if (window.innerHeight < this.keyboardState.initialViewportHeight) {
                // 키보드가 표시됨
                document.body.style.height = window.innerHeight + 'px';
            } else {
                // 키보드가 숨겨짐
                document.body.style.height = '100vh';
            }
        };
        
        this.addEventListener(window, 'resize', resizeHandler);
    }
    
    /**
     * 터치 피드백 효과 설정
     */
    setupTouchFeedback() {
        const setupTouchFeedback = () => {
            const touchElements = document.querySelectorAll('button, .tab-btn, .login-btn, .google-login-btn, a');
            touchElements.forEach(element => {
                // 화살표 함수로 수정하여 this 컨텍스트 문제 해결
                const touchStartHandler = (e) => {
                    if (!this.touchState.isScrolling) {
                        e.target.style.transform = 'scale3d(0.98, 0.98, 1)';
                    }
                };
                
                const touchEndHandler = (e) => {
                    e.target.style.transform = 'scale3d(1, 1, 1)';
                };
                
                this.addEventListener(element, 'touchstart', touchStartHandler, { passive: true });
                this.addEventListener(element, 'touchend', touchEndHandler, { passive: true });
            });
        };
        
        // DOM이 로드된 후 터치 피드백 설정
        if (document.readyState === 'loading') {
            this.addEventListener(document, 'DOMContentLoaded', setupTouchFeedback);
        } else {
            setupTouchFeedback();
        }
    }
    
    /**
     * 스크롤 성능 최적화 설정
     */
    setupScrollPerformanceOptimization() {
        const optimizeScrollElements = () => {
            // 모든 스크롤 가능한 요소에 최적화 적용
            const scrollableElements = document.querySelectorAll('*');
            scrollableElements.forEach(element => {
                const style = window.getComputedStyle(element);
                if (style.overflow === 'auto' || style.overflow === 'scroll' || 
                    style.overflowY === 'auto' || style.overflowY === 'scroll') {
                    element.style.webkitOverflowScrolling = 'touch';
                    element.style.transform = 'translate3d(0, 0, 0)';
                    element.style.backfaceVisibility = 'hidden';
                }
            });
        };
        
        // DOM이 로드된 후 스크롤 최적화 적용
        if (document.readyState === 'loading') {
            this.addEventListener(document, 'DOMContentLoaded', optimizeScrollElements);
        } else {
            optimizeScrollElements();
        }
    }
    
    /**
     * 이벤트 리스너 추가 (메모리 관리용)
     * @param {HTMLElement} element - 이벤트를 바인딩할 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     * @param {Object} options - 이벤트 옵션
     */
    addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        this.eventListeners.push({ element, event, handler, options });
    }
    
    /**
     * 모바일 최적화 정리
     */
    cleanup() {
        // 모든 이벤트 리스너 제거
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        
        // 타임아웃 정리
        if (this.touchState.scrollTimeout) {
            clearTimeout(this.touchState.scrollTimeout);
        }
        
        // 상태 초기화
        this.isInitialized = false;
        this.touchState = {
            startY: 0,
            startX: 0,
            isScrolling: false,
            scrollTimeout: null
        };
        this.keyboardState = {
            initialViewportHeight: window.innerHeight,
            lastTouchEnd: 0
        };
        
        console.log('MobileOptimizer cleaned up');
    }
    
    /**
     * 현재 스크롤 상태 확인
     * @returns {boolean} 스크롤 중인지 여부
     */
    isScrolling() {
        return this.touchState.isScrolling;
    }
    
    /**
     * 터치 상태 정보 반환
     * @returns {Object} 터치 상태 정보
     */
    getTouchState() {
        return { ...this.touchState };
    }
    
    /**
     * 키보드 상태 정보 반환
     * @returns {Object} 키보드 상태 정보
     */
    getKeyboardState() {
        return { ...this.keyboardState };
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const mobileOptimizer = new MobileOptimizer();