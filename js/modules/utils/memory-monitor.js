/**
 * 메모리 모니터링 시스템
 * 메모리 사용량 추적, 누수 감지, 성능 최적화를 담당
 * 
 * @version 1.0.0
 * @since 2024-12-29
 * @author REDIPX
 */

export class MemoryMonitor {
    constructor(options = {}) {
        this.options = {
            // 모니터링 설정
            enableMonitoring: true,
            monitoringInterval: 5000, // 5초마다 체크
            enableLeakDetection: true,
            enablePerformanceTracking: true,
            
            // 임계값 설정
            memoryWarningThreshold: 50 * 1024 * 1024, // 50MB
            memoryCriticalThreshold: 100 * 1024 * 1024, // 100MB
            leakDetectionThreshold: 10 * 1024 * 1024, // 10MB 증가
            
            // 로깅 설정
            enableConsoleLogging: true,
            enableDetailedLogging: false,
            logRetentionCount: 100,
            
            ...options
        };
        
        // 메모리 히스토리
        this.memoryHistory = [];
        this.performanceHistory = [];
        
        // 모니터링 상태
        this.isMonitoring = false;
        this.monitoringInterval = null;
        
        // 이벤트 리스너 추적
        this.eventListenerTracker = new Map();
        
        // DOM 요소 추적
        this.domElementTracker = new Map();
        
        // 타이머/인터벌 추적
        this.timerTracker = new Map();
        
        // 메모리 누수 감지
        this.leakDetection = {
            enabled: this.options.enableLeakDetection,
            baseline: null,
            lastCheck: Date.now(),
            suspiciousGrowth: 0
        };
        
        this.init();
    }
    
    /**
     * 메모리 모니터 초기화
     */
    init() {
        if (!this.options.enableMonitoring) {
            return;
        }
        
        // 브라우저 지원 확인
        if (!this.isMemoryAPIEnabled()) {
            console.warn('MemoryMonitor: Performance Memory API가 지원되지 않습니다.');
            return;
        }
        
        // 모니터링 시작
        this.startMonitoring();
        
        // 페이지 언로드 시 정리
        this.setupCleanupOnUnload();
        
        console.log('MemoryMonitor: 메모리 모니터링이 시작되었습니다.');
    }
    
    /**
     * 메모리 API 지원 확인
     * @returns {boolean} 지원 여부
     */
    isMemoryAPIEnabled() {
        return typeof performance !== 'undefined' && 
               performance.memory !== undefined;
    }
    
    /**
     * 메모리 모니터링 시작
     */
    startMonitoring() {
        if (this.isMonitoring) {
            return;
        }
        
        this.isMonitoring = true;
        
        // 초기 메모리 상태 기록
        this.recordMemorySnapshot();
        
        // 주기적 모니터링
        this.monitoringInterval = setInterval(() => {
            this.performMemoryCheck();
        }, this.options.monitoringInterval);
        
        // 성능 모니터링
        if (this.options.enablePerformanceTracking) {
            this.setupPerformanceObserver();
        }
    }
    
    /**
     * 메모리 모니터링 중지
     */
    stopMonitoring() {
        if (!this.isMonitoring) {
            return;
        }
        
        this.isMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        console.log('MemoryMonitor: 메모리 모니터링이 중지되었습니다.');
    }
    
    /**
     * 메모리 체크 수행
     */
    performMemoryCheck() {
        try {
            const memoryInfo = this.getMemoryInfo();
            const performanceInfo = this.getPerformanceInfo();
            
            // 메모리 히스토리에 추가
            this.memoryHistory.push({
                timestamp: Date.now(),
                ...memoryInfo
            });
            
            // 성능 히스토리에 추가
            if (performanceInfo) {
                this.performanceHistory.push({
                    timestamp: Date.now(),
                    ...performanceInfo
                });
            }
            
            // 히스토리 크기 제한
            this.trimHistory();
            
            // 메모리 누수 감지
            if (this.options.enableLeakDetection) {
                this.detectMemoryLeak();
            }
            
            // 임계값 체크
            this.checkMemoryThresholds(memoryInfo);
            
            // 상세 로깅
            if (this.options.enableDetailedLogging) {
                this.logDetailedMemoryInfo(memoryInfo);
            }
            
        } catch (error) {
            console.error('MemoryMonitor: 메모리 체크 중 오류 발생:', error);
        }
    }
    
    /**
     * 메모리 정보 가져오기
     * @returns {Object} 메모리 정보
     */
    getMemoryInfo() {
        if (!this.isMemoryAPIEnabled()) {
            return {
                used: 'N/A',
                total: 'N/A',
                limit: 'N/A',
                available: 'N/A'
            };
        }
        
        const memory = performance.memory;
        return {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
            available: memory.jsHeapSizeLimit - memory.usedJSHeapSize
        };
    }
    
    /**
     * 성능 정보 가져오기
     * @returns {Object|null} 성능 정보
     */
    getPerformanceInfo() {
        try {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (!navigation) {
                return null;
            }
            
            return {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstPaint: this.getFirstPaintTime(),
                firstContentfulPaint: this.getFirstContentfulPaintTime()
            };
        } catch (error) {
            return null;
        }
    }
    
    /**
     * First Paint 시간 가져오기
     * @returns {number} First Paint 시간
     */
    getFirstPaintTime() {
        try {
            const paintEntries = performance.getEntriesByType('paint');
            const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
            return fpEntry ? fpEntry.startTime : 0;
        } catch (error) {
            return 0;
        }
    }
    
    /**
     * First Contentful Paint 시간 가져오기
     * @returns {number} First Contentful Paint 시간
     */
    getFirstContentfulPaintTime() {
        try {
            const paintEntries = performance.getEntriesByType('paint');
            const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            return fcpEntry ? fcpEntry.startTime : 0;
        } catch (error) {
            return 0;
        }
    }
    
    /**
     * 메모리 누수 감지
     */
    detectMemoryLeak() {
        if (this.memoryHistory.length < 2) {
            return;
        }
        
        const current = this.memoryHistory[this.memoryHistory.length - 1];
        const previous = this.memoryHistory[this.memoryHistory.length - 2];
        
        const memoryGrowth = current.used - previous.used;
        
        // 기준선 설정
        if (!this.leakDetection.baseline) {
            this.leakDetection.baseline = current.used;
            return;
        }
        
        // 의심스러운 증가 감지
        if (memoryGrowth > this.options.leakDetectionThreshold) {
            this.leakDetection.suspiciousGrowth++;
            
            if (this.leakDetection.suspiciousGrowth >= 3) {
                this.reportMemoryLeak(current, memoryGrowth);
                this.leakDetection.suspiciousGrowth = 0; // 리셋
            }
        } else {
            this.leakDetection.suspiciousGrowth = Math.max(0, this.leakDetection.suspiciousGrowth - 1);
        }
    }
    
    /**
     * 메모리 누수 보고
     * @param {Object} currentMemory - 현재 메모리 정보
     * @param {number} growth - 메모리 증가량
     */
    reportMemoryLeak(currentMemory, growth) {
        const message = `🚨 메모리 누수 감지: ${this.formatBytes(growth)} 증가 (총 사용량: ${this.formatBytes(currentMemory.used)})`;
        
        if (this.options.enableConsoleLogging) {
            console.warn(message);
        }
        
        // 커스텀 이벤트 발생
        this.dispatchMemoryLeakEvent({
            currentMemory,
            growth,
            message
        });
    }
    
    /**
     * 메모리 임계값 체크
     * @param {Object} memoryInfo - 메모리 정보
     */
    checkMemoryThresholds(memoryInfo) {
        if (memoryInfo.used === 'N/A') {
            return;
        }
        
        if (memoryInfo.used > this.options.memoryCriticalThreshold) {
            this.reportCriticalMemoryUsage(memoryInfo);
        } else if (memoryInfo.used > this.options.memoryWarningThreshold) {
            this.reportMemoryWarning(memoryInfo);
        }
    }
    
    /**
     * 메모리 경고 보고
     * @param {Object} memoryInfo - 메모리 정보
     */
    reportMemoryWarning(memoryInfo) {
        const message = `⚠️ 메모리 사용량 경고: ${this.formatBytes(memoryInfo.used)}`;
        
        if (this.options.enableConsoleLogging) {
            console.warn(message);
        }
        
        this.dispatchMemoryWarningEvent(memoryInfo);
    }
    
    /**
     * 메모리 위험 보고
     * @param {Object} memoryInfo - 메모리 정보
     */
    reportCriticalMemoryUsage(memoryInfo) {
        const message = `🚨 메모리 사용량 위험: ${this.formatBytes(memoryInfo.used)}`;
        
        if (this.options.enableConsoleLogging) {
            console.error(message);
        }
        
        this.dispatchCriticalMemoryEvent(memoryInfo);
    }
    
    /**
     * 이벤트 리스너 추적 시작
     * @param {HTMLElement} element - DOM 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     * @param {string} source - 추적 소스
     */
    trackEventListener(element, event, handler, source = 'unknown') {
        const key = `${element.constructor.name}_${event}_${Date.now()}`;
        
        this.eventListenerTracker.set(key, {
            element,
            event,
            handler,
            source,
            timestamp: Date.now()
        });
        
        return key;
    }
    
    /**
     * 이벤트 리스너 추적 제거
     * @param {string} key - 추적 키
     */
    untrackEventListener(key) {
        return this.eventListenerTracker.delete(key);
    }
    
    /**
     * 타이머 추적 시작
     * @param {number} timerId - 타이머 ID
     * @param {string} type - 타이머 타입 ('timeout' 또는 'interval')
     * @param {string} source - 추적 소스
     */
    trackTimer(timerId, type, source = 'unknown') {
        this.timerTracker.set(timerId, {
            type,
            source,
            timestamp: Date.now()
        });
    }
    
    /**
     * 타이머 추적 제거
     * @param {number} timerId - 타이머 ID
     */
    untrackTimer(timerId) {
        return this.timerTracker.delete(timerId);
    }
    
    /**
     * 메모리 스냅샷 기록
     */
    recordMemorySnapshot() {
        const memoryInfo = this.getMemoryInfo();
        const snapshot = {
            timestamp: Date.now(),
            memory: memoryInfo,
            eventListeners: this.eventListenerTracker.size,
            timers: this.timerTracker.size,
            domElements: this.domElementTracker.size
        };
        
        this.memoryHistory.push(snapshot);
        
        if (this.options.enableConsoleLogging) {
            console.log('📊 메모리 스냅샷:', this.formatMemorySnapshot(snapshot));
        }
    }
    
    /**
     * 히스토리 크기 제한
     */
    trimHistory() {
        if (this.memoryHistory.length > this.options.logRetentionCount) {
            this.memoryHistory = this.memoryHistory.slice(-this.options.logRetentionCount);
        }
        
        if (this.performanceHistory.length > this.options.logRetentionCount) {
            this.performanceHistory = this.performanceHistory.slice(-this.options.logRetentionCount);
        }
    }
    
    /**
     * 상세 메모리 정보 로깅
     * @param {Object} memoryInfo - 메모리 정보
     */
    logDetailedMemoryInfo(memoryInfo) {
        console.log('📊 상세 메모리 정보:', {
            사용량: this.formatBytes(memoryInfo.used),
            총량: this.formatBytes(memoryInfo.total),
            제한: this.formatBytes(memoryInfo.limit),
            사용률: `${((memoryInfo.used / memoryInfo.limit) * 100).toFixed(2)}%`,
            이벤트리스너: this.eventListenerTracker.size,
            타이머: this.timerTracker.size
        });
    }
    
    /**
     * 성능 관찰자 설정
     */
    setupPerformanceObserver() {
        try {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'measure') {
                            this.performanceHistory.push({
                                timestamp: Date.now(),
                                type: 'measure',
                                name: entry.name,
                                duration: entry.duration
                            });
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['measure'] });
            }
        } catch (error) {
            console.warn('MemoryMonitor: PerformanceObserver 설정 실패:', error);
        }
    }
    
    /**
     * 페이지 언로드 시 정리 설정
     */
    setupCleanupOnUnload() {
        window.addEventListener('beforeunload', () => {
            this.recordMemorySnapshot();
            this.stopMonitoring();
        });
    }
    
    /**
     * 메모리 누수 이벤트 발생
     * @param {Object} data - 이벤트 데이터
     */
    dispatchMemoryLeakEvent(data) {
        const event = new CustomEvent('memoryLeak', { detail: data });
        window.dispatchEvent(event);
    }
    
    /**
     * 메모리 경고 이벤트 발생
     * @param {Object} memoryInfo - 메모리 정보
     */
    dispatchMemoryWarningEvent(memoryInfo) {
        const event = new CustomEvent('memoryWarning', { detail: memoryInfo });
        window.dispatchEvent(event);
    }
    
    /**
     * 메모리 위험 이벤트 발생
     * @param {Object} memoryInfo - 메모리 정보
     */
    dispatchCriticalMemoryEvent(memoryInfo) {
        const event = new CustomEvent('criticalMemory', { detail: memoryInfo });
        window.dispatchEvent(event);
    }
    
    /**
     * 바이트를 읽기 쉬운 형식으로 변환
     * @param {number} bytes - 바이트 수
     * @returns {string} 포맷된 문자열
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * 메모리 스냅샷 포맷팅
     * @param {Object} snapshot - 스냅샷 데이터
     * @returns {string} 포맷된 문자열
     */
    formatMemorySnapshot(snapshot) {
        return `메모리: ${this.formatBytes(snapshot.memory.used)}, ` +
               `이벤트리스너: ${snapshot.eventListeners}, ` +
               `타이머: ${snapshot.timers}`;
    }
    
    /**
     * 메모리 통계 가져오기
     * @returns {Object} 메모리 통계
     */
    getMemoryStats() {
        if (this.memoryHistory.length === 0) {
            return null;
        }
        
        const current = this.memoryHistory[this.memoryHistory.length - 1];
        const first = this.memoryHistory[0];
        
        return {
            current: current.memory,
            initial: first.memory,
            growth: current.memory.used - first.memory.used,
            eventListeners: this.eventListenerTracker.size,
            timers: this.timerTracker.size,
            historyLength: this.memoryHistory.length
        };
    }
    
    /**
     * 메모리 모니터 정리
     */
    cleanup() {
        this.stopMonitoring();
        this.memoryHistory = [];
        this.performanceHistory = [];
        this.eventListenerTracker.clear();
        this.domElementTracker.clear();
        this.timerTracker.clear();
        
        console.log('MemoryMonitor: 정리 완료');
    }
}

// 싱글톤 인스턴스 생성
export const memoryMonitor = new MemoryMonitor({
    enableMonitoring: true,
    monitoringInterval: 5000,
    enableLeakDetection: true,
    enableConsoleLogging: true,
    enableDetailedLogging: false
});
