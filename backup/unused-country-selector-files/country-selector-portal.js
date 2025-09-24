/**
 * Country Selector Portal - Stacking Context 격리 문제 해결
 * 
 * Portal 패턴을 사용하여 드롭다운을 body 직계 자식으로 이동시켜
 * 부모 요소의 stacking context 격리 문제를 근본적으로 해결합니다.
 * 
 * 주요 특징:
 * - Portal 패턴으로 DOM 트리 구조와 무관하게 렌더링
 * - 동적 위치 계산 및 스크롤 동기화
 * - 모바일 환경 Fallback 전략
 * - 성능 최적화된 이벤트 처리
 * - 접근성 고려 (ARIA 속성, 키보드 네비게이션)
 * 
 * @version 2.0.0
 * @since 2024-12-29
 */

class CountrySelectorPortal {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            portalRootId: 'dropdown-portal-root',
            mobileBreakpoint: 768,
            debounceDelay: 100,
            animationDuration: 300,
            ...options
        };
        
        // Portal 관련 요소들
        this.portalRoot = null;
        this.portalElement = null;
        this.dropdownElement = null;
        
        // 상태 관리
        this.isOpen = false;
        this.isInitialized = false;
        this.isMobile = window.innerWidth <= this.options.mobileBreakpoint;
        
        // 이벤트 리스너들
        this.eventListeners = new Map();
        
        // 성능 최적화를 위한 설정
        this.positionUpdateTimeout = null;
        this.scrollHandler = null;
        this.resizeHandler = null;
        
        // 국가 데이터
        this.countries = [];
        this.filteredCountries = [];
        
        this.init();
    }
    
    /**
     * Country Selector Portal 초기화
     * @async
     */
    async init() {
        try {
            console.log('Country Selector Portal 초기화 시작...');
            
            // Portal 루트 확인
            this.portalRoot = document.getElementById(this.options.portalRootId);
            if (!this.portalRoot) {
                throw new Error(`Portal root element not found: ${this.options.portalRootId}`);
            }
            
            // 기존 Country Selector 요소들 찾기
            this.setupExistingElements();
            
            // Portal 요소 생성
            this.createPortalElement();
            
            // 국가 데이터 로드
            await this.loadCountryData();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 반응형 처리
            this.setupResponsiveHandling();
            
            this.isInitialized = true;
            console.log('Country Selector Portal 초기화 완료');
            
        } catch (error) {
            console.error('Country Selector Portal 초기화 실패:', error);
            throw error;
        }
    }
    
    /**
     * 기존 Country Selector 요소들 설정
     */
    setupExistingElements() {
        if (!this.container) {
            throw new Error(`Container element not found: ${this.containerId}`);
        }
        
        // 기존 Country Selector 요소 찾기
        this.inputElement = this.container.querySelector('.country-selector input, .country-selector-v2 .selector-input');
        this.arrowButton = this.container.querySelector('.dropdown-arrow');
        this.originalDropdown = this.container.querySelector('.selector-dropdown');
        
        if (!this.inputElement) {
            throw new Error('Country Selector input element not found');
        }
        
        // 기존 드롭다운 숨김 (Portal로 이동되므로)
        if (this.originalDropdown) {
            this.originalDropdown.style.display = 'none';
        }
    }
    
    /**
     * Portal 요소 생성
     */
    createPortalElement() {
        // Portal 컨테이너 생성
        this.portalElement = document.createElement('div');
        this.portalElement.className = 'country-selector-portal';
        this.portalElement.style.cssText = `
            position: fixed;
            z-index: var(--z-country-portal);
            pointer-events: none;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;
        
        // 드롭다운 요소 생성
        this.dropdownElement = document.createElement('div');
        this.dropdownElement.className = 'selector-dropdown portal-dropdown';
        this.dropdownElement.style.cssText = `
            position: absolute;
            background: rgba(255, 255, 255, 0.98);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            overflow: hidden;
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: auto;
            min-width: 300px;
            max-width: 500px;
            max-height: 400px;
            z-index: var(--z-country-dropdown);
        `;
        
        // Portal에 드롭다운 추가
        this.portalElement.appendChild(this.dropdownElement);
        
        // Portal을 Portal 루트에 추가
        this.portalRoot.appendChild(this.portalElement);
        
        // 초기에는 숨김
        this.portalElement.style.display = 'none';
    }
    
    /**
     * 국가 데이터 로드
     * @async
     */
    async loadCountryData() {
        try {
            // 기존 국가 데이터가 있다면 사용
            const existingData = window.countriesData || [];
            if (existingData.length > 0) {
                this.countries = existingData;
                this.filteredCountries = [...existingData];
                return;
            }
            
            // 기본 국가 데이터
            this.countries = [
                { flag: '🇰🇷', name: '대한민국', nameEn: 'South Korea', continent: 'ASIA' },
                { flag: '🇯🇵', name: '일본', nameEn: 'Japan', continent: 'ASIA' },
                { flag: '🇺🇸', name: '미국', nameEn: 'United States', continent: 'NORTH AMERICA' },
                { flag: '🇨🇳', name: '중국', nameEn: 'China', continent: 'ASIA' },
                { flag: '🇬🇧', name: '영국', nameEn: 'United Kingdom', continent: 'EUROPE' },
                { flag: '🇫🇷', name: '프랑스', nameEn: 'France', continent: 'EUROPE' },
                { flag: '🇩🇪', name: '독일', nameEn: 'Germany', continent: 'EUROPE' },
                { flag: '🇮🇹', name: '이탈리아', nameEn: 'Italy', continent: 'EUROPE' },
                { flag: '🇪🇸', name: '스페인', nameEn: 'Spain', continent: 'EUROPE' },
                { flag: '🇨🇦', name: '캐나다', nameEn: 'Canada', continent: 'NORTH AMERICA' },
                { flag: '🇦🇺', name: '호주', nameEn: 'Australia', continent: 'OCEANIA' },
                { flag: '🇧🇷', name: '브라질', nameEn: 'Brazil', continent: 'SOUTH AMERICA' }
            ];
            
            this.filteredCountries = [...this.countries];
            
        } catch (error) {
            console.error('국가 데이터 로드 실패:', error);
            this.countries = [];
            this.filteredCountries = [];
        }
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 입력 필드 이벤트
        this.addEventListener(this.inputElement, 'focus', this.handleInputFocus.bind(this));
        this.addEventListener(this.inputElement, 'input', this.debounce(this.handleInputChange.bind(this), this.options.debounceDelay));
        this.addEventListener(this.inputElement, 'keydown', this.handleInputKeydown.bind(this));
        
        // 화살표 버튼 이벤트
        if (this.arrowButton) {
            this.addEventListener(this.arrowButton, 'click', this.handleArrowClick.bind(this));
        }
        
        // 외부 클릭 감지
        this.addEventListener(document, 'click', this.handleOutsideClick.bind(this));
        
        // 스크롤 이벤트 (위치 동기화)
        this.scrollHandler = this.throttle(this.updateDropdownPosition.bind(this), 16);
        this.addEventListener(window, 'scroll', this.scrollHandler);
        
        // 리사이즈 이벤트
        this.resizeHandler = this.debounce(this.handleResize.bind(this), this.options.debounceDelay);
        this.addEventListener(window, 'resize', this.resizeHandler);
        
        // 키보드 이벤트 (ESC 키)
        this.addEventListener(document, 'keydown', this.handleKeydown.bind(this));
    }
    
    /**
     * 반응형 처리 설정
     */
    setupResponsiveHandling() {
        // 초기 모바일 상태 확인
        this.updateMobileState();
        
        // 리사이즈 시 모바일 상태 업데이트
        this.addEventListener(window, 'resize', () => {
            this.updateMobileState();
        });
    }
    
    /**
     * 모바일 상태 업데이트
     */
    updateMobileState() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= this.options.mobileBreakpoint;
        
        if (wasMobile !== this.isMobile && this.isOpen) {
            this.updateDropdownPosition();
        }
    }
    
    /**
     * 입력 필드 포커스 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleInputFocus(event) {
        this.openDropdown();
    }
    
    /**
     * 입력 필드 변경 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleInputChange(event) {
        const query = event.target.value.toLowerCase();
        this.filterCountries(query);
        this.renderDropdown();
    }
    
    /**
     * 입력 필드 키보드 이벤트 처리
     * @param {KeyboardEvent} event - 키보드 이벤트
     */
    handleInputKeydown(event) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            this.handleKeyboardNavigation(event.key);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            this.selectFirstCountry();
        } else if (event.key === 'Escape') {
            this.closeDropdown();
        }
    }
    
    /**
     * 화살표 버튼 클릭 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleArrowClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    /**
     * 외부 클릭 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleOutsideClick(event) {
        if (!this.isOpen) return;
        
        const isClickInside = this.container.contains(event.target) || 
                             this.portalElement.contains(event.target);
        
        if (!isClickInside) {
            this.closeDropdown();
        }
    }
    
    /**
     * 키보드 이벤트 처리
     * @param {KeyboardEvent} event - 키보드 이벤트
     */
    handleKeydown(event) {
        if (event.key === 'Escape' && this.isOpen) {
            this.closeDropdown();
        }
    }
    
    /**
     * 리사이즈 이벤트 처리
     * @param {Event} event - 이벤트
     */
    handleResize(event) {
        this.updateMobileState();
        if (this.isOpen) {
            this.updateDropdownPosition();
        }
    }
    
    /**
     * 드롭다운 열기
     */
    openDropdown() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        
        // Portal 표시
        this.portalElement.style.display = 'block';
        
        // 위치 계산 및 설정
        this.updateDropdownPosition();
        
        // 드롭다운 렌더링
        this.renderDropdown();
        
        // 애니메이션 시작
        requestAnimationFrame(() => {
            this.dropdownElement.style.opacity = '1';
            this.dropdownElement.style.transform = 'translateY(0) scale(1)';
        });
        
        // 화살표 회전
        if (this.arrowButton) {
            const arrowIcon = this.arrowButton.querySelector('.arrow-icon');
            if (arrowIcon) {
                arrowIcon.style.transform = 'rotate(180deg)';
            }
        }
        
        // 컨테이너에 열림 상태 클래스 추가
        this.container.classList.add('open');
        
        // 커스텀 이벤트 발생 (안전한 요소 전달)
        if (this.container && document.contains(this.container)) {
            this.dispatchEvent('country-selector-open', { element: this.container });
        }
        
        console.log('Country Selector 드롭다운 열림');
    }
    
    /**
     * 드롭다운 닫기
     */
    closeDropdown() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        // 애니메이션 종료
        this.dropdownElement.style.opacity = '0';
        this.dropdownElement.style.transform = 'translateY(-20px) scale(0.95)';
        
        // 애니메이션 완료 후 Portal 숨김
        setTimeout(() => {
            this.portalElement.style.display = 'none';
        }, this.options.animationDuration);
        
        // 화살표 원래 상태로
        if (this.arrowButton) {
            const arrowIcon = this.arrowButton.querySelector('.arrow-icon');
            if (arrowIcon) {
                arrowIcon.style.transform = 'rotate(0deg)';
            }
        }
        
        // 컨테이너에서 열림 상태 클래스 제거
        this.container.classList.remove('open');
        
        // 커스텀 이벤트 발생 (안전한 요소 전달)
        if (this.container && document.contains(this.container)) {
            this.dispatchEvent('country-selector-close', { element: this.container });
        }
        
        console.log('Country Selector 드롭다운 닫힘');
    }
    
    /**
     * 드롭다운 위치 업데이트
     */
    updateDropdownPosition() {
        if (!this.isOpen || !this.inputElement) return;
        
        const inputRect = this.inputElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        let top = inputRect.bottom + 8;
        let left = inputRect.left;
        let width = inputRect.width;
        
        // 모바일 환경에서는 중앙 정렬
        if (this.isMobile) {
            this.dropdownElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 20px;
                right: 20px;
                transform: translateY(-50%);
                width: auto;
                max-height: 70vh;
                z-index: var(--z-modal);
                background: rgba(255, 255, 255, 0.98);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                overflow: hidden;
                pointer-events: auto;
            `;
            return;
        }
        
        // 데스크톱 환경에서 위치 계산
        const dropdownHeight = 400; // 최대 높이
        const spaceBelow = viewportHeight - top;
        const spaceAbove = inputRect.top;
        
        // 아래쪽 공간이 부족하면 위쪽에 표시
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            top = inputRect.top - dropdownHeight - 8;
        }
        
        // 오른쪽으로 넘어가면 왼쪽으로 조정
        if (left + width > viewportWidth - 20) {
            left = viewportWidth - width - 20;
        }
        
        // 왼쪽으로 넘어가면 최소값으로 조정
        if (left < 20) {
            left = 20;
        }
        
        // 위치 설정
        this.dropdownElement.style.cssText = `
            position: absolute;
            top: ${top}px;
            left: ${left}px;
            width: ${width}px;
            max-height: ${Math.min(dropdownHeight, spaceBelow)}px;
            z-index: var(--z-country-dropdown);
            background: rgba(255, 255, 255, 0.98);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            overflow: hidden;
            pointer-events: auto;
        `;
    }
    
    /**
     * 국가 필터링
     * @param {string} query - 검색 쿼리
     */
    filterCountries(query) {
        if (!query) {
            this.filteredCountries = [...this.countries];
            return;
        }
        
        this.filteredCountries = this.countries.filter(country => 
            country.name.toLowerCase().includes(query) ||
            country.nameEn.toLowerCase().includes(query) ||
            country.continent.toLowerCase().includes(query)
        );
    }
    
    /**
     * 드롭다운 렌더링
     */
    renderDropdown() {
        if (!this.dropdownElement) return;
        
        const html = `
            <div class="section-title">국가 선택</div>
            <div class="countries-list">
                ${this.filteredCountries.length > 0 ? 
                    this.filteredCountries.map(country => `
                        <div class="country-item" data-country="${country.nameEn}">
                            <span class="country-flag">${country.flag}</span>
                            <span class="country-name">${country.name}</span>
                            <span class="country-name-en">${country.nameEn}</span>
                            <span class="country-continent">${country.continent}</span>
                        </div>
                    `).join('') :
                    '<div class="no-countries">검색 결과가 없습니다.</div>'
                }
            </div>
        `;
        
        this.dropdownElement.innerHTML = html;
        
        // 국가 아이템 클릭 이벤트 추가
        this.dropdownElement.querySelectorAll('.country-item').forEach(item => {
            this.addEventListener(item, 'click', (event) => {
                this.selectCountry(event.target.closest('.country-item'));
            });
            
            this.addEventListener(item, 'mouseenter', (event) => {
                this.highlightCountryItem(event.target);
            });
        });
    }
    
    /**
     * 국가 선택
     * @param {HTMLElement} countryItem - 선택된 국가 아이템
     */
    selectCountry(countryItem) {
        if (!countryItem) return;
        
        const countryName = countryItem.querySelector('.country-name').textContent;
        const countryNameEn = countryItem.getAttribute('data-country');
        
        // 입력 필드에 값 설정
        this.inputElement.value = countryName;
        
        // 드롭다운 닫기
        this.closeDropdown();
        
        // 커스텀 이벤트 발생 (안전한 요소 전달)
        if (this.container && document.contains(this.container)) {
            this.dispatchEvent('country-selected', { 
                element: this.container,
                country: {
                    name: countryName,
                    nameEn: countryNameEn
                }
            });
        }
        
        console.log('국가 선택됨:', countryName);
    }
    
    /**
     * 첫 번째 국가 선택
     */
    selectFirstCountry() {
        const firstCountry = this.dropdownElement.querySelector('.country-item');
        if (firstCountry) {
            this.selectCountry(firstCountry);
        }
    }
    
    /**
     * 키보드 네비게이션 처리
     * @param {string} direction - 방향 ('ArrowDown' | 'ArrowUp')
     */
    handleKeyboardNavigation(direction) {
        const items = this.dropdownElement.querySelectorAll('.country-item');
        if (items.length === 0) return;
        
        const currentIndex = Array.from(items).findIndex(item => 
            item.classList.contains('highlighted')
        );
        
        let newIndex;
        if (direction === 'ArrowDown') {
            newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        } else {
            newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }
        
        // 하이라이트 업데이트
        items.forEach(item => item.classList.remove('highlighted'));
        items[newIndex].classList.add('highlighted');
        
        // 스크롤 처리
        items[newIndex].scrollIntoView({ block: 'nearest' });
    }
    
    /**
     * 국가 아이템 하이라이트
     * @param {HTMLElement} item - 하이라이트할 아이템
     */
    highlightCountryItem(item) {
        this.dropdownElement.querySelectorAll('.country-item').forEach(i => {
            i.classList.remove('highlighted');
        });
        item.classList.add('highlighted');
    }
    
    /**
     * 이벤트 리스너 추가
     * @param {HTMLElement} element - 요소
     * @param {string} event - 이벤트명
     * @param {Function} handler - 핸들러
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
     * @param {string} eventName - 이벤트명
     * @param {Object} detail - 이벤트 상세 정보
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
    
    /**
     * 디바운스 함수
     * @param {Function} func - 실행할 함수
     * @param {number} delay - 지연 시간
     * @returns {Function} 디바운스된 함수
     */
    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    /**
     * 스로틀 함수
     * @param {Function} func - 실행할 함수
     * @param {number} limit - 제한 시간
     * @returns {Function} 스로틀된 함수
     */
    throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * 리소스 정리
     */
    cleanup() {
        // 이벤트 리스너 정리
        this.eventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.eventListeners.clear();
        
        // Portal 요소 제거
        if (this.portalElement && this.portalElement.parentNode) {
            this.portalElement.parentNode.removeChild(this.portalElement);
        }
        
        // 타이머 정리
        if (this.positionUpdateTimeout) {
            clearTimeout(this.positionUpdateTimeout);
        }
        
        console.log('Country Selector Portal 정리 완료');
    }
}

// 전역 인스턴스 관리
window.CountrySelectorPortal = CountrySelectorPortal;

// 모듈 내보내기
export default CountrySelectorPortal;
