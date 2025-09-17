/**
 * Country Analysis Manager - 국가별 분석 전용 매니저
 * 
 * 🎯 책임:
 * - 국가별 여행 통계 계산 및 관리
 * - 방문 횟수, 체류 일수, 평균 별점 분석
 * - 국가별 우선순위 정렬 및 랭킹
 * - 성능 최적화된 국가 데이터 처리
 * 
 * @class CountryAnalysisManager
 * @version 1.0.0
 * @since 2024-12-29
 */

import { CacheManager } from '../../services/cache-manager.js';
import { countriesManager } from '../../../data/countries-manager.js';

class CountryAnalysisManager {
    constructor(logDataService, cacheManager) {
        this.logDataService = logDataService;
        this.cacheManager = cacheManager;
        
        // 캐시 키 관리
        this.cacheKeys = {
            COUNTRY_STATS: 'country_analysis_stats',
            VISIT_COUNTS: 'country_visit_counts',
            FAVORITE_ANALYSIS: 'favorite_country_analysis'
        };
        
        // 성능 최적화를 위한 설정
        this.cacheTTL = 5 * 60 * 1000; // 5분 캐시
        this.lastDataHash = null;
    }

    /**
     * 주요방문국 순위 분석을 수행합니다
     * @returns {Object} 주요방문국 순위 분석 결과
     */
    getFavoriteCountryAnalysis() {
        try {
            // 캐시된 결과 확인
            const cachedResult = this._getCachedResult(this.cacheKeys.FAVORITE_ANALYSIS);
            if (cachedResult) {
                return cachedResult;
            }

            const logs = this.logDataService.getAllLogs();
            
            // 데이터가 없는 경우 기본값 반환
            if (!logs || logs.length === 0) {
                return this._getEmptyFavoriteAnalysis();
            }

            // 국가별 통계 계산
            const countryStats = this._calculateCountryStats(logs);
            
            // 5단계 우선순위로 정렬
            const sortedCountries = this._sortCountriesByPriority(countryStats);
            
            // 상위 10개 국가만 선택
            const topCountries = sortedCountries.slice(0, 10);
            
            const result = {
                favoriteCountries: topCountries.map((stats, index) => ({
                    rank: index + 1,
                    country: stats.country,
                    displayName: this._getCountryDisplayName(stats.country),
                    visitCount: stats.visitCount,
                    totalStayDays: stats.totalStayDays,
                    averageRating: stats.averageRating,
                    lastVisitDate: stats.lastVisitDate,
                    visits: stats.visits
                })),
                totalVisitedCountries: countryStats.length,
                analysisDate: new Date().toISOString()
            };

            // 결과 캐싱
            this._setCachedResult(this.cacheKeys.FAVORITE_ANALYSIS, result);
            
            return result;

        } catch (error) {
            console.error('CountryAnalysisManager: 주요방문국 분석 실패:', error);
            return this._getEmptyFavoriteAnalysis();
        }
    }

    /**
     * 국가별 방문 횟수를 가져옵니다
     * @returns {Map} 국가 코드를 키로 하는 방문 횟수 Map
     */
    getCountryVisitCounts() {
        try {
            // 캐시된 결과 확인
            const cachedResult = this._getCachedResult(this.cacheKeys.VISIT_COUNTS);
            if (cachedResult) {
                return cachedResult;
            }

            const logs = this.logDataService.getAllLogs();
            const countryStats = this._calculateCountryStats(logs);
            
            const visitCountMap = new Map();
            countryStats.forEach(stat => {
                visitCountMap.set(stat.country, stat.visitCount);
            });
            
            // 결과 캐싱
            this._setCachedResult(this.cacheKeys.VISIT_COUNTS, visitCountMap);
            
            return visitCountMap;

        } catch (error) {
            console.error('CountryAnalysisManager: 국가별 방문 횟수 조회 실패:', error);
            return new Map();
        }
    }

    /**
     * 국가별 통계를 계산합니다 (MyLogsController에서 이관된 핵심 로직)
     * @param {Array} logs - 여행 로그 배열
     * @returns {Array} 국가별 통계 배열
     * @private
     */
    _calculateCountryStats(logs) {
        try {
            // 캐시된 통계 확인
            const cachedStats = this._getCachedResult(this.cacheKeys.COUNTRY_STATS);
            if (cachedStats) {
                return cachedStats;
            }

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

            const result = Array.from(countryMap.values());
            
            // 결과 캐싱
            this._setCachedResult(this.cacheKeys.COUNTRY_STATS, result);
            
            return result;

        } catch (error) {
            console.error('CountryAnalysisManager: 국가별 통계 계산 실패:', error);
            return [];
        }
    }

    /**
     * 5단계 우선순위로 국가를 정렬합니다 (MyLogsController에서 이관된 핵심 로직)
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
     * 국가 코드를 표시명으로 변환합니다 (MyLogsController에서 이관된 로직)
     * @param {string} countryCode - 국가 코드
     * @returns {string} 국가 표시명
     * @private
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
     * 빈 주요방문국 분석 결과를 반환합니다
     * @returns {Object} 빈 분석 결과
     * @private
     */
    _getEmptyFavoriteAnalysis() {
        return {
            favoriteCountries: [],
            totalVisitedCountries: 0,
            analysisDate: new Date().toISOString()
        };
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
            console.error('CountryAnalysisManager: 캐시 조회 실패:', error);
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
            console.error('CountryAnalysisManager: 캐시 저장 실패:', error);
        }
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
            console.error('CountryAnalysisManager: 데이터 해시 계산 중 오류:', error);
            return Date.now().toString(); // 폴백으로 현재 시간 사용
        }
    }

    /**
     * 캐시를 무효화합니다
     */
    invalidateCache() {
        try {
            if (this.cacheManager) {
                this.cacheManager.delete(this.cacheKeys.COUNTRY_STATS);
                this.cacheManager.delete(this.cacheKeys.VISIT_COUNTS);
                this.cacheManager.delete(this.cacheKeys.FAVORITE_ANALYSIS);
            }
            this.lastDataHash = null;
        } catch (error) {
            console.error('CountryAnalysisManager: 캐시 무효화 실패:', error);
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
            console.error('CountryAnalysisManager: 정리 중 오류:', error);
        }
    }
}

export { CountryAnalysisManager };
