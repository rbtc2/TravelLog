/**
 * 검색 탭 모듈
 * 독립적으로 동작하며, 다른 탭에 영향을 주지 않음
 */

class SearchTab {
    constructor() {
        this.isInitialized = false;
        this.eventListeners = [];
        this.searchInput = null;
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
        this.renderContent();
        this.bindEvents();
        this.isInitialized = true;
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
    
    renderContent() {
        try {
        this.container.innerHTML = `
                <div class="search-container">
                    <!-- 검색 헤더 -->
                    <div class="search-header">
                        <h1 class="search-title">🔍 여행 검색</h1>
                        <p class="search-subtitle">나의 여행 기록을 빠르게 찾아보세요</p>
                    </div>

                    <!-- 검색바 -->
                    <div class="search-bar-container">
                        <div class="search-input-wrapper">
                            <span class="search-icon">🔍</span>
                            <input 
                                type="text" 
                                class="search-input" 
                                placeholder="국가, 도시, 여행지, 메모, 태그 등을 검색하세요..."
                                id="search-input"
                            >
                            <button class="search-btn" id="search-btn">검색</button>
                        </div>
                        <div class="search-hint">
                            💡 국가나 도시를 직접 검색창에 입력하여 찾을 수 있습니다
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
                            <!-- 대륙별 필터 -->
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

                            <!-- 여행 목적 필터 -->
                            <div class="filter-group">
                                <label class="filter-label">🎯 여행 목적</label>
                                <div class="filter-checkboxes">
                                    <label class="checkbox-item">
                                        <input type="checkbox" value="leisure" id="purpose-leisure">
                                        <span class="checkmark"></span>
                                        휴양/휴식
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" value="culture" id="purpose-culture">
                                        <span class="checkmark"></span>
                                        문화/역사
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" value="food" id="purpose-food">
                                        <span class="checkmark"></span>
                                        음식/맛집
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" value="shopping" id="purpose-shopping">
                                        <span class="checkmark"></span>
                                        쇼핑
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" value="nature" id="purpose-nature">
                                        <span class="checkmark"></span>
                                        자연/풍경
                                    </label>
                                </div>
                            </div>

                            <!-- 여행 스타일 필터 -->
                            <div class="filter-group">
                                <label class="filter-label">👥 동행 유형</label>
                                <div class="filter-checkboxes">
                                    <label class="checkbox-item">
                                        <input type="checkbox" value="solo" id="style-solo">
                                        <span class="checkmark"></span>
                                        혼자
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" value="couple" id="style-couple">
                                        <span class="checkmark"></span>
                                        커플
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" value="family" id="style-family">
                                        <span class="checkmark"></span>
                                        가족
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" value="friends" id="style-friends">
                                        <span class="checkmark"></span>
                                        친구
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" value="business" id="style-business">
                                        <span class="checkmark"></span>
                                        출장
                                    </label>
                                </div>
                            </div>

                            <!-- 별점 필터 -->
                            <div class="filter-group">
                                <label class="filter-label">⭐ 별점</label>
                                <div class="rating-filter">
                                    <div class="rating-options">
                                        <label class="rating-option">
                                            <input type="radio" name="rating" value="5" id="rating-5">
                                            <span class="rating-stars">★★★★★</span>
                                            <span class="rating-text">5점</span>
                                        </label>
                                        <label class="rating-option">
                                            <input type="radio" name="rating" value="4" id="rating-4">
                                            <span class="rating-stars">★★★★☆</span>
                                            <span class="rating-text">4점 이상</span>
                                        </label>
                                        <label class="rating-option">
                                            <input type="radio" name="rating" value="3" id="rating-3">
                                            <span class="rating-stars">★★★☆☆</span>
                                            <span class="rating-text">3점 이상</span>
                                        </label>
                                        <label class="rating-option">
                                            <input type="radio" name="rating" value="0" id="rating-all">
                                            <span class="rating-text">전체</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- 날짜 범위 필터 -->
                            <div class="filter-group">
                                <label class="filter-label">📅 여행 기간</label>
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

                            <!-- 필터 액션 버튼 -->
                            <div class="filter-actions">
                                <button class="filter-reset-btn" id="filter-reset">필터 초기화</button>
                                <button class="filter-apply-btn" id="filter-apply">필터 적용</button>
                            </div>
                        </div>
                    </div>

                    <!-- 검색 결과 섹션 -->
                    <div class="search-results-section">
                        <div class="results-header">
                            <h3 class="results-title">📊 검색 결과</h3>
                            <div class="results-count">
                                <span class="count-number">0</span>개의 여행 기록
                            </div>
                        </div>
                        
                        <div class="results-content">
                            <div class="no-results-placeholder">
                                <div class="no-results-icon">🔍</div>
                                <div class="no-results-title">검색 결과가 없습니다</div>
                                <div class="no-results-description">
                                    검색어나 필터를 변경해보세요.<br>
                                    또는 새로운 여행 기록을 추가해보세요.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 정렬 옵션 -->
                    <div class="sort-section">
                        <div class="sort-header">
                            <h3 class="sort-title">📋 정렬</h3>
                        </div>
                        <div class="sort-options">
                            <label class="sort-option">
                                <input type="radio" name="sort" value="date-desc" id="sort-date-desc" checked>
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
                                <input type="radio" name="sort" value="title-asc" id="sort-title-asc">
                                <span class="sort-text">제목순</span>
                            </label>
                </div>
                </div>
            </div>
        `;
        } catch (error) {
            console.error('검색 탭 콘텐츠 렌더링 오류:', error);
            this.showErrorFallback(this.container);
        }
    }
    
    bindEvents() {
        try {
            // 검색 입력 이벤트
            this.searchInput = document.getElementById('search-input');
            if (this.searchInput) {
                this.addEventListener(this.searchInput, 'input', this.handleSearchInput.bind(this));
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

            // 정렬 옵션 이벤트
            const sortOptions = document.querySelectorAll('input[name="sort"]');
            sortOptions.forEach(option => {
                this.addEventListener(option, 'change', this.handleSortChange.bind(this));
            });
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
            // 검색어 입력 처리 (준비 중)
            this.showToast('검색 기능 준비 중입니다.');
        } catch (error) {
            console.error('검색 입력 처리 오류:', error);
            this.showToast('검색 처리 중 오류가 발생했습니다.');
        }
    }

    handleSearch() {
        try {
            // 검색 실행 (준비 중)
            this.showToast('검색 기능 준비 중입니다.');
        } catch (error) {
            console.error('검색 실행 오류:', error);
            this.showToast('검색 실행 중 오류가 발생했습니다.');
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
            
            // 여행 목적 체크박스 초기화
            const purposeCheckboxes = document.querySelectorAll('input[id^="purpose-"]');
            purposeCheckboxes.forEach(checkbox => checkbox.checked = false);
            
            // 여행 스타일 체크박스 초기화
            const styleCheckboxes = document.querySelectorAll('input[id^="style-"]');
            styleCheckboxes.forEach(checkbox => checkbox.checked = false);
            
            // 라디오 버튼 초기화
            const ratingRadios = document.querySelectorAll('input[name="rating"]');
            ratingRadios.forEach(radio => radio.checked = false);
            
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
            // 정렬 변경 (준비 중)
            this.showToast('정렬 기능 준비 중입니다.');
        } catch (error) {
            console.error('정렬 변경 오류:', error);
            this.showToast('정렬 변경 중 오류가 발생했습니다.');
        }
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
        
        // 메모리 정리
        this.container = null;
        } catch (error) {
            console.error('검색 탭 정리 오류:', error);
        }
    }
}

export default new SearchTab();
