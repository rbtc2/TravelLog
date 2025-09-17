/**
 * Analysis Orchestrator - 분석 서비스들의 조정자
 * 
 * 🎯 책임:
 * - 분석 관련 서비스들의 초기화 및 관리
 * - 분석 요청의 라우팅 및 조정
 * - 캐시 관리 및 성능 최적화
 * - 에러 처리 및 fallback 제공
 * 
 * @class AnalysisOrchestrator
 * @version 1.0.0
 * @since 2024-12-29
 */

import { CountryAnalysisManager } from './CountryAnalysisManager.js';
import { ExplorationStatsManager } from './ExplorationStatsManager.js';
import { YearlyComparisonManager } from './YearlyComparisonManager.js';

class AnalysisOrchestrator {
    constructor(logDataService, cacheManager) {
        // 의존성 주입으로 안전한 설계
        this.logDataService = logDataService;
        this.cacheManager = cacheManager;
        
        // 🚀 호환성을 위해 매니저들을 즉시 초기화
        try {
            console.log('AnalysisOrchestrator: CountryAnalysisManager 초기화 중...');
            this.countryAnalysis = new CountryAnalysisManager(logDataService, cacheManager);
            console.log('AnalysisOrchestrator: CountryAnalysisManager 초기화 완료');
            
            console.log('AnalysisOrchestrator: ExplorationStatsManager 초기화 중...');
            this.explorationStats = new ExplorationStatsManager(logDataService, cacheManager);
            console.log('AnalysisOrchestrator: ExplorationStatsManager 초기화 완료');
            
            console.log('AnalysisOrchestrator: YearlyComparisonManager 초기화 중...');
            this.yearlyComparison = new YearlyComparisonManager(logDataService, cacheManager);
            console.log('AnalysisOrchestrator: YearlyComparisonManager 초기화 완료');
        } catch (error) {
            console.error('AnalysisOrchestrator: 매니저 초기화 실패:', error);
            // fallback으로 null 설정
            this.countryAnalysis = null;
            this.explorationStats = null;
            this.yearlyComparison = null;
        }
        
        this.isInitialized = true;
        
        // 에러 처리를 위한 fallback 데이터
        this.fallbackData = {
            basicStats: {
                totalTrips: 0,
                uniqueCountries: 0,
                uniqueCities: 0,
                totalTravelDays: 0,
                averageRating: 0
            },
            purposeAnalysis: {
                purposes: {},
                totalCount: 0
            },
            countryAnalysis: {
                favoriteCountries: [],
                totalVisitedCountries: 0
            }
        };
    }

    /**
     * 분석 매니저들 초기화 (지연 초기화)
     * @private
     */
    async _initializeManagers() {
        if (this.isInitialized) return;

        try {
            // 각 매니저를 순차적으로 안전하게 초기화
            this.countryAnalysis = new CountryAnalysisManager(this.logDataService, this.cacheManager);
            this.explorationStats = new ExplorationStatsManager(this.logDataService, this.cacheManager);
            this.yearlyComparison = new YearlyComparisonManager(this.logDataService, this.cacheManager);

            this.isInitialized = true;
        } catch (error) {
            console.error('AnalysisOrchestrator: 매니저 초기화 실패:', error);
            // 초기화 실패 시 fallback 모드로 전환
            this.isInitialized = false;
            throw error;
        }
    }

    /**
     * 안전한 분석 실행을 위한 래퍼 메서드
     * @param {Function} analysisFunction - 실행할 분석 함수
     * @param {*} fallbackValue - 실패 시 반환할 기본값
     * @param {string} operationName - 작업명 (로깅용)
     * @returns {*} 분석 결과 또는 fallback 값
     * @private
     */
    async _safeExecute(analysisFunction, fallbackValue, operationName) {
        try {
            await this._initializeManagers();
            return await analysisFunction();
        } catch (error) {
            console.error(`AnalysisOrchestrator: ${operationName} 실행 실패:`, error);
            return fallbackValue;
        }
    }

    /**
     * 기본 통계를 안전하게 가져옵니다 (동기 버전 - 호환성)
     * @returns {Object} 기본 통계 정보
     */
    getBasicStats() {
        try {
            // 동기적으로 직접 실행하여 호환성 유지
            const logs = this.logDataService.getAllLogs();
            return this._calculateBasicStats(logs);
        } catch (error) {
            console.error('AnalysisOrchestrator: getBasicStats 실행 실패:', error);
            return this.fallbackData.basicStats;
        }
    }

    /**
     * 기본 통계를 안전하게 가져옵니다 (비동기 버전)
     * @returns {Promise<Object>} 기본 통계 정보
     */
    async getBasicStatsAsync() {
        return await this._safeExecute(
            async () => {
                // 기존 로직을 유지하며 안전하게 실행
                const logs = this.logDataService.getAllLogs();
                return this._calculateBasicStats(logs);
            },
            this.fallbackData.basicStats,
            'getBasicStats'
        );
    }

    /**
     * 목적별 분석을 안전하게 가져옵니다
     * @returns {Object} 목적별 분석 결과
     */
    async getPurposeAnalysis() {
        return await this._safeExecute(
            async () => {
                const logs = this.logDataService.getAllLogs();
                return this._calculatePurposeAnalysis(logs);
            },
            this.fallbackData.purposeAnalysis,
            'getPurposeAnalysis'
        );
    }

    /**
     * 주요방문국 분석을 안전하게 가져옵니다 (동기 버전 - 호환성)
     * @returns {Object} 주요방문국 분석 결과
     */
    getFavoriteCountryAnalysis() {
        try {
            if (!this.countryAnalysis) {
                console.error('AnalysisOrchestrator: CountryAnalysisManager가 초기화되지 않았습니다');
                return this.fallbackData.countryAnalysis;
            }
            return this.countryAnalysis.getFavoriteCountryAnalysis();
        } catch (error) {
            console.error('AnalysisOrchestrator: getFavoriteCountryAnalysis 실행 실패:', error);
            return this.fallbackData.countryAnalysis;
        }
    }

    /**
     * 주요방문국 분석을 안전하게 가져옵니다 (비동기 버전)
     * @returns {Promise<Object>} 주요방문국 분석 결과
     */
    async getFavoriteCountryAnalysisAsync() {
        return await this._safeExecute(
            async () => {
                return await this.countryAnalysis.getFavoriteCountryAnalysis();
            },
            this.fallbackData.countryAnalysis,
            'getFavoriteCountryAnalysis'
        );
    }

    /**
     * 국가별 방문 횟수를 안전하게 가져옵니다 (동기 버전 - 호환성)
     * @returns {Map} 국가별 방문 횟수 Map
     */
    getCountryVisitCounts() {
        try {
            if (!this.countryAnalysis) {
                console.error('AnalysisOrchestrator: CountryAnalysisManager가 초기화되지 않았습니다');
                return new Map();
            }
            return this.countryAnalysis.getCountryVisitCounts();
        } catch (error) {
            console.error('AnalysisOrchestrator: getCountryVisitCounts 실행 실패:', error);
            return new Map();
        }
    }

    /**
     * 국가별 방문 횟수를 안전하게 가져옵니다 (비동기 버전)
     * @returns {Promise<Map>} 국가별 방문 횟수 Map
     */
    async getCountryVisitCountsAsync() {
        return await this._safeExecute(
            async () => {
                return await this.countryAnalysis.getCountryVisitCounts();
            },
            new Map(),
            'getCountryVisitCounts'
        );
    }

    /**
     * 연도별 통계 분석을 안전하게 가져옵니다 (동기 버전 - 호환성)
     * @param {string} year - 분석할 연도
     * @returns {Object} 연도별 분석 결과
     */
    getYearlyStatsAnalysis(year) {
        try {
            if (!this.yearlyComparison) {
                console.error('AnalysisOrchestrator: YearlyComparisonManager가 초기화되지 않았습니다');
                return {
                    year: year,
                    stats: this.fallbackData.basicStats,
                    changes: {},
                    hasData: false
                };
            }
            return this.yearlyComparison.getYearlyStatsAnalysis(year);
        } catch (error) {
            console.error('AnalysisOrchestrator: getYearlyStatsAnalysis 실행 실패:', error);
            return {
                year: year,
                stats: this.fallbackData.basicStats,
                changes: {},
                hasData: false
            };
        }
    }

    /**
     * 연도별 통계 분석을 안전하게 가져옵니다 (비동기 버전)
     * @param {string} year - 분석할 연도
     * @returns {Promise<Object>} 연도별 분석 결과
     */
    async getYearlyStatsAnalysisAsync(year) {
        return await this._safeExecute(
            async () => {
                return await this.yearlyComparison.getYearlyStatsAnalysis(year);
            },
            {
                year: year,
                stats: this.fallbackData.basicStats,
                changes: {},
                hasData: false
            },
            'getYearlyStatsAnalysis'
        );
    }

    /**
     * 전세계 탐험 현황을 안전하게 가져옵니다 (동기 버전 - 호환성)
     * @returns {Object} 전세계 탐험 현황
     */
    getWorldExplorationStats() {
        try {
            if (!this.explorationStats) {
                console.error('AnalysisOrchestrator: ExplorationStatsManager가 초기화되지 않았습니다');
                return {
                    totalCountries: 195,
                    visitedCountries: 0,
                    progressPercentage: 0,
                    continentStats: [],
                    hasData: false
                };
            }
            return this.explorationStats.getWorldExplorationStats();
        } catch (error) {
            console.error('AnalysisOrchestrator: getWorldExplorationStats 실행 실패:', error);
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
     * 전세계 탐험 현황을 안전하게 가져옵니다 (비동기 버전)
     * @returns {Promise<Object>} 전세계 탐험 현황
     */
    async getWorldExplorationStatsAsync() {
        return await this._safeExecute(
            async () => {
                return await this.explorationStats.getWorldExplorationStats();
            },
            {
                totalCountries: 195,
                visitedCountries: 0,
                progressPercentage: 0,
                continentStats: [],
                hasData: false
            },
            'getWorldExplorationStats'
        );
    }

    /**
     * 대륙별 통계를 안전하게 가져옵니다 (동기 버전 - 호환성)
     * @returns {Array} 대륙별 통계
     */
    getContinentStats() {
        try {
            if (!this.explorationStats) {
                console.error('AnalysisOrchestrator: ExplorationStatsManager가 초기화되지 않았습니다');
                return [];
            }
            return this.explorationStats.getContinentStats();
        } catch (error) {
            console.error('AnalysisOrchestrator: getContinentStats 실행 실패:', error);
            return [];
        }
    }

    /**
     * 대륙별 통계를 안전하게 가져옵니다 (비동기 버전)
     * @returns {Promise<Array>} 대륙별 통계
     */
    async getContinentStatsAsync() {
        return await this._safeExecute(
            async () => {
                return await this.explorationStats.getContinentStats();
            },
            [],
            'getContinentStats'
        );
    }

    /**
     * 기본 통계 계산 (임시 - 향후 전용 매니저로 이관)
     * @param {Array} logs - 여행 로그 배열
     * @returns {Object} 기본 통계
     * @private
     */
    _calculateBasicStats(logs) {
        if (!logs || logs.length === 0) {
            return this.fallbackData.basicStats;
        }

        const uniqueCountries = new Set();
        const uniqueCities = new Set();
        let totalTravelDays = 0;
        let totalRating = 0;
        let validRatingCount = 0;

        logs.forEach(log => {
            if (log.country) uniqueCountries.add(log.country);
            if (log.city) uniqueCities.add(log.city);

            // 체류 일수 계산
            if (log.startDate && log.endDate) {
                const startDate = new Date(log.startDate);
                const endDate = new Date(log.endDate);
                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                    const stayDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                    totalTravelDays += stayDays;
                }
            }

            // 별점 계산
            const rating = parseFloat(log.rating);
            if (rating > 0) {
                totalRating += rating;
                validRatingCount++;
            }
        });

        return {
            totalTrips: logs.length,
            uniqueCountries: uniqueCountries.size,
            uniqueCities: uniqueCities.size,
            totalTravelDays: totalTravelDays,
            averageRating: validRatingCount > 0 ? Math.round(totalRating / validRatingCount * 10) / 10 : 0
        };
    }

    /**
     * 목적별 분석 계산 (임시 - 향후 전용 매니저로 이관)
     * @param {Array} logs - 여행 로그 배열
     * @returns {Object} 목적별 분석
     * @private
     */
    _calculatePurposeAnalysis(logs) {
        if (!logs || logs.length === 0) {
            return this.fallbackData.purposeAnalysis;
        }

        const purposeMap = new Map();

        logs.forEach(log => {
            const purpose = log.purpose || 'unknown';
            purposeMap.set(purpose, (purposeMap.get(purpose) || 0) + 1);
        });

        const purposes = {};
        purposeMap.forEach((count, purpose) => {
            purposes[purpose] = {
                count: count,
                percentage: Math.round((count / logs.length) * 100)
            };
        });

        return {
            purposes: purposes,
            totalCount: logs.length
        };
    }

    /**
     * 캐시를 무효화합니다
     */
    invalidateCache() {
        try {
            // 각 매니저의 캐시 무효화
            if (this.countryAnalysis && this.countryAnalysis.invalidateCache) {
                this.countryAnalysis.invalidateCache();
            }
            if (this.explorationStats && this.explorationStats.invalidateCache) {
                this.explorationStats.invalidateCache();
            }
            if (this.yearlyComparison && this.yearlyComparison.invalidateCache) {
                this.yearlyComparison.invalidateCache();
            }

            // 중앙 캐시 매니저 무효화
            if (this.cacheManager) {
                this.cacheManager.invalidatePattern('analysis.*');
            }
        } catch (error) {
            console.error('AnalysisOrchestrator: 캐시 무효화 실패:', error);
        }
    }

    /**
     * 리소스 정리
     */
    cleanup() {
        try {
            // 각 매니저 정리
            if (this.countryAnalysis && this.countryAnalysis.cleanup) {
                this.countryAnalysis.cleanup();
            }
            if (this.explorationStats && this.explorationStats.cleanup) {
                this.explorationStats.cleanup();
            }
            if (this.yearlyComparison && this.yearlyComparison.cleanup) {
                this.yearlyComparison.cleanup();
            }

            // 상태 초기화
            this.isInitialized = false;
            this.countryAnalysis = null;
            this.explorationStats = null;
            this.yearlyComparison = null;
        } catch (error) {
            console.error('AnalysisOrchestrator: 정리 중 오류:', error);
        }
    }
}

export { AnalysisOrchestrator };
