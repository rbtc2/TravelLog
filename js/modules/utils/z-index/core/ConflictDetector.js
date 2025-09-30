/**
 * Conflict Detector - Z-Index 충돌 감지 및 해결 전문 모듈
 * 
 * 이 모듈은 UI 요소들 간의 z-index 충돌을 감지하고 자동으로 해결하는
 * 고성능 충돌 감지 시스템을 제공합니다.
 * 
 * 주요 기능:
 * - 실시간 충돌 감지
 * - 동적 z-index 조정
 * - 성능 최적화된 충돌 해결
 * - 충돌 히스토리 관리
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

export class ConflictDetector {
    constructor() {
        this.isEnabled = true;
        this.conflictHistory = [];
        this.maxConflictHistory = 50;
        
        // 성능 최적화를 위한 설정
        this.detectionCache = new Map();
        this.cacheTimeout = 1000; // 1초 캐시
    }
    
    /**
     * 충돌 감지 활성화/비활성화
     * @param {boolean} enabled - 활성화 여부
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`충돌 감지 ${enabled ? '활성화' : '비활성화'}`);
    }
    
    /**
     * 활성 요소들 간의 충돌 감지
     * @param {Map} activeElements - 활성 요소들
     * @returns {Array} 충돌 정보들
     */
    detectConflicts(activeElements) {
        if (!this.isEnabled || !activeElements || activeElements.size === 0) {
            return [];
        }
        
        const cacheKey = this.generateCacheKey(activeElements);
        const cached = this.detectionCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.conflicts;
        }
        
        const conflicts = [];
        const countrySelectors = Array.from(activeElements.values())
            .filter(info => info.type === 'country-selector');
        
        // Country Selector와 다른 요소들 간의 충돌 감지
        countrySelectors.forEach(countrySelector => {
            const conflictsWith = this.findConflictsWith(countrySelector, activeElements);
            if (conflictsWith.length > 0) {
                conflicts.push({
                    element: countrySelector.element,
                    conflicts: conflictsWith,
                    timestamp: Date.now()
                });
            }
        });
        
        // 캐시에 저장
        this.detectionCache.set(cacheKey, {
            conflicts,
            timestamp: Date.now()
        });
        
        return conflicts;
    }
    
    /**
     * 특정 요소와 충돌하는 요소들 찾기
     * @param {Object} elementInfo - 요소 정보
     * @param {Map} activeElements - 활성 요소들
     * @returns {Array} 충돌하는 요소들
     */
    findConflictsWith(elementInfo, activeElements) {
        const conflicts = [];
        const elementRect = elementInfo.element.getBoundingClientRect();
        
        activeElements.forEach((otherInfo, otherElement) => {
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
     * @param {Function} setElementZIndex - z-index 설정 함수
     * @param {Function} updateCSSVariables - CSS 변수 업데이트 함수
     * @param {Function} getHighestZIndex - 최고 z-index 가져오기 함수
     */
    resolveConflicts(conflicts, setElementZIndex, updateCSSVariables, getHighestZIndex) {
        conflicts.forEach(conflict => {
            const countrySelector = conflict.element;
            const highestConflictZIndex = Math.max(...conflict.conflicts.map(c => c.zIndex));
            
            // Country Selector의 z-index를 충돌하는 요소들보다 높게 설정
            const newZIndex = Math.max(highestConflictZIndex + 100, getHighestZIndex() + 100);
            setElementZIndex(countrySelector, newZIndex);
            
            // CSS 변수 업데이트
            updateCSSVariables({
                '--dynamic-z-dropdown': newZIndex
            });
            
            // 충돌 해결 로그
            this.logConflictResolution(conflict, newZIndex);
        });
    }
    
    /**
     * 요소의 z-index 값 가져오기
     * @param {HTMLElement} element - 요소
     * @returns {number} z-index 값
     */
    getElementZIndex(element) {
        if (!element || !(element instanceof Element)) {
            return 0;
        }
        
        if (!document.contains(element)) {
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
     * 캐시 키 생성
     * @param {Map} activeElements - 활성 요소들
     * @returns {string} 캐시 키
     */
    generateCacheKey(activeElements) {
        const keys = Array.from(activeElements.keys()).map(el => el.id || el.className).sort();
        return keys.join('|');
    }
    
    /**
     * 충돌 히스토리 가져오기
     * @returns {Array} 충돌 히스토리
     */
    getConflictHistory() {
        return [...this.conflictHistory];
    }
    
    /**
     * 캐시 정리
     */
    clearCache() {
        this.detectionCache.clear();
    }
    
    /**
     * 리소스 정리
     */
    cleanup() {
        this.conflictHistory = [];
        this.detectionCache.clear();
        console.log('ConflictDetector 정리 완료');
    }
}
