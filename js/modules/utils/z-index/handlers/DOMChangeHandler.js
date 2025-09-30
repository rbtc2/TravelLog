/**
 * DOM Change Handler - DOM 변경사항 처리 전문 모듈
 * 
 * 이 모듈은 DOM 변경사항을 감지하고 처리하며, 새로운 요소의 자동 감지와
 * 요소 상태 변경을 관리하는 고성능 DOM 처리 시스템을 제공합니다.
 * 
 * 주요 기능:
 * - DOM 변경사항 감지
 * - 새로운 요소 자동 스캔
 * - 요소 상태 변경 처리
 * - 성능 최적화된 DOM 처리
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

export class DOMChangeHandler {
    constructor() {
        this.observer = null;
        this.isInitialized = false;
        this.scanQueue = [];
        this.isProcessingQueue = false;
        
        // 성능 최적화를 위한 설정
        this.scanDelay = 16; // 1프레임 지연
        this.maxRetries = 3;
        this.batchSize = 10; // 배치 처리 크기
    }
    
    /**
     * DOM Change Handler 초기화
     * @param {Function} onElementDetected - 요소 감지 콜백
     * @param {Function} onStateChanged - 상태 변경 콜백
     */
    init(onElementDetected, onStateChanged) {
        try {
            console.log('DOM Change Handler 초기화 시작...');
            
            this.onElementDetected = onElementDetected;
            this.onStateChanged = onStateChanged;
            
            // MutationObserver 설정
            this.setupMutationObserver();
            
            this.isInitialized = true;
            console.log('DOM Change Handler 초기화 완료');
            
        } catch (error) {
            console.error('DOM Change Handler 초기화 실패:', error);
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
     * DOM 변경사항 처리
     * @param {MutationRecord[]} mutations - DOM 변경사항들
     */
    handleDOMChanges(mutations) {
        mutations.forEach(mutation => {
            // 새로운 노드 추가
            if (mutation.type === 'childList') {
                this.handleNodeAddition(mutation.addedNodes);
            }
            
            // 속성 변경
            if (mutation.type === 'attributes') {
                this.handleAttributeChange(mutation.target, mutation.attributeName);
            }
        });
    }
    
    /**
     * 노드 추가 처리
     * @param {NodeList} addedNodes - 추가된 노드들
     */
    handleNodeAddition(addedNodes) {
        addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // 스캔 큐에 추가
                this.addToScanQueue(node);
            }
        });
        
        // 큐 처리 시작
        this.processScanQueue();
    }
    
    /**
     * 스캔 큐에 요소 추가
     * @param {HTMLElement} element - 스캔할 요소
     */
    addToScanQueue(element) {
        this.scanQueue.push({
            element,
            retryCount: 0,
            timestamp: Date.now()
        });
    }
    
    /**
     * 스캔 큐 처리
     */
    processScanQueue() {
        if (this.isProcessingQueue || this.scanQueue.length === 0) {
            return;
        }
        
        this.isProcessingQueue = true;
        
        // 배치 처리
        const batch = this.scanQueue.splice(0, this.batchSize);
        
        requestAnimationFrame(() => {
            batch.forEach(item => {
                this.scanElement(item);
            });
            
            this.isProcessingQueue = false;
            
            // 남은 큐가 있으면 다음 프레임에서 처리
            if (this.scanQueue.length > 0) {
                requestAnimationFrame(() => {
                    this.processScanQueue();
                });
            }
        });
    }
    
    /**
     * 요소 스캔
     * @param {Object} item - 스캔할 아이템
     */
    scanElement(item) {
        const { element, retryCount } = item;
        
        // 요소 유효성 검사
        if (!this.isValidElement(element)) {
            return;
        }
        
        // 요소가 DOM에 존재하는지 확인
        if (!document.contains(element)) {
            if (retryCount < this.maxRetries) {
                // 재시도
                item.retryCount++;
                this.scanQueue.push(item);
            }
            return;
        }
        
        // 요소가 실제로 렌더링되었는지 확인
        if (element.offsetParent === null && element.tagName !== 'BODY') {
            if (retryCount < this.maxRetries) {
                // 재시도
                item.retryCount++;
                this.scanQueue.push(item);
            }
            return;
        }
        
        // 요소 타입 확인 및 감지
        const elementType = this.detectElementType(element);
        if (elementType) {
            this.onElementDetected(element, elementType);
        }
        
        // 하위 요소들도 스캔
        this.scanChildElements(element);
    }
    
    /**
     * 하위 요소들 스캔
     * @param {HTMLElement} parentElement - 부모 요소
     */
    scanChildElements(parentElement) {
        const selectors = [
            '.country-selector',
            '.modal',
            '.modal-backdrop',
            '.dropdown',
            '.selector-dropdown',
            '.tooltip',
            '.popover'
        ];
        
        selectors.forEach(selector => {
            const children = parentElement.querySelectorAll(selector);
            children.forEach(child => {
                const elementType = this.detectElementType(child);
                if (elementType) {
                    this.onElementDetected(child, elementType);
                }
            });
        });
    }
    
    /**
     * 요소 타입 감지
     * @param {HTMLElement} element - 감지할 요소
     * @returns {string|null} 요소 타입
     */
    detectElementType(element) {
        // Country Selector 확인
        if (element.classList.contains('country-selector')) {
            return 'country-selector';
        }
        
        // 모달 확인
        if (element.classList.contains('modal') || 
            element.classList.contains('modal-backdrop')) {
            return 'modal';
        }
        
        // 드롭다운 확인
        if (element.classList.contains('dropdown') || 
            element.classList.contains('selector-dropdown')) {
            return 'dropdown';
        }
        
        // 툴팁 확인
        if (element.classList.contains('tooltip') || 
            element.classList.contains('popover')) {
            return 'tooltip';
        }
        
        return null;
    }
    
    /**
     * 속성 변경 처리
     * @param {HTMLElement} element - 변경된 요소
     * @param {string} attributeName - 변경된 속성명
     */
    handleAttributeChange(element, attributeName) {
        if (['class', 'style'].includes(attributeName)) {
            // 상태 변경 콜백 호출
            if (this.onStateChanged) {
                this.onStateChanged(element, attributeName);
            }
        }
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
     * 스캔 큐 정리
     */
    clearScanQueue() {
        this.scanQueue = [];
        this.isProcessingQueue = false;
    }
    
    /**
     * 스캔 큐 상태 가져오기
     * @returns {Object} 큐 상태 정보
     */
    getQueueStatus() {
        return {
            queueLength: this.scanQueue.length,
            isProcessing: this.isProcessingQueue,
            oldestItem: this.scanQueue.length > 0 ? 
                Date.now() - this.scanQueue[0].timestamp : 0
        };
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
        
        // 스캔 큐 정리
        this.clearScanQueue();
        
        // 콜백 정리
        this.onElementDetected = null;
        this.onStateChanged = null;
        
        this.isInitialized = false;
        console.log('DOM Change Handler 정리 완료');
    }
}
