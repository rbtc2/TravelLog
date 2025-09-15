/**
 * CountryAnalysisService - 국가별 분석 로직을 담당
 * 
 * 🎯 책임:
 * - 주요방문국 순위 분석
 * - 국가별 통계 계산
 * - 국가 코드 변환
 * - 국가 분석 결과 캐싱
 * 
 * @class CountryAnalysisService
 * @version 2.0.0
 * @since 2024-12-29
 */
import { CacheManager } from './cache-manager.js';
import { CountryUtils } from '../utils/country-utils.js';
import { DateUtils } from '../utils/date-utils.js';
import { StatsUtils } from '../utils/stats-utils.js';

class CountryAnalysisService {
    constructor(logDataService, cacheManager = null) {
        this.logDataService = logDataService;
        this.cacheManager = cacheManager || new CacheManager();
        this.cacheKey = 'country_analysis';
        this.cacheTTL = 5 * 60 * 1000; // 5분
    }

    /**
     * 주요방문국 순위 분석을 수행합니다
     * @returns {Object} 주요방문국 순위 분석 결과
     */
    getFavoriteCountryAnalysis() {
        try {
            // 캐시에서 조회 시도
            const dataHash = this._calculateDataHash();
            const cachedAnalysis = this.cacheManager.get(this.cacheKey, dataHash);
            if (cachedAnalysis) {
                return cachedAnalysis;
            }

            const logs = this.logDataService.getAllLogs();
            if (!logs || logs.length === 0) {
                const result = this._getEmptyCountryAnalysis();
                this.cacheManager.set(this.cacheKey, result, dataHash, this.cacheTTL);
                return result;
            }

            // 국가별 통계 계산
            const countryStats = this._calculateCountryStats(logs);
            
            // 5단계 우선순위로 정렬
            const sortedCountries = this._sortCountriesByPriority(countryStats);
            
            const topCountry = sortedCountries.length > 0 ? sortedCountries[0] : null;
            
            let summary = '';
            if (topCountry) {
                // TOP 3 랭킹 생성 (평균 별점 포함)
                const top3Countries = sortedCountries.slice(0, 3);
                const rankingItems = top3Countries.map((country, index) => {
                    const countryName = this.getCountryDisplayName(country.country);
                    const rank = index + 1;
                    const avgRating = country.averageRating > 0 ? country.averageRating.toFixed(1) : 'N/A';
                    return `${rank}위 ${countryName} (${country.visitCount}회 방문, 총 ${country.totalStayDays}일, ⭐${avgRating})`;
                });
                
                summary = rankingItems.join('\n');
            } else {
                summary = '아직 여행 기록이 없습니다';
            }

            const result = {
                hasData: true,
                totalLogs: logs.length,
                countryStats: countryStats,
                sortedCountries: sortedCountries,
                topCountry: topCountry, // favoriteCountry -> topCountry로 변경
                top3Countries: sortedCountries.slice(0, 3),
                summary: summary
            };

            this.cacheManager.set(this.cacheKey, result, dataHash, this.cacheTTL);
            return result;

        } catch (error) {
            console.error('주요방문국 순위 분석 중 오류:', error);
            return this._getEmptyCountryAnalysis();
        }
    }

    /**
     * 국가별 통계를 계산합니다
     * @param {Array} logs - 여행 로그 배열
     * @returns {Array} 국가별 통계 배열
     * @private
     */
    _calculateCountryStats(logs) {
        const countryMap = new Map();

        logs.forEach(log => {
            if (!log.country) return;

            const country = log.country;
            const rating = parseFloat(log.rating) || 0;

            // DateUtils를 사용한 날짜 검증 및 일수 계산
            if (!DateUtils.isValidDate(log.startDate) || !DateUtils.isValidDate(log.endDate)) {
                return;
            }

            const startDate = DateUtils.parseDate(log.startDate);
            const endDate = DateUtils.parseDate(log.endDate);
            const stayDays = DateUtils.calculateDaysBetween(log.startDate, log.endDate);

            if (!countryMap.has(country)) {
                countryMap.set(country, {
                    country: country,
                    visitCount: 0,
                    totalStayDays: 0,
                    ratings: [],
                    averageRating: 0,
                    lastVisitDate: null,
                    visits: []
                });
            }

            const stats = countryMap.get(country);
            stats.visitCount += 1;
            stats.totalStayDays += stayDays;
            
            if (rating > 0) {
                stats.ratings.push(rating);
            }
            
            // StatsUtils를 사용한 평균 계산
            stats.averageRating = StatsUtils.average(stats.ratings, 1);
            
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
     * @private
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
    getCountryDisplayName(countryCode) {
        return CountryUtils.getCountryName(countryCode);
    }

    /**
     * 모든 국가 코드와 표시명을 반환합니다
     * @returns {Object} 국가 코드 매핑 객체
     */
    getAllCountryNames() {
        return CountryUtils.COUNTRY_NAMES;
    }

    /**
     * 특정 국가의 상세 통계를 계산합니다
     * @param {string} countryCode - 국가 코드
     * @returns {Object} 국가별 상세 통계
     */
    getCountryDetailStats(countryCode) {
        try {
            const cacheKey = `country_detail_${countryCode}`;
            const dataHash = this._calculateDataHash();
            const cachedStats = this.cacheManager.get(cacheKey, dataHash);
            if (cachedStats) {
                return cachedStats;
            }

            const logs = this.logDataService.getAllLogs();
            const countryLogs = logs.filter(log => log.country === countryCode);

            if (countryLogs.length === 0) {
                const result = this._getEmptyCountryStats(countryCode);
                this.cacheManager.set(cacheKey, result, dataHash, this.cacheTTL);
                return result;
            }

            const stats = this._calculateCountryDetailStats(countryCode, countryLogs);
            this.cacheManager.set(cacheKey, stats, dataHash, this.cacheTTL);
            
            return stats;

        } catch (error) {
            console.error('국가별 상세 통계 계산 중 오류:', error);
            return this._getEmptyCountryStats(countryCode);
        }
    }

    /**
     * 국가별 상세 통계를 계산합니다
     * @param {string} countryCode - 국가 코드
     * @param {Array} countryLogs - 해당 국가의 로그들
     * @returns {Object} 상세 통계
     * @private
     */
    _calculateCountryDetailStats(countryCode, countryLogs) {
        const uniqueCities = new Set();
        let totalTravelDays = 0;
        let totalRating = 0;
        let validRatingCount = 0;
        let lastVisitDate = null;

        countryLogs.forEach(log => {
            if (log.city) uniqueCities.add(log.city);
            
            // 여행 일수 계산
            if (log.startDate && log.endDate) {
                try {
                    const startDate = new Date(log.startDate);
                    const endDate = new Date(log.endDate);
                    
                    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                        const timeDiff = endDate.getTime() - startDate.getTime();
                        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
                        
                        if (daysDiff > 0) {
                            totalTravelDays += daysDiff;
                        }

                        // 최근 방문일 업데이트
                        if (!lastVisitDate || startDate > lastVisitDate) {
                            lastVisitDate = startDate;
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
        const averageTravelDays = countryLogs.length > 0 ? Math.round(totalTravelDays / countryLogs.length * 10) / 10 : 0;

        return {
            country: countryCode,
            countryName: this.getCountryDisplayName(countryCode),
            totalTrips: countryLogs.length,
            uniqueCities: uniqueCities.size,
            totalTravelDays: totalTravelDays,
            averageTravelDays: averageTravelDays,
            averageRating: Math.round(averageRating * 10) / 10,
            lastVisitDate: lastVisitDate,
            hasData: true
        };
    }

    /**
     * 빈 국가별 통계를 반환합니다
     * @param {string} countryCode - 국가 코드
     * @returns {Object} 빈 통계
     * @private
     */
    _getEmptyCountryStats(countryCode) {
        return {
            country: countryCode,
            countryName: this.getCountryDisplayName(countryCode),
            totalTrips: 0,
            uniqueCities: 0,
            totalTravelDays: 0,
            averageTravelDays: 0,
            averageRating: 0,
            lastVisitDate: null,
            hasData: false
        };
    }

    /**
     * 빈 국가 분석 결과를 반환합니다
     * @returns {Object} 빈 분석 결과
     * @private
     */
    _getEmptyCountryAnalysis() {
        return {
            hasData: false,
            totalLogs: 0,
            countryStats: [],
            topCountry: null, // favoriteCountry -> topCountry로 변경
            summary: '아직 여행 기록이 없습니다'
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
        this.cacheManager.invalidatePattern('country_analysis|country_detail_');
    }

    /**
     * 서비스 정리
     */
    cleanup() {
        this.invalidateCache();
    }
}

export { CountryAnalysisService };
