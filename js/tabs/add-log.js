/**
 * 일지 추가 탭 모듈
 * 독립적으로 동작하며, 다른 탭에 영향을 주지 않음
 * 메모리 누수 없는 마운트/언마운트 구현
 */

class AddLogTab {
    constructor() {
        this.isInitialized = false;
        this.eventListeners = [];
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
        this.validationErrors = {};
    }
    
    render(container) {
        this.container = container;
        this.renderContent();
        this.bindEvents();
        this.isInitialized = true;
    }
    
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
                            placeholder="예: Japan / 일본"
                            maxlength="56"
                            required
                        >
                        <div class="form-hint">나중에 선택형으로 전환 예정</div>
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
                            placeholder="도시명을 입력하세요"
                            maxlength="85"
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
                            <label class="chip-label">
                                <input type="radio" name="purpose" value="tourism" required>
                                <span class="chip-custom">
                                    <span class="chip-icon">🏖️</span>
                                    <span class="chip-text">관광/여행</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="purpose" value="business" required>
                                <span class="chip-custom">
                                    <span class="chip-icon">💼</span>
                                    <span class="chip-text">업무/출장</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="purpose" value="family" required>
                                <span class="chip-custom">
                                    <span class="chip-icon">👨‍👩‍👧‍👦</span>
                                    <span class="chip-text">가족/지인 방문</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="purpose" value="study" required>
                                <span class="chip-custom">
                                    <span class="chip-icon">📚</span>
                                    <span class="chip-text">학업</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="purpose" value="work" required>
                                <span class="chip-custom">
                                    <span class="chip-icon">💻</span>
                                    <span class="chip-text">취업/근로</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="purpose" value="training" required>
                                <span class="chip-custom">
                                    <span class="chip-icon">🎯</span>
                                    <span class="chip-text">파견/연수</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="purpose" value="event" required>
                                <span class="chip-custom">
                                    <span class="chip-icon">🎪</span>
                                    <span class="chip-text">행사/컨퍼런스</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="purpose" value="volunteer" required>
                                <span class="chip-custom">
                                    <span class="chip-icon">🤝</span>
                                    <span class="chip-text">봉사활동</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="purpose" value="medical" required>
                                <span class="chip-custom">
                                    <span class="chip-icon">🏥</span>
                                    <span class="chip-text">의료</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="purpose" value="transit" required>
                                <span class="chip-custom">
                                    <span class="chip-icon">✈️</span>
                                    <span class="chip-text">경유/환승</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="purpose" value="research" required>
                                <span class="chip-custom">
                                    <span class="chip-icon">🔬</span>
                                    <span class="chip-text">연구/학술</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="purpose" value="immigration" required>
                                <span class="chip-custom">
                                    <span class="chip-icon">🏠</span>
                                    <span class="chip-text">이주/정착</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="purpose" value="other" required>
                                <span class="chip-custom">
                                    <span class="chip-icon">❓</span>
                                    <span class="chip-text">기타</span>
                                </span>
                            </label>
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
                            <label class="chip-label">
                                <input type="radio" name="travelStyle" value="alone">
                                <span class="chip-custom">
                                    <span class="chip-icon">👤</span>
                                    <span class="chip-text">혼자</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="travelStyle" value="family">
                                <span class="chip-custom">
                                    <span class="chip-icon">👨‍👩‍👧‍👦</span>
                                    <span class="chip-text">가족과</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="travelStyle" value="couple">
                                <span class="chip-custom">
                                    <span class="chip-icon">💑</span>
                                    <span class="chip-text">연인과</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="travelStyle" value="friends">
                                <span class="chip-custom">
                                    <span class="chip-icon">👥</span>
                                    <span class="chip-text">친구와</span>
                                </span>
                            </label>
                            <label class="chip-label">
                                <input type="radio" name="travelStyle" value="colleagues">
                                <span class="chip-custom">
                                    <span class="chip-icon">👔</span>
                                    <span class="chip-text">동료와</span>
                                </span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- 메모 -->
                    <div class="form-group">
                        <label for="memo" class="form-label">메모</label>
                        <textarea 
                            id="memo" 
                            name="memo" 
                            class="form-textarea" 
                            placeholder="여행에 대한 메모를 작성하세요 (최대 300자)"
                            maxlength="300"
                            rows="4"
                        ></textarea>
                        <div class="char-counter">
                            <span id="char-count">0</span>/300
                        </div>
                        <div class="form-error" id="memo-error"></div>
                    </div>
                    
                    <!-- 제출 버튼 -->
                    <div class="form-actions">
                        <button type="submit" class="submit-btn" id="submit-btn">
                            📝 일지 저장하기
                        </button>
                        <button type="button" class="reset-btn" id="reset-btn">
                            🔄 초기화
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
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
    
    bindStarRating() {
        const starRating = document.getElementById('star-rating');
        const stars = starRating.querySelectorAll('.star');
        const ratingInput = document.getElementById('rating-input');
        
        let currentRating = 0;
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
    
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }
    
    validateField(fieldName, value) {
        let isValid = true;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'country':
                if (!value) {
                    isValid = false;
                    errorMessage = '국가를 입력해주세요';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = '국가는 2자 이상 입력해주세요';
                } else if (value.length > 56) {
                    isValid = false;
                    errorMessage = '국가는 56자 이하로 입력해주세요';
                }
                break;
                
            case 'city':
                if (!value) {
                    isValid = false;
                    errorMessage = '도시를 입력해주세요';
                } else if (value.length < 1) {
                    isValid = false;
                    errorMessage = '도시는 1자 이상 입력해주세요';
                } else if (value.length > 85) {
                    isValid = false;
                    errorMessage = '도시는 85자 이하로 입력해주세요';
                }
                break;
        }
        
        this.showFieldError(fieldName, errorMessage);
        this.validationErrors[fieldName] = !isValid;
        
        return isValid;
    }
    
    validateDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (end < start) {
            this.showFieldError('endDate', '종료일은 시작일 이후여야 합니다');
            this.validationErrors['endDate'] = true;
            return false;
        }
        
        this.showFieldError('endDate', '');
        this.validationErrors['endDate'] = false;
        return true;
    }
    
    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = message ? 'block' : 'none';
        }
    }
    
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
            this.showFieldError('startDate', '시작일을 선택해주세요');
            this.validationErrors['startDate'] = true;
            isValid = false;
        } else {
            this.showFieldError('startDate', '');
            this.validationErrors['startDate'] = false;
        }
        
        // 종료일 검증
        const endDate = formData.get('endDate');
        if (!endDate) {
            this.showFieldError('endDate', '종료일을 선택해주세요');
            this.validationErrors['endDate'] = true;
            isValid = false;
        } else if (startDate && !this.validateDateRange(startDate, endDate)) {
            isValid = false;
        }
        
        // 목적 검증
        const purpose = formData.get('purpose');
        if (!purpose) {
            this.showFieldError('purpose', '체류 목적을 선택해주세요');
            this.validationErrors['purpose'] = true;
            isValid = false;
        } else {
            this.showFieldError('purpose', '');
            this.validationErrors['purpose'] = false;
        }
        
        // 별점 검증
        const rating = formData.get('rating');
        if (!rating) {
            this.showFieldError('rating', '별점을 선택해주세요');
            this.validationErrors['rating'] = true;
            isValid = false;
        } else {
            this.showFieldError('rating', '');
            this.validationErrors['rating'] = false;
        }
        
        return isValid;
    }
    
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
            submitBtn.textContent = '저장 중...';
            
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
            submitBtn.textContent = '📝 일지 저장하기';
        }
    }
    
    async saveLog() {
        // 실제 저장 로직은 향후 구현 예정
        // 현재는 가상의 지연 시간만 추가
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('저장된 일지 데이터:', this.formData);
        
        // 성공 시뮬레이션
        return true;
    }
    
    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <div class="success-content">
                <span class="success-icon">✅</span>
                <span class="success-text">일지가 성공적으로 저장되었습니다!</span>
            </div>
        `;
        
        this.container.appendChild(message);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
    
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
        
        // 5초 후 자동 제거
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 5000);
    }
    
    resetForm() {
        const form = document.getElementById('add-log-form');
        form.reset();
        
        // 도시 입력 필드 비활성화
        const cityInput = document.getElementById('city');
        cityInput.disabled = true;
        
        // 종료일 입력 필드 비활성화
        const endDateInput = document.getElementById('endDate');
        endDateInput.disabled = true;
        
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
