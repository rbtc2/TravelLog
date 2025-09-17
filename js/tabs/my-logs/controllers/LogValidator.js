/**
 * LogValidator - 로그 데이터 유효성 검증 전용 클래스
 * 
 * 🎯 책임:
 * - 로그 데이터 유효성 검증
 * - 날짜 형식 및 범위 검증
 * - 필수 필드 검증
 * - 데이터 타입 검증
 * 
 * @class LogValidator
 * @version 1.0.0
 * @since 2024-12-29
 */

class LogValidator {
    constructor() {
        this.isInitialized = false;
        this.validationRules = {
            required: ['country', 'startDate', 'endDate'],
            optional: ['city', 'purpose', 'rating', 'notes', 'photos'],
            dateFormat: 'YYYY-MM-DD',
            ratingRange: { min: 1, max: 5 },
            notesMaxLength: 1000
        };
    }

    /**
     * 검증기 초기화
     */
    async initialize() {
        try {
            console.log('LogValidator: 초기화 시작');
            this.isInitialized = true;
            console.log('LogValidator: 초기화 완료');
        } catch (error) {
            console.error('LogValidator: 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 로그 데이터의 유효성을 검증합니다
     * @param {Object} logData - 검증할 로그 데이터
     * @param {Object} existingLog - 기존 로그 데이터 (업데이트 시)
     * @returns {Object} 검증 결과
     */
    validateLogData(logData, existingLog = null) {
        const errors = [];
        const warnings = [];

        try {
            // 기본 데이터 타입 검증
            if (!logData || typeof logData !== 'object') {
                errors.push('로그 데이터가 올바르지 않습니다.');
                return { isValid: false, errors, warnings };
            }

            // 필수 필드 검증
            const requiredErrors = this._validateRequiredFields(logData);
            errors.push(...requiredErrors);

            // 날짜 검증
            const dateErrors = this._validateDates(logData);
            errors.push(...dateErrors);

            // 국가 코드 검증
            const countryErrors = this._validateCountry(logData.country);
            errors.push(...countryErrors);

            // 도시 검증
            const cityErrors = this._validateCity(logData.city);
            errors.push(...cityErrors);

            // 목적 검증
            const purposeErrors = this._validatePurpose(logData.purpose);
            errors.push(...purposeErrors);

            // 별점 검증
            const ratingErrors = this._validateRating(logData.rating);
            errors.push(...ratingErrors);

            // 메모 검증
            const notesErrors = this._validateNotes(logData.notes);
            errors.push(...notesErrors);

            // 사진 검증
            const photosErrors = this._validatePhotos(logData.photos);
            errors.push(...photosErrors);

            // 업데이트 시 추가 검증
            if (existingLog) {
                const updateErrors = this._validateUpdateData(logData, existingLog);
                errors.push(...updateErrors);
            }

            // 경고사항 검증
            const warningMessages = this._validateWarnings(logData);
            warnings.push(...warningMessages);

            return {
                isValid: errors.length === 0,
                errors,
                warnings
            };

        } catch (error) {
            console.error('LogValidator: validateLogData 실패:', error);
            return {
                isValid: false,
                errors: ['데이터 검증 중 오류가 발생했습니다.'],
                warnings
            };
        }
    }

    /**
     * 필수 필드 검증
     * @param {Object} logData - 로그 데이터
     * @returns {Array} 에러 메시지 배열
     * @private
     */
    _validateRequiredFields(logData) {
        const errors = [];

        this.validationRules.required.forEach(field => {
            if (!logData[field] || logData[field].toString().trim() === '') {
                errors.push(`${this._getFieldDisplayName(field)}은(는) 필수 입력 항목입니다.`);
            }
        });

        return errors;
    }

    /**
     * 날짜 검증
     * @param {Object} logData - 로그 데이터
     * @returns {Array} 에러 메시지 배열
     * @private
     */
    _validateDates(logData) {
        const errors = [];

        if (!logData.startDate || !logData.endDate) {
            return errors; // 필수 필드 검증에서 처리됨
        }

        // 날짜 형식 검증
        const startDate = this._parseDate(logData.startDate);
        const endDate = this._parseDate(logData.endDate);

        if (!startDate) {
            errors.push('시작일 형식이 올바르지 않습니다. (YYYY-MM-DD 형식)');
        }

        if (!endDate) {
            errors.push('종료일 형식이 올바르지 않습니다. (YYYY-MM-DD 형식)');
        }

        if (startDate && endDate) {
            // 날짜 범위 검증
            if (startDate > endDate) {
                errors.push('시작일은 종료일보다 이전이어야 합니다.');
            }

            // 미래 날짜 검증
            const today = new Date();
            today.setHours(23, 59, 59, 999); // 오늘 끝까지 허용

            if (startDate > today) {
                errors.push('시작일은 오늘 이후일 수 없습니다.');
            }

            if (endDate > today) {
                errors.push('종료일은 오늘 이후일 수 없습니다.');
            }

            // 과거 날짜 검증 (너무 오래된 날짜)
            const minDate = new Date('1900-01-01');
            if (startDate < minDate) {
                errors.push('시작일이 너무 오래되었습니다.');
            }

            if (endDate < minDate) {
                errors.push('종료일이 너무 오래되었습니다.');
            }

            // 여행 기간 검증 (너무 긴 여행)
            const maxDays = 365; // 1년
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            if (diffDays > maxDays) {
                errors.push(`여행 기간이 너무 깁니다. (최대 ${maxDays}일)`);
            }
        }

        return errors;
    }

    /**
     * 국가 코드 검증
     * @param {string} country - 국가 코드
     * @returns {Array} 에러 메시지 배열
     * @private
     */
    _validateCountry(country) {
        const errors = [];

        if (!country) {
            return errors; // 필수 필드 검증에서 처리됨
        }

        // 국가 코드 형식 검증 (2자리 대문자)
        if (!/^[A-Z]{2}$/.test(country)) {
            errors.push('국가 코드는 2자리 대문자여야 합니다. (예: KR, US, JP)');
        }

        return errors;
    }

    /**
     * 도시 검증
     * @param {string} city - 도시명
     * @returns {Array} 에러 메시지 배열
     * @private
     */
    _validateCity(city) {
        const errors = [];

        if (!city) {
            return errors; // 선택 필드
        }

        // 도시명 길이 검증
        if (city.length > 50) {
            errors.push('도시명은 50자를 초과할 수 없습니다.');
        }

        // 도시명 형식 검증 (문자, 공백, 하이픈, 점만 허용)
        if (!/^[a-zA-Z가-힣\s\-\.]+$/.test(city)) {
            errors.push('도시명에 사용할 수 없는 문자가 포함되어 있습니다.');
        }

        return errors;
    }

    /**
     * 목적 검증
     * @param {string} purpose - 여행 목적
     * @returns {Array} 에러 메시지 배열
     * @private
     */
    _validatePurpose(purpose) {
        const errors = [];

        if (!purpose) {
            return errors; // 선택 필드
        }

        // 목적 길이 검증
        if (purpose.length > 100) {
            errors.push('여행 목적은 100자를 초과할 수 없습니다.');
        }

        // 유효한 목적 값 검증
        const validPurposes = [
            '관광', '비즈니스', '방문', '학습', '휴양', '의료', '기타'
        ];

        if (!validPurposes.includes(purpose)) {
            errors.push(`여행 목적은 다음 중 하나여야 합니다: ${validPurposes.join(', ')}`);
        }

        return errors;
    }

    /**
     * 별점 검증
     * @param {number} rating - 별점
     * @returns {Array} 에러 메시지 배열
     * @private
     */
    _validateRating(rating) {
        const errors = [];

        if (rating === undefined || rating === null) {
            return errors; // 선택 필드
        }

        // 숫자 타입 검증
        if (typeof rating !== 'number') {
            errors.push('별점은 숫자여야 합니다.');
            return errors;
        }

        // 별점 범위 검증
        const { min, max } = this.validationRules.ratingRange;
        if (rating < min || rating > max) {
            errors.push(`별점은 ${min}점에서 ${max}점 사이여야 합니다.`);
        }

        // 소수점 자릿수 검증 (최대 1자리)
        if (rating % 0.5 !== 0) {
            errors.push('별점은 0.5점 단위로 입력해주세요.');
        }

        return errors;
    }

    /**
     * 메모 검증
     * @param {string} notes - 메모
     * @returns {Array} 에러 메시지 배열
     * @private
     */
    _validateNotes(notes) {
        const errors = [];

        if (!notes) {
            return errors; // 선택 필드
        }

        // 메모 길이 검증
        if (notes.length > this.validationRules.notesMaxLength) {
            errors.push(`메모는 ${this.validationRules.notesMaxLength}자를 초과할 수 없습니다.`);
        }

        return errors;
    }

    /**
     * 사진 검증
     * @param {Array} photos - 사진 배열
     * @returns {Array} 에러 메시지 배열
     * @private
     */
    _validatePhotos(photos) {
        const errors = [];

        if (!photos) {
            return errors; // 선택 필드
        }

        // 배열 타입 검증
        if (!Array.isArray(photos)) {
            errors.push('사진은 배열 형태여야 합니다.');
            return errors;
        }

        // 사진 개수 검증
        if (photos.length > 20) {
            errors.push('사진은 최대 20장까지 업로드할 수 있습니다.');
        }

        // 각 사진 URL 검증
        photos.forEach((photo, index) => {
            if (typeof photo !== 'string') {
                errors.push(`사진 ${index + 1}의 URL이 올바르지 않습니다.`);
            } else if (!this._isValidUrl(photo)) {
                errors.push(`사진 ${index + 1}의 URL 형식이 올바르지 않습니다.`);
            }
        });

        return errors;
    }

    /**
     * 업데이트 데이터 검증
     * @param {Object} newData - 새로운 데이터
     * @param {Object} existingData - 기존 데이터
     * @returns {Array} 에러 메시지 배열
     * @private
     */
    _validateUpdateData(newData, existingData) {
        const errors = [];

        // ID 변경 방지
        if (newData.id && newData.id !== existingData.id) {
            errors.push('로그 ID는 변경할 수 없습니다.');
        }

        // 생성일 변경 방지
        if (newData.createdAt && newData.createdAt !== existingData.createdAt) {
            errors.push('생성일은 변경할 수 없습니다.');
        }

        return errors;
    }

    /**
     * 경고사항 검증
     * @param {Object} logData - 로그 데이터
     * @returns {Array} 경고 메시지 배열
     * @private
     */
    _validateWarnings(logData) {
        const warnings = [];

        // 여행 기간이 매우 짧은 경우
        if (logData.startDate && logData.endDate) {
            const startDate = this._parseDate(logData.startDate);
            const endDate = this._parseDate(logData.endDate);
            
            if (startDate && endDate) {
                const diffTime = Math.abs(endDate - startDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                
                if (diffDays === 1) {
                    warnings.push('여행 기간이 1일입니다. 당일 여행인지 확인해주세요.');
                }
            }
        }

        // 별점이 없는 경우
        if (!logData.rating) {
            warnings.push('별점을 입력하면 더 나은 통계를 제공할 수 있습니다.');
        }

        // 메모가 없는 경우
        if (!logData.notes || logData.notes.trim() === '') {
            warnings.push('여행에 대한 메모를 남기면 나중에 좋은 추억이 될 것입니다.');
        }

        return warnings;
    }

    /**
     * 날짜 파싱
     * @param {string} dateString - 날짜 문자열
     * @returns {Date|null} 파싱된 날짜 또는 null
     * @private
     */
    _parseDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return null;
            }
            return date;
        } catch (error) {
            return null;
        }
    }

    /**
     * URL 유효성 검증
     * @param {string} url - URL 문자열
     * @returns {boolean} 유효성 여부
     * @private
     */
    _isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 필드 표시명 반환
     * @param {string} field - 필드명
     * @returns {string} 표시명
     * @private
     */
    _getFieldDisplayName(field) {
        const displayNames = {
            country: '국가',
            startDate: '시작일',
            endDate: '종료일',
            city: '도시',
            purpose: '여행 목적',
            rating: '별점',
            notes: '메모',
            photos: '사진'
        };
        return displayNames[field] || field;
    }

    /**
     * 검증기 정리
     */
    cleanup() {
        this.isInitialized = false;
    }
}

export { LogValidator };
