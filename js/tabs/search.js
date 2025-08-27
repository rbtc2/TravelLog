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

                    <!-- 검색 결과 섹션 -->
                    <div class="search-results-section">
                        <div class="results-header">
                            <h3 class="results-title">📊 검색 결과</h3>
                            <div class="results-count">
                                <span class="count-number">0</span>개의 일정 기록
                            </div>
                        </div>
                        
                        <div class="results-content">
                            <div class="no-results-placeholder">
                                <div class="no-results-icon">🔍</div>
                                <div class="no-results-title">검색 결과가 없습니다</div>
                                <div class="no-results-description">
                                    검색어나 필터를 변경해보세요.<br>
                                    또는 새로운 일정 기록을 추가해보세요.
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
