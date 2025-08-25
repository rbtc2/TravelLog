import { FORM_CONFIG, VALIDATION_RULES } from '../config/form-config.js';

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
    }
    
    /**
     * 탭을 컨테이너에 렌더링합니다
     * @param {HTMLElement} container - 탭을 렌더링할 컨테이너 요소
     */
    render(container) {
        this.container = container;
        this.renderContent();
        this.bindEvents();
        this.isInitialized = true;
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
                        <label for="country" class="form-label required">국가</label>
                        <input 
                            type="text" 
                            id="country" 
                            name="country" 
                            class="form-input" 
                            placeholder="${FORM_CONFIG.country.placeholder}"
                            maxlength="${FORM_CONFIG.country.maxLength}"
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
                            placeholder="${FORM_CONFIG.city.placeholder}"
                            maxlength="${FORM_CONFIG.city.maxLength}"
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
        const form = document.getElementById('add-log-form');
        const countryInput = document.getElementById('country');
        const cityInput = document.getElementById('city');
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        const memoTextarea = document.getElementById('memo');
        const submitBtn = document.getElementById('submit-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        // 국가 입력 시 도시 활성화
        this.addEventListener(countryInput, 'input', (e) => {
            const country = e.target.value.trim();
            cityInput.disabled = !country;
            
            if (!country) {
                cityInput.value = '';
                cityInput.disabled = true;
            }
            
            this.validateField('country', country);
        });
        
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
            document.getElementById('char-count').textContent = length;
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
        const starRating = document.getElementById('star-rating');
        const stars = starRating.querySelectorAll('.star');
        const ratingInput = document.getElementById('rating-input');
        
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
        const errorElement = document.getElementById(`${fieldName}-error`);
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
        const form = document.getElementById('add-log-form');
        const formData = new FormData(form);
        
        // 모든 필수 필드 검증
        let isValid = true;
        
        // 국가 검증
        const country = formData.get('country').trim();
        if (!this.validateField('country', country)) {
            isValid = false;
        }
        
        // 도시 검증
        const city = formData.get('city').trim();
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
     * 폼 제출을 처리합니다
     * @description 폼 검증, 데이터 수집, 저장, 피드백을 순차적으로 처리합니다
     */
    async handleSubmit() {
        if (!this.validateForm()) {
            return;
        }
        
        const form = document.getElementById('add-log-form');
        const formData = new FormData(form);
        
        // 폼 데이터 수집
        this.formData = {
            country: formData.get('country').trim(),
            city: formData.get('city').trim(),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            purpose: formData.get('purpose'),
            rating: formData.get('rating'),
            travelStyle: formData.get('travelStyle'),
            memo: formData.get('memo').trim()
        };
        
        try {
            // 제출 버튼 비활성화
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = FORM_CONFIG.messages.saving;
            
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
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = false;
            submitBtn.textContent = FORM_CONFIG.messages.submit;
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
        const form = document.getElementById('add-log-form');
        form.reset();
        
        // 도시 입력 필드 비활성화
        const cityInput = document.getElementById('city');
        cityInput.disabled = true;
        
        // 종료일 입력 필드 비활성화 및 제한 해제
        const endDateInput = document.getElementById('endDate');
        endDateInput.disabled = true;
        endDateInput.min = '';
        
        // 글자 수 카운터 초기화
        document.getElementById('char-count').textContent = '0';
        
        // 별점 초기화
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => star.classList.remove('filled'));
        document.getElementById('rating-input').value = '';
        
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
     * 탭을 정리하고 메모리를 해제합니다
     * @description 등록된 이벤트 리스너를 제거하고 상태를 초기화합니다
     */
    async cleanup() {
        // 이벤트 리스너 정리
        this.eventListeners.forEach(listener => {
            if (listener.element && listener.event && listener.handler) {
                listener.element.removeEventListener(listener.event, listener.handler);
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
