/**
 * 검색 탭 모듈
 * 독립적으로 동작하며, 다른 탭에 영향을 주지 않음
 */

import SearchUtility from '../modules/utils/search-utility.js';
import { StorageManager } from '../modules/utils/storage-manager.js';

class SearchTab {
    constructor() {
        this.isInitialized = false;
        this.eventListeners = [];
        this.searchInput = null;
        
        // 검색 상태 관리
        this.searchState = 'initial'; // 'initial' | 'searching' | 'hasResults' | 'noResults'
        this.searchQuery = '';
        this.searchResults = [];
        this.allLogs = []; // 모든 로그 데이터
        
        // 검색 관련 상태
        this.searchTimeout = null;
        this.isSearching = false;
        this.lastSearchQuery = '';
        
        // StorageManager 인스턴스
        this.storageManager = new StorageManager();
        
        this.filters = {
            continent: [],
            purpose: '',
            memo: '',
            travelStyle: '',
            rating: '',
            dateRange: {
                start: '',
                end: ''
            }
        };
    }
    
    render(container) {
        try {
        this.container = container;
        this.loadAllLogs(); // 로그 데이터 로드
        this.renderContent();
        this.bindEvents();
        this.isInitialized = true;
        } catch (error) {
            console.error('검색 탭 렌더링 오류:', error);
            this.showErrorFallback(container);
        }
    }
    
    /**
     * 모든 로그 데이터를 로드합니다
     */
    loadAllLogs() {
        try {
            this.allLogs = this.storageManager.loadLogs();
            console.log(`검색 탭: ${this.allLogs.length}개의 로그 데이터 로드됨`);
        } catch (error) {
            console.error('로그 데이터 로드 실패:', error);
            this.allLogs = [];
            this.showToast('로그 데이터를 불러오는 중 오류가 발생했습니다.');
        }
    }
    
    /**
     * 탭이 활성화될 때 데이터를 새로고침합니다
     */
    refresh() {
        if (this.isInitialized) {
            try {
                this.loadAllLogs(); // 로그 데이터 새로고침
                this.renderContent();
                this.bindEvents();
            } catch (error) {
                console.error('검색 탭 새로고침 오류:', error);
                this.showErrorFallback(this.container);
            }
        }
    }
    
    /**
     * 에러 발생 시 대체 UI를 표시합니다
     */
    showErrorFallback(container) {
        if (container) {
            container.innerHTML = `
                <div class="error-fallback">
                    <div class="error-icon">⚠️</div>
                    <div class="error-title">오류가 발생했습니다</div>
                    <div class="error-description">검색 탭을 불러오는 중 문제가 발생했습니다.</div>
                    <button class="retry-btn" onclick="location.reload()">다시 시도</button>
                </div>
            `;
        }
    }
    
    /**
     * 검색 상태를 업데이트하고 UI를 새로고침합니다
     */
    updateSearchState(newState, data = {}) {
        this.searchState = newState;
        
        if (data.query !== undefined) this.searchQuery = data.query;
        if (data.results !== undefined) this.searchResults = data.results;
        
        this.renderContent();
        this.bindEvents();
    }
    
    /**
     * 실제 검색을 수행합니다
     */
    async performSearch(query) {
        try {
            // 검색 중 상태로 변경
            this.updateSearchState('searching');
            this.isSearching = true;
            
            // 검색어 유효성 검사
            const validation = SearchUtility.validateQuery(query);
            if (!validation.isValid) {
                this.showToast(validation.error);
                this.updateSearchState('initial');
                return;
            }

            // 동일한 검색어로 재검색 방지
            if (this.lastSearchQuery === query && this.searchResults.length > 0) {
                this.updateSearchState('hasResults');
                return;
            }

            // 검색 수행
            const searchResults = SearchUtility.performSearch(this.allLogs, query);
            
            // 검색 결과 처리
            if (searchResults.length > 0) {
                this.searchResults = searchResults;
                this.lastSearchQuery = query;
                this.updateSearchState('hasResults', { results: searchResults });
                
                // 검색 통계 로깅
                const stats = SearchUtility.calculateSearchStats(searchResults, query);
                console.log('검색 완료:', stats);
                
            } else {
                this.searchResults = [];
                this.lastSearchQuery = query;
                this.updateSearchState('noResults', { results: [] });
            }
            
        } catch (error) {
            console.error('검색 수행 오류:', error);
            this.showToast('검색 중 오류가 발생했습니다.');
            this.updateSearchState('initial');
        } finally {
            this.isSearching = false;
        }
    }
    
    /**
     * 텍스트를 하이라이팅합니다
     */
    highlightText(text, query) {
        if (!text || !query) return text;
        return SearchUtility.highlightText(text, query);
    }
    
    renderContent() {
        try {
        this.container.innerHTML = `
                <div class="search-container">
                    <!-- 검색 헤더 -->
                    <div class="search-header">
                        <h1 class="search-title">🔍 일정 검색</h1>
                        <p class="search-subtitle">나의 일정 기록을 빠르게 찾아보세요</p>
                    </div>

                    <!-- 검색바 -->
                    <div class="search-bar-container">
                        <div class="search-input-wrapper">
                            <input 
                                type="text" 
                                class="search-input" 
                                placeholder="국가, 도시, 일정지, 메모 등을 검색하세요..."
                                id="search-input"
                                value="${this.searchQuery}"
                            >
                            <button class="search-btn" id="search-btn">검색</button>
                        </div>
                    </div>

                    <!-- 필터 섹션 -->
                    <div class="filter-section">
                        <div class="filter-header">
                            <h3 class="filter-title">📋 상세 필터</h3>
                            <button class="filter-toggle-btn" id="filter-toggle">
                                <span class="toggle-icon">▼</span>
                                <span class="toggle-text">필터 펼치기</span>
                            </button>
                        </div>
                        
                        <div class="filter-content" id="filter-content">
                            <!-- 필터 탭 네비게이션 -->
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

                            <!-- 위치 필터 패널 -->
                            <div class="filter-panel active" data-panel="location">
                                <div class="filter-group">
                                    <label class="filter-label">🌍 대륙</label>
                                    <div class="filter-checkboxes">
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="asia" id="continent-asia">
                                            <span class="checkmark"></span>
                                            아시아
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="europe" id="continent-europe">
                                            <span class="checkmark"></span>
                                            유럽
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="north-america" id="continent-north-america">
                                            <span class="checkmark"></span>
                                            북아메리카
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="south-america" id="continent-south-america">
                                            <span class="checkmark"></span>
                                            남아메리카
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="africa" id="continent-africa">
                                            <span class="checkmark"></span>
                                            아프리카
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="oceania" id="continent-oceania">
                                            <span class="checkmark"></span>
                                            오세아니아
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- 목적 필터 패널 -->
                            <div class="filter-panel" data-panel="purpose">
                                <div class="filter-group">
                                    <label class="filter-label">🎯 체류 목적</label>
                                    <div class="filter-checkboxes">
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="tourism" id="purpose-tourism">
                                            <span class="checkmark"></span>
                                            🏖️ 관광/여행
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="business" id="purpose-business">
                                            <span class="checkmark"></span>
                                            💼 업무/출장
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="family" id="purpose-family">
                                            <span class="checkmark"></span>
                                            👨‍👩‍👧‍👦 가족/지인 방문
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="study" id="purpose-study">
                                            <span class="checkmark"></span>
                                            📚 학업
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="work" id="purpose-work">
                                            <span class="checkmark"></span>
                                            💻 취업/근로
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="training" id="purpose-training">
                                            <span class="checkmark"></span>
                                            🎯 파견/연수
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="event" id="purpose-event">
                                            <span class="checkmark"></span>
                                            🎪 행사/컨퍼런스
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="volunteer" id="purpose-volunteer">
                                            <span class="checkmark"></span>
                                            🤝 봉사활동
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="medical" id="purpose-medical">
                                            <span class="checkmark"></span>
                                            🏥 의료
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="transit" id="purpose-transit">
                                            <span class="checkmark"></span>
                                            ✈️ 경유/환승
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="research" id="purpose-research">
                                            <span class="checkmark"></span>
                                            🔬 연구/학술
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="immigration" id="purpose-immigration">
                                            <span class="checkmark"></span>
                                            🏠 이주/정착
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="other" id="purpose-other">
                                            <span class="checkmark"></span>
                                            ❓ 기타
                                        </label>
                                    </div>
                                </div>

                                <div class="filter-group">
                                    <label class="filter-label">👥 동행 유형</label>
                                    <div class="filter-checkboxes">
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="alone" id="style-alone">
                                            <span class="checkmark"></span>
                                            👤 혼자
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="family" id="style-family">
                                            <span class="checkmark"></span>
                                            👨‍👩‍👧‍👦 가족과
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="couple" id="style-couple">
                                            <span class="checkmark"></span>
                                            💑 연인과
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="friends" id="style-friends">
                                            <span class="checkmark"></span>
                                            👥 친구와
                                        </label>
                                        <label class="checkbox-item">
                                            <input type="checkbox" value="colleagues" id="style-colleagues">
                                            <span class="checkmark"></span>
                                            👔 동료와
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- 기간 필터 패널 -->
                            <div class="filter-panel" data-panel="period">
                                <div class="filter-group">
                                    <label class="filter-label">📅 일정 기간</label>
                                    <div class="date-range-filter">
                                        <div class="date-input-group">
                                            <label class="date-label">시작일</label>
                                            <input type="date" class="date-input" id="start-date">
                                        </div>
                                        <div class="date-separator">~</div>
                                        <div class="date-input-group">
                                            <label class="date-label">종료일</label>
                                            <input type="date" class="date-input" id="end-date">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 평점 필터 패널 -->
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

                            <!-- 필터 액션 버튼 -->
                            <div class="filter-actions">
                                <button class="filter-reset-btn" id="filter-reset">필터 초기화</button>
                                <button class="filter-apply-btn" id="filter-apply">필터 적용</button>
                            </div>
                        </div>
                    </div>

                    <!-- 상태별 콘텐츠 섹션 -->
                    ${this.renderStateContent()}

                    <!-- 정렬 옵션 (검색 결과가 있을 때만 표시) -->
                    ${this.searchState === 'hasResults' ? this.renderSortSection() : ''}
                </div>
            `;
        } catch (error) {
            console.error('검색 탭 콘텐츠 렌더링 오류:', error);
            this.showErrorFallback(this.container);
        }
    }
    
    /**
     * 검색 상태에 따른 콘텐츠를 렌더링합니다
     */
    renderStateContent() {
        switch (this.searchState) {
            case 'initial':
                return `
                    <!-- 초기 상태: 검색 안내 -->
                    <div class="search-guide-section">
                        <div class="guide-content">
                            <div class="guide-icon">🔍</div>
                            <div class="guide-title">일정 검색을 시작해보세요</div>
                            <div class="guide-description">
                                검색어를 입력하거나 상세 필터를 설정하여<br>
                                원하는 일정 기록을 빠르게 찾을 수 있습니다.
                            </div>
                            <div class="guide-tips">
                                <div class="tip-item">
                                    <span class="tip-icon">💡</span>
                                    <span class="tip-text">국가명, 도시명으로 검색해보세요</span>
                                </div>
                                <div class="tip-item">
                                    <span class="tip-icon">💡</span>
                                    <span class="tip-text">여행 목적이나 동행 유형으로 필터링해보세요</span>
                                </div>
                                <div class="tip-item">
                                    <span class="tip-icon">💡</span>
                                    <span class="tip-text">기간과 별점으로 더 정확한 검색이 가능합니다</span>
                                </div>
                            </div>
                            ${this.allLogs.length > 0 ? 
                                `<div class="guide-stats">
                                    <span class="stats-text">📊 총 ${this.allLogs.length}개의 일정 기록이 저장되어 있습니다</span>
                                </div>` : 
                                `<div class="guide-stats">
                                    <span class="stats-text">📝 아직 저장된 일정이 없습니다. 새로운 일정을 추가해보세요!</span>
                                </div>`
                            }
                        </div>
                    </div>
                `;
                
            case 'searching':
                return `
                    <!-- 검색 중 상태 -->
                    <div class="search-loading-section">
                        <div class="loading-content">
                            <div class="loading-spinner"></div>
                            <div class="loading-text">검색 중입니다...</div>
                            <div class="loading-subtext">"${this.searchQuery}"에 대한 결과를 찾고 있습니다</div>
                        </div>
                    </div>
                `;
                
            case 'hasResults':
                return `
                    <!-- 검색 결과 있음 -->
                    <div class="search-results-section">
                        <div class="results-header">
                            <h3 class="results-title">📊 검색 결과</h3>
                            <div class="results-count">
                                <span class="count-number">${this.searchResults.length}</span>개의 일정 기록
                                ${this.searchQuery ? `("${this.searchQuery}" 검색)` : ''}
                            </div>
                        </div>
                        
                        <div class="results-content">
                            <div class="results-list">
                                ${this.renderSearchResults()}
                            </div>
                        </div>
                    </div>
                `;
                
            case 'noResults':
                return `
                    <!-- 검색 결과 없음 -->
                    <div class="search-results-section">
                        <div class="results-header">
                            <h3 class="results-title">📊 검색 결과</h3>
                            <div class="results-count">
                                <span class="count-number">0</span>개의 일정 기록
                                ${this.searchQuery ? `("${this.searchQuery}" 검색)` : ''}
                            </div>
                        </div>
                        
                        <div class="results-content">
                            <div class="no-results-placeholder">
                                <div class="no-results-icon">🔍</div>
                                <div class="no-results-title">검색 결과가 없습니다</div>
                                <div class="no-results-description">
                                    <strong>"${this.searchQuery}"</strong>에 대한 검색 결과를 찾을 수 없습니다.<br>
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
                
            default:
                return '';
        }
    }
    
    /**
     * 검색 결과 목록을 렌더링합니다
     */
    renderSearchResults() {
        if (!this.searchResults || this.searchResults.length === 0) {
            return '<div class="no-results">검색 결과가 없습니다.</div>';
        }
        
        return this.searchResults.map((result, index) => {
            const log = result.log;
            const matchedFields = result.matchedFields;
            
            return `
                <div class="search-result-item" data-index="${index}">
                    <div class="result-header">
                        <h4 class="result-title">
                            ${this.highlightText(log.country || '', this.searchQuery)}
                            ${log.city ? ` - ${this.highlightText(log.city, this.searchQuery)}` : ''}
                        </h4>
                        <div class="result-meta">
                            <span class="result-date">
                                ${log.startDate || log.date || ''}
                                ${log.endDate ? ` - ${log.endDate}` : ''}
                            </span>
                            <span class="result-purpose">
                                ${this.getPurposeDisplayName(log.purpose || '')}
                            </span>
                            <span class="result-style">
                                ${this.getTravelStyleDisplayName(log.travelStyle || '')}
                            </span>
                        </div>
                        <div class="result-score">
                            <span class="score-label">관련성:</span>
                            <span class="score-value">${Math.round(result.score * 10) / 10}</span>
                        </div>
                    </div>
                    <div class="result-description">
                        ${log.memo ? this.highlightText(log.memo, this.searchQuery) : '메모가 없습니다.'}
                    </div>
                    ${matchedFields.length > 0 ? `
                        <div class="result-matched-fields">
                            <div class="matched-label">매칭된 필드:</div>
                            <div class="matched-tags">
                                ${matchedFields.map(field => `
                                    <span class="matched-tag" data-field="${field.field}">
                                        ${this.getFieldDisplayName(field.field)}: 
                                        ${this.highlightText(field.value, this.searchQuery)}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
    
    /**
     * 필드명을 사용자 친화적인 이름으로 변환합니다
     */
    getFieldDisplayName(fieldName) {
        const fieldNames = {
            country: '국가',
            city: '도시',
            memo: '메모',
            purpose: '목적',
            travelStyle: '동행유형'
        };
        return fieldNames[fieldName] || fieldName;
    }

    /**
     * 목적 코드를 사용자 친화적인 이름으로 변환합니다
     */
    getPurposeDisplayName(purposeCode) {
        const purposeNames = {
            'tourism': '🏖️ 관광/여행',
            'business': '💼 업무/출장',
            'family': '👨‍👩‍👧‍👦 가족/지인 방문',
            'study': '📚 학업',
            'work': '💻 취업/근로',
            'training': '🎯 연수/교육'
        };
        return purposeNames[purposeCode] || purposeCode;
    }

    /**
     * 여행 스타일 코드를 사용자 친화적인 이름으로 변환합니다
     */
    getTravelStyleDisplayName(styleCode) {
        const styleNames = {
            'solo': '👤 혼자',
            'family': '👨‍👩‍👧‍👦 가족과',
            'couple': '💑 연인과',
            'friends': '👥 친구와',
            'group': '👥 단체',
            'alone': '👤 혼자', // 기존 데이터 호환성
            'colleagues': '👔 동료와' // 기존 데이터 호환성
        };
        return styleNames[styleCode] || styleCode;
    }
    
    /**
     * 정렬 옵션 섹션을 렌더링합니다
     */
    renderSortSection() {
        return `
            <div class="sort-section">
                <div class="sort-header">
                    <h3 class="sort-title">📋 정렬</h3>
                </div>
                <div class="sort-options">
                    <label class="sort-option">
                        <input type="radio" name="sort" value="relevance" id="sort-relevance" checked>
                        <span class="sort-text">관련성순</span>
                    </label>
                    <label class="sort-option">
                        <input type="radio" name="sort" value="date-desc" id="sort-date-desc">
                        <span class="sort-text">최신순</span>
                    </label>
                    <label class="sort-option">
                        <input type="radio" name="sort" value="date-asc" id="sort-date-asc">
                        <span class="sort-text">오래된순</span>
                    </label>
                    <label class="sort-option">
                        <input type="radio" name="sort" value="rating-desc" id="sort-rating-desc">
                        <span class="sort-text">별점순</span>
                    </label>
                    <label class="sort-option">
                        <input type="radio" name="sort" value="purpose-asc" id="sort-purpose-asc">
                        <span class="sort-text">목적순</span>
                    </label>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        try {
            // 검색 입력 이벤트
            this.searchInput = document.getElementById('search-input');
            if (this.searchInput) {
                this.addEventListener(this.searchInput, 'input', this.handleSearchInput.bind(this));
                this.addEventListener(this.searchInput, 'keypress', this.handleSearchKeypress.bind(this));
            }

            // 검색 버튼 이벤트
            const searchBtn = document.getElementById('search-btn');
            if (searchBtn) {
                this.addEventListener(searchBtn, 'click', this.handleSearch.bind(this));
            }

            // 필터 토글 이벤트
            const filterToggle = document.getElementById('filter-toggle');
            if (filterToggle) {
                this.addEventListener(filterToggle, 'click', this.toggleFilters.bind(this));
            }

            // 필터 탭 전환 이벤트
            const filterTabs = document.querySelectorAll('.filter-tab');
            filterTabs.forEach(tab => {
                this.addEventListener(tab, 'click', this.switchFilterTab.bind(this));
            });

            // 별점 선택 이벤트
            this.bindSearchStarRating();

            // 필터 적용 이벤트
            const filterApply = document.getElementById('filter-apply');
            if (filterApply) {
                this.addEventListener(filterApply, 'click', this.applyFilters.bind(this));
            }

            // 필터 초기화 이벤트
            const filterReset = document.getElementById('filter-reset');
            if (filterReset) {
                this.addEventListener(filterReset, 'click', this.resetFilters.bind(this));
            }

            // 정렬 옵션 이벤트 (검색 결과가 있을 때만)
            if (this.searchState === 'hasResults') {
                const sortOptions = document.querySelectorAll('input[name="sort"]');
                sortOptions.forEach(option => {
                    this.addEventListener(option, 'change', this.handleSortChange.bind(this));
                });
            }

            // 재검색 버튼 이벤트 (결과 없음 상태일 때)
            if (this.searchState === 'noResults') {
                const retryBtn = document.getElementById('retry-search');
                if (retryBtn) {
                    this.addEventListener(retryBtn, 'click', this.handleRetrySearch.bind(this));
                }
            }
        } catch (error) {
            console.error('검색 탭 이벤트 바인딩 오류:', error);
        }
    }

    addEventListener(element, event, handler) {
        try {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        } catch (error) {
            console.error('이벤트 리스너 등록 오류:', error);
        }
    }

    handleSearchInput(event) {
        try {
            this.searchQuery = event.target.value;
            
            // 검색어가 비어있으면 초기 상태로 복귀
            if (!this.searchQuery.trim()) {
                this.updateSearchState('initial');
                return;
            }

            // 디바운싱 적용 (300ms)
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }

            this.searchTimeout = setTimeout(() => {
                this.performSearch(this.searchQuery);
            }, 300);
            
        } catch (error) {
            console.error('검색 입력 처리 오류:', error);
            this.showToast('검색 처리 중 오류가 발생했습니다.');
        }
    }

    handleSearchKeypress(event) {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    }

    handleSearch() {
        try {
            const query = this.searchQuery.trim();
            
            if (!query) {
                this.showToast('검색어를 입력해주세요.');
                return;
            }

            // 검색 실행
            this.performSearch(query);
            
        } catch (error) {
            console.error('검색 실행 오류:', error);
            this.showToast('검색 실행 중 오류가 발생했습니다.');
            this.updateSearchState('initial');
        }
    }

    /**
     * 실제 검색을 수행합니다
     */
    async performSearch(query) {
        try {
            // 검색 중 상태로 변경
            this.updateSearchState('searching');
            this.isSearching = true;
            
            // 검색어 유효성 검사
            const validation = SearchUtility.validateQuery(query);
            if (!validation.isValid) {
                this.showToast(validation.error);
                this.updateSearchState('initial');
                return;
            }

            // 동일한 검색어로 재검색 방지
            if (this.lastSearchQuery === query && this.searchResults.length > 0) {
                this.updateSearchState('hasResults');
                return;
            }

            // 검색 수행
            const searchResults = SearchUtility.performSearch(this.allLogs, query);
            
            // 검색 결과 처리
            if (searchResults.length > 0) {
                this.searchResults = searchResults;
                this.lastSearchQuery = query;
                this.updateSearchState('hasResults', { results: searchResults });
                
                // 검색 통계 로깅
                const stats = SearchUtility.calculateSearchStats(searchResults, query);
                console.log('검색 완료:', stats);
                
            } else {
                this.searchResults = [];
                this.lastSearchQuery = query;
                this.updateSearchState('noResults', { results: [] });
            }
            
        } catch (error) {
            console.error('검색 수행 오류:', error);
            this.showToast('검색 중 오류가 발생했습니다.');
            this.updateSearchState('initial');
        } finally {
            this.isSearching = false;
        }
    }

    /**
     * 텍스트를 하이라이팅합니다
     */
    highlightText(text, query) {
        if (!text || !query) return text;
        return SearchUtility.highlightText(text, query);
    }

    /**
     * 재검색 처리
     */
    handleRetrySearch() {
        try {
            // 검색어 초기화하고 초기 상태로 복귀
            this.searchQuery = '';
            this.updateSearchState('initial');
            
            // 검색 입력 필드 포커스
            if (this.searchInput) {
                this.searchInput.focus();
            }
            
        } catch (error) {
            console.error('재검색 처리 오류:', error);
        }
    }

    toggleFilters() {
        try {
            const filterContent = document.getElementById('filter-content');
            const toggleBtn = document.getElementById('filter-toggle');
            const toggleIcon = toggleBtn.querySelector('.toggle-icon');
            const toggleText = toggleBtn.querySelector('.toggle-text');

            if (filterContent.classList.contains('expanded')) {
                filterContent.classList.remove('expanded');
                toggleIcon.textContent = '▼';
                toggleText.textContent = '필터 펼치기';
            } else {
                filterContent.classList.add('expanded');
                toggleIcon.textContent = '▲';
                toggleText.textContent = '필터 접기';
            }
        } catch (error) {
            console.error('필터 토글 오류:', error);
            this.showToast('필터 토글 중 오류가 발생했습니다.');
        }
    }

    /**
     * 필터 탭을 전환합니다
     */
    switchFilterTab(event) {
        try {
            const clickedTab = event.currentTarget;
            const targetTab = clickedTab.dataset.tab;
            
            // 모든 탭 비활성화
            const allTabs = document.querySelectorAll('.filter-tab');
            allTabs.forEach(tab => tab.classList.remove('active'));
            
            // 모든 패널 숨기기
            const allPanels = document.querySelectorAll('.filter-panel');
            allPanels.forEach(panel => panel.classList.remove('active'));
            
            // 클릭된 탭 활성화
            clickedTab.classList.add('active');
            
            // 해당 패널 표시
            const targetPanel = document.querySelector(`[data-panel="${targetTab}"]`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        } catch (error) {
            console.error('필터 탭 전환 오류:', error);
            this.showToast('필터 탭 전환 중 오류가 발생했습니다.');
        }
    }

    /**
     * 검색 탭의 별점 컴포넌트 이벤트를 바인딩합니다
     */
    bindSearchStarRating() {
        try {
            const starRating = document.getElementById('search-star-rating');
            if (!starRating) return;
            
            const stars = starRating.querySelectorAll('.star');
            
            /** @type {number} 현재 선택된 별점 */
            let currentRating = 0;
            /** @type {number} 호버 중인 별점 */
            let hoverRating = 0;
            
            // 별 클릭 이벤트
            stars.forEach((star, index) => {
                this.addEventListener(star, 'click', () => {
                    const value = index + 1;
                    
                    // 이미 선택된 별을 다시 클릭하면 선택 해제
                    if (currentRating === value) {
                        currentRating = 0;
                        this.filters.rating = null;
                        this.showToast('별점 선택이 해제되었습니다.');
                    } else {
                        currentRating = value;
                        this.filters.rating = value;
                        this.showToast(`${value}점이 선택되었습니다.`);
                    }
                    
                    this.updateSearchStarDisplay();
                });
                
                // 호버 이벤트 (데스크탑)
                this.addEventListener(star, 'mouseenter', () => {
                    hoverRating = index + 1;
                    this.updateSearchStarDisplay();
                });
                
                this.addEventListener(star, 'mouseleave', () => {
                    hoverRating = 0;
                    this.updateSearchStarDisplay();
                });
            });
            
            // 별점 표시 업데이트
            this.updateSearchStarDisplay = () => {
                const displayRating = hoverRating || currentRating;
                stars.forEach((star, index) => {
                    if (index < displayRating) {
                        star.classList.add('filled');
                    } else {
                        star.classList.remove('filled');
                    }
                });
            };
        } catch (error) {
            console.error('검색 별점 바인딩 오류:', error);
        }
    }

    applyFilters() {
        try {
            // 필터 적용 (준비 중)
            this.showToast('필터 기능 준비 중입니다.');
        } catch (error) {
            console.error('필터 적용 오류:', error);
            this.showToast('필터 적용 중 오류가 발생했습니다.');
        }
    }

    resetFilters() {
        try {
            // 필터 초기화
            this.filters = {
                continent: [],
                purpose: '',
                memo: '',
                travelStyle: '',
                rating: '',
                dateRange: {
                    start: '',
                    end: ''
                }
            };

            // UI 초기화
            // 대륙 체크박스 초기화
            const continentCheckboxes = document.querySelectorAll('input[id^="continent-"]');
            continentCheckboxes.forEach(checkbox => checkbox.checked = false);
            
            // 체류 목적 체크박스 초기화
            const purposeCheckboxes = document.querySelectorAll('input[id^="purpose-"]');
            purposeCheckboxes.forEach(checkbox => checkbox.checked = false);
            
            // 동행 유형 체크박스 초기화
            const styleCheckboxes = document.querySelectorAll('input[id^="style-"]');
            styleCheckboxes.forEach(checkbox => checkbox.checked = false);
            
            // 별점 선택 초기화
            const allStars = document.querySelectorAll('#search-star-rating .star');
            allStars.forEach(star => star.classList.remove('filled'));
            
            // 날짜 초기화
            const startDate = document.getElementById('start-date');
            const endDate = document.getElementById('end-date');
            if (startDate) startDate.value = '';
            if (endDate) endDate.value = '';

            this.showToast('필터가 초기화되었습니다.');
        } catch (error) {
            console.error('필터 초기화 오류:', error);
            this.showToast('필터 초기화 중 오류가 발생했습니다.');
        }
    }

    handleSortChange() {
        try {
            const selectedSort = document.querySelector('input[name="sort"]:checked');
            if (!selectedSort || !this.searchResults.length) return;

            const sortType = selectedSort.value;
            let sortedResults = [...this.searchResults];

            switch (sortType) {
                case 'relevance':
                    // 관련성순 (기본값, 이미 정렬됨)
                    break;
                case 'date-desc':
                    sortedResults.sort((a, b) => {
                        const dateA = new Date(a.log.startDate || a.log.date || 0);
                        const dateB = new Date(b.log.startDate || b.log.date || 0);
                        return dateB - dateA;
                    });
                    break;
                case 'date-asc':
                    sortedResults.sort((a, b) => {
                        const dateA = new Date(a.log.startDate || a.log.date || 0);
                        const dateB = new Date(b.log.startDate || b.log.date || 0);
                        return dateA - dateB;
                    });
                    break;
                case 'rating-desc':
                    sortedResults.sort((a, b) => (b.log.rating || 0) - (a.log.rating || 0));
                    break;
                case 'purpose-asc':
                    sortedResults.sort((a, b) => {
                        const purposeA = (a.log.purpose || '').toLowerCase();
                        const purposeB = (b.log.purpose || '').toLowerCase();
                        return purposeA.localeCompare(purposeB);
                    });
                    break;
            }

            this.searchResults = sortedResults;
            this.renderContent();
            this.bindEvents();
            
            this.showToast(`${this.getSortDisplayName(sortType)}으로 정렬되었습니다.`);
            
        } catch (error) {
            console.error('정렬 변경 오류:', error);
            this.showToast('정렬 변경 중 오류가 발생했습니다.');
        }
    }

    /**
     * 정렬 타입을 사용자 친화적인 이름으로 변환합니다
     */
    getSortDisplayName(sortType) {
        const sortNames = {
            'relevance': '관련성',
            'date-desc': '최신순',
            'date-asc': '오래된순',
            'rating-desc': '별점순',
            'purpose-asc': '목적순'
        };
        return sortNames[sortType] || sortType;
    }

    showToast(message) {
        try {
            // 토스트 메시지 표시
            const toast = document.createElement('div');
            toast.className = 'toast-message';
            toast.textContent = message;
            
            document.body.appendChild(toast);
            
            // 애니메이션 효과
            setTimeout(() => toast.classList.add('show'), 100);
            
            // 자동 제거
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        } catch (error) {
            console.error('토스트 메시지 표시 오류:', error);
            // 폴백: 간단한 alert 사용
            alert(message);
        }
    }
    
    async cleanup() {
        try {
        // 이벤트 리스너 정리
        this.eventListeners.forEach(listener => {
            if (listener.element && listener.event && listener.handler) {
                listener.element.removeEventListener(listener.event, listener.handler);
            }
        });
        
        this.eventListeners = [];
        this.isInitialized = false;
        this.searchInput = null;
        
        // 검색 관련 정리
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
        
        // 메모리 정리
        this.container = null;
        } catch (error) {
            console.error('검색 탭 정리 오류:', error);
        }
    }
}

export default new SearchTab();
