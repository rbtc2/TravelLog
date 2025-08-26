/**
 * 이벤트 리스너 관리 모듈
 * 애플리케이션 전체에서 사용할 수 있는 이벤트 관리 시스템
 */

export class EventManager {
    constructor() {
        this.listeners = [];
    }
    
    /**
     * 이벤트 리스너를 등록하고 추적합니다
     * @param {Element} element - 이벤트를 바인딩할 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     */
    add(element, event, handler) {
        element.addEventListener(event, handler);
        this.listeners.push({ element, event, handler });
    }
    
    /**
     * 특정 요소의 특정 이벤트 리스너를 제거합니다
     * @param {Element} element - 이벤트를 제거할 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     */
    remove(element, event, handler) {
        element.removeEventListener(event, handler);
        const index = this.listeners.findIndex(
            listener => listener.element === element && 
                      listener.event === event && 
                      listener.handler === handler
        );
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }
    
    /**
     * 등록된 모든 이벤트 리스너를 제거합니다
     */
    cleanup() {
        this.listeners.forEach(listener => {
            if (listener.element && listener.event && listener.handler) {
                listener.element.removeEventListener(listener.event, listener.handler);
            }
        });
        this.listeners = [];
    }
    
    /**
     * 현재 등록된 리스너 수를 반환합니다
     * @returns {number} 등록된 리스너 수
     */
    getListenerCount() {
        return this.listeners.length;
    }
    
    /**
     * 특정 요소에 등록된 리스너를 모두 제거합니다
     * @param {Element} element - 이벤트를 제거할 요소
     */
    removeAllForElement(element) {
        this.listeners = this.listeners.filter(listener => {
            if (listener.element === element) {
                listener.element.removeEventListener(listener.event, listener.handler);
                return false;
            }
            return true;
        });
    }
}
