/**
 * TravelCollectionView - 여행 도감 화면 렌더링 및 이벤트 처리
 * 
 * 🎯 책임:
 * - 여행 도감 화면 UI 렌더링
 * - 국가별 방문 상태 표시
 * - 진행률 및 통계 정보 표시
 * - 대륙별 필터링 및 인터랙션 처리
 * 
 * @class TravelCollectionView
 * @version 1.0.0
 * @since 2024-12-29
 */
import { EventManager } from '../../../modules/utils/event-manager.js';
import { countriesManager } from '../../../data/countries-manager.js';

class TravelCollectionView {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
        
        // 상태 관리
        this.currentFilter = 'all'; // all, visited, unvisited
        this.currentContinent = 'all'; // all, Asia, Europe, etc.
        this.sortBy = 'alphabet'; // alphabet, visitCount, lastVisit
        this.isLoading = false;
        
        // 실제 데이터는 controller에서 가져옴 (데모 데이터는 fallback용)
        this.visitedCountries = this.generateDemoVisitedCountries();
        
        // 대륙별 정보
        this.continents = {
            'Asia': { nameKo: '아시아', total: 48, visited: 12 },
            'Europe': { nameKo: '유럽', total: 44, visited: 10 },
            'North America': { nameKo: '북미', total: 23, visited: 8 },
            'South America': { nameKo: '남미', total: 12, visited: 3 },
            'Africa': { nameKo: '아프리카', total: 54, visited: 2 },
            'Oceania': { nameKo: '오세아니아', total: 14, visited: 2 }
        };
        
        // 바인딩
        this.bindMethods();
    }

    /**
     * 메서드 바인딩
     */
    bindMethods() {
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleContinentFilter = this.handleContinentFilter.bind(this);
        this.handleSortChange = this.handleSortChange.bind(this);
        this.handleCountryClick = this.handleCountryClick.bind(this);
        this.handleBackToHub = this.handleBackToHub.bind(this);
        this.handleSearchInput = this.handleSearchInput.bind(this);
    }

    /**
     * 여행 도감 화면을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    async render(container) {
        this.container = container;
        
        try {
            this.isLoading = true;
            
            // 국가 데이터 로드
            if (!countriesManager.isInitialized) {
                await countriesManager.initialize();
            }
            
            // 실제 방문 국가 데이터 로드
            this.loadVisitedCountriesData();
            
            this.renderContent();
            this.bindEvents();
            
            console.log('TravelCollectionView: 렌더링 완료');
        } catch (error) {
            console.error('TravelCollectionView: 렌더링 실패:', error);
            this.renderError();
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 실제 방문 국가 데이터 로드
     */
    loadVisitedCountriesData() {
        try {
            // Controller에서 실제 방문 국가 데이터 가져오기
            const realVisitedCountries = this.controller.getVisitedCountries();
            const continentStats = this.controller.getContinentStats();
            
            if (Object.keys(realVisitedCountries).length > 0) {
                // 실제 데이터가 있으면 사용
                this.visitedCountries = realVisitedCountries;
                
                // 대륙별 정보 업데이트
                this.continents = {};
                Object.keys(continentStats).forEach(continent => {
                    this.continents[continent] = {
                        nameKo: continentStats[continent].nameKo,
                        total: continentStats[continent].total,
                        visited: continentStats[continent].visited
                    };
                });
                
                console.log('TravelCollectionView: 실제 데이터 로드 완료', {
                    visitedCountries: Object.keys(this.visitedCountries).length,
                    continents: this.continents
                });
            } else {
                // 실제 데이터가 없으면 데모 데이터 사용
                console.log('TravelCollectionView: 실제 데이터가 없어 데모 데이터 사용');
            }
        } catch (error) {
            console.error('TravelCollectionView: 방문 국가 데이터 로드 실패:', error);
            // 에러 발생 시 데모 데이터 유지
        }
    }

    /**
     * 메인 컨텐츠 렌더링
     */
    renderContent() {
        const totalCountries = 195;
        const visitedTotal = Object.keys(this.visitedCountries).length;
        const progressPercentage = Math.round((visitedTotal / totalCountries) * 100);
        
        this.container.innerHTML = `
            <div class="my-logs-container">
                <!-- 헤더 -->
                <div class="my-logs-header">
                    <div class="header-with-back">
                        <button class="back-btn" id="back-to-hub-from-collection">◀ 뒤로</button>
                        <div class="header-content">
                            <h1 class="my-logs-title">📖 여행 도감</h1>
                            <p class="my-logs-subtitle">방문한 국가들을 수집하고 관리하세요</p>
                        </div>
                    </div>
                </div>
                
                <!-- 전체 진행률 카드 -->
                <div class="hub-section progress-section">
                    <div class="collection-stats-card">
                        <div class="stats-header">
                            <div class="stats-icon">🌍</div>
                            <div class="stats-info">
                                <h3 class="stats-title">전 세계 탐험 현황</h3>
                                <p class="stats-subtitle">전 세계 ${totalCountries}개국 중 ${visitedTotal}개국 방문</p>
                            </div>
                            <div class="stats-percentage">${progressPercentage}%</div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                        <div class="achievement-badges">
                            <div class="badge ${visitedTotal >= 10 ? 'unlocked' : 'locked'}">
                                <span class="badge-icon">✈️</span>
                                <span class="badge-label">여행 초보자</span>
                            </div>
                            <div class="badge ${visitedTotal >= 25 ? 'unlocked' : 'locked'}">
                                <span class="badge-icon">🗺️</span>
                                <span class="badge-label">세계 탐험가</span>
                            </div>
                            <div class="badge ${visitedTotal >= 50 ? 'unlocked' : 'locked'}">
                                <span class="badge-icon">🏆</span>
                                <span class="badge-label">글로벌 여행자</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 대륙별 진행률 -->
                <div class="hub-section continent-section">
                    <div class="section-header">
                        <h2 class="section-title">🌏 대륙별 진행률</h2>
                    </div>
                    <div class="continent-grid">
                        ${this.renderContinentCards()}
                    </div>
                </div>
                
                <!-- 필터 및 정렬 옵션 -->
                <div class="hub-section filter-section">
                    <div class="section-header">
                        <h2 class="section-title">🔍 국가 컬렉션</h2>
                    </div>
                    
                    <!-- 검색 바 -->
                    <div class="search-container">
                        <div class="search-input-wrapper">
                            <input 
                                type="text" 
                                id="collection-search" 
                                class="collection-search-input"
                                placeholder="국가명으로 검색..."
                                autocomplete="off"
                            >
                            <span class="search-icon">🔍</span>
                        </div>
                    </div>
                    
                    <!-- 필터 탭 -->
                    <div class="filter-tabs">
                        <button class="filter-tab ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                            전체 (${totalCountries})
                        </button>
                        <button class="filter-tab ${this.currentFilter === 'visited' ? 'active' : ''}" data-filter="visited">
                            방문함 (${visitedTotal})
                        </button>
                        <button class="filter-tab ${this.currentFilter === 'unvisited' ? 'active' : ''}" data-filter="unvisited">
                            미방문 (${totalCountries - visitedTotal})
                        </button>
                    </div>
                    
                    <!-- 대륙 필터 -->
                    <div class="continent-filter">
                        <select id="continent-select" class="continent-select">
                            <option value="all">모든 대륙</option>
                            ${Object.entries(this.continents).map(([continent, info]) => 
                                `<option value="${continent}">${info.nameKo} (${info.visited}/${info.total})</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <!-- 정렬 옵션 -->
                    <div class="sort-options">
                        <select id="sort-select" class="sort-select">
                            <option value="alphabet">가나다순</option>
                            <option value="visitCount">방문횟수순</option>
                            <option value="lastVisit">최근방문순</option>
                        </select>
                    </div>
                </div>
                
                <!-- 국가 컬렉션 그리드 -->
                <div class="hub-section collection-section">
                    <div class="collection-grid" id="collection-grid">
                        <!-- 국가 카드들이 여기에 동적으로 렌더링됩니다 -->
                    </div>
                    
                    <!-- 로딩 인디케이터 -->
                    <div class="loading-indicator hidden" id="loading-indicator">
                        <div class="loading-spinner"></div>
                        <p>국가 정보를 불러오는 중...</p>
                    </div>
                    
                    <!-- 빈 상태 -->
                    <div class="empty-state hidden" id="empty-state">
                        <div class="empty-icon">🔍</div>
                        <h3>검색 결과가 없습니다</h3>
                        <p>다른 검색어를 시도해보세요</p>
                    </div>
                </div>
            </div>
        `;
        
        // 초기 국가 목록 렌더링
        this.renderCountryGrid();
    }

    /**
     * 대륙 카드들 렌더링
     */
    renderContinentCards() {
        return Object.entries(this.continents).map(([continent, info]) => {
            const percentage = Math.round((info.visited / info.total) * 100);
            
            return `
                <div class="continent-card" data-continent="${continent}">
                    <div class="continent-header">
                        <h4 class="continent-name">${info.nameKo}</h4>
                        <span class="continent-progress">${info.visited}/${info.total}</span>
                    </div>
                    <div class="continent-progress-bar">
                        <div class="continent-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="continent-percentage">${percentage}%</div>
                </div>
            `;
        }).join('');
    }

    /**
     * 국가 그리드 렌더링
     */
    renderCountryGrid() {
        const gridContainer = this.container.querySelector('#collection-grid');
        const loadingIndicator = this.container.querySelector('#loading-indicator');
        const emptyState = this.container.querySelector('#empty-state');
        
        if (!gridContainer) return;
        
        // 로딩 상태 표시
        loadingIndicator.classList.remove('hidden');
        gridContainer.classList.add('hidden');
        emptyState.classList.add('hidden');
        
        // 약간의 지연을 주어 로딩 느낌 연출
        setTimeout(() => {
            const countries = this.getFilteredAndSortedCountries();
            
            if (countries.length === 0) {
                loadingIndicator.classList.add('hidden');
                emptyState.classList.remove('hidden');
                gridContainer.classList.add('hidden');
                return;
            }
            
            gridContainer.innerHTML = countries.map(country => this.renderCountryCard(country)).join('');
            
            loadingIndicator.classList.add('hidden');
            gridContainer.classList.remove('hidden');
            emptyState.classList.add('hidden');
        }, 300);
    }

    /**
     * 개별 국가 카드 렌더링
     */
    renderCountryCard(country) {
        const visitInfo = this.visitedCountries[country.code];
        const isVisited = !!visitInfo;
        const visitCount = visitInfo ? visitInfo.count : 0;
        const lastVisit = visitInfo ? visitInfo.lastVisit : null;
        
        return `
            <div class="country-card ${isVisited ? 'visited' : 'unvisited'}" data-country="${country.code}">
                <div class="country-flag">
                    <span class="flag-emoji">${country.flag}</span>
                    ${isVisited ? '<div class="visited-badge">✓</div>' : ''}
                </div>
                <div class="country-info">
                    <h4 class="country-name">${country.nameKo}</h4>
                    <p class="country-name-en">${country.nameEn}</p>
                    <p class="country-continent">${country.continentKo}</p>
                </div>
                <div class="country-stats">
                    ${isVisited ? `
                        <div class="visit-count">방문 ${visitCount}회</div>
                        <div class="last-visit">${this.formatLastVisit(lastVisit)}</div>
                    ` : `
                        <div class="unvisited-label">미방문</div>
                    `}
                </div>
                ${isVisited ? `
                    <div class="country-actions">
                        <button class="action-btn view-logs-btn" data-country="${country.code}">
                            일지 보기
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * 필터링 및 정렬된 국가 목록 반환
     */
    getFilteredAndSortedCountries() {
        let countries = [...countriesManager.countries];
        
        // 대륙 필터 적용
        if (this.currentContinent !== 'all') {
            countries = countries.filter(country => country.continent === this.currentContinent);
        }
        
        // 방문 상태 필터 적용
        if (this.currentFilter === 'visited') {
            countries = countries.filter(country => this.visitedCountries[country.code]);
        } else if (this.currentFilter === 'unvisited') {
            countries = countries.filter(country => !this.visitedCountries[country.code]);
        }
        
        // 검색 쿼리 필터 적용
        const searchQuery = this.container.querySelector('#collection-search')?.value?.toLowerCase();
        if (searchQuery) {
            countries = countries.filter(country => 
                country.nameKo.toLowerCase().includes(searchQuery) ||
                country.nameEn.toLowerCase().includes(searchQuery)
            );
        }
        
        // 정렬 적용
        countries.sort((a, b) => {
            switch (this.sortBy) {
                case 'alphabet':
                    return a.nameKo.localeCompare(b.nameKo);
                case 'visitCount':
                    const aCount = this.visitedCountries[a.code]?.count || 0;
                    const bCount = this.visitedCountries[b.code]?.count || 0;
                    return bCount - aCount;
                case 'lastVisit':
                    const aDate = this.visitedCountries[a.code]?.lastVisit || '1970-01-01';
                    const bDate = this.visitedCountries[b.code]?.lastVisit || '1970-01-01';
                    return new Date(bDate) - new Date(aDate);
                default:
                    return 0;
            }
        });
        
        return countries;
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        if (!this.container) return;
        
        // 뒤로 가기 버튼
        const backBtn = this.container.querySelector('#back-to-hub-from-collection');
        if (backBtn) {
            this.eventManager.add(backBtn, 'click', this.handleBackToHub);
        }
        
        // 필터 탭
        const filterTabs = this.container.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            this.eventManager.add(tab, 'click', this.handleFilterChange);
        });
        
        // 대륙 선택
        const continentSelect = this.container.querySelector('#continent-select');
        if (continentSelect) {
            this.eventManager.add(continentSelect, 'change', this.handleContinentFilter);
        }
        
        // 정렬 선택
        const sortSelect = this.container.querySelector('#sort-select');
        if (sortSelect) {
            this.eventManager.add(sortSelect, 'change', this.handleSortChange);
        }
        
        // 검색
        const searchInput = this.container.querySelector('#collection-search');
        if (searchInput) {
            this.eventManager.add(searchInput, 'input', this.handleSearchInput);
        }
        
        // 대륙 카드 클릭
        const continentCards = this.container.querySelectorAll('.continent-card');
        continentCards.forEach(card => {
            this.eventManager.add(card, 'click', (e) => {
                const continent = e.currentTarget.dataset.continent;
                this.handleContinentFilter({ target: { value: continent } });
            });
        });
        
        // 국가 카드 클릭 (이벤트 위임)
        const collectionGrid = this.container.querySelector('#collection-grid');
        if (collectionGrid) {
            this.eventManager.add(collectionGrid, 'click', this.handleCountryClick);
        }
        
        console.log('TravelCollectionView: 이벤트 바인딩 완료');
    }

    /**
     * 이벤트 핸들러들
     */
    handleBackToHub() {
        console.log('TravelCollectionView: 허브로 돌아가기');
        this.dispatchEvent('navigate', { view: 'hub' });
    }

    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        if (filter) {
            this.currentFilter = filter;
            
            // UI 업데이트
            this.container.querySelectorAll('.filter-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // 그리드 재렌더링
            this.renderCountryGrid();
        }
    }

    handleContinentFilter(e) {
        this.currentContinent = e.target.value;
        
        // 대륙 선택 UI 업데이트
        const continentSelect = this.container.querySelector('#continent-select');
        if (continentSelect) {
            continentSelect.value = this.currentContinent;
        }
        
        // 그리드 재렌더링
        this.renderCountryGrid();
    }

    handleSortChange(e) {
        this.sortBy = e.target.value;
        this.renderCountryGrid();
    }

    handleSearchInput(e) {
        // 디바운싱 적용
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.renderCountryGrid();
        }, 300);
    }

    handleCountryClick(e) {
        const countryCard = e.target.closest('.country-card');
        const actionBtn = e.target.closest('.action-btn');
        
        if (actionBtn && actionBtn.classList.contains('view-logs-btn')) {
            // 일지 보기 버튼 클릭
            const countryCode = actionBtn.dataset.country;
            this.showCountryLogs(countryCode);
        } else if (countryCard) {
            // 국가 카드 클릭
            const countryCode = countryCard.dataset.country;
            this.showCountryDetail(countryCode);
        }
    }

    /**
     * 국가 상세 정보 표시
     */
    showCountryDetail(countryCode) {
        const country = countriesManager.getCountryByCode(countryCode);
        const visitInfo = this.visitedCountries[countryCode];
        
        if (!country) return;
        
        // 간단한 모달로 국가 정보 표시 (향후 확장 가능)
        const modalContent = `
            <div class="country-detail-modal">
                <div class="country-detail-header">
                    <span class="country-flag-large">${country.flag}</span>
                    <div class="country-detail-info">
                        <h2>${country.nameKo}</h2>
                        <p>${country.nameEn}</p>
                        <p>${country.continentKo}</p>
                    </div>
                </div>
                <div class="country-detail-content">
                    ${visitInfo ? `
                        <div class="visit-info">
                            <h3>방문 기록</h3>
                            <p>방문 횟수: ${visitInfo.count}회</p>
                            <p>최근 방문: ${this.formatLastVisit(visitInfo.lastVisit)}</p>
                        </div>
                    ` : `
                        <div class="no-visit-info">
                            <p>아직 방문하지 않은 국가입니다.</p>
                            <p>첫 여행을 계획해보세요!</p>
                        </div>
                    `}
                </div>
                <div class="country-detail-actions">
                    <button class="modal-close-btn">닫기</button>
                    ${visitInfo ? `
                        <button class="view-logs-btn" data-country="${countryCode}">일지 보기</button>
                    ` : `
                        <button class="plan-trip-btn" data-country="${countryCode}">여행 계획하기</button>
                    `}
                </div>
            </div>
        `;
        
        // 모달 표시 (향후 모달 매니저로 개선)
        console.log('국가 상세 정보:', country.nameKo);
        // 임시로 alert으로 대체
        alert(`${country.flag} ${country.nameKo}\n${visitInfo ? `방문 ${visitInfo.count}회` : '미방문'}`);
    }

    /**
     * 국가별 일지 목록 표시
     */
    showCountryLogs(countryCode) {
        const country = countriesManager.getCountryByCode(countryCode);
        if (!country) return;
        
        // 향후 실제 일지 목록으로 연동
        console.log(`${country.nameKo} 일지 목록 표시`);
        alert(`${country.nameKo}의 여행 일지를 표시합니다.`);
    }

    /**
     * 마지막 방문일 포맷팅
     */
    formatLastVisit(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 7) {
            return `${diffDays}일 전`;
        } else if (diffDays < 30) {
            return `${Math.floor(diffDays / 7)}주 전`;
        } else if (diffDays < 365) {
            return `${Math.floor(diffDays / 30)}개월 전`;
        } else {
            return `${Math.floor(diffDays / 365)}년 전`;
        }
    }

    /**
     * 데모 방문 국가 데이터 생성
     */
    generateDemoVisitedCountries() {
        return {
            'KR': { count: 1, lastVisit: '2024-12-29', totalDays: 365 },
            'JP': { count: 5, lastVisit: '2024-11-15', totalDays: 47 },
            'CN': { count: 3, lastVisit: '2024-10-20', totalDays: 21 },
            'TH': { count: 4, lastVisit: '2024-09-10', totalDays: 28 },
            'VN': { count: 2, lastVisit: '2024-08-05', totalDays: 14 },
            'SG': { count: 3, lastVisit: '2024-07-12', totalDays: 12 },
            'MY': { count: 2, lastVisit: '2024-06-18', totalDays: 10 },
            'ID': { count: 1, lastVisit: '2024-05-22', totalDays: 7 },
            'PH': { count: 2, lastVisit: '2024-04-15', totalDays: 14 },
            'IN': { count: 1, lastVisit: '2024-03-08', totalDays: 12 },
            'TW': { count: 3, lastVisit: '2024-02-14', totalDays: 18 },
            'HK': { count: 4, lastVisit: '2024-01-20', totalDays: 16 },
            
            'FR': { count: 2, lastVisit: '2023-12-10', totalDays: 12 },
            'DE': { count: 1, lastVisit: '2023-11-05', totalDays: 8 },
            'GB': { count: 1, lastVisit: '2023-10-12', totalDays: 10 },
            'IT': { count: 1, lastVisit: '2023-09-18', totalDays: 8 },
            'ES': { count: 2, lastVisit: '2023-08-25', totalDays: 14 },
            'NL': { count: 1, lastVisit: '2023-07-30', totalDays: 6 },
            'CH': { count: 1, lastVisit: '2023-06-15', totalDays: 5 },
            'AT': { count: 1, lastVisit: '2023-05-20', totalDays: 4 },
            'CZ': { count: 1, lastVisit: '2023-04-10', totalDays: 5 },
            'GR': { count: 1, lastVisit: '2023-03-15', totalDays: 7 },
            
            'US': { count: 3, lastVisit: '2023-12-01', totalDays: 21 },
            'CA': { count: 2, lastVisit: '2023-10-15', totalDays: 14 },
            'MX': { count: 1, lastVisit: '2023-08-20', totalDays: 7 },
            'CU': { count: 1, lastVisit: '2023-06-10', totalDays: 6 },
            'DO': { count: 1, lastVisit: '2023-04-05', totalDays: 5 },
            'CR': { count: 1, lastVisit: '2023-02-12', totalDays: 8 },
            'PA': { count: 1, lastVisit: '2023-01-18', totalDays: 4 },
            'JM': { count: 1, lastVisit: '2022-12-20', totalDays: 6 },
            
            'BR': { count: 1, lastVisit: '2023-07-15', totalDays: 10 },
            'AR': { count: 1, lastVisit: '2023-05-10', totalDays: 8 },
            'CL': { count: 1, lastVisit: '2023-03-20', totalDays: 9 },
            
            'AU': { count: 2, lastVisit: '2023-11-25', totalDays: 16 },
            'NZ': { count: 1, lastVisit: '2023-09-12', totalDays: 12 },
            
            'ZA': { count: 1, lastVisit: '2023-06-05', totalDays: 8 },
            'EG': { count: 1, lastVisit: '2023-04-12', totalDays: 6 }
        };
    }

    /**
     * 에러 상태 렌더링
     */
    renderError() {
        this.container.innerHTML = `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <div class="header-with-back">
                        <button class="back-btn" id="back-to-hub-from-collection">◀ 뒤로</button>
                        <div class="header-content">
                            <h1 class="my-logs-title">📖 여행 도감</h1>
                            <p class="my-logs-subtitle">오류가 발생했습니다</p>
                        </div>
                    </div>
                </div>
                
                <div class="hub-section error-section">
                    <div class="error-message">
                        <div class="error-icon">⚠️</div>
                        <h3>데이터를 불러올 수 없습니다</h3>
                        <p>국가 정보를 불러오는 중 오류가 발생했습니다.</p>
                        <button class="action-btn retry-btn" onclick="location.reload()">다시 시도</button>
                    </div>
                </div>
            </div>
        `;
        
        // 뒤로 가기 버튼만 이벤트 바인딩
        const backBtn = this.container.querySelector('#back-to-hub-from-collection');
        if (backBtn) {
            this.eventManager.add(backBtn, 'click', this.handleBackToHub);
        }
    }

    /**
     * 리소스 정리
     */
    cleanup() {
        // 타이머 정리
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
        
        // 이벤트 리스너 정리
        this.eventManager.cleanup();
        
        // 상태 초기화
        this.container = null;
        this.isLoading = false;
        
        console.log('TravelCollectionView: 정리 완료');
    }
}

export { TravelCollectionView };
