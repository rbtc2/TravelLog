/**
 * 인증 캐시 관리자
 * 메모리 캐시, 로컬 스토리지 캐시, 세션 캐시를 통합 관리
 * @class AuthCacheManager
 * @version 1.0.0
 * @since 2024-12-29
 */
export class AuthCacheManager {
    constructor(options = {}) {
        this.options = {
            // 캐시 타입 설정
            memoryCache: true,
            localStorageCache: true,
            sessionStorageCache: true,
            
            // 캐시 만료 시간 (밀리초)
            defaultTTL: 5 * 60 * 1000, // 5분
            maxMemorySize: 100, // 최대 메모리 캐시 항목 수
            maxStorageSize: 1024 * 1024, // 최대 스토리지 크기 (1MB)
            
            // 네임스페이스
            namespace: 'auth_cache',
            
            ...options
        };
        
        // 메모리 캐시
        this.memoryCache = new Map();
        this.memoryAccessOrder = [];
        
        // 캐시 통계
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0
        };
        
        // 캐시 정리 타이머
        this.cleanupInterval = null;
        this.startCleanupTimer();
    }

    /**
     * 캐시에서 값을 가져옵니다
     * @param {string} key - 캐시 키
     * @param {Object} options - 옵션
     * @returns {any} 캐시된 값 또는 null
     */
    get(key, options = {}) {
        const cacheKey = this.buildKey(key);
        const { source = 'auto' } = options;
        
        // 메모리 캐시에서 먼저 확인
        if (source === 'auto' || source === 'memory') {
            const memoryValue = this.getFromMemory(cacheKey);
            if (memoryValue !== null) {
                this.stats.hits++;
                return memoryValue;
            }
        }
        
        // 로컬 스토리지에서 확인
        if (source === 'auto' || source === 'localStorage') {
            const localStorageValue = this.getFromLocalStorage(cacheKey);
            if (localStorageValue !== null) {
                this.stats.hits++;
                // 메모리 캐시에도 저장
                this.setToMemory(cacheKey, localStorageValue, options);
                return localStorageValue;
            }
        }
        
        // 세션 스토리지에서 확인
        if (source === 'auto' || source === 'sessionStorage') {
            const sessionStorageValue = this.getFromSessionStorage(cacheKey);
            if (sessionStorageValue !== null) {
                this.stats.hits++;
                // 메모리 캐시에도 저장
                this.setToMemory(cacheKey, sessionStorageValue, options);
                return sessionStorageValue;
            }
        }
        
        this.stats.misses++;
        return null;
    }

    /**
     * 캐시에 값을 저장합니다
     * @param {string} key - 캐시 키
     * @param {any} value - 저장할 값
     * @param {Object} options - 옵션
     */
    set(key, value, options = {}) {
        const cacheKey = this.buildKey(key);
        const {
            ttl = this.options.defaultTTL,
            source = 'auto',
            priority = 'normal'
        } = options;
        
        const cacheItem = {
            value: this.serialize(value),
            timestamp: Date.now(),
            ttl,
            priority,
            accessCount: 0
        };
        
        // 메모리 캐시에 저장
        if (source === 'auto' || source === 'memory') {
            this.setToMemory(cacheKey, cacheItem, options);
        }
        
        // 로컬 스토리지에 저장
        if (source === 'auto' || source === 'localStorage') {
            this.setToLocalStorage(cacheKey, cacheItem, options);
        }
        
        // 세션 스토리지에 저장
        if (source === 'auto' || source === 'sessionStorage') {
            this.setToSessionStorage(cacheKey, cacheItem, options);
        }
        
        this.stats.sets++;
    }

    /**
     * 캐시에서 값을 삭제합니다
     * @param {string} key - 캐시 키
     * @param {Object} options - 옵션
     */
    delete(key, options = {}) {
        const cacheKey = this.buildKey(key);
        const { source = 'all' } = options;
        
        if (source === 'all' || source === 'memory') {
            this.deleteFromMemory(cacheKey);
        }
        
        if (source === 'all' || source === 'localStorage') {
            this.deleteFromLocalStorage(cacheKey);
        }
        
        if (source === 'all' || source === 'sessionStorage') {
            this.deleteFromSessionStorage(cacheKey);
        }
        
        this.stats.deletes++;
    }

    /**
     * 캐시를 비웁니다
     * @param {Object} options - 옵션
     */
    clear(options = {}) {
        const { source = 'all' } = options;
        
        if (source === 'all' || source === 'memory') {
            this.memoryCache.clear();
            this.memoryAccessOrder = [];
        }
        
        if (source === 'all' || source === 'localStorage') {
            this.clearLocalStorage();
        }
        
        if (source === 'all' || source === 'sessionStorage') {
            this.clearSessionStorage();
        }
    }

    /**
     * 캐시에 키가 존재하는지 확인합니다
     * @param {string} key - 캐시 키
     * @param {Object} options - 옵션
     * @returns {boolean} 존재 여부
     */
    has(key, options = {}) {
        return this.get(key, { ...options, returnMetadata: true }) !== null;
    }

    /**
     * 캐시 크기를 가져옵니다
     * @param {string} source - 캐시 소스
     * @returns {number} 크기
     */
    size(source = 'memory') {
        switch (source) {
            case 'memory':
                return this.memoryCache.size;
            case 'localStorage':
                return this.getLocalStorageSize();
            case 'sessionStorage':
                return this.getSessionStorageSize();
            default:
                return this.memoryCache.size + this.getLocalStorageSize() + this.getSessionStorageSize();
        }
    }

    /**
     * 캐시 통계를 가져옵니다
     * @returns {Object} 통계 정보
     */
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
        
        return {
            ...this.stats,
            hitRate: Math.round(hitRate * 100) / 100,
            memorySize: this.memoryCache.size,
            localStorageSize: this.getLocalStorageSize(),
            sessionStorageSize: this.getSessionStorageSize()
        };
    }

    /**
     * 캐시를 최적화합니다
     */
    optimize() {
        // 만료된 항목 정리
        this.cleanupExpired();
        
        // 메모리 캐시 크기 조정
        this.evictMemoryCache();
        
        // 스토리지 크기 조정
        this.evictStorage();
    }

    // Private methods

    /**
     * 메모리 캐시에서 값을 가져옵니다
     * @param {string} key - 캐시 키
     * @returns {any} 값 또는 null
     */
    getFromMemory(key) {
        const item = this.memoryCache.get(key);
        if (!item) return null;
        
        // 만료 확인
        if (this.isExpired(item)) {
            this.memoryCache.delete(key);
            this.removeFromAccessOrder(key);
            return null;
        }
        
        // 접근 횟수 증가
        item.accessCount++;
        this.updateAccessOrder(key);
        
        return this.deserialize(item.value);
    }

    /**
     * 메모리 캐시에 값을 저장합니다
     * @param {string} key - 캐시 키
     * @param {any} value - 값
     * @param {Object} options - 옵션
     */
    setToMemory(key, value, options = {}) {
        const { ttl = this.options.defaultTTL, priority = 'normal' } = options;
        
        const item = {
            value: this.serialize(value),
            timestamp: Date.now(),
            ttl,
            priority,
            accessCount: 0
        };
        
        this.memoryCache.set(key, item);
        this.updateAccessOrder(key);
        
        // 메모리 크기 제한 확인
        if (this.memoryCache.size > this.options.maxMemorySize) {
            this.evictMemoryCache();
        }
    }

    /**
     * 메모리 캐시에서 값을 삭제합니다
     * @param {string} key - 캐시 키
     */
    deleteFromMemory(key) {
        this.memoryCache.delete(key);
        this.removeFromAccessOrder(key);
    }

    /**
     * 로컬 스토리지에서 값을 가져옵니다
     * @param {string} key - 캐시 키
     * @returns {any} 값 또는 null
     */
    getFromLocalStorage(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            
            const parsed = JSON.parse(item);
            if (this.isExpired(parsed)) {
                localStorage.removeItem(key);
                return null;
            }
            
            return this.deserialize(parsed.value);
        } catch (error) {
            console.error('LocalStorage get error:', error);
            return null;
        }
    }

    /**
     * 로컬 스토리지에 값을 저장합니다
     * @param {string} key - 캐시 키
     * @param {any} value - 값
     * @param {Object} options - 옵션
     */
    setToLocalStorage(key, value, options = {}) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
        } catch (error) {
            console.error('LocalStorage set error:', error);
            // 스토리지 공간 부족 시 오래된 항목 삭제
            this.evictStorage();
        }
    }

    /**
     * 로컬 스토리지에서 값을 삭제합니다
     * @param {string} key - 캐시 키
     */
    deleteFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('LocalStorage delete error:', error);
        }
    }

    /**
     * 세션 스토리지에서 값을 가져옵니다
     * @param {string} key - 캐시 키
     * @returns {any} 값 또는 null
     */
    getFromSessionStorage(key) {
        try {
            const item = sessionStorage.getItem(key);
            if (!item) return null;
            
            const parsed = JSON.parse(item);
            if (this.isExpired(parsed)) {
                sessionStorage.removeItem(key);
                return null;
            }
            
            return this.deserialize(parsed.value);
        } catch (error) {
            console.error('SessionStorage get error:', error);
            return null;
        }
    }

    /**
     * 세션 스토리지에 값을 저장합니다
     * @param {string} key - 캐시 키
     * @param {any} value - 값
     * @param {Object} options - 옵션
     */
    setToSessionStorage(key, value, options = {}) {
        try {
            const serialized = JSON.stringify(value);
            sessionStorage.setItem(key, serialized);
        } catch (error) {
            console.error('SessionStorage set error:', error);
        }
    }

    /**
     * 세션 스토리지에서 값을 삭제합니다
     * @param {string} key - 캐시 키
     */
    deleteFromSessionStorage(key) {
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.error('SessionStorage delete error:', error);
        }
    }

    /**
     * 캐시 키를 생성합니다
     * @param {string} key - 원본 키
     * @returns {string} 네임스페이스가 포함된 키
     */
    buildKey(key) {
        return `${this.options.namespace}:${key}`;
    }

    /**
     * 값을 직렬화합니다
     * @param {any} value - 직렬화할 값
     * @returns {string} 직렬화된 값
     */
    serialize(value) {
        try {
            return JSON.stringify(value);
        } catch (error) {
            console.error('Serialization error:', error);
            return null;
        }
    }

    /**
     * 값을 역직렬화합니다
     * @param {string} value - 역직렬화할 값
     * @returns {any} 역직렬화된 값
     */
    deserialize(value) {
        try {
            return JSON.parse(value);
        } catch (error) {
            console.error('Deserialization error:', error);
            return null;
        }
    }

    /**
     * 캐시 항목이 만료되었는지 확인합니다
     * @param {Object} item - 캐시 항목
     * @returns {boolean} 만료 여부
     */
    isExpired(item) {
        if (!item || !item.timestamp || !item.ttl) return false;
        return Date.now() - item.timestamp > item.ttl;
    }

    /**
     * 접근 순서를 업데이트합니다
     * @param {string} key - 캐시 키
     */
    updateAccessOrder(key) {
        this.removeFromAccessOrder(key);
        this.memoryAccessOrder.push(key);
    }

    /**
     * 접근 순서에서 키를 제거합니다
     * @param {string} key - 캐시 키
     */
    removeFromAccessOrder(key) {
        const index = this.memoryAccessOrder.indexOf(key);
        if (index > -1) {
            this.memoryAccessOrder.splice(index, 1);
        }
    }

    /**
     * 만료된 항목들을 정리합니다
     */
    cleanupExpired() {
        // 메모리 캐시 정리
        for (const [key, item] of this.memoryCache.entries()) {
            if (this.isExpired(item)) {
                this.memoryCache.delete(key);
                this.removeFromAccessOrder(key);
            }
        }
        
        // 로컬 스토리지 정리
        this.cleanupStorage(localStorage);
        
        // 세션 스토리지 정리
        this.cleanupStorage(sessionStorage);
    }

    /**
     * 스토리지를 정리합니다
     * @param {Storage} storage - 스토리지 객체
     */
    cleanupStorage(storage) {
        const keysToRemove = [];
        
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && key.startsWith(this.options.namespace + ':')) {
                try {
                    const item = JSON.parse(storage.getItem(key));
                    if (this.isExpired(item)) {
                        keysToRemove.push(key);
                    }
                } catch (error) {
                    // 파싱 오류 시 삭제
                    keysToRemove.push(key);
                }
            }
        }
        
        keysToRemove.forEach(key => storage.removeItem(key));
    }

    /**
     * 메모리 캐시를 축출합니다
     */
    evictMemoryCache() {
        while (this.memoryCache.size > this.options.maxMemorySize) {
            const oldestKey = this.memoryAccessOrder.shift();
            if (oldestKey) {
                this.memoryCache.delete(oldestKey);
                this.stats.evictions++;
            }
        }
    }

    /**
     * 스토리지를 축출합니다
     */
    evictStorage() {
        // 간단한 LRU 구현
        const allKeys = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.options.namespace + ':')) {
                allKeys.push({ key, storage: 'localStorage' });
            }
        }
        
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(this.options.namespace + ':')) {
                allKeys.push({ key, storage: 'sessionStorage' });
            }
        }
        
        // 접근 시간으로 정렬
        allKeys.sort((a, b) => {
            try {
                const aItem = JSON.parse(a.storage === 'localStorage' ? localStorage.getItem(a.key) : sessionStorage.getItem(a.key));
                const bItem = JSON.parse(b.storage === 'localStorage' ? localStorage.getItem(b.key) : sessionStorage.getItem(b.key));
                return (aItem.timestamp || 0) - (bItem.timestamp || 0);
            } catch {
                return 0;
            }
        });
        
        // 오래된 항목부터 삭제
        const toRemove = allKeys.slice(0, Math.floor(allKeys.length / 2));
        toRemove.forEach(({ key, storage }) => {
            if (storage === 'localStorage') {
                localStorage.removeItem(key);
            } else {
                sessionStorage.removeItem(key);
            }
            this.stats.evictions++;
        });
    }

    /**
     * 로컬 스토리지 크기를 가져옵니다
     * @returns {number} 크기
     */
    getLocalStorageSize() {
        let size = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.options.namespace + ':')) {
                size++;
            }
        }
        return size;
    }

    /**
     * 세션 스토리지 크기를 가져옵니다
     * @returns {number} 크기
     */
    getSessionStorageSize() {
        let size = 0;
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(this.options.namespace + ':')) {
                size++;
            }
        }
        return size;
    }

    /**
     * 로컬 스토리지를 비웁니다
     */
    clearLocalStorage() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.options.namespace + ':')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    /**
     * 세션 스토리지를 비웁니다
     */
    clearSessionStorage() {
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(this.options.namespace + ':')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
    }

    /**
     * 정리 타이머를 시작합니다
     */
    startCleanupTimer() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpired();
        }, 60000); // 1분마다 정리
    }

    /**
     * 정리 타이머를 중지합니다
     */
    stopCleanupTimer() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    /**
     * 리소스를 정리합니다
     */
    cleanup() {
        this.stopCleanupTimer();
        this.clear();
        this.memoryCache.clear();
        this.memoryAccessOrder = [];
    }
}
