/**
 * 검색 UI 렌더러
 * 검색 관련 모든 UI 렌더링을 담당
 */

import { 
    SEARCH_STATES, 
    SORT_TYPES, 
    SORT_DISPLAY_NAMES,
    PURPOSE_DISPLAY_NAMES,
    TRAVEL_STYLE_DISPLAY_NAMES,
    FIELD_DISPLAY_NAMES,
    CONTINENTS,
    PURPOSES,
    TRAVEL_STYLES
} from '../utils/SearchConstants.js';

export class SearchUIRenderer {
    constructor() {
        this.container = null;
        this.countriesManager = null;
    }

    /**
     * 검색 컨테이너를 설정합니다
     * @param {HTMLElement} container - 컨테이너 요소
     */
    setContainer(container) {
        this.container = container;
    }

    /**
     * CountriesManager를 초기화합니다
     * @async
     */
    async initializeCountries() {
        try {
            if (!this.countriesManager) {
                const { countriesManager } = await import('../../../data/countries-manager.js');
                this.countriesManager = countriesManager;
                await this.countriesManager.initialize();
            }
        } catch (error) {
            console.error('SearchUIRenderer: CountriesManager 초기화 실패:', error);
        }
    }

    /**
     * 국가 코드를 한국어 국가명으로 변환합니다
     * @param {string} countryCode - 국가 코드
     * @returns {string} 한국어 국가명
     */
    getCountryDisplayName(countryCode) {
        if (!countryCode) return '';
        
        // 이미 한국어명인 경우 그대로 반환
        if (countryCode.length > 2) {
            return countryCode;
        }
        
        // CountriesManager가 초기화되지 않은 경우 원본 반환
        if (!this.countriesManager) {
            return countryCode;
        }
        
        // 국가 코드를 한국어명으로 변환
        const country = this.countriesManager.getCountryByCode(countryCode);
        return country ? country.nameKo : countryCode;
    }

    /**
     * 메인 검색 UI를 렌더링합니다
     * @param {Object} state - 검색 상태 정보
     * @param {Object} options - 렌더링 옵션
     */
    renderMainUI(state, options = {}) {
        if (!this.container) {
            console.error('컨테이너가 설정되지 않았습니다.');
            return;
        }

        try {
            const { searchState, searchQuery, searchResults, allLogs } = state;
            
            // 상세 화면일 때는 검색 관련 UI를 숨기고 상세 화면만 표시
            if (searchState === SEARCH_STATES.DETAIL) {
                this.container.innerHTML = `
                    <div class="search-container detail-mode">
                        ${this.renderStateContent(state, options)}
                    </div>
                `;
            } else {
                // 일반 검색 화면
                this.container.innerHTML = `
                    <div class="search-container">
                        ${this.renderSearchHeader()}
                        ${this.renderSearchBar(searchQuery)}
                        ${this.renderFilterSection()}
                        ${searchState === SEARCH_STATES.HAS_RESULTS ? this.renderSortSection(state) : ''}
                        ${this.renderStateContent(state, options)}
                    </div>
                `;
            }
        } catch (error) {
            console.error('검색 UI 렌더링 오류:', error);
            this.renderErrorFallback();
        }
    }

    /**
     * 검색 헤더를 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderSearchHeader() {
        return `
            <div class="search-header">
                <h1 class="search-title">🔍 일정 검색</h1>
                <p class="search-subtitle">나의 일정 기록을 빠르게 찾아보세요</p>
            </div>
        `;
    }

    /**
     * 검색바를 렌더링합니다
     * @param {string} searchQuery - 현재 검색어
     * @returns {string} HTML 문자열
     */
    renderSearchBar(searchQuery = '') {
        return `
            <div class="search-bar-container">
                <div class="search-input-wrapper">
                    <label for="search-input" class="sr-only">검색어 입력</label>
                    <input 
                        type="text" 
                        class="search-input" 
                        placeholder="국가, 도시, 일정지, 메모 등을 검색하세요..."
                        id="search-input"
                        name="search-query"
                        autocomplete="off"
                        value="${searchQuery}"
                        aria-label="검색어 입력"
                    >
                    <button class="search-btn" id="search-btn" type="button" aria-label="검색 실행">검색</button>
                </div>
            </div>
        `;
    }

    /**
     * 필터 섹션을 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderFilterSection() {
        return `
            <div class="filter-section">
                <div class="filter-header">
                    <h3 class="filter-title">📋 상세 필터</h3>
                    <button class="filter-toggle-btn" id="filter-toggle">
                        <span class="toggle-icon">▼</span>
                        <span class="toggle-text">필터 펼치기</span>
                    </button>
                </div>
                
                <div class="filter-content" id="filter-content">
                    ${this.renderFilterTabs()}
                    ${this.renderFilterPanels()}
                    ${this.renderFilterActions()}
                </div>
            </div>
        `;
    }

    /**
     * 필터 탭을 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderFilterTabs() {
        return `
            <div class="filter-tabs">
                <button class="filter-tab active" data-tab="location">
                    <span class="tab-icon">🌍</span>
                    <span class="tab-label">위치</span>
                </button>
                <button class="filter-tab" data-tab="purpose">
                    <span class="tab-icon">🎯</span>
                    <span class="tab-label">목적</span>
                </button>
                <button class="filter-tab" data-tab="period">
                    <span class="tab-icon">📅</span>
                    <span class="tab-label">기간</span>
                </button>
                <button class="filter-tab" data-tab="rating">
                    <span class="tab-icon">⭐</span>
                    <span class="tab-label">평점</span>
                </button>
            </div>
        `;
    }

    /**
     * 필터 패널들을 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderFilterPanels() {
        return `
            ${this.renderLocationFilterPanel()}
            ${this.renderPurposeFilterPanel()}
            ${this.renderPeriodFilterPanel()}
            ${this.renderRatingFilterPanel()}
        `;
    }

    /**
     * 위치 필터 패널을 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderLocationFilterPanel() {
        const continentCheckboxes = CONTINENTS.map(continent => `
            <label class="checkbox-item" for="continent-${continent.value}">
                <input type="checkbox" value="${continent.value}" id="continent-${continent.value}" name="continent" autocomplete="off">
                <span class="checkmark"></span>
                ${continent.label}
            </label>
        `).join('');

        return `
            <div class="filter-panel active" data-panel="location">
                <div class="filter-group">
                    <label class="filter-label">🌍 대륙</label>
                    <div class="filter-checkboxes">
                        ${continentCheckboxes}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 목적 필터 패널을 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderPurposeFilterPanel() {
        const purposeCheckboxes = PURPOSES.map(purpose => `
            <label class="checkbox-item" for="purpose-${purpose.value}">
                <input type="checkbox" value="${purpose.value}" id="purpose-${purpose.value}" name="purpose" autocomplete="off">
                <span class="checkmark"></span>
                ${purpose.label}
            </label>
        `).join('');

        const styleCheckboxes = TRAVEL_STYLES.map(style => `
            <label class="checkbox-item" for="style-${style.value}">
                <input type="checkbox" value="${style.value}" id="style-${style.value}" name="travel-style" autocomplete="off">
                <span class="checkmark"></span>
                ${style.label}
            </label>
        `).join('');

        return `
            <div class="filter-panel" data-panel="purpose">
                <div class="filter-group">
                    <label class="filter-label">🎯 체류 목적</label>
                    <div class="filter-checkboxes">
                        ${purposeCheckboxes}
                    </div>
                </div>

                <div class="filter-group">
                    <label class="filter-label">👥 동행 유형</label>
                    <div class="filter-checkboxes">
                        ${styleCheckboxes}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 기간 필터 패널을 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderPeriodFilterPanel() {
        return `
            <div class="filter-panel" data-panel="period">
                <div class="filter-group">
                    <label class="filter-label">📅 일정 기간</label>
                    <div class="date-range-filter">
                        <div class="date-input-group">
                            <label class="date-label" for="start-date">시작일</label>
                            <input type="date" class="date-input" id="start-date" name="start-date" autocomplete="off">
                        </div>
                        <div class="date-separator">~</div>
                        <div class="date-input-group">
                            <label class="date-label" for="end-date">종료일</label>
                            <input type="date" class="date-input" id="end-date" name="end-date" autocomplete="off">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 평점 필터 패널을 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderRatingFilterPanel() {
        return `
            <div class="filter-panel" data-panel="rating">
                <div class="filter-group">
                    <label class="filter-label">⭐ 별점</label>
                    <div class="star-rating" id="search-star-rating">
                        <div class="star" data-value="1">★</div>
                        <div class="star" data-value="2">★</div>
                        <div class="star" data-value="3">★</div>
                        <div class="star" data-value="4">★</div>
                        <div class="star" data-value="5">★</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 필터 액션 버튼들을 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderFilterActions() {
        return `
            <div class="filter-actions">
                <button class="filter-reset-btn" id="filter-reset">필터 초기화</button>
                <button class="filter-apply-btn" id="filter-apply">필터 적용</button>
            </div>
        `;
    }

    /**
     * 정렬 섹션을 렌더링합니다
     * @param {Object} state - 검색 상태 정보
     * @returns {string} HTML 문자열
     */
    renderSortSection(state) {
        const { currentSortType = SORT_TYPES.RELEVANCE } = state;
        
        const sortOptions = Object.values(SORT_TYPES).map(sortType => `
            <label class="sort-option" for="sort-${sortType}">
                <input type="radio" name="sort" value="${sortType}" id="sort-${sortType}" ${currentSortType === sortType ? 'checked' : ''} autocomplete="off">
                <span class="sort-text">${SORT_DISPLAY_NAMES[sortType]}</span>
            </label>
        `).join('');

        return `
            <div class="sort-section">
                <div class="sort-header">
                    <h3 class="sort-title">📋 정렬</h3>
                </div>
                <div class="sort-options">
                    ${sortOptions}
                </div>
            </div>
        `;
    }

    /**
     * 상태별 콘텐츠를 렌더링합니다
     * @param {Object} state - 검색 상태 정보
     * @param {Object} options - 렌더링 옵션
     * @returns {string} HTML 문자열
     */
    renderStateContent(state, options = {}) {
        const { searchState, searchQuery, searchResults, allLogs } = state;

        switch (searchState) {
            case SEARCH_STATES.INITIAL:
                return this.renderInitialState(allLogs);
                
            case SEARCH_STATES.SEARCHING:
                return this.renderSearchingState(searchQuery);
                
            case SEARCH_STATES.HAS_RESULTS:
                return this.renderHasResultsState(searchQuery, searchResults);
                
            case SEARCH_STATES.NO_RESULTS:
                return this.renderNoResultsState(searchQuery);
                
            case SEARCH_STATES.DETAIL:
                return this.renderDetailState();
                
            default:
                return '';
        }
    }

    /**
     * 초기 상태를 렌더링합니다
     * @param {Array} allLogs - 모든 로그 데이터
     * @returns {string} HTML 문자열
     */
    renderInitialState(allLogs = []) {
        const logCount = allLogs.length;
        
        return `
            <div class="search-guide-section">
                <div class="guide-content">
                    <div class="guide-icon">🔍</div>
                    <div class="guide-title">일정 검색을 시작해보세요</div>
                    <div class="guide-description">
                        검색어를 입력하거나 상세 필터를 설정하여<br>
                        원하는 일정 기록을 빠르게 찾을 수 있습니다.
                    </div>
                    ${logCount > 0 ? 
                        `<div class="guide-stats">
                            <span class="stats-text">📊 총 ${logCount}개의 일정 기록이 저장되어 있습니다</span>
                        </div>` : 
                        `<div class="guide-stats">
                            <span class="stats-text">📝 아직 저장된 일정이 없습니다. 새로운 일정을 추가해보세요!</span>
                        </div>`
                    }
                </div>
            </div>
        `;
    }

    /**
     * 검색 중 상태를 렌더링합니다
     * @param {string} searchQuery - 검색어
     * @returns {string} HTML 문자열
     */
    renderSearchingState(searchQuery) {
        return `
            <div class="search-loading-section">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">검색 중입니다...</div>
                    <div class="loading-subtext">"${searchQuery}"에 대한 결과를 찾고 있습니다</div>
                </div>
            </div>
        `;
    }

    /**
     * 검색 결과가 있는 상태를 렌더링합니다
     * @param {string} searchQuery - 검색어
     * @param {Array} searchResults - 검색 결과
     * @returns {string} HTML 문자열
     */
    renderHasResultsState(searchQuery, searchResults = []) {
        const isFilterSearch = !searchQuery || searchQuery.trim() === '';
        const searchType = isFilterSearch ? '필터 검색' : '검색';
        
        return `
            <div class="search-results-section">
                <div class="results-header">
                    <h3 class="results-title">📊 ${searchType} 결과</h3>
                    <div class="results-count">
                        <span class="count-number">${searchResults.length}</span>개의 일정 기록
                        ${searchQuery ? `("${searchQuery}" 검색)` : '(필터 조건으로 검색)'}
                    </div>
                </div>
                
                <div class="results-content">
                    <div class="results-list">
                        ${this.renderSearchResults(searchResults, searchQuery)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 검색 결과가 없는 상태를 렌더링합니다
     * @param {string} searchQuery - 검색어
     * @returns {string} HTML 문자열
     */
    renderNoResultsState(searchQuery) {
        const isFilterSearch = !searchQuery || searchQuery.trim() === '';
        const searchType = isFilterSearch ? '필터 검색' : '검색';
        
        return `
            <div class="search-results-section">
                <div class="results-header">
                    <h3 class="results-title">📊 ${searchType} 결과</h3>
                    <div class="results-count">
                        <span class="count-number">0</span>개의 일정 기록
                        ${searchQuery ? `("${searchQuery}" 검색)` : '(필터 조건으로 검색)'}
                    </div>
                </div>
                
                <div class="results-content">
                    <div class="no-results-placeholder">
                        <div class="no-results-icon">🔍</div>
                        <div class="no-results-title">검색 결과가 없습니다</div>
                        <div class="no-results-description">
                            <strong>"${searchQuery}"</strong>에 대한 검색 결과를 찾을 수 없습니다.<br>
                            다른 검색어를 시도하거나 필터를 조정해보세요.
                        </div>
                        <div class="no-results-suggestions">
                            <div class="suggestion-title">💡 검색 팁:</div>
                            <ul class="suggestion-list">
                                <li>국가명이나 도시명을 정확하게 입력해보세요</li>
                                <li>더 짧은 키워드로 검색해보세요</li>
                                <li>영어나 한글로 검색해보세요</li>
                            </ul>
                        </div>
                        <button class="retry-search-btn" id="retry-search">다른 조건으로 검색</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 상세 화면 상태를 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderDetailState() {
        return `
            <div class="log-detail-container" id="log-detail-container">
                <!-- LogDetailModule이 여기에 렌더링됩니다 -->
            </div>
        `;
    }

    /**
     * 검색 결과 목록을 렌더링합니다
     * @param {Array} searchResults - 검색 결과 배열
     * @param {string} searchQuery - 검색어
     * @returns {string} HTML 문자열
     */
    renderSearchResults(searchResults, searchQuery) {
        if (!searchResults || searchResults.length === 0) {
            return '<div class="no-results">검색 결과가 없습니다.</div>';
        }
        
        return searchResults.map((result, index) => {
            const log = result.log || result; // 필터 검색 결과는 직접 log 객체일 수 있음
            
            // 안전한 접근을 위한 방어 코드
            if (!log || typeof log !== 'object') {
                console.warn('잘못된 로그 객체:', result);
                return '<div class="search-result-item error">잘못된 데이터입니다.</div>';
            }
            
            const countryDisplayName = this.getCountryDisplayName(log?.country);
            
            return `
                <div class="search-result-item clickable" data-index="${index}" data-log-id="${log?.id || ''}">
                    <div class="result-header">
                        <div class="result-title-section">
                            <h4 class="result-title">
                                ${this.highlightText(countryDisplayName, searchQuery)}
                                ${log?.city ? ` - ${this.highlightText(log.city, searchQuery)}` : ''}
                            </h4>
                            <div class="result-rating">
                                ${this.renderStarRating(log?.rating || 0)}
                            </div>
                        </div>
                        <div class="result-meta">
                            <span class="result-date">
                                📅 ${log?.startDate || log?.date || ''}
                                ${log?.endDate ? ` - ${log.endDate}` : ''}
                            </span>
                            <span class="result-purpose">
                                ${this.getPurposeDisplayName(log?.purpose || '')}
                            </span>
                            <span class="result-style">
                                ${this.getTravelStyleDisplayName(log?.travelStyle || '')}
                            </span>
                        </div>
                    </div>
                    <div class="result-description">
                        ${log?.memo ? this.highlightText(log.memo, searchQuery) : '메모가 없습니다.'}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 별점을 시각적으로 렌더링합니다
     * @param {number} rating - 별점
     * @returns {string} HTML 문자열
     */
    renderStarRating(rating) {
        const numRating = parseFloat(rating) || 0;
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // 채워진 별
        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="star filled">★</span>';
        }
        
        // 반별 (있는 경우)
        if (hasHalfStar) {
            stars += '<span class="star half">★</span>';
        }
        
        // 빈 별
        for (let i = 0; i < emptyStars; i++) {
            stars += '<span class="star empty">☆</span>';
        }
        
        return `
            <div class="star-rating-display">
                <div class="stars">${stars}</div>
                <span class="rating-text">${numRating.toFixed(1)}/5.0</span>
            </div>
        `;
    }

    /**
     * 텍스트를 하이라이팅합니다
     * @param {string} text - 하이라이팅할 텍스트
     * @param {string} query - 검색어
     * @returns {string} 하이라이팅된 텍스트
     */
    highlightText(text, query) {
        if (!text || !query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="highlight">$1</mark>');
    }

    /**
     * 목적 코드를 사용자 친화적인 이름으로 변환합니다
     * @param {string} purposeCode - 목적 코드
     * @returns {string} 표시 이름
     */
    getPurposeDisplayName(purposeCode) {
        return PURPOSE_DISPLAY_NAMES[purposeCode] || '❓ 기타';
    }

    /**
     * 여행 스타일 코드를 사용자 친화적인 이름으로 변환합니다
     * @param {string} styleCode - 여행 스타일 코드
     * @returns {string} 표시 이름
     */
    getTravelStyleDisplayName(styleCode) {
        return TRAVEL_STYLE_DISPLAY_NAMES[styleCode] || styleCode;
    }

    /**
     * 에러 대체 UI를 렌더링합니다
     */
    renderErrorFallback() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="error-fallback">
                    <div class="error-icon">⚠️</div>
                    <div class="error-title">오류가 발생했습니다</div>
                    <div class="error-description">검색 탭을 불러오는 중 문제가 발생했습니다.</div>
                    <button class="retry-btn" onclick="location.reload()">다시 시도</button>
                </div>
            `;
        }
    }
}
