/**
 * TravelCollectionController - 여행 컬렉션 전용 컨트롤러
 * 
 * 🎯 책임:
 * - 여행 컬렉션 관련 비즈니스 로직 관리
 * - 컬렉션 데이터 조회 및 통계 계산
 * - 컬렉션 상태 관리 및 캐싱
 * - 컬렉션 뷰와의 인터페이스 제공
 * 
 * @class TravelCollectionController
 * @version 1.0.0
 * @since 2024-12-29
 */

import { LogDataService } from '../../../modules/services/log-data-service.js';
import { CacheManager } from '../../../modules/services/cache-manager.js';
import { countriesManager } from '../../../data/countries-manager.js';

class TravelCollectionController {
    constructor(logDataService, cacheManager) {
        // 의존성 주입
        this.logDataService = logDataService;
        this.cacheManager = cacheManager;
        this.countriesManager = countriesManager;
        
        // 컬렉션 관련 상태
        this.isInitialized = false;
        this.collectionCache = new Map();
        
        // 캐시 키 관리
        this.cacheKeys = {
            VISITED_COUNTRIES: 'visited_countries',
            CONTINENT_STATS: 'continent_stats',
            COLLECTION_STATS: 'collection_stats',
            COUNTRY_DETAILS: 'country_details'
        };
        
        // 캐시 TTL (15분)
        this.cacheTTL = 15 * 60 * 1000;
    }

    /**
     * 컨트롤러 초기화
     */
    async initialize() {
        try {
            console.log('TravelCollectionController: 초기화 시작');
            
            // 국가 데이터 초기화 확인
            if (!this.countriesManager.isInitialized) {
                await this.countriesManager.initialize();
            }
            
            this.isInitialized = true;
            console.log('TravelCollectionController: 초기화 완료');
        } catch (error) {
            console.error('TravelCollectionController: 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 방문한 국가 목록을 가져옵니다
     * @returns {Object} 방문한 국가 정보
     */
    getVisitedCountries() {
        try {
            // 캐시 확인
            const cached = this._getCachedData(this.cacheKeys.VISITED_COUNTRIES);
            if (cached) {
                return cached;
            }

            const logs = this.logDataService.getAllLogs();
            const visitedCountries = {};
            const visitedCountryCodes = new Set();

            logs.forEach(log => {
                if (log.country) {
                    visitedCountryCodes.add(log.country);
                    
                    if (!visitedCountries[log.country]) {
                        const countryInfo = this.countriesManager.getCountryByCode(log.country);
                        if (countryInfo) {
                            visitedCountries[log.country] = {
                                code: log.country,
                                name: countryInfo.name,
                                nameKo: countryInfo.nameKo,
                                continent: countryInfo.continent,
                                flag: countryInfo.flag,
                                visitCount: 0,
                                lastVisit: null,
                                totalDays: 0,
                                averageRating: 0,
                                cities: new Set()
                            };
                        }
                    }

                    // 방문 횟수 증가
                    visitedCountries[log.country].visitCount++;
                    
                    // 마지막 방문일 업데이트
                    const visitDate = new Date(log.startDate);
                    if (!visitedCountries[log.country].lastVisit || 
                        visitDate > new Date(visitedCountries[log.country].lastVisit)) {
                        visitedCountries[log.country].lastVisit = log.startDate;
                    }

                    // 총 여행 일수 추가
                    const days = this._calculateTravelDays(log.startDate, log.endDate);
                    visitedCountries[log.country].totalDays += days;

                    // 평균 별점 계산
                    if (log.rating) {
                        const currentTotal = visitedCountries[log.country].averageRating * (visitedCountries[log.country].visitCount - 1);
                        visitedCountries[log.country].averageRating = (currentTotal + log.rating) / visitedCountries[log.country].visitCount;
                    }

                    // 도시 추가
                    if (log.city) {
                        visitedCountries[log.country].cities.add(log.city);
                    }
                }
            });

            // Set을 Array로 변환
            Object.values(visitedCountries).forEach(country => {
                country.cities = Array.from(country.cities);
            });

            const result = {
                visitedCountryCodes: Array.from(visitedCountryCodes),
                countries: visitedCountries
            };

            // 캐시 저장
            this._setCachedData(this.cacheKeys.VISITED_COUNTRIES, result);
            
            return result;
        } catch (error) {
            console.error('TravelCollectionController: getVisitedCountries 실패:', error);
            return {
                visitedCountryCodes: [],
                countries: {}
            };
        }
    }

    /**
     * 대륙별 통계를 계산합니다
     * @returns {Array} 대륙별 통계 배열
     */
    getContinentStats() {
        try {
            // 캐시 확인
            const cached = this._getCachedData(this.cacheKeys.CONTINENT_STATS);
            if (cached) {
                return cached;
            }

            const visitedCountries = this.getVisitedCountries();
            const visitedCountriesByContinent = {};
            
            // 방문한 국가들을 대륙별로 분류
            Object.values(visitedCountries.countries).forEach(country => {
                const continent = country.continent;
                if (continent) {
                    if (!visitedCountriesByContinent[continent]) {
                        visitedCountriesByContinent[continent] = new Set();
                    }
                    visitedCountriesByContinent[continent].add(country.code);
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
            const result = Object.entries(continentInfo).map(([continent, info]) => {
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

            // 캐시 저장
            this._setCachedData(this.cacheKeys.CONTINENT_STATS, result);
            
            return result;
        } catch (error) {
            console.error('TravelCollectionController: getContinentStats 실패:', error);
            return this.getDefaultContinentStats();
        }
    }

    /**
     * 여행 컬렉션 통계를 계산합니다
     * @returns {Object} 여행 컬렉션 통계
     */
    getTravelCollectionStats() {
        try {
            // 캐시 확인
            const cached = this._getCachedData(this.cacheKeys.COLLECTION_STATS);
            if (cached) {
                return cached;
            }

            const visitedCountries = this.getVisitedCountries();
            const continentStats = this.getContinentStats();
            const totalCountries = 195; // 전 세계 총 국가 수
            const visitedTotal = Object.keys(visitedCountries.countries).length;
            
            const result = {
                total: totalCountries,
                visited: visitedTotal,
                percentage: Math.round((visitedTotal / totalCountries) * 100),
                continents: continentStats,
                visitedCountries: visitedCountries
            };

            // 캐시 저장
            this._setCachedData(this.cacheKeys.COLLECTION_STATS, result);
            
            return result;
        } catch (error) {
            console.error('TravelCollectionController: getTravelCollectionStats 실패:', error);
            return {
                total: 195,
                visited: 0,
                percentage: 0,
                continents: this.getDefaultContinentStats(),
                visitedCountries: { visitedCountryCodes: [], countries: {} }
            };
        }
    }

    /**
     * 특정 국가의 상세 정보를 가져옵니다
     * @param {string} countryCode - 국가 코드
     * @returns {Object|null} 국가 상세 정보
     */
    getCountryDetails(countryCode) {
        try {
            const visitedCountries = this.getVisitedCountries();
            return visitedCountries.countries[countryCode] || null;
        } catch (error) {
            console.error('TravelCollectionController: getCountryDetails 실패:', error);
            return null;
        }
    }

    /**
     * 국가별 방문 횟수를 가져옵니다
     * @returns {Map} 국가별 방문 횟수 Map
     */
    getCountryVisitCounts() {
        try {
            const visitedCountries = this.getVisitedCountries();
            const visitCountMap = new Map();
            
            Object.values(visitedCountries.countries).forEach(country => {
                visitCountMap.set(country.code, country.visitCount);
            });
            
            return visitCountMap;
        } catch (error) {
            console.error('TravelCollectionController: getCountryVisitCounts 실패:', error);
            return new Map();
        }
    }

    /**
     * 여행 일수 계산
     * @param {string} startDate - 시작일
     * @param {string} endDate - 종료일
     * @returns {number} 여행 일수
     * @private
     */
    _calculateTravelDays(startDate, endDate) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        } catch (error) {
            console.error('TravelCollectionController: _calculateTravelDays 실패:', error);
            return 1;
        }
    }

    /**
     * 기본 대륙별 통계를 반환합니다 (에러 시 fallback)
     * @returns {Array} 기본 대륙별 통계
     * @private
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
     * 캐시된 데이터를 가져옵니다
     * @param {string} key - 캐시 키
     * @returns {*} 캐시된 데이터 또는 null
     * @private
     */
    _getCachedData(key) {
        try {
            const cached = this.cacheManager.get(key);
            if (cached && cached.timestamp) {
                const now = Date.now();
                if (now - cached.timestamp < this.cacheTTL) {
                    return cached.data;
                }
            }
            return null;
        } catch (error) {
            console.error('TravelCollectionController: _getCachedData 실패:', error);
            return null;
        }
    }

    /**
     * 데이터를 캐시에 저장합니다
     * @param {string} key - 캐시 키
     * @param {*} data - 저장할 데이터
     * @private
     */
    _setCachedData(key, data) {
        try {
            this.cacheManager.set(key, {
                data: data,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('TravelCollectionController: _setCachedData 실패:', error);
        }
    }

    /**
     * 캐시를 무효화합니다
     */
    invalidateCache() {
        try {
            Object.values(this.cacheKeys).forEach(key => {
                this.cacheManager.delete(key);
            });
            this.collectionCache.clear();
            console.log('TravelCollectionController: 캐시 무효화 완료');
        } catch (error) {
            console.error('TravelCollectionController: 캐시 무효화 실패:', error);
        }
    }

    /**
     * 컨트롤러 정리
     */
    cleanup() {
        try {
            this.invalidateCache();
            this.isInitialized = false;
            console.log('TravelCollectionController: 정리 완료');
        } catch (error) {
            console.error('TravelCollectionController: 정리 실패:', error);
        }
    }
}

export { TravelCollectionController };
