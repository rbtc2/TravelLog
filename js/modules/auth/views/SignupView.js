/**
 * TravelLog 회원가입 뷰
 * 회원가입 폼과 관련 기능을 담당하는 뷰 클래스
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

import { BaseAuthView } from './BaseAuthView.js';

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
            <div class="form-group">
                <label for="signup-full-name" class="form-label">이름</label>
                <input 
                    type="text" 
                    id="signup-full-name" 
                    name="fullName" 
                    class="form-input" 
                    placeholder="홍길동"
                    required
                >
            </div>
            
            <div class="form-group">
                <label for="signup-email" class="form-label">이메일</label>
                <input 
                    type="email" 
                    id="signup-email" 
                    name="email" 
                    class="form-input" 
                    placeholder="your@email.com"
                    required
                >
            </div>
            
            <div class="form-group">
                <label for="signup-password" class="form-label">비밀번호</label>
                <input 
                    type="password" 
                    id="signup-password" 
                    name="password" 
                    class="form-input" 
                    placeholder="••••••••"
                    required
                >
            </div>
            
            <div class="form-group">
                <label for="signup-confirm-password" class="form-label">비밀번호 확인</label>
                <input 
                    type="password" 
                    id="signup-confirm-password" 
                    name="confirmPassword" 
                    class="form-input" 
                    placeholder="••••••••"
                    required
                >
            </div>
            
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
            
            <button type="submit" class="login-btn" id="signup-btn">
                회원가입
            </button>
            
            <div class="signup-link">
                <a href="#" class="login-btn-link" data-action="login">이미 계정이 있으신가요? 로그인</a>
            </div>
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

            // 국가 선택 이벤트 리스너
            container.addEventListener('country-selected', (event) => {
                const selectedCountry = event.detail.country;
                this.handleCountrySelection(selectedCountry);
            });

            this.isCountrySelectorInitializing = false;

        } catch (error) {
            console.error('SignupView: Country Selector 초기화 실패:', error);
            this.isCountrySelectorInitializing = false;
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
            console.log('선택된 거주국:', selectedCountry.nameKo, selectedCountry.code);
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
        
        this.isCountrySelectorInitializing = false;
        super.cleanup();
    }
}
