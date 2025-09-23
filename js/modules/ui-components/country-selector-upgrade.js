/**
 * Country Selector Upgrade - 기존 Country Selector를 Portal 시스템으로 업그레이드
 * 
 * 기존 Country Selector를 자동으로 감지하고 Portal 시스템으로 업그레이드하여
 * Stacking Context 격리 문제를 해결합니다.
 * 
 * 주요 기능:
 * - 기존 Country Selector 자동 감지
 * - Portal 시스템으로 자동 업그레이드
 * - 기존 이벤트 핸들러 보존
 * - 점진적 마이그레이션 지원
 * - 성능 최적화
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

import CountrySelectorPortal from './country-selector-portal.js';
import StackingContextDebugger from '../utils/stacking-context-debugger.js';

class CountrySelectorUpgrade {
    constructor() {
        this.upgradedSelectors = new Map();
        this.isInitialized = false;
        this.observer = null;
        
        // 업그레이드 옵션
        this.options = {
            autoUpgrade: true,
            preserveOriginalEvents: true,
            debugMode: false,
            upgradeDelay: 100
        };
        
        this.init();
    }
    
    /**
     * Country Selector Upgrade 초기화
     */
    async init() {
        try {
            console.log('Country Selector Upgrade 초기화 시작...');
            
            // 기존 Country Selector 스캔
            await this.scanExistingSelectors();
            
            // 자동 업그레이드 설정
            if (this.options.autoUpgrade) {
                this.setupAutoUpgrade();
            }
            
            this.isInitialized = true;
            console.log('Country Selector Upgrade 초기화 완료');
            
        } catch (error) {
            console.error('Country Selector Upgrade 초기화 실패:', error);
            throw error;
        }
    }
    
    /**
     * 기존 Country Selector 스캔
     * @async
     */
    async scanExistingSelectors() {
        const selectors = document.querySelectorAll('.country-selector, .country-selector-v2');
        
        console.log(`${selectors.length}개의 Country Selector 발견`);
        
        for (const selector of selectors) {
            await this.upgradeSelector(selector);
        }
    }
    
    /**
     * 자동 업그레이드 설정
     */
    setupAutoUpgrade() {
        // MutationObserver로 새로운 Country Selector 감지
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.checkAndUpgradeNode(node);
                    }
                });
            });
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('자동 업그레이드 시스템 활성화');
    }
    
    /**
     * 노드 확인 및 업그레이드
     * @param {HTMLElement} node - 확인할 노드
     */
    checkAndUpgradeNode(node) {
        // 직접 Country Selector인 경우
        if (node.classList.contains('country-selector') || 
            node.classList.contains('country-selector-v2')) {
            this.upgradeSelector(node);
            return;
        }
        
        // 하위에 Country Selector가 있는 경우
        const selectors = node.querySelectorAll('.country-selector, .country-selector-v2');
        selectors.forEach(selector => {
            this.upgradeSelector(selector);
        });
    }
    
    /**
     * Country Selector 업그레이드
     * @param {HTMLElement} selectorElement - 업그레이드할 Selector 요소
     * @async
     */
    async upgradeSelector(selectorElement) {
        try {
            // 이미 업그레이드된 경우 스킵
            if (this.upgradedSelectors.has(selectorElement)) {
                return;
            }
            
            console.log('Country Selector 업그레이드 시작:', selectorElement);
            
            // 고유 ID 생성
            const selectorId = selectorElement.id || `country-selector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            selectorElement.id = selectorId;
            
            // 기존 이벤트 핸들러 보존
            const originalHandlers = this.preserveOriginalHandlers(selectorElement);
            
            // Portal 시스템으로 업그레이드
            const portalInstance = new CountrySelectorPortal(selectorId, {
                preserveOriginalEvents: this.options.preserveOriginalEvents,
                debugMode: this.options.debugMode
            });
            
            // 업그레이드 정보 저장
            this.upgradedSelectors.set(selectorElement, {
                portalInstance,
                originalHandlers,
                upgradedAt: Date.now(),
                selectorId
            });
            
            // 업그레이드 완료 이벤트 발생
            this.dispatchUpgradeEvent(selectorElement, 'upgraded');
            
            console.log('Country Selector 업그레이드 완료:', selectorId);
            
        } catch (error) {
            console.error('Country Selector 업그레이드 실패:', error);
            this.dispatchUpgradeEvent(selectorElement, 'failed', error);
        }
    }
    
    /**
     * 기존 이벤트 핸들러 보존
     * @param {HTMLElement} selectorElement - Selector 요소
     * @returns {Object} 보존된 핸들러 정보
     */
    preserveOriginalHandlers(selectorElement) {
        const handlers = {
            input: [],
            button: [],
            dropdown: []
        };
        
        // 입력 필드 핸들러 보존
        const inputElement = selectorElement.querySelector('input');
        if (inputElement) {
            // 기존 이벤트 리스너는 직접 접근할 수 없으므로
            // 커스텀 이벤트를 통해 보존
            handlers.input.push({
                element: inputElement,
                events: ['focus', 'blur', 'input', 'keydown']
            });
        }
        
        // 버튼 핸들러 보존
        const buttonElement = selectorElement.querySelector('.dropdown-arrow');
        if (buttonElement) {
            handlers.button.push({
                element: buttonElement,
                events: ['click']
            });
        }
        
        // 드롭다운 핸들러 보존
        const dropdownElement = selectorElement.querySelector('.selector-dropdown');
        if (dropdownElement) {
            handlers.dropdown.push({
                element: dropdownElement,
                events: ['click', 'mouseenter', 'mouseleave']
            });
        }
        
        return handlers;
    }
    
    /**
     * 업그레이드 이벤트 발생
     * @param {HTMLElement} selectorElement - Selector 요소
     * @param {string} status - 업그레이드 상태
     * @param {Error} error - 에러 정보 (실패 시)
     */
    dispatchUpgradeEvent(selectorElement, status, error = null) {
        const event = new CustomEvent('country-selector-upgrade', {
            detail: {
                element: selectorElement,
                status,
                error,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * 특정 Selector 업그레이드
     * @param {string} selectorId - Selector ID
     * @returns {Promise<boolean>} 업그레이드 성공 여부
     */
    async upgradeById(selectorId) {
        const selectorElement = document.getElementById(selectorId);
        if (!selectorElement) {
            console.warn(`Selector not found: ${selectorId}`);
            return false;
        }
        
        await this.upgradeSelector(selectorElement);
        return true;
    }
    
    /**
     * 특정 Selector 업그레이드 해제
     * @param {string} selectorId - Selector ID
     * @returns {boolean} 해제 성공 여부
     */
    downgradeById(selectorId) {
        const selectorElement = document.getElementById(selectorId);
        if (!selectorElement) {
            console.warn(`Selector not found: ${selectorId}`);
            return false;
        }
        
        const upgradeInfo = this.upgradedSelectors.get(selectorElement);
        if (!upgradeInfo) {
            console.warn(`Selector not upgraded: ${selectorId}`);
            return false;
        }
        
        try {
            // Portal 인스턴스 정리
            upgradeInfo.portalInstance.cleanup();
            
            // 업그레이드 정보 제거
            this.upgradedSelectors.delete(selectorElement);
            
            // 다운그레이드 이벤트 발생
            this.dispatchUpgradeEvent(selectorElement, 'downgraded');
            
            console.log('Country Selector 다운그레이드 완료:', selectorId);
            return true;
            
        } catch (error) {
            console.error('Country Selector 다운그레이드 실패:', error);
            return false;
        }
    }
    
    /**
     * 모든 Selector 업그레이드 해제
     */
    downgradeAll() {
        const selectorIds = Array.from(this.upgradedSelectors.keys()).map(el => el.id);
        
        selectorIds.forEach(selectorId => {
            this.downgradeById(selectorId);
        });
        
        console.log('모든 Country Selector 다운그레이드 완료');
    }
    
    /**
     * 업그레이드 상태 확인
     * @param {string} selectorId - Selector ID
     * @returns {Object|null} 업그레이드 정보
     */
    getUpgradeStatus(selectorId) {
        const selectorElement = document.getElementById(selectorId);
        if (!selectorElement) {
            return null;
        }
        
        const upgradeInfo = this.upgradedSelectors.get(selectorElement);
        if (!upgradeInfo) {
            return { upgraded: false };
        }
        
        return {
            upgraded: true,
            upgradedAt: upgradeInfo.upgradedAt,
            selectorId: upgradeInfo.selectorId,
            portalInstance: upgradeInfo.portalInstance
        };
    }
    
    /**
     * 모든 업그레이드 상태 확인
     * @returns {Array} 업그레이드 상태 배열
     */
    getAllUpgradeStatus() {
        const statuses = [];
        
        this.upgradedSelectors.forEach((upgradeInfo, selectorElement) => {
            statuses.push({
                selectorId: upgradeInfo.selectorId,
                element: selectorElement,
                upgradedAt: upgradeInfo.upgradedAt,
                isOpen: upgradeInfo.portalInstance.isOpen
            });
        });
        
        return statuses;
    }
    
    /**
     * 디버그 모드 토글
     * @param {boolean} enabled - 디버그 모드 활성화 여부
     */
    setDebugMode(enabled) {
        this.options.debugMode = enabled;
        
        // 모든 업그레이드된 Selector에 디버그 모드 적용
        this.upgradedSelectors.forEach((upgradeInfo) => {
            if (upgradeInfo.portalInstance.setDebugMode) {
                upgradeInfo.portalInstance.setDebugMode(enabled);
            }
        });
        
        console.log(`디버그 모드 ${enabled ? '활성화' : '비활성화'}`);
    }
    
    /**
     * 자동 업그레이드 토글
     * @param {boolean} enabled - 자동 업그레이드 활성화 여부
     */
    setAutoUpgrade(enabled) {
        this.options.autoUpgrade = enabled;
        
        if (enabled && !this.observer) {
            this.setupAutoUpgrade();
        } else if (!enabled && this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        console.log(`자동 업그레이드 ${enabled ? '활성화' : '비활성화'}`);
    }
    
    /**
     * 성능 분석
     * @returns {Object} 성능 분석 결과
     */
    analyzePerformance() {
        const startTime = performance.now();
        
        const analysis = {
            totalSelectors: document.querySelectorAll('.country-selector, .country-selector-v2').length,
            upgradedSelectors: this.upgradedSelectors.size,
            upgradeRate: 0,
            averageUpgradeTime: 0,
            memoryUsage: 0
        };
        
        // 업그레이드 비율 계산
        if (analysis.totalSelectors > 0) {
            analysis.upgradeRate = (analysis.upgradedSelectors / analysis.totalSelectors) * 100;
        }
        
        // 평균 업그레이드 시간 계산
        const upgradeTimes = Array.from(this.upgradedSelectors.values())
            .map(info => Date.now() - info.upgradedAt);
        
        if (upgradeTimes.length > 0) {
            analysis.averageUpgradeTime = upgradeTimes.reduce((a, b) => a + b, 0) / upgradeTimes.length;
        }
        
        // 메모리 사용량 확인
        if (performance.memory) {
            analysis.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        
        const endTime = performance.now();
        analysis.analysisTime = endTime - startTime;
        
        console.log('Country Selector Upgrade 성능 분석:', analysis);
        
        return analysis;
    }
    
    /**
     * 리소스 정리
     */
    cleanup() {
        // 모든 업그레이드된 Selector 정리
        this.downgradeAll();
        
        // MutationObserver 정리
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        // 데이터 정리
        this.upgradedSelectors.clear();
        
        console.log('Country Selector Upgrade 정리 완료');
    }
}

// 전역 인스턴스 생성
window.countrySelectorUpgrade = new CountrySelectorUpgrade();

// 모듈 내보내기
export default CountrySelectorUpgrade;
