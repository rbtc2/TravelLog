/**
 * Performance Utils - 성능 최적화 유틸리티 모듈
 * 
 * 이 모듈은 Z-Index Manager의 성능을 최적화하기 위한
 * 다양한 유틸리티 함수들을 제공합니다.
 * 
 * 주요 기능:
 * - 디바운스/스로틀 함수
 * - 메모리 관리 유틸리티
 * - 성능 모니터링
 * - 캐싱 유틸리티
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

export class PerformanceUtils {
    /**
     * 디바운스 함수
     * @param {Function} func - 실행할 함수
     * @param {number} delay - 지연 시간 (ms)
     * @param {Object} options - 옵션
     * @returns {Function} 디바운스된 함수
     */
    static debounce(func, delay, options = {}) {
        const { leading = false, trailing = true, maxWait } = options;
        let timeoutId;
        let maxTimeoutId;
        let lastCallTime;
        let lastInvokeTime = 0;
        let lastArgs;
        let lastThis;
        let result;
        
        function invokeFunc(time) {
            const args = lastArgs;
            const thisArg = lastThis;
            
            lastArgs = lastThis = undefined;
            lastInvokeTime = time;
            result = func.apply(thisArg, args);
            return result;
        }
        
        function leadingEdge(time) {
            lastInvokeTime = time;
            timeoutId = setTimeout(timerExpired, delay);
            return leading ? invokeFunc(time) : result;
        }
        
        function remainingWait(time) {
            const timeSinceLastCall = time - lastCallTime;
            const timeSinceLastInvoke = time - lastInvokeTime;
            const timeWaiting = delay - timeSinceLastCall;
            
            return maxWait ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
        }
        
        function shouldInvoke(time) {
            const timeSinceLastCall = time - lastCallTime;
            const timeSinceLastInvoke = time - lastInvokeTime;
            
            return (lastCallTime === undefined || (timeSinceLastCall >= delay) ||
                    (timeSinceLastCall < 0) || (maxWait !== undefined && timeSinceLastInvoke >= maxWait));
        }
        
        function timerExpired() {
            const time = Date.now();
            if (shouldInvoke(time)) {
                return trailingEdge(time);
            }
            timeoutId = setTimeout(timerExpired, remainingWait(time));
        }
        
        function trailingEdge(time) {
            timeoutId = undefined;
            if (trailing && lastArgs) {
                return invokeFunc(time);
            }
            lastArgs = lastThis = undefined;
            return result;
        }
        
        function cancel() {
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
            lastInvokeTime = 0;
            lastArgs = lastCallTime = lastThis = timeoutId = undefined;
        }
        
        function flush() {
            return timeoutId === undefined ? result : trailingEdge(Date.now());
        }
        
        function pending() {
            return timeoutId !== undefined;
        }
        
        function debounced(...args) {
            const time = Date.now();
            const isInvoking = shouldInvoke(time);
            
            lastArgs = args;
            lastThis = this;
            lastCallTime = time;
            
            if (isInvoking) {
                if (timeoutId === undefined) {
                    return leadingEdge(lastCallTime);
                }
                if (maxWait) {
                    timeoutId = setTimeout(timerExpired, delay);
                    return invokeFunc(lastCallTime);
                }
            }
            if (timeoutId === undefined) {
                timeoutId = setTimeout(timerExpired, delay);
            }
            return result;
        }
        
        debounced.cancel = cancel;
        debounced.flush = flush;
        debounced.pending = pending;
        
        return debounced;
    }
    
    /**
     * 스로틀 함수
     * @param {Function} func - 실행할 함수
     * @param {number} limit - 제한 시간 (ms)
     * @param {Object} options - 옵션
     * @returns {Function} 스로틀된 함수
     */
    static throttle(func, limit, options = {}) {
        const { leading = true, trailing = true } = options;
        return PerformanceUtils.debounce(func, limit, {
            leading,
            trailing,
            maxWait: limit
        });
    }
    
    /**
     * 메모리 사용량 모니터링
     * @returns {Object|null} 메모리 사용량 정보
     */
    static getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }
    
    /**
     * 성능 측정
     * @param {string} name - 측정 이름
     * @param {Function} fn - 측정할 함수
     * @returns {*} 함수 실행 결과
     */
    static measure(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    }
    
    /**
     * 비동기 성능 측정
     * @param {string} name - 측정 이름
     * @param {Function} fn - 측정할 함수
     * @returns {Promise} 함수 실행 결과
     */
    static async measureAsync(name, fn) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        
        console.log(`${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    }
    
    /**
     * 간단한 캐시 클래스
     */
    static createCache(maxSize = 100, ttl = 60000) {
        const cache = new Map();
        const timestamps = new Map();
        
        return {
            get(key) {
                const timestamp = timestamps.get(key);
                if (timestamp && Date.now() - timestamp > ttl) {
                    cache.delete(key);
                    timestamps.delete(key);
                    return undefined;
                }
                return cache.get(key);
            },
            
            set(key, value) {
                if (cache.size >= maxSize) {
                    const firstKey = cache.keys().next().value;
                    cache.delete(firstKey);
                    timestamps.delete(firstKey);
                }
                cache.set(key, value);
                timestamps.set(key, Date.now());
            },
            
            has(key) {
                return this.get(key) !== undefined;
            },
            
            delete(key) {
                cache.delete(key);
                timestamps.delete(key);
            },
            
            clear() {
                cache.clear();
                timestamps.clear();
            },
            
            size() {
                return cache.size;
            }
        };
    }
    
    /**
     * 배치 처리 유틸리티
     * @param {Array} items - 처리할 아이템들
     * @param {Function} processor - 처리 함수
     * @param {number} batchSize - 배치 크기
     * @param {number} delay - 배치 간 지연 시간
     * @returns {Promise} 처리 결과
     */
    static async processBatch(items, processor, batchSize = 10, delay = 0) {
        const results = [];
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(item => processor(item))
            );
            results.push(...batchResults);
            
            if (delay > 0 && i + batchSize < items.length) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        return results;
    }
    
    /**
     * 프레임 기반 실행
     * @param {Function} fn - 실행할 함수
     * @returns {Promise} 실행 결과
     */
    static frame(fn) {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                const result = fn();
                resolve(result);
            });
        });
    }
    
    /**
     * 다중 프레임 기반 실행
     * @param {Function} fn - 실행할 함수
     * @param {number} frames - 프레임 수
     * @returns {Promise} 실행 결과
     */
    static multiFrame(fn, frames = 2) {
        return new Promise(resolve => {
            let currentFrame = 0;
            
            const execute = () => {
                if (currentFrame < frames) {
                    currentFrame++;
                    requestAnimationFrame(execute);
                } else {
                    const result = fn();
                    resolve(result);
                }
            };
            
            requestAnimationFrame(execute);
        });
    }
    
    /**
     * 성능 통계 수집
     */
    static createPerformanceStats() {
        const stats = {
            measurements: [],
            memorySnapshots: [],
            startTime: Date.now()
        };
        
        return {
            measure(name, fn) {
                const start = performance.now();
                const result = fn();
                const end = performance.now();
                
                stats.measurements.push({
                    name,
                    duration: end - start,
                    timestamp: Date.now()
                });
                
                return result;
            },
            
            takeMemorySnapshot() {
                const memory = PerformanceUtils.getMemoryUsage();
                if (memory) {
                    stats.memorySnapshots.push({
                        ...memory,
                        timestamp: Date.now()
                    });
                }
            },
            
            getStats() {
                return {
                    ...stats,
                    totalDuration: Date.now() - stats.startTime,
                    averageMeasurement: stats.measurements.length > 0 ?
                        stats.measurements.reduce((sum, m) => sum + m.duration, 0) / stats.measurements.length : 0
                };
            },
            
            clear() {
                stats.measurements = [];
                stats.memorySnapshots = [];
                stats.startTime = Date.now();
            }
        };
    }
}
