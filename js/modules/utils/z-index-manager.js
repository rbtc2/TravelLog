/**
 * Z-Index Manager - 전문가 수준 Z-Index 충돌 관리 시스템
 * 
 * 이 모듈은 Country Selector와 다른 UI 요소들 간의 z-index 충돌을
 * 자동으로 감지하고 해결하는 고급 시스템을 제공합니다.
 * 
 * 주요 기능:
 * - 실시간 충돌 감지
 * - 동적 z-index 조정
 * - 성능 최적화된 충돌 해결
 * - 개발자 도구 지원
 * - 접근성 고려
 * 
 * @version 2.0.0
 * @since 2024-12-29
 */

class ZIndexManager {
    constructor() {
        this.isInitialized = false;
        this.conflictDetectionEnabled = true;
        this.debugMode = false;
        
        // 충돌 감지를 위한 요소들
        this.watchedElements = new Map();
        this.activeElements = new Map();
        this.conflictHistory = [];
        
        // 성능 최적화를 위한 설정
        this.debounceDelay = 100;
        this.maxConflictHistory = 50;
        
        // CSS 변수 업데이트를 위한 설정
        this.cssVariables = {
            '--active-dropdown-z': 0,
            '--active-modal-z': 0,
            '--active-tooltip-z': 0,
            '--dynamic-z-dropdown': 0,
            '--dynamic-z-modal': 0
        };
        
        // 이벤트 리스너들
        this.eventListeners = new Map();
        
        this.init();
    }
    
    /**
     * Z-Index Manager 초기화
     * @async
     */
    async init() {
        try {
            console.log('Z-Index Manager 초기화 시작...');
            
            // CSS 변수 초기화
            this.updateCSSVariables();
            
            // 충돌 감지 시스템 설정
            this.setupConflictDetection();
            
            // 이벤트 리스너 등록
            this.setupEventListeners();
            
            // 기존 요소들 스캔
            this.scanExistingElements();
            
            this.isInitialized = true;
            console.log('Z-Index Manager 초기화 완료');
            
        } catch (error) {
            console.error('Z-Index Manager 초기화 실패:', error);
            throw error;
        }
    }
    
    /**
     * CSS 변수 업데이트
     */
    updateCSSVariables() {
        const root = document.documentElement;
        
        Object.entries(this.cssVariables).forEach(([property, value]) => {
            root.style.setProperty(property, value.toString());
        });
    }
    
    /**
     * 충돌 감지 시스템 설정
     */
    setupConflictDetection() {
        // MutationObserver를 사용한 DOM 변경 감지
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
        this.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
    }
    
    /**
     * 기존 요소들 스캔
     */
    scanExistingElements() {
        // Country Selector 요소들 찾기
        const countrySelectors = document.querySelectorAll('.country-selector, .country-selector-v2');
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
        if (!element || !(element instanceof Element)) {
            console.warn('watchElement: Invalid element provided', element);
            return;
        }
        
        // 요소가 DOM에 연결되어 있는지 확인
        if (!document.contains(element)) {
            console.warn('watchElement: Element not in DOM', element);
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
        if (!this.conflictDetectionEnabled) {
            return;
        }
        
        mutations.forEach(mutation => {
            // 새로운 노드 추가
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.scanNewElement(node);
                    }
                });
            }
            
            // 속성 변경
            if (mutation.type === 'attributes') {
                this.handleAttributeChange(mutation.target, mutation.attributeName);
            }
        });
        
        // 충돌 감지 실행
        this.detectConflicts();
    }
    
    /**
     * 새로운 요소 스캔
     * @param {HTMLElement} element - 스캔할 요소
     */
    scanNewElement(element) {
        // Country Selector 확인
        if (element.classList.contains('country-selector') || 
            element.classList.contains('country-selector-v2')) {
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
        const children = element.querySelectorAll('.country-selector, .country-selector-v2, .modal, .dropdown, .tooltip');
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
                    
                    // 충돌 감지 실행
                    this.detectConflicts();
                }
            }
        }
    }
    
    /**
     * 충돌 감지 실행
     */
    detectConflicts() {
        if (!this.conflictDetectionEnabled) {
            return;
        }
        
        const conflicts = [];
        const countrySelectors = Array.from(this.activeElements.values())
            .filter(info => info.type === 'country-selector');
        
        // Country Selector와 다른 요소들 간의 충돌 감지
        countrySelectors.forEach(countrySelector => {
            const conflictsWith = this.findConflictsWith(countrySelector);
            if (conflictsWith.length > 0) {
                conflicts.push({
                    element: countrySelector.element,
                    conflicts: conflictsWith,
                    timestamp: Date.now()
                });
            }
        });
        
        // 충돌 해결
        if (conflicts.length > 0) {
            this.resolveConflicts(conflicts);
        }
    }
    
    /**
     * 특정 요소와 충돌하는 요소들 찾기
     * @param {Object} elementInfo - 요소 정보
     * @returns {Array} 충돌하는 요소들
     */
    findConflictsWith(elementInfo) {
        const conflicts = [];
        const elementRect = elementInfo.element.getBoundingClientRect();
        
        this.activeElements.forEach((otherInfo, otherElement) => {
            if (otherElement === elementInfo.element) {
                return;
            }
            
            const otherRect = otherElement.getBoundingClientRect();
            
            // 요소들이 겹치는지 확인
            if (this.elementsOverlap(elementRect, otherRect)) {
                const elementZIndex = this.getElementZIndex(elementInfo.element);
                const otherZIndex = this.getElementZIndex(otherElement);
                
                // z-index가 비슷하거나 낮은 경우 충돌로 간주
                if (elementZIndex <= otherZIndex) {
                    conflicts.push({
                        element: otherElement,
                        type: otherInfo.type,
                        zIndex: otherZIndex,
                        overlap: this.calculateOverlap(elementRect, otherRect)
                    });
                }
            }
        });
        
        return conflicts;
    }
    
    /**
     * 두 요소가 겹치는지 확인
     * @param {DOMRect} rect1 - 첫 번째 요소의 위치
     * @param {DOMRect} rect2 - 두 번째 요소의 위치
     * @returns {boolean} 겹치는지 여부
     */
    elementsOverlap(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
    
    /**
     * 두 요소의 겹침 정도 계산
     * @param {DOMRect} rect1 - 첫 번째 요소의 위치
     * @param {DOMRect} rect2 - 두 번째 요소의 위치
     * @returns {number} 겹침 정도 (0-1)
     */
    calculateOverlap(rect1, rect2) {
        const overlapLeft = Math.max(rect1.left, rect2.left);
        const overlapRight = Math.min(rect1.right, rect2.right);
        const overlapTop = Math.max(rect1.top, rect2.top);
        const overlapBottom = Math.min(rect1.bottom, rect2.bottom);
        
        if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
            return 0;
        }
        
        const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
        const elementArea = (rect1.right - rect1.left) * (rect1.bottom - rect1.top);
        
        return overlapArea / elementArea;
    }
    
    /**
     * 충돌 해결
     * @param {Array} conflicts - 충돌 정보들
     */
    resolveConflicts(conflicts) {
        conflicts.forEach(conflict => {
            const countrySelector = conflict.element;
            const highestConflictZIndex = Math.max(...conflict.conflicts.map(c => c.zIndex));
            
            // Country Selector의 z-index를 충돌하는 요소들보다 높게 설정
            const newZIndex = highestConflictZIndex + 100;
            this.setElementZIndex(countrySelector, newZIndex);
            
            // CSS 변수 업데이트
            this.cssVariables['--dynamic-z-dropdown'] = newZIndex;
            this.updateCSSVariables();
            
            // 충돌 해결 로그
            this.logConflictResolution(conflict, newZIndex);
            
            // 개발자 도구에 충돌 해결 알림
            if (this.debugMode) {
                this.notifyConflictResolution(conflict, newZIndex);
            }
        });
    }
    
    /**
     * 요소의 z-index 값 가져오기
     * @param {HTMLElement} element - 요소
     * @returns {number} z-index 값
     */
    getElementZIndex(element) {
        // 요소 유효성 검사
        if (!element || !(element instanceof Element)) {
            console.warn('getElementZIndex: Invalid element provided', element);
            return 0;
        }
        
        // 요소가 DOM에 연결되어 있는지 확인
        if (!document.contains(element)) {
            console.warn('getElementZIndex: Element not in DOM', element);
            return 0;
        }
        
        try {
            const computedStyle = window.getComputedStyle(element);
            const zIndex = parseInt(computedStyle.zIndex, 10);
            
            if (isNaN(zIndex)) {
                return 0;
            }
            
            return zIndex;
        } catch (error) {
            console.error('getElementZIndex: Failed to get computed style', error, element);
            return 0;
        }
    }
    
    /**
     * 요소의 z-index 값 설정
     * @param {HTMLElement} element - 요소
     * @param {number} zIndex - 새로운 z-index 값
     */
    setElementZIndex(element, zIndex) {
        // 요소 유효성 검사
        if (!element || !(element instanceof Element)) {
            console.warn('setElementZIndex: Invalid element provided', element);
            return;
        }
        
        // 요소가 DOM에 연결되어 있는지 확인
        if (!document.contains(element)) {
            console.warn('setElementZIndex: Element not in DOM', element);
            return;
        }
        
        try {
            element.style.zIndex = zIndex.toString();
        } catch (error) {
            console.error('setElementZIndex: Failed to set z-index', error, element);
        }
        
        // data 속성에도 저장 (디버깅용)
        element.setAttribute('data-z-index', zIndex.toString());
    }
    
    /**
     * 요소가 활성 상태인지 확인
     * @param {HTMLElement} element - 요소
     * @returns {boolean} 활성 상태 여부
     */
    isElementActive(element) {
        // 요소 유효성 검사
        if (!element || !(element instanceof Element)) {
            console.warn('isElementActive: Invalid element provided', element);
            return false;
        }
        
        // 요소가 DOM에 연결되어 있는지 확인
        if (!document.contains(element)) {
            console.warn('isElementActive: Element not in DOM', element);
            return false;
        }
        
        // Country Selector
        if (element.classList.contains('country-selector') || 
            element.classList.contains('country-selector-v2')) {
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
     * Country Selector 열림 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleCountrySelectorOpen(event) {
        const element = event.detail?.element || event.target;
        
        // 요소 유효성 검사
        if (!element || !(element instanceof Element)) {
            console.warn('handleCountrySelectorOpen: Invalid element provided', element);
            return;
        }
        
        // 요소가 DOM에 연결되어 있는지 확인
        if (!document.contains(element)) {
            console.warn('handleCountrySelectorOpen: Element not in DOM', element);
            return;
        }
        
        this.watchElement(element, 'country-selector');
        
        // 최고 우선순위로 설정
        this.setElementZIndex(element, this.getHighestZIndex() + 100);
        
        console.log('Country Selector 열림:', element);
    }
    
    /**
     * Country Selector 닫힘 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleCountrySelectorClose(event) {
        const element = event.target;
        
        // 원래 z-index로 복원
        const elementInfo = this.watchedElements.get(element);
        if (elementInfo) {
            this.setElementZIndex(element, elementInfo.originalZIndex);
        }
        
        console.log('Country Selector 닫힘:', element);
    }
    
    /**
     * 모달 열림 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleModalOpen(event) {
        const element = event.target;
        this.watchElement(element, 'modal');
        
        // CSS 변수 업데이트
        this.cssVariables['--active-modal-z'] = this.getElementZIndex(element);
        this.updateCSSVariables();
        
        console.log('모달 열림:', element);
    }
    
    /**
     * 모달 닫힘 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleModalClose(event) {
        const element = event.target;
        
        // CSS 변수 업데이트
        this.cssVariables['--active-modal-z'] = 0;
        this.updateCSSVariables();
        
        console.log('모달 닫힘:', element);
    }
    
    /**
     * 드롭다운 열림 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleDropdownOpen(event) {
        const element = event.target;
        this.watchElement(element, 'dropdown');
        
        console.log('드롭다운 열림:', element);
    }
    
    /**
     * 드롭다운 닫힘 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleDropdownClose(event) {
        const element = event.target;
        
        console.log('드롭다운 닫힘:', element);
    }
    
    /**
     * 윈도우 리사이즈 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleResize(event) {
        // 모바일 환경에서의 폴백 메커니즘 활성화
        if (window.innerWidth <= 768) {
            this.enableMobileFallback();
        } else {
            this.disableMobileFallback();
        }
    }
    
    /**
     * 스크롤 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleScroll(event) {
        // 스크롤 시 요소 위치 재계산
        this.detectConflicts();
    }
    
    /**
     * 모바일 폴백 메커니즘 활성화
     */
    enableMobileFallback() {
        const countrySelectors = document.querySelectorAll('.country-selector-v2');
        countrySelectors.forEach(element => {
            element.classList.add('mobile-fallback');
        });
    }
    
    /**
     * 모바일 폴백 메커니즘 비활성화
     */
    disableMobileFallback() {
        const countrySelectors = document.querySelectorAll('.country-selector-v2');
        countrySelectors.forEach(element => {
            element.classList.remove('mobile-fallback');
        });
    }
    
    /**
     * 현재 가장 높은 z-index 값 가져오기
     * @returns {number} 가장 높은 z-index 값
     */
    getHighestZIndex() {
        let highest = 0;
        
        this.activeElements.forEach(elementInfo => {
            const zIndex = this.getElementZIndex(elementInfo.element);
            if (zIndex > highest) {
                highest = zIndex;
            }
        });
        
        return highest;
    }
    
    /**
     * 충돌 해결 로그 기록
     * @param {Object} conflict - 충돌 정보
     * @param {number} newZIndex - 새로운 z-index 값
     */
    logConflictResolution(conflict, newZIndex) {
        const logEntry = {
            timestamp: Date.now(),
            element: conflict.element,
            conflicts: conflict.conflicts,
            newZIndex,
            resolved: true
        };
        
        this.conflictHistory.push(logEntry);
        
        // 히스토리 크기 제한
        if (this.conflictHistory.length > this.maxConflictHistory) {
            this.conflictHistory.shift();
        }
        
        console.log('충돌 해결됨:', logEntry);
    }
    
    /**
     * 개발자 도구에 충돌 해결 알림
     * @param {Object} conflict - 충돌 정보
     * @param {number} newZIndex - 새로운 z-index 값
     */
    notifyConflictResolution(conflict, newZIndex) {
        // 개발자 도구에 표시할 정보
        const notification = {
            type: 'z-index-conflict-resolved',
            message: `Country Selector z-index 충돌 해결: ${newZIndex}`,
            element: conflict.element,
            conflicts: conflict.conflicts.length,
            timestamp: new Date().toISOString()
        };
        
        // 커스텀 이벤트 발생
        const event = new CustomEvent('z-index-conflict-resolved', {
            detail: notification
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 디버그 모드 토글
     * @param {boolean} enabled - 디버그 모드 활성화 여부
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        
        if (enabled) {
            document.body.classList.add('debug-z-index');
            console.log('Z-Index 디버그 모드 활성화');
        } else {
            document.body.classList.remove('debug-z-index');
            console.log('Z-Index 디버그 모드 비활성화');
        }
    }
    
    /**
     * 충돌 감지 활성화/비활성화
     * @param {boolean} enabled - 충돌 감지 활성화 여부
     */
    setConflictDetection(enabled) {
        this.conflictDetectionEnabled = enabled;
        console.log(`충돌 감지 ${enabled ? '활성화' : '비활성화'}`);
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
     * 충돌 히스토리 가져오기
     * @returns {Array} 충돌 히스토리
     */
    getConflictHistory() {
        return [...this.conflictHistory];
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
     * 리소스 정리
     */
    cleanup() {
        // MutationObserver 정리
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // 이벤트 리스너 정리
        this.eventListeners.forEach((handlers, event) => {
            handlers.forEach(handler => {
                document.removeEventListener(event, handler);
            });
        });
        this.eventListeners.clear();
        
        // 데이터 정리
        this.watchedElements.clear();
        this.activeElements.clear();
        this.conflictHistory = [];
        
        console.log('Z-Index Manager 정리 완료');
    }
}

// 전역 인스턴스 생성
window.zIndexManager = new ZIndexManager();

// 모듈 내보내기
export default ZIndexManager;
