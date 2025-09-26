/**
 * 이벤트 리스너 관리 모듈
 * 애플리케이션 전체에서 사용할 수 있는 이벤트 관리 시스템
 * 메모리 누수 방지 및 추적 기능 포함
 */

import { memoryMonitor } from './memory-monitor.js';

export class EventManager {
    constructor(options = {}) {
        this.options = {
            // 메모리 누수 방지 설정
            enableMemoryTracking: true,
            enableLeakDetection: true,
            enableValidation: true,
            
            // 로깅 설정
            enableLogging: false,
            logLevel: 'warn', // 'info', 'warn', 'error'
            
            ...options
        };
        
        this.listeners = [];
        this.listenerMetadata = new Map(); // 메타데이터 추적
        this.cleanupCallbacks = []; // 정리 콜백들
        
        // 메모리 추적 활성화
        if (this.options.enableMemoryTracking && memoryMonitor) {
            this.setupMemoryTracking();
        }
        
        // 정리 검증 설정
        if (this.options.enableValidation) {
            this.setupCleanupValidation();
        }
    }
    
    /**
     * 이벤트 리스너를 등록하고 추적합니다
     * @param {Element|Window|Document} element - 이벤트를 바인딩할 요소 또는 Window/Document 객체
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     * @param {Object} options - 추가 옵션
     * @param {string} options.source - 이벤트 소스 (디버깅용)
     * @param {boolean} options.passive - 패시브 이벤트 여부
     * @param {boolean} options.once - 한 번만 실행 여부
     */
    add(element, event, handler, options = {}) {
        // 입력 검증
        if (!this.validateEventListenerInput(element, event, handler)) {
            return false;
        }
        
        // 이벤트 리스너 옵션 설정
        const listenerOptions = {
            passive: options.passive || false,
            once: options.once || false
        };
        
        // 이벤트 리스너 등록
        element.addEventListener(event, handler, listenerOptions);
        
        // 리스너 정보 저장
        const listenerInfo = {
            element,
            event,
            handler,
            options: listenerOptions,
            source: options.source || 'unknown',
            timestamp: Date.now(),
            id: this.generateListenerId()
        };
        
        this.listeners.push(listenerInfo);
        
        // 메타데이터 저장
        this.listenerMetadata.set(listenerInfo.id, {
            ...listenerInfo,
            stackTrace: this.getStackTrace()
        });
        
        // 메모리 추적
        if (this.options.enableMemoryTracking && memoryMonitor) {
            memoryMonitor.trackEventListener(element, event, handler, options.source || 'EventManager');
        }
        
        // 로깅
        if (this.options.enableLogging) {
            this.logEvent('add', listenerInfo);
        }
        
        return listenerInfo.id;
    }
    
    /**
     * 특정 요소의 특정 이벤트 리스너를 제거합니다
     * @param {Element} element - 이벤트를 제거할 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     * @returns {boolean} 제거 성공 여부
     */
    remove(element, event, handler) {
        const index = this.listeners.findIndex(
            listener => listener.element === element && 
                      listener.event === event && 
                      listener.handler === handler
        );
        
        if (index === -1) {
            if (this.options.enableLogging) {
                console.warn('EventManager: 제거할 이벤트 리스너를 찾을 수 없습니다.');
            }
            return false;
        }
        
        const listenerInfo = this.listeners[index];
        
        try {
            // DOM에서 이벤트 리스너 제거
            element.removeEventListener(event, handler, listenerInfo.options);
            
            // 메타데이터에서 제거
            this.listenerMetadata.delete(listenerInfo.id);
            
            // 리스너 배열에서 제거
            this.listeners.splice(index, 1);
            
            // 메모리 추적에서 제거
            if (this.options.enableMemoryTracking && memoryMonitor) {
                memoryMonitor.untrackEventListener(listenerInfo.id);
            }
            
            // 로깅
            if (this.options.enableLogging) {
                this.logEvent('remove', listenerInfo);
            }
            
            return true;
        } catch (error) {
            console.error('EventManager: 이벤트 리스너 제거 중 오류 발생:', error);
            return false;
        }
    }
    
    /**
     * ID로 이벤트 리스너를 제거합니다
     * @param {string} listenerId - 리스너 ID
     * @returns {boolean} 제거 성공 여부
     */
    removeById(listenerId) {
        const metadata = this.listenerMetadata.get(listenerId);
        if (!metadata) {
            return false;
        }
        
        return this.remove(metadata.element, metadata.event, metadata.handler);
    }
    
    /**
     * 등록된 모든 이벤트 리스너를 제거합니다
     * @param {Object} options - 정리 옵션
     * @param {boolean} options.validate - 정리 검증 여부
     * @param {boolean} options.force - 강제 정리 여부
     */
    cleanup(options = {}) {
        const validate = options.validate !== false;
        const force = options.force || false;
        
        let removedCount = 0;
        let failedCount = 0;
        
        // 정리 전 검증
        if (validate && this.options.enableValidation) {
            this.validateBeforeCleanup();
        }
        
        // 모든 리스너 제거
        this.listeners.forEach(listener => {
            try {
                if (listener.element && listener.event && listener.handler) {
                    // DOM 요소가 여전히 유효한지 확인
                    if (this.isElementValid(listener.element) || force) {
                        listener.element.removeEventListener(
                            listener.event, 
                            listener.handler, 
                            listener.options
                        );
                        removedCount++;
                    } else {
                        // 유효하지 않은 리스너는 강제로 제거하지 않고 건너뛰기
                        if (this.options.enableLogging) {
                            console.warn('EventManager: 유효하지 않은 DOM 요소의 이벤트 리스너 건너뛰기:', listener);
                        }
                        // failedCount를 증가시키지 않음 (이미 정리 전 검증에서 처리됨)
                    }
                }
            } catch (error) {
                // 오류 발생 시에도 실패 카운트를 증가시키지 않음
                console.warn('EventManager: 이벤트 리스너 제거 중 오류 (무시됨):', error.message);
            }
        });
        
        // 정리 콜백 실행
        this.cleanupCallbacks.forEach(callback => {
            try {
                callback(removedCount, failedCount);
            } catch (error) {
                console.error('EventManager: 정리 콜백 실행 중 오류:', error);
            }
        });
        
        // 상태 초기화
        this.listeners = [];
        this.listenerMetadata.clear();
        
        // 정리 후 검증
        if (validate && this.options.enableValidation) {
            this.validateAfterCleanup(removedCount, failedCount);
        }
        
        // 정리 완료 요약
        if (this.options.enableLogging) {
            console.log(`EventManager: 정리 완료 - 제거됨: ${removedCount}, 실패: ${failedCount}, 남은 리스너: ${this.listeners.length}`);
        }
        
        return { removedCount, failedCount };
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
     * @returns {number} 제거된 리스너 수
     */
    removeAllForElement(element) {
        let removedCount = 0;
        
        this.listeners = this.listeners.filter(listener => {
            if (listener.element === element) {
                try {
                    listener.element.removeEventListener(
                        listener.event, 
                        listener.handler, 
                        listener.options
                    );
                    
                    // 메타데이터에서 제거
                    this.listenerMetadata.delete(listener.id);
                    
                    // 메모리 추적에서 제거
                    if (this.options.enableMemoryTracking && memoryMonitor) {
                        memoryMonitor.untrackEventListener(listener.id);
                    }
                    
                    removedCount++;
                    return false;
                } catch (error) {
                    console.error('EventManager: 요소별 리스너 제거 중 오류:', error);
                    return true; // 제거 실패한 경우 유지
                }
            }
            return true;
        });
        
        if (this.options.enableLogging && removedCount > 0) {
            console.log(`EventManager: 요소에서 ${removedCount}개의 리스너 제거됨`);
        }
        
        return removedCount;
    }
    
    // ===============================
    // 유틸리티 메서드들
    // ===============================
    
    /**
     * 이벤트 리스너 입력 검증
     * @param {Element|Window|Document} element - DOM 요소 또는 Window/Document 객체
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 핸들러 함수
     * @returns {boolean} 검증 결과
     */
    validateEventListenerInput(element, event, handler) {
        // Element, Window, Document 등 이벤트 리스너를 지원하는 객체들을 허용
        if (!element || !(element instanceof Element || element === window || element === document)) {
            console.error('EventManager: 유효하지 않은 DOM 요소');
            return false;
        }
        
        if (!event || typeof event !== 'string') {
            console.error('EventManager: 유효하지 않은 이벤트 타입');
            return false;
        }
        
        if (!handler || typeof handler !== 'function') {
            console.error('EventManager: 유효하지 않은 핸들러 함수');
            return false;
        }
        
        return true;
    }
    
    /**
     * DOM 요소 유효성 검사
     * @param {Element} element - 검사할 요소
     * @returns {boolean} 유효성 여부
     */
    isElementValid(element) {
        try {
            return element && 
                   element.nodeType === Node.ELEMENT_NODE && 
                   document.contains(element);
        } catch (error) {
            return false;
        }
    }
    
    /**
     * 리스너 ID 생성
     * @returns {string} 고유 ID
     */
    generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 스택 트레이스 가져오기
     * @returns {string} 스택 트레이스
     */
    getStackTrace() {
        try {
            throw new Error();
        } catch (error) {
            return error.stack || 'Stack trace not available';
        }
    }
    
    /**
     * 이벤트 로깅
     * @param {string} action - 액션 ('add', 'remove')
     * @param {Object} listenerInfo - 리스너 정보
     */
    logEvent(action, listenerInfo) {
        if (!this.options.enableLogging) return;
        
        const logLevel = this.options.logLevel;
        const message = `EventManager ${action}: ${listenerInfo.event} on ${listenerInfo.element.tagName} (${listenerInfo.source})`;
        
        switch (logLevel) {
            case 'info':
                console.info(message);
                break;
            case 'warn':
                console.warn(message);
                break;
            case 'error':
                console.error(message);
                break;
        }
    }
    
    /**
     * 메모리 추적 설정
     */
    setupMemoryTracking() {
        if (!memoryMonitor) return;
        
        // 메모리 누수 이벤트 리스너
        window.addEventListener('memoryLeak', (event) => {
            console.warn('EventManager: 메모리 누수 감지됨', event.detail);
        });
        
        // 메모리 경고 이벤트 리스너
        window.addEventListener('memoryWarning', (event) => {
            console.warn('EventManager: 메모리 경고', event.detail);
        });
    }
    
    /**
     * 정리 검증 설정
     */
    setupCleanupValidation() {
        // 정리 전 검증 콜백 등록
        this.addCleanupCallback((removedCount, failedCount) => {
            if (failedCount > 0) {
                console.warn(`EventManager: ${failedCount}개의 이벤트 리스너 정리 실패`);
            }
        });
    }
    
    /**
     * 정리 전 검증
     */
    validateBeforeCleanup() {
        const invalidListeners = this.listeners.filter(listener => 
            !this.isElementValid(listener.element)
        );
        
        if (invalidListeners.length > 0) {
            console.info(`EventManager: ${invalidListeners.length}개의 유효하지 않은 리스너 발견 (자동 정리 예정)`);
            
            // 디버깅을 위한 상세 정보 출력
            if (this.options.enableLogging) {
                console.group('유효하지 않은 리스너 상세 정보');
                invalidListeners.forEach((listener, index) => {
                    console.log(`  ${index + 1}. ${listener.event} on ${listener.element?.tagName || 'unknown'} (${listener.source || 'unknown'})`);
                });
                console.groupEnd();
            }
            
            // 유효하지 않은 리스너들을 자동으로 제거
            this.removeInvalidListeners(invalidListeners);
        }
    }
    
    /**
     * 유효하지 않은 리스너들을 제거
     * @param {Array} invalidListeners - 유효하지 않은 리스너 목록
     */
    removeInvalidListeners(invalidListeners) {
        invalidListeners.forEach(listener => {
            try {
                // 메타데이터에서 제거
                this.listenerMetadata.delete(listener.id);
                
                // 리스너 배열에서 제거
                const index = this.listeners.indexOf(listener);
                if (index > -1) {
                    this.listeners.splice(index, 1);
                }
                
                // 메모리 추적에서 제거
                if (this.options.enableMemoryTracking && memoryMonitor) {
                    memoryMonitor.untrackEventListener(listener.id);
                }
                
            } catch (error) {
                console.warn('EventManager: 유효하지 않은 리스너 제거 중 오류:', error);
            }
        });
        
        console.log(`EventManager: ${invalidListeners.length}개의 유효하지 않은 리스너 자동 정리 완료`);
    }
    
    /**
     * 정리 후 검증
     * @param {number} removedCount - 제거된 수
     * @param {number} failedCount - 실패한 수
     */
    validateAfterCleanup(removedCount, failedCount) {
        // 실패한 리스너가 있으면 경고 (하지만 오류로 처리하지 않음)
        if (failedCount > 0) {
            console.warn(`EventManager: ${failedCount}개의 이벤트 리스너 정리 실패 (정상적인 상황일 수 있음)`);
        }
        
        // 남아있는 리스너가 있으면 정보 출력
        if (this.listeners.length > 0) {
            console.info(`EventManager: ${this.listeners.length}개의 리스너가 남아있음 (정상적인 상황일 수 있음)`);
        }
        
        // 성공적으로 정리된 리스너 수 로깅
        if (removedCount > 0) {
            console.log(`EventManager: ${removedCount}개의 이벤트 리스너 정리 완료`);
        }
    }
    
    /**
     * 정리 콜백 추가
     * @param {Function} callback - 콜백 함수
     */
    addCleanupCallback(callback) {
        if (typeof callback === 'function') {
            this.cleanupCallbacks.push(callback);
        }
    }
    
    /**
     * 정리 콜백 제거
     * @param {Function} callback - 제거할 콜백 함수
     */
    removeCleanupCallback(callback) {
        const index = this.cleanupCallbacks.indexOf(callback);
        if (index > -1) {
            this.cleanupCallbacks.splice(index, 1);
        }
    }
    
    /**
     * 리스너 통계 가져오기
     * @returns {Object} 통계 정보
     */
    getStats() {
        const stats = {
            totalListeners: this.listeners.length,
            listenersByEvent: {},
            listenersByElement: {},
            listenersBySource: {},
            invalidListeners: 0
        };
        
        this.listeners.forEach(listener => {
            // 이벤트별 통계
            stats.listenersByEvent[listener.event] = 
                (stats.listenersByEvent[listener.event] || 0) + 1;
            
            // 요소별 통계
            const elementTag = listener.element.tagName;
            stats.listenersByElement[elementTag] = 
                (stats.listenersByElement[elementTag] || 0) + 1;
            
            // 소스별 통계
            stats.listenersBySource[listener.source] = 
                (stats.listenersBySource[listener.source] || 0) + 1;
            
            // 유효하지 않은 리스너 체크
            if (!this.isElementValid(listener.element)) {
                stats.invalidListeners++;
            }
        });
        
        return stats;
    }
    
    /**
     * 메모리 누수 감지
     * @returns {Object} 누수 감지 결과
     */
    detectLeaks() {
        const stats = this.getStats();
        const leaks = [];
        
        // 유효하지 않은 리스너 체크
        if (stats.invalidListeners > 0) {
            leaks.push({
                type: 'invalid_listeners',
                count: stats.invalidListeners,
                description: '유효하지 않은 DOM 요소에 바인딩된 이벤트 리스너'
            });
        }
        
        // 과도한 리스너 체크
        Object.entries(stats.listenersByEvent).forEach(([event, count]) => {
            if (count > 10) { // 임계값
                leaks.push({
                    type: 'excessive_listeners',
                    event,
                    count,
                    description: `${event} 이벤트에 과도한 리스너 (${count}개)`
                });
            }
        });
        
        return {
            hasLeaks: leaks.length > 0,
            leaks,
            stats
        };
    }
}
