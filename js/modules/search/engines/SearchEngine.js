/**
 * 검색 엔진 모듈
 * 검색 로직, 하이라이팅, 정렬 기능을 담당
 */

import SearchUtility from '../../utils/search-utility.js';
import { SORT_TYPES } from '../utils/SearchConstants.js';

export class SearchEngine {
    constructor() {
        this.searchUtility = SearchUtility;
        this.isInitialized = false;
    }

    /**
     * SearchEngine을 초기화합니다
     * @async
     */
    async initialize() {
        if (!this.isInitialized) {
            await this.searchUtility.initializeCountries();
            this.isInitialized = true;
        }
    }

    /**
     * 검색을 수행합니다
     * @param {Array} allLogs - 모든 로그 데이터
     * @param {string} query - 검색어
     * @param {Object} options - 검색 옵션
     * @returns {Object} 검색 결과와 통계
     */
    async performSearch(allLogs, query, options = {}) {
        try {
            const { showValidationError = true } = options;
            
            // 검색어 유효성 검사
            const validation = this.searchUtility.validateQuery(query);
            if (!validation.isValid) {
                return { 
                    results: [], 
                    stats: null, 
                    error: validation.error,
                    isValid: false
                };
            }

            // 검색 수행
            const searchResults = this.searchUtility.performSearch(allLogs, query);
            
            // 검색 통계 계산
            const stats = this.searchUtility.calculateSearchStats(searchResults, query);
            
            return {
                results: searchResults,
                stats: stats,
                error: null,
                isValid: true
            };
            
        } catch (error) {
            console.error('검색 수행 오류:', error);
            return {
                results: [],
                stats: null,
                error: error.message,
                isValid: false
            };
        }
    }

    /**
     * 필터 조건만으로 검색을 수행합니다
     * @param {Array} allLogs - 모든 로그 데이터
     * @param {Object} filters - 필터 조건
     * @param {Object} options - 검색 옵션
     * @returns {Object} 검색 결과와 통계
     */
    async performFilterSearch(allLogs, filters, options = {}) {
        const startTime = performance.now();
        
        try {
            console.log('🔍 필터 전용 검색 시작:', filters);
            
            // 필터 조건 유효성 검사
            const validation = this.validateFilters(filters);
            if (!validation.isValid) {
                return { 
                    results: [], 
                    stats: null, 
                    error: validation.error,
                    isValid: false
                };
            }

            // 필터 검색 수행
            const filterResults = this.applyFilters(allLogs, filters);
            
            // 검색 통계 계산
            const stats = this.calculateFilterStats(filterResults, filters);
            
            const endTime = performance.now();
            const searchTime = endTime - startTime;
            
            console.log(`🔍 필터 검색 완료: ${filterResults.length}개 결과 (${searchTime.toFixed(2)}ms)`);
            
            // 성능 검증 (300ms 이내)
            if (searchTime > 300) {
                console.warn(`⚠️ 필터 검색 성능 경고: ${searchTime.toFixed(2)}ms (권장: 300ms 이내)`);
            }
            
            return {
                results: filterResults,
                stats: stats,
                error: null,
                isValid: true,
                performance: {
                    searchTime: searchTime,
                    isOptimal: searchTime <= 300
                }
            };
            
        } catch (error) {
            console.error('필터 검색 수행 오류:', error);
            return {
                results: [],
                stats: null,
                error: error.message,
                isValid: false
            };
        }
    }

    /**
     * 필터 조건을 검증합니다
     * @param {Object} filters - 필터 조건
     * @returns {Object} 검증 결과
     */
    validateFilters(filters) {
        if (!filters || typeof filters !== 'object') {
            return { isValid: false, error: '필터 조건이 올바르지 않습니다.' };
        }

        // 최소 하나의 필터 조건이 있어야 함
        const hasActiveFilters = Object.values(filters).some(value => {
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            return value !== '' && value !== null && value !== undefined;
        });

        if (!hasActiveFilters) {
            return { isValid: false, error: '최소 하나의 필터 조건을 선택해주세요.' };
        }

        return { isValid: true, error: null };
    }

    /**
     * 필터 조건을 적용하여 로그를 필터링합니다
     * @param {Array} allLogs - 모든 로그 데이터
     * @param {Object} filters - 필터 조건
     * @returns {Array} 필터링된 결과
     */
    applyFilters(allLogs, filters) {
        if (!Array.isArray(allLogs) || allLogs.length === 0) {
            return [];
        }

        const filteredLogs = allLogs.filter(log => {
            // 대륙 필터
            if (filters.continent && filters.continent.length > 0) {
                const logContinent = this.getLogContinent(log);
                if (!logContinent || !filters.continent.includes(logContinent)) {
                    return false;
                }
            }

            // 목적 필터
            if (filters.purpose && filters.purpose !== '') {
                if (!log.purpose || log.purpose !== filters.purpose) {
                    return false;
                }
            }

            // 동행유형 필터
            if (filters.travelStyle && filters.travelStyle !== '') {
                if (!log.travelStyle || log.travelStyle !== filters.travelStyle) {
                    return false;
                }
            }

            // 별점 필터
            if (filters.rating && filters.rating > 0) {
                if (!log.rating || log.rating < filters.rating) {
                    return false;
                }
            }

            // 날짜 범위 필터
            if (filters.startDate && filters.endDate) {
                const logDate = new Date(log.date);
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                
                if (logDate < startDate || logDate > endDate) {
                    return false;
                }
            }

            return true;
        });

        // 필터링된 결과를 기존 검색 결과 형식으로 변환
        return filteredLogs.map(log => ({
            log: log,
            score: 10, // 필터 검색에서는 모든 결과에 동일한 점수 부여
            matchedFields: [{
                field: 'filter',
                value: 'filtered',
                score: 10,
                weight: 1
            }]
        }));
    }

    /**
     * 로그의 대륙을 가져옵니다
     * @param {Object} log - 로그 객체
     * @returns {string|null} 대륙명
     */
    getLogContinent(log) {
        if (!log.country) return null;
        
        // 국가 코드로 대륙 찾기
        const countryCode = log.country.toUpperCase();
        const countryMapping = this.searchUtility.countryMapping;
        
        // 국가 코드로 직접 매핑 찾기
        for (const [key, value] of countryMapping.entries()) {
            if (key === countryCode && typeof value === 'string' && value !== countryCode) {
                // 대륙 정보는 별도로 관리해야 함
                // 임시로 국가명을 반환 (실제로는 대륙 매핑이 필요)
                return this.getContinentFromCountry(value);
            }
        }
        
        return null;
    }

    /**
     * 국가명으로부터 대륙을 추정합니다 (임시 구현)
     * @param {string} countryName - 국가명
     * @returns {string} 대륙명
     */
    getContinentFromCountry(countryName) {
        // 간단한 대륙 매핑 (실제로는 더 정확한 매핑이 필요)
        const continentMap = {
            '대한민국': '아시아',
            '일본': '아시아',
            '중국': '아시아',
            '태국': '아시아',
            '베트남': '아시아',
            '싱가포르': '아시아',
            '인도네시아': '아시아',
            '말레이시아': '아시아',
            '필리핀': '아시아',
            '미국': '북아메리카',
            '캐나다': '북아메리카',
            '멕시코': '북아메리카',
            '프랑스': '유럽',
            '독일': '유럽',
            '영국': '유럽',
            '이탈리아': '유럽',
            '스페인': '유럽',
            '네덜란드': '유럽',
            '스위스': '유럽',
            '오스트리아': '유럽',
            '브라질': '남아메리카',
            '아르헨티나': '남아메리카',
            '칠레': '남아메리카',
            '호주': '오세아니아',
            '뉴질랜드': '오세아니아',
            '이집트': '아프리카',
            '남아프리카': '아프리카',
            '모로코': '아프리카'
        };
        
        return continentMap[countryName] || '기타';
    }

    /**
     * 필터 검색 통계를 계산합니다
     * @param {Array} results - 필터링된 결과
     * @param {Object} filters - 적용된 필터
     * @returns {Object} 검색 통계
     */
    calculateFilterStats(results, filters) {
        const totalResults = results.length;
        let totalScore = 0;
        const fieldStats = {};

        results.forEach(result => {
            // 필터 검색에서는 모든 결과에 동일한 점수 부여
            const score = 10;
            totalScore += score;
            
            // 필드별 통계
            Object.keys(filters).forEach(filterKey => {
                if (filters[filterKey] && filters[filterKey] !== '') {
                    if (!fieldStats[filterKey]) {
                        fieldStats[filterKey] = { count: 0, totalScore: 0 };
                    }
                    fieldStats[filterKey].count++;
                    fieldStats[filterKey].totalScore += score;
                }
            });
        });

        return {
            totalResults,
            averageScore: totalResults > 0 ? totalScore / totalResults : 0,
            fieldStats,
            filters: filters,
            searchType: 'filter'
        };
    }

    /**
     * 텍스트를 하이라이팅합니다
     * @param {string} text - 하이라이팅할 텍스트
     * @param {string} query - 검색어
     * @returns {string} 하이라이팅된 텍스트
     */
    highlightText(text, query) {
        if (!text || !query) return text;
        return this.searchUtility.highlightText(text, query);
    }

    /**
     * 검색 결과를 정렬합니다
     * @param {Array} results - 검색 결과 배열
     * @param {string} sortType - 정렬 타입
     * @returns {Array} 정렬된 결과 배열
     */
    sortResults(results, sortType) {
        if (!results || results.length === 0) return results;

        const sortedResults = [...results];

        switch (sortType) {
            case SORT_TYPES.RELEVANCE:
                // 관련성순 (기본값, 이미 정렬됨)
                break;
                
            case SORT_TYPES.DATE_DESC:
                sortedResults.sort((a, b) => {
                    const dateA = new Date(a.log.startDate || a.log.date || 0);
                    const dateB = new Date(b.log.startDate || b.log.date || 0);
                    return dateB - dateA;
                });
                break;
                
            case SORT_TYPES.DATE_ASC:
                sortedResults.sort((a, b) => {
                    const dateA = new Date(a.log.startDate || a.log.date || 0);
                    const dateB = new Date(b.log.startDate || b.log.date || 0);
                    return dateA - dateB;
                });
                break;
                
            case SORT_TYPES.RATING_DESC:
                sortedResults.sort((a, b) => (b.log.rating || 0) - (a.log.rating || 0));
                break;
                
            case SORT_TYPES.PURPOSE_ASC:
                sortedResults.sort((a, b) => {
                    const purposeA = (a.log.purpose || '').toLowerCase();
                    const purposeB = (b.log.purpose || '').toLowerCase();
                    return purposeA.localeCompare(purposeB);
                });
                break;
                
            default:
                console.warn(`알 수 없는 정렬 타입: ${sortType}`);
        }

        return sortedResults;
    }

    /**
     * 검색 결과에 필터를 적용합니다
     * @param {Array} results - 검색 결과 배열
     * @param {Object} filters - 필터 객체
     * @returns {Array} 필터링된 결과 배열
     */
    applyFilters(results, filters) {
        if (!results || results.length === 0) return results;
        if (!filters) return results;

        return results.filter(result => {
            const log = result?.log || result; // 필터 검색 결과는 직접 log 객체일 수 있음
            
            // 로그 객체 유효성 검사
            if (!log || typeof log !== 'object') {
                console.warn('잘못된 로그 객체:', result);
                return false;
            }

            // 대륙 필터
            if (filters.continent && filters.continent.length > 0) {
                // 대륙 필터 로직 구현 필요
                // 현재는 스킵
            }

            // 목적 필터
            if (filters.purpose && filters.purpose !== '') {
                if (!log?.purpose || log.purpose !== filters.purpose) return false;
            }

            // 여행 스타일 필터 (여러 개 선택 가능 - OR 조건)
            if (filters.travelStyle && filters.travelStyle.length > 0) {
                if (!log?.travelStyle) return false;
                
                // 기존 데이터 호환성을 위한 매핑
                const styleMapping = {
                    'solo': 'alone',
                    'group': 'colleagues' // 단체 여행은 동료와로 매핑
                };
                
                const normalizedLogStyle = styleMapping[log.travelStyle] || log.travelStyle;
                if (!filters.travelStyle.includes(normalizedLogStyle)) return false;
            }

            // 별점 필터 (정확한 별점만 필터링)
            if (filters.rating && filters.rating !== '') {
                const rating = parseFloat(log?.rating) || 0;
                const targetRating = parseFloat(filters.rating);
                if (rating !== targetRating) return false;
            }

            // 날짜 범위 필터
            if (filters.dateRange) {
                const { start, end } = filters.dateRange;
                if (start || end) {
                    const logDate = new Date(log?.startDate || log?.date);
                    if (isNaN(logDate.getTime())) return false; // 유효하지 않은 날짜
                    
                    if (start) {
                        const startDate = new Date(start);
                        if (logDate < startDate) return false;
                    }
                    if (end) {
                        const endDate = new Date(end);
                        if (logDate > endDate) return false;
                    }
                }
            }

            return true;
        });
    }

    /**
     * 검색 결과의 통계를 계산합니다
     * @param {Array} results - 검색 결과 배열
     * @param {string} query - 검색어
     * @returns {Object} 통계 정보
     */
    calculateStats(results, query) {
        if (!results || results.length === 0) {
            return {
                totalResults: 0,
                query: query,
                averageRating: 0,
                purposeDistribution: {},
                dateRange: null
            };
        }

        const ratings = results.map(r => parseFloat(r.log.rating) || 0);
        const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

        const purposeDistribution = results.reduce((acc, result) => {
            const purpose = result.log.purpose || 'unknown';
            acc[purpose] = (acc[purpose] || 0) + 1;
            return acc;
        }, {});

        const dates = results.map(r => new Date(r.log.startDate || r.log.date)).filter(d => !isNaN(d));
        const dateRange = dates.length > 0 ? {
            earliest: new Date(Math.min(...dates)),
            latest: new Date(Math.max(...dates))
        } : null;

        return {
            totalResults: results.length,
            query: query,
            averageRating: parseFloat(averageRating.toFixed(1)),
            purposeDistribution,
            dateRange
        };
    }
}
