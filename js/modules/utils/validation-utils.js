/**
 * ValidationUtils - 데이터 검증 관련 유틸리티 함수들을 제공
 * 
 * 🎯 책임:
 * - 입력 데이터 유효성 검증
 * - 필수 필드 검증
 * - 데이터 타입 검증
 * - 비즈니스 로직 검증
 * 
 * @class ValidationUtils
 * @version 1.0.0
 * @since 2024-12-29
 */
class ValidationUtils {
    // 유효성 검증 규칙
    static VALIDATION_RULES = {
        // 여행 목적
        PURPOSE: ['tourism', 'business', 'family', 'study', 'work', 'training', 'event', 'volunteer', 'medical', 'transit', 'research', 'immigration', 'other'],
        
        // 평점 범위
        RATING: { min: 0, max: 5 },
        
        // 문자열 길이 제한
        STRING_LIMITS: {
            country: { min: 2, max: 3 },    // 국가 코드
            city: { min: 1, max: 100 },     // 도시명
            title: { min: 1, max: 200 },    // 제목
            description: { min: 0, max: 2000 }, // 설명
            purpose: { min: 1, max: 50 }    // 목적
        },
        
        // 날짜 제한
        DATE_LIMITS: {
            minYear: 1900,
            maxYear: new Date().getFullYear() + 10
        }
    };

    /**
     * 여행 로그 데이터를 검증합니다
     * @param {Object} logData - 검증할 로그 데이터
     * @returns {Object} 검증 결과
     */
    static validateTravelLog(logData) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        try {
            if (!logData || typeof logData !== 'object') {
                result.isValid = false;
                result.errors.push('로그 데이터가 유효하지 않습니다');
                return result;
            }

            // 필수 필드 검증
            this._validateRequiredFields(logData, result);
            
            // 날짜 검증
            this._validateDates(logData, result);
            
            // 국가 및 도시 검증
            this._validateLocation(logData, result);
            
            // 평점 검증
            this._validateRating(logData, result);
            
            // 목적 검증
            this._validatePurpose(logData, result);
            
            // 문자열 길이 검증
            this._validateStringLengths(logData, result);
            
            // 비즈니스 로직 검증
            this._validateBusinessRules(logData, result);

            result.isValid = result.errors.length === 0;
            return result;

        } catch (error) {
            console.error('로그 데이터 검증 중 오류:', error);
            return {
                isValid: false,
                errors: ['검증 중 오류가 발생했습니다'],
                warnings: []
            };
        }
    }

    /**
     * 필수 필드를 검증합니다
     * @param {Object} logData - 로그 데이터
     * @param {Object} result - 검증 결과 객체
     * @private
     */
    static _validateRequiredFields(logData, result) {
        const requiredFields = ['country', 'city', 'startDate', 'endDate'];
        
        requiredFields.forEach(field => {
            if (!logData[field] || (typeof logData[field] === 'string' && logData[field].trim() === '')) {
                result.errors.push(`${this._getFieldDisplayName(field)}는 필수 항목입니다`);
            }
        });
    }

    /**
     * 날짜를 검증합니다
     * @param {Object} logData - 로그 데이터
     * @param {Object} result - 검증 결과 객체
     * @private
     */
    static _validateDates(logData, result) {
        const { startDate, endDate } = logData;
        
        // 날짜 유효성 검증
        if (startDate && !this.isValidDate(startDate)) {
            result.errors.push('시작 날짜가 유효하지 않습니다');
        }
        
        if (endDate && !this.isValidDate(endDate)) {
            result.errors.push('종료 날짜가 유효하지 않습니다');
        }
        
        // 날짜 순서 검증
        if (startDate && endDate && this.isValidDate(startDate) && this.isValidDate(endDate)) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (end < start) {
                result.errors.push('종료 날짜가 시작 날짜보다 이릅니다');
            }
            
            // 미래 날짜 경고
            const now = new Date();
            if (start > now) {
                result.warnings.push('시작 날짜가 미래입니다');
            }
            
            // 너무 긴 여행 기간 경고
            const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            if (daysDiff > 365) {
                result.warnings.push('여행 기간이 1년을 초과합니다');
            }
            
            // 연도 범위 검증
            const startYear = start.getFullYear();
            const endYear = end.getFullYear();
            
            if (startYear < this.VALIDATION_RULES.DATE_LIMITS.minYear || 
                startYear > this.VALIDATION_RULES.DATE_LIMITS.maxYear) {
                result.errors.push(`시작 날짜 연도는 ${this.VALIDATION_RULES.DATE_LIMITS.minYear}-${this.VALIDATION_RULES.DATE_LIMITS.maxYear} 범위여야 합니다`);
            }
            
            if (endYear < this.VALIDATION_RULES.DATE_LIMITS.minYear || 
                endYear > this.VALIDATION_RULES.DATE_LIMITS.maxYear) {
                result.errors.push(`종료 날짜 연도는 ${this.VALIDATION_RULES.DATE_LIMITS.minYear}-${this.VALIDATION_RULES.DATE_LIMITS.maxYear} 범위여야 합니다`);
            }
        }
    }

    /**
     * 위치 정보를 검증합니다
     * @param {Object} logData - 로그 데이터
     * @param {Object} result - 검증 결과 객체
     * @private
     */
    static _validateLocation(logData, result) {
        const { country, city } = logData;
        
        // 국가 코드 검증
        if (country) {
            if (typeof country !== 'string') {
                result.errors.push('국가 코드는 문자열이어야 합니다');
            } else {
                const countryCode = country.trim().toUpperCase();
                if (countryCode.length < this.VALIDATION_RULES.STRING_LIMITS.country.min || 
                    countryCode.length > this.VALIDATION_RULES.STRING_LIMITS.country.max) {
                    result.errors.push(`국가 코드는 ${this.VALIDATION_RULES.STRING_LIMITS.country.min}-${this.VALIDATION_RULES.STRING_LIMITS.country.max}자여야 합니다`);
                }
                
                // 영문자만 허용
                if (!/^[A-Z]+$/.test(countryCode)) {
                    result.errors.push('국가 코드는 영문자만 허용됩니다');
                }
            }
        }
        
        // 도시명 검증
        if (city) {
            if (typeof city !== 'string') {
                result.errors.push('도시명은 문자열이어야 합니다');
            } else {
                const cityName = city.trim();
                if (cityName.length < this.VALIDATION_RULES.STRING_LIMITS.city.min || 
                    cityName.length > this.VALIDATION_RULES.STRING_LIMITS.city.max) {
                    result.errors.push(`도시명은 ${this.VALIDATION_RULES.STRING_LIMITS.city.min}-${this.VALIDATION_RULES.STRING_LIMITS.city.max}자여야 합니다`);
                }
            }
        }
    }

    /**
     * 평점을 검증합니다
     * @param {Object} logData - 로그 데이터
     * @param {Object} result - 검증 결과 객체
     * @private
     */
    static _validateRating(logData, result) {
        const { rating } = logData;
        
        if (rating !== undefined && rating !== null && rating !== '') {
            const numRating = parseFloat(rating);
            
            if (isNaN(numRating)) {
                result.errors.push('평점은 숫자여야 합니다');
            } else if (numRating < this.VALIDATION_RULES.RATING.min || 
                       numRating > this.VALIDATION_RULES.RATING.max) {
                result.errors.push(`평점은 ${this.VALIDATION_RULES.RATING.min}-${this.VALIDATION_RULES.RATING.max} 범위여야 합니다`);
            }
        }
    }

    /**
     * 여행 목적을 검증합니다
     * @param {Object} logData - 로그 데이터
     * @param {Object} result - 검증 결과 객체
     * @private
     */
    static _validatePurpose(logData, result) {
        const { purpose } = logData;
        
        if (purpose) {
            if (typeof purpose !== 'string') {
                result.errors.push('여행 목적은 문자열이어야 합니다');
            } else if (!this.VALIDATION_RULES.PURPOSE.includes(purpose.trim())) {
                result.warnings.push('알 수 없는 여행 목적입니다');
            }
        }
    }

    /**
     * 문자열 길이를 검증합니다
     * @param {Object} logData - 로그 데이터
     * @param {Object} result - 검증 결과 객체
     * @private
     */
    static _validateStringLengths(logData, result) {
        const stringFields = ['title', 'description'];
        
        stringFields.forEach(field => {
            const value = logData[field];
            if (value && typeof value === 'string') {
                const limits = this.VALIDATION_RULES.STRING_LIMITS[field];
                if (limits) {
                    const length = value.trim().length;
                    if (length < limits.min || length > limits.max) {
                        result.errors.push(`${this._getFieldDisplayName(field)}는 ${limits.min}-${limits.max}자여야 합니다`);
                    }
                }
            }
        });
    }

    /**
     * 비즈니스 로직을 검증합니다
     * @param {Object} logData - 로그 데이터
     * @param {Object} result - 검증 결과 객체
     * @private
     */
    static _validateBusinessRules(logData, result) {
        // 특별한 조건들 검증
        
        // 업무 목적인데 평점이 너무 높은 경우 경고
        if (logData.purpose === 'business' && logData.rating && parseFloat(logData.rating) >= 4.5) {
            result.warnings.push('업무 목적 여행의 평점이 매우 높습니다');
        }
        
        // 의료 목적인데 기간이 너무 짧은 경우 경고
        if (logData.purpose === 'medical' && logData.startDate && logData.endDate) {
            const start = new Date(logData.startDate);
            const end = new Date(logData.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            
            if (days < 3) {
                result.warnings.push('의료 목적 여행의 기간이 짧습니다');
            }
        }
        
        // 경유인데 기간이 너무 긴 경우 경고
        if (logData.purpose === 'transit' && logData.startDate && logData.endDate) {
            const start = new Date(logData.startDate);
            const end = new Date(logData.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            
            if (days > 3) {
                result.warnings.push('경유 목적에 비해 기간이 깁니다');
            }
        }
    }

    /**
     * 필드 표시명을 반환합니다
     * @param {string} fieldName - 필드명
     * @returns {string} 표시명
     * @private
     */
    static _getFieldDisplayName(fieldName) {
        const displayNames = {
            country: '국가',
            city: '도시',
            startDate: '시작 날짜',
            endDate: '종료 날짜',
            title: '제목',
            description: '설명',
            purpose: '여행 목적',
            rating: '평점'
        };
        
        return displayNames[fieldName] || fieldName;
    }

    /**
     * 날짜가 유효한지 확인합니다
     * @param {string|Date} date - 확인할 날짜
     * @returns {boolean} 유효한 날짜인지 여부
     */
    static isValidDate(date) {
        try {
            const dateObj = new Date(date);
            return !isNaN(dateObj.getTime()) && dateObj.getTime() > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * 이메일 주소를 검증합니다
     * @param {string} email - 이메일 주소
     * @returns {boolean} 유효한 이메일인지 여부
     */
    static isValidEmail(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    /**
     * URL을 검증합니다
     * @param {string} url - URL
     * @returns {boolean} 유효한 URL인지 여부
     */
    static isValidUrl(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }
        
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 문자열이 비어있는지 확인합니다
     * @param {string} str - 확인할 문자열
     * @returns {boolean} 비어있는지 여부
     */
    static isEmpty(str) {
        return !str || (typeof str === 'string' && str.trim() === '');
    }

    /**
     * 숫자 범위를 검증합니다
     * @param {number} value - 검증할 값
     * @param {number} min - 최소값
     * @param {number} max - 최대값
     * @returns {boolean} 범위 내에 있는지 여부
     */
    static isInRange(value, min, max) {
        if (typeof value !== 'number' || isNaN(value)) {
            return false;
        }
        
        return value >= min && value <= max;
    }

    /**
     * 배열이 유효한지 확인합니다
     * @param {Array} arr - 확인할 배열
     * @param {number} minLength - 최소 길이 (선택사항)
     * @returns {boolean} 유효한 배열인지 여부
     */
    static isValidArray(arr, minLength = 0) {
        return Array.isArray(arr) && arr.length >= minLength;
    }

    /**
     * 객체가 유효한지 확인합니다
     * @param {Object} obj - 확인할 객체
     * @param {Array} requiredKeys - 필수 키 배열 (선택사항)
     * @returns {boolean} 유효한 객체인지 여부
     */
    static isValidObject(obj, requiredKeys = []) {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
            return false;
        }
        
        if (requiredKeys.length > 0) {
            return requiredKeys.every(key => obj.hasOwnProperty(key));
        }
        
        return true;
    }

    /**
     * 문자열을 정리합니다 (앞뒤 공백 제거, 특수문자 제거 등)
     * @param {string} str - 정리할 문자열
     * @param {Object} options - 정리 옵션
     * @returns {string} 정리된 문자열
     */
    static sanitizeString(str, options = {}) {
        if (!str || typeof str !== 'string') {
            return '';
        }
        
        let cleaned = str.trim();
        
        // HTML 태그 제거
        if (options.removeHtml !== false) {
            cleaned = cleaned.replace(/<[^>]*>/g, '');
        }
        
        // 연속된 공백을 하나로 변경
        if (options.normalizeSpaces !== false) {
            cleaned = cleaned.replace(/\s+/g, ' ');
        }
        
        // 특수문자 제거 (옵션)
        if (options.removeSpecialChars) {
            cleaned = cleaned.replace(/[^\w\s가-힣]/g, '');
        }
        
        // 길이 제한
        if (options.maxLength && cleaned.length > options.maxLength) {
            cleaned = cleaned.substring(0, options.maxLength);
        }
        
        return cleaned;
    }

    /**
     * 검증 규칙을 업데이트합니다
     * @param {string} ruleType - 규칙 타입
     * @param {*} newRule - 새로운 규칙
     */
    static updateValidationRule(ruleType, newRule) {
        try {
            if (this.VALIDATION_RULES.hasOwnProperty(ruleType)) {
                this.VALIDATION_RULES[ruleType] = newRule;
            }
        } catch (error) {
            console.error('검증 규칙 업데이트 오류:', error);
        }
    }

    /**
     * 모든 검증 규칙을 반환합니다
     * @returns {Object} 검증 규칙 객체
     */
    static getValidationRules() {
        return { ...this.VALIDATION_RULES };
    }
}

export { ValidationUtils };
