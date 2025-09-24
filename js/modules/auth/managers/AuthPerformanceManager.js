/**
 * 인증 성능 관리자
 * 메모이제이션, 지연 로딩, 가상화, 성능 모니터링을 담당
 * @class AuthPerformanceManager
 * @version 1.0.0
 * @since 2024-12-29
 */
export class AuthPerformanceManager {
    constructor(options = {}) {
        this.options = {
            // 메모이제이션 설정
            enableMemoization: true,
            maxMemoSize: 100,
            memoTTL: 5 * 60 * 1000, // 5분
            
            // 지연 로딩 설정
            enableLazyLoading: true,
            lazyLoadThreshold: 100, // ms
            preloadDistance: 50, // px
            
            // 가상화 설정
            enableVirtualization: true,
            virtualItemHeight: 50, // px
            virtualBufferSize: 10,
            
            // 성능 모니터링
            enableMonitoring: true,
            monitoringInterval: 1000, // ms
            performanceThreshold: 16, // ms (60fps)
            
            ...options
        };
        
        // 메모이제이션 캐시
        this.memoCache = new Map();
        this.memoTimestamps = new Map();
        
        // 성능 메트릭
        this.metrics = {
            renderTimes: [],
            memoryUsage: [],
            networkRequests: [],
            errors: []
        };
        
        // 지연 로딩 큐
        this.lazyLoadQueue = new Set();
        this.lazyLoadObserver = null;
        
        // 가상화 상태
        this.virtualizationState = new Map();
        
        // 성능 모니터링
        this.monitoringInterval = null;
        this.startMonitoring();
    }

    /**
     * 함수를 메모이제이션합니다
     * @param {Function} fn - 메모이제이션할 함수
     * @param {Function} keyGenerator - 캐시 키 생성 함수
     * @param {Object} options - 옵션
     * @returns {Function} 메모이제이션된 함수
     */
    memoize(fn, keyGenerator = null, options = {}) {
        if (!this.options.enableMemoization) {
            return fn;
        }
        
        const {
            ttl = this.options.memoTTL,
            maxSize = this.options.maxMemoSize,
            name = fn.name || 'anonymous'
        } = options;
        
        return (...args) => {
            const key = keyGenerator ? keyGenerator(...args) : this.generateKey(name, args);
            const now = Date.now();
            
            // 캐시에서 확인
            if (this.memoCache.has(key)) {
                const timestamp = this.memoTimestamps.get(key);
                if (now - timestamp < ttl) {
                    return this.memoCache.get(key);
                } else {
                    // 만료된 캐시 삭제
                    this.memoCache.delete(key);
                    this.memoTimestamps.delete(key);
                }
            }
            
            // 함수 실행
            const startTime = performance.now();
            const result = fn(...args);
            const endTime = performance.now();
            
            // 성능 메트릭 기록
            this.recordMetric('functionExecution', {
                name,
                duration: endTime - startTime,
                args: args.length
            });
            
            // 캐시에 저장
            this.setMemoCache(key, result, now, maxSize);
            
            return result;
        };
    }

    /**
     * 컴포넌트를 지연 로딩합니다
     * @param {Function} loader - 컴포넌트 로더 함수
     * @param {Object} options - 옵션
     * @returns {Promise} 컴포넌트 Promise
     */
    lazyLoad(loader, options = {}) {
        if (!this.options.enableLazyLoading) {
            return loader();
        }
        
        const {
            threshold = this.options.lazyLoadThreshold,
            preload = false,
            key = 'default'
        } = options;
        
        return new Promise((resolve, reject) => {
            const loadComponent = async () => {
                try {
                    const startTime = performance.now();
                    const component = await loader();
                    const endTime = performance.now();
                    
                    this.recordMetric('lazyLoad', {
                        key,
                        duration: endTime - startTime,
                        preload
                    });
                    
                    resolve(component);
                } catch (error) {
                    this.recordMetric('lazyLoadError', {
                        key,
                        error: error.message
                    });
                    reject(error);
                }
            };
            
            if (preload) {
                // 즉시 로드
                loadComponent();
            } else {
                // 지연 로드
                setTimeout(loadComponent, threshold);
            }
        });
    }

    /**
     * 가상화된 리스트를 생성합니다
     * @param {Array} items - 아이템 배열
     * @param {Object} options - 옵션
     * @returns {Object} 가상화된 리스트 객체
     */
    virtualizeList(items, options = {}) {
        if (!this.options.enableVirtualization) {
            return {
                items,
                totalHeight: items.length * this.options.virtualItemHeight,
                visibleItems: items,
                startIndex: 0,
                endIndex: items.length - 1
            };
        }
        
        const {
            containerHeight = 400,
            itemHeight = this.options.virtualItemHeight,
            bufferSize = this.options.virtualBufferSize,
            scrollTop = 0
        } = options;
        
        const totalHeight = items.length * itemHeight;
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
        const endIndex = Math.min(items.length - 1, startIndex + visibleCount + bufferSize * 2);
        
        const visibleItems = items.slice(startIndex, endIndex + 1);
        const offsetY = startIndex * itemHeight;
        
        return {
            items: visibleItems,
            totalHeight,
            visibleItems,
            startIndex,
            endIndex,
            offsetY,
            itemHeight
        };
    }

    /**
     * 디바운스된 함수를 생성합니다
     * @param {Function} fn - 디바운스할 함수
     * @param {number} delay - 지연 시간
     * @param {Object} options - 옵션
     * @returns {Function} 디바운스된 함수
     */
    debounce(fn, delay, options = {}) {
        const {
            leading = false,
            trailing = true,
            maxWait = null
        } = options;
        
        let timeoutId = null;
        let maxTimeoutId = null;
        let lastCallTime = 0;
        let lastInvokeTime = 0;
        let lastArgs = null;
        let lastThis = null;
        let result = null;
        
        const invokeFunc = (time) => {
            const args = lastArgs;
            const thisArg = lastThis;
            
            lastArgs = null;
            lastThis = null;
            lastInvokeTime = time;
            result = fn.apply(thisArg, args);
            return result;
        };
        
        const leadingEdge = (time) => {
            lastInvokeTime = time;
            timeoutId = null;
            if (leading) {
                return invokeFunc(time);
            }
        };
        
        const remainingWait = (time) => {
            const timeSinceLastCall = time - lastCallTime;
            const timeSinceLastInvoke = time - lastInvokeTime;
            const timeWaiting = delay - timeSinceLastCall;
            
            return maxWait ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
        };
        
        const shouldInvoke = (time) => {
            const timeSinceLastCall = time - lastCallTime;
            const timeSinceLastInvoke = time - lastInvokeTime;
            
            return (lastCallTime === 0) || (timeSinceLastCall >= delay) || 
                   (timeSinceLastCall < 0) || (maxWait && timeSinceLastInvoke >= maxWait);
        };
        
        const timerExpired = () => {
            const time = Date.now();
            if (shouldInvoke(time)) {
                return trailingEdge(time);
            }
            timeoutId = setTimeout(timerExpired, remainingWait(time));
        };
        
        const trailingEdge = (time) => {
            timeoutId = null;
            if (trailing && lastArgs) {
                return invokeFunc(time);
            }
            lastArgs = null;
            lastThis = null;
            return result;
        };
        
        const cancel = () => {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
            if (maxTimeoutId !== null) {
                clearTimeout(maxTimeoutId);
            }
            lastInvokeTime = 0;
            lastCallTime = 0;
            lastArgs = null;
            lastThis = null;
            timeoutId = null;
            maxTimeoutId = null;
        };
        
        const flush = () => {
            return timeoutId === null ? result : trailingEdge(Date.now());
        };
        
        const debounced = function(...args) {
            const time = Date.now();
            const isInvoking = shouldInvoke(time);
            
            lastArgs = args;
            lastThis = this;
            lastCallTime = time;
            
            if (isInvoking) {
                if (timeoutId === null) {
                    return leadingEdge(lastCallTime);
                }
                if (maxWait) {
                    timeoutId = setTimeout(timerExpired, delay);
                    return invokeFunc(lastCallTime);
                }
            }
            if (timeoutId === null) {
                timeoutId = setTimeout(timerExpired, delay);
            }
            return result;
        };
        
        debounced.cancel = cancel;
        debounced.flush = flush;
        debounced.pending = () => timeoutId !== null;
        
        return debounced;
    }

    /**
     * 스로틀된 함수를 생성합니다
     * @param {Function} fn - 스로틀할 함수
     * @param {number} limit - 제한 시간
     * @param {Object} options - 옵션
     * @returns {Function} 스로틀된 함수
     */
    throttle(fn, limit, options = {}) {
        const {
            leading = true,
            trailing = true
        } = options;
        
        let inThrottle = false;
        let lastResult = null;
        
        return function(...args) {
            if (!inThrottle) {
                if (leading) {
                    lastResult = fn.apply(this, args);
                }
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                    if (trailing) {
                        lastResult = fn.apply(this, args);
                    }
                }, limit);
            }
            return lastResult;
        };
    }

    /**
     * 렌더링 성능을 측정합니다
     * @param {string} name - 측정 이름
     * @param {Function} renderFn - 렌더링 함수
     * @returns {any} 렌더링 결과
     */
    measureRender(name, renderFn) {
        const startTime = performance.now();
        const startMemory = this.getMemoryUsage();
        
        try {
            const result = renderFn();
            
            const endTime = performance.now();
            const endMemory = this.getMemoryUsage();
            
            this.recordMetric('render', {
                name,
                duration: endTime - startTime,
                memoryDelta: endMemory - startMemory,
                timestamp: Date.now()
            });
            
            return result;
        } catch (error) {
            this.recordMetric('renderError', {
                name,
                error: error.message,
                timestamp: Date.now()
            });
            throw error;
        }
    }

    /**
     * 네트워크 요청을 모니터링합니다
     * @param {string} url - 요청 URL
     * @param {Function} requestFn - 요청 함수
     * @returns {Promise} 요청 Promise
     */
    monitorRequest(url, requestFn) {
        const startTime = performance.now();
        const startMemory = this.getMemoryUsage();
        
        return requestFn()
            .then(response => {
                const endTime = performance.now();
                const endMemory = this.getMemoryUsage();
                
                this.recordMetric('networkRequest', {
                    url,
                    duration: endTime - startTime,
                    memoryDelta: endMemory - startMemory,
                    success: true,
                    timestamp: Date.now()
                });
                
                return response;
            })
            .catch(error => {
                const endTime = performance.now();
                
                this.recordMetric('networkRequest', {
                    url,
                    duration: endTime - startTime,
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
                
                throw error;
            });
    }

    /**
     * 성능 메트릭을 기록합니다
     * @param {string} type - 메트릭 타입
     * @param {Object} data - 메트릭 데이터
     */
    recordMetric(type, data) {
        if (!this.options.enableMonitoring) return;
        
        const metric = {
            type,
            data,
            timestamp: Date.now()
        };
        
        this.metrics[type] = this.metrics[type] || [];
        this.metrics[type].push(metric);
        
        // 메트릭 배열 크기 제한
        if (this.metrics[type].length > 1000) {
            this.metrics[type] = this.metrics[type].slice(-500);
        }
    }

    /**
     * 성능 리포트를 생성합니다
     * @param {Object} options - 옵션
     * @returns {Object} 성능 리포트
     */
    generateReport(options = {}) {
        const {
            includeMemory = true,
            includeNetwork = true,
            includeRenders = true,
            timeRange = 5 * 60 * 1000 // 5분
        } = options;
        
        const now = Date.now();
        const cutoff = now - timeRange;
        
        const report = {
            timestamp: now,
            summary: {},
            details: {}
        };
        
        // 렌더링 성능
        if (includeRenders && this.metrics.render) {
            const recentRenders = this.metrics.render.filter(m => m.timestamp > cutoff);
            const durations = recentRenders.map(m => m.data.duration);
            
            report.details.renders = {
                count: recentRenders.length,
                averageDuration: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
                maxDuration: Math.max(...durations, 0),
                minDuration: Math.min(...durations, 0)
            };
        }
        
        // 네트워크 성능
        if (includeNetwork && this.metrics.networkRequest) {
            const recentRequests = this.metrics.networkRequest.filter(m => m.timestamp > cutoff);
            const durations = recentRequests.map(m => m.data.duration);
            const successCount = recentRequests.filter(m => m.data.success).length;
            
            report.details.network = {
                count: recentRequests.length,
                successRate: recentRequests.length ? (successCount / recentRequests.length) * 100 : 0,
                averageDuration: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
                maxDuration: Math.max(...durations, 0),
                minDuration: Math.min(...durations, 0)
            };
        }
        
        // 메모리 사용량
        if (includeMemory) {
            const currentMemory = this.getMemoryUsage();
            report.details.memory = {
                current: currentMemory,
                memoCacheSize: this.memoCache.size,
                memoCacheMemory: this.estimateMemoCacheMemory()
            };
        }
        
        // 요약
        report.summary = {
            overallHealth: this.calculateHealthScore(report.details),
            recommendations: this.generateRecommendations(report.details)
        };
        
        return report;
    }

    // Private methods

    /**
     * 메모이제이션 캐시에 값을 설정합니다
     * @param {string} key - 캐시 키
     * @param {any} value - 값
     * @param {number} timestamp - 타임스탬프
     * @param {number} maxSize - 최대 크기
     */
    setMemoCache(key, value, timestamp, maxSize) {
        // 크기 제한 확인
        if (this.memoCache.size >= maxSize) {
            // 가장 오래된 항목 삭제
            const oldestKey = this.memoCache.keys().next().value;
            this.memoCache.delete(oldestKey);
            this.memoTimestamps.delete(oldestKey);
        }
        
        this.memoCache.set(key, value);
        this.memoTimestamps.set(key, timestamp);
    }

    /**
     * 캐시 키를 생성합니다
     * @param {string} name - 함수 이름
     * @param {Array} args - 인수 배열
     * @returns {string} 캐시 키
     */
    generateKey(name, args) {
        const argsString = JSON.stringify(args);
        return `${name}:${argsString}`;
    }

    /**
     * 메모리 사용량을 가져옵니다
     * @returns {number} 메모리 사용량 (MB)
     */
    getMemoryUsage() {
        if (performance.memory) {
            return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        return 0;
    }

    /**
     * 메모이제이션 캐시 메모리 사용량을 추정합니다
     * @returns {number} 메모리 사용량 (KB)
     */
    estimateMemoCacheMemory() {
        let totalSize = 0;
        for (const [key, value] of this.memoCache.entries()) {
            totalSize += JSON.stringify(key).length;
            totalSize += JSON.stringify(value).length;
        }
        return Math.round(totalSize / 1024);
    }

    /**
     * 건강 점수를 계산합니다
     * @param {Object} details - 상세 데이터
     * @returns {number} 건강 점수 (0-100)
     */
    calculateHealthScore(details) {
        let score = 100;
        
        // 렌더링 성능 점수
        if (details.renders) {
            const avgDuration = details.renders.averageDuration;
            if (avgDuration > this.options.performanceThreshold) {
                score -= Math.min(30, (avgDuration - this.options.performanceThreshold) * 2);
            }
        }
        
        // 네트워크 성능 점수
        if (details.network) {
            const successRate = details.network.successRate;
            score -= (100 - successRate) * 0.5;
        }
        
        // 메모리 사용량 점수
        if (details.memory) {
            const memoMemory = details.memory.memoCacheMemory;
            if (memoMemory > 1000) { // 1MB 이상
                score -= Math.min(20, (memoMemory - 1000) / 100);
            }
        }
        
        return Math.max(0, Math.round(score));
    }

    /**
     * 권장사항을 생성합니다
     * @param {Object} details - 상세 데이터
     * @returns {Array} 권장사항 배열
     */
    generateRecommendations(details) {
        const recommendations = [];
        
        if (details.renders && details.renders.averageDuration > this.options.performanceThreshold) {
            recommendations.push('렌더링 성능이 저하되었습니다. 메모이제이션을 활성화하거나 컴포넌트를 최적화하세요.');
        }
        
        if (details.network && details.network.successRate < 95) {
            recommendations.push('네트워크 요청 실패율이 높습니다. 재시도 로직을 구현하세요.');
        }
        
        if (details.memory && details.memory.memoCacheMemory > 1000) {
            recommendations.push('메모이제이션 캐시가 너무 큽니다. 캐시 크기를 줄이거나 TTL을 단축하세요.');
        }
        
        return recommendations;
    }

    /**
     * 성능 모니터링을 시작합니다
     */
    startMonitoring() {
        if (!this.options.enableMonitoring) return;
        
        this.monitoringInterval = setInterval(() => {
            const memory = this.getMemoryUsage();
            this.recordMetric('memoryUsage', {
                memory,
                timestamp: Date.now()
            });
        }, this.options.monitoringInterval);
    }

    /**
     * 성능 모니터링을 중지합니다
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    /**
     * 리소스를 정리합니다
     */
    cleanup() {
        this.stopMonitoring();
        this.memoCache.clear();
        this.memoTimestamps.clear();
        this.lazyLoadQueue.clear();
        this.virtualizationState.clear();
        
        // 메트릭 초기화
        Object.keys(this.metrics).forEach(key => {
            this.metrics[key] = [];
        });
    }
}
