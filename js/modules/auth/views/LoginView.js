/**
 * TravelLog 로그인 뷰
 * 로그인 폼과 관련 기능을 담당하는 뷰 클래스
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

import { BaseAuthView } from './BaseAuthView.js';
import { AuthForm, AuthButton, AuthHeader } from '../components/index.js';

/**
 * 로그인 뷰 클래스
 * 로그인 폼의 렌더링과 이벤트 처리를 담당
 */
export class LoginView extends BaseAuthView {
    constructor(container, config = {}) {
        super(container, {
            title: 'TravelLog',
            subtitle: '여행의 모든 순간을 기록하세요',
            icon: '✈️',
            ...config
        });
    }

    /**
     * 뷰 이름을 반환합니다
     * @returns {string} 뷰 이름
     */
    getViewName() {
        return 'login';
    }

    /**
     * 로그인 폼 내용을 렌더링합니다
     */
    renderContent() {
        const formContent = `
            ${AuthForm.createEmailField({ id: 'email', name: 'email' })}
            
            ${AuthForm.createPasswordField({ id: 'password', name: 'password' })}
            
            ${AuthForm.createFormOptions(`
                ${AuthForm.createCheckbox({ 
                    id: 'remember', 
                    name: 'remember', 
                    label: '로그인 상태 유지' 
                })}
                <a href="#" class="forgot-password" data-action="forgot-password">비밀번호 찾기</a>
            `)}
            
            ${AuthButton.createLoginButton()}
            
            <div class="login-divider">
                <span>또는</span>
            </div>
            
            ${AuthButton.createGoogleButton({ id: 'google-login-btn' })}
            
            ${AuthForm.createLink({ 
                text: '계정이 없으신가요? 회원가입', 
                className: 'signup-btn', 
                action: 'signup' 
            })}
        `;

        this.container.innerHTML = this.renderFormContainer(formContent, 'login-form');
    }

    /**
     * 이벤트를 바인딩합니다
     */
    bindEvents() {
        // 로그인 폼 제출
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // 로그인 버튼 클릭
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Google 로그인 버튼 클릭
        const googleLoginBtn = document.getElementById('google-login-btn');
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => {
                this.handleGoogleLogin();
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
        const formData = this.getFormData('login-form');
        const validation = this.validateForm(formData);

        if (!validation.isValid) {
            this.showError(validation.errors[0]);
            return;
        }

        this.onSubmit({
            type: 'login',
            data: {
                email: formData.email,
                password: formData.password,
                remember: formData.remember === 'on'
            }
        });
    }

    /**
     * Google 로그인을 처리합니다
     */
    handleGoogleLogin() {
        this.onSubmit({
            type: 'google-login',
            data: {}
        });
    }

    /**
     * 링크 클릭을 처리합니다
     * @param {string} action - 액션 타입
     */
    handleLinkClick(action) {
        switch (action) {
            case 'signup':
                this.onViewChange('signup');
                break;
            case 'forgot-password':
                this.onViewChange('forgot-password');
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
            case 'login-btn':
                button.textContent = '로그인';
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
        super.setLoadingState(isLoading, 'login-btn', '로그인 중...');
    }
}
