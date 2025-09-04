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
            const log = result.log;

            // 대륙 필터
            if (filters.continent && filters.continent.length > 0) {
                // 대륙 필터 로직 구현 필요
                // 현재는 스킵
            }

            // 목적 필터
            if (filters.purpose && filters.purpose !== '') {
                if (log.purpose !== filters.purpose) return false;
            }

            // 여행 스타일 필터
            if (filters.travelStyle && filters.travelStyle !== '') {
                if (log.travelStyle !== filters.travelStyle) return false;
            }

            // 별점 필터
            if (filters.rating && filters.rating !== '') {
                const rating = parseFloat(log.rating) || 0;
                const minRating = parseFloat(filters.rating);
                if (rating < minRating) return false;
            }

            // 날짜 범위 필터
            if (filters.dateRange) {
                const { start, end } = filters.dateRange;
                if (start || end) {
                    const logDate = new Date(log.startDate || log.date);
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
