/**
 * Yearly Comparison Manager - 연도별 비교 분석 전용 매니저
 * 
 * 🎯 책임:
 * - 연도별 여행 통계 계산 및 비교
 * - 년도간 증감률 분석
 * - 연도별 트렌드 분석
 * - 성능 최적화된 연도별 데이터 처리
 * 
 * @class YearlyComparisonManager
 * @version 1.0.0
 * @since 2024-12-29
 */

import { CacheManager } from '../../services/cache-manager.js';

class YearlyComparisonManager {
    constructor(logDataService, cacheManager) {
        this.logDataService = logDataService;
        this.cacheManager = cacheManager;
        
        // 캐시 키 관리
        this.cacheKeys = {
            YEARLY_STATS: 'yearly_stats_',  // 연도별로 분리된 캐시
            YEARLY_ANALYSIS: 'yearly_analysis_',
            AVAILABLE_YEARS: 'available_years'
        };
        
        // 성능 최적화를 위한 설정
        this.cacheTTL = 15 * 60 * 1000; // 15분 캐시 (연도별 데이터는 상대적으로 안정적)
    }

    /**
     * 연도별 통계 분석을 수행합니다 (MyLogsController에서 이관된 핵심 로직)
     * @param {string} year - 분석할 연도
     * @returns {Object} 연도별 통계 분석 결과
     */
    getYearlyStatsAnalysis(year) {
        try {
            // 캐시된 결과 확인
            const cachedResult = this._getCachedResult(`${this.cacheKeys.YEARLY_ANALYSIS}${year}`);
            if (cachedResult) {
                return cachedResult;
            }

            // 현재 연도와 전년도 데이터 가져오기
            const currentYearData = this._getTravelDataByYear(year);
            const previousYear = (parseInt(year) - 1).toString();
            const previousYearData = this._getTravelDataByYear(previousYear);

            // 현재 연도 통계 계산
            const currentStats = this._calculateYearlyStats(currentYearData);
            
            // 전년도 통계 계산
            const previousStats = this._calculateYearlyStats(previousYearData);
            
            // 증감률 계산
            const changes = this._calculateYearlyChanges(currentStats, previousStats);

            const result = {
                year: year,
                stats: currentStats,
                previousYear: previousYear,
                previousStats: previousStats,
                changes: changes,
                hasCurrentData: currentYearData.logs && currentYearData.logs.length > 0,
                hasPreviousData: previousYearData.logs && previousYearData.logs.length > 0,
                analysisDate: new Date().toISOString()
            };

            // 결과 캐싱
            this._setCachedResult(`${this.cacheKeys.YEARLY_ANALYSIS}${year}`, result);
            
            return result;

        } catch (error) {
            console.error('YearlyComparisonManager: 연도별 통계 분석 실패:', error);
            return this._getEmptyYearlyAnalysis(year);
        }
    }

    /**
     * 특정 연도의 여행 데이터를 가져옵니다
     * @param {string} year - 연도
     * @returns {Object} 해당 연도의 여행 데이터
     * @private
     */
    _getTravelDataByYear(year) {
        try {
            // 캐시된 결과 확인
            const cachedResult = this._getCachedResult(`${this.cacheKeys.YEARLY_STATS}${year}`);
            if (cachedResult) {
                return cachedResult;
            }

            const allLogs = this.logDataService.getAllLogs();
            
            // 해당 연도의 로그만 필터링
            const yearLogs = allLogs.filter(log => {
                if (!log.startDate) return false;
                
                const logDate = new Date(log.startDate);
                if (isNaN(logDate.getTime())) return false;
                
                return logDate.getFullYear().toString() === year;
            });

            const result = {
                year: year,
                logs: yearLogs,
                totalLogs: yearLogs.length,
                dataRetrievedAt: new Date().toISOString()
            };

            // 결과 캐싱
            this._setCachedResult(`${this.cacheKeys.YEARLY_STATS}${year}`, result);
            
            return result;

        } catch (error) {
            console.error('YearlyComparisonManager: 연도별 데이터 조회 실패:', error);
            return {
                year: year,
                logs: [],
                totalLogs: 0,
                dataRetrievedAt: new Date().toISOString()
            };
        }
    }

    /**
     * 연도별 통계를 계산합니다 (MyLogsController에서 이관된 핵심 로직)
     * @param {Object} yearData - 연도별 데이터
     * @returns {Object} 연도별 통계
     * @private
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
     * 연도별 증감률을 계산합니다 (MyLogsController에서 이관된 핵심 로직, 최적화됨)
     * @param {Object} currentStats - 현재 연도 통계
     * @param {Object} previousStats - 전년도 통계
     * @returns {Object} 증감률 정보
     * @private
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
                const displayValue = this._formatChangeValue(metric, changeValue);
                
                if (changeValue > 0) {
                    changes[metric] = {
                        type: 'positive',
                        value: changeValue,
                        percent: changePercent,
                        display: displayValue,
                        displayPercent: `+${changePercent}%`,
                        color: 'green'
                    };
                } else if (changeValue < 0) {
                    changes[metric] = {
                        type: 'negative',
                        value: changeValue,
                        percent: changePercent,
                        display: displayValue,
                        displayPercent: `${changePercent}%`,
                        color: 'red'
                    };
                } else {
                    changes[metric] = {
                        type: 'neutral',
                        value: 0,
                        percent: 0,
                        display: this._formatChangeValue(metric, 0),
                        displayPercent: '0%',
                        color: 'gray'
                    };
                }
            }
        });
        
        return changes;
    }

    /**
     * 지표별 변화값 형식을 지정합니다
     * @param {string} metric - 지표명
     * @param {number} value - 변화값
     * @returns {string} 형식화된 표시값
     * @private
     */
    _formatChangeValue(metric, value) {
        if (metric === 'averageRating') {
            return value > 0 ? `+${value.toFixed(1)}점` : `${value.toFixed(1)}점`;
        } else if (metric === 'totalTravelDays' || metric === 'averageTravelDays') {
            return value > 0 ? `+${value}일` : `${value}일`;
        } else if (metric === 'totalTrips') {
            return value > 0 ? `+${value}회` : `${value}회`;
        } else {
            return value > 0 ? `+${value}개` : `${value}개`;
        }
    }

    /**
     * 연도별 트렌드 분석을 수행합니다
     * @param {Array} years - 분석할 연도 배열
     * @returns {Object} 트렌드 분석 결과
     */
    getYearlyTrendAnalysis(years) {
        try {
            const trendData = [];
            let totalGrowth = 0;
            let positiveGrowthYears = 0;

            years.forEach(year => {
                const yearAnalysis = this.getYearlyStatsAnalysis(year);
                trendData.push({
                    year: year,
                    stats: yearAnalysis.stats,
                    hasData: yearAnalysis.hasCurrentData
                });

                // 성장률 계산 (여행 횟수 기준)
                if (yearAnalysis.changes && yearAnalysis.changes.totalTrips && 
                    yearAnalysis.changes.totalTrips.type === 'positive') {
                    totalGrowth += yearAnalysis.changes.totalTrips.percent;
                    positiveGrowthYears++;
                }
            });

            const averageGrowth = positiveGrowthYears > 0 ? 
                Math.round(totalGrowth / positiveGrowthYears) : 0;

            return {
                years: years,
                trendData: trendData,
                averageGrowthRate: averageGrowth,
                positiveGrowthYears: positiveGrowthYears,
                totalAnalyzedYears: years.length,
                analysisDate: new Date().toISOString()
            };

        } catch (error) {
            console.error('YearlyComparisonManager: 연도별 트렌드 분석 실패:', error);
            return {
                years: years,
                trendData: [],
                averageGrowthRate: 0,
                positiveGrowthYears: 0,
                totalAnalyzedYears: 0,
                analysisDate: new Date().toISOString()
            };
        }
    }

    /**
     * 빈 연도별 통계를 반환합니다
     * @returns {Object} 빈 통계 객체
     * @private
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
     * 빈 연도별 분석을 반환합니다
     * @param {string} year - 연도
     * @returns {Object} 빈 분석 객체
     * @private
     */
    _getEmptyYearlyAnalysis(year) {
        return {
            year: year,
            stats: this._getEmptyYearlyStats(),
            previousYear: (parseInt(year) - 1).toString(),
            previousStats: this._getEmptyYearlyStats(),
            changes: this._getEmptyChanges(),
            hasCurrentData: false,
            hasPreviousData: false,
            analysisDate: new Date().toISOString()
        };
    }

    /**
     * 빈 증감률 정보를 반환합니다
     * @returns {Object} 빈 증감률 객체
     * @private
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
     * 캐시된 결과를 가져옵니다
     * @param {string} key - 캐시 키
     * @returns {*} 캐시된 값 또는 null
     * @private
     */
    _getCachedResult(key) {
        try {
            if (!this.cacheManager) return null;

            const cached = this.cacheManager.get(key);
            if (cached && cached.timestamp && 
                (Date.now() - cached.timestamp) < this.cacheTTL) {
                return cached.data;
            }
            
            return null;
        } catch (error) {
            console.error('YearlyComparisonManager: 캐시 조회 실패:', error);
            return null;
        }
    }

    /**
     * 결과를 캐시에 저장합니다
     * @param {string} key - 캐시 키
     * @param {*} data - 저장할 데이터
     * @private
     */
    _setCachedResult(key, data) {
        try {
            if (!this.cacheManager) return;

            this.cacheManager.set(key, {
                data: data,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('YearlyComparisonManager: 캐시 저장 실패:', error);
        }
    }

    /**
     * 캐시를 무효화합니다
     */
    invalidateCache() {
        try {
            if (this.cacheManager) {
                // 연도별 캐시 무효화 (패턴 매칭)
                const keys = this.cacheManager.getKeys();
                keys.forEach(key => {
                    if (key.startsWith(this.cacheKeys.YEARLY_STATS) || 
                        key.startsWith(this.cacheKeys.YEARLY_ANALYSIS) ||
                        key === this.cacheKeys.AVAILABLE_YEARS) {
                        this.cacheManager.delete(key);
                    }
                });
            }
        } catch (error) {
            console.error('YearlyComparisonManager: 캐시 무효화 실패:', error);
        }
    }

    /**
     * 리소스 정리
     */
    cleanup() {
        try {
            this.invalidateCache();
            this.logDataService = null;
            this.cacheManager = null;
        } catch (error) {
            console.error('YearlyComparisonManager: 정리 중 오류:', error);
        }
    }
}

export { YearlyComparisonManager };
