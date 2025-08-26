/**
 * 로컬 스토리지 관리 모듈
 * 애플리케이션 전체에서 사용할 수 있는 스토리지 시스템
 */

export class StorageManager {
    constructor() {
        this.storageKey = 'travelLogs';
    }
    
    /**
     * 로그 데이터를 로컬 스토리지에 저장합니다
     * @param {Array} logs - 저장할 로그 배열
     * @returns {boolean} 저장 성공 여부
     */
    saveLogs(logs) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(logs));
            return true;
        } catch (error) {
            console.error('일지 데이터 저장 실패:', error);
            return false;
        }
    }
    
    /**
     * 로컬 스토리지에서 로그 데이터를 로드합니다
     * @returns {Array} 로드된 로그 배열
     */
    loadLogs() {
        try {
            const storedLogs = localStorage.getItem(this.storageKey);
            return storedLogs ? JSON.parse(storedLogs) : [];
        } catch (error) {
            console.error('일지 데이터 로드 실패:', error);
            return [];
        }
    }
    
    /**
     * 특정 키로 데이터를 저장합니다
     * @param {string} key - 저장할 키
     * @param {any} data - 저장할 데이터
     * @returns {boolean} 저장 성공 여부
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`데이터 저장 실패 (${key}):`, error);
            return false;
        }
    }
    
    /**
     * 특정 키로 데이터를 로드합니다
     * @param {string} key - 로드할 키
     * @param {any} defaultValue - 기본값
     * @returns {any} 로드된 데이터 또는 기본값
     */
    load(key, defaultValue = null) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error(`데이터 로드 실패 (${key}):`, error);
            return defaultValue;
        }
    }
    
    /**
     * 특정 키의 데이터를 삭제합니다
     * @param {string} key - 삭제할 키
     * @returns {boolean} 삭제 성공 여부
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`데이터 삭제 실패 (${key}):`, error);
            return false;
        }
    }
    
    /**
     * 모든 데이터를 삭제합니다
     * @returns {boolean} 삭제 성공 여부
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('모든 데이터 삭제 실패:', error);
            return false;
        }
    }
    
    /**
     * 특정 키가 존재하는지 확인합니다
     * @param {string} key - 확인할 키
     * @returns {boolean} 키 존재 여부
     */
    has(key) {
        return localStorage.getItem(key) !== null;
    }
    
    /**
     * 스토리지 사용량을 확인합니다 (브라우저 지원 시)
     * @returns {Object|null} 스토리지 사용량 정보
     */
    getStorageUsage() {
        if (navigator.storage && navigator.storage.estimate) {
            return navigator.storage.estimate();
        }
        return null;
    }
    
    /**
     * 스토리지 키를 변경합니다
     * @param {string} newKey - 새로운 키
     */
    setStorageKey(newKey) {
        this.storageKey = newKey;
    }
}
