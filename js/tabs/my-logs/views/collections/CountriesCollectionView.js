/**
 * CountriesCollectionView - 방문한 국가 컬렉션 뷰
 * 
 * 🎯 책임:
 * - 방문한 국가 목록 렌더링
 * - 대륙별 필터링 및 정렬
 * - 국가별 상세 정보 표시
 * - 국가별 통계 관리
 * 
 * @class CountriesCollectionView
 * @extends BaseCollectionView
 * @version 1.0.0
 * @since 2024-12-29
 */
import { BaseCollectionView } from './BaseCollectionView.js';
import { countriesManager } from '../../../../data/countries-manager.js';

export class CountriesCollectionView extends BaseCollectionView {
    constructor(controller, config) {
        super(controller, config);
        
        // 국가별 특수 속성
        this.currentContinent = 'all';
        this.visitedCountries = this.generateDemoVisitedCountries();
        
        // 메서드 바인딩
        this.handleContinentFilter = this.handleContinentFilter.bind(this);
        this.handleCountryClick = this.handleCountryClick.bind(this);
    }
    
    
    /**
     * 컬렉션 데이터를 로드합니다
     */
    async loadData() {
        try {
            // CountriesManager 초기화 확인
            if (!countriesManager.isInitialized) {
                await countriesManager.initialize();
            }
            
            // 실제 방문 국가 데이터 로드
            const visitedData = this.controller.getVisitedCountries();
            
            if (visitedData && visitedData.visitedCountryCodes && visitedData.visitedCountryCodes.length > 0) {
                this.data = visitedData.visitedCountryCodes;
                this.visitedCountries = visitedData.countries || {};
                console.log('CountriesCollectionView: 실제 데이터 로드 완료', {
                    dataCount: this.data.length,
                    countries: Object.keys(this.visitedCountries).length
                });
            } else {
                // 실제 데이터가 없으면 데모 데이터 사용
                this.data = Object.keys(this.visitedCountries);
                console.log('CountriesCollectionView: 데모 데이터 사용', {
                    dataCount: this.data.length
                });
            }
        } catch (error) {
            console.error('CountriesCollectionView: 데이터 로드 실패:', error);
            // 에러 발생 시 데모 데이터 사용
            this.data = Object.keys(this.visitedCountries);
        }
    }
    
    /**
     * 필터 컨트롤을 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderFilterControls() {
        const filterOptions = this.generateContinentFilterOptions();
        
        return `
            <div class="filter-group">
                <label for="continent-filter" class="filter-label">대륙 필터</label>
                <select id="continent-filter" class="filter-control continent-filter">
                    ${filterOptions}
                </select>
            </div>
        `;
    }
    
    /**
     * 정렬 컨트롤을 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderSortControls() {
        return `
            <div class="sort-group">
                <label for="country-sort" class="sort-label">정렬</label>
                <select id="country-sort" class="sort-control">
                    <option value="visitCount" ${this.sortBy === 'visitCount' ? 'selected' : ''}>방문 횟수</option>
                    <option value="lastVisit" ${this.sortBy === 'lastVisit' ? 'selected' : ''}>최근 방문</option>
                    <option value="alphabet" ${this.sortBy === 'alphabet' ? 'selected' : ''}>가나다순</option>
                </select>
            </div>
        `;
    }
    
    /**
     * 통계 정보를 렌더링합니다 (간소화된 버전)
     * @returns {string} HTML 문자열
     */
    renderStats() {
        const visitedCount = this.data.length;
        
        return `
            <div class="collection-stats-simple">
                <div class="stats-info">
                    <span class="stats-icon">🏴</span>
                    <span class="stats-text">총 ${visitedCount}개국 방문</span>
                </div>
            </div>
        `;
    }
    
    /**
     * 컬렉션 아이템들을 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderItems() {
        const filteredCountries = this.getFilteredAndSortedData();
        
        if (filteredCountries.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🗺️</div>
                    <h3>방문한 국가가 없습니다</h3>
                    <p>첫 여행 일지를 작성해보세요!</p>
                </div>
            `;
        }
        
        return `
            <div class="countries-grid">
                ${filteredCountries.map(country => this.renderCountryCard(country)).join('')}
            </div>
        `;
    }
    
    /**
     * 개별 국가 카드를 렌더링합니다
     * @param {Object} country - 국가 정보
     * @returns {string} HTML 문자열
     */
    renderCountryCard(country) {
        const visitInfo = this.visitedCountries[country.code] || { count: 0, lastVisit: null };
        const visitCount = visitInfo.count || 0;
        const lastVisit = visitInfo.lastVisit;
        
        return `
            <div class="visited-country-card" data-country="${country.code}">
                <div class="country-flag-section">
                    <div class="country-flag-large">${country.flag}</div>
                </div>
                <div class="country-basic-info">
                    <h3 class="country-name">${country.nameKo}</h3>
                    <p class="country-name-en">${country.nameEn}</p>
                </div>
                <div class="country-visit-stats">
                    <div class="visit-count-badge">${visitCount}회 방문</div>
                    <div class="last-visit-info">${this.formatLastVisit(lastVisit)}</div>
                </div>
            </div>
        `;
    }
    
    /**
     * BaseCollectionView의 추상 메서드 구현 - 필터링/정렬된 국가 데이터 반환
     * @returns {Array} 필터링/정렬된 국가 배열
     */
    getFilteredAndSortedData() {
        try {
            // 방문한 국가 코드들
            const visitedCountryCodes = this.data;
            
            // 전체 국가 데이터에서 방문한 국가만 필터링
            let filteredCountries = countriesManager.countries.filter(country => 
                visitedCountryCodes.includes(country.code)
            );
            
            // 대륙별 필터링
            if (this.currentContinent && this.currentContinent !== 'all') {
                filteredCountries = filteredCountries.filter(country => 
                    country.continent === this.currentContinent
                );
            }
            
            // 정렬
            filteredCountries.sort((a, b) => {
                const visitInfoA = this.visitedCountries[a.code] || { count: 0, lastVisit: null };
                const visitInfoB = this.visitedCountries[b.code] || { count: 0, lastVisit: null };
                
                switch (this.sortBy) {
                    case 'visitCount':
                        return (visitInfoB.count || 0) - (visitInfoA.count || 0);
                    case 'lastVisit':
                        const dateA = visitInfoA.lastVisit ? new Date(visitInfoA.lastVisit) : new Date(0);
                        const dateB = visitInfoB.lastVisit ? new Date(visitInfoB.lastVisit) : new Date(0);
                        return dateB - dateA;
                    case 'alphabet':
                        return a.nameKo.localeCompare(b.nameKo);
                    default:
                        return 0;
                }
            });
            
            return filteredCountries;
        } catch (error) {
            console.error('CountriesCollectionView: 필터링/정렬 실패:', error);
            return [];
        }
    }
    
    /**
     * 대륙 필터 옵션을 생성합니다
     * @returns {string} HTML 옵션 문자열
     */
    generateContinentFilterOptions() {
        try {
            // 컨트롤러에서 대륙별 통계 가져오기
            const continentStats = this.controller.getContinentStats();
            
            let options = '<option value="all">모든 대륙</option>';
            
            if (continentStats && continentStats.length > 0) {
                continentStats.forEach(continent => {
                    if (continent.visited > 0) { // 방문한 국가가 있는 대륙만 표시
                        const selected = this.currentContinent === continent.continent ? 'selected' : '';
                        options += `<option value="${continent.continent}" ${selected}>${continent.emoji} ${continent.nameKo} (${continent.visited}개국)</option>`;
                    }
                });
            } else {
                // 기본 옵션 추가
                options += `
                    <option value="Asia">🌏 아시아</option>
                    <option value="Europe">🇪🇺 유럽</option>
                    <option value="North America">🇺🇸 북미</option>
                `;
            }
            
            return options;
        } catch (error) {
            console.error('CountriesCollectionView: 대륙 필터 옵션 생성 오류:', error);
            // 기본 옵션 반환
            return `
                <option value="all">모든 대륙</option>
                <option value="Asia">🌏 아시아</option>
                <option value="Europe">🇪🇺 유럽</option>
                <option value="North America">🇺🇸 북미</option>
            `;
        }
    }
    
    /**
     * 커스텀 이벤트를 바인딩합니다
     */
    bindCustomEvents() {
        if (!this.container) return;
        
        // 대륙 필터 이벤트
        const continentFilter = this.container.querySelector('#continent-filter');
        if (continentFilter) {
            this.eventManager.add(continentFilter, 'change', this.handleContinentFilter);
        }
        
        // 국가 카드 클릭 이벤트
        const countryCards = this.container.querySelectorAll('.visited-country-card');
        countryCards.forEach(card => {
            this.eventManager.add(card, 'click', this.handleCountryClick);
        });
    }
    
    /**
     * 대륙 필터 변경을 처리합니다
     * @param {Event} e - 변경 이벤트
     */
    handleContinentFilter(e) {
        this.currentContinent = e.target.value;
        this.updateItems();
    }
    
    /**
     * 국가 카드 클릭을 처리합니다
     * @param {Event} e - 클릭 이벤트
     */
    handleCountryClick(e) {
        const countryCard = e.target.closest('.visited-country-card');
        
        if (countryCard) {
            const countryCode = countryCard.dataset.country;
            this.showCountryDetail(countryCode);
        }
    }
    
    /**
     * 국가 상세 정보를 표시합니다
     * @param {string} countryCode - 국가 코드
     */
    showCountryDetail(countryCode) {
        const country = countriesManager.getCountryByCode(countryCode);
        if (!country) return;
        
        const visitInfo = this.visitedCountries[countryCode];
        
        // 향후 모달로 개선 예정
        console.log('국가 상세 정보:', country.nameKo);
        alert(`${country.flag} ${country.nameKo}\n${visitInfo ? `방문 ${visitInfo.count}회` : '미방문'}`);
    }
    
    /**
     * 마지막 방문일을 포맷팅합니다
     * @param {string} dateString - 날짜 문자열
     * @returns {string} 포맷된 날짜
     */
    formatLastVisit(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 30) {
                return `${diffDays}일 전`;
            } else if (diffDays < 365) {
                const months = Math.floor(diffDays / 30);
                return `${months}개월 전`;
            } else {
                const years = Math.floor(diffDays / 365);
                return `${years}년 전`;
            }
        } catch (error) {
            return dateString;
        }
    }
    
    /**
     * 데모 방문 국가 데이터를 생성합니다
     * @returns {Object} 데모 방문 국가 객체
     */
    generateDemoVisitedCountries() {
        return {
            'JP': { count: 5, lastVisit: '2024-10-15' },
            'FR': { count: 2, lastVisit: '2024-08-20' },
            'IT': { count: 1, lastVisit: '2024-06-10' },
            'TH': { count: 3, lastVisit: '2024-09-05' },
            'US': { count: 2, lastVisit: '2024-07-22' },
            'KR': { count: 8, lastVisit: '2024-11-01' },
            'CN': { count: 1, lastVisit: '2024-04-18' },
            'VN': { count: 2, lastVisit: '2024-05-25' },
            'SG': { count: 4, lastVisit: '2024-09-12' },
            'MY': { count: 1, lastVisit: '2024-03-30' }
        };
    }
    
}
