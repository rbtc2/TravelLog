/**
 * MyLogsController - 나의 로그 탭의 비즈니스 로직을 담당하는 컨트롤러
 * 
 * 책임:
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
import { TravelCollectionView, TravelReportView } from '../views/index.js';


// 컬렉션 모듈들
import { TravelCollectionController } from './TravelCollectionController.js';
import { CollectionDataManager } from './CollectionDataManager.js';
import { CollectionRenderer } from './CollectionRenderer.js';

// 로그 관리 모듈들
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
        
        // 컬렉션 모듈들 초기화
        this.travelCollectionController = new TravelCollectionController(this.logDataService, this.cacheManager);
        this.collectionDataManager = new CollectionDataManager();
        this.collectionRenderer = new CollectionRenderer();
        
        // 로그 관리 모듈들 초기화
        this.travelLogController = new TravelLogController(this.logDataService, this.cacheManager);
        this.logValidator = new LogValidator();
        this.logDataManager = new LogDataManager();
        this.logRenderer = new LogRenderer();
        
        // 뷰 인스턴스들 초기화
        this.travelCollectionView = new TravelCollectionView(this);
        this.travelReportView = new TravelReportView(this);
        
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
            
            // 컬렉션 컨트롤러 초기화
            await this.travelCollectionController.initialize();
            
            // 로그 관리 모듈들 초기화
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
     * 데모 데이터를 추가합니다
     */
    addDemoData() {
        const demoLogs = DemoData.getDefaultLogs();
        this.logDataService.setLogs(demoLogs);
        
        // 분석 데이터 테스트
        try {
            this.getBasicStats();
            this.getFavoriteCountryAnalysis();
            this.getWorldExplorationStats();
        } catch (error) {
            // 분석 데이터 테스트 실패 시 무시
        }
    }

    /**
     * 새로운 로그를 추가합니다
     * @param {Object} logData - 로그 데이터
     * @returns {Object} 생성된 로그
     */
    addLog(logData) {
        return this.travelLogController.addLog(logData);
    }

    /**
     * 로그를 삭제합니다
     * @param {string} logId - 삭제할 로그 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteLog(logId) {
        return this.travelLogController.deleteLog(logId);
    }

    /**
     * 로그를 업데이트합니다
     * @param {string} logId - 업데이트할 로그 ID
     * @param {Object} updatedData - 업데이트할 데이터
     * @returns {Object|null} 업데이트된 로그 또는 null
     */
    updateLog(logId, updatedData) {
        return this.travelLogController.updateLog(logId, updatedData);
    }

    /**
     * ID로 로그를 조회합니다
     * @param {string} logId - 로그 ID
     * @returns {Object|null} 로그 객체 또는 null
     */
    getLogById(logId) {
        return this.travelLogController.getLogById(logId);
    }

    /**
     * 모든 로그를 조회합니다
     * @returns {Array} 로그 배열
     */
    getAllLogs(options = {}) {
        return this.travelLogController.getAllLogs(options);
    }

    /**
     * 로그를 검색합니다
     * @param {Object} searchCriteria - 검색 조건
     * @returns {Array} 검색 결과
     */
    searchLogs(searchCriteria) {
        return this.travelLogController.searchLogs(searchCriteria);
    }

    /**
     * 국가별 로그를 조회합니다
     * @param {string} countryCode - 국가 코드
     * @returns {Array} 해당 국가의 로그 배열
     */
    getLogsByCountry(countryCode) {
        return this.travelLogController.getLogsByCountry(countryCode);
    }

    /**
     * 연도별 로그를 조회합니다
     * @param {number} year - 연도
     * @returns {Array} 해당 연도의 로그 배열
     */
    getLogsByYear(year) {
        return this.travelLogController.getLogsByYear(year);
    }

    /**
     * 로그 통계를 계산합니다
     * @param {Object} options - 통계 옵션
     * @returns {Object} 로그 통계
     */
    getLogStatistics(options = {}) {
        return this.travelLogController.getLogStatistics(options);
    }

    /**
     * 로그 목록을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     * @param {Object} options - 렌더링 옵션
     */
    renderLogList(container, options = {}) {
        this.travelLogController.renderLogList(container, options);
    }

    /**
     * 로그 상세 정보를 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     * @param {string} logId - 로그 ID
     */
    renderLogDetail(container, logId) {
        this.travelLogController.renderLogDetail(container, logId);
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
                return null;
            }
            return countriesManager.getCountryByCode(countryCode);
        } catch (error) {
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
     * 국가별 방문 횟수를 가져옵니다
     * @returns {Map} 국가 코드를 키로 하는 방문 횟수 Map
     */
    getCountryVisitCounts() {
        return this.travelCollectionController.getCountryVisitCounts();
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
        
        // 컬렉션 모듈들 정리
        if (this.travelCollectionController && this.travelCollectionController.cleanup) {
            this.travelCollectionController.cleanup();
        }
        if (this.collectionDataManager && this.collectionDataManager.cleanup) {
            this.collectionDataManager.cleanup();
        }
        if (this.collectionRenderer && this.collectionRenderer.cleanup) {
            this.collectionRenderer.cleanup();
        }
        
        // 로그 관리 모듈들 정리
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
            
            // 새로운 컬렉션 시스템 사용
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
     * 방문한 국가 목록을 반환합니다
     * @returns {Object} 방문한 국가 정보
     */
    getVisitedCountriesForCollection() {
        try {
            return this.travelCollectionController.getVisitedCountries();
        } catch (error) {
            return this.getVisitedCountries();
        }
    }

    /**
     * 방문한 국가 목록을 반환합니다 (기존 호환성 유지)
     * @returns {Object} 방문한 국가 정보
     */
    getVisitedCountries() {
        return this.travelCollectionController.getVisitedCountries();
    }

    /**
     * 국가별 방문 횟수를 반환합니다
     * @returns {Map} 국가별 방문 횟수 Map
     */
    getCountryVisitCounts() {
        return this.travelCollectionController.getCountryVisitCounts();
    }

    /**
     * 대륙별 방문 통계를 반환합니다
     * @returns {Object} 대륙별 통계
     */
    getContinentStats() {
        return this.travelCollectionController.getContinentStats();
    }

    /**
     * 여행 도감 관련 통계를 반환합니다
     * @returns {Object} 여행 도감 통계
     */
    getTravelCollectionStats() {
        return this.travelCollectionController.getTravelCollectionStats();
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
     * 트래블 레포트를 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    async renderTravelReport(container) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            // 트래블 레포트 뷰 렌더링
            await this.travelReportView.render(container);
        } catch (error) {
            console.error('트래블 레포트 렌더링 실패:', error);
            container.innerHTML = '<div class="error-message">트래블 레포트를 불러올 수 없습니다.</div>';
        }
    }

    /**
     * 트래블 레포트 뷰 정리
     */
    cleanupTravelReport() {
        if (this.travelReportView) {
            this.travelReportView.cleanup();
        }
    }

    /**
     * 전세계 탐험 현황 통계를 계산합니다
     * @returns {Object} 전세계 탐험 현황 통계
     */
    getWorldExplorationStats() {
        return this.travelCollectionController.getWorldExplorationStats();
    }


    /**
     * 국가 코드를 표시명으로 변환합니다
     * @param {string} countryCode - 국가 코드
     * @returns {string} 국가 표시명
     */
    _getCountryDisplayName(countryCode) {
        const countryInfo = this.getCountryByCode(countryCode);
        return countryInfo ? countryInfo.nameKo : countryCode;
    }
}

export { MyLogsController };

