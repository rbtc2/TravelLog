/**
 * TravelLog 회원가입 뷰
 * 회원가입 폼과 관련 기능을 담당하는 뷰 클래스
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

import { BaseAuthView } from './BaseAuthView.js';
import { AuthForm, AuthButton, AuthHeader } from '../components/index.js';

/**
 * 회원가입 뷰 클래스
 * 회원가입 폼의 렌더링과 이벤트 처리를 담당
 */
export class SignupView extends BaseAuthView {
    constructor(container, config = {}) {
        super(container, {
            title: '회원가입',
            subtitle: 'TravelLog에 오신 것을 환영합니다',
            icon: '✈️',
            ...config
        });

        this.countrySelector = null;
        this.isCountrySelectorInitializing = false;
        
        // 이벤트 핸들러 바인딩
        this.handleCountrySelection = this.handleCountrySelection.bind(this);
        this.handleCountrySelectorEvent = this.handleCountrySelectorEvent.bind(this);
    }

    /**
     * 뷰 이름을 반환합니다
     * @returns {string} 뷰 이름
     */
    getViewName() {
        return 'signup';
    }

    /**
     * 회원가입 폼 내용을 렌더링합니다
     */
    renderContent() {
        // 기존 CountrySelector 정리
        if (this.countrySelector) {
            this.countrySelector.destroy();
            this.countrySelector = null;
        }

        const formContent = `
            ${AuthForm.createTextField({ 
                id: 'signup-full-name', 
                name: 'fullName', 
                label: '이름', 
                placeholder: '홍길동',
                required: true
            })}
            
            ${AuthForm.createEmailField({ 
                id: 'signup-email', 
                name: 'email' 
            })}
            
            <div class="form-group">
                <label for="signup-residence-country" class="form-label">현재 거주국</label>
                <div id="signup-country-selector-container" class="country-selector-container">
                    <!-- Country selector will be initialized here -->
                </div>
                <input 
                    type="hidden" 
                    id="signup-residence-country" 
                    name="residenceCountry" 
                    value=""
                >
            </div>
            
            ${AuthForm.createPasswordField({ 
                id: 'signup-password', 
                name: 'password' 
            })}
            
            ${AuthForm.createPasswordField({ 
                id: 'signup-confirm-password', 
                name: 'confirmPassword', 
                label: '비밀번호 확인' 
            })}
            
            ${AuthButton.createSignupButton()}
            
            ${AuthForm.createLink({ 
                text: '이미 계정이 있으신가요? 로그인', 
                className: 'login-btn-link', 
                action: 'login' 
            })}
        `;

        this.container.innerHTML = this.renderFormContainer(formContent, 'signup-form');

        // Country selector 초기화 (약간의 지연 후)
        setTimeout(() => {
            this.initializeCountrySelector();
        }, 100);
    }

    /**
     * Country selector를 초기화합니다
     */
    async initializeCountrySelector() {
        try {
            // 이미 초기화 중인 경우 중복 실행 방지
            if (this.isCountrySelectorInitializing) {
                console.log('SignupView: CountrySelector 초기화 중, 중복 실행 방지');
                return;
            }

            const container = document.getElementById('signup-country-selector-container');
            
            if (!container) {
                console.error('SignupView: signup-country-selector-container를 찾을 수 없음');
                return;
            }

            // 이미 초기화된 경우 중복 초기화 방지
            if (this.countrySelector && this.countrySelector.isInitialized) {
                console.log('SignupView: CountrySelector가 이미 초기화됨, 중복 초기화 방지');
                return;
            }

            this.isCountrySelectorInitializing = true;

            // 기존 selector가 있다면 제거
            if (this.countrySelector) {
                this.countrySelector.destroy();
                this.countrySelector = null;
            }

            // Country selector 동적 import
            const { CountrySelector } = await import('../../ui-components/country-selector.js');
            
            // Country selector 생성
            this.countrySelector = new CountrySelector(container, {
                placeholder: '현재 거주국을 선택하세요'
            });

            // 초기화 상태 표시
            this.countrySelector.isInitialized = true;

            // 국가 선택 이벤트 리스너 (document에서 이벤트 수신)
            document.addEventListener('country-selected', this.handleCountrySelectorEvent);

            this.isCountrySelectorInitializing = false;

        } catch (error) {
            console.error('SignupView: Country Selector 초기화 실패:', error);
            this.isCountrySelectorInitializing = false;
        }
    }

    /**
     * Country selector 이벤트를 처리합니다
     * @param {Event} event - 이벤트 객체
     */
    handleCountrySelectorEvent(event) {
        const container = document.getElementById('signup-country-selector-container');
        // 이벤트가 이 컨테이너와 관련된 것인지 확인
        if (event.detail.element === container) {
            const selectedCountry = event.detail.country;
            console.log('SignupView: 국가 선택됨:', selectedCountry);
            this.handleCountrySelection(selectedCountry);
        }
    }

    /**
     * 국가 선택 이벤트를 처리합니다
     * @param {Object} selectedCountry - 선택된 국가 정보
     */
    handleCountrySelection(selectedCountry) {
        const hiddenInput = document.getElementById('signup-residence-country');
        if (hiddenInput && selectedCountry) {
            hiddenInput.value = selectedCountry.code;
            console.log('SignupView: 선택된 거주국:', selectedCountry.name, selectedCountry.code);
            console.log('SignupView: Hidden input 값:', hiddenInput.value);
            
            // 폼 유효성 검사 상태 업데이트
            this.updateFormValidation();
        } else {
            console.warn('SignupView: 국가 선택 처리 실패 - hiddenInput 또는 selectedCountry가 없음');
        }
    }
    
    /**
     * 폼 유효성 검사 상태를 업데이트합니다
     */
    updateFormValidation() {
        const hiddenInput = document.getElementById('signup-residence-country');
        const formGroup = hiddenInput?.closest('.form-group');
        
        if (formGroup) {
            if (hiddenInput.value) {
                formGroup.classList.remove('error');
                formGroup.classList.add('success');
            } else {
                formGroup.classList.remove('success');
                formGroup.classList.add('error');
            }
        }
    }

    /**
     * 이벤트를 바인딩합니다
     */
    bindEvents() {
        // 회원가입 폼 제출
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // 링크 클릭 이벤트
        this.bindLinkEvents();
    }

    /**
     * 링크 이벤트를 바인딩합니다
     */
    bindLinkEvents() {
        const links = this.container.querySelectorAll('[data-action]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.getAttribute('data-action');
                this.handleLinkClick(action);
            });
        });
    }

    /**
     * 폼 제출을 처리합니다
     */
    handleSubmit() {
        const formData = this.getFormData('signup-form');
        
        // 거주국 값이 비어있는 경우 Country selector에서 직접 가져오기
        if (!formData.residenceCountry || formData.residenceCountry.trim() === '') {
            const hiddenInput = document.getElementById('signup-residence-country');
            if (hiddenInput && hiddenInput.value) {
                formData.residenceCountry = hiddenInput.value;
            }
        }
        
        // 디버깅을 위한 로그
        console.log('SignupView: 폼 데이터:', formData);
        console.log('SignupView: 거주국 값:', formData.residenceCountry);
        console.log('SignupView: Hidden input 직접 확인:', document.getElementById('signup-residence-country')?.value);
        
        const validation = this.validateSignupForm(formData);

        if (!validation.isValid) {
            this.showError(validation.errors[0]);
            return;
        }

        this.onSubmit({
            type: 'signup',
            data: {
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                fullName: formData.fullName,
                residenceCountry: formData.residenceCountry
            }
        });
    }

    /**
     * 회원가입 폼 유효성을 검사합니다
     * @param {Object} data - 폼 데이터
     * @returns {Object} 유효성 검사 결과
     */
    validateSignupForm(data) {
        const errors = [];

        // 필수 필드 검사
        if (!data.fullName || data.fullName.trim() === '') {
            errors.push('이름을 입력해주세요.');
        }

        if (!data.email || data.email.trim() === '') {
            errors.push('이메일을 입력해주세요.');
        }

        if (!data.password || data.password.trim() === '') {
            errors.push('비밀번호를 입력해주세요.');
        }

        if (!data.confirmPassword || data.confirmPassword.trim() === '') {
            errors.push('비밀번호 확인을 입력해주세요.');
        }

        if (!data.residenceCountry || data.residenceCountry.trim() === '') {
            errors.push('현재 거주국을 선택해주세요.');
        }

        // 비밀번호 일치 검사
        if (data.password !== data.confirmPassword) {
            errors.push('비밀번호가 일치하지 않습니다.');
        }

        // 비밀번호 길이 검사
        if (data.password && data.password.length < 6) {
            errors.push('비밀번호는 최소 6자 이상이어야 합니다.');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 링크 클릭을 처리합니다
     * @param {string} action - 액션 타입
     */
    handleLinkClick(action) {
        console.log(`SignupView: 링크 클릭 - ${action}`);
        
        if (!this.onViewChange) {
            console.error('SignupView: onViewChange 콜백이 설정되지 않았습니다.');
            return;
        }
        
        switch (action) {
            case 'login':
                this.onViewChange('login');
                break;
            default:
                console.warn('알 수 없는 액션:', action);
        }
    }

    /**
     * 버튼 텍스트를 복원합니다
     * @param {string} buttonId - 버튼 ID
     */
    restoreButtonText(buttonId) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        switch (buttonId) {
            case 'signup-btn':
                button.textContent = '회원가입';
                break;
            default:
                // 기본 텍스트 복원
                break;
        }
    }

    /**
     * 로딩 상태를 설정합니다
     * @param {boolean} isLoading - 로딩 상태
     */
    setLoadingState(isLoading) {
        super.setLoadingState(isLoading, 'signup-btn', '회원가입 중...');
    }

    /**
     * 뷰를 정리합니다
     */
    cleanup() {
        if (this.countrySelector) {
            this.countrySelector.destroy();
            this.countrySelector = null;
        }
        
        // 이벤트 리스너 정리
        document.removeEventListener('country-selected', this.handleCountrySelectorEvent);
        
        this.isCountrySelectorInitializing = false;
        super.cleanup();
    }
}
