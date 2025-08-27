/**
 * 국가 선택 UI 컴포넌트
 * 완전히 독립적인 모듈로 기존 코드에 영향을 주지 않음
 * 검색, 필터링, 다중 선택 기능 제공
 * 
 * @author TravelLog System
 * @version 1.0.0
 */

import { countryDataManager } from '../utils/country-data-manager.js';

export class CountrySelector {
    constructor(options = {}) {
        this.options = {
            multiple: options.multiple || false,
            placeholder: options.placeholder || '국가를 선택하세요',
            maxSelections: options.maxSelections || 10,
            showFlags: options.showFlags !== false,
            showCodes: options.showCodes !== false,
            searchable: options.searchable !== false,
            filterable: options.filterable !== false,
            onSelectionChange: options.onSelectionChange || null,
            onSearch: options.onSearch || null,
            ...options
        };

        // 상태 관리
        this.selectedCountries = new Set();
        this.isOpen = false;
        this.searchQuery = '';
        this.filterRegion = '';
        this.filteredCountries = [];
        
        // DOM 요소 참조
        this.container = null;
        this.trigger = null;
        this.dropdown = null;
        this.searchInput = null;
        this.countryList = null;
        this.selectedDisplay = null;
        
        // 이벤트 리스너
        this.eventListeners = [];
        
        // 검색 디바운싱
        this.searchTimeout = null;
    }

    /**
     * 컴포넌트를 DOM에 렌더링
     * @param {HTMLElement|string} target - 렌더링할 대상 요소 또는 선택자
     * @returns {HTMLElement} 생성된 컨테이너 요소
     */
    render(target) {
        try {
            // 대상 요소 확인
            if (typeof target === 'string') {
                this.container = document.querySelector(target);
            } else {
                this.container = target;
            }

            if (!this.container) {
                throw new Error('대상 요소를 찾을 수 없습니다.');
            }

            // HTML 생성
            this.container.innerHTML = this.generateHTML();
            
            // DOM 요소 참조 설정
            this.setupElementReferences();
            
            // 이벤트 바인딩
            this.bindEvents();
            
            // 초기 데이터 로드
            this.initializeData();
            
            return this.container;

        } catch (error) {
            console.error('CountrySelector 렌더링 실패:', error);
            this.showErrorFallback();
        }
    }

    /**
     * HTML 생성
     */
    generateHTML() {
        const multipleAttr = this.options.multiple ? 'multiple' : '';
        const searchableClass = this.options.searchable ? 'searchable' : '';
        const filterableClass = this.options.filterable ? 'filterable' : '';

        return `
            <div class="country-selector ${searchableClass} ${filterableClass}" data-multiple="${this.options.multiple}">
                <!-- 선택된 국가 표시 영역 -->
                <div class="country-selector-trigger" tabindex="0">
                    <div class="selected-countries-display" id="selected-countries-display">
                        <span class="placeholder">${this.options.placeholder}</span>
                    </div>
                    <div class="country-selector-arrow">▼</div>
                </div>

                <!-- 드롭다운 메뉴 -->
                <div class="country-selector-dropdown" id="country-selector-dropdown" style="display: none;">
                    <!-- 검색 영역 -->
                    ${this.options.searchable ? `
                        <div class="country-search-section">
                            <div class="search-input-wrapper">
                                <input 
                                    type="text" 
                                    class="country-search-input" 
                                    id="country-search-input"
                                    placeholder="국가명, 코드로 검색..."
                                    autocomplete="off"
                                >
                                <div class="search-icon">🔍</div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- 필터 영역 -->
                    ${this.options.filterable ? `
                        <div class="country-filter-section">
                            <div class="region-filter">
                                <label class="filter-label">대륙별 필터:</label>
                                <select class="region-select" id="region-filter">
                                    <option value="">모든 대륙</option>
                                    <option value="asia">아시아</option>
                                    <option value="europe">유럽</option>
                                    <option value="americas">아메리카</option>
                                    <option value="africa">아프리카</option>
                                    <option value="oceania">오세아니아</option>
                                </select>
                            </div>
                        </div>
                    ` : ''}

                    <!-- 국가 목록 -->
                    <div class="country-list-container">
                        <div class="country-list" id="country-list">
                            <div class="loading-indicator">로딩 중...</div>
                        </div>
                    </div>

                    <!-- 선택된 국가 요약 -->
                    ${this.options.multiple ? `
                        <div class="selection-summary">
                            <span class="selected-count">0</span>개 선택됨
                            <button class="clear-selection-btn" id="clear-selection-btn">모두 해제</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * DOM 요소 참조 설정
     */
    setupElementReferences() {
        this.trigger = this.container.querySelector('.country-selector-trigger');
        this.dropdown = this.container.querySelector('#country-selector-dropdown');
        this.searchInput = this.container.querySelector('#country-search-input');
        this.countryList = this.container.querySelector('#country-list');
        this.selectedDisplay = this.container.querySelector('#selected-countries-display');
        
        if (this.options.multiple) {
            this.selectedDisplay = this.container.querySelector('#selected-countries-display');
        }
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        try {
            // 트리거 클릭 이벤트
            this.addEventListener(this.trigger, 'click', this.toggleDropdown.bind(this));
            this.addEventListener(this.trigger, 'keydown', this.handleTriggerKeydown.bind(this));

            // 외부 클릭 감지
            document.addEventListener('click', this.handleOutsideClick.bind(this));

            // 검색 입력 이벤트
            if (this.searchInput) {
                this.addEventListener(this.searchInput, 'input', this.handleSearchInput.bind(this));
                this.addEventListener(this.searchInput, 'keydown', this.handleSearchKeydown.bind(this));
            }

            // 지역 필터 이벤트
            const regionFilter = this.container.querySelector('#region-filter');
            if (regionFilter) {
                this.addEventListener(regionFilter, 'change', this.handleRegionFilter.bind(this));
            }

            // 모두 해제 버튼 이벤트
            const clearBtn = this.container.querySelector('#clear-selection-btn');
            if (clearBtn) {
                this.addEventListener(clearBtn, 'click', this.clearAllSelections.bind(this));
            }

        } catch (error) {
            console.error('CountrySelector 이벤트 바인딩 실패:', error);
        }
    }

    /**
     * 이벤트 리스너 등록 (메모리 누수 방지)
     */
    addEventListener(element, event, handler) {
        if (element && event && handler) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    /**
     * 초기 데이터 로드
     */
    async initializeData() {
        try {
            // 국가 데이터 매니저 초기화 대기
            await this.waitForCountryData();
            
            // 초기 국가 목록 렌더링
            this.renderCountryList();
            
        } catch (error) {
            console.error('CountrySelector 데이터 초기화 실패:', error);
            this.showErrorState();
        }
    }

    /**
     * 국가 데이터 로드 대기
     */
    async waitForCountryData() {
        let attempts = 0;
        const maxAttempts = 50; // 최대 5초 대기
        
        while (!countryDataManager.isInitialized && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!countryDataManager.isInitialized) {
            throw new Error('국가 데이터 로드 시간 초과');
        }
    }

    /**
     * 드롭다운 토글
     */
    toggleDropdown() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.showDropdown();
            this.focusSearchInput();
        } else {
            this.hideDropdown();
        }
    }

    /**
     * 드롭다운 표시
     */
    showDropdown() {
        this.dropdown.style.display = 'block';
        this.trigger.classList.add('active');
        this.trigger.setAttribute('aria-expanded', 'true');
        
        // 검색 입력에 포커스
        this.focusSearchInput();
    }

    /**
     * 드롭다운 숨김
     */
    hideDropdown() {
        this.dropdown.style.display = 'none';
        this.trigger.classList.remove('active');
        this.trigger.setAttribute('aria-expanded', 'false');
        
        // 검색 입력에서 포커스 제거
        if (this.searchInput) {
            this.searchInput.blur();
        }
    }

    /**
     * 검색 입력에 포커스
     */
    focusSearchInput() {
        if (this.searchInput && this.options.searchable) {
            setTimeout(() => {
                this.searchInput.focus();
                this.searchInput.select();
            }, 100);
        }
    }

    /**
     * 검색 입력 처리
     */
    handleSearchInput(event) {
        const query = event.target.value.trim();
        
        // 디바운싱 적용
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.searchQuery = query;
            this.performSearch();
        }, 300);
    }

    /**
     * 검색 실행
     */
    performSearch() {
        try {
            if (this.searchQuery.length < 2) {
                this.filteredCountries = countryDataManager.getAllCountries();
            } else {
                this.filteredCountries = countryDataManager.searchCountries(this.searchQuery, 50);
            }
            
            // 지역 필터 적용
            this.applyFilters();
            
            // 검색 결과 렌더링
            this.renderCountryList();
            
            // 검색 콜백 실행
            if (this.options.onSearch) {
                this.options.onSearch(this.searchQuery, this.filteredCountries);
            }
            
        } catch (error) {
            console.error('검색 실행 실패:', error);
        }
    }

    /**
     * 지역 필터 처리
     */
    handleRegionFilter(event) {
        this.filterRegion = event.target.value;
        this.applyFilters();
        this.renderCountryList();
    }

    /**
     * 필터 적용
     */
    applyFilters() {
        if (!this.filterRegion) {
            return; // 지역 필터가 없으면 검색 결과 그대로 사용
        }
        
        this.filteredCountries = this.filteredCountries.filter(country => 
            country.region === this.filterRegion
        );
    }

    /**
     * 국가 목록 렌더링
     */
    renderCountryList() {
        try {
            const countries = this.filteredCountries.length > 0 ? 
                this.filteredCountries : countryDataManager.getAllCountries();
            
            if (countries.length === 0) {
                this.countryList.innerHTML = `
                    <div class="no-results">
                        <div class="no-results-icon">🔍</div>
                        <div class="no-results-text">검색 결과가 없습니다</div>
                    </div>
                `;
                return;
            }

            const countryItems = countries.map(country => this.renderCountryItem(country)).join('');
            
            this.countryList.innerHTML = countryItems;
            
            // 국가 항목 이벤트 바인딩
            this.bindCountryItemEvents();
            
        } catch (error) {
            console.error('국가 목록 렌더링 실패:', error);
        }
    }

    /**
     * 개별 국가 항목 렌더링
     */
    renderCountryItem(country) {
        const isSelected = this.selectedCountries.has(country.code);
        const selectedClass = isSelected ? 'selected' : '';
        const flagDisplay = this.options.showFlags ? `<span class="country-flag">${country.flag}</span>` : '';
        const codeDisplay = this.options.showCodes ? `<span class="country-code">${country.code}</span>` : '';
        
        return `
            <div class="country-item ${selectedClass}" data-country-code="${country.code}">
                <div class="country-item-content">
                    ${flagDisplay}
                    <div class="country-info">
                        <div class="country-name-ko">${country.nameKo}</div>
                        <div class="country-name-en">${country.nameEn}</div>
                    </div>
                    ${codeDisplay}
                </div>
                ${this.options.multiple ? `
                    <div class="country-checkbox">
                        <input type="checkbox" ${isSelected ? 'checked' : ''} 
                               id="country-${country.code}">
                        <label for="country-${country.code}"></label>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * 국가 항목 이벤트 바인딩
     */
    bindCountryItemEvents() {
        const countryItems = this.countryList.querySelectorAll('.country-item');
        
        countryItems.forEach(item => {
            this.addEventListener(item, 'click', (event) => {
                // 체크박스 클릭은 무시 (체크박스 자체에서 처리)
                if (event.target.type === 'checkbox' || event.target.tagName === 'LABEL') {
                    return;
                }
                
                const countryCode = item.dataset.countryCode;
                this.toggleCountrySelection(countryCode);
            });
        });

        // 체크박스 이벤트
        const checkboxes = this.countryList.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            this.addEventListener(checkbox, 'change', (event) => {
                const countryCode = event.target.id.replace('country-', '');
                this.toggleCountrySelection(countryCode);
            });
        });
    }

    /**
     * 국가 선택 토글
     */
    toggleCountrySelection(countryCode) {
        try {
            if (this.options.multiple) {
                // 다중 선택 모드
                if (this.selectedCountries.has(countryCode)) {
                    this.selectedCountries.delete(countryCode);
                } else {
                    if (this.selectedCountries.size >= this.options.maxSelections) {
                        this.showToast(`최대 ${this.options.maxSelections}개까지 선택할 수 있습니다.`);
                        return;
                    }
                    this.selectedCountries.add(countryCode);
                }
            } else {
                // 단일 선택 모드
                this.selectedCountries.clear();
                this.selectedCountries.add(countryCode);
                this.hideDropdown();
            }
            
            // UI 업데이트
            this.updateSelectionDisplay();
            this.updateCountryListSelection();
            
            // 선택 변경 콜백 실행
            if (this.options.onSelectionChange) {
                const selectedCountries = Array.from(this.selectedCountries).map(code => 
                    countryDataManager.getCountryByCode(code)
                ).filter(Boolean);
                
                this.options.onSelectionChange(selectedCountries, this.selectedCountries);
            }
            
        } catch (error) {
            console.error('국가 선택 토글 실패:', error);
        }
    }

    /**
     * 선택 표시 업데이트
     */
    updateSelectionDisplay() {
        if (!this.selectedDisplay) return;
        
        if (this.selectedCountries.size === 0) {
            this.selectedDisplay.innerHTML = `<span class="placeholder">${this.options.placeholder}</span>`;
            return;
        }
        
        if (this.options.multiple) {
            // 다중 선택: 선택된 국가들 표시
            const selectedCountries = Array.from(this.selectedCountries).map(code => 
                countryDataManager.getCountryByCode(code)
            ).filter(Boolean);
            
            const displayItems = selectedCountries.map(country => 
                `<span class="selected-country-tag">
                    ${this.options.showFlags ? country.flag : ''}
                    ${country.nameKo}
                    <button class="remove-country" data-code="${country.code}">×</button>
                </span>`
            ).join('');
            
            this.selectedDisplay.innerHTML = displayItems;
            
            // 제거 버튼 이벤트 바인딩
            this.bindRemoveButtons();
            
        } else {
            // 단일 선택: 선택된 국가 표시
            const countryCode = Array.from(this.selectedCountries)[0];
            const country = countryDataManager.getCountryByCode(countryCode);
            
            if (country) {
                this.selectedDisplay.innerHTML = `
                    <span class="selected-country">
                        ${this.options.showFlags ? country.flag : ''}
                        ${country.nameKo}
                    </span>
                `;
            }
        }
        
        // 선택 요약 업데이트
        this.updateSelectionSummary();
    }

    /**
     * 제거 버튼 이벤트 바인딩
     */
    bindRemoveButtons() {
        const removeButtons = this.selectedDisplay.querySelectorAll('.remove-country');
        removeButtons.forEach(button => {
            this.addEventListener(button, 'click', (event) => {
                event.stopPropagation();
                const countryCode = button.dataset.code;
                this.selectedCountries.delete(countryCode);
                this.updateSelectionDisplay();
                this.updateCountryListSelection();
                
                // 선택 변경 콜백 실행
                if (this.options.onSelectionChange) {
                    const selectedCountries = Array.from(this.selectedCountries).map(code => 
                        countryDataManager.getCountryByCode(code)
                    ).filter(Boolean);
                    
                    this.options.onSelectionChange(selectedCountries, this.selectedCountries);
                }
            });
        });
    }

    /**
     * 국가 목록 선택 상태 업데이트
     */
    updateCountryListSelection() {
        const countryItems = this.countryList.querySelectorAll('.country-item');
        
        countryItems.forEach(item => {
            const countryCode = item.dataset.countryCode;
            const isSelected = this.selectedCountries.has(countryCode);
            
            item.classList.toggle('selected', isSelected);
            
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = isSelected;
            }
        });
    }

    /**
     * 선택 요약 업데이트
     */
    updateSelectionSummary() {
        const summaryElement = this.container.querySelector('.selection-summary .selected-count');
        if (summaryElement) {
            summaryElement.textContent = this.selectedCountries.size;
        }
    }

    /**
     * 모든 선택 해제
     */
    clearAllSelections() {
        this.selectedCountries.clear();
        this.updateSelectionDisplay();
        this.updateCountryListSelection();
        
        // 선택 변경 콜백 실행
        if (this.options.onSelectionChange) {
            this.options.onSelectionChange([], this.selectedCountries);
        }
    }

    /**
     * 선택된 국가 코드 배열 반환
     */
    getSelectedCountryCodes() {
        return Array.from(this.selectedCountries);
    }

    /**
     * 선택된 국가 객체 배열 반환
     */
    getSelectedCountries() {
        return Array.from(this.selectedCountries).map(code => 
            countryDataManager.getCountryByCode(code)
        ).filter(Boolean);
    }

    /**
     * 특정 국가 선택 상태 확인
     */
    isCountrySelected(countryCode) {
        return this.selectedCountries.has(countryCode);
    }

    /**
     * 선택된 국가 설정 (외부에서 호출)
     */
    setSelectedCountries(countryCodes) {
        this.selectedCountries.clear();
        
        if (Array.isArray(countryCodes)) {
            countryCodes.forEach(code => {
                if (countryDataManager.getCountryByCode(code)) {
                    this.selectedCountries.add(code);
                }
            });
        }
        
        this.updateSelectionDisplay();
        this.updateCountryListSelection();
    }

    /**
     * 키보드 이벤트 처리
     */
    handleTriggerKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.toggleDropdown();
        } else if (event.key === 'Escape') {
            this.hideDropdown();
        }
    }

    handleSearchKeydown(event) {
        if (event.key === 'Escape') {
            this.hideDropdown();
        }
    }

    /**
     * 외부 클릭 감지
     */
    handleOutsideClick(event) {
        if (!this.container.contains(event.target)) {
            this.hideDropdown();
        }
    }

    /**
     * 토스트 메시지 표시
     */
    showToast(message) {
        try {
            const toast = document.createElement('div');
            toast.className = 'country-selector-toast';
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
            console.error('토스트 메시지 표시 실패:', error);
        }
    }

    /**
     * 에러 상태 표시
     */
    showErrorState() {
        this.countryList.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <div class="error-text">국가 데이터를 불러올 수 없습니다</div>
                <button class="retry-btn" onclick="location.reload()">다시 시도</button>
            </div>
        `;
    }

    /**
     * 에러 폴백 표시
     */
    showErrorFallback() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="country-selector-error">
                    <div class="error-icon">⚠️</div>
                    <div class="error-title">국가 선택기를 불러올 수 없습니다</div>
                    <div class="error-description">페이지를 새로고침해주세요.</div>
                </div>
            `;
        }
    }

    /**
     * 컴포넌트 정리
     */
    cleanup() {
        try {
            // 이벤트 리스너 제거
            this.eventListeners.forEach(listener => {
                if (listener.element && listener.element.removeEventListener) {
                    listener.element.removeEventListener(listener.event, listener.handler);
                }
            });
            
            this.eventListeners = [];
            
            // 검색 타임아웃 클리어
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            
            // 상태 초기화
            this.selectedCountries.clear();
            this.isOpen = false;
            this.searchQuery = '';
            this.filterRegion = '';
            this.filteredCountries = [];
            
            // DOM 참조 클리어
            this.container = null;
            this.trigger = null;
            this.dropdown = null;
            this.searchInput = null;
            this.countryList = null;
            this.selectedDisplay = null;
            
        } catch (error) {
            console.error('CountrySelector 정리 실패:', error);
        }
    }
}

// 전역에서 사용할 수 있도록 내보내기
export default CountrySelector;
