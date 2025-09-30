/**
 * ProfileEditFormManager - 프로필 편집 폼 관리 전용 클래스
 * 
 * 🎯 책임:
 * - 폼 데이터 관리 및 상태 추적
 * - 폼 유효성 검사 (이름, 거주국, 바이오)
 * - 변경사항 감지 및 추적
 * - 폼 데이터 수집 및 변환
 * - 폼 초기화 및 리셋
 * 
 * 🔗 관계:
 * - ProfileEditView에서 사용되는 폼 관리 전용 모듈
 * - ProfileEditRenderer와 협력하여 UI 업데이트
 * - 순수 폼 로직만 담당, 비즈니스 로직은 포함하지 않음
 * 
 * @class ProfileEditFormManager
 * @version 1.0.0
 * @since 2025-09-30
 */

class ProfileEditFormManager {
    constructor() {
        // 폼 데이터 상태
        this.originalData = {};
        this.currentData = {};
        this.hasUnsavedChanges = false;
        
        // 유효성 검사 상태
        this.validationState = {
            name: { isValid: false, message: '' },
            country: { isValid: false, message: '' },
            bio: { isValid: true, message: '' } // 바이오는 선택사항이므로 기본값 true
        };
        
        // 폼 필드 설정
        this.fieldConfig = {
            name: {
                required: true,
                minLength: 2,
                maxLength: 20,
                errorElementId: 'name-error'
            },
            country: {
                required: true,
                errorElementId: 'country-error'
            },
            bio: {
                required: false,
                maxLength: 100,
                charCountElementId: 'bio-char-count'
            }
        };
        
        // 콜백 함수들 (ProfileEditView에서 설정)
        this.callbacks = {
            onValidationChange: null,
            onDataChange: null,
            onErrorChange: null,
            onAvatarChange: null
        };
    }

    /**
     * 폼 데이터를 초기화합니다
     * @param {Object} data - 초기 폼 데이터
     */
    initializeFormData(data) {
        this.originalData = { ...data };
        this.currentData = { ...data };
        this.hasUnsavedChanges = false;
        
        // 유효성 검사 상태 초기화
        this.resetValidationState();
        
        // 초기 유효성 검사 실행
        this.validateAllFields();
    }

    /**
     * 폼에 데이터를 채웁니다
     * @param {Object} data - 채울 데이터
     */
    populateForm(data) {
        // 데이터 초기화 (유효성 검사 제외)
        this.originalData = { ...data };
        this.currentData = { ...data };
        this.hasUnsavedChanges = false;
        this.resetValidationState();
        
        // 폼 필드 먼저 업데이트
        this.updateFormFields();
        
        // 아바타 설정 콜백 호출
        if (this.callbacks.onAvatarChange) {
            if (data.avatar) {
                this.callbacks.onAvatarChange('image', data.avatar);
            } else if (data.defaultAvatar) {
                this.callbacks.onAvatarChange('default', data.defaultAvatar);
            }
        }
        
        // 그 다음 유효성 검사 실행
        this.validateAllFields();
    }

    /**
     * 폼 필드들을 업데이트합니다
     */
    updateFormFields() {
        // 이름 필드
        const nameInput = document.getElementById('profile-name-input');
        if (nameInput) {
            nameInput.value = this.currentData.name || '';
        }
        
        // 바이오 필드
        const bioInput = document.getElementById('profile-bio-input');
        if (bioInput) {
            bioInput.value = this.currentData.bio || '';
            this.updateBioCharCount();
        }
        
        // 거주국 필드
        const countrySelect = document.getElementById('profile-country-input');
        if (countrySelect) {
            countrySelect.value = this.currentData.residenceCountry || '';
        }
    }

    /**
     * 현재 폼 데이터를 수집합니다
     * @returns {Object} 현재 폼 데이터
     */
    getFormData() {
        const nameInput = document.getElementById('profile-name-input');
        const bioInput = document.getElementById('profile-bio-input');
        const countrySelect = document.getElementById('profile-country-input');
        
        return {
            name: nameInput ? nameInput.value.trim() : '',
            bio: bioInput ? bioInput.value.trim() : '',
            residenceCountry: countrySelect ? countrySelect.value : '',
            avatar: this.currentData.avatar || null,
            defaultAvatar: this.currentData.defaultAvatar || null
        };
    }

    /**
     * 폼 데이터를 업데이트합니다
     * @param {Object} data - 업데이트할 데이터
     */
    updateFormData(data) {
        this.currentData = { ...this.currentData, ...data };
        this.checkForChanges();
    }

    /**
     * 이름 유효성을 검사합니다
     * @returns {boolean} 유효성 검사 결과
     */
    validateName() {
        const nameInput = document.getElementById('profile-name-input');
        if (!nameInput) return false;
        
        const name = nameInput.value.trim();
        const config = this.fieldConfig.name;
        
        // 필수 검사
        if (config.required && !name) {
            this.setFieldValidation('name', false, '이름을 입력해주세요.');
            return false;
        }
        
        // 길이 검사
        if (name && name.length < config.minLength) {
            this.setFieldValidation('name', false, `이름은 최소 ${config.minLength}자 이상이어야 합니다.`);
            return false;
        }
        
        if (name && name.length > config.maxLength) {
            this.setFieldValidation('name', false, `이름은 최대 ${config.maxLength}자까지 입력할 수 있습니다.`);
            return false;
        }
        
        // 유효한 경우
        this.setFieldValidation('name', true, '');
        return true;
    }

    /**
     * 거주국 유효성을 검사합니다
     * @returns {boolean} 유효성 검사 결과
     */
    validateCountry() {
        const countrySelect = document.getElementById('profile-country-input');
        if (!countrySelect) return false;
        
        const country = countrySelect.value;
        const config = this.fieldConfig.country;
        
        // 필수 검사
        if (config.required && !country) {
            this.setFieldValidation('country', false, '거주국을 선택해주세요.');
            return false;
        }
        
        // 유효한 경우
        this.setFieldValidation('country', true, '');
        return true;
    }

    /**
     * 바이오 유효성을 검사합니다
     * @returns {boolean} 유효성 검사 결과
     */
    validateBio() {
        const bioInput = document.getElementById('profile-bio-input');
        if (!bioInput) return true; // 바이오는 선택사항
        
        const bio = bioInput.value.trim();
        const config = this.fieldConfig.bio;
        
        // 길이 검사
        if (bio && bio.length > config.maxLength) {
            this.setFieldValidation('bio', false, `바이오는 최대 ${config.maxLength}자까지 입력할 수 있습니다.`);
            return false;
        }
        
        // 유효한 경우
        this.setFieldValidation('bio', true, '');
        return true;
    }

    /**
     * 모든 필드의 유효성을 검사합니다
     * @returns {boolean} 전체 유효성 검사 결과
     */
    validateAllFields() {
        const isNameValid = this.validateName();
        const isCountryValid = this.validateCountry();
        const isBioValid = this.validateBio();
        
        return isNameValid && isCountryValid && isBioValid;
    }

    /**
     * 폼 전체 유효성을 검사합니다
     * @returns {boolean} 폼 유효성 검사 결과
     */
    validateForm() {
        return this.validateAllFields();
    }

    /**
     * 필드 유효성 상태를 설정합니다
     * @param {string} fieldName - 필드 이름
     * @param {boolean} isValid - 유효성 여부
     * @param {string} message - 오류 메시지
     */
    setFieldValidation(fieldName, isValid, message) {
        this.validationState[fieldName] = { isValid, message };
        
        // UI 업데이트 콜백 호출
        if (this.callbacks.onValidationChange) {
            this.callbacks.onValidationChange(fieldName, isValid, message);
        }
    }

    /**
     * 바이오 글자 수를 업데이트합니다
     */
    updateBioCharCount() {
        const bioInput = document.getElementById('profile-bio-input');
        if (!bioInput) return;
        
        const count = bioInput.value.length;
        const config = this.fieldConfig.bio;
        
        // UI 업데이트 콜백 호출
        if (this.callbacks.onErrorChange) {
            this.callbacks.onErrorChange(config.charCountElementId, `${count}/${config.maxLength}`, count > config.maxLength);
        }
    }

    /**
     * 변경사항이 있는지 확인합니다
     */
    checkForChanges() {
        const currentFormData = this.getFormData();
        this.hasUnsavedChanges = JSON.stringify(currentFormData) !== JSON.stringify(this.originalData);
        
        // 변경사항 콜백 호출
        if (this.callbacks.onDataChange) {
            this.callbacks.onDataChange(this.hasUnsavedChanges, currentFormData);
        }
    }

    /**
     * 변경사항이 있는지 확인합니다 (외부 호출용)
     * @returns {boolean} 변경사항 여부
     */
    hasChanges() {
        this.checkForChanges();
        return this.hasUnsavedChanges;
    }

    /**
     * 폼을 리셋합니다
     */
    resetForm() {
        this.currentData = { ...this.originalData };
        this.updateFormFields();
        this.resetValidationState();
        this.hasUnsavedChanges = false;
    }

    /**
     * 유효성 검사 상태를 리셋합니다
     */
    resetValidationState() {
        this.validationState = {
            name: { isValid: false, message: '' },
            country: { isValid: false, message: '' },
            bio: { isValid: true, message: '' }
        };
    }

    /**
     * 콜백 함수를 설정합니다
     * @param {string} eventType - 이벤트 타입
     * @param {Function} callback - 콜백 함수
     */
    setCallback(eventType, callback) {
        if (this.callbacks.hasOwnProperty(eventType)) {
            this.callbacks[eventType] = callback;
        }
    }

    /**
     * 모든 콜백 함수를 설정합니다
     * @param {Object} callbacks - 콜백 함수들
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * 폼 데이터를 가져옵니다
     * @returns {Object} 폼 데이터
     */
    getCurrentData() {
        return { ...this.currentData };
    }

    /**
     * 원본 데이터를 가져옵니다
     * @returns {Object} 원본 데이터
     */
    getOriginalData() {
        return { ...this.originalData };
    }

    /**
     * 유효성 검사 상태를 가져옵니다
     * @returns {Object} 유효성 검사 상태
     */
    getValidationState() {
        return { ...this.validationState };
    }

    /**
     * FormManager 정리
     */
    cleanup() {
        this.originalData = {};
        this.currentData = {};
        this.hasUnsavedChanges = false;
        this.resetValidationState();
        this.callbacks = {
            onValidationChange: null,
            onDataChange: null,
            onErrorChange: null,
            onAvatarChange: null
        };
    }
}

export { ProfileEditFormManager };
