/**
 * YearlyStatsService - 연도별 통계 분석 로직을 담당
 * 
 * 🎯 책임:
 * - 연도별 통계 분석
 * - 연도별 증감률 계산
 * - 연도별 데이터 비교
 * - 연도별 통계 결과 캐싱
 * 
 * @class YearlyStatsService
 * @version 2.0.0
 * @since 2024-12-29
 */
import { CacheManager } from './cache-manager.js';
import { DateUtils } from '../utils/date-utils.js';
import { StatsUtils } from '../utils/stats-utils.js';

class YearlyStatsService {
    constructor(logDataService, cacheManager = null) {
        this.logDataService = logDataService;
        this.cacheManager = cacheManager || new CacheManager();
        this.cacheKey = 'yearly_stats';
        this.cacheTTL = 5 * 60 * 1000; // 5분
    }

    /**
     * 연도별 통계 분석을 수행합니다
     * @param {string} year - 분석할 연도
     * @returns {Object} 연도별 통계 분석 결과
     */
    getYearlyStatsAnalysis(year) {
        try {
            const cacheKey = `yearly_stats_${year}`;
            const dataHash = this._calculateDataHash();
            const cachedAnalysis = this.cacheManager.get(cacheKey, dataHash);
            if (cachedAnalysis) {
                return cachedAnalysis;
            }

            const currentYear = parseInt(year);
            const previousYear = currentYear - 1;
            
            // 현재 연도 데이터
            const currentYearData = this._getTravelDataByYear(currentYear.toString());
            const previousYearData = this._getTravelDataByYear(previousYear.toString());
            
            // 현재 연도 통계 계산
            const currentStats = this._calculateYearlyStats(currentYearData);
            
            // 전년도 통계 계산
            const previousStats = this._calculateYearlyStats(previousYearData);
            
            // 증감률 계산
            const changes = this._calculateYearlyChanges(currentStats, previousStats);
            
            const result = {
                year: currentYear,
                hasData: currentStats.totalTrips > 0,
                currentStats: currentStats,
                previousStats: previousStats,
                changes: changes,
                isFirstYear: previousStats.totalTrips === 0
            };

            this.cacheManager.set(cacheKey, result, dataHash, this.cacheTTL);
            return result;

        } catch (error) {
            console.error('연도별 통계 분석 중 오류:', error);
            return {
                year: parseInt(year),
                hasData: false,
                currentStats: this._getEmptyYearlyStats(),
                previousStats: this._getEmptyYearlyStats(),
                changes: this._getEmptyChanges(),
                isFirstYear: true
            };
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
            const allLogs = this.logDataService.getAllLogs();
            
            // DateUtils를 사용한 연도별 필터링
            const yearLogs = DateUtils.filterLogsByYear(allLogs, year);
            
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
     * 연도별 통계를 계산합니다
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
        const travelDays = [];
        const ratings = [];

        logs.forEach(log => {
            if (log.country) uniqueCountries.add(log.country);
            if (log.city) uniqueCities.add(log.city);
            
            // DateUtils를 사용한 체류 일수 계산
            if (log.startDate && log.endDate) {
                const days = DateUtils.calculateDaysBetween(log.startDate, log.endDate);
                if (days > 0) {
                    travelDays.push(days);
                }
            }
            
            // 별점 수집
            const rating = parseFloat(log.rating);
            if (rating > 0) {
                ratings.push(rating);
            }
        });

        // StatsUtils를 사용한 통계 계산
        const totalTravelDays = StatsUtils.sum(travelDays);
        const averageTravelDays = StatsUtils.average(travelDays, 1);
        const averageRating = StatsUtils.average(ratings, 1);

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
            
            // StatsUtils를 사용한 증감률 계산
            const changeResult = StatsUtils.changeRate(current, previous, 1);
            
            if (changeResult.type === 'new') {
                changes[metric] = {
                    type: 'first',
                    value: 0,
                    display: '첫 해 기록',
                    color: 'blue'
                };
            } else {
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
                
                let color = 'gray';
                if (changeResult.type === 'increase') color = 'green';
                else if (changeResult.type === 'decrease') color = 'red';
                
                changes[metric] = {
                    type: changeResult.type === 'increase' ? 'positive' : 
                          changeResult.type === 'decrease' ? 'negative' : 'neutral',
                    value: changeResult.value,
                    percent: changeResult.rate,
                    display: formatChangeValue(changeResult.value),
                    displayPercent: changeResult.display,
                    color: color
                };
            }
        });
        
        return changes;
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
     * 여러 연도의 통계를 비교합니다
     * @param {Array} years - 비교할 연도 배열
     * @returns {Object} 연도별 비교 결과
     */
    getMultiYearComparison(years) {
        try {
            const cacheKey = `multi_year_${years.join('_')}`;
            const dataHash = this._calculateDataHash();
            const cachedComparison = this.cacheManager.get(cacheKey, dataHash);
            if (cachedComparison) {
                return cachedComparison;
            }

            const yearlyStats = {};
            const sortedYears = years.map(year => parseInt(year)).sort((a, b) => a - b);

            // 각 연도별 통계 계산
            sortedYears.forEach(year => {
                const yearData = this._getTravelDataByYear(year.toString());
                yearlyStats[year] = this._calculateYearlyStats(yearData);
            });

            // 트렌드 분석
            const trends = this._analyzeTrends(yearlyStats, sortedYears);

            const result = {
                years: sortedYears,
                yearlyStats: yearlyStats,
                trends: trends,
                hasData: Object.values(yearlyStats).some(stats => stats.totalTrips > 0)
            };

            this.cacheManager.set(cacheKey, result, dataHash, this.cacheTTL);
            return result;

        } catch (error) {
            console.error('다년도 비교 분석 중 오류:', error);
            return {
                years: years.map(year => parseInt(year)),
                yearlyStats: {},
                trends: {},
                hasData: false
            };
        }
    }

    /**
     * 트렌드를 분석합니다
     * @param {Object} yearlyStats - 연도별 통계
     * @param {Array} sortedYears - 정렬된 연도 배열
     * @returns {Object} 트렌드 분석 결과
     * @private
     */
    _analyzeTrends(yearlyStats, sortedYears) {
        const trends = {};
        const metrics = ['totalTrips', 'uniqueCountries', 'totalTravelDays', 'averageRating'];

        metrics.forEach(metric => {
            const values = sortedYears.map(year => yearlyStats[year][metric]);
            // StatsUtils를 사용한 트렌드 분석
            const trend = StatsUtils.trendAnalysis(values);
            trends[metric] = trend;
        });

        return trends;
    }

    /**
     * 데이터 해시를 계산합니다 (캐시 무효화 확인용)
     * @returns {string} 데이터 해시
     * @private
     */
    _calculateDataHash() {
        try {
            const logs = this.logDataService.getAllLogs();
            const dataString = JSON.stringify(logs.map(log => ({
                id: log.id,
                country: log.country,
                city: log.city,
                startDate: log.startDate,
                endDate: log.endDate,
                rating: log.rating
            })));
            
            // 간단한 해시 함수
            let hash = 0;
            for (let i = 0; i < dataString.length; i++) {
                const char = dataString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // 32비트 정수로 변환
            }
            return hash.toString();
        } catch (error) {
            console.error('데이터 해시 계산 중 오류:', error);
            return Date.now().toString();
        }
    }

    /**
     * 캐시를 무효화합니다
     */
    invalidateCache() {
        this.cacheManager.invalidatePattern('yearly_stats|multi_year_');
    }

    /**
     * 서비스 정리
     */
    cleanup() {
        this.invalidateCache();
    }
}

export { YearlyStatsService };
