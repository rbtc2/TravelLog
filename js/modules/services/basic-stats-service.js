/**
 * BasicStatsService - 기본 통계 계산 로직을 담당
 * 
 * 🎯 책임:
 * - 기본 통계 계산 (방문 국가, 도시, 여행 일수, 평균 평점)
 * - 연도별 여행 데이터 분석
 * - 통계 데이터 캐싱
 * - 통계 계산 최적화
 * 
 * @class BasicStatsService
 * @version 1.0.0
 * @since 2024-12-29
 */
import { CacheManager } from './cache-manager.js';

class BasicStatsService {
    constructor(logDataService, cacheManager = null) {
        this.logDataService = logDataService;
        this.cacheManager = cacheManager || new CacheManager();
        this.cacheKey = 'basic_stats';
        this.cacheTTL = 5 * 60 * 1000; // 5분
    }

    /**
     * 기본 통계를 계산합니다
     * @returns {Object} 기본 통계 정보
     */
    getBasicStats() {
        try {
            // 캐시에서 조회 시도
            const dataHash = this._calculateDataHash();
            const cachedStats = this.cacheManager.get(this.cacheKey, dataHash);
            if (cachedStats) {
                return cachedStats;
            }

            const logs = this.logDataService.getAllLogs();
            
            if (!logs || logs.length === 0) {
                const result = this._getEmptyStats();
                this.cacheManager.set(this.cacheKey, result, dataHash, this.cacheTTL);
                return result;
            }

            const stats = this._calculateBasicStats(logs);
            this.cacheManager.set(this.cacheKey, stats, dataHash, this.cacheTTL);
            
            return stats;

        } catch (error) {
            console.error('기본 통계 계산 중 오류:', error);
            return this._getEmptyStats();
        }
    }

    /**
     * 특정 연도의 여행 데이터를 가져옵니다
     * @param {string} year - 연도
     * @returns {Object} 해당 연도의 여행 데이터
     */
    getTravelDataByYear(year) {
        try {
            const cacheKey = `travel_data_${year}`;
            const dataHash = this._calculateDataHash();
            const cachedData = this.cacheManager.get(cacheKey, dataHash);
            if (cachedData) {
                return cachedData;
            }

            const allLogs = this.logDataService.getAllLogs();
            const yearInt = parseInt(year);
            
            // 해당 연도의 로그만 필터링
            const yearLogs = allLogs.filter(log => {
                const logDate = new Date(log.startDate);
                return logDate.getFullYear() === yearInt;
            });
            
            const result = {
                year: year,
                logs: yearLogs,
                totalLogs: yearLogs.length,
                hasData: yearLogs.length > 0
            };

            this.cacheManager.set(cacheKey, result, dataHash, this.cacheTTL);
            return result;

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
     * 사용 가능한 연도 목록을 반환합니다
     * @returns {Array} 연도 목록 (최신순)
     */
    getAvailableYears() {
        try {
            const cacheKey = 'available_years';
            const dataHash = this._calculateDataHash();
            const cachedYears = this.cacheManager.get(cacheKey, dataHash);
            if (cachedYears) {
                return cachedYears;
            }

            const logs = this.logDataService.getAllLogs();
            if (!logs || logs.length === 0) {
                const currentYear = new Date().getFullYear();
                const result = [currentYear.toString()];
                this.cacheManager.set(cacheKey, result, dataHash, this.cacheTTL);
                return result;
            }

            // 로그에서 연도 추출 (문자열로 저장)
            const years = new Set();
            logs.forEach(log => {
                if (log.startDate) {
                    const year = new Date(log.startDate).getFullYear();
                    if (!isNaN(year)) {
                        years.add(year.toString());
                    }
                }
            });

            // 연도 배열로 변환하고 최신순 정렬
            const yearArray = Array.from(years)
                .map(year => parseInt(year))
                .sort((a, b) => b - a)
                .map(year => year.toString());
            
            // 현재 연도 확인
            const currentYear = new Date().getFullYear();
            const currentYearStr = currentYear.toString();
            
            if (!yearArray.includes(currentYearStr)) {
                yearArray.unshift(currentYearStr);
            }

            const result = [...new Set(yearArray)];
            this.cacheManager.set(cacheKey, result, dataHash, this.cacheTTL);
            return result;

        } catch (error) {
            console.error('사용 가능한 연도 목록 조회 중 오류:', error);
            const currentYear = new Date().getFullYear();
            return [currentYear.toString()];
        }
    }

    /**
     * 기본 통계를 계산합니다
     * @param {Array} logs - 로그 배열
     * @returns {Object} 계산된 통계
     * @private
     */
    _calculateBasicStats(logs) {
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
            hasData: true,
            totalLogs: logs.length
        };
    }

    /**
     * 빈 통계를 반환합니다
     * @returns {Object} 빈 통계 객체
     * @private
     */
    _getEmptyStats() {
        return {
            visitedCountries: 0,
            visitedCities: 0,
            totalTravelDays: 0,
            averageRating: 0,
            hasData: false,
            totalLogs: 0
        };
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
        this.cacheManager.invalidatePattern('basic_stats|travel_data_|available_years');
    }

    /**
     * 서비스 정리
     */
    cleanup() {
        this.invalidateCache();
    }
}

export { BasicStatsService };
