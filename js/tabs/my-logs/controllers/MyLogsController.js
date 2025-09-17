/**
 * MyLogsController - 나의 로그 탭의 비즈니스 로직을 담당하는 컨트롤러
 * 
 * 🎯 책임:
 * - 서비스들 간의 조정 및 통합
 * - 상태 관리
 * - 이벤트 처리
 * - 기존 API 호환성 유지
 * 
 * @class MyLogsController
 * @version 2.0.0
 * @since 2024-12-29
 */
import { LogDataService } from '../../../modules/services/log-data-service.js';
import { CacheManager } from '../../../modules/services/cache-manager.js';
import { DataMigrationService } from '../../../modules/services/data-migration-service.js';
import { BasicStatsService } from '../../../modules/services/basic-stats-service.js';
import { PurposeAnalysisService } from '../../../modules/services/purpose-analysis-service.js';
import { CountryAnalysisService } from '../../../modules/services/country-analysis-service.js';
import { YearlyStatsService } from '../../../modules/services/yearly-stats-service.js';
import { DemoData } from '../../../modules/utils/demo-data.js';
import { countriesManager } from '../../../data/countries-manager.js';
import { TravelCollectionView } from '../views/index.js';

class MyLogsController {
    constructor() {
        // 새로운 서비스들 초기화
        this.logDataService = new LogDataService();
        this.cacheManager = new CacheManager();
        this.dataMigrationService = new DataMigrationService();
        
        // 분석 서비스들 초기화
        this.basicStatsService = new BasicStatsService(this.logDataService, this.cacheManager);
        this.purposeAnalysisService = new PurposeAnalysisService(this.logDataService, this.cacheManager);
        this.countryAnalysisService = new CountryAnalysisService(this.logDataService, this.cacheManager);
        this.yearlyStatsService = new YearlyStatsService(this.logDataService, this.cacheManager);
        
        // 뷰 인스턴스들 초기화
        this.travelCollectionView = new TravelCollectionView(this);
        
        this.isInitialized = false;
        
        // 기존 호환성을 위한 속성들 (점진적 제거 예정)
        this.logService = this.logDataService; // 호환성을 위한 별칭
        this.storageManager = this.logDataService.storageManager; // 호환성을 위한 별칭
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
            
            // 데이터 로드 및 마이그레이션
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
            // 기존 데이터 로드
            const storedLogs = this.logDataService.loadLogs();
            
            // 데이터 마이그레이션 실행
            const migrationResult = await this.dataMigrationService.migrateAll(storedLogs);
            
            if (migrationResult.success) {
                // 마이그레이션된 데이터로 서비스 초기화
                await this.logDataService.initialize(migrationResult.migratedLogs);
            } else {
                console.warn('데이터 마이그레이션에 일부 오류가 발생했습니다:', migrationResult.errors);
                await this.logDataService.initialize(storedLogs);
            }
            
            // 데모 데이터가 없으면 샘플 데이터 추가
            if (this.logDataService.getAllLogs().length === 0) {
                this.addDemoData();
            }
            
        } catch (error) {
            console.error('일지 데이터 로드 실패:', error);
            this.logDataService.setLogs([]);
            throw error;
        }
    }

    /**
     * 목적 데이터 마이그레이션 (relocation -> immigration)
     * @deprecated 이 메서드는 DataMigrationService로 이동되었습니다.
     * @private
     */
    migratePurposeData() {
        console.warn('migratePurposeData()는 더 이상 사용되지 않습니다. DataMigrationService를 사용하세요.');
        // 기존 호환성을 위해 빈 구현 유지
    }

    /**
     * 데모 데이터를 추가합니다
     */
    addDemoData() {
        const demoLogs = DemoData.getDefaultLogs();
        this.logDataService.setLogs(demoLogs);
    }

    /**
     * 새로운 로그를 추가합니다
     * @param {Object} logData - 로그 데이터
     * @returns {Object} 생성된 로그
     */
    addLog(logData) {
        const newLog = this.logDataService.addLog(logData);
        this.invalidateCache(); // 캐시 무효화
        return newLog;
    }

    /**
     * 로그를 삭제합니다
     * @param {string} logId - 삭제할 로그 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteLog(logId) {
        const deleted = this.logDataService.deleteLog(logId);
        
        if (deleted) {
            this.invalidateCache(); // 캐시 무효화
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
        const updatedLog = this.logDataService.updateLog(logId, updatedData);
        
        if (updatedLog) {
            this.invalidateCache(); // 캐시 무효화
        }
        
        return updatedLog;
    }

    /**
     * ID로 로그를 조회합니다
     * @param {string} logId - 로그 ID
     * @returns {Object|null} 로그 객체 또는 null
     */
    getLogById(logId) {
        return this.logDataService.getLogById(logId);
    }

    /**
     * 모든 로그를 조회합니다
     * @returns {Array} 로그 배열
     */
    getAllLogs() {
        return this.logDataService.getAllLogs();
    }

    /**
     * 페이지별 로그를 조회합니다
     * @param {number} page - 페이지 번호
     * @param {number} perPage - 페이지당 항목 수
     * @returns {Object} 페이지 데이터
     */
    getLogsByPage(page, perPage) {
        return this.logDataService.getLogsByPage(page, perPage);
    }

    /**
     * 현재 페이지를 설정합니다
     * @param {number} page - 페이지 번호
     */
    setCurrentPage(page) {
        this.logDataService.setCurrentPage(page);
    }

    /**
     * 로그를 정렬합니다
     * @param {string} order - 정렬 순서 ('asc' 또는 'desc')
     */
    sortLogsByDate(order) {
        this.logDataService.sortLogsByDate(order);
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
        return this.basicStatsService.getBasicStats();
    }

    /**
     * 특정 연도의 여행 데이터를 가져옵니다
     * @param {string} year - 연도
     * @returns {Object} 해당 연도의 여행 데이터
     */
    getTravelDataByYear(year) {
        return this.basicStatsService.getTravelDataByYear(year);
    }

    /**
     * 여행 목적별 비율을 분석합니다 (캐싱 적용)
     * @returns {Object} 목적별 분석 결과
     */
    getPurposeAnalysis() {
        return this.purposeAnalysisService.getPurposeAnalysis();
    }

    /**
     * 데이터 해시를 계산합니다 (캐시 무효화 확인용)
     * @returns {string} 데이터 해시
     */
    _calculateDataHash() {
        try {
            const logs = this.getAllLogs();
            const dataString = JSON.stringify(logs.map(log => ({
                id: log.id,
                purpose: log.purpose,
                startDate: log.startDate,
                endDate: log.endDate
            })));
            
            // 간단한 해시 함수 (실제 프로덕션에서는 더 정교한 해시 함수 사용)
            let hash = 0;
            for (let i = 0; i < dataString.length; i++) {
                const char = dataString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // 32비트 정수로 변환
            }
            return hash.toString();
        } catch (error) {
            console.error('데이터 해시 계산 중 오류:', error);
            return Date.now().toString(); // 폴백으로 현재 시간 사용
        }
    }

    /**
     * 목적 코드를 사용자 친화적인 이름으로 변환합니다
     * @param {string} purposeCode - 목적 코드
     * @returns {string} 표시 이름
     */
    getPurposeDisplayName(purposeCode) {
        return this.purposeAnalysisService.getPurposeDisplayName(purposeCode);
    }

    /**
     * 캐시를 무효화합니다
     */
    invalidateCache() {
        // 새로운 CacheManager를 사용하여 캐시 무효화
        this.cacheManager.invalidatePattern('.*'); // 모든 캐시 무효화
        
        // 각 서비스의 캐시도 무효화
        this.yearlyStatsService.invalidateCache();
        this.basicStatsService.invalidateCache();
        this.purposeAnalysisService.invalidateCache();
        this.countryAnalysisService.invalidateCache();
        
        // 기존 호환성을 위한 속성들도 무효화
        this._purposeAnalysisCache = null;
        this._basicStatsCache = null;
        this._favoriteCountryCache = null;
        this._lastDataHash = null;
    }

    /**
     * 주요방문국 순위 분석을 수행합니다
     * @returns {Object} 주요방문국 순위 분석 결과
     */
    getFavoriteCountryAnalysis() {
        return this.countryAnalysisService.getFavoriteCountryAnalysis();
    }

    /**
     * 국가별 통계를 계산합니다
     * @param {Array} logs - 여행 로그 배열
     * @returns {Array} 국가별 통계 배열
     */
    _calculateCountryStats(logs) {
        const countryMap = new Map();

        logs.forEach(log => {
            if (!log.country) return;

            const country = log.country;
            const startDate = new Date(log.startDate);
            const endDate = new Date(log.endDate);
            const rating = parseFloat(log.rating) || 0;

            // 유효한 날짜인지 확인
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;

            // 체류 일수 계산 (시작일과 종료일 포함)
            const stayDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

            if (!countryMap.has(country)) {
                countryMap.set(country, {
                    country: country,
                    visitCount: 0,
                    totalStayDays: 0,
                    totalRating: 0,
                    ratingCount: 0,
                    averageRating: 0,
                    lastVisitDate: null,
                    visits: []
                });
            }

            const stats = countryMap.get(country);
            stats.visitCount += 1;
            stats.totalStayDays += stayDays;
            stats.totalRating += rating;
            stats.ratingCount += 1;
            stats.averageRating = stats.totalRating / stats.ratingCount;
            
            // 최근 방문일 업데이트
            if (!stats.lastVisitDate || startDate > stats.lastVisitDate) {
                stats.lastVisitDate = startDate;
            }

            stats.visits.push({
                startDate: startDate,
                endDate: endDate,
                stayDays: stayDays,
                rating: rating
            });
        });

        return Array.from(countryMap.values());
    }

    /**
     * 5단계 우선순위로 국가를 정렬합니다
     * @param {Array} countryStats - 국가별 통계 배열
     * @returns {Array} 정렬된 국가 배열
     */
    _sortCountriesByPriority(countryStats) {
        return countryStats.sort((a, b) => {
            // 1단계: 방문 횟수 (내림차순)
            if (a.visitCount !== b.visitCount) {
                return b.visitCount - a.visitCount;
            }

            // 2단계: 총 체류 일수 (내림차순)
            if (a.totalStayDays !== b.totalStayDays) {
                return b.totalStayDays - a.totalStayDays;
            }

            // 3단계: 평균 별점 (내림차순)
            if (a.averageRating !== b.averageRating) {
                return b.averageRating - a.averageRating;
            }

            // 4단계: 최근 방문일 (내림차순)
            if (a.lastVisitDate && b.lastVisitDate) {
                if (a.lastVisitDate.getTime() !== b.lastVisitDate.getTime()) {
                    return b.lastVisitDate - a.lastVisitDate;
                }
            } else if (a.lastVisitDate && !b.lastVisitDate) {
                return -1;
            } else if (!a.lastVisitDate && b.lastVisitDate) {
                return 1;
            }

            // 5단계: 국가명 가나다순 (오름차순)
            return a.country.localeCompare(b.country, 'ko-KR');
        });
    }

    /**
     * 국가 코드를 표시명으로 변환합니다
     * @param {string} countryCode - 국가 코드
     * @returns {string} 국가 표시명
     */
    _getCountryDisplayName(countryCode) {
        // 국가 코드 매핑 (필요에 따라 확장)
        const countryNames = {
            'JP': '일본',
            'KR': '한국',
            'US': '미국',
            'GB': '영국',
            'FR': '프랑스',
            'DE': '독일',
            'IT': '이탈리아',
            'ES': '스페인',
            'CN': '중국',
            'TH': '태국',
            'SG': '싱가포르',
            'AU': '호주',
            'CA': '캐나다',
            'BR': '브라질',
            'IN': '인도',
            'RU': '러시아',
            'MX': '멕시코',
            'ID': '인도네시아',
            'TR': '터키',
            'EG': '이집트'
        };

        return countryNames[countryCode] || countryCode;
    }

    /**
     * 연도별 통계 분석을 수행합니다
     * @param {string} year - 분석할 연도
     * @returns {Object} 연도별 통계 분석 결과
     */
    getYearlyStatsAnalysis(year) {
        return this.yearlyStatsService.getYearlyStatsAnalysis(year);
    }

    /**
     * 연도별 통계를 계산합니다
     * @param {Object} yearData - 연도별 데이터
     * @returns {Object} 연도별 통계
     */
    _calculateYearlyStats(yearData) {
        if (!yearData || !yearData.logs || yearData.logs.length === 0) {
            return this._getEmptyYearlyStats();
        }

        const logs = yearData.logs;
        
        // 고유 국가 및 도시 계산
        const uniqueCountries = new Set();
        const uniqueCities = new Set();
        
        let totalTravelDays = 0;
        let totalRating = 0;
        let validRatingCount = 0;

        logs.forEach(log => {
            if (log.country) uniqueCountries.add(log.country);
            if (log.city) uniqueCities.add(log.city);
            
            // 체류 일수 계산
            const startDate = new Date(log.startDate);
            const endDate = new Date(log.endDate);
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                const stayDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                totalTravelDays += stayDays;
            }
            
            // 별점 계산
            const rating = parseFloat(log.rating);
            if (rating > 0) {
                totalRating += rating;
                validRatingCount++;
            }
        });

        const averageTravelDays = logs.length > 0 ? Math.round(totalTravelDays / logs.length * 10) / 10 : 0;
        const averageRating = validRatingCount > 0 ? Math.round(totalRating / validRatingCount * 10) / 10 : 0;

        return {
            totalTrips: logs.length,
            uniqueCountries: uniqueCountries.size,
            uniqueCities: uniqueCities.size,
            totalTravelDays: totalTravelDays,
            averageTravelDays: averageTravelDays,
            averageRating: averageRating
        };
    }

    /**
     * 연도별 증감률을 계산합니다
     * @param {Object} currentStats - 현재 연도 통계
     * @param {Object} previousStats - 전년도 통계
     * @returns {Object} 증감률 정보
     */
    _calculateYearlyChanges(currentStats, previousStats) {
        const changes = {};
        
        // 각 지표별 증감률 계산
        const metrics = [
            'totalTrips', 'uniqueCountries', 'uniqueCities', 
            'totalTravelDays', 'averageTravelDays', 'averageRating'
        ];
        
        metrics.forEach(metric => {
            const current = currentStats[metric];
            const previous = previousStats[metric];
            
            if (previous === 0) {
                changes[metric] = {
                    type: 'first',
                    value: 0,
                    display: '첫 해 기록',
                    color: 'blue'
                };
            } else {
                const changeValue = current - previous;
                const changePercent = Math.round((changeValue / previous) * 100);
                
                // 각 지표별 표시 형식 설정
                const formatChangeValue = (value) => {
                    if (metric === 'averageRating') {
                        return value > 0 ? `+${value.toFixed(1)}점` : `${value.toFixed(1)}점`;
                    } else if (metric === 'totalTravelDays' || metric === 'averageTravelDays') {
                        return value > 0 ? `+${value}일` : `${value}일`;
                    } else if (metric === 'totalTrips') {
                        return value > 0 ? `+${value}회` : `${value}회`;
                    } else {
                        return value > 0 ? `+${value}개` : `${value}개`;
                    }
                };
                
                if (changeValue > 0) {
                    changes[metric] = {
                        type: 'positive',
                        value: changeValue,
                        percent: changePercent,
                        display: formatChangeValue(changeValue),
                        displayPercent: `+${changePercent}%`,
                        color: 'green'
                    };
                } else if (changeValue < 0) {
                    changes[metric] = {
                        type: 'negative',
                        value: changeValue,
                        percent: changePercent,
                        display: formatChangeValue(changeValue),
                        displayPercent: `${changePercent}%`,
                        color: 'red'
                    };
                } else {
                    // 중립 상태일 때의 표시 형식
                    let neutralDisplay = '0개';
                    if (metric === 'averageRating') {
                        neutralDisplay = '0.0점';
                    } else if (metric === 'totalTravelDays' || metric === 'averageTravelDays') {
                        neutralDisplay = '0일';
                    } else if (metric === 'totalTrips') {
                        neutralDisplay = '0회';
                    }
                    
                    changes[metric] = {
                        type: 'neutral',
                        value: 0,
                        percent: 0,
                        display: neutralDisplay,
                        displayPercent: '0%',
                        color: 'gray'
                    };
                }
            }
        });
        
        return changes;
    }

    /**
     * 빈 연도별 통계를 반환합니다
     * @returns {Object} 빈 통계 객체
     */
    _getEmptyYearlyStats() {
        return {
            totalTrips: 0,
            uniqueCountries: 0,
            uniqueCities: 0,
            totalTravelDays: 0,
            averageTravelDays: 0,
            averageRating: 0
        };
    }

    /**
     * 빈 증감률 정보를 반환합니다
     * @returns {Object} 빈 증감률 객체
     */
    _getEmptyChanges() {
        const changes = {};
        const metrics = [
            'totalTrips', 'uniqueCountries', 'uniqueCities', 
            'totalTravelDays', 'averageTravelDays', 'averageRating'
        ];
        
        metrics.forEach(metric => {
            changes[metric] = {
                type: 'first',
                value: 0,
                display: '첫 해 기록',
                color: 'blue'
            };
        });
        
        return changes;
    }

    /**
     * 사용 가능한 연도 목록을 반환합니다
     * @returns {Array} 연도 목록 (최신순)
     */
    getAvailableYears() {
        return this.basicStatsService.getAvailableYears();
    }

    /**
     * 컨트롤러 정리
     */
    cleanup() {
        this.isInitialized = false;
        
        // 새로운 서비스들 정리
        this.logDataService.cleanup();
        this.cacheManager.destroy();
        this.dataMigrationService.cleanup();
        
        // 분석 서비스들 정리
        this.basicStatsService.cleanup();
        this.purposeAnalysisService.cleanup();
        this.countryAnalysisService.cleanup();
        this.yearlyStatsService.cleanup();
        
        // 기존 호환성을 위한 정리
        this.invalidateCache();
    }

    // ===============================
    // 여행 도감 관련 메서드들
    // ===============================

    /**
     * 여행 도감 뷰를 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    async renderTravelCollection(container) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            await this.travelCollectionView.render(container);
        } catch (error) {
            console.error('여행 도감 렌더링 실패:', error);
            throw error;
        }
    }

    /**
     * 방문한 국가 목록을 반환합니다
     * @returns {Object} 방문한 국가 정보
     */
    getVisitedCountries() {
        const logs = this.getAllLogs();
        const visitedCountries = {};
        
        logs.forEach(log => {
            const countryCode = log.country;
            if (!countryCode) return;
            
            if (!visitedCountries[countryCode]) {
                visitedCountries[countryCode] = {
                    count: 0,
                    totalDays: 0,
                    lastVisit: null,
                    logs: []
                };
            }
            
            visitedCountries[countryCode].count++;
            visitedCountries[countryCode].logs.push(log);
            
            // 체류 일수 계산
            if (log.startDate && log.endDate) {
                const start = new Date(log.startDate);
                const end = new Date(log.endDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                visitedCountries[countryCode].totalDays += diffDays;
            }
            
            // 최근 방문일 업데이트
            const logDate = log.endDate || log.startDate || log.createdAt;
            if (logDate) {
                if (!visitedCountries[countryCode].lastVisit || 
                    new Date(logDate) > new Date(visitedCountries[countryCode].lastVisit)) {
                    visitedCountries[countryCode].lastVisit = logDate;
                }
            }
        });
        
        // CountriesCollectionView에서 필요한 형태로 데이터 변환
        const visitedCountryCodes = Object.keys(visitedCountries);
        
        return {
            visitedCountryCodes: visitedCountryCodes,
            countries: visitedCountries,
            totalCount: visitedCountryCodes.length
        };
    }

    /**
     * 대륙별 방문 통계를 반환합니다
     * @returns {Object} 대륙별 통계
     */
    getContinentStats() {
        if (!countriesManager.isInitialized) {
            return {};
        }
        
        const visitedCountries = this.getVisitedCountries();
        const continentStats = {};
        
        // 모든 대륙 초기화
        const continents = countriesManager.getContinents();
        Object.keys(continents).forEach(continent => {
            continentStats[continent] = {
                nameKo: continents[continent].nameKo,
                total: continents[continent].count,
                visited: 0,
                percentage: 0
            };
        });
        
        // 방문한 국가들을 대륙별로 집계
        Object.keys(visitedCountries).forEach(countryCode => {
            const country = countriesManager.getCountryByCode(countryCode);
            if (country && continentStats[country.continent]) {
                continentStats[country.continent].visited++;
            }
        });
        
        // 퍼센티지 계산
        Object.keys(continentStats).forEach(continent => {
            const stats = continentStats[continent];
            stats.percentage = stats.total > 0 ? Math.round((stats.visited / stats.total) * 100) : 0;
        });
        
        return continentStats;
    }

    /**
     * 여행 도감 관련 통계를 반환합니다
     * @returns {Object} 여행 도감 통계
     */
    getTravelCollectionStats() {
        const visitedCountries = this.getVisitedCountries();
        const continentStats = this.getContinentStats();
        const totalCountries = 195; // 전 세계 총 국가 수
        const visitedTotal = Object.keys(visitedCountries).length;
        
        return {
            total: totalCountries,
            visited: visitedTotal,
            percentage: Math.round((visitedTotal / totalCountries) * 100),
            continents: continentStats,
            visitedCountries: visitedCountries
        };
    }


    /**
     * 국가별 여행 일지를 반환합니다
     * @param {string} countryCode - 국가 코드
     * @returns {Array} 해당 국가의 여행 일지 목록
     */
    getLogsByCountry(countryCode) {
        return this.getAllLogs().filter(log => log.country === countryCode);
    }

    /**
     * 여행 도감 뷰 정리
     */
    cleanupTravelCollection() {
        if (this.travelCollectionView) {
            this.travelCollectionView.cleanup();
        }
    }

    /**
     * 전세계 탐험 현황 통계를 계산합니다
     * @returns {Object} 전세계 탐험 현황 통계
     */
    getWorldExplorationStats() {
        try {
            const logs = this.getAllLogs();
            const visitedCountrySet = new Set();
            
            // 방문한 국가들 수집
            logs.forEach(log => {
                if (log.country) {
                    visitedCountrySet.add(log.country);
                }
            });
            
            const totalCountries = 195; // 전 세계 총 국가 수
            const visitedCountries = visitedCountrySet.size;
            const progressPercentage = Math.round((visitedCountries / totalCountries) * 100);
            
            // 대륙별 통계 계산
            const continentStats = this.getContinentStats();
            
            return {
                totalCountries: totalCountries,
                visitedCountries: visitedCountries,
                progressPercentage: progressPercentage,
                continentStats: continentStats,
                hasData: visitedCountries > 0
            };
        } catch (error) {
            console.error('MyLogsController: 전세계 탐험 현황 통계 계산 오류:', error);
            return {
                totalCountries: 195,
                visitedCountries: 0,
                progressPercentage: 0,
                continentStats: this.getDefaultContinentStats(),
                hasData: false
            };
        }
    }

    /**
     * 대륙별 통계를 계산합니다
     * @returns {Array} 대륙별 통계 배열
     */
    getContinentStats() {
        try {
            const logs = this.getAllLogs();
            const visitedCountriesByContinent = {};
            
            // 방문한 국가들을 대륙별로 분류
            logs.forEach(log => {
                if (log.country) {
                    const continent = this.getCountryContinent(log.country);
                    if (continent) {
                        if (!visitedCountriesByContinent[continent]) {
                            visitedCountriesByContinent[continent] = new Set();
                        }
                        visitedCountriesByContinent[continent].add(log.country);
                    }
                }
            });
            
            // 대륙별 정보 정의 (실제 국가 수 기준)
            const continentInfo = {
                'Asia': { nameKo: '아시아', emoji: '🌏', total: 48 },
                'Europe': { nameKo: '유럽', emoji: '🇪🇺', total: 44 },
                'North America': { nameKo: '북미', emoji: '🇺🇸', total: 23 },
                'South America': { nameKo: '남미', emoji: '🌎', total: 12 },
                'Africa': { nameKo: '아프리카', emoji: '🌍', total: 54 },
                'Oceania': { nameKo: '오세아니아', emoji: '🇦🇺', total: 14 }
            };
            
            // 대륙별 통계 생성
            return Object.entries(continentInfo).map(([continent, info]) => {
                const visited = visitedCountriesByContinent[continent] ? visitedCountriesByContinent[continent].size : 0;
                const percentage = Math.round((visited / info.total) * 100);
                
                return {
                    continent: continent,
                    nameKo: info.nameKo,
                    emoji: info.emoji,
                    visited: visited,
                    total: info.total,
                    percentage: percentage
                };
            });
        } catch (error) {
            console.error('MyLogsController: 대륙별 통계 계산 오류:', error);
            return this.getDefaultContinentStats();
        }
    }

    /**
     * 기본 대륙별 통계를 반환합니다 (에러 시 fallback)
     * @returns {Array} 기본 대륙별 통계
     */
    getDefaultContinentStats() {
        return [
            { continent: 'Asia', nameKo: '아시아', emoji: '🌏', visited: 0, total: 48, percentage: 0 },
            { continent: 'Europe', nameKo: '유럽', emoji: '🇪🇺', visited: 0, total: 44, percentage: 0 },
            { continent: 'North America', nameKo: '북미', emoji: '🇺🇸', visited: 0, total: 23, percentage: 0 },
            { continent: 'South America', nameKo: '남미', emoji: '🌎', visited: 0, total: 12, percentage: 0 },
            { continent: 'Africa', nameKo: '아프리카', emoji: '🌍', visited: 0, total: 54, percentage: 0 },
            { continent: 'Oceania', nameKo: '오세아니아', emoji: '🇦🇺', visited: 0, total: 14, percentage: 0 }
        ];
    }

    /**
     * 국가의 대륙을 반환합니다
     * @param {string} countryCode - 국가 코드
     * @returns {string|null} 대륙명
     */
    getCountryContinent(countryCode) {
        // 간단한 국가-대륙 매핑 (실제로는 countriesManager에서 가져와야 함)
        const countryToContinentMap = {
            // 아시아
            'JP': 'Asia', 'KR': 'Asia', 'CN': 'Asia', 'TH': 'Asia', 'VN': 'Asia', 'SG': 'Asia',
            'MY': 'Asia', 'ID': 'Asia', 'PH': 'Asia', 'IN': 'Asia', 'TR': 'Asia', 'AE': 'Asia',
            
            // 유럽
            'FR': 'Europe', 'DE': 'Europe', 'IT': 'Europe', 'ES': 'Europe', 'GB': 'Europe', 'NL': 'Europe',
            'BE': 'Europe', 'CH': 'Europe', 'AT': 'Europe', 'PT': 'Europe', 'GR': 'Europe', 'CZ': 'Europe',
            
            // 북미
            'US': 'North America', 'CA': 'North America', 'MX': 'North America',
            
            // 남미
            'BR': 'South America', 'AR': 'South America', 'CL': 'South America', 'PE': 'South America',
            
            // 아프리카
            'EG': 'Africa', 'ZA': 'Africa', 'MA': 'Africa', 'KE': 'Africa',
            
            // 오세아니아
            'AU': 'Oceania', 'NZ': 'Oceania', 'FJ': 'Oceania'
        };
        
        return countryToContinentMap[countryCode] || null;
    }
}

export { MyLogsController };
