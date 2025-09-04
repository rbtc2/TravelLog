/**
 * 검색 상태 관리자
 * 검색 상태, 쿼리, 결과 등을 관리
 */

import { SEARCH_STATES, SORT_TYPES } from '../utils/SearchConstants.js';

export class SearchStateManager {
    constructor() {
        this.state = SEARCH_STATES.INITIAL;
        this.query = '';
        this.results = [];
        this.allLogs = [];
        this.currentSortType = SORT_TYPES.RELEVANCE;
        this.isSearching = false;
        this.lastSearchQuery = '';
        
        // 상세 화면 관련 상태
        this.currentDetailLogId = null;
        this.previousState = null;
    }

    /**
     * 상태를 업데이트합니다
     * @param {string} newState - 새로운 상태
     * @param {Object} data - 상태와 함께 업데이트할 데이터
     */
    updateState(newState, data = {}) {
        const previousState = this.state;
        
        // 상태가 실제로 변경될 때만 로그 출력
        if (previousState !== newState) {
            console.log(`🔄 검색 상태 변경: ${previousState} → ${newState}`);
        }
        
        this.state = newState;
        
        if (data.query !== undefined) this.query = data.query || '';
        if (data.results !== undefined) this.results = data.results || [];
        if (data.sortType !== undefined) this.currentSortType = data.sortType || 'relevance';
    }

    /**
     * 검색 상태를 가져옵니다
     * @returns {string} 현재 상태
     */
    getState() {
        return this.state;
    }

    /**
     * 검색 쿼리를 가져옵니다
     * @returns {string} 현재 검색 쿼리
     */
    getQuery() {
        return this.query;
    }

    /**
     * 검색 쿼리를 설정합니다 (상태 변경 없이)
     * @param {string} query - 검색 쿼리
     */
    setQuery(query) {
        this.query = query || '';
    }

    /**
     * 검색 결과를 가져옵니다
     * @returns {Array} 현재 검색 결과
     */
    getResults() {
        return this.results;
    }

    /**
     * 모든 로그 데이터를 설정합니다
     * @param {Array} logs - 로그 데이터 배열
     */
    setAllLogs(logs) {
        this.allLogs = logs || [];
    }

    /**
     * 모든 로그 데이터를 가져옵니다
     * @returns {Array} 모든 로그 데이터
     */
    getAllLogs() {
        return this.allLogs;
    }

    /**
     * 검색 중 상태를 설정합니다
     * @param {boolean} isSearching - 검색 중 여부
     */
    setSearching(isSearching) {
        this.isSearching = isSearching;
    }

    /**
     * 검색 중 상태를 가져옵니다
     * @returns {boolean} 검색 중 여부
     */
    isSearching() {
        return this.isSearching;
    }

    /**
     * 마지막 검색 쿼리를 설정합니다
     * @param {string} query - 마지막 검색 쿼리
     */
    setLastSearchQuery(query) {
        this.lastSearchQuery = query;
    }

    /**
     * 마지막 검색 쿼리를 가져옵니다
     * @returns {string} 마지막 검색 쿼리
     */
    getLastSearchQuery() {
        return this.lastSearchQuery;
    }

    /**
     * 상세 화면 상태로 전환합니다
     * @param {string} logId - 로그 ID
     */
    enterDetailMode(logId) {
        this.previousState = this.state;
        this.currentDetailLogId = logId;
        this.updateState(SEARCH_STATES.DETAIL);
    }

    /**
     * 상세 화면에서 이전 상태로 복귀합니다
     */
    exitDetailMode() {
        const previousState = this.previousState || SEARCH_STATES.HAS_RESULTS;
        this.currentDetailLogId = null;
        this.previousState = null;
        this.updateState(previousState);
    }

    /**
     * 현재 상세 화면의 로그 ID를 가져옵니다
     * @returns {string|null} 현재 상세 화면의 로그 ID
     */
    getCurrentDetailLogId() {
        return this.currentDetailLogId;
    }

    /**
     * 상세 화면 상태인지 확인합니다
     * @returns {boolean} 상세 화면 상태 여부
     */
    isDetailMode() {
        return this.state === SEARCH_STATES.DETAIL;
    }

    /**
     * 검색 결과가 있는 상태인지 확인합니다
     * @returns {boolean} 검색 결과가 있는 상태 여부
     */
    hasResults() {
        return this.state === SEARCH_STATES.HAS_RESULTS && this.results.length > 0;
    }

    /**
     * 검색 결과가 없는 상태인지 확인합니다
     * @returns {boolean} 검색 결과가 없는 상태 여부
     */
    hasNoResults() {
        return this.state === SEARCH_STATES.NO_RESULTS;
    }

    /**
     * 초기 상태인지 확인합니다
     * @returns {boolean} 초기 상태 여부
     */
    isInitial() {
        return this.state === SEARCH_STATES.INITIAL;
    }

    /**
     * 검색 중 상태인지 확인합니다
     * @returns {boolean} 검색 중 상태 여부
     */
    isSearchingState() {
        return this.state === SEARCH_STATES.SEARCHING;
    }

    /**
     * 상태를 초기화합니다
     */
    reset() {
        this.state = SEARCH_STATES.INITIAL;
        this.query = '';
        this.results = [];
        this.currentSortType = SORT_TYPES.RELEVANCE;
        this.isSearching = false;
        this.lastSearchQuery = '';
        this.currentDetailLogId = null;
        this.previousState = null;
    }

    /**
     * 상태 정보를 디버깅용으로 반환합니다
     * @returns {Object} 상태 정보
     */
    getDebugInfo() {
        return {
            state: this.state,
            query: this.query,
            resultsCount: this.results.length,
            allLogsCount: this.allLogs.length,
            currentSortType: this.currentSortType,
            isSearching: this.isSearching,
            lastSearchQuery: this.lastSearchQuery,
            currentDetailLogId: this.currentDetailLogId,
            previousState: this.previousState
        };
    }
}
