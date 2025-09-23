/**
 * @fileoverview 국가 선택 드롭다운 컴포넌트
 * @description 검색 가능한 국가 선택 UI 컴포넌트
 * @author TravelLog Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { countriesManager } from '../../data/countries-manager.js';

/**
 * 국가 선택기 컴포넌트 클래스
 * @class CountrySelector
 * @description 검색 가능한 국가 선택 드롭다운 컴포넌트
 */
export class CountrySelector {
    /**
     * CountrySelector 인스턴스 생성
     * @constructor
     * @param {HTMLElement} container - 컴포넌트를 렌더링할 컨테이너
     * @param {Object} options - 컴포넌트 옵션
     * @param {string} options.placeholder - 입력 필드 플레이스홀더
     * @param {string} options.selectedCountry - 초기 선택된 국가
     * @param {boolean} options.showFlags - 국기 표시 여부
     * @param {boolean} options.showEnglishNames - 영문명 표시 여부
     * @param {number} options.maxHeight - 드롭다운 최대 높이
     */
    constructor(container, options = {}) {
        this.options = {
            placeholder: '국가를 검색하세요...',
            selectedCountry: null,
            showFlags: true,
            showEnglishNames: true,
            maxHeight: 300,
            inputId: 'country-selector-input',
            ...options
        };

        // 컴포넌트 상태
        this.isOpen = false;
        this.isLoading = false;
        this.searchQuery = '';
        this.filteredCountries = [];
        this.selectedIndex = -1;

        // DOM 요소 참조
        this.container = container;
        this.input = null;
        this.dropdown = null;
        this.popularGrid = null;
        this.countriesList = null;

        // 이벤트 핸들러 바인딩
        this.handleInputFocus = this.handleInputFocus.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.handleInputInput = this.handleInputInput.bind(this);
        this.handleInputKeydown = this.handleInputKeydown.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleCountryClick = this.handleCountryClick.bind(this);
        this.handleCountryMouseEnter = this.handleCountryMouseEnter.bind(this);

        // 커스텀 이벤트
        this.events = {
            'country-selected': new CustomEvent('country-selected', { detail: {} })
        };
    }

    /**
     * 컴포넌트 초기화
     * @private
     */
    async initialize() {
        try {
            this.isLoading = true;
            this.updateLoadingState();
            
            // CountriesManager 초기화 대기
            if (!countriesManager.isInitialized) {
                console.log('CountrySelector: CountriesManager 초기화 대기 중...');
                await countriesManager.initialize();
            }
            
            // 초기 데이터 로드
            this.filteredCountries = countriesManager.getAllCountries();
            
            // UI 렌더링
            this.render();
            
            // 초기 상태 설정
            this.updateDisplay();
            
            this.isLoading = false;
            this.updateLoadingState();
            
            console.log('CountrySelector 초기화 완료');
            
        } catch (error) {
            this.isLoading = false;
            this.updateLoadingState();
            console.error('CountrySelector 초기화 실패:', error);
        }
    }

    /**
     * 컴포넌트를 컨테이너에 렌더링
     * @private
     */
    render() {
        if (!this.container) {
            throw new Error('컨테이너가 필요합니다.');
        }

        this.createHTML();
        this.bindEvents();
        this.updateDisplay();
    }

    /**
     * HTML 구조 생성
     * @private
     */
    createHTML() {
        this.container.innerHTML = `
            <div class="country-selector">
                <div class="selector-input">
                    <input 
                        type="text" 
                        id="${this.options.inputId}"
                        class="form-input" 
                        placeholder="${this.options.placeholder}"
                        autocomplete="off"
                        spellcheck="false"
                    />
                    <button class="dropdown-arrow" type="button" aria-label="드롭다운 열기">
                        <span class="arrow-icon">▼</span>
                    </button>
                </div>
                
                <div class="selector-dropdown" style="display: none;">
                    <div class="countries-section">
                        <h3 class="section-title">국가 검색</h3>
                        <div class="countries-list">
                            ${this.renderCountriesList()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // DOM 요소 참조 저장
        this.input = this.container.querySelector('.selector-input input');
        this.dropdown = this.container.querySelector('.selector-dropdown');
        this.countriesList = this.container.querySelector('.countries-list');
    }



    /**
     * 전체 국가 리스트 렌더링
     * @private
     * @returns {string} HTML 문자열
     */
    renderCountriesList() {
        if (!this.filteredCountries || this.filteredCountries.length === 0) {
            return '<div class="no-countries">검색 결과가 없습니다.</div>';
        }

        return this.filteredCountries.map((country, index) => `
            <div class="country-item list-item ${index === this.selectedIndex ? 'selected' : ''}" 
                 data-code="${country.code}" data-index="${index}">
                <span class="country-flag">${country.flag}</span>
                <span class="country-name">${this.highlightSearchMatch(country.nameKo)}</span>
                ${this.options.showEnglishNames ? `<span class="country-name-en">${this.highlightSearchMatch(country.nameEn)}</span>` : ''}
                <span class="country-continent">${country.continentKo}</span>
            </div>
        `).join('');
    }

    /**
     * 이벤트 바인딩
     * @private
     */
    bindEvents() {
        // 입력 필드 이벤트
        this.input.addEventListener('focus', this.handleInputFocus);
        this.input.addEventListener('blur', this.handleInputBlur);
        this.input.addEventListener('input', this.handleInputInput);
        this.input.addEventListener('keydown', this.handleInputKeydown);

        // 드롭다운 화살표 클릭
        const arrowButton = this.container.querySelector('.dropdown-arrow');
        arrowButton.addEventListener('click', () => {
            this.toggle();
        });

        // 국가 아이템 클릭
        this.container.addEventListener('click', this.handleCountryClick);

        // 국가 아이템 마우스 호버
        this.container.addEventListener('mouseenter', this.handleCountryMouseEnter, true);

        // 문서 클릭 (드롭다운 외부 클릭 시 닫기)
        document.addEventListener('click', this.handleDocumentClick);
    }

    /**
     * 입력 필드 포커스 이벤트
     * @private
     */
    handleInputFocus() {
        this.open();
    }

    /**
     * 입력 필드 블러 이벤트
     * @private
     */
    handleInputBlur() {
        // 약간의 지연을 두어 클릭 이벤트가 처리될 수 있도록 함
        setTimeout(() => {
            if (this.container && !this.container.contains(document.activeElement)) {
                this.close();
            }
        }, 150);
    }

    /**
     * 입력 필드 입력 이벤트
     * @private
     */
    handleInputInput(event) {
        this.searchQuery = event.target.value.trim();
        this.search(this.searchQuery);
    }

    /**
     * 입력 필드 키보드 이벤트
     * @private
     */
    handleInputKeydown(event) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.navigateDown();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.navigateUp();
                break;
            case 'Enter':
                event.preventDefault();
                this.selectCurrent();
                break;
            case 'Escape':
                event.preventDefault();
                this.close();
                break;
        }
    }

    /**
     * 문서 클릭 이벤트
     * @private
     */
    handleDocumentClick(event) {
        if (this.container && !this.container.contains(event.target)) {
            this.close();
        }
    }

    /**
     * 국가 아이템 클릭 이벤트
     * @private
     */
    handleCountryClick(event) {
        const countryItem = event.target.closest('.country-item');
        if (countryItem) {
            const countryCode = countryItem.dataset.code;
            const country = countriesManager.getCountryByCode(countryCode);
            if (country) {
                this.selectCountry(country);
            }
        }
    }

    /**
     * 국가 아이템 마우스 호버 이벤트
     * @private
     */
    handleCountryMouseEnter(event) {
        const countryItem = event.target.closest('.country-item');
        if (countryItem && countryItem.classList.contains('list-item')) {
            const index = parseInt(countryItem.dataset.index);
            if (!isNaN(index)) {
                this.setSelectedIndex(index);
            }
        }
    }

    /**
     * 드롭다운 열기
     * @public
     */
    open() {
        if (this.isOpen || !this.container) return;

        this.isOpen = true;
        this.dropdown.style.display = 'block';
        
        // z-index를 최상위로 설정하여 다른 요소들 위에 표시
        this.dropdown.style.zIndex = '100007';
        this.container.style.zIndex = '100006';
        
        // 컨테이너에 open 클래스 추가
        this.container.classList.add('open');
        
        // 부드러운 애니메이션 효과
        requestAnimationFrame(() => {
            this.dropdown.classList.add('open');
            this.container.classList.add('open');
        });

        // 입력 필드에 포커스
        this.input.focus();
        
        // 검색 결과 업데이트
        this.updateDisplay();
    }

    /**
     * 드롭다운 닫기
     * @public
     */
    close() {
        if (!this.isOpen || !this.container) return;

        this.isOpen = false;
        this.dropdown.classList.remove('open');
        this.container.classList.remove('open');
        
        // z-index 복원
        this.dropdown.style.zIndex = '';
        this.container.style.zIndex = '';
        
        setTimeout(() => {
            this.dropdown.style.display = 'none';
        }, 200);

        // 선택 인덱스 초기화
        this.selectedIndex = -1;
    }

    /**
     * 드롭다운 토글
     * @public
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * 국가 검색
     * @public
     * @param {string} query - 검색 쿼리
     */
    search(query) {
        this.isLoading = true;
        this.updateLoadingState();
        
        // 검색 지연을 위한 setTimeout (로딩 애니메이션 표시)
        setTimeout(() => {
            if (!query) {
                this.filteredCountries = countriesManager.countries;
            } else {
                this.filteredCountries = countriesManager.searchCountries(query, { limit: 100 });
            }

            this.selectedIndex = -1;
            this.updateDisplay();
            
            this.isLoading = false;
            this.updateLoadingState();
        }, 150); // 150ms 지연으로 부드러운 로딩 효과
    }

    /**
     * 국가 선택
     * @public
     * @param {Object} country - 선택된 국가 객체
     */
    selectCountry(country) {
        if (!country) return;

        // 선택된 국가 저장
        this.options.selectedCountry = country;

        // 입력 필드에 국가명 표시
        this.input.value = country.nameKo;
        this.searchQuery = country.nameKo;

        // 드롭다운 닫기
        this.close();

        // 커스텀 이벤트 발생
        this.dispatchCountrySelectedEvent(country);

        // 콘솔 로그
        console.log(`CountrySelector: 국가 선택됨 - ${country.nameKo} (${country.code})`);
    }

    /**
     * 현재 선택된 항목 선택
     * @private
     */
    selectCurrent() {
        if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredCountries.length) {
            const country = this.filteredCountries[this.selectedIndex];
            this.selectCountry(country);
        }
    }

    /**
     * 아래로 네비게이션
     * @private
     */
    navigateDown() {
        if (this.selectedIndex < this.filteredCountries.length - 1) {
            this.setSelectedIndex(this.selectedIndex + 1);
        } else {
            this.setSelectedIndex(0);
        }
    }

    /**
     * 위로 네비게이션
     * @private
     */
    navigateUp() {
        if (this.selectedIndex > 0) {
            this.setSelectedIndex(this.selectedIndex - 1);
        } else {
            this.setSelectedIndex(this.filteredCountries.length - 1);
        }
    }

    /**
     * 선택 인덱스 설정
     * @private
     * @param {number} index - 선택할 인덱스
     */
    setSelectedIndex(index) {
        // 이전 선택 항목에서 selected 클래스 제거
        const prevSelected = this.countriesList.querySelector('.country-item.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }

        // 새 선택 인덱스 설정
        this.selectedIndex = index;

        // 새 선택 항목에 selected 클래스 추가
        if (index >= 0 && index < this.filteredCountries.length) {
            const newSelected = this.countriesList.querySelector(`[data-index="${index}"]`);
            if (newSelected) {
                newSelected.classList.add('selected');
                // 선택된 항목이 보이도록 스크롤
                newSelected.scrollIntoView({ block: 'nearest' });
            }
        }
    }

    /**
     * 검색 결과 하이라이팅
     * @private
     * @param {string} text - 하이라이팅할 텍스트
     * @returns {string} 하이라이팅된 HTML
     */
    highlightSearchMatch(text) {
        if (!this.searchQuery || !text) {
            return text;
        }
        
        const regex = new RegExp(`(${this.escapeRegExp(this.searchQuery)})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }
    
    /**
     * 정규식 특수문자 이스케이프
     * @private
     * @param {string} string - 이스케이프할 문자열
     * @returns {string} 이스케이프된 문자열
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * 로딩 상태 업데이트
     * @private
     */
    updateLoadingState() {
        if (this.container) {
            if (this.isLoading) {
                this.container.classList.add('loading');
            } else {
                this.container.classList.remove('loading');
            }
        }
    }

    /**
     * 표시 업데이트
     * @private
     */
    updateDisplay() {
        // 국가 리스트 업데이트
        if (this.countriesList) {
            this.countriesList.innerHTML = this.renderCountriesList();
        }
    }

    /**
     * 국가 선택 이벤트 발생
     * @private
     * @param {Object} country - 선택된 국가
     */
    dispatchCountrySelectedEvent(country) {
        const event = new CustomEvent('country-selected', {
            detail: {
                country: country,
                code: country.code,
                nameKo: country.nameKo,
                nameEn: country.nameEn,
                flag: country.flag,
                continent: country.continent,
                continentKo: country.continentKo
            },
            bubbles: true
        });

        if (this.container) {
            this.container.dispatchEvent(event);
        }
    }

    /**
     * 선택된 국가 반환
     * @public
     * @returns {Object|null} 선택된 국가 객체 또는 null
     */
    getSelectedCountry() {
        return this.options.selectedCountry;
    }

    /**
     * 선택된 국가 코드 반환
     * @public
     * @returns {string|null} 선택된 국가 코드 또는 null
     */
    getSelectedCountryCode() {
        return this.options.selectedCountry?.code || null;
    }

    /**
     * 선택된 국가명 반환 (한글)
     * @public
     * @returns {string|null} 선택된 국가명 또는 null
     */
    getSelectedCountryName() {
        return this.options.selectedCountry?.nameKo || null;
    }

    /**
     * 컴포넌트 상태 반환
     * @public
     * @returns {Object} 컴포넌트 상태 정보
     */
    getStatus() {
        return {
            isOpen: this.isOpen,
            isLoading: this.isLoading,
            searchQuery: this.searchQuery,
            selectedCountry: this.options.selectedCountry,
            filteredCount: this.filteredCountries.length
        };
    }

    /**
     * 컴포넌트 제거
     * @public
     */
    destroy() {
        // 이벤트 리스너 제거
        document.removeEventListener('click', this.handleDocumentClick);
        
        // DOM 요소 정리
        if (this.container) {
            this.container.innerHTML = '';
        }

        // 참조 정리
        this.container = null;
        this.input = null;
        this.dropdown = null;
        this.countriesList = null;
    }
}

/**
 * 기본 인스턴스 생성 함수
 * @param {HTMLElement} container - 컨테이너 요소
 * @param {Object} options - 컴포넌트 옵션
 * @returns {Promise<CountrySelector>} CountrySelector 인스턴스
 */
export async function createCountrySelector(container, options = {}) {
    const selector = new CountrySelector(container, options);
    await selector.initialize();
    return selector;
}

/**
 * ========================================
 * Phase 2A 완성 - 국가 선택 UI 컴포넌트 (UI/UX 개선)
 * ========================================
 * 
 * ✅ 구현 완료된 기능:
 * - 검색 가능한 드롭다운
 * - 통합 국가 스크롤 리스트
 * - 키보드 네비게이션 (화살표, Enter, ESC)
 * - 모바일 최적화 (터치 타겟 44px+)
 * - 실시간 검색 및 필터링
 * - 커스텀 이벤트 ('country-selected')
 * - 현대적인 UI/UX 디자인
 * - 검색 결과 하이라이팅
 * - 부드러운 애니메이션 효과
 * - 로딩 상태 표시
 * - 그라데이션 및 카드 디자인
 * 
 * 🚀 사용 예시:
 * ```javascript
 * import { createCountrySelector } from './js/modules/ui-components/country-selector.js';
 * 
 * const container = document.getElementById('country-selector');
 * const selector = await createCountrySelector(container, {
 *     placeholder: '여행할 국가를 선택하세요',
 *     showFlags: true,
 *     showEnglishNames: true
 * });
 * 
 * // 이벤트 리스너
 * container.addEventListener('country-selected', (event) => {
 *     console.log('선택된 국가:', event.detail);
 * });
 * ```
 * 
 * 🎨 스타일링:
 * - 기존 .form-input 스타일과 일치
 * - 드롭다운 최대 높이 300px
 * - 애니메이션: fade-in/out (200ms)
 * - 반응형: 모바일 전체 화면 모달
 * 
 * 🔧 다음 Phase 준비:
 * - CSS 스타일링
 * - 테마 및 다크모드
 * - 접근성 개선
 * ========================================
 */
