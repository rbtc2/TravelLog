/**
 * Exploration Stats Manager - 탐험 통계 전용 매니저
 * 
 * 🎯 책임:
 * - 전세계 탐험 현황 통계 계산
 * - 대륙별 방문 통계 분석
 * - 지리적 분포 및 탐험 진행률 계산
 * - 국가-대륙 매핑 관리
 * 
 * @class ExplorationStatsManager
 * @version 1.0.0
 * @since 2024-12-29
 */

import { CacheManager } from '../../services/cache-manager.js';
import { countriesManager } from '../../../data/countries-manager.js';

class ExplorationStatsManager {
    constructor(logDataService, cacheManager) {
        this.logDataService = logDataService;
        this.cacheManager = cacheManager;
        
        // 캐시 키 관리
        this.cacheKeys = {
            WORLD_EXPLORATION: 'world_exploration_stats',
            CONTINENT_STATS: 'continent_stats',
            COUNTRY_CONTINENT_MAP: 'country_continent_mapping'
        };
        
        // 성능 최적화를 위한 설정
        this.cacheTTL = 10 * 60 * 1000; // 10분 캐시 (변동이 적은 데이터)
        
        // 대륙별 정보 정의 (실제 국가 수 기준)
        this.continentInfo = {
            'Asia': { nameKo: '아시아', emoji: '🌏', total: 48 },
            'Europe': { nameKo: '유럽', emoji: '🌍', total: 44 },
            'North America': { nameKo: '북미', emoji: '🌎', total: 23 },
            'South America': { nameKo: '남미', emoji: '🌎', total: 12 },
            'Africa': { nameKo: '아프리카', emoji: '🌍', total: 54 },
            'Oceania': { nameKo: '오세아니아', emoji: '🌏', total: 14 }
        };
        
        // 국가-대륙 매핑 (확장 가능한 구조)
        this.countryToContinentMap = this._initializeCountryContinentMap();
    }

    /**
     * 전세계 탐험 현황 통계를 계산합니다 (MyLogsController에서 이관된 핵심 로직)
     * @returns {Object} 전세계 탐험 현황 통계
     */
    getWorldExplorationStats() {
        try {
            // 캐시된 결과 확인
            const cachedResult = this._getCachedResult(this.cacheKeys.WORLD_EXPLORATION);
            if (cachedResult) {
                return cachedResult;
            }

            const logs = this.logDataService.getAllLogs();
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
            
            const result = {
                totalCountries: totalCountries,
                visitedCountries: visitedCountries,
                progressPercentage: progressPercentage,
                continentStats: continentStats,
                hasData: visitedCountries > 0,
                lastUpdated: new Date().toISOString()
            };

            // 결과 캐싱
            this._setCachedResult(this.cacheKeys.WORLD_EXPLORATION, result);
            
            return result;

        } catch (error) {
            console.error('ExplorationStatsManager: 전세계 탐험 현황 통계 계산 오류:', error);
            return this._getDefaultWorldExplorationStats();
        }
    }

    /**
     * 대륙별 통계를 계산합니다 (MyLogsController에서 이관된 핵심 로직)
     * @returns {Array} 대륙별 통계 배열
     */
    getContinentStats() {
        try {
            // 캐시된 결과 확인
            const cachedResult = this._getCachedResult(this.cacheKeys.CONTINENT_STATS);
            if (cachedResult) {
                return cachedResult;
            }

            const logs = this.logDataService.getAllLogs();
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
            
            // 대륙별 통계 생성
            const continentStats = Object.entries(this.continentInfo).map(([continent, info]) => {
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

            // 결과 캐싱
            this._setCachedResult(this.cacheKeys.CONTINENT_STATS, continentStats);
            
            return continentStats;

        } catch (error) {
            console.error('ExplorationStatsManager: 대륙별 통계 계산 오류:', error);
            return this._getDefaultContinentStats();
        }
    }

    /**
     * 국가의 대륙을 반환합니다 (MyLogsController에서 이관된 로직, 확장됨)
     * @param {string} countryCode - 국가 코드
     * @returns {string|null} 대륙명
     */
    getCountryContinent(countryCode) {
        try {
            return this.countryToContinentMap[countryCode] || null;
        } catch (error) {
            console.error('ExplorationStatsManager: 국가 대륙 조회 오류:', error);
            return null;
        }
    }

    /**
     * 대륙별 탐험 진행률을 계산합니다
     * @returns {Object} 대륙별 진행률 정보
     */
    getContinentProgressSummary() {
        try {
            const continentStats = this.getContinentStats();
            
            const summary = {
                totalContinents: Object.keys(this.continentInfo).length,
                exploredContinents: 0,
                averageProgress: 0,
                mostExploredContinent: null,
                leastExploredContinent: null
            };

            let totalProgress = 0;
            let maxProgress = -1;
            let minProgress = 101;

            continentStats.forEach(stat => {
                if (stat.visited > 0) {
                    summary.exploredContinents++;
                }
                
                totalProgress += stat.percentage;
                
                if (stat.percentage > maxProgress) {
                    maxProgress = stat.percentage;
                    summary.mostExploredContinent = stat;
                }
                
                if (stat.percentage < minProgress) {
                    minProgress = stat.percentage;
                    summary.leastExploredContinent = stat;
                }
            });

            summary.averageProgress = Math.round(totalProgress / continentStats.length);
            
            return summary;

        } catch (error) {
            console.error('ExplorationStatsManager: 대륙별 진행률 계산 오류:', error);
            return {
                totalContinents: 6,
                exploredContinents: 0,
                averageProgress: 0,
                mostExploredContinent: null,
                leastExploredContinent: null
            };
        }
    }

    /**
     * 국가-대륙 매핑을 초기화합니다 (확장된 매핑)
     * @returns {Object} 국가-대륙 매핑 객체
     * @private
     */
    _initializeCountryContinentMap() {
        return {
            // 아시아 (48개국)
            'JP': 'Asia', 'KR': 'Asia', 'CN': 'Asia', 'TH': 'Asia', 'VN': 'Asia', 
            'SG': 'Asia', 'MY': 'Asia', 'ID': 'Asia', 'PH': 'Asia', 'IN': 'Asia', 
            'TR': 'Asia', 'AE': 'Asia', 'SA': 'Asia', 'QA': 'Asia', 'KW': 'Asia',
            'BH': 'Asia', 'OM': 'Asia', 'JO': 'Asia', 'LB': 'Asia', 'SY': 'Asia',
            'IQ': 'Asia', 'IR': 'Asia', 'AF': 'Asia', 'PK': 'Asia', 'BD': 'Asia',
            'LK': 'Asia', 'MV': 'Asia', 'NP': 'Asia', 'BT': 'Asia', 'MM': 'Asia',
            'LA': 'Asia', 'KH': 'Asia', 'BN': 'Asia', 'TL': 'Asia', 'MN': 'Asia',
            'KZ': 'Asia', 'UZ': 'Asia', 'TM': 'Asia', 'TJ': 'Asia', 'KG': 'Asia',
            'AM': 'Asia', 'AZ': 'Asia', 'GE': 'Asia', 'CY': 'Asia', 'IL': 'Asia',
            'PS': 'Asia', 'YE': 'Asia', 'HK': 'Asia',
            
            // 유럽 (44개국)
            'FR': 'Europe', 'DE': 'Europe', 'IT': 'Europe', 'ES': 'Europe', 'GB': 'Europe', 
            'NL': 'Europe', 'BE': 'Europe', 'CH': 'Europe', 'AT': 'Europe', 'PT': 'Europe', 
            'GR': 'Europe', 'CZ': 'Europe', 'HU': 'Europe', 'PL': 'Europe', 'RO': 'Europe',
            'BG': 'Europe', 'HR': 'Europe', 'SI': 'Europe', 'SK': 'Europe', 'RS': 'Europe',
            'BA': 'Europe', 'ME': 'Europe', 'MK': 'Europe', 'AL': 'Europe', 'XK': 'Europe',
            'LT': 'Europe', 'LV': 'Europe', 'EE': 'Europe', 'FI': 'Europe', 'SE': 'Europe',
            'NO': 'Europe', 'DK': 'Europe', 'IS': 'Europe', 'IE': 'Europe', 'LU': 'Europe',
            'MT': 'Europe', 'MC': 'Europe', 'SM': 'Europe', 'VA': 'Europe', 'AD': 'Europe',
            'LI': 'Europe', 'RU': 'Europe', 'BY': 'Europe', 'UA': 'Europe', 'MD': 'Europe',
            
            // 북미 (23개국)
            'US': 'North America', 'CA': 'North America', 'MX': 'North America', 'GT': 'North America',
            'BZ': 'North America', 'SV': 'North America', 'HN': 'North America', 'NI': 'North America',
            'CR': 'North America', 'PA': 'North America', 'CU': 'North America', 'JM': 'North America',
            'HT': 'North America', 'DO': 'North America', 'BS': 'North America', 'BB': 'North America',
            'TT': 'North America', 'GD': 'North America', 'VC': 'North America', 'LC': 'North America',
            'DM': 'North America', 'KN': 'North America', 'AG': 'North America',
            
            // 남미 (12개국)
            'BR': 'South America', 'AR': 'South America', 'CL': 'South America', 'PE': 'South America',
            'CO': 'South America', 'VE': 'South America', 'EC': 'South America', 'BO': 'South America',
            'PY': 'South America', 'UY': 'South America', 'GY': 'South America', 'SR': 'South America',
            
            // 아프리카 (54개국)
            'EG': 'Africa', 'ZA': 'Africa', 'MA': 'Africa', 'KE': 'Africa', 'NG': 'Africa',
            'GH': 'Africa', 'ET': 'Africa', 'TZ': 'Africa', 'UG': 'Africa', 'ZW': 'Africa',
            'ZM': 'Africa', 'MW': 'Africa', 'MZ': 'Africa', 'BW': 'Africa', 'NA': 'Africa',
            'SZ': 'Africa', 'LS': 'Africa', 'MG': 'Africa', 'MU': 'Africa', 'SC': 'Africa',
            'CV': 'Africa', 'ST': 'Africa', 'GQ': 'Africa', 'GA': 'Africa', 'CG': 'Africa',
            'CD': 'Africa', 'CF': 'Africa', 'CM': 'Africa', 'TD': 'Africa', 'NE': 'Africa',
            'BF': 'Africa', 'ML': 'Africa', 'CI': 'Africa', 'LR': 'Africa', 'SL': 'Africa',
            'GN': 'Africa', 'GW': 'Africa', 'SN': 'Africa', 'GM': 'Africa', 'MR': 'Africa',
            'DZ': 'Africa', 'TN': 'Africa', 'LY': 'Africa', 'SD': 'Africa', 'SS': 'Africa',
            'ER': 'Africa', 'DJ': 'Africa', 'SO': 'Africa', 'RW': 'Africa', 'BI': 'Africa',
            'AO': 'Africa', 'KM': 'Africa', 'BJ': 'Africa', 'TG': 'Africa',
            
            // 오세아니아 (14개국)
            'AU': 'Oceania', 'NZ': 'Oceania', 'FJ': 'Oceania', 'PG': 'Oceania', 'SB': 'Oceania',
            'VU': 'Oceania', 'NC': 'Oceania', 'PF': 'Oceania', 'WS': 'Oceania', 'TO': 'Oceania',
            'TV': 'Oceania', 'KI': 'Oceania', 'NR': 'Oceania', 'PW': 'Oceania'
        };
    }

    /**
     * 기본 대륙별 통계를 반환합니다 (에러 시 fallback)
     * @returns {Array} 기본 대륙별 통계
     * @private
     */
    _getDefaultContinentStats() {
        return Object.entries(this.continentInfo).map(([continent, info]) => ({
            continent: continent,
            nameKo: info.nameKo,
            emoji: info.emoji,
            visited: 0,
            total: info.total,
            percentage: 0
        }));
    }

    /**
     * 기본 전세계 탐험 통계를 반환합니다 (에러 시 fallback)
     * @returns {Object} 기본 탐험 통계
     * @private
     */
    _getDefaultWorldExplorationStats() {
        return {
            totalCountries: 195,
            visitedCountries: 0,
            progressPercentage: 0,
            continentStats: this._getDefaultContinentStats(),
            hasData: false,
            lastUpdated: new Date().toISOString()
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
            console.error('ExplorationStatsManager: 캐시 조회 실패:', error);
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
            console.error('ExplorationStatsManager: 캐시 저장 실패:', error);
        }
    }

    /**
     * 캐시를 무효화합니다
     */
    invalidateCache() {
        try {
            if (this.cacheManager) {
                Object.values(this.cacheKeys).forEach(key => {
                    this.cacheManager.delete(key);
                });
            }
        } catch (error) {
            console.error('ExplorationStatsManager: 캐시 무효화 실패:', error);
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
            console.error('ExplorationStatsManager: 정리 중 오류:', error);
        }
    }
}

export { ExplorationStatsManager };
