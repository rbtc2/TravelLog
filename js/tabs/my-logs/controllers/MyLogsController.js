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

// 🚀 새로운 분석 모듈들 (Phase 1 리팩토링)
// import { AnalysisOrchestrator } from '../../../modules/analysis/AnalysisOrchestrator.js';

// 🚀 Phase 2: 새로운 컬렉션 모듈들
import { TravelCollectionController } from './TravelCollectionController.js';
import { CollectionDataManager } from './CollectionDataManager.js';
import { CollectionRenderer } from './CollectionRenderer.js';

// 🚀 Phase 3: 새로운 로그 관리 모듈들
import { TravelLogController } from './TravelLogController.js';
import { LogValidator } from './LogValidator.js';
import { LogDataManager } from './LogDataManager.js';
import { LogRenderer } from './LogRenderer.js';

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
        
        // 🚀 새로운 분석 오케스트레이터 초기화 (Phase 1)
        // this.analysisOrchestrator = new AnalysisOrchestrator(this.logDataService, this.cacheManager);
        
        // 🚀 Phase 2: 새로운 컬렉션 모듈들 초기화
        this.travelCollectionController = new TravelCollectionController(this.logDataService, this.cacheManager);
        this.collectionDataManager = new CollectionDataManager();
        this.collectionRenderer = new CollectionRenderer();
        
        // 🚀 Phase 3: 새로운 로그 관리 모듈들 초기화
        this.travelLogController = new TravelLogController(this.logDataService, this.cacheManager);
        this.logValidator = new LogValidator();
        this.logDataManager = new LogDataManager();
        this.logRenderer = new LogRenderer();
        
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
            
            // 🚀 Phase 2: 컬렉션 컨트롤러 초기화
            await this.travelCollectionController.initialize();
            
            // 🚀 Phase 3: 로그 관리 모듈들 초기화
            await this.travelLogController.initialize();
            await this.logValidator.initialize();
            await this.logDataManager.initialize();
            await this.logRenderer.initialize();
            
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
        console.log('MyLogsController: 데모 데이터 추가 중, 로그 수:', demoLogs.length);
        this.logDataService.setLogs(demoLogs);
        
        // 데이터 추가 후 확인
        const allLogs = this.logDataService.getAllLogs();
        console.log('MyLogsController: 데이터 추가 완료, 총 로그 수:', allLogs.length);
        
        // 분석 데이터 테스트
        // try {
        //     const basicStats = this.analysisOrchestrator.getBasicStats();
        //     console.log('MyLogsController: 기본 통계 테스트:', basicStats);
        //     
        //     const countryAnalysis = this.analysisOrchestrator.getFavoriteCountryAnalysis();
        //     console.log('MyLogsController: 국가 분석 테스트:', countryAnalysis);
        //     
        //     const worldStats = this.analysisOrchestrator.getWorldExplorationStats();
        //     console.log('MyLogsController: 세계 탐험 통계 테스트:', worldStats);
        // } catch (error) {
        //     console.error('MyLogsController: 분석 데이터 테스트 실패:', error);
        // }
        
        // 임시로 기존 서비스 테스트
        try {
            const basicStats = this.getBasicStats();
            console.log('MyLogsController: 기본 통계 테스트:', basicStats);
            
            const countryAnalysis = this.getFavoriteCountryAnalysis();
            console.log('MyLogsController: 국가 분석 테스트:', countryAnalysis);
            
            const worldStats = this.getWorldExplorationStats();
            console.log('MyLogsController: 세계 탐험 통계 테스트:', worldStats);
        } catch (error) {
            console.error('MyLogsController: 분석 데이터 테스트 실패:', error);
        }
    }

    /**
     * 새로운 로그를 추가합니다
     * @param {Object} logData - 로그 데이터
     * @returns {Object} 생성된 로그
     */
    addLog(logData) {
        try {
            // 🚀 Phase 3: 새로운 로그 컨트롤러로 위임
            return this.travelLogController.addLog(logData);
        } catch (error) {
            console.error('MyLogsController: addLog 실패, fallback 사용:', error);
            // 안전장치: 기존 로직으로 fallback
            const newLog = this.logDataService.addLog(logData);
            this.invalidateCache();
            return newLog;
        }
    }

    /**
     * 로그를 삭제합니다
     * @param {string} logId - 삭제할 로그 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteLog(logId) {
        try {
            // 🚀 Phase 3: 새로운 로그 컨트롤러로 위임
            return this.travelLogController.deleteLog(logId);
        } catch (error) {
            console.error('MyLogsController: deleteLog 실패, fallback 사용:', error);
            // 안전장치: 기존 로직으로 fallback
            const deleted = this.logDataService.deleteLog(logId);
            if (deleted) {
                this.invalidateCache();
            }
            return deleted;
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
            // 🚀 Phase 3: 새로운 로그 컨트롤러로 위임
            return this.travelLogController.updateLog(logId, updatedData);
        } catch (error) {
            console.error('MyLogsController: updateLog 실패, fallback 사용:', error);
            // 안전장치: 기존 로직으로 fallback
            const updatedLog = this.logDataService.updateLog(logId, updatedData);
            if (updatedLog) {
                this.invalidateCache();
            }
            return updatedLog;
        }
    }

    /**
     * ID로 로그를 조회합니다
     * @param {string} logId - 로그 ID
     * @returns {Object|null} 로그 객체 또는 null
     */
    getLogById(logId) {
        try {
            // 🚀 Phase 3: 새로운 로그 컨트롤러로 위임
            return this.travelLogController.getLogById(logId);
        } catch (error) {
            console.error('MyLogsController: getLogById 실패, fallback 사용:', error);
            // 안전장치: 기존 로직으로 fallback
            return this.logDataService.getLogById(logId);
        }
    }

    /**
     * 모든 로그를 조회합니다
     * @returns {Array} 로그 배열
     */
    getAllLogs(options = {}) {
        try {
            // 🚀 Phase 3: 새로운 로그 컨트롤러로 위임
            return this.travelLogController.getAllLogs(options);
        } catch (error) {
            console.error('MyLogsController: getAllLogs 실패, fallback 사용:', error);
            // 안전장치: 기존 로직으로 fallback
            return this.logDataService.getAllLogs();
        }
    }

    /**
     * 로그를 검색합니다 (Phase 3: 새로운 기능)
     * @param {Object} searchCriteria - 검색 조건
     * @returns {Array} 검색 결과
     */
    searchLogs(searchCriteria) {
        try {
            return this.travelLogController.searchLogs(searchCriteria);
        } catch (error) {
            console.error('MyLogsController: searchLogs 실패:', error);
            return [];
        }
    }

    /**
     * 국가별 로그를 조회합니다 (Phase 3: 새로운 기능)
     * @param {string} countryCode - 국가 코드
     * @returns {Array} 해당 국가의 로그 배열
     */
    getLogsByCountry(countryCode) {
        try {
            return this.travelLogController.getLogsByCountry(countryCode);
        } catch (error) {
            console.error('MyLogsController: getLogsByCountry 실패:', error);
            return [];
        }
    }

    /**
     * 연도별 로그를 조회합니다 (Phase 3: 새로운 기능)
     * @param {number} year - 연도
     * @returns {Array} 해당 연도의 로그 배열
     */
    getLogsByYear(year) {
        try {
            return this.travelLogController.getLogsByYear(year);
        } catch (error) {
            console.error('MyLogsController: getLogsByYear 실패:', error);
            return [];
        }
    }

    /**
     * 로그 통계를 계산합니다 (Phase 3: 새로운 기능)
     * @param {Object} options - 통계 옵션
     * @returns {Object} 로그 통계
     */
    getLogStatistics(options = {}) {
        try {
            return this.travelLogController.getLogStatistics(options);
        } catch (error) {
            console.error('MyLogsController: getLogStatistics 실패:', error);
            return {};
        }
    }

    /**
     * 로그 목록을 렌더링합니다 (Phase 3: 새로운 기능)
     * @param {HTMLElement} container - 렌더링할 컨테이너
     * @param {Object} options - 렌더링 옵션
     */
    renderLogList(container, options = {}) {
        try {
            this.travelLogController.renderLogList(container, options);
        } catch (error) {
            console.error('MyLogsController: renderLogList 실패:', error);
            container.innerHTML = this.logRenderer.renderError('로그 목록을 불러올 수 없습니다.');
        }
    }

    /**
     * 로그 상세 정보를 렌더링합니다 (Phase 3: 새로운 기능)
     * @param {HTMLElement} container - 렌더링할 컨테이너
     * @param {string} logId - 로그 ID
     */
    renderLogDetail(container, logId) {
        try {
            this.travelLogController.renderLogDetail(container, logId);
        } catch (error) {
            console.error('MyLogsController: renderLogDetail 실패:', error);
            container.innerHTML = this.logRenderer.renderError('로그 상세 정보를 불러올 수 없습니다.');
        }
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
        try {
            return this.countryAnalysisService.getFavoriteCountryAnalysis();
        } catch (error) {
            console.error('MyLogsController: getFavoriteCountryAnalysis 실패:', error);
            return {
                top3Countries: [],
                hasData: false,
                totalVisitedCountries: 0
            };
        }
    }

    /**
     * 국가별 방문 횟수를 가져옵니다
     * @returns {Map} 국가 코드를 키로 하는 방문 횟수 Map
     */
    getCountryVisitCounts() {
        try {
            return this.travelCollectionController.getCountryVisitCounts();
        } catch (error) {
            console.error('MyLogsController: getCountryVisitCounts 실패:', error);
            return new Map();
        }
    }




    /**
     * 연도별 통계 분석을 수행합니다
     * @param {string} year - 분석할 연도
     * @returns {Object} 연도별 통계 분석 결과
     */
    getYearlyStatsAnalysis(year) {
        try {
            return this.yearlyStatsService.getYearlyStatsAnalysis(year);
        } catch (error) {
            console.error('MyLogsController: getYearlyStatsAnalysis 실패:', error);
            return {
                stats: {
                    totalTrips: 0,
                    uniqueCountries: 0,
                    uniqueCities: 0,
                    totalTravelDays: 0,
                    averageTravelDays: 0,
                    averageRating: 0
                },
                changes: {},
                hasData: false
            };
        }
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
        
        // 🚀 Phase 2: 새로운 컬렉션 모듈들 정리
        if (this.travelCollectionController && this.travelCollectionController.cleanup) {
            this.travelCollectionController.cleanup();
        }
        if (this.collectionDataManager && this.collectionDataManager.cleanup) {
            this.collectionDataManager.cleanup();
        }
        if (this.collectionRenderer && this.collectionRenderer.cleanup) {
            this.collectionRenderer.cleanup();
        }
        
        // 🚀 Phase 3: 새로운 로그 관리 모듈들 정리
        if (this.travelLogController && this.travelLogController.cleanup) {
            this.travelLogController.cleanup();
        }
        if (this.logValidator && this.logValidator.cleanup) {
            this.logValidator.cleanup();
        }
        if (this.logDataManager && this.logDataManager.cleanup) {
            this.logDataManager.cleanup();
        }
        if (this.logRenderer && this.logRenderer.cleanup) {
            this.logRenderer.cleanup();
        }
        
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
            
            // 🚀 Phase 2: 새로운 컬렉션 시스템 사용
            const collectionStats = this.travelCollectionController.getTravelCollectionStats();
            const extendedStats = this.collectionDataManager.calculateExtendedCollectionStats(collectionStats);
            
            // 메인 화면 렌더링
            container.innerHTML = this.collectionRenderer.renderCollectionMain(extendedStats);
            
            // 기존 뷰 시스템과의 호환성을 위해 뷰도 렌더링
            await this.travelCollectionView.render(container);
        } catch (error) {
            console.error('여행 도감 렌더링 실패:', error);
            container.innerHTML = this.collectionRenderer.renderError('여행 도감을 불러올 수 없습니다.');
        }
    }

    /**
     * 방문한 국가 목록을 반환합니다 (Phase 2: 새로운 컬렉션 컨트롤러로 위임)
     * @returns {Object} 방문한 국가 정보
     */
    getVisitedCountriesForCollection() {
        try {
            return this.travelCollectionController.getVisitedCountries();
        } catch (error) {
            console.error('MyLogsController: getVisitedCountriesForCollection 실패, fallback 사용:', error);
            return this.getVisitedCountries();
        }
    }

    /**
     * 방문한 국가 목록을 반환합니다 (기존 호환성 유지)
     * @returns {Object} 방문한 국가 정보
     */
    getVisitedCountries() {
        try {
            return this.travelCollectionController.getVisitedCountries();
        } catch (error) {
            console.error('MyLogsController: getVisitedCountries 실패:', error);
            return { visitedCountryCodes: [], countries: {} };
        }
    }

    /**
     * 대륙별 방문 통계를 반환합니다
     * @returns {Object} 대륙별 통계
     */
    getContinentStats() {
        try {
            return this.travelCollectionController.getContinentStats();
        } catch (error) {
            console.error('MyLogsController: getContinentStats 실패:', error);
            return [];
        }
    }

    /**
     * 여행 도감 관련 통계를 반환합니다
     * @returns {Object} 여행 도감 통계
     */
    getTravelCollectionStats() {
        try {
            return this.travelCollectionController.getTravelCollectionStats();
        } catch (error) {
            console.error('MyLogsController: getTravelCollectionStats 실패:', error);
            return {
                total: 195,
                visited: 0,
                percentage: 0,
                continents: [],
                visitedCountries: { visitedCountryCodes: [], countries: {} }
            };
        }
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
            // 기존 로직을 직접 구현
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
            console.error('MyLogsController: getWorldExplorationStats 실패:', error);
            return {
                totalCountries: 195,
                visitedCountries: 0,
                progressPercentage: 0,
                continentStats: [],
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
            return this.travelCollectionController.getContinentStats();
        } catch (error) {
            console.error('MyLogsController: getContinentStats 실패:', error);
            return [];
        }
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
}

export { MyLogsController };

