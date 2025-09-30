/**
 * Z-Index Manager - 모듈화된 Z-Index 충돌 관리 시스템
 * 
 * 이 모듈은 분리된 핵심 모듈들을 통합하여 Z-Index 충돌을
 * 자동으로 감지하고 해결하는 고급 시스템을 제공합니다.
 * 
 * 주요 기능:
 * - 모듈 기반 아키텍처
 * - 실시간 충돌 감지
 * - 동적 z-index 조정
 * - 성능 최적화된 충돌 해결
 * - 개발자 도구 지원
 * 
 * @version 2.0.0
 * @since 2025-09-30
 */

import { ConflictDetector } from './z-index/core/ConflictDetector.js';
import { ElementWatcher } from './z-index/core/ElementWatcher.js';
import { EventHandler } from './z-index/handlers/EventHandler.js';
import { DOMChangeHandler } from './z-index/handlers/DOMChangeHandler.js';
import { PerformanceUtils } from './z-index/utils/PerformanceUtils.js';

export class ZIndexManager {
    constructor() {
        this.isInitialized = false;
        this.debugMode = false;
        
        // 핵심 모듈들
        this.conflictDetector = new ConflictDetector();
        this.elementWatcher = new ElementWatcher();
        this.eventHandler = new EventHandler();
        this.domChangeHandler = new DOMChangeHandler();
        
        // CSS 변수 관리
        this.cssVariables = {
            '--active-dropdown-z': 0,
            '--active-modal-z': 0,
            '--active-tooltip-z': 0,
            '--dynamic-z-dropdown': 0,
            '--dynamic-z-modal': 0
        };
        
        // 성능 모니터링
        this.performanceStats = PerformanceUtils.createPerformanceStats();
        
        // 이벤트 바인딩
        this.bindModuleEvents();
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
            
            // 핵심 모듈들 초기화
            await this.elementWatcher.init();
            this.eventHandler.init();
            this.domChangeHandler.init(
                this.handleElementDetected.bind(this),
                this.handleElementStateChanged.bind(this)
            );
            
            this.isInitialized = true;
            console.log('Z-Index Manager 초기화 완료');
            
        } catch (error) {
            console.error('Z-Index Manager 초기화 실패:', error);
            throw error;
        }
    }
    
    /**
     * 모듈 간 이벤트 바인딩
     */
    bindModuleEvents() {
        // 충돌 감지 이벤트
        this.eventHandler.on('z-index:country-selector-opened', (event) => {
            this.handleCountrySelectorOpen(event.detail.element);
        });
        
        this.eventHandler.on('z-index:country-selector-closed', (event) => {
            this.handleCountrySelectorClose(event.detail.element);
        });
        
        this.eventHandler.on('z-index:modal-opened', (event) => {
            this.handleModalOpen(event.detail.element);
        });
        
        this.eventHandler.on('z-index:modal-closed', (event) => {
            this.handleModalClose(event.detail.element);
        });
        
        this.eventHandler.on('z-index:dropdown-opened', (event) => {
            this.handleDropdownOpen(event.detail.element);
        });
        
        this.eventHandler.on('z-index:dropdown-closed', (event) => {
            this.handleDropdownClose(event.detail.element);
        });
        
        // 리사이즈 이벤트
        this.eventHandler.on('z-index:resize', (event) => {
            this.handleResize(event.detail);
        });
        
        // 스크롤 이벤트
        this.eventHandler.on('z-index:scroll', (event) => {
            this.handleScroll(event.detail);
        });
    }
    
    /**
     * 요소 감지 처리
     * @param {HTMLElement} element - 감지된 요소
     * @param {string} type - 요소 타입
     */
    handleElementDetected(element, type) {
        this.elementWatcher.watchElement(element, type);
        this.detectAndResolveConflicts();
    }
    
    /**
     * 요소 상태 변경 처리
     * @param {HTMLElement} element - 변경된 요소
     * @param {string} attributeName - 변경된 속성명
     */
    handleElementStateChanged(element, attributeName) {
        this.elementWatcher.handleAttributeChange(element, attributeName);
        this.detectAndResolveConflicts();
    }
    
    /**
     * 충돌 감지 및 해결
     */
    detectAndResolveConflicts() {
        if (!this.isInitialized) return;
        
        this.performanceStats.measure('conflict-detection', () => {
            const activeElements = this.elementWatcher.getActiveElements();
            const conflicts = this.conflictDetector.detectConflicts(activeElements);
            
            if (conflicts.length > 0) {
                this.conflictDetector.resolveConflicts(
                    conflicts,
                    this.setElementZIndex.bind(this),
                    this.updateCSSVariables.bind(this),
                    this.getHighestZIndex.bind(this)
                );
            }
        });
    }
    
    /**
     * Country Selector 열림 처리
     * @param {HTMLElement} element - 요소
     */
    handleCountrySelectorOpen(element) {
        this.elementWatcher.watchElement(element, 'country-selector');
        this.setElementZIndex(element, this.getHighestZIndex() + 100);
        this.detectAndResolveConflicts();
    }
    
    /**
     * Country Selector 닫힘 처리
     * @param {HTMLElement} element - 요소
     */
    handleCountrySelectorClose(element) {
        const elementInfo = this.elementWatcher.watchedElements.get(element);
            if (elementInfo) {
            this.setElementZIndex(element, elementInfo.originalZIndex);
        }
    }
    
    /**
     * 모달 열림 처리
     * @param {HTMLElement} element - 요소
     */
    handleModalOpen(element) {
        this.elementWatcher.watchElement(element, 'modal');
        this.cssVariables['--active-modal-z'] = this.getElementZIndex(element);
        this.updateCSSVariables();
    }
    
    /**
     * 모달 닫힘 처리
     * @param {HTMLElement} element - 요소
     */
    handleModalClose(element) {
        this.cssVariables['--active-modal-z'] = 0;
        this.updateCSSVariables();
    }
    
    /**
     * 드롭다운 열림 처리
     * @param {HTMLElement} element - 요소
     */
    handleDropdownOpen(element) {
        this.elementWatcher.watchElement(element, 'dropdown');
    }
    
    /**
     * 드롭다운 닫힘 처리
     * @param {HTMLElement} element - 요소
     */
    handleDropdownClose(element) {
        // 드롭다운 닫힘 처리 로직
    }
    
    /**
     * 리사이즈 처리
     * @param {Object} detail - 리사이즈 정보
     */
    handleResize(detail) {
        if (detail.width <= 768) {
            this.enableMobileFallback();
        } else {
            this.disableMobileFallback();
        }
    }
    
    /**
     * 스크롤 처리
     * @param {Object} detail - 스크롤 정보
     */
    handleScroll(detail) {
        this.detectAndResolveConflicts();
    }
    
    /**
     * CSS 변수 업데이트
     * @param {Object} variables - 업데이트할 변수들
     */
    updateCSSVariables(variables = {}) {
        const root = document.documentElement;
        const varsToUpdate = { ...this.cssVariables, ...variables };
        
        Object.entries(varsToUpdate).forEach(([property, value]) => {
            root.style.setProperty(property, value.toString());
        });
        
        this.cssVariables = varsToUpdate;
    }
    
    /**
     * 요소의 z-index 값 설정
     * @param {HTMLElement} element - 요소
     * @param {number} zIndex - 새로운 z-index 값
     */
    setElementZIndex(element, zIndex) {
        if (!element || !(element instanceof Element)) {
            console.warn('setElementZIndex: Invalid element provided', element);
            return;
        }
        
        if (!document.contains(element)) {
            console.warn('setElementZIndex: Element not in DOM', element);
            return;
        }
        
        try {
            element.style.zIndex = zIndex.toString();
            element.setAttribute('data-z-index', zIndex.toString());
        } catch (error) {
            console.error('setElementZIndex: Failed to set z-index', error, element);
        }
    }
    
    /**
     * 요소의 z-index 값 가져오기
     * @param {HTMLElement} element - 요소
     * @returns {number} z-index 값
     */
    getElementZIndex(element) {
        return this.conflictDetector.getElementZIndex(element);
    }
    
    /**
     * 현재 가장 높은 z-index 값 가져오기
     * @returns {number} 가장 높은 z-index 값
     */
    getHighestZIndex() {
        let highest = 0;
        const activeElements = this.elementWatcher.getActiveElements();
        
        activeElements.forEach((elementInfo, element) => {
            if (element && document.contains(element)) {
                const zIndex = this.getElementZIndex(element);
                if (zIndex > highest) {
                    highest = zIndex;
                }
            }
        });
        
        return highest;
    }
    
    /**
     * 모바일 폴백 메커니즘 활성화
     */
    enableMobileFallback() {
        const countrySelectors = document.querySelectorAll('.country-selector');
        countrySelectors.forEach(element => {
            element.classList.add('mobile-fallback');
        });
    }
    
    /**
     * 모바일 폴백 메커니즘 비활성화
     */
    disableMobileFallback() {
        const countrySelectors = document.querySelectorAll('.country-selector');
        countrySelectors.forEach(element => {
            element.classList.remove('mobile-fallback');
        });
    }
    
    
    /**
     * 성능 통계 가져오기
     * @returns {Object} 성능 통계
     */
    getPerformanceStats() {
        return this.performanceStats.getStats();
    }
    
    /**
     * 충돌 히스토리 가져오기
     * @returns {Array} 충돌 히스토리
     */
    getConflictHistory() {
        return this.conflictDetector.getConflictHistory();
    }
    
    /**
     * 현재 감시 중인 요소들 가져오기
     * @returns {Map} 감시 중인 요소들
     */
    getWatchedElements() {
        return this.elementWatcher.getWatchedElements();
    }
    
    /**
     * 현재 활성화된 요소들 가져오기
     * @returns {Map} 활성화된 요소들
     */
    getActiveElements() {
        return this.elementWatcher.getActiveElements();
    }
    
    // ===== 기존 API 호환성을 위한 래퍼 메서드들 =====
    
    /**
     * 요소 감시 시작 (기존 API 호환성)
     * @param {HTMLElement} element - 감시할 요소
     * @param {string} type - 요소 타입
     */
    watchElement(element, type) {
        this.elementWatcher.watchElement(element, type);
    }
    
    /**
     * 요소 감시 중지 (기존 API 호환성)
     * @param {HTMLElement} element - 감시를 중지할 요소
     */
    unwatchElement(element) {
        this.elementWatcher.unwatchElement(element);
    }
    
    /**
     * 요소가 활성 상태인지 확인 (기존 API 호환성)
     * @param {HTMLElement} element - 요소
     * @returns {boolean} 활성 상태 여부
     */
    isElementActive(element) {
        return this.elementWatcher.isElementActive(element);
    }
    
    /**
     * 충돌 감지 활성화/비활성화 (기존 API 호환성)
     * @param {boolean} enabled - 충돌 감지 활성화 여부
     */
    setConflictDetection(enabled) {
        this.conflictDetector.setEnabled(enabled);
    }
    
    /**
     * 디버그 모드 토글 (기존 API 호환성)
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
     * 리소스 정리
     */
    cleanup() {
        console.log('Z-Index Manager 정리 시작...');
        
        // 모듈들 정리
        this.conflictDetector.cleanup();
        this.elementWatcher.cleanup();
        this.eventHandler.cleanup();
        this.domChangeHandler.cleanup();
        
        // 성능 통계 정리
        this.performanceStats.clear();
        
        this.isInitialized = false;
        console.log('Z-Index Manager 정리 완료');
    }
}

// 전역 인스턴스 생성 (기존 호환성 유지)
window.zIndexManager = new ZIndexManager();

// 모듈 내보내기
export default ZIndexManager;
