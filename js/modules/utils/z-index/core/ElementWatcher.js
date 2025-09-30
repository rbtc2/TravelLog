/**
 * Element Watcher - DOM 요소 감시 및 관리 전문 모듈
 * 
 * 이 모듈은 DOM 요소들을 감시하고, 새로운 요소를 자동으로 감지하며,
 * 요소의 활성 상태를 관리하는 고성능 감시 시스템을 제공합니다.
 * 
 * 주요 기능:
 * - DOM 요소 자동 감지
 * - 요소 활성 상태 관리
 * - 성능 최적화된 감시
 * - 메모리 누수 방지
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

export class ElementWatcher {
    constructor() {
        this.watchedElements = new Map();
        this.activeElements = new Map();
        this.observer = null;
        this.isInitialized = false;
        
        // 성능 최적화를 위한 설정
        this.scanDelay = 16; // 1프레임 지연
        this.maxRetries = 3;
    }
    
    /**
     * Element Watcher 초기화
     * @async
     */
    async init() {
        try {
            console.log('Element Watcher 초기화 시작...');
            
            // MutationObserver 설정
            this.setupMutationObserver();
            
            // 기존 요소들 스캔
            this.scanExistingElements();
            
            this.isInitialized = true;
            console.log('Element Watcher 초기화 완료');
            
        } catch (error) {
            console.error('Element Watcher 초기화 실패:', error);
            throw error;
        }
    }
    
    /**
     * MutationObserver 설정
     */
    setupMutationObserver() {
        this.observer = new MutationObserver((mutations) => {
            this.handleDOMChanges(mutations);
        });
        
        // 전체 문서 관찰 시작
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'data-z-index']
        });
    }
    
    /**
     * 기존 요소들 스캔
     */
    scanExistingElements() {
        // Country Selector 요소들 찾기
        const countrySelectors = document.querySelectorAll('.country-selector');
        countrySelectors.forEach(element => {
            this.watchElement(element, 'country-selector');
        });
        
        // 모달 요소들 찾기
        const modals = document.querySelectorAll('.modal, .modal-backdrop');
        modals.forEach(element => {
            this.watchElement(element, 'modal');
        });
        
        // 드롭다운 요소들 찾기
        const dropdowns = document.querySelectorAll('.dropdown, .selector-dropdown');
        dropdowns.forEach(element => {
            this.watchElement(element, 'dropdown');
        });
        
        // 툴팁 요소들 찾기
        const tooltips = document.querySelectorAll('.tooltip, .popover');
        tooltips.forEach(element => {
            this.watchElement(element, 'tooltip');
        });
    }
    
    /**
     * 요소 감시 시작
     * @param {HTMLElement} element - 감시할 요소
     * @param {string} type - 요소 타입
     */
    watchElement(element, type) {
        // 요소 유효성 검사
        if (!this.isValidElement(element)) {
            console.warn('watchElement: Invalid element provided', element);
            return;
        }
        
        if (this.watchedElements.has(element)) {
            return;
        }
        
        const elementInfo = {
            element,
            type,
            originalZIndex: this.getElementZIndex(element),
            isActive: this.isElementActive(element),
            lastChecked: Date.now()
        };
        
        this.watchedElements.set(element, elementInfo);
        
        // 활성 상태인 경우 activeElements에도 추가
        if (elementInfo.isActive) {
            this.activeElements.set(element, elementInfo);
        }
        
        console.log(`요소 감시 시작: ${type}`, element);
    }
    
    /**
     * 요소 감시 중지
     * @param {HTMLElement} element - 감시를 중지할 요소
     */
    unwatchElement(element) {
        if (!element || !this.watchedElements.has(element)) {
            return;
        }
        
        this.watchedElements.delete(element);
        this.activeElements.delete(element);
        
        console.log('요소 감시 중지:', element);
    }
    
    /**
     * DOM 변경사항 처리
     * @param {MutationRecord[]} mutations - DOM 변경사항들
     */
    handleDOMChanges(mutations) {
        mutations.forEach(mutation => {
            // 새로운 노드 추가
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // DOM에 추가된 후 약간의 지연을 두고 스캔
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                this.scanNewElement(node);
                            });
                        });
                    }
                });
            }
            
            // 속성 변경
            if (mutation.type === 'attributes') {
                this.handleAttributeChange(mutation.target, mutation.attributeName);
            }
        });
    }
    
    /**
     * 새로운 요소 스캔
     * @param {HTMLElement} element - 스캔할 요소
     * @param {number} retryCount - 재시도 횟수
     */
    scanNewElement(element, retryCount = 0) {
        // 요소 유효성 검사
        if (!this.isValidElement(element)) {
            return;
        }
        
        // 요소가 DOM에 존재하는지 먼저 확인
        if (!document.contains(element)) {
            if (retryCount < this.maxRetries) {
                requestAnimationFrame(() => {
                    this.scanNewElement(element, retryCount + 1);
                });
            }
            return;
        }
        
        // 요소가 실제로 렌더링되었는지 확인 (offsetParent 체크)
        if (element.offsetParent === null && element.tagName !== 'BODY') {
            if (retryCount < this.maxRetries) {
                requestAnimationFrame(() => {
                    this.scanNewElement(element, retryCount + 1);
                });
            }
            return;
        }
        
        // Country Selector 확인
        if (element.classList.contains('country-selector')) {
            this.watchElement(element, 'country-selector');
        }
        
        // 모달 확인
        if (element.classList.contains('modal') || 
            element.classList.contains('modal-backdrop')) {
            this.watchElement(element, 'modal');
        }
        
        // 드롭다운 확인
        if (element.classList.contains('dropdown') || 
            element.classList.contains('selector-dropdown')) {
            this.watchElement(element, 'dropdown');
        }
        
        // 툴팁 확인
        if (element.classList.contains('tooltip') || 
            element.classList.contains('popover')) {
            this.watchElement(element, 'tooltip');
        }
        
        // 하위 요소들도 스캔
        const children = element.querySelectorAll('.country-selector, .modal, .dropdown, .tooltip');
        children.forEach(child => {
            this.scanNewElement(child);
        });
    }
    
    /**
     * 속성 변경 처리
     * @param {HTMLElement} element - 변경된 요소
     * @param {string} attributeName - 변경된 속성명
     */
    handleAttributeChange(element, attributeName) {
        if (['class', 'style'].includes(attributeName)) {
            const elementInfo = this.watchedElements.get(element);
            if (elementInfo) {
                const wasActive = elementInfo.isActive;
                const isActive = this.isElementActive(element);
                
                if (wasActive !== isActive) {
                    elementInfo.isActive = isActive;
                    
                    if (isActive) {
                        this.activeElements.set(element, elementInfo);
                    } else {
                        this.activeElements.delete(element);
                    }
                }
            }
        }
    }
    
    /**
     * 요소가 활성 상태인지 확인
     * @param {HTMLElement} element - 요소
     * @returns {boolean} 활성 상태 여부
     */
    isElementActive(element) {
        if (!this.isValidElement(element)) {
            // DOM에서 제거된 요소는 자동으로 unwatch
            if (this.watchedElements.has(element)) {
                this.unwatchElement(element);
            }
            return false;
        }
        
        // Country Selector
        if (element.classList.contains('country-selector')) {
            return element.classList.contains('open');
        }
        
        // 모달
        if (element.classList.contains('modal')) {
            return element.classList.contains('open') || 
                   element.classList.contains('show') ||
                   element.style.display !== 'none';
        }
        
        // 드롭다운
        if (element.classList.contains('dropdown') || 
            element.classList.contains('selector-dropdown')) {
            return element.classList.contains('open') || 
                   element.classList.contains('show') ||
                   element.style.display !== 'none';
        }
        
        // 툴팁
        if (element.classList.contains('tooltip') || 
            element.classList.contains('popover')) {
            return element.classList.contains('visible') || 
                   element.classList.contains('show') ||
                   element.style.display !== 'none';
        }
        
        return false;
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
     * 요소의 z-index 값 가져오기
     * @param {HTMLElement} element - 요소
     * @returns {number} z-index 값
     */
    getElementZIndex(element) {
        if (!this.isValidElement(element)) {
            return 0;
        }
        
        try {
            const computedStyle = window.getComputedStyle(element);
            const zIndex = parseInt(computedStyle.zIndex, 10);
            return isNaN(zIndex) ? 0 : zIndex;
        } catch (error) {
            console.error('getElementZIndex: Failed to get computed style', error, element);
            return 0;
        }
    }
    
    /**
     * 현재 감시 중인 요소들 가져오기
     * @returns {Map} 감시 중인 요소들
     */
    getWatchedElements() {
        return new Map(this.watchedElements);
    }
    
    /**
     * 현재 활성화된 요소들 가져오기
     * @returns {Map} 활성화된 요소들
     */
    getActiveElements() {
        return new Map(this.activeElements);
    }
    
    /**
     * 활성 요소 업데이트
     */
    updateActiveElements() {
        const validElements = new Map();
        
        this.watchedElements.forEach((elementInfo, element) => {
            if (this.isValidElement(element)) {
                const isActive = this.isElementActive(element);
                elementInfo.isActive = isActive;
                
                if (isActive) {
                    validElements.set(element, elementInfo);
                }
            } else {
                // 유효하지 않은 요소는 제거
                this.watchedElements.delete(element);
            }
        });
        
        this.activeElements = validElements;
    }
    
    /**
     * 리소스 정리
     */
    cleanup() {
        // MutationObserver 정리
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        // 데이터 정리
        this.watchedElements.clear();
        this.activeElements.clear();
        
        this.isInitialized = false;
        console.log('Element Watcher 정리 완료');
    }
}
