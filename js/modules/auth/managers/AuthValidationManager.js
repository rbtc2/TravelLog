/**
 * 인증 유효성 검사 관리자
 * @class AuthValidationManager
 * @version 1.0.0
 * @since 2024-12-29
 */
export class AuthValidationManager {
    constructor() {
        this.validationRules = new Map();
        this.errorMessages = new Map();
        this.setupDefaultRules();
    }

    /**
     * 기본 유효성 검사 규칙을 설정합니다
     */
    setupDefaultRules() {
        // 이메일 유효성 검사
        this.addRule('email', {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: '올바른 이메일 형식이 아닙니다.'
        });

        // 비밀번호 유효성 검사
        this.addRule('password', {
            required: true,
            minLength: 6,
            message: '비밀번호는 최소 6자 이상이어야 합니다.'
        });

        // 이름 유효성 검사
        this.addRule('fullName', {
            required: true,
            minLength: 2,
            pattern: /^[가-힣a-zA-Z\s]+$/,
            message: '이름은 2자 이상의 한글 또는 영문이어야 합니다.'
        });

        // 비밀번호 확인 유효성 검사
        this.addRule('confirmPassword', {
            required: true,
            message: '비밀번호 확인이 필요합니다.'
        });
    }

    /**
     * 유효성 검사 규칙을 추가합니다
     * @param {string} fieldName - 필드명
     * @param {Object} rule - 유효성 검사 규칙
     */
    addRule(fieldName, rule) {
        this.validationRules.set(fieldName, rule);
    }

    /**
     * 오류 메시지를 설정합니다
     * @param {string} fieldName - 필드명
     * @param {string} message - 오류 메시지
     */
    setErrorMessage(fieldName, message) {
        this.errorMessages.set(fieldName, message);
    }

    /**
     * 필드의 유효성을 검사합니다
     * @param {string} fieldName - 필드명
     * @param {string} value - 값
     * @param {Object} context - 추가 컨텍스트 (비밀번호 확인 등)
     * @returns {Object} 검사 결과
     */
    validateField(fieldName, value, context = {}) {
        const rule = this.validationRules.get(fieldName);
        if (!rule) {
            return { isValid: true, message: '' };
        }

        // 필수 필드 검사
        if (rule.required && (!value || value.trim() === '')) {
            return {
                isValid: false,
                message: this.errorMessages.get(fieldName) || `${fieldName}은(는) 필수입니다.`
            };
        }

        // 값이 없는 경우 (선택적 필드)
        if (!value || value.trim() === '') {
            return { isValid: true, message: '' };
        }

        // 최소 길이 검사
        if (rule.minLength && value.length < rule.minLength) {
            return {
                isValid: false,
                message: this.errorMessages.get(fieldName) || rule.message
            };
        }

        // 최대 길이 검사
        if (rule.maxLength && value.length > rule.maxLength) {
            return {
                isValid: false,
                message: this.errorMessages.get(fieldName) || rule.message
            };
        }

        // 패턴 검사
        if (rule.pattern && !rule.pattern.test(value)) {
            return {
                isValid: false,
                message: this.errorMessages.get(fieldName) || rule.message
            };
        }

        // 비밀번호 확인 검사
        if (fieldName === 'confirmPassword' && context.password) {
            if (value !== context.password) {
                return {
                    isValid: false,
                    message: '비밀번호가 일치하지 않습니다.'
                };
            }
        }

        return { isValid: true, message: '' };
    }

    /**
     * 폼 전체의 유효성을 검사합니다
     * @param {Object} formData - 폼 데이터
     * @returns {Object} 검사 결과
     */
    validateForm(formData) {
        const errors = new Map();
        let isValid = true;

        // 각 필드 검사
        for (const [fieldName, value] of Object.entries(formData)) {
            const result = this.validateField(fieldName, value, formData);
            if (!result.isValid) {
                errors.set(fieldName, result.message);
                isValid = false;
            }
        }

        return {
            isValid,
            errors,
            firstError: errors.size > 0 ? errors.values().next().value : ''
        };
    }

    /**
     * 이메일 유효성을 검사합니다
     * @param {string} email - 이메일
     * @returns {Object} 검사 결과
     */
    validateEmail(email) {
        return this.validateField('email', email);
    }

    /**
     * 비밀번호 유효성을 검사합니다
     * @param {string} password - 비밀번호
     * @returns {Object} 검사 결과
     */
    validatePassword(password) {
        return this.validateField('password', password);
    }

    /**
     * 비밀번호 확인 유효성을 검사합니다
     * @param {string} password - 원본 비밀번호
     * @param {string} confirmPassword - 확인 비밀번호
     * @returns {Object} 검사 결과
     */
    validatePasswordConfirmation(password, confirmPassword) {
        return this.validateField('confirmPassword', confirmPassword, { password });
    }

    /**
     * 이름 유효성을 검사합니다
     * @param {string} name - 이름
     * @returns {Object} 검사 결과
     */
    validateName(name) {
        return this.validateField('fullName', name);
    }

    /**
     * 실시간 유효성 검사를 설정합니다
     * @param {HTMLElement} input - 입력 필드
     * @param {string} fieldName - 필드명
     * @param {Function} onValidation - 유효성 검사 콜백
     */
    setupRealTimeValidation(input, fieldName, onValidation) {
        if (!input) return;

        const validate = () => {
            const value = input.value;
            const result = this.validateField(fieldName, value);
            onValidation(result, input);
        };

        // 입력 이벤트에 바인딩
        input.addEventListener('input', validate);
        input.addEventListener('blur', validate);
    }

    /**
     * 폼 필드의 오류 상태를 표시합니다
     * @param {HTMLElement} input - 입력 필드
     * @param {boolean} hasError - 오류 여부
     * @param {string} message - 오류 메시지
     */
    showFieldError(input, hasError, message = '') {
        if (!input) return;

        const errorElement = input.parentNode.querySelector('.form-error');
        
        if (hasError) {
            input.classList.add('error');
            input.classList.remove('success');
            
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        } else {
            input.classList.remove('error');
            input.classList.add('success');
            
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
    }

    /**
     * 폼 필드의 성공 상태를 표시합니다
     * @param {HTMLElement} input - 입력 필드
     * @param {boolean} isSuccess - 성공 여부
     * @param {string} message - 성공 메시지
     */
    showFieldSuccess(input, isSuccess, message = '') {
        if (!input) return;

        const successElement = input.parentNode.querySelector('.form-success');
        
        if (isSuccess) {
            input.classList.add('success');
            input.classList.remove('error');
            
            if (successElement) {
                successElement.textContent = message;
                successElement.style.display = 'block';
            }
        } else {
            input.classList.remove('success');
            
            if (successElement) {
                successElement.style.display = 'none';
            }
        }
    }

    /**
     * 모든 유효성 검사 규칙을 초기화합니다
     */
    reset() {
        this.validationRules.clear();
        this.errorMessages.clear();
        this.setupDefaultRules();
    }
}
