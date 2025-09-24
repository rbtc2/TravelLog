/**
 * 인증 이벤트 관리자
 * @class AuthEventManager
 * @version 1.0.0
 * @since 2024-12-29
 */
export class AuthEventManager {
    constructor() {
        this.eventListeners = new Map();
        this.debounceTimers = new Map();
    }

    /**
     * 이벤트 리스너를 추가합니다
     * @param {HTMLElement} element - 이벤트를 바인딩할 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     * @param {Object} options - 이벤트 옵션
     */
    addEventListener(element, event, handler, options = {}) {
        if (!element) return;

        const key = `${element.id || 'anonymous'}_${event}`;
        
        // 기존 리스너 제거
        this.removeEventListener(element, event);
        
        // 새 리스너 추가
        element.addEventListener(event, handler, options);
        
        // 리스너 추적
        this.eventListeners.set(key, {
            element,
            event,
            handler,
            options
        });
    }

    /**
     * 이벤트 리스너를 제거합니다
     * @param {HTMLElement} element - 요소
     * @param {string} event - 이벤트 타입
     */
    removeEventListener(element, event) {
        if (!element) return;

        const key = `${element.id || 'anonymous'}_${event}`;
        const listener = this.eventListeners.get(key);
        
        if (listener) {
            element.removeEventListener(event, listener.handler, listener.options);
            this.eventListeners.delete(key);
        }
    }

    /**
     * 디바운스된 이벤트 핸들러를 생성합니다
     * @param {Function} handler - 원본 핸들러
     * @param {number} delay - 디바운스 지연 시간 (ms)
     * @param {string} key - 디바운스 키
     * @returns {Function} 디바운스된 핸들러
     */
    createDebouncedHandler(handler, delay = 300, key = 'default') {
        return (...args) => {
            // 기존 타이머 제거
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }

            // 새 타이머 설정
            const timer = setTimeout(() => {
                handler.apply(this, args);
                this.debounceTimers.delete(key);
            }, delay);

            this.debounceTimers.set(key, timer);
        };
    }

    /**
     * 스로틀된 이벤트 핸들러를 생성합니다
     * @param {Function} handler - 원본 핸들러
     * @param {number} limit - 스로틀 제한 시간 (ms)
     * @param {string} key - 스로틀 키
     * @returns {Function} 스로틀된 핸들러
     */
    createThrottledHandler(handler, limit = 100, key = 'default') {
        let inThrottle = false;
        
        return (...args) => {
            if (!inThrottle) {
                handler.apply(this, args);
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    /**
     * 폼 제출 이벤트를 바인딩합니다
     * @param {HTMLElement} form - 폼 요소
     * @param {Function} handler - 제출 핸들러
     */
    bindFormSubmit(form, handler) {
        this.addEventListener(form, 'submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handler(e);
        });
    }

    /**
     * 버튼 클릭 이벤트를 바인딩합니다
     * @param {HTMLElement} button - 버튼 요소
     * @param {Function} handler - 클릭 핸들러
     */
    bindButtonClick(button, handler) {
        this.addEventListener(button, 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handler(e);
        });
    }

    /**
     * 입력 필드 이벤트를 바인딩합니다
     * @param {HTMLElement} input - 입력 필드
     * @param {Function} handler - 입력 핸들러
     * @param {string} event - 이벤트 타입 (input, change, blur)
     */
    bindInputEvent(input, handler, event = 'input') {
        this.addEventListener(input, event, handler);
    }

    /**
     * 링크 클릭 이벤트를 바인딩합니다
     * @param {HTMLElement} link - 링크 요소
     * @param {Function} handler - 클릭 핸들러
     */
    bindLinkClick(link, handler) {
        this.addEventListener(link, 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handler(e);
        });
    }

    /**
     * 이벤트 위임을 설정합니다
     * @param {HTMLElement} container - 컨테이너 요소
     * @param {string} selector - 선택자
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 핸들러
     */
    bindEventDelegation(container, selector, event, handler) {
        this.addEventListener(container, event, (e) => {
            if (e.target.matches(selector)) {
                handler(e);
            }
        });
    }

    /**
     * 모든 이벤트 리스너를 정리합니다
     */
    cleanup() {
        // 이벤트 리스너 정리
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.eventListeners.clear();

        // 디바운스 타이머 정리
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
    }

    /**
     * 특정 요소의 모든 이벤트 리스너를 정리합니다
     * @param {HTMLElement} element - 요소
     */
    cleanupElement(element) {
        if (!element) return;

        const elementId = element.id || 'anonymous';
        
        // 해당 요소의 모든 리스너 찾기
        const keysToRemove = [];
        this.eventListeners.forEach((listener, key) => {
            if (key.startsWith(`${elementId}_`)) {
                listener.element.removeEventListener(
                    listener.event, 
                    listener.handler, 
                    listener.options
                );
                keysToRemove.push(key);
            }
        });

        // 맵에서 제거
        keysToRemove.forEach(key => this.eventListeners.delete(key));
    }
}
