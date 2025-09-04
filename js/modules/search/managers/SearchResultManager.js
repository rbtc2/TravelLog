/**
 * 검색 결과 관리자
 * 검색 결과 저장, 관리, 정렬 기능을 담당
 */

import { SORT_TYPES, SORT_DISPLAY_NAMES } from '../utils/SearchConstants.js';

export class SearchResultManager {
    constructor() {
        this.results = [];
        this.currentSortType = SORT_TYPES.RELEVANCE;
    }

    /**
     * 검색 결과를 설정합니다
     * @param {Array} results - 검색 결과 배열
     */
    setResults(results) {
        this.results = results || [];
    }

    /**
     * 검색 결과를 가져옵니다
     * @returns {Array} 현재 검색 결과
     */
    getResults() {
        return [...this.results];
    }

    /**
     * 검색 결과 개수를 가져옵니다
     * @returns {number} 검색 결과 개수
     */
    getResultCount() {
        return this.results.length;
    }

    /**
     * 검색 결과가 있는지 확인합니다
     * @returns {boolean} 검색 결과 존재 여부
     */
    hasResults() {
        return this.results.length > 0;
    }

    /**
     * 특정 로그 ID의 결과를 제거합니다
     * @param {string} logId - 제거할 로그 ID
     */
    removeResult(logId) {
        this.results = this.results.filter(result => result.log.id !== logId);
    }

    /**
     * 검색 결과를 정렬합니다
     * @param {string} sortType - 정렬 타입
     * @returns {Array} 정렬된 결과 배열
     */
    sortResults(sortType) {
        if (!this.results || this.results.length === 0) return [];

        this.currentSortType = sortType;
        const sortedResults = [...this.results];

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

        this.results = sortedResults;
        return sortedResults;
    }

    /**
     * 현재 정렬 타입을 가져옵니다
     * @returns {string} 현재 정렬 타입
     */
    getCurrentSortType() {
        return this.currentSortType;
    }

    /**
     * 정렬 타입의 표시 이름을 가져옵니다
     * @param {string} sortType - 정렬 타입
     * @returns {string} 표시 이름
     */
    getSortDisplayName(sortType) {
        return SORT_DISPLAY_NAMES[sortType] || sortType;
    }

    /**
     * 검색 결과를 필터링합니다
     * @param {Object} filters - 필터 객체
     * @returns {Array} 필터링된 결과 배열
     */
    filterResults(filters) {
        if (!this.results || this.results.length === 0) return [];
        if (!filters) return this.results;

        return this.results.filter(result => {
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
     * @param {string} query - 검색어
     * @returns {Object} 통계 정보
     */
    calculateStats(query) {
        if (!this.results || this.results.length === 0) {
            return {
                totalResults: 0,
                query: query,
                averageRating: 0,
                purposeDistribution: {},
                dateRange: null
            };
        }

        const ratings = this.results.map(r => parseFloat(r.log.rating) || 0);
        const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

        const purposeDistribution = this.results.reduce((acc, result) => {
            const purpose = result.log.purpose || 'unknown';
            acc[purpose] = (acc[purpose] || 0) + 1;
            return acc;
        }, {});

        const dates = this.results.map(r => new Date(r.log.startDate || r.log.date)).filter(d => !isNaN(d));
        const dateRange = dates.length > 0 ? {
            earliest: new Date(Math.min(...dates)),
            latest: new Date(Math.max(...dates))
        } : null;

        return {
            totalResults: this.results.length,
            query: query,
            averageRating: parseFloat(averageRating.toFixed(1)),
            purposeDistribution,
            dateRange
        };
    }

    /**
     * 검색 결과를 초기화합니다
     */
    clearResults() {
        this.results = [];
        this.currentSortType = SORT_TYPES.RELEVANCE;
    }

    /**
     * 검색 결과 정보를 디버깅용으로 반환합니다
     * @returns {Object} 검색 결과 정보
     */
    getDebugInfo() {
        return {
            resultCount: this.results.length,
            currentSortType: this.currentSortType,
            hasResults: this.hasResults()
        };
    }
}
