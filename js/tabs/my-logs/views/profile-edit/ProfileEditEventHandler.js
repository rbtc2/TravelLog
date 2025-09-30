/**
 * ProfileEditEventHandler - 프로필 편집 이벤트 처리 전용 클래스
 * 
 * 🎯 책임:
 * - 모든 이벤트 바인딩 및 해제
 * - 이벤트 핸들러 로직 관리
 * - 이벤트 위임 및 최적화
 * - 메모리 누수 방지
 * - 이벤트 상태 관리
 * 
 * 🔗 관계:
 * - ProfileEditView에서 사용되는 이벤트 처리 전용 모듈
 * - ProfileEditRenderer, ProfileEditFormManager와 협력
 * - 순수 이벤트 로직만 담당, UI 로직은 포함하지 않음
 * 
 * @class ProfileEditEventHandler
 * @version 1.0.0
 * @since 2025-09-30
 */

class ProfileEditEventHandler {
    constructor() {
        // 이벤트 리스너 추적
        this.eventListeners = new Map();
        
        // 이벤트 핸들러 바인딩
        this.boundHandlers = new Map();
        
        // 이벤트 상태 관리
        this.isEventBindingActive = false;
        
        // 콜백 함수들 (ProfileEditView에서 설정)
        this.callbacks = {
            onBackToProfile: null,
            onSaveProfile: null,
            onImageUpload: null,
            onDefaultAvatarSelect: null,
            onFormValidation: null,
            onFormChange: null,
            onUnsavedChanges: null,
            onShowMessage: null
        };
        
        // 이벤트 위임을 위한 셀렉터 매핑
        this.eventSelectors = {
            backButton: '#back-to-profile',
            saveButton: '#save-profile-edit',
            imageInput: '#profile-image-input',
            avatarOptions: '.avatar-option',
            formInputs: 'input, textarea, select',
            bioTextarea: '#bio',
            nameInput: '#name',
            countrySelect: '#residence-country'
        };
    }

    /**
     * 모든 이벤트를 바인딩합니다
     * @param {HTMLElement} container - 이벤트를 바인딩할 컨테이너
     */
    bindAllEvents(container) {
        // 기존 이벤트가 있다면 먼저 정리
        if (this.isEventBindingActive) {
            console.log('기존 이벤트를 정리하고 다시 바인딩합니다.');
            this.removeAllEventListeners();
        }

        try {
            this.container = container;
            this.bindNavigationEvents();
            this.bindFormEvents();
            this.bindImageEvents();
            this.bindValidationEvents();
            this.bindChangeEvents();
            
            this.isEventBindingActive = true;
            console.log('ProfileEditEventHandler: 모든 이벤트가 바인딩되었습니다.');
            
        } catch (error) {
            console.error('이벤트 바인딩 실패:', error);
            throw error;
        }
    }

    /**
     * 네비게이션 이벤트를 바인딩합니다
     */
    bindNavigationEvents() {
        // 뒤로가기 버튼
        const backBtn = this.container.querySelector(this.eventSelectors.backButton);
        if (backBtn) {
            this.addEventListener(backBtn, 'click', this.handleBackToProfile.bind(this));
        }

        // 저장 버튼
        const saveBtn = this.container.querySelector(this.eventSelectors.saveButton);
        if (saveBtn) {
            this.addEventListener(saveBtn, 'click', this.handleSaveProfile.bind(this));
        }
    }

    /**
     * 폼 이벤트를 바인딩합니다
     */
    bindFormEvents() {
        // 모든 폼 입력 요소에 대한 이벤트 위임
        this.addEventListener(this.container, 'input', this.handleFormInput.bind(this), true);
        this.addEventListener(this.container, 'change', this.handleFormChange.bind(this), true);
        this.addEventListener(this.container, 'blur', this.handleFormBlur.bind(this), true);
    }

    /**
     * 이미지 관련 이벤트를 바인딩합니다
     */
    bindImageEvents() {
        // 이미지 업로드 입력
        const imageInput = this.container.querySelector(this.eventSelectors.imageInput);
        if (imageInput) {
            this.addEventListener(imageInput, 'change', this.handleImageUpload.bind(this));
        }

        // 기본 아바타 옵션들
        const avatarOptions = this.container.querySelectorAll(this.eventSelectors.avatarOptions);
        avatarOptions.forEach(option => {
            this.addEventListener(option, 'click', this.handleDefaultAvatarSelect.bind(this));
        });
    }

    /**
     * 유효성 검사 이벤트를 바인딩합니다
     */
    bindValidationEvents() {
        // 실시간 유효성 검사를 위한 이벤트
        const nameInput = this.container.querySelector(this.eventSelectors.nameInput);
        if (nameInput) {
            this.addEventListener(nameInput, 'input', this.handleNameValidation.bind(this));
            this.addEventListener(nameInput, 'blur', this.handleNameValidation.bind(this));
        }

        const countrySelect = this.container.querySelector(this.eventSelectors.countrySelect);
        if (countrySelect) {
            this.addEventListener(countrySelect, 'change', this.handleCountryValidation.bind(this));
            this.addEventListener(countrySelect, 'blur', this.handleCountryValidation.bind(this));
        }

        const bioTextarea = this.container.querySelector(this.eventSelectors.bioTextarea);
        if (bioTextarea) {
            this.addEventListener(bioTextarea, 'input', this.handleBioValidation.bind(this));
        }
    }

    /**
     * 변경사항 추적 이벤트를 바인딩합니다
     */
    bindChangeEvents() {
        // 폼 변경사항 추적
        this.addEventListener(this.container, 'input', this.handleChangeTracking.bind(this), true);
        this.addEventListener(this.container, 'change', this.handleChangeTracking.bind(this), true);
    }

    /**
     * 이벤트 리스너를 추가합니다
     * @param {HTMLElement} element - 이벤트를 바인딩할 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     * @param {boolean} useCapture - 캡처 단계 사용 여부
     */
    addEventListener(element, event, handler, useCapture = false) {
        if (!element) return;

        // 핸들러 바인딩 및 추적
        const boundHandler = handler.bind(this);
        this.boundHandlers.set(`${element}_${event}`, boundHandler);
        
        element.addEventListener(event, boundHandler, useCapture);
        
        // 리스너 추적
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, []);
        }
        this.eventListeners.get(element).push({ event, handler: boundHandler, useCapture });
    }

    /**
     * 뒤로가기 버튼 클릭 핸들러
     */
    handleBackToProfile(event) {
        event.preventDefault();
        event.stopPropagation();
        
        if (this.callbacks.onBackToProfile) {
            this.callbacks.onBackToProfile();
        }
    }

    /**
     * 저장 버튼 클릭 핸들러
     */
    handleSaveProfile(event) {
        event.preventDefault();
        event.stopPropagation();
        
        if (this.callbacks.onSaveProfile) {
            this.callbacks.onSaveProfile();
        }
    }

    /**
     * 이미지 업로드 핸들러
     */
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 파일 검증
        if (!this.validateImageFile(file)) {
            return;
        }

        if (this.callbacks.onImageUpload) {
            this.callbacks.onImageUpload(event);
        }
    }

    /**
     * 기본 아바타 선택 핸들러
     */
    handleDefaultAvatarSelect(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const avatar = event.target.textContent || event.target.dataset.avatar;
        if (avatar && this.callbacks.onDefaultAvatarSelect) {
            this.callbacks.onDefaultAvatarSelect(avatar);
        }
    }

    /**
     * 폼 입력 핸들러
     */
    handleFormInput(event) {
        if (this.callbacks.onFormChange) {
            this.callbacks.onFormChange(event);
        }
    }

    /**
     * 폼 변경 핸들러
     */
    handleFormChange(event) {
        if (this.callbacks.onFormChange) {
            this.callbacks.onFormChange(event);
        }
    }

    /**
     * 폼 블러 핸들러
     */
    handleFormBlur(event) {
        // 특정 필드에 대한 유효성 검사
        if (event.target.matches(this.eventSelectors.nameInput)) {
            this.handleNameValidation(event);
        } else if (event.target.matches(this.eventSelectors.countrySelect)) {
            this.handleCountryValidation(event);
        }
    }

    /**
     * 이름 유효성 검사 핸들러
     */
    handleNameValidation(event) {
        if (this.callbacks.onFormValidation) {
            this.callbacks.onFormValidation('name', event);
        }
    }

    /**
     * 거주국 유효성 검사 핸들러
     */
    handleCountryValidation(event) {
        if (this.callbacks.onFormValidation) {
            this.callbacks.onFormValidation('country', event);
        }
    }

    /**
     * 바이오 유효성 검사 핸들러
     */
    handleBioValidation(event) {
        if (this.callbacks.onFormValidation) {
            this.callbacks.onFormValidation('bio', event);
        }
    }

    /**
     * 변경사항 추적 핸들러
     */
    handleChangeTracking(event) {
        if (this.callbacks.onUnsavedChanges) {
            this.callbacks.onUnsavedChanges(event);
        }
    }

    /**
     * 이미지 파일 유효성 검사
     * @param {File} file - 검사할 파일
     * @returns {boolean} 유효성 검사 결과
     */
    validateImageFile(file) {
        // 파일 크기 검증 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            this.showMessage('이미지 크기는 5MB 이하여야 합니다.', 'error');
            return false;
        }

        // 이미지 타입 검증
        if (!file.type.startsWith('image/')) {
            this.showMessage('이미지 파일만 업로드할 수 있습니다.', 'error');
            return false;
        }

        return true;
    }

    /**
     * 메시지 표시
     * @param {string} message - 표시할 메시지
     * @param {string} type - 메시지 타입
     */
    showMessage(message, type = 'info') {
        if (this.callbacks.onShowMessage) {
            this.callbacks.onShowMessage({ type, message });
        }
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
     * 특정 이벤트 리스너를 제거합니다
     * @param {HTMLElement} element - 요소
     * @param {string} event - 이벤트 타입
     */
    removeEventListener(element, event) {
        if (!element) return;

        const listeners = this.eventListeners.get(element);
        if (!listeners) return;

        const listenerIndex = listeners.findIndex(
            listener => listener.event === event
        );

        if (listenerIndex !== -1) {
            const listener = listeners[listenerIndex];
            element.removeEventListener(event, listener.handler, listener.useCapture);
            listeners.splice(listenerIndex, 1);
        }
    }

    /**
     * 모든 이벤트 리스너를 제거합니다
     */
    removeAllEventListeners() {
        this.eventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler, useCapture }) => {
                element.removeEventListener(event, handler, useCapture);
            });
        });
        
        this.eventListeners.clear();
        this.boundHandlers.clear();
        this.isEventBindingActive = false;
    }

    /**
     * 이벤트 바인딩 상태를 확인합니다
     * @returns {boolean} 바인딩 상태
     */
    isEventsBound() {
        return this.isEventBindingActive;
    }

    /**
     * 이벤트 핸들러 정리
     */
    cleanup() {
        this.removeAllEventListeners();
        this.callbacks = {
            onBackToProfile: null,
            onSaveProfile: null,
            onImageUpload: null,
            onDefaultAvatarSelect: null,
            onFormValidation: null,
            onFormChange: null,
            onUnsavedChanges: null,
            onShowMessage: null
        };
        this.container = null;
    }
}

export { ProfileEditEventHandler };
