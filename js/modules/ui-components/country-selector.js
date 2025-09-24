/**
 * CountrySelector - 통합 스타일 시스템
 * DOM 구조와 CSS 완전 통합
 * 
 * @version 2.0.0
 * @since 2024-01-15
 * @author REDIPX
 */

import { countriesManager } from '../../data/countries-manager.js';

export class CountrySelector {
    constructor(container, options = {}) {
        if (!container) {
            throw new Error('CountrySelector: container is required');
        }
        
        this.container = container;
        this.options = {
            placeholder: '국가를 검색하세요...',
            maxResults: 50,
            ...options
        };

        this.isOpen = false;
        this.portal = null;
        this.dropdown = null;
        this.input = null;
        this.arrow = null;
        this.selectedIndex = -1;
        this.filteredCountries = [];
        this.eventListeners = new Map();
        
        this.init();
    }
    
    /**
     * 초기화
     */
    async init() {
        try {
            this.createInput();
            this.createPortal();
            this.bindEvents();
            await this.initializeData();
            console.log('CountrySelector 초기화 완료');
        } catch (error) {
            console.error('CountrySelector 초기화 실패:', error);
            throw error;
        }
    }
    
    /**
     * 데이터 초기화
     */
    async initializeData() {
        try {
            // CountriesManager 강제 초기화
            if (!countriesManager.isInitialized) {
                await countriesManager.initialize();
            }
            
            // 초기 데이터 로드 - 전체 국가 목록
            this.filteredCountries = countriesManager.countries || [];
            
            // UI 업데이트
            this.updateDropdownContent();
            
        } catch (error) {
            console.error('CountrySelector: 데이터 초기화 실패:', error);
            
            // 폴백 데이터 제공
            this.filteredCountries = this.getFallbackCountries();
            this.updateDropdownContent();
        }
    }

    /**
     * 폴백 데이터 (CountriesManager 실패 시)
     */
    getFallbackCountries() {
        return [
            { code: 'KR', nameKo: '대한민국', nameEn: 'South Korea', flag: '🇰🇷', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'JP', nameKo: '일본', nameEn: 'Japan', flag: '🇯🇵', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'CN', nameKo: '중국', nameEn: 'China', flag: '🇨🇳', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'US', nameKo: '미국', nameEn: 'United States', flag: '🇺🇸', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'GB', nameKo: '영국', nameEn: 'United Kingdom', flag: '🇬🇧', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'FR', nameKo: '프랑스', nameEn: 'France', flag: '🇫🇷', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'DE', nameKo: '독일', nameEn: 'Germany', flag: '🇩🇪', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'IT', nameKo: '이탈리아', nameEn: 'Italy', flag: '🇮🇹', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'ES', nameKo: '스페인', nameEn: 'Spain', flag: '🇪🇸', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'AU', nameKo: '호주', nameEn: 'Australia', flag: '🇦🇺', continent: 'Oceania', continentKo: '오세아니아', popular: true }
        ];
    }
    
    /**
     * 입력 필드 생성
     */
    createInput() {
        this.container.innerHTML = `
                <div class="selector-input">
                    <input 
                        type="text" 
                        class="form-input" 
                        placeholder="${this.options.placeholder}"
                        autocomplete="off"
                    aria-label="국가 선택"
                    role="combobox"
                    aria-expanded="false"
                    aria-haspopup="listbox"
                    />
                    <button class="dropdown-arrow" type="button" aria-label="드롭다운 열기">
                        <span class="arrow-icon">▼</span>
                    </button>
                </div>
        `;
        
        this.input = this.container.querySelector('input');
        this.arrow = this.container.querySelector('.dropdown-arrow');
        
        if (!this.input || !this.arrow) {
            throw new Error('CountrySelector: 입력 필드 생성 실패');
        }
    }
    
    /**
     * Portal 생성
     */
    createPortal() {
        // 기존 portal 제거
        const existingPortal = document.querySelector('.country-selector-portal');
        if (existingPortal) {
            existingPortal.remove();
        }
        
        // 새 portal 생성
        this.portal = document.createElement('div');
        this.portal.className = 'country-selector-portal';
        this.portal.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.portal);
        
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'selector-dropdown';
        this.dropdown.setAttribute('role', 'listbox');
        this.dropdown.setAttribute('aria-label', '국가 목록');
        this.dropdown.setAttribute('aria-hidden', 'true');
        this.portal.appendChild(this.dropdown);
    }
    
    /**
     * 드롭다운 내용 업데이트
     */
    updateDropdownContent() {
        if (!this.filteredCountries || this.filteredCountries.length === 0) {
            this.dropdown.innerHTML = `
                <div class="countries-section">
                    <div class="no-countries">검색 결과가 없습니다.</div>
                </div>
            `;
            return;
        }
        
        const content = `
                    <div class="countries-section">
                        <h3 class="section-title">국가 검색</h3>
                        <div class="countries-list">
                    ${this.filteredCountries.map((country, index) => `
                        <div class="country-item ${index === this.selectedIndex ? 'selected' : ''}" 
                             data-code="${country.code}" 
                             data-index="${index}"
                             role="option"
                             tabindex="0">
                            <span class="country-flag">${country.flag}</span>
                            <span class="country-name">${country.nameKo}</span>
                            <span class="country-name-en">${country.nameEn}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.dropdown.innerHTML = content;
    }
    
    /**
     * 드롭다운 열기
     */
    open() {
        if (this.isOpen) return;
        
        try {
            // 입력 필드 위치 계산
            const inputRect = this.input.getBoundingClientRect();
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            
            // 드롭다운 위치 설정
            this.dropdown.style.top = `${inputRect.bottom + scrollY + 4}px`;
            this.dropdown.style.left = `${inputRect.left}px`;
            this.dropdown.style.width = `${inputRect.width}px`;
            
            // 접근성 개선: 포털과 드롭다운의 aria-hidden을 false로 설정
            this.portal.setAttribute('aria-hidden', 'false');
            this.dropdown.setAttribute('aria-hidden', 'false');
            
            // 애니메이션을 위해 잠시 후 open 클래스 추가
            this.dropdown.style.display = 'block';
            
            requestAnimationFrame(() => {
                this.dropdown.classList.add('open');
            });
            
            this.container.classList.add('open');
            this.input.setAttribute('aria-expanded', 'true');
            this.isOpen = true;
            
            // 커스텀 이벤트 발생 (드롭다운 요소 전달)
            this.dispatchEvent('country-selector-open', { element: this.dropdown });
        } catch (error) {
            console.error('드롭다운 열기 실패:', error);
        }
    }
    
    /**
     * 드롭다운 닫기
     */
    close() {
        if (!this.isOpen) return;
        
        try {
            // 포커스를 입력 필드로 이동 (접근성 개선)
            if (this.input) {
                this.input.focus();
            }
            
            // 드롭다운 내부 요소들의 포커스 제거
            const focusedElement = document.activeElement;
            if (focusedElement && this.dropdown.contains(focusedElement)) {
                focusedElement.blur();
            }
            
            this.dropdown.classList.remove('open');
            this.container.classList.remove('open');
            this.input.setAttribute('aria-expanded', 'false');
            
            // 접근성 개선: 포털과 드롭다운의 aria-hidden을 true로 설정 (포커스가 제거된 후)
            this.portal.setAttribute('aria-hidden', 'true');
            this.dropdown.setAttribute('aria-hidden', 'true');
            
            setTimeout(() => {
                this.dropdown.style.display = 'none';
            }, 300);
            
            this.isOpen = false;
            this.selectedIndex = -1;
            
            // 커스텀 이벤트 발생 (드롭다운 요소 전달)
            this.dispatchEvent('country-selector-close', { element: this.dropdown });
        } catch (error) {
            console.error('드롭다운 닫기 실패:', error);
        }
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 입력 이벤트
        this.addEventListener(this.input, 'input', (e) => {
            this.search(e.target.value);
            if (!this.isOpen) this.open();
        });
        
        this.addEventListener(this.input, 'focus', () => {
            if (!this.isOpen) this.open();
        });
        
        this.addEventListener(this.input, 'keydown', (e) => {
            this.handleKeydown(e);
        });
        
        // 화살표 클릭
        this.addEventListener(this.arrow, 'click', (e) => {
            e.preventDefault();
            this.isOpen ? this.close() : this.open();
        });
        
        // 외부 클릭으로 닫기
        this.addEventListener(document, 'click', (e) => {
            if (!this.container.contains(e.target) && !this.portal.contains(e.target)) {
                this.close();
            }
        });
        
        // 드롭다운 아이템 클릭
        this.addEventListener(this.portal, 'click', (e) => {
            const item = e.target.closest('.country-item');
            if (item) {
                const code = item.dataset.code;
                const country = this.filteredCountries.find(c => c.code === code);
                if (country) {
                    this.selectCountry(country);
                }
            }
        });
        
        // 스크롤 시 위치 업데이트
        this.addEventListener(window, 'scroll', () => {
            if (this.isOpen) {
                this.updatePosition();
            }
        }, { passive: true });
        
        // 리사이즈 시 위치 업데이트
        this.addEventListener(window, 'resize', () => {
            if (this.isOpen) {
                this.updatePosition();
            }
        }, { passive: true });
    }
    
    /**
     * 키보드 이벤트 처리
     */
    handleKeydown(e) {
        if (!this.isOpen) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredCountries.length - 1);
                this.updateDropdownContent();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateDropdownContent();
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0 && this.filteredCountries[this.selectedIndex]) {
                    this.selectCountry(this.filteredCountries[this.selectedIndex]);
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                // 포커스를 입력 필드로 이동한 후 닫기
                if (this.input) {
                    this.input.focus();
                }
                this.close();
                break;
        }
    }

    /**
     * 위치 업데이트
     */
    updatePosition() {
        if (!this.isOpen) return;
        
        try {
            const inputRect = this.input.getBoundingClientRect();
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            
            this.dropdown.style.top = `${inputRect.bottom + scrollY + 4}px`;
            this.dropdown.style.left = `${inputRect.left}px`;
            this.dropdown.style.width = `${inputRect.width}px`;
        } catch (error) {
            console.error('위치 업데이트 실패:', error);
        }
    }

    /**
     * 국가 검색
     */
    search(query) {
        try {
            if (!query || query.trim().length === 0) {
                // 빈 검색어면 전체 목록 (최대 50개)
                if (countriesManager && countriesManager.isInitialized) {
                    this.filteredCountries = countriesManager.countries.slice(0, this.options.maxResults);
                } else {
                    this.filteredCountries = this.getFallbackCountries().slice(0, this.options.maxResults);
                }
            } else {
                // 검색 실행
                if (countriesManager && countriesManager.isInitialized) {
                    this.filteredCountries = countriesManager.searchCountries(query, { limit: this.options.maxResults });
                } else {
                    // CountriesManager가 초기화되지 않은 경우 폴백 검색
                    const fallbackCountries = this.getFallbackCountries();
                    const searchQuery = query.toLowerCase();
                    this.filteredCountries = fallbackCountries.filter(country =>
                        country.nameKo.toLowerCase().includes(searchQuery) ||
                        country.nameEn.toLowerCase().includes(searchQuery) ||
                        country.code.toLowerCase().includes(searchQuery)
                    );
                }
            }

            this.selectedIndex = -1;
            this.updateDropdownContent();
        } catch (error) {
            console.error('국가 검색 실패:', error);
            this.filteredCountries = this.getFallbackCountries();
            this.updateDropdownContent();
        }
    }

    /**
     * 국가 선택
     */
    selectCountry(country) {
        try {
            this.input.value = country.nameKo;
            
            // 포커스를 입력 필드로 이동한 후 닫기
            if (this.input) {
                this.input.focus();
            }
            
            this.close();

            // 커스텀 이벤트 발생
            this.dispatchEvent('country-selected', { 
                element: this.container,
                country: {
                    name: country.nameKo,
                    nameEn: country.nameEn,
                    code: country.code,
                    flag: country.flag
                }
            });
        } catch (error) {
            console.error('국가 선택 실패:', error);
        }
    }

    /**
     * 초기 데이터 로드 (deprecated - initializeData로 대체됨)
     */
    loadInitialData() {
        // 이 메서드는 initializeData로 대체되었습니다
    }
    
    /**
     * 이벤트 리스너 추가 (메모리 관리)
     */
    addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, []);
        }
        
        this.eventListeners.get(element).push({ event, handler, options });
    }
    
    /**
     * 커스텀 이벤트 발생
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
    
    /**
     * 값 설정
     */
    setValue(countryName) {
        if (this.input) {
            this.input.value = countryName || '';
        }
    }

    /**
     * 값 가져오기
     */
    getValue() {
        return this.input ? this.input.value : '';
    }
    
    /**
     * 리소스 정리
     */
    destroy() {
        try {
            // 이벤트 리스너 정리
            this.eventListeners.forEach((listeners, element) => {
                listeners.forEach(({ event, handler, options }) => {
                    element.removeEventListener(event, handler, options);
                });
            });
            this.eventListeners.clear();
            
            // Portal 제거
            if (this.portal) {
                this.portal.remove();
            }
            
            // 컨테이너 정리
        if (this.container) {
            this.container.innerHTML = '';
        }

            console.log('CountrySelector 리소스 정리 완료');
        } catch (error) {
            console.error('CountrySelector 리소스 정리 실패:', error);
        }
    }
}

/**
 * CountrySelector 인스턴스를 생성하는 팩토리 함수
 * @param {HTMLElement} container - 컨테이너 요소
 * @param {Object} options - 옵션 설정
 * @returns {Promise<CountrySelector>} CountrySelector 인스턴스
 */
export async function createCountrySelector(container, options = {}) {
    const selector = new CountrySelector(container, options);
    await selector.init();
    return selector;
}

// 기본 export
export default CountrySelector;