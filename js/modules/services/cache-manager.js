/**
 * CacheManager - 캐싱 로직을 중앙화하여 관리
 * 
 * 🎯 책임:
 * - 다양한 캐시 데이터 관리
 * - 캐시 무효화 처리
 * - 데이터 해시 기반 캐시 유효성 검증
 * - 메모리 효율적인 캐시 관리
 * 
 * @class CacheManager
 * @version 1.0.0
 * @since 2024-12-29
 */
class CacheManager {
    constructor() {
        this.caches = new Map();
        this.maxCacheSize = 50; // 최대 캐시 항목 수
        this.defaultTTL = 5 * 60 * 1000; // 5분 (밀리초)
    }

    /**
     * 캐시에 데이터를 저장합니다
     * @param {string} key - 캐시 키
     * @param {*} data - 저장할 데이터
     * @param {string} dataHash - 데이터 해시 (선택사항)
     * @param {number} ttl - TTL (Time To Live) in milliseconds (선택사항)
     */
    set(key, data, dataHash = null, ttl = null) {
        try {
            const now = Date.now();
            const cacheItem = {
                data: data,
                dataHash: dataHash,
                timestamp: now,
                ttl: ttl || this.defaultTTL,
                accessCount: 0,
                lastAccessed: now
            };

            // 캐시 크기 제한 확인
            if (this.caches.size >= this.maxCacheSize) {
                this._evictLeastRecentlyUsed();
            }

            this.caches.set(key, cacheItem);
        } catch (error) {
            console.error('캐시 저장 실패:', error);
        }
    }

    /**
     * 캐시에서 데이터를 조회합니다
     * @param {string} key - 캐시 키
     * @param {string} dataHash - 데이터 해시 (선택사항)
     * @returns {*} 캐시된 데이터 또는 null
     */
    get(key, dataHash = null) {
        try {
            const cacheItem = this.caches.get(key);
            
            if (!cacheItem) {
                return null;
            }

            // TTL 확인
            const now = Date.now();
            if (now - cacheItem.timestamp > cacheItem.ttl) {
                this.caches.delete(key);
                return null;
            }

            // 데이터 해시 확인 (제공된 경우)
            if (dataHash && cacheItem.dataHash !== dataHash) {
                this.caches.delete(key);
                return null;
            }

            // 접근 정보 업데이트
            cacheItem.accessCount++;
            cacheItem.lastAccessed = now;

            return cacheItem.data;
        } catch (error) {
            console.error('캐시 조회 실패:', error);
            return null;
        }
    }

    /**
     * 특정 키의 캐시를 무효화합니다
     * @param {string} key - 캐시 키
     */
    invalidate(key) {
        try {
            this.caches.delete(key);
        } catch (error) {
            console.error('캐시 무효화 실패:', error);
        }
    }

    /**
     * 특정 패턴과 일치하는 캐시들을 무효화합니다
     * @param {string} pattern - 정규식 패턴 또는 문자열
     */
    invalidatePattern(pattern) {
        try {
            const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
            
            for (const key of this.caches.keys()) {
                if (regex.test(key)) {
                    this.caches.delete(key);
                }
            }
        } catch (error) {
            console.error('패턴 기반 캐시 무효화 실패:', error);
        }
    }

    /**
     * 모든 캐시를 무효화합니다
     */
    invalidateAll() {
        try {
            this.caches.clear();
        } catch (error) {
            console.error('전체 캐시 무효화 실패:', error);
        }
    }

    /**
     * 만료된 캐시들을 정리합니다
     */
    cleanup() {
        try {
            const now = Date.now();
            const expiredKeys = [];

            for (const [key, cacheItem] of this.caches.entries()) {
                if (now - cacheItem.timestamp > cacheItem.ttl) {
                    expiredKeys.push(key);
                }
            }

            expiredKeys.forEach(key => this.caches.delete(key));
        } catch (error) {
            console.error('캐시 정리 실패:', error);
        }
    }

    /**
     * 캐시 통계를 반환합니다
     * @returns {Object} 캐시 통계 정보
     */
    getStats() {
        try {
            const now = Date.now();
            let totalAccessCount = 0;
            let validCacheCount = 0;

            for (const cacheItem of this.caches.values()) {
                totalAccessCount += cacheItem.accessCount;
                
                if (now - cacheItem.timestamp <= cacheItem.ttl) {
                    validCacheCount++;
                }
            }

            return {
                totalCaches: this.caches.size,
                validCaches: validCacheCount,
                totalAccessCount: totalAccessCount,
                maxCacheSize: this.maxCacheSize,
                memoryUsage: this._estimateMemoryUsage()
            };
        } catch (error) {
            console.error('캐시 통계 조회 실패:', error);
            return {
                totalCaches: 0,
                validCaches: 0,
                totalAccessCount: 0,
                maxCacheSize: this.maxCacheSize,
                memoryUsage: 0
            };
        }
    }

    /**
     * LRU (Least Recently Used) 방식으로 캐시를 제거합니다
     * @private
     */
    _evictLeastRecentlyUsed() {
        try {
            let oldestKey = null;
            let oldestTime = Date.now();

            for (const [key, cacheItem] of this.caches.entries()) {
                if (cacheItem.lastAccessed < oldestTime) {
                    oldestTime = cacheItem.lastAccessed;
                    oldestKey = key;
                }
            }

            if (oldestKey) {
                this.caches.delete(oldestKey);
            }
        } catch (error) {
            console.error('LRU 캐시 제거 실패:', error);
        }
    }

    /**
     * 메모리 사용량을 추정합니다
     * @returns {number} 추정 메모리 사용량 (바이트)
     * @private
     */
    _estimateMemoryUsage() {
        try {
            let totalSize = 0;
            
            for (const [key, cacheItem] of this.caches.entries()) {
                // 키 크기
                totalSize += key.length * 2; // 문자열은 2바이트 per character
                
                // 캐시 아이템 크기 추정
                totalSize += JSON.stringify(cacheItem).length * 2;
            }
            
            return totalSize;
        } catch (error) {
            console.error('메모리 사용량 추정 실패:', error);
            return 0;
        }
    }

    /**
     * 캐시가 존재하는지 확인합니다
     * @param {string} key - 캐시 키
     * @returns {boolean} 캐시 존재 여부
     */
    has(key) {
        try {
            const cacheItem = this.caches.get(key);
            if (!cacheItem) return false;

            // TTL 확인
            const now = Date.now();
            if (now - cacheItem.timestamp > cacheItem.ttl) {
                this.caches.delete(key);
                return false;
            }

            return true;
        } catch (error) {
            console.error('캐시 존재 확인 실패:', error);
            return false;
        }
    }

    /**
     * 캐시 키 목록을 반환합니다
     * @returns {Array} 캐시 키 배열
     */
    getKeys() {
        try {
            return Array.from(this.caches.keys());
        } catch (error) {
            console.error('캐시 키 목록 조회 실패:', error);
            return [];
        }
    }

    /**
     * 캐시 설정을 업데이트합니다
     * @param {Object} config - 설정 객체
     */
    updateConfig(config) {
        try {
            if (config.maxCacheSize !== undefined) {
                this.maxCacheSize = Math.max(1, config.maxCacheSize);
            }
            if (config.defaultTTL !== undefined) {
                this.defaultTTL = Math.max(1000, config.defaultTTL); // 최소 1초
            }
        } catch (error) {
            console.error('캐시 설정 업데이트 실패:', error);
        }
    }

    /**
     * 캐시 매니저 정리
     */
    destroy() {
        try {
            this.caches.clear();
        } catch (error) {
            console.error('캐시 매니저 정리 실패:', error);
        }
    }
}

export { CacheManager };
