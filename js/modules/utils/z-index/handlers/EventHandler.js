/**
 * Event Handler - Z-Index 관련 이벤트 처리 전문 모듈
 * 
 * 이 모듈은 Z-Index Manager와 관련된 모든 이벤트를 처리하고,
 * 이벤트 기반 통신을 통해 모듈 간 상호작용을 관리합니다.
 * 
 * 주요 기능:
 * - 커스텀 이벤트 처리
 * - 이벤트 리스너 관리
 * - 모듈 간 이벤트 통신
 * - 성능 최적화된 이벤트 처리
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

export class EventHandler {
    constructor() {
        this.eventListeners = new Map();
        this.isInitialized = false;
        
        // 성능 최적화를 위한 설정
        this.debounceDelay = 100;
        this.throttleDelay = 16; // 60fps
        
        // 이벤트 핸들러 바인딩
        this.boundHandlers = new Map();
    }
    
    /**
     * Event Handler 초기화
     */
    init() {
        try {
            console.log('Event Handler 초기화 시작...');
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('Event Handler 초기화 완료');
            
        } catch (error) {
            console.error('Event Handler 초기화 실패:', error);
            throw error;
        }
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // Country Selector 관련 이벤트
        this.addEventListener('country-selector-open', this.handleCountrySelectorOpen.bind(this));
        this.addEventListener('country-selector-close', this.handleCountrySelectorClose.bind(this));
        
        // 모달 관련 이벤트
        this.addEventListener('modal-open', this.handleModalOpen.bind(this));
        this.addEventListener('modal-close', this.handleModalClose.bind(this));
        
        // 드롭다운 관련 이벤트
        this.addEventListener('dropdown-open', this.handleDropdownOpen.bind(this));
        this.addEventListener('dropdown-close', this.handleDropdownClose.bind(this));
        
        // 윈도우 리사이즈 이벤트
        this.addEventListener('resize', this.debounce(this.handleResize.bind(this), this.debounceDelay));
        
        // 스크롤 이벤트 (성능 최적화)
        this.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), this.throttleDelay));
    }
    
    /**
     * 이벤트 리스너 추가
     * @param {string} event - 이벤트명
     * @param {Function} handler - 이벤트 핸들러
     */
    addEventListener(event, handler) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        
        this.eventListeners.get(event).push(handler);
        document.addEventListener(event, handler);
    }
    
    /**
     * 이벤트 리스너 제거
     * @param {string} event - 이벤트명
     * @param {Function} handler - 이벤트 핸들러
     */
    removeEventListener(event, handler) {
        if (this.eventListeners.has(event)) {
            const handlers = this.eventListeners.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
                document.removeEventListener(event, handler);
            }
        }
    }
    
    /**
     * 커스텀 이벤트 발생
     * @param {string} eventName - 이벤트명
     * @param {Object} detail - 이벤트 데이터
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Country Selector 열림 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleCountrySelectorOpen(event) {
        const element = event.detail?.element || event.target;
        
        if (!this.isValidElement(element)) {
            console.warn('handleCountrySelectorOpen: Invalid element provided', element);
            return;
        }
        
        // 이벤트 전파
        this.dispatchEvent('z-index:country-selector-opened', {
            element,
            timestamp: Date.now()
        });
        
        console.log('Country Selector 열림:', element);
    }
    
    /**
     * Country Selector 닫힘 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleCountrySelectorClose(event) {
        const element = event.detail?.element || event.target;
        
        if (!this.isValidElement(element)) {
            console.warn('handleCountrySelectorClose: Invalid element provided', element);
            return;
        }
        
        // 이벤트 전파
        this.dispatchEvent('z-index:country-selector-closed', {
            element,
            timestamp: Date.now()
        });
        
        console.log('Country Selector 닫힘:', element);
    }
    
    /**
     * 모달 열림 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleModalOpen(event) {
        const element = event.target;
        
        if (!this.isValidElement(element)) {
            console.warn('handleModalOpen: Invalid element provided', element);
            return;
        }
        
        // 이벤트 전파
        this.dispatchEvent('z-index:modal-opened', {
            element,
            timestamp: Date.now()
        });
        
        console.log('모달 열림:', element);
    }
    
    /**
     * 모달 닫힘 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleModalClose(event) {
        const element = event.target;
        
        if (!this.isValidElement(element)) {
            console.warn('handleModalClose: Invalid element provided', element);
            return;
        }
        
        // 이벤트 전파
        this.dispatchEvent('z-index:modal-closed', {
            element,
            timestamp: Date.now()
        });
        
        console.log('모달 닫힘:', element);
    }
    
    /**
     * 드롭다운 열림 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleDropdownOpen(event) {
        const element = event.target;
        
        if (!this.isValidElement(element)) {
            console.warn('handleDropdownOpen: Invalid element provided', element);
            return;
        }
        
        // 이벤트 전파
        this.dispatchEvent('z-index:dropdown-opened', {
            element,
            timestamp: Date.now()
        });
        
        console.log('드롭다운 열림:', element);
    }
    
    /**
     * 드롭다운 닫힘 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleDropdownClose(event) {
        const element = event.target;
        
        if (!this.isValidElement(element)) {
            console.warn('handleDropdownClose: Invalid element provided', element);
            return;
        }
        
        // 이벤트 전파
        this.dispatchEvent('z-index:dropdown-closed', {
            element,
            timestamp: Date.now()
        });
        
        console.log('드롭다운 닫힘:', element);
    }
    
    /**
     * 윈도우 리사이즈 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleResize(event) {
        // 이벤트 전파
        this.dispatchEvent('z-index:resize', {
            width: window.innerWidth,
            height: window.innerHeight,
            timestamp: Date.now()
        });
        
        console.log('윈도우 리사이즈:', window.innerWidth, 'x', window.innerHeight);
    }
    
    /**
     * 스크롤 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleScroll(event) {
        // 이벤트 전파
        this.dispatchEvent('z-index:scroll', {
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            timestamp: Date.now()
        });
    }
    
    /**
     * 요소 유효성 검사
     * @param {HTMLElement} element - 검사할 요소
     * @returns {boolean} 유효한 요소인지 여부
     */
    isValidElement(element) {
        return element && 
               element instanceof Element && 
               document.contains(element);
    }
    
    /**
     * 디바운스 함수
     * @param {Function} func - 실행할 함수
     * @param {number} delay - 지연 시간
     * @returns {Function} 디바운스된 함수
     */
    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    /**
     * 스로틀 함수
     * @param {Function} func - 실행할 함수
     * @param {number} limit - 제한 시간
     * @returns {Function} 스로틀된 함수
     */
    throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * 이벤트 리스너 등록 (외부 모듈용)
     * @param {string} event - 이벤트명
     * @param {Function} handler - 이벤트 핸들러
     * @returns {Function} 제거 함수
     */
    on(event, handler) {
        this.addEventListener(event, handler);
        return () => this.removeEventListener(event, handler);
    }
    
    /**
     * 일회성 이벤트 리스너 등록
     * @param {string} event - 이벤트명
     * @param {Function} handler - 이벤트 핸들러
     */
    once(event, handler) {
        const onceHandler = (...args) => {
            handler.apply(this, args);
            this.removeEventListener(event, onceHandler);
        };
        this.addEventListener(event, onceHandler);
    }
    
    /**
     * 리소스 정리
     */
    cleanup() {
        // 이벤트 리스너 정리
        this.eventListeners.forEach((handlers, event) => {
            handlers.forEach(handler => {
                document.removeEventListener(event, handler);
            });
        });
        this.eventListeners.clear();
        
        // 바인딩된 핸들러 정리
        this.boundHandlers.clear();
        
        this.isInitialized = false;
        console.log('Event Handler 정리 완료');
    }
}
