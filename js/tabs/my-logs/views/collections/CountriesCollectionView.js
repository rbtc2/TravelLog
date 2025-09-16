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
        this.visitedCountries = {};
        
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
                // 실제 데이터가 없으면 빈 배열 사용
                this.data = [];
                this.visitedCountries = {};
                console.log('CountriesCollectionView: 방문한 국가가 없습니다');
            }
        } catch (error) {
            console.error('CountriesCollectionView: 데이터 로드 실패:', error);
            // 에러 발생 시 빈 배열 사용
            this.data = [];
            this.visitedCountries = {};
        }
    }
    
    /**
     * 필터 컨트롤을 렌더링합니다 (2025년 모던 디자인)
     * @returns {string} HTML 문자열
     */
    renderFilterControls() {
        const filterOptions = this.generateContinentFilterOptions();
        
        return `
            <div class="modern-filter-group">
                <div class="custom-select-wrapper">
                    <select id="continent-filter" class="modern-select continent-filter">
                        ${filterOptions}
                    </select>
                    <div class="select-arrow">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 정렬 컨트롤을 렌더링합니다 (2025년 모던 디자인)
     * @returns {string} HTML 문자열
     */
    renderSortControls() {
        return `
            <div class="modern-sort-group">
                <div class="custom-select-wrapper">
                    <select id="country-sort" class="modern-select sort-select">
                        <option value="visitCount" ${this.sortBy === 'visitCount' ? 'selected' : ''}>방문 횟수</option>
                        <option value="lastVisit" ${this.sortBy === 'lastVisit' ? 'selected' : ''}>최근 방문</option>
                        <option value="alphabet" ${this.sortBy === 'alphabet' ? 'selected' : ''}>가나다순</option>
                    </select>
                    <div class="select-arrow">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 통계 정보를 렌더링합니다 (통계 정보 제거됨)
     * @returns {string} HTML 문자열
     */
    renderStats() {
        return '';
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
                    <div class="visit-count-badge">방문 완료</div>
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
            
            // 정렬 (실제 데이터만 사용)
            filteredCountries.sort((a, b) => {
                switch (this.sortBy) {
                    case 'visitCount':
                        // 방문 횟수로 정렬 (실제 데이터가 없으므로 알파벳 순으로 대체)
                        return a.nameKo.localeCompare(b.nameKo);
                    case 'lastVisit':
                        // 최근 방문일로 정렬 (실제 데이터가 없으므로 알파벳 순으로 대체)
                        return a.nameKo.localeCompare(b.nameKo);
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
        
        // 향후 모달로 개선 예정
        console.log('국가 상세 정보:', country.nameKo);
        alert(`${country.flag} ${country.nameKo}\n방문 완료`);
    }
    
    
    
}
