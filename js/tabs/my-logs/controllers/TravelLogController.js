/**
 * TravelLogController - 여행 로그 관리 전용 컨트롤러
 * 
 * 🎯 책임:
 * - 여행 로그 CRUD 작업 관리
 * - 로그 검색 및 필터링
 * - 로그 상태 관리 및 캐싱
 * - 로그 관련 비즈니스 로직 처리
 * 
 * @class TravelLogController
 * @version 1.0.0
 * @since 2024-12-29
 */

import { LogDataService } from '../../../modules/services/log-data-service.js';
import { CacheManager } from '../../../modules/services/cache-manager.js';
import { LogValidator } from './LogValidator.js';
import { LogDataManager } from './LogDataManager.js';
import { LogRenderer } from './LogRenderer.js';

class TravelLogController {
    constructor(logDataService, cacheManager) {
        // 의존성 주입
        this.logDataService = logDataService;
        this.cacheManager = cacheManager;
        
        // 하위 모듈들 초기화
        this.validator = new LogValidator();
        this.dataManager = new LogDataManager();
        this.renderer = new LogRenderer();
        
        // 상태 관리
        this.isInitialized = false;
        this.logCache = new Map();
        this.searchCache = new Map();
        
        // 캐시 키 관리
        this.cacheKeys = {
            ALL_LOGS: 'all_logs',
            LOG_BY_ID: 'log_by_id',
            LOGS_BY_COUNTRY: 'logs_by_country',
            LOGS_BY_YEAR: 'logs_by_year',
            SEARCH_RESULTS: 'search_results'
        };
        
        // 캐시 TTL (10분)
        this.cacheTTL = 10 * 60 * 1000;
    }

    /**
     * 컨트롤러 초기화
     */
    async initialize() {
        try {
            console.log('TravelLogController: 초기화 시작');
            
            // 하위 모듈들 초기화
            await this.validator.initialize();
            await this.dataManager.initialize();
            await this.renderer.initialize();
            
            this.isInitialized = true;
            console.log('TravelLogController: 초기화 완료');
        } catch (error) {
            console.error('TravelLogController: 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 새로운 로그를 추가합니다
     * @param {Object} logData - 로그 데이터
     * @returns {Object|null} 추가된 로그 또는 null
     */
    addLog(logData) {
        try {
            // 데이터 유효성 검증
            const validationResult = this.validator.validateLogData(logData);
            if (!validationResult.isValid) {
                console.error('TravelLogController: 로그 데이터 유효성 검증 실패:', validationResult.errors);
                throw new Error(`유효하지 않은 로그 데이터: ${validationResult.errors.join(', ')}`);
            }

            // 데이터 정규화
            const normalizedData = this.dataManager.normalizeLogData(logData);
            
            // 로그 추가
            const newLog = this.logDataService.addLog(normalizedData);
            
            if (newLog) {
                // 캐시 무효화
                this.invalidateLogCache();
                console.log('TravelLogController: 로그 추가 성공:', newLog.id);
            }
            
            return newLog;
        } catch (error) {
            console.error('TravelLogController: addLog 실패:', error);
            throw error;
        }
    }

    /**
     * 로그를 업데이트합니다
     * @param {string} logId - 로그 ID
     * @param {Object} updatedData - 업데이트할 데이터
     * @returns {Object|null} 업데이트된 로그 또는 null
     */
    updateLog(logId, updatedData) {
        try {
            // 기존 로그 확인
            const existingLog = this.getLogById(logId);
            if (!existingLog) {
                throw new Error(`로그를 찾을 수 없습니다: ${logId}`);
            }

            // 데이터 유효성 검증
            const validationResult = this.validator.validateLogData(updatedData, existingLog);
            if (!validationResult.isValid) {
                console.error('TravelLogController: 업데이트 데이터 유효성 검증 실패:', validationResult.errors);
                throw new Error(`유효하지 않은 업데이트 데이터: ${validationResult.errors.join(', ')}`);
            }

            // 데이터 정규화
            const normalizedData = this.dataManager.normalizeLogData(updatedData);
            
            // 로그 업데이트
            const updatedLog = this.logDataService.updateLog(logId, normalizedData);
            
            if (updatedLog) {
                // 캐시 무효화
                this.invalidateLogCache();
                console.log('TravelLogController: 로그 업데이트 성공:', logId);
            }
            
            return updatedLog;
        } catch (error) {
            console.error('TravelLogController: updateLog 실패:', error);
            throw error;
        }
    }

    /**
     * 로그를 삭제합니다
     * @param {string} logId - 로그 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteLog(logId) {
        try {
            const deleted = this.logDataService.deleteLog(logId);
            
            if (deleted) {
                // 캐시 무효화
                this.invalidateLogCache();
                console.log('TravelLogController: 로그 삭제 성공:', logId);
            }
            
            return deleted;
        } catch (error) {
            console.error('TravelLogController: deleteLog 실패:', error);
            throw error;
        }
    }

    /**
     * ID로 로그를 조회합니다
     * @param {string} logId - 로그 ID
     * @returns {Object|null} 로그 또는 null
     */
    getLogById(logId) {
        try {
            // 캐시 확인
            const cacheKey = `${this.cacheKeys.LOG_BY_ID}_${logId}`;
            const cached = this._getCachedData(cacheKey);
            if (cached) {
                return cached;
            }

            const log = this.logDataService.getLogById(logId);
            
            if (log) {
                // 캐시 저장
                this._setCachedData(cacheKey, log);
            }
            
            return log;
        } catch (error) {
            console.error('TravelLogController: getLogById 실패:', error);
            return null;
        }
    }

    /**
     * 모든 로그를 조회합니다
     * @param {Object} options - 조회 옵션
     * @returns {Array} 로그 배열
     */
    getAllLogs(options = {}) {
        try {
            const { sortBy = 'startDate', sortOrder = 'desc', limit = null } = options;
            
            // 캐시 확인
            const cacheKey = `${this.cacheKeys.ALL_LOGS}_${sortBy}_${sortOrder}_${limit || 'all'}`;
            const cached = this._getCachedData(cacheKey);
            if (cached) {
                return cached;
            }

            let logs = this.logDataService.getAllLogs();
            
            // 데이터 변환 및 정렬
            logs = this.dataManager.processLogs(logs, { sortBy, sortOrder, limit });
            
            // 캐시 저장
            this._setCachedData(cacheKey, logs);
            
            return logs;
        } catch (error) {
            console.error('TravelLogController: getAllLogs 실패:', error);
            return [];
        }
    }

    /**
     * 로그를 검색합니다
     * @param {Object} searchCriteria - 검색 조건
     * @returns {Array} 검색 결과
     */
    searchLogs(searchCriteria) {
        try {
            const { query, country, year, purpose, rating, dateRange } = searchCriteria;
            
            // 캐시 확인
            const cacheKey = `${this.cacheKeys.SEARCH_RESULTS}_${JSON.stringify(searchCriteria)}`;
            const cached = this._getCachedData(cacheKey);
            if (cached) {
                return cached;
            }

            let logs = this.logDataService.getAllLogs();
            
            // 검색 필터 적용
            logs = this.dataManager.filterLogs(logs, searchCriteria);
            
            // 캐시 저장
            this._setCachedData(cacheKey, logs);
            
            return logs;
        } catch (error) {
            console.error('TravelLogController: searchLogs 실패:', error);
            return [];
        }
    }

    /**
     * 국가별 로그를 조회합니다
     * @param {string} countryCode - 국가 코드
     * @returns {Array} 해당 국가의 로그 배열
     */
    getLogsByCountry(countryCode) {
        try {
            // 캐시 확인
            const cacheKey = `${this.cacheKeys.LOGS_BY_COUNTRY}_${countryCode}`;
            const cached = this._getCachedData(cacheKey);
            if (cached) {
                return cached;
            }

            const logs = this.logDataService.getAllLogs();
            const filteredLogs = logs.filter(log => log.country === countryCode);
            
            // 캐시 저장
            this._setCachedData(cacheKey, filteredLogs);
            
            return filteredLogs;
        } catch (error) {
            console.error('TravelLogController: getLogsByCountry 실패:', error);
            return [];
        }
    }

    /**
     * 연도별 로그를 조회합니다
     * @param {number} year - 연도
     * @returns {Array} 해당 연도의 로그 배열
     */
    getLogsByYear(year) {
        try {
            // 캐시 확인
            const cacheKey = `${this.cacheKeys.LOGS_BY_YEAR}_${year}`;
            const cached = this._getCachedData(cacheKey);
            if (cached) {
                return cached;
            }

            const logs = this.logDataService.getAllLogs();
            const filteredLogs = logs.filter(log => {
                const logYear = new Date(log.startDate).getFullYear();
                return logYear === year;
            });
            
            // 캐시 저장
            this._setCachedData(cacheKey, filteredLogs);
            
            return filteredLogs;
        } catch (error) {
            console.error('TravelLogController: getLogsByYear 실패:', error);
            return [];
        }
    }

    /**
     * 로그 통계를 계산합니다
     * @param {Object} options - 통계 옵션
     * @returns {Object} 로그 통계
     */
    getLogStatistics(options = {}) {
        try {
            const { groupBy = 'year', filter = {} } = options;
            
            const logs = this.searchLogs(filter);
            return this.dataManager.calculateLogStatistics(logs, groupBy);
        } catch (error) {
            console.error('TravelLogController: getLogStatistics 실패:', error);
            return {};
        }
    }

    /**
     * 로그 목록을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     * @param {Object} options - 렌더링 옵션
     */
    renderLogList(container, options = {}) {
        try {
            const logs = this.getAllLogs(options);
            const html = this.renderer.renderLogList(logs, options);
            container.innerHTML = html;
        } catch (error) {
            console.error('TravelLogController: renderLogList 실패:', error);
            container.innerHTML = this.renderer.renderError('로그 목록을 불러올 수 없습니다.');
        }
    }

    /**
     * 로그 상세 정보를 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     * @param {string} logId - 로그 ID
     */
    renderLogDetail(container, logId) {
        try {
            const log = this.getLogById(logId);
            if (!log) {
                container.innerHTML = this.renderer.renderError('로그를 찾을 수 없습니다.');
                return;
            }

            const html = this.renderer.renderLogDetail(log);
            container.innerHTML = html;
        } catch (error) {
            console.error('TravelLogController: renderLogDetail 실패:', error);
            container.innerHTML = this.renderer.renderError('로그 상세 정보를 불러올 수 없습니다.');
        }
    }

    /**
     * 로그 캐시를 무효화합니다
     */
    invalidateLogCache() {
        try {
            Object.values(this.cacheKeys).forEach(key => {
                this.cacheManager.delete(key);
            });
            this.logCache.clear();
            this.searchCache.clear();
            console.log('TravelLogController: 로그 캐시 무효화 완료');
        } catch (error) {
            console.error('TravelLogController: 캐시 무효화 실패:', error);
        }
    }

    /**
     * 캐시된 데이터를 가져옵니다
     * @param {string} key - 캐시 키
     * @returns {*} 캐시된 데이터 또는 null
     * @private
     */
    _getCachedData(key) {
        try {
            const cached = this.cacheManager.get(key);
            if (cached && cached.timestamp) {
                const now = Date.now();
                if (now - cached.timestamp < this.cacheTTL) {
                    return cached.data;
                }
            }
            return null;
        } catch (error) {
            console.error('TravelLogController: _getCachedData 실패:', error);
            return null;
        }
    }

    /**
     * 데이터를 캐시에 저장합니다
     * @param {string} key - 캐시 키
     * @param {*} data - 저장할 데이터
     * @private
     */
    _setCachedData(key, data) {
        try {
            this.cacheManager.set(key, {
                data: data,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('TravelLogController: _setCachedData 실패:', error);
        }
    }

    /**
     * 컨트롤러 정리
     */
    cleanup() {
        try {
            this.invalidateLogCache();
            
            if (this.validator && this.validator.cleanup) {
                this.validator.cleanup();
            }
            if (this.dataManager && this.dataManager.cleanup) {
                this.dataManager.cleanup();
            }
            if (this.renderer && this.renderer.cleanup) {
                this.renderer.cleanup();
            }
            
            this.isInitialized = false;
            console.log('TravelLogController: 정리 완료');
        } catch (error) {
            console.error('TravelLogController: 정리 실패:', error);
        }
    }
}

export { TravelLogController };
