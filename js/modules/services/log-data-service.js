/**
 * LogDataService - 여행 로그 데이터의 CRUD 작업과 기본 데이터 관리를 담당
 * 
 * 🎯 책임:
 * - 로그 데이터 CRUD 작업
 * - 페이지네이션 관리
 * - 데이터 정렬
 * - 기본 데이터 조회
 * 
 * @class LogDataService
 * @version 1.0.0
 * @since 2024-12-29
 */
import { LogService } from '../services/log-service.js';
import { StorageManager } from '../utils/storage-manager.js';

class LogDataService {
    constructor() {
        this.logService = new LogService();
        this.storageManager = new StorageManager();
        this.isInitialized = false;
    }

    /**
     * 서비스 초기화
     * @param {Array} initialLogs - 초기 로그 데이터 (선택사항)
     */
    async initialize(initialLogs = null) {
        if (this.isInitialized) return;
        
        try {
            if (initialLogs) {
                this.logService.setLogs(initialLogs);
            } else {
                // StorageManager를 사용하여 데이터 로드
                const storedLogs = this.storageManager.loadLogs();
                this.logService.setLogs(storedLogs);
            }
            
            // 날짜 순으로 정렬 (최신이 맨 위)
            this.logService.sortLogsByDate('desc');
            
            this.isInitialized = true;
        } catch (error) {
            console.error('LogDataService 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 새로운 로그를 추가합니다
     * @param {Object} logData - 로그 데이터
     * @returns {Object} 생성된 로그
     */
    addLog(logData) {
        try {
            const newLog = this.logService.createLog(logData);
            this.storageManager.saveLogs(this.logService.getAllLogs());
            return newLog;
        } catch (error) {
            console.error('로그 추가 실패:', error);
            throw error;
        }
    }

    /**
     * 로그를 삭제합니다
     * @param {string} logId - 삭제할 로그 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteLog(logId) {
        try {
            const deleted = this.logService.deleteLog(logId);
            
            if (deleted) {
                this.storageManager.saveLogs(this.logService.getAllLogs());
                
                // 현재 페이지가 비어있고 이전 페이지가 있으면 이전 페이지로 이동
                const totalPages = Math.ceil(this.logService.getAllLogs().length / this.logService.logsPerPage);
                if (this.logService.currentPage > totalPages && totalPages > 0) {
                    this.logService.setCurrentPage(totalPages);
                }
            }
            
            return deleted;
        } catch (error) {
            console.error('로그 삭제 실패:', error);
            throw error;
        }
    }

    /**
     * 로그를 업데이트합니다
     * @param {string} logId - 업데이트할 로그 ID
     * @param {Object} updatedData - 업데이트할 데이터
     * @returns {Object|null} 업데이트된 로그 또는 null
     */
    updateLog(logId, updatedData) {
        try {
            const updatedLog = this.logService.updateLog(logId, updatedData);
            
            if (updatedLog) {
                this.storageManager.saveLogs(this.logService.getAllLogs());
            }
            
            return updatedLog;
        } catch (error) {
            console.error('로그 업데이트 실패:', error);
            throw error;
        }
    }

    /**
     * ID로 로그를 조회합니다
     * @param {string} logId - 로그 ID
     * @returns {Object|null} 로그 객체 또는 null
     */
    getLogById(logId) {
        try {
            return this.logService.getLogById(logId);
        } catch (error) {
            console.error('로그 조회 실패:', error);
            return null;
        }
    }

    /**
     * 모든 로그를 조회합니다
     * @returns {Array} 로그 배열
     */
    getAllLogs() {
        try {
            return this.logService.getAllLogs();
        } catch (error) {
            console.error('전체 로그 조회 실패:', error);
            return [];
        }
    }

    /**
     * 페이지별 로그를 조회합니다
     * @param {number} page - 페이지 번호
     * @param {number} perPage - 페이지당 항목 수
     * @returns {Object} 페이지 데이터
     */
    getLogsByPage(page, perPage) {
        try {
            return this.logService.getLogsByPage(page, perPage);
        } catch (error) {
            console.error('페이지별 로그 조회 실패:', error);
            return {
                logs: [],
                totalLogs: 0,
                totalPages: 0,
                currentPage: 1,
                hasNextPage: false,
                hasPrevPage: false
            };
        }
    }

    /**
     * 현재 페이지를 설정합니다
     * @param {number} page - 페이지 번호
     */
    setCurrentPage(page) {
        try {
            this.logService.setCurrentPage(page);
        } catch (error) {
            console.error('현재 페이지 설정 실패:', error);
        }
    }

    /**
     * 로그를 정렬합니다
     * @param {string} order - 정렬 순서 ('asc' 또는 'desc')
     */
    sortLogsByDate(order) {
        try {
            this.logService.sortLogsByDate(order);
        } catch (error) {
            console.error('로그 정렬 실패:', error);
        }
    }

    /**
     * 로그 데이터를 설정합니다
     * @param {Array} logs - 로그 배열
     */
    setLogs(logs) {
        try {
            this.logService.setLogs(logs);
            this.storageManager.saveLogs(logs);
        } catch (error) {
            console.error('로그 데이터 설정 실패:', error);
            throw error;
        }
    }

    /**
     * 로그 데이터를 저장소에 저장합니다
     */
    saveLogs() {
        try {
            const logs = this.logService.getAllLogs();
            this.storageManager.saveLogs(logs);
        } catch (error) {
            console.error('로그 데이터 저장 실패:', error);
            throw error;
        }
    }

    /**
     * 로그 데이터를 저장소에서 로드합니다
     * @returns {Array} 로드된 로그 배열
     */
    loadLogs() {
        try {
            const logs = this.storageManager.loadLogs();
            this.logService.setLogs(logs);
            return logs;
        } catch (error) {
            console.error('로그 데이터 로드 실패:', error);
            return [];
        }
    }

    /**
     * 서비스 상태를 확인합니다
     * @returns {boolean} 초기화 상태
     */
    isServiceInitialized() {
        return this.isInitialized;
    }

    /**
     * 서비스 정리
     */
    cleanup() {
        this.isInitialized = false;
        this.logService.setLogs([]);
        this.logService.setCurrentPage(1);
    }
}

export { LogDataService };
