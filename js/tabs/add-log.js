import { FORM_CONFIG, VALIDATION_RULES } from '../config/form-config.js';
import { createCountrySelector } from '../modules/ui-components/country-selector.js';
import { ValidationUtils } from '../modules/utils/validation-utils.js';
import { DateUtils } from '../modules/utils/date-utils.js';

/**
 * 일지 추가 탭 모듈
 * 독립적으로 동작하며, 다른 탭에 영향을 주지 않음
 * 메모리 누수 없는 마운트/언마운트 구현
 * 
 * @class AddLogTab
 * @description 여행 일지를 추가하는 탭 컴포넌트
 */
class AddLogTab {
    /**
     * AddLogTab 생성자
     * @description 탭의 초기 상태와 데이터를 설정합니다
     */
    constructor() {
        /** @type {boolean} 탭 초기화 상태 */
        this.isInitialized = false;
        
        /** @type {Array<{element: Element, event: string, handler: Function}>} 등록된 이벤트 리스너 목록 */
        this.eventListeners = [];
        
        /** @type {Object} 폼 데이터 객체 */
        this.formData = {
            country: '',
            city: '',
            startDate: '',
            endDate: '',
            purpose: '',
            rating: '',
            travelStyle: '',
            memo: ''
        };
        
        /** @type {Object} 검증 에러 상태 객체 */
        this.validationErrors = {};
        
        /** @type {Object|null} 국가 선택기 컴포넌트 */
        this.countrySelector = null;
    }
    
    /**
     * 탭을 컨테이너에 렌더링합니다
     * @param {HTMLElement} container - 탭을 렌더링할 컨테이너 요소
     */
    render(container) {
        this.container = container;
        // 일지 추가 탭 CSS 네임스페이스 클래스 추가
        this.container.classList.add('add-log-tab');
        this.renderContent();
        
        // DOM 파싱 완료를 보장하는 방법으로 이벤트 바인딩
        this.waitForDOMReady(() => {
            this.bindEvents();
        });
        
        this.isInitialized = true;
        
        // 탭 렌더링 후 스크롤을 상단으로 이동
        this.scrollToTop();
    }
    
    /**
     * CountrySelector 컴포넌트를 초기화합니다
     * @private
     */
    async initializeCountrySelector() {
        try {
            const container = document.getElementById('country-selector-container');
            if (!container) {
                console.error('AddLogTab: 국가 선택기 컨테이너를 찾을 수 없습니다.');
                return;
            }

            // CountrySelector 생성 및 초기화
            this.countrySelector = await createCountrySelector(container, {
                placeholder: FORM_CONFIG.country.placeholder,
                showFlags: FORM_CONFIG.country.showFlag,
                showEnglishNames: FORM_CONFIG.country.showEnglishName,
                inputId: 'country-selector-input'
            });

            // 국가 선택 이벤트 리스너
            container.addEventListener('country-selected', (event) => {
                const selectedCountry = event.detail;
                this.handleCountrySelection(selectedCountry);
            });

            console.log('AddLogTab: CountrySelector 초기화 완료');

        } catch (error) {
            console.error('AddLogTab: CountrySelector 초기화 실패:', error);
        }
    }

    /**
     * 국가 선택 이벤트를 처리합니다
     * @private
     * @param {Object} selectedCountry - 선택된 국가 정보
     */
    handleCountrySelection(selectedCountry) {
        if (!selectedCountry) return;

        // 폼 데이터 업데이트
        this.formData.country = selectedCountry.code;
        
        // hidden input 업데이트
        const countryInput = this.safeGetElementById('country', '국가 선택');
        if (countryInput) {
            countryInput.value = selectedCountry.code;
            
            // change 이벤트 발생
            countryInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // 도시 입력 필드 활성화
        const cityInput = this.safeGetElementById('city', '국가 선택');
        if (cityInput) {
            cityInput.disabled = false;
            cityInput.placeholder = `${selectedCountry.nameKo}의 도시를 입력하세요`;
        }

        // 검증 에러 제거
        this.showFieldError('country', '');
        
        // 콘솔 로그
        console.log(`AddLogTab: 국가 선택됨 - ${selectedCountry.nameKo} (${selectedCountry.code})`);
    }

    /**
     * DOM이 완전히 파싱될 때까지 대기합니다
     * @param {Function} callback - DOM 준비 완료 시 실행할 콜백
     */
    waitForDOMReady(callback) {
        // 방법 1: DOMContentLoaded 이벤트 활용
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(callback, 0);
            });
        } else {
            // 방법 2: setTimeout을 사용한 폴링 방식
            let attempts = 0;
            const maxAttempts = 100; // 최대 1초 대기
            
            const checkDOM = () => {
                attempts++;
                
                // 필수 DOM 요소들이 모두 존재하는지 확인
                const form = document.getElementById('add-log-form');
                const countryInput = document.getElementById('country');
                const cityInput = document.getElementById('city');
                const startDateInput = document.getElementById('startDate');
                const endDateInput = document.getElementById('endDate');
                const memoTextarea = document.getElementById('memo');
                const submitBtn = document.getElementById('submit-btn');
                const resetBtn = document.getElementById('reset-btn');
                
                if (form && countryInput && cityInput && startDateInput && endDateInput && memoTextarea && submitBtn && resetBtn) {
                    // 모든 요소가 준비되었으면 콜백 실행
                    callback();
                } else if (attempts < maxAttempts) {
                    // 아직 준비되지 않았으면 10ms 후 재시도
                    setTimeout(checkDOM, 10);
                } else {
                    // 최대 시도 횟수 초과 시 강제 실행 (fallback)
                    console.warn('AddLogTab: DOM 준비 대기 시간 초과, 강제로 이벤트 바인딩을 시도합니다.');
                    callback();
                }
            };
            
            // 즉시 첫 번째 확인 시작
            checkDOM();
        }
    }
    
    /**
     * 탭의 HTML 콘텐츠를 렌더링합니다
     * @description 설정 파일의 상수값들을 사용하여 동적으로 HTML을 생성합니다
     */
    renderContent() {
        this.container.innerHTML = `
            <div class="add-log-container">
                <div class="add-log-header">
                    <h1 class="add-log-title">✈️ 여행 일지 추가</h1>
                    <p class="add-log-subtitle">새로운 여행 경험을 기록해보세요</p>
                </div>
                
                <form class="add-log-form" id="add-log-form">
                    <!-- 국가 입력 -->
                    <div class="form-group">
                        <label for="country-selector-input" class="form-label required">국가</label>
                        <div id="country-selector-container">
                            <!-- CountrySelector 컴포넌트가 여기에 렌더링됩니다 -->
                        </div>
                        <input 
                            type="hidden" 
                            id="country" 
                            name="country" 
                            required
                        >
                        <div class="form-hint">${FORM_CONFIG.country.hint}</div>
                        <div class="form-error" id="country-error"></div>
                    </div>
                    
                    <!-- 도시 입력 -->
                    <div class="form-group">
                        <label for="city" class="form-label required">도시</label>
                        <input 
                            type="text" 
                            id="city" 
                            name="city" 
                            class="form-input" 
                            placeholder="국가를 먼저 선택해주세요"
                            maxlength="${FORM_CONFIG.city.maxLength}"
                            autocomplete="address-level2"
                            disabled
                            required
                        >
                        <div class="form-error" id="city-error"></div>
                    </div>
                    
                    <!-- 체류 시작일 -->
                    <div class="form-group">
                        <label for="startDate" class="form-label required">체류 시작일</label>
                        <input 
                            type="date" 
                            id="startDate" 
                            name="startDate" 
                            class="form-input" 
                            autocomplete="bday"
                            required
                        >
                        <div class="form-error" id="startDate-error"></div>
                    </div>
                    
                    <!-- 체류 종료일 -->
                    <div class="form-group">
                        <label for="endDate" class="form-label required">체류 종료일</label>
                        <input 
                            type="date" 
                            id="endDate" 
                            name="endDate" 
                            class="form-input" 
                            autocomplete="bday"
                            disabled
                            required
                        >
                        <div class="form-error" id="endDate-error"></div>
                    </div>
                    
                    <!-- 체류 목적 -->
                    <div class="form-group">
                        <label class="form-label required">체류 목적</label>
                        <div class="chip-group purpose-chip-group" id="purpose-group">
                            ${FORM_CONFIG.purposeOptions.map(option => `
                                <label class="chip-label">
                                    <input type="radio" name="purpose" value="${option.value}" required>
                                    <span class="chip-custom">
                                        <span class="chip-icon">${option.icon}</span>
                                        <span class="chip-text">${option.label}</span>
                                    </span>
                                </label>
                            `).join('')}
                        </div>
                        <div class="form-error" id="purpose-error"></div>
                    </div>
                    
                    <!-- 별점 평가 -->
                    <div class="form-group">
                        <label class="form-label required">별점 평가</label>
                        <div class="star-rating" id="star-rating">
                            <div class="star" data-value="1">★</div>
                            <div class="star" data-value="2">★</div>
                            <div class="star" data-value="3">★</div>
                            <div class="star" data-value="4">★</div>
                            <div class="star" data-value="5">★</div>
                        </div>
                        <input type="hidden" name="rating" id="rating-input" required>
                        <div class="form-error" id="rating-error"></div>
                    </div>
                    
                    <!-- 여행 스타일 -->
                    <div class="form-group">
                        <label class="form-label">여행 스타일</label>
                        <div class="chip-group" id="travel-style-group">
                            ${FORM_CONFIG.travelStyleOptions.map(option => `
                                <label class="chip-label">
                                    <input type="radio" name="travelStyle" value="${option.value}">
                                    <span class="chip-custom">
                                        <span class="chip-icon">${option.icon}</span>
                                        <span class="chip-text">${option.label}</span>
                                    </span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- 메모 -->
                    <div class="form-group">
                        <label for="memo" class="form-label">메모</label>
                        <textarea 
                            id="memo" 
                            name="memo" 
                            class="form-textarea" 
                            placeholder="${FORM_CONFIG.memo.placeholder}"
                            maxlength="${FORM_CONFIG.memo.maxLength}"
                            rows="${FORM_CONFIG.memo.rows}"
                            autocomplete="off"
                        ></textarea>
                        <div class="char-counter">
                            <span id="char-count">0</span>/${FORM_CONFIG.memo.maxLength}
                        </div>
                        <div class="form-error" id="memo-error"></div>
                    </div>
                    
                    <!-- 제출 버튼 -->
                    <div class="form-actions">
                        <button type="submit" class="submit-btn" id="submit-btn">
                            ${FORM_CONFIG.messages.submit}
                        </button>
                        <button type="button" class="reset-btn" id="reset-btn">
                            🔄 초기화
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    /**
     * 모든 이벤트 리스너를 바인딩합니다
     * @description 폼 제출, 입력 검증, 별점 등의 이벤트를 관리합니다
     */
    bindEvents() {
        // DOM 요소 존재 여부 확인
        const form = this.safeGetElementById('add-log-form', '이벤트 바인딩');
        const countryInput = this.safeGetElementById('country', '이벤트 바인딩');
        const cityInput = this.safeGetElementById('city', '이벤트 바인딩');
        const startDateInput = this.safeGetElementById('startDate', '이벤트 바인딩');
        const endDateInput = this.safeGetElementById('endDate', '이벤트 바인딩');
        const memoTextarea = this.safeGetElementById('memo', '이벤트 바인딩');
        const submitBtn = this.safeGetElementById('submit-btn', '이벤트 바인딩');
        const resetBtn = this.safeGetElementById('reset-btn', '이벤트 바인딩');
        
        // 필수 DOM 요소가 없으면 이벤트 바인딩 건너뛰기
        if (!form || !countryInput || !cityInput || !startDateInput || !endDateInput || !memoTextarea || !submitBtn || !resetBtn) {
            console.warn('AddLogTab: 필수 DOM 요소를 찾을 수 없어 이벤트 바인딩을 건너뛰니다.');
            return;
        }

        // CountrySelector 초기화
        this.initializeCountrySelector();
        
        // 국가 입력 시 도시 활성화 (CountrySelector 이벤트로 대체됨)
        // this.addEventListener(countryInput, 'input', (e) => {
        //     const country = e.target.value.trim();
        //     cityInput.disabled = !country;
        //     
        //     if (!country) {
        //         cityInput.value = '';
        //         cityInput.disabled = true;
        //     }
        //     
        //     this.validateField('country', country);
        // });
        
        // 도시 입력 검증
        this.addEventListener(cityInput, 'input', (e) => {
            const city = e.target.value.trim();
            this.validateField('city', city);
        });
        
        // 시작일 변경 시 종료일 검증
        this.addEventListener(startDateInput, 'change', (e) => {
            const startDate = e.target.value;
            endDateInput.disabled = !startDate;
            
            if (startDate) {
                // 종료일의 최소값을 시작일로 설정
                endDateInput.min = startDate;
                
                // 기존 종료일이 시작일보다 이전이면 초기화
                if (endDateInput.value && endDateInput.value < startDate) {
                    endDateInput.value = '';
                    this.showFieldError('endDate', '');
                }
            } else {
                // 시작일이 없으면 종료일 제한 해제
                endDateInput.min = '';
            }
            
            if (startDate && endDateInput.value) {
                this.validateDateRange(startDate, endDateInput.value);
            }
        });
        
        // 종료일 변경 시 날짜 범위 검증
        this.addEventListener(endDateInput, 'change', (e) => {
            const endDate = e.target.value;
            if (startDateInput.value) {
                this.validateDateRange(startDateInput.value, endDate);
            }
        });
        
        // 메모 글자 수 카운터
        this.addEventListener(memoTextarea, 'input', (e) => {
            const length = e.target.value.length;
            const charCount = this.safeGetElementById('char-count', '글자 수 카운터');
            if (charCount) {
                charCount.textContent = length;
            }
        });
        
        // 별점 이벤트
        this.bindStarRating();
        
        // 폼 제출
        this.addEventListener(form, 'submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // 초기화 버튼
        this.addEventListener(resetBtn, 'click', () => {
            this.resetForm();
        });
        
        // 실시간 검증
        this.addEventListener(countryInput, 'blur', () => {
            this.validateField('country', countryInput.value.trim());
        });
        
        this.addEventListener(cityInput, 'blur', () => {
            this.validateField('city', cityInput.value.trim());
        });
    }
    
    /**
     * 별점 컴포넌트의 이벤트를 바인딩합니다
     * @description 클릭, 호버 이벤트와 별점 표시 업데이트를 관리합니다
     */
    bindStarRating() {
        const starRating = this.safeGetElementById('star-rating', '별점 바인딩');
        if (!starRating) {
            console.warn('AddLogTab: 별점 컨테이너를 찾을 수 없어 별점 이벤트를 건너뜁니다.');
            return;
        }

        const stars = starRating.querySelectorAll('.star');
        const ratingInput = this.safeGetElementById('rating-input', '별점 바인딩');
        if (!ratingInput) {
            console.warn('AddLogTab: 별점 입력 필드를 찾을 수 없어 별점 이벤트를 건너뜁니다.');
            return;
        }
        
        /** @type {number} 현재 선택된 별점 */
        let currentRating = 0;
        /** @type {number} 호버 중인 별점 */
        let hoverRating = 0;
        
        // 별 클릭 이벤트
        stars.forEach((star, index) => {
            this.addEventListener(star, 'click', () => {
                const value = index + 1;
                currentRating = value;
                ratingInput.value = value;
                this.updateStarDisplay();
                this.showFieldError('rating', '');
            });
            
            // 호버 이벤트 (데스크탑)
            this.addEventListener(star, 'mouseenter', () => {
                hoverRating = index + 1;
                this.updateStarDisplay();
            });
            
            this.addEventListener(star, 'mouseleave', () => {
                hoverRating = 0;
                this.updateStarDisplay();
            });
        });
        
        // 별점 표시 업데이트
        this.updateStarDisplay = () => {
            const displayRating = hoverRating || currentRating;
            stars.forEach((star, index) => {
                if (index < displayRating) {
                    star.classList.add('filled');
                } else {
                    star.classList.remove('filled');
                }
            });
        };
    }
    
    /**
     * 이벤트 리스너를 등록하고 추적합니다
     * @param {Element} element - 이벤트를 등록할 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러 함수
     * @description cleanup 시 자동으로 제거되도록 추적합니다
     */
    addEventListener(element, event, handler) {
        // 요소가 유효한지 확인
        if (!element || !element.addEventListener) {
            console.warn('AddLogTab: 유효하지 않은 요소에 이벤트 리스너를 등록할 수 없습니다:', element);
            return;
        }
        
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }
    
    /**
     * 개별 필드 검증
     * @param {string} fieldName - 검증할 필드명
     * @param {string} value - 검증할 값
     * @returns {boolean} 검증 결과
     */
    validateField(fieldName, value) {
        let isValid = true;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'country':
                const countryValidation = VALIDATION_RULES.validateCountry(value);
                isValid = countryValidation.isValid;
                errorMessage = countryValidation.message;
                break;
                
            case 'city':
                const cityValidation = VALIDATION_RULES.validateCity(value);
                isValid = cityValidation.isValid;
                errorMessage = cityValidation.message;
                break;
        }
        
        this.showFieldError(fieldName, errorMessage);
        this.validationErrors[fieldName] = !isValid;
        
        return isValid;
    }
    
    /**
     * 날짜 범위 검증
     * @param {string} startDate - 시작일
     * @param {string} endDate - 종료일
     * @returns {boolean} 검증 결과
     */
    validateDateRange(startDate, endDate) {
        const dateValidation = VALIDATION_RULES.validateDateRange(startDate, endDate);
        
        if (!dateValidation.isValid) {
            this.showFieldError('endDate', dateValidation.message);
            this.validationErrors['endDate'] = true;
            return false;
        }
        
        this.showFieldError('endDate', '');
        this.validationErrors['endDate'] = false;
        return true;
    }
    
    /**
     * 특정 필드의 에러 메시지를 표시합니다
     * @param {string} fieldName - 에러를 표시할 필드명
     * @param {string} message - 표시할 에러 메시지 (빈 문자열이면 에러 숨김)
     */
    showFieldError(fieldName, message) {
        const errorElement = this.safeGetElementById(`${fieldName}-error`, '에러 메시지 표시');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = message ? 'block' : 'none';
        }
    }
    
    /**
     * 전체 폼의 유효성을 검증합니다
     * @returns {boolean} 모든 필드가 유효한지 여부
     * @description 모든 필수 필드와 제약 조건을 검증합니다
     */
    validateForm() {
        const form = this.safeGetElementById('add-log-form', '폼 검증');
        if (!form) {
            console.warn('AddLogTab: 폼을 찾을 수 없어 검증을 건너뜁니다.');
            return false;
        }

        const formData = new FormData(form);
        
        // 모든 필수 필드 검증
        let isValid = true;
        
        // 국가 검증
        const country = formData.get('country')?.trim() || '';
        if (!this.validateField('country', country)) {
            isValid = false;
        }
        
        // 도시 검증
        const city = formData.get('city')?.trim() || '';
        if (!this.validateField('city', city)) {
            isValid = false;
        }
        
        // 시작일 검증
        const startDate = formData.get('startDate');
        if (!startDate) {
            this.showFieldError('startDate', FORM_CONFIG.errorMessages.startDate.required);
            this.validationErrors['startDate'] = true;
            isValid = false;
        } else {
            this.showFieldError('startDate', '');
            this.validationErrors['startDate'] = false;
        }
        
        // 종료일 검증
        const endDate = formData.get('endDate');
        if (!endDate) {
            this.showFieldError('endDate', FORM_CONFIG.errorMessages.endDate.required);
            this.validationErrors['endDate'] = true;
            isValid = false;
        } else if (startDate && !this.validateDateRange(startDate, endDate)) {
            isValid = false;
        }
        
        // 목적 검증
        const purpose = formData.get('purpose');
        if (!purpose) {
            this.showFieldError('purpose', FORM_CONFIG.errorMessages.purpose.required);
            this.validationErrors['purpose'] = true;
            isValid = false;
        } else {
            this.showFieldError('purpose', '');
            this.validationErrors['purpose'] = false;
        }
        
        // 별점 검증
        const rating = formData.get('rating');
        if (!rating) {
            this.showFieldError('rating', FORM_CONFIG.errorMessages.rating.required);
            this.validationErrors['rating'] = true;
            isValid = false;
        } else {
            this.showFieldError('rating', '');
            this.validationErrors['rating'] = false;
        }
        
        return isValid;
    }
    
    /**
     * 안전한 DOM 요소 접근을 위한 헬퍼 메서드
     * @param {string} id - 요소의 ID
     * @param {string} context - 오류 발생 시 표시할 컨텍스트
     * @returns {HTMLElement|null} 찾은 요소 또는 null
     */
    safeGetElementById(id, context = '') {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`AddLogTab: ${context}에서 요소를 찾을 수 없습니다: ${id}`);
        }
        return element;
    }

    /**
     * 폼 제출을 처리합니다
     * @description 폼 검증, 데이터 수집, 저장, 피드백을 순차적으로 처리합니다
     */
    async handleSubmit() {
        // 탭이 정리되었는지 확인
        if (!this.isInitialized || !this.container) {
            console.warn('AddLogTab: 탭이 초기화되지 않았거나 정리되었습니다.');
            return;
        }

        if (!this.validateForm()) {
            return;
        }
        
        const form = this.safeGetElementById('add-log-form', '폼 제출');
        if (!form) {
            console.error('AddLogTab: 폼을 찾을 수 없어 제출을 중단합니다.');
            return;
        }

        const formData = new FormData(form);
        
        // 폼 데이터 수집
        this.formData = {
            country: formData.get('country')?.trim() || '',
            city: formData.get('city')?.trim() || '',
            startDate: formData.get('startDate') || '',
            endDate: formData.get('endDate') || '',
            purpose: formData.get('purpose') || '',
            rating: formData.get('rating') || '',
            travelStyle: formData.get('travelStyle') || '',
            memo: formData.get('memo')?.trim() || ''
        };
        
        try {
            // 제출 버튼 비활성화
            const submitBtn = this.safeGetElementById('submit-btn', '제출 버튼 비활성화');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = FORM_CONFIG.messages.saving;
            }
            
            // 실제 저장 로직은 향후 구현 예정
            await this.saveLog();
            
            // 성공 메시지 표시
            this.showSuccessMessage();
            
            // 폼 초기화
            this.resetForm();
            
        } catch (error) {
            console.error('일지 저장 실패:', error);
            this.showErrorMessage('일지 저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            // 제출 버튼 활성화
            const submitBtn = this.safeGetElementById('submit-btn', '제출 버튼 활성화');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = FORM_CONFIG.messages.submit;
            }
        }
    }
    
    /**
     * 일지 데이터를 저장합니다
     * @returns {Promise<boolean>} 저장 성공 여부
     * @description 현재는 시뮬레이션만 구현되어 있습니다
     */
    async saveLog() {
        // 실제 저장 로직은 향후 구현 예정
        // 현재는 가상의 지연 시간만 추가
        await new Promise(resolve => setTimeout(resolve, FORM_CONFIG.ui.loadingDelay));
        
        console.log('저장된 일지 데이터:', this.formData);
        
        // 로컬 스토리지에 저장
        try {
            const existingLogs = JSON.parse(localStorage.getItem('travelLogs') || '[]');
            const newLog = {
                id: Date.now().toString(),
                ...this.formData,
                createdAt: new Date().toISOString()
            };
            
            existingLogs.unshift(newLog); // 맨 앞에 추가 (최신 순)
            localStorage.setItem('travelLogs', JSON.stringify(existingLogs));
            
            console.log('로컬 스토리지에 저장 완료:', newLog);
        } catch (error) {
            console.error('로컬 스토리지 저장 실패:', error);
        }
        
        // 성공 시뮬레이션
        return true;
    }
    
    /**
     * 성공 메시지를 표시합니다
     * @description 설정 파일의 지속 시간을 사용하여 메시지를 표시합니다
     */
    showSuccessMessage() {
        // 컨테이너가 유효한지 확인
        if (!this.container) {
            console.warn('AddLogTab: 컨테이너가 없어 성공 메시지를 표시할 수 없습니다.');
            return;
        }

        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <div class="success-content">
                <span class="success-icon">✅</span>
                <span class="success-text">${FORM_CONFIG.messages.success}</span>
            </div>
        `;
        
        this.container.appendChild(message);
        
        // 설정된 시간 후 자동 제거
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, FORM_CONFIG.ui.successMessageDuration);
    }
    
    /**
     * 에러 메시지를 표시합니다
     * @param {string} errorText - 표시할 에러 메시지
     * @description 설정 파일의 지속 시간을 사용하여 메시지를 표시합니다
     */
    showErrorMessage(errorText) {
        // 컨테이너가 유효한지 확인
        if (!this.container) {
            console.warn('AddLogTab: 컨테이너가 없어 에러 메시지를 표시할 수 없습니다.');
            return;
        }

        const message = document.createElement('div');
        message.className = 'error-message';
        message.innerHTML = `
            <div class="error-content">
                <span class="error-icon">❌</span>
                <span class="error-text">${errorText}</span>
            </div>
        `;
        
        this.container.appendChild(message);
        
        // 설정된 시간 후 자동 제거
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, FORM_CONFIG.ui.errorMessageDuration);
    }
    
    /**
     * 폼을 초기 상태로 리셋합니다
     * @description 모든 입력 필드, 에러 메시지, 상태를 초기화합니다
     */
    resetForm() {
        const form = this.safeGetElementById('add-log-form', '폼 리셋');
        if (!form) {
            console.warn('AddLogTab: 폼을 찾을 수 없어 리셋을 건너뜁니다.');
            return;
        }

        form.reset();
        
        // CountrySelector 초기화
        if (this.countrySelector) {
            try {
                this.countrySelector.close();
                // CountrySelector의 입력 필드 초기화
                const selectorInput = this.countrySelector.input;
                if (selectorInput) {
                    selectorInput.value = '';
                }
            } catch (error) {
                console.warn('AddLogTab: CountrySelector 초기화 중 오류:', error);
            }
        }
        
        // 도시 입력 필드 비활성화
        const cityInput = this.safeGetElementById('city', '도시 입력 필드');
        if (cityInput) {
            cityInput.disabled = true;
            cityInput.placeholder = '국가를 먼저 선택해주세요';
        }
        
        // 종료일 입력 필드 비활성화 및 제한 해제
        const endDateInput = this.safeGetElementById('endDate', '종료일 입력 필드');
        if (endDateInput) {
            endDateInput.disabled = true;
            endDateInput.min = '';
        }
        
        // 글자 수 카운터 초기화
        const charCount = this.safeGetElementById('char-count', '글자 수 카운터');
        if (charCount) {
            charCount.textContent = '0';
        }
        
        // 별점 초기화
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => star.classList.remove('filled'));
        const ratingInput = this.safeGetElementById('rating-input', '별점 입력');
        if (ratingInput) {
            ratingInput.value = '';
        }
        
        // 모든 에러 메시지 숨기기
        const errorElements = document.querySelectorAll('.form-error');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
        
        // 검증 에러 상태 초기화
        this.validationErrors = {};
        
        // 폼 데이터 초기화
        this.formData = {
            country: '',
            city: '',
            startDate: '',
            endDate: '',
            purpose: '',
            rating: '',
            travelStyle: '',
            memo: ''
        };
    }
    
    /**
     * 스크롤을 맨 위로 즉시 이동시킵니다
     */
    scrollToTop() {
        requestAnimationFrame(() => {
            window.scrollTo({ 
                top: 0, 
                left: 0, 
                behavior: 'instant' 
            });
        });
    }
    
    /**
     * 탭을 정리하고 메모리를 해제합니다
     * @description 등록된 이벤트 리스너를 제거하고 상태를 초기화합니다
     */
    async cleanup() {
        // CountrySelector 정리
        if (this.countrySelector) {
            try {
                this.countrySelector.destroy();
                this.countrySelector = null;
            } catch (error) {
                console.warn('AddLogTab: CountrySelector 정리 중 오류 발생:', error);
            }
        }
        
        // 이벤트 리스너 정리
        this.eventListeners.forEach(listener => {
            try {
                if (listener.element && listener.event && listener.handler) {
                    // DOM 요소가 여전히 유효한지 확인
                    if (listener.element.nodeType === Node.ELEMENT_NODE) {
                        listener.element.removeEventListener(listener.event, listener.handler);
                    }
                }
            } catch (error) {
                console.warn('AddLogTab: 이벤트 리스너 제거 중 오류 발생:', error);
            }
        });
        
        this.eventListeners = [];
        this.isInitialized = false;
        this.formData = {};
        this.validationErrors = {};
        
        // 메모리 정리
        this.container = null;
    }
}

export default new AddLogTab();
