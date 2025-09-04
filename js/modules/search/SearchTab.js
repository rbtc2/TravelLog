/**
 * 검색 탭 메인 컨트롤러
 * 리팩토링된 모듈들을 조합하여 검색 기능을 제공
 */

import { SearchEngine } from './engines/SearchEngine.js';
import { SearchStateManager } from './managers/SearchStateManager.js';
import { FilterManager } from './managers/FilterManager.js';
import { SearchResultManager } from './managers/SearchResultManager.js';
import { SearchUIRenderer } from './renderers/SearchUIRenderer.js';
import { SearchEventHandler } from './handlers/SearchEventHandler.js';
import { StorageManager } from '../utils/storage-manager.js';
import LogDetailModule from '../log-detail.js';

export class SearchTab {
    constructor() {
        this.isInitialized = false;
        this.container = null;
        
        // 모듈 인스턴스들
        this.searchEngine = new SearchEngine();
        this.stateManager = new SearchStateManager();
        this.filterManager = new FilterManager();
        this.resultManager = new SearchResultManager();
        this.uiRenderer = new SearchUIRenderer();
        this.eventHandler = new SearchEventHandler();
        this.storageManager = new StorageManager();
        
        // 디바운스 관련
        this.searchTimeout = null;
        this.debounceDelay = 300; // 300ms 디바운스
        
        // 검색 모드 상태 (검색창 클릭 후 상태)
        this.isSearchMode = false;
        
        // 콜백 함수들을 바인딩
        this.bindCallbacks();
    }

    /**
     * 콜백 함수들을 바인딩합니다
     */
    bindCallbacks() {
        this.callbacks = {
            // 검색 관련 콜백
            handleSearchInput: this.handleSearchInput.bind(this),
            handleSearchKeypress: this.handleSearchKeypress.bind(this),
            handleSearchFocus: this.handleSearchFocus.bind(this),
            handleSearchBlur: this.handleSearchBlur.bind(this),
            handleSearch: this.handleSearch.bind(this),
            handleRetrySearch: this.handleRetrySearch.bind(this),
            
            // 필터 관련 콜백
            toggleFilters: this.toggleFilters.bind(this),
            switchFilterTab: this.switchFilterTab.bind(this),
            handleStarRatingChange: this.handleStarRatingChange.bind(this),
            applyFilters: this.applyFilters.bind(this),
            resetFilters: this.resetFilters.bind(this),
            
            // 정렬 관련 콜백
            handleSortChange: this.handleSortChange.bind(this),
            
            // 결과 관련 콜백
            handleResultItemClick: this.handleResultItemClick.bind(this),
            
            // 상세 화면 관련 콜백
            handleBackFromDetail: this.handleBackFromDetail.bind(this),
            handleLogEdit: this.handleLogEdit.bind(this),
            handleLogDelete: this.handleLogDelete.bind(this)
        };
    }

    /**
     * 검색 탭을 렌더링합니다
     * @param {HTMLElement} container - 컨테이너 요소
     */
    async render(container) {
        try {
            console.log('🎨 검색 탭 render 시작');
            
            this.container = container;
            this.uiRenderer.setContainer(container);
            
            // 검색 모드 리셋
            this.isSearchMode = false;
            
            // SearchEngine 초기화
            await this.searchEngine.initialize();
            
            this.loadAllLogs();
            this.validateState();
            this.renderUI();
            this.bindEvents();
            
            this.isInitialized = true;
            console.log(`✅ 검색 탭 render 완료 - 상태: ${this.stateManager.getState()}`);
            
        } catch (error) {
            console.error('검색 탭 렌더링 오류:', error);
            this.showErrorFallback(container);
        }
    }

    /**
     * 탭이 활성화될 때 데이터를 새로고침합니다
     */
    refresh() {
        if (this.isInitialized) {
            try {
                this.loadAllLogs();
                this.handleRefresh();
            } catch (error) {
                console.error('검색 탭 새로고침 오류:', error);
                this.showErrorFallback(this.container);
            }
        }
    }

    /**
     * 새로고침 처리를 수행합니다
     */
    handleRefresh() {
        const currentState = this.stateManager.getState();
        
        if (this.stateManager.isDetailMode()) {
            const logId = this.stateManager.getCurrentDetailLogId();
            if (logId) {
                this.showLogDetail(logId);
            } else {
                this.stateManager.updateState('initial');
                this.renderUI();
                this.bindEvents();
            }
        } else if (this.stateManager.hasResults()) {
            const query = this.stateManager.getQuery();
            if (query) {
                this.performSearch(query, { showValidationError: false });
            } else {
                this.renderUI();
                this.bindEvents();
            }
        } else if (this.stateManager.hasNoResults()) {
            const query = this.stateManager.getQuery();
            if (query) {
                this.performSearch(query, { showValidationError: false });
            } else {
                this.renderUI();
                this.bindEvents();
            }
        } else {
            this.renderUI();
            this.bindEvents();
        }
    }

    /**
     * 모든 로그 데이터를 로드합니다
     */
    loadAllLogs() {
        try {
            const allLogs = this.storageManager.loadLogs();
            this.stateManager.setAllLogs(allLogs);
            console.log(`검색 탭: ${allLogs.length}개의 로그 데이터 로드됨`);
        } catch (error) {
            console.error('로그 데이터 로드 실패:', error);
            this.stateManager.setAllLogs([]);
            this.showToast('로그 데이터를 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * 상태를 검증하고 필요시 수정합니다
     */
    validateState() {
        if (this.stateManager.isDetailMode()) {
            const logId = this.stateManager.getCurrentDetailLogId();
            const allLogs = this.stateManager.getAllLogs();
            
            if (!logId || !allLogs || allLogs.length === 0) {
                console.log('⚠️ detail 상태이지만 필요한 데이터가 없음 - initial 상태로 변경');
                this.stateManager.updateState('initial');
            }
        }
    }

    /**
     * UI를 렌더링합니다
     */
    renderUI() {
        const state = {
            searchState: this.stateManager.getState(),
            searchQuery: this.stateManager.getQuery(),
            searchResults: this.resultManager.getResults(),
            allLogs: this.stateManager.getAllLogs(),
            currentSortType: this.resultManager.getCurrentSortType()
        };
        
        this.uiRenderer.renderMainUI(state);
    }

    /**
     * 이벤트들을 바인딩합니다
     */
    bindEvents() {
        // 검색 입력 이벤트를 직접 바인딩
        this.bindSearchInputEvents();
        
        // 나머지 이벤트들을 바인딩
        this.eventHandler.bindSearchEvents(this.callbacks);
        this.eventHandler.bindStateEvents(this.callbacks, this.stateManager.getState());
        
        if (this.stateManager.isDetailMode()) {
            this.eventHandler.bindDetailEvents(this.callbacks);
        }
    }

    /**
     * 검색 입력 이벤트를 직접 바인딩합니다
     */
    bindSearchInputEvents() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            // 기존 이벤트 리스너 제거
            searchInput.removeEventListener('input', this.searchInputHandler);
            searchInput.removeEventListener('keypress', this.searchKeypressHandler);
            searchInput.removeEventListener('focus', this.searchFocusHandler);
            searchInput.removeEventListener('blur', this.searchBlurHandler);
            
            // 새로운 핸들러 함수들 생성
            this.searchInputHandler = (event) => {
                this.handleSearchInput(event.target.value);
            };
            this.searchKeypressHandler = (event) => {
                this.handleSearchKeypress(event);
            };
            this.searchFocusHandler = (event) => {
                this.handleSearchFocus(event);
            };
            this.searchBlurHandler = (event) => {
                this.handleSearchBlur(event);
            };
            
            // 이벤트 리스너 추가
            searchInput.addEventListener('input', this.searchInputHandler);
            searchInput.addEventListener('keypress', this.searchKeypressHandler);
            searchInput.addEventListener('focus', this.searchFocusHandler);
            searchInput.addEventListener('blur', this.searchBlurHandler);
        }
    }

    /**
     * 검색을 수행합니다
     * @param {string} query - 검색어
     * @param {Object} options - 검색 옵션
     */
    async performSearch(query, options = {}) {
        try {
            const { showValidationError = true } = options;
            
            // SearchEngine이 초기화되지 않았다면 초기화
            if (!this.searchEngine.isInitialized) {
                await this.searchEngine.initialize();
            }
            
            // 검색 중 상태로 변경
            this.stateManager.updateState('searching', { query });
            this.stateManager.setSearching(true);
            this.renderUI();
            this.bindEvents();

            // 동일한 검색어로 재검색 방지
            if (this.stateManager.getLastSearchQuery() === query && this.resultManager.hasResults()) {
                this.stateManager.updateState('hasResults');
                this.renderUI();
                this.bindEvents();
                return;
            }

            // 검색 수행
            const allLogs = this.stateManager.getAllLogs();
            const searchResult = await this.searchEngine.performSearch(allLogs, query, options);
            
            if (searchResult.error) {
                if (showValidationError) {
                    this.showToast(searchResult.error);
                }
                this.stateManager.updateState('initial');
                this.renderUI();
                this.bindEvents();
                return;
            }

            // 검색 결과 처리
            if (searchResult.results && searchResult.results.length > 0) {
                this.resultManager.setResults(searchResult.results);
                this.stateManager.setLastSearchQuery(query);
                this.stateManager.updateState('hasResults', { 
                    query, 
                    results: searchResult.results 
                });
                
                // 검색 통계 로깅
                if (searchResult.stats) {
                    console.log('검색 완료:', searchResult.stats);
                }
            } else {
                this.resultManager.setResults([]);
                this.stateManager.setLastSearchQuery(query);
                this.stateManager.updateState('noResults', { 
                    query, 
                    results: [] 
                });
            }
            
            this.renderUI();
            this.bindEvents();
            
        } catch (error) {
            console.error('검색 수행 오류:', error);
            this.showToast('검색 중 오류가 발생했습니다.');
            this.stateManager.updateState('initial');
            this.renderUI();
            this.bindEvents();
        } finally {
            this.stateManager.setSearching(false);
        }
    }

    /**
     * 로그 상세 화면을 표시합니다
     * @param {string} logId - 로그 ID
     */
    async showLogDetail(logId) {
        try {
            console.log(`📋 상세 화면 표시 시작 - logId: ${logId}`);
            
            const allLogs = this.stateManager.getAllLogs();
            const logData = allLogs.find(log => log.id === logId);
            
            if (!logData) {
                throw new Error(`ID가 ${logId}인 일정을 찾을 수 없습니다.`);
            }

            // 상세 화면 상태로 변경
            this.stateManager.enterDetailMode(logId);
            this.renderUI();

            // LogDetailModule 렌더링
            const detailContainer = document.getElementById('log-detail-container');
            if (!detailContainer) {
                throw new Error('상세 화면 컨테이너를 찾을 수 없습니다.');
            }

            const logDetailModule = new LogDetailModule();
            logDetailModule.render(detailContainer, logData);

            // 상세 화면 이벤트 바인딩
            this.eventHandler.bindDetailEvents(this.callbacks);

            console.log('✅ 상세 화면 표시 완료');

        } catch (error) {
            console.error('로그 상세 화면 표시 오류:', error);
            this.showToast('일정 상세 정보를 불러오는 중 오류가 발생했습니다.');
            this.stateManager.updateState('initial');
            this.renderUI();
            this.bindEvents();
        }
    }

    // 이벤트 핸들러 메서드들
    handleSearchInput(query) {
        const safeQuery = query || '';
        
        // 검색어만 업데이트하고 상태 변경은 하지 않음
        this.stateManager.setQuery(safeQuery);
        
        // 기존 타이머 클리어
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // 검색 모드가 아닌 경우 (검색창을 아직 클릭하지 않은 경우)
        if (!this.isSearchMode) {
            // 검색어가 비어있으면 초기 상태 유지
            if (!safeQuery.trim()) {
                this.stateManager.updateState('initial', { query: safeQuery });
                this.renderUI();
                this.bindEvents();
                return;
            }
            // 검색어가 있으면 검색 모드로 전환하지만 검색은 실행하지 않음
            this.isSearchMode = true;
            this.stateManager.updateState('initial', { query: safeQuery });
            this.renderUI();
            this.bindEvents();
            return;
        }
        
        // 검색 모드인 경우 - 검색어만 업데이트하고 상태는 변경하지 않음
        // 검색어가 비어있어도 검색 모드 유지 (UI 재렌더링 없이 쿼리만 업데이트)
        // UI를 다시 렌더링하지 않음 - 검색 모드 유지
    }

    handleSearchKeypress(event) {
        if (event.key === 'Enter') {
            // 검색 모드로 전환하고 검색 실행
            this.isSearchMode = true;
            this.handleSearch();
        }
    }

    handleSearchFocus(event) {
        // 검색창 포커스 시 검색 모드로 전환
        this.isSearchMode = true;
        this.eventHandler.handleSearchFocus(event);
    }

    handleSearchBlur(event) {
        this.eventHandler.handleSearchBlur(event);
    }

    handleSearch() {
        // 타이머 클리어 (즉시 검색 실행)
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
        
        const query = this.stateManager.getQuery();
        if (!query || typeof query !== 'string' || !query.trim()) {
            this.showToast('검색어를 입력해주세요.');
            return;
        }
        
        // 검색 모드로 전환하고 검색 실행
        this.isSearchMode = true;
        this.performSearch(query.trim(), { showValidationError: true });
    }

    handleRetrySearch() {
        // 재검색 시에도 검색 모드 유지
        this.stateManager.updateState('searching', { query: this.stateManager.getQuery() });
        this.renderUI();
        this.bindEvents();
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    handleResultItemClick(event) {
        try {
            const logId = event.currentTarget.dataset.logId;
            if (!logId) {
                console.error('로그 ID가 없습니다.');
                this.showToast('일정 정보를 불러올 수 없습니다.');
                return;
            }
            this.showLogDetail(logId);
        } catch (error) {
            console.error('검색 결과 클릭 처리 오류:', error);
            this.showToast('일정 상세 정보를 불러오는 중 오류가 발생했습니다.');
        }
    }

    handleBackFromDetail() {
        this.stateManager.exitDetailMode();
        this.renderUI();
        this.bindEvents();
    }

    handleLogEdit(event) {
        try {
            const logId = event.currentTarget.dataset.logId || event.target.dataset.logId;
            if (!logId) {
                console.error('로그 ID가 없습니다.');
                return;
            }
            // LogDetailModule의 편집 기능 사용
            this.refresh();
        } catch (error) {
            console.error('로그 편집 처리 오류:', error);
        }
    }

    handleLogDelete(event) {
        try {
            const logId = event.currentTarget.dataset.logId || event.target.dataset.logId;
            if (!logId) {
                console.error('로그 ID가 없습니다.');
                return;
            }
            
            // 검색 결과에서 제거
            this.resultManager.removeResult(logId);
            
            // 상태 업데이트
            if (this.resultManager.hasResults()) {
                this.stateManager.updateState('hasResults');
            } else {
                this.stateManager.updateState('noResults');
            }
            
            this.renderUI();
            this.bindEvents();
            this.showToast('일정이 삭제되었습니다.');
        } catch (error) {
            console.error('로그 삭제 처리 오류:', error);
        }
    }

    toggleFilters() {
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
    }

    switchFilterTab(targetTab) {
        // 모든 탭 비활성화
        const allTabs = document.querySelectorAll('.filter-tab');
        allTabs.forEach(tab => tab.classList.remove('active'));
        
        // 모든 패널 숨기기
        const allPanels = document.querySelectorAll('.filter-panel');
        allPanels.forEach(panel => panel.classList.remove('active'));
        
        // 클릭된 탭 활성화
        const clickedTab = document.querySelector(`[data-tab="${targetTab}"]`);
        if (clickedTab) {
            clickedTab.classList.add('active');
        }
        
        // 해당 패널 표시
        const targetPanel = document.querySelector(`[data-panel="${targetTab}"]`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }

    handleStarRatingChange(rating) {
        this.filterManager.setRatingFilter(rating);
        if (rating > 0) {
            this.showToast(`${rating}점이 선택되었습니다.`);
        } else {
            this.showToast('별점 선택이 해제되었습니다.');
        }
    }

    applyFilters() {
        // 필터를 UI에서 읽어와서 적용
        if (this.container) {
            this.filterManager.loadFiltersFromUI(this.container);
        }
        
        // 필터링된 결과로 검색 재실행
        const query = this.stateManager.getQuery();
        if (query) {
            this.performSearch(query, { showValidationError: false });
        }
        
        this.showToast('필터가 적용되었습니다.');
    }

    resetFilters() {
        this.filterManager.resetFilters();
        
        // UI 초기화
        if (this.container) {
            this.filterManager.applyFiltersToUI(this.container);
        }
        
        this.showToast('필터가 초기화되었습니다.');
    }

    handleSortChange(sortType) {
        const sortedResults = this.resultManager.sortResults(sortType);
        this.stateManager.updateState('hasResults', { results: sortedResults });
        this.renderUI();
        this.bindEvents();
        
        const displayName = this.resultManager.getSortDisplayName(sortType);
        this.showToast(`${displayName}으로 정렬되었습니다.`);
    }

    showToast(message) {
        try {
            const toast = document.createElement('div');
            toast.className = 'toast-message';
            toast.textContent = message;
            
            document.body.appendChild(toast);
            
            setTimeout(() => toast.classList.add('show'), 100);
            
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
            alert(message);
        }
    }

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

    async cleanup() {
        try {
            console.log('🔧 검색 탭 cleanup 시작');
            
            // 타이머 정리
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = null;
            }
            
            this.eventHandler.cleanup();
            this.stateManager.reset();
            this.resultManager.clearResults();
            this.filterManager.resetFilters();
            
            // 검색 모드 리셋
            this.isSearchMode = false;
            
            this.isInitialized = false;
            this.container = null;
            
            console.log('✅ 검색 탭 cleanup 완료');
        } catch (error) {
            console.error('검색 탭 정리 오류:', error);
        }
    }
}

export default new SearchTab();
