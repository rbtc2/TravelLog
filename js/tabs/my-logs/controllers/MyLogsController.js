/**
 * MyLogsController - 나의 로그 탭의 비즈니스 로직을 담당하는 컨트롤러
 * 
 * 🎯 책임:
 * - 로그 데이터 CRUD 작업
 * - 데이터 마이그레이션
 * - 상태 관리
 * - 이벤트 처리
 * 
 * @class MyLogsController
 */
import { LogService } from '../../../modules/services/log-service.js';
import { StorageManager } from '../../../modules/utils/storage-manager.js';
import { DemoData } from '../../../modules/utils/demo-data.js';
import { countriesManager } from '../../../data/countries-manager.js';

class MyLogsController {
    constructor() {
        this.logService = new LogService();
        this.storageManager = new StorageManager();
        this.isInitialized = false;
    }

    /**
     * 컨트롤러 초기화
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // CountriesManager 초기화
            if (!countriesManager.isInitialized) {
                await countriesManager.initialize();
            }
            
            // 데이터 로드
            await this.loadLogs();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('MyLogsController 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 로그 데이터를 로드합니다
     */
    async loadLogs() {
        try {
            // 데이터 마이그레이션 실행
            this.migratePurposeData();
            
            // StorageManager를 사용하여 데이터 로드
            const storedLogs = this.storageManager.loadLogs();
            
            // LogService에 데이터 설정
            this.logService.setLogs(storedLogs);
            
            // 데모 데이터가 없으면 샘플 데이터 추가
            if (this.logService.getAllLogs().length === 0) {
                this.addDemoData();
            }
            
            // 날짜 순으로 정렬 (최신이 맨 위)
            this.logService.sortLogsByDate('desc');
        } catch (error) {
            console.error('일지 데이터 로드 실패:', error);
            this.logService.setLogs([]);
            throw error;
        }
    }

    /**
     * 목적 데이터 마이그레이션 (relocation -> immigration)
     */
    migratePurposeData() {
        try {
            const storedLogs = this.storageManager.loadLogs();
            let hasChanges = false;
            
            const migratedLogs = storedLogs.map(log => {
                if (log.purpose === 'relocation') {
                    hasChanges = true;
                    return {
                        ...log,
                        purpose: 'immigration',
                        updatedAt: new Date().toISOString()
                    };
                }
                return log;
            });
            
            if (hasChanges) {
                this.storageManager.saveLogs(migratedLogs);
                console.log('목적 데이터 마이그레이션 완료: relocation -> immigration');
            }
        } catch (error) {
            console.error('목적 데이터 마이그레이션 실패:', error);
        }
    }

    /**
     * 데모 데이터를 추가합니다
     */
    addDemoData() {
        const demoLogs = DemoData.getDefaultLogs();
        this.logService.setLogs(demoLogs);
        this.storageManager.saveLogs(demoLogs);
    }

    /**
     * 새로운 로그를 추가합니다
     * @param {Object} logData - 로그 데이터
     * @returns {Object} 생성된 로그
     */
    addLog(logData) {
        const newLog = this.logService.createLog(logData);
        this.storageManager.saveLogs(this.logService.getAllLogs());
        return newLog;
    }

    /**
     * 로그를 삭제합니다
     * @param {string} logId - 삭제할 로그 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteLog(logId) {
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
    }

    /**
     * 로그를 업데이트합니다
     * @param {string} logId - 업데이트할 로그 ID
     * @param {Object} updatedData - 업데이트할 데이터
     * @returns {Object|null} 업데이트된 로그 또는 null
     */
    updateLog(logId, updatedData) {
        const updatedLog = this.logService.updateLog(logId, updatedData);
        
        if (updatedLog) {
            this.storageManager.saveLogs(this.logService.getAllLogs());
        }
        
        return updatedLog;
    }

    /**
     * ID로 로그를 조회합니다
     * @param {string} logId - 로그 ID
     * @returns {Object|null} 로그 객체 또는 null
     */
    getLogById(logId) {
        return this.logService.getLogById(logId);
    }

    /**
     * 모든 로그를 조회합니다
     * @returns {Array} 로그 배열
     */
    getAllLogs() {
        return this.logService.getAllLogs();
    }

    /**
     * 페이지별 로그를 조회합니다
     * @param {number} page - 페이지 번호
     * @param {number} perPage - 페이지당 항목 수
     * @returns {Object} 페이지 데이터
     */
    getLogsByPage(page, perPage) {
        return this.logService.getLogsByPage(page, perPage);
    }

    /**
     * 현재 페이지를 설정합니다
     * @param {number} page - 페이지 번호
     */
    setCurrentPage(page) {
        this.logService.setCurrentPage(page);
    }

    /**
     * 로그를 정렬합니다
     * @param {string} order - 정렬 순서 ('asc' 또는 'desc')
     */
    sortLogsByDate(order) {
        this.logService.sortLogsByDate(order);
    }

    /**
     * 국가 코드로 국가 정보를 조회합니다
     * @param {string} countryCode - 국가 코드
     * @returns {Object|null} 국가 정보 또는 null
     */
    getCountryByCode(countryCode) {
        try {
            if (!countriesManager.isInitialized) {
                console.warn('CountriesManager가 초기화되지 않았습니다.');
                return null;
            }
            return countriesManager.getCountryByCode(countryCode);
        } catch (error) {
            console.error('국가 정보 조회 중 오류:', error);
            return null;
        }
    }

    /**
     * 기본 통계를 계산합니다
     * @returns {Object} 기본 통계 정보
     */
    getBasicStats() {
        try {
            const logs = this.getAllLogs();
            
            if (!logs || logs.length === 0) {
                return {
                    visitedCountries: 0,
                    visitedCities: 0,
                    totalTravelDays: 0,
                    averageRating: 0,
                    hasData: false
                };
            }

            // 방문 국가 수 계산
            const uniqueCountries = new Set();
            const uniqueCities = new Set();
            let totalTravelDays = 0;
            let totalRating = 0;
            let validRatingCount = 0;

            logs.forEach(log => {
                // 국가와 도시 수집
                if (log.country) {
                    uniqueCountries.add(log.country.trim());
                }
                if (log.city) {
                    uniqueCities.add(log.city.trim());
                }

                // 여행 일수 계산
                if (log.startDate && log.endDate) {
                    try {
                        const startDate = new Date(log.startDate);
                        const endDate = new Date(log.endDate);
                        
                        // 유효한 날짜인지 확인
                        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                            const timeDiff = endDate.getTime() - startDate.getTime();
                            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
                            
                            // 음수가 아닌 유효한 일수만 추가
                            if (daysDiff > 0) {
                                totalTravelDays += daysDiff;
                            }
                        }
                    } catch (dateError) {
                        console.warn('날짜 계산 오류:', dateError, log);
                    }
                }

                // 평점 계산
                if (log.rating && !isNaN(parseFloat(log.rating))) {
                    const rating = parseFloat(log.rating);
                    if (rating >= 0 && rating <= 5) {
                        totalRating += rating;
                        validRatingCount++;
                    }
                }
            });

            const averageRating = validRatingCount > 0 ? totalRating / validRatingCount : 0;

            return {
                visitedCountries: uniqueCountries.size,
                visitedCities: uniqueCities.size,
                totalTravelDays: totalTravelDays,
                averageRating: Math.round(averageRating * 10) / 10,
                hasData: true
            };

        } catch (error) {
            console.error('기본 통계 계산 중 오류:', error);
            return {
                visitedCountries: 0,
                visitedCities: 0,
                totalTravelDays: 0,
                averageRating: 0,
                hasData: false
            };
        }
    }

    /**
     * 특정 연도의 여행 데이터를 가져옵니다
     * @param {string} year - 연도
     * @returns {Object} 해당 연도의 여행 데이터
     */
    getTravelDataByYear(year) {
        try {
            const allLogs = this.getAllLogs();
            const yearInt = parseInt(year);
            
            // 해당 연도의 로그만 필터링
            const yearLogs = allLogs.filter(log => {
                const logDate = new Date(log.startDate);
                return logDate.getFullYear() === yearInt;
            });
            
            return {
                year: year,
                logs: yearLogs,
                totalLogs: yearLogs.length,
                hasData: yearLogs.length > 0
            };
        } catch (error) {
            console.error('연도별 여행 데이터 조회 중 오류:', error);
            return {
                year: year,
                logs: [],
                totalLogs: 0,
                hasData: false
            };
        }
    }

    /**
     * 컨트롤러 정리
     */
    cleanup() {
        this.isInitialized = false;
        this.logService.setLogs([]);
        this.logService.setCurrentPage(1);
    }
}

export { MyLogsController };
