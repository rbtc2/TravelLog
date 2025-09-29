/**
 * CitySelector - 도시 선택 컴포넌트
 * CountrySelector와 동일한 패턴으로 구현
 * API 기반 도시 데이터 로드 및 검색 기능
 * 
 * @version 1.0.0
 * @since 2024-12-29
 * @author REDIPX
 */

export class CitySelector {
    constructor(container, options = {}) {
        if (!container) {
            throw new Error('CitySelector: container is required');
        }
        
        this.container = container;
        this.options = {
            placeholder: '도시를 검색하세요...',
            maxResults: 50,
            disabled: false,
            ...options
        };

        this.isOpen = false;
        this.portal = null;
        this.dropdown = null;
        this.input = null;
        this.arrow = null;
        this.selectedIndex = -1;
        this.filteredCities = [];
        this.eventListeners = new Map();
        this.selectedCountry = null;
        this.isLoading = false;
        
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
            this.updateUI();
            console.log('CitySelector 초기화 완료');
        } catch (error) {
            console.error('CitySelector 초기화 실패:', error);
            throw error;
        }
    }
    
    /**
     * 국가 설정 및 도시 데이터 로드
     * @param {Object} country - 선택된 국가 정보
     */
    async setCountry(country) {
        if (!country || !country.nameEn) {
            console.warn('CitySelector: 유효하지 않은 국가 정보');
            return;
        }
        
        this.selectedCountry = country;
        this.enable();
        
        try {
            this.setLoading(true);
            await this.loadCitiesByCountry(country.nameEn);
            this.updateDropdownContent();
        } catch (error) {
            console.error('도시 데이터 로드 실패:', error);
            this.showError('도시 데이터를 불러오는데 실패했습니다.');
        } finally {
            this.setLoading(false);
        }
    }
    
    /**
     * API에서 도시 데이터 로드
     * @param {string} countryName - 국가명 (영어)
     */
    async loadCitiesByCountry(countryName) {
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    country: countryName
                }),
                // 타임아웃 설정 (10초)
                signal: AbortSignal.timeout(10000)
            });
            
            if (!response.ok) {
                throw new Error(`API 응답 오류: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data || !data.data || !Array.isArray(data.data)) {
                throw new Error('API 응답 데이터 형식이 올바르지 않습니다.');
            }
            
            // 도시 데이터 변환
            this.filteredCities = data.data.map(cityName => ({
                name: cityName,
                nameEn: cityName,
                country: countryName
            }));
            
            console.log(`${countryName}의 도시 ${this.filteredCities.length}개 로드 완료`);
            
        } catch (error) {
            console.error('도시 API 호출 실패:', error);
            
            // 네트워크 오류 시 폴백 데이터 제공
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.warn('네트워크 연결 실패, 폴백 도시 데이터를 사용합니다.');
                this.filteredCities = this.getFallbackCities(countryName);
            } else {
                throw error;
            }
        }
    }
    
    /**
     * 폴백 도시 데이터 (네트워크 실패 시)
     * @param {string} countryName - 국가명
     */
    getFallbackCities(countryName) {
        const fallbackCities = {
            'South Korea': [
                { name: '서울', nameEn: 'Seoul', country: 'South Korea' },
                { name: '부산', nameEn: 'Busan', country: 'South Korea' },
                { name: '대구', nameEn: 'Daegu', country: 'South Korea' },
                { name: '인천', nameEn: 'Incheon', country: 'South Korea' },
                { name: '광주', nameEn: 'Gwangju', country: 'South Korea' },
                { name: '대전', nameEn: 'Daejeon', country: 'South Korea' },
                { name: '울산', nameEn: 'Ulsan', country: 'South Korea' }
            ],
            'Japan': [
                { name: '도쿄', nameEn: 'Tokyo', country: 'Japan' },
                { name: '오사카', nameEn: 'Osaka', country: 'Japan' },
                { name: '교토', nameEn: 'Kyoto', country: 'Japan' },
                { name: '요코하마', nameEn: 'Yokohama', country: 'Japan' },
                { name: '나고야', nameEn: 'Nagoya', country: 'Japan' },
                { name: '삿포로', nameEn: 'Sapporo', country: 'Japan' },
                { name: '후쿠오카', nameEn: 'Fukuoka', country: 'Japan' }
            ],
            'United States': [
                { name: '뉴욕', nameEn: 'New York', country: 'United States' },
                { name: '로스앤젤레스', nameEn: 'Los Angeles', country: 'United States' },
                { name: '시카고', nameEn: 'Chicago', country: 'United States' },
                { name: '휴스턴', nameEn: 'Houston', country: 'United States' },
                { name: '피닉스', nameEn: 'Phoenix', country: 'United States' },
                { name: '필라델피아', nameEn: 'Philadelphia', country: 'United States' },
                { name: '샌안토니오', nameEn: 'San Antonio', country: 'United States' }
            ]
        };
        
        return fallbackCities[countryName] || [
            { name: '주요 도시', nameEn: 'Major City', country: countryName }
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
                    aria-label="도시 선택"
                    role="combobox"
                    aria-expanded="false"
                    aria-haspopup="listbox"
                    ${this.options.disabled ? 'disabled' : ''}
                />
                <button class="dropdown-arrow" type="button" aria-label="드롭다운 열기" ${this.options.disabled ? 'disabled' : ''}>
                    <span class="arrow-icon">▼</span>
                </button>
            </div>
        `;
        
        this.input = this.container.querySelector('input');
        this.arrow = this.container.querySelector('.dropdown-arrow');
        
        if (!this.input || !this.arrow) {
            throw new Error('CitySelector: 입력 필드 생성 실패');
        }
    }
    
    /**
     * Portal 생성
     */
    createPortal() {
        // 기존 portal 제거
        const existingPortal = document.querySelector('.city-selector-portal');
        if (existingPortal) {
            existingPortal.remove();
        }
        
        // 새 portal 생성
        this.portal = document.createElement('div');
        this.portal.className = 'city-selector-portal';
        this.portal.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.portal);
        
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'selector-dropdown';
        this.dropdown.setAttribute('role', 'listbox');
        this.dropdown.setAttribute('aria-label', '도시 목록');
        this.dropdown.setAttribute('aria-hidden', 'true');
        this.portal.appendChild(this.dropdown);
    }
    
    /**
     * 드롭다운 내용 업데이트
     */
    updateDropdownContent() {
        if (this.isLoading) {
            this.dropdown.innerHTML = `
                <div class="cities-section">
                    <div class="loading-cities">
                        <div class="loading-spinner"></div>
                        <span>도시 목록을 불러오는 중...</span>
                    </div>
                </div>
            `;
            return;
        }
        
        if (!this.filteredCities || this.filteredCities.length === 0) {
            this.dropdown.innerHTML = `
                <div class="cities-section">
                    <div class="no-cities">
                        ${this.selectedCountry ? '검색 결과가 없습니다.' : '국가를 먼저 선택해주세요.'}
                    </div>
                </div>
            `;
            return;
        }
        
        const content = `
            <div class="cities-section">
                <h3 class="section-title">도시 검색</h3>
                <div class="cities-list">
                    ${this.filteredCities.map((city, index) => `
                        <div class="city-item ${index === this.selectedIndex ? 'selected' : ''}" 
                             data-city="${city.nameEn}" 
                             data-index="${index}"
                             role="option"
                             tabindex="0">
                            <span class="city-name">${city.name}</span>
                            <span class="city-name-en">${city.nameEn}</span>
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
        if (this.isOpen || this.options.disabled) return;
        
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
            
            // 커스텀 이벤트 발생
            this.dispatchEvent('city-selector-open', { element: this.dropdown });
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
            // 드롭다운 내부 요소들의 포커스 제거
            const focusedElement = document.activeElement;
            if (focusedElement && this.dropdown.contains(focusedElement)) {
                focusedElement.blur();
            }
            
            // 포커스를 입력 필드로 이동 (접근성 개선)
            if (this.input) {
                this.input.focus();
            }
            
            this.dropdown.classList.remove('open');
            this.container.classList.remove('open');
            this.input.setAttribute('aria-expanded', 'false');
            
            // 포커스 제거가 완전히 완료된 후 aria-hidden 설정
            setTimeout(() => {
                this.portal.setAttribute('aria-hidden', 'true');
                this.dropdown.setAttribute('aria-hidden', 'true');
            }, 0);
            
            setTimeout(() => {
                this.dropdown.style.display = 'none';
            }, 300);
            
            this.isOpen = false;
            this.selectedIndex = -1;
            
            // 커스텀 이벤트 발생
            this.dispatchEvent('city-selector-close', { element: this.dropdown });
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
            const item = e.target.closest('.city-item');
            if (item) {
                const index = parseInt(item.dataset.index);
                this.selectCity(index);
            }
        });
        
        // 드롭다운 아이템 키보드 이벤트
        this.addEventListener(this.portal, 'keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const item = e.target.closest('.city-item');
                if (item) {
                    e.preventDefault();
                    const index = parseInt(item.dataset.index);
                    this.selectCity(index);
                }
            }
        });
    }
    
    /**
     * 검색 기능
     * @param {string} query - 검색어
     */
    search(query) {
        if (!this.selectedCountry || !this.filteredCities) {
            return;
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredCities = this.filteredCities;
        } else {
            this.filteredCities = this.filteredCities.filter(city => 
                city.name.toLowerCase().includes(searchTerm) ||
                city.nameEn.toLowerCase().includes(searchTerm)
            );
        }
        
        this.selectedIndex = -1;
        this.updateDropdownContent();
    }
    
    /**
     * 키보드 이벤트 처리
     * @param {KeyboardEvent} e - 키보드 이벤트
     */
    handleKeydown(e) {
        if (!this.isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                e.preventDefault();
                this.open();
            }
            return;
        }
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredCities.length - 1);
                this.updateSelection();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection();
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0) {
                    this.selectCity(this.selectedIndex);
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
        }
    }
    
    /**
     * 선택 상태 업데이트
     */
    updateSelection() {
        const items = this.dropdown.querySelectorAll('.city-item');
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedIndex);
        });
    }
    
    /**
     * 도시 선택
     * @param {number} index - 선택된 도시 인덱스
     */
    selectCity(index) {
        if (index < 0 || index >= this.filteredCities.length) {
            return;
        }
        
        const city = this.filteredCities[index];
        this.input.value = city.name;
        
        // 커스텀 이벤트 발생
        this.dispatchEvent('city-selected', {
            city: city,
            cityName: city.name,
            cityNameEn: city.nameEn,
            country: this.selectedCountry
        });
        
        this.close();
    }
    
    /**
     * 활성화/비활성화
     */
    enable() {
        this.options.disabled = false;
        this.input.disabled = false;
        this.arrow.disabled = false;
        this.input.placeholder = this.options.placeholder;
        this.container.classList.remove('disabled');
    }
    
    disable() {
        this.options.disabled = true;
        this.input.disabled = true;
        this.arrow.disabled = true;
        this.input.placeholder = '국가를 먼저 선택해주세요';
        this.input.value = '';
        this.container.classList.add('disabled');
        this.close();
    }
    
    /**
     * 로딩 상태 설정
     * @param {boolean} loading - 로딩 상태
     */
    setLoading(loading) {
        this.isLoading = loading;
        this.updateDropdownContent();
    }
    
    /**
     * 에러 표시
     * @param {string} message - 에러 메시지
     */
    showError(message) {
        this.dropdown.innerHTML = `
            <div class="cities-section">
                <div class="error-cities">
                    <span class="error-icon">⚠️</span>
                    <span>${message}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * UI 업데이트
     */
    updateUI() {
        if (this.options.disabled) {
            this.disable();
        } else {
            this.enable();
        }
    }
    
    /**
     * 이벤트 리스너 추가
     * @param {Element} element - 이벤트를 바인딩할 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     */
    addEventListener(element, event, handler) {
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, []);
        }
        
        this.eventListeners.get(element).push({ event, handler });
        element.addEventListener(event, handler);
    }
    
    /**
     * 커스텀 이벤트 발생
     * @param {string} eventName - 이벤트 이름
     * @param {Object} detail - 이벤트 상세 정보
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            cancelable: true
        });
        
        this.container.dispatchEvent(event);
    }
    
    /**
     * 리소스 정리
     */
    cleanup() {
        try {
            // 이벤트 리스너 제거
            this.eventListeners.forEach((listeners, element) => {
                listeners.forEach(({ event, handler }) => {
                    element.removeEventListener(event, handler);
                });
            });
            this.eventListeners.clear();
            
            // Portal 제거
            if (this.portal && this.portal.parentNode) {
                this.portal.parentNode.removeChild(this.portal);
            }
            
            // 상태 초기화
            this.isOpen = false;
            this.selectedIndex = -1;
            this.filteredCities = [];
            this.selectedCountry = null;
            this.isLoading = false;
            
            console.log('CitySelector 정리 완료');
        } catch (error) {
            console.error('CitySelector 정리 실패:', error);
        }
    }
}

/**
 * CitySelector 생성 헬퍼 함수
 * @param {HTMLElement} container - 컨테이너 요소
 * @param {Object} options - 옵션
 * @returns {CitySelector} CitySelector 인스턴스
 */
export function createCitySelector(container, options = {}) {
    return new CitySelector(container, options);
}
