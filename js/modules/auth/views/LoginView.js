/**
 * TravelLog 로그인 뷰
 * 로그인 폼과 관련 기능을 담당하는 뷰 클래스
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

import { BaseAuthView } from './BaseAuthView.js';

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
            <div class="form-group">
                <label for="email" class="form-label">이메일</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    class="form-input" 
                    placeholder="your@email.com"
                    required
                >
            </div>
            
            <div class="form-group">
                <label for="password" class="form-label">비밀번호</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    class="form-input" 
                    placeholder="••••••••"
                    required
                >
            </div>
            
            <div class="form-options">
                <label class="checkbox-label" for="remember">
                    <input type="checkbox" id="remember" name="remember">
                    <span class="checkmark"></span>
                    로그인 상태 유지
                </label>
                <a href="#" class="forgot-password" data-action="forgot-password">비밀번호 찾기</a>
            </div>
            
            <button type="submit" class="login-btn" id="login-btn">
                로그인
            </button>
            
            <div class="login-divider">
                <span>또는</span>
            </div>
            
            <button type="button" class="google-login-btn" id="google-login-btn">
                <div class="google-btn-content">
                    <div class="google-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                    </div>
                    <span class="google-btn-text">Google로 계속하기</span>
                </div>
            </button>
            
            <div class="signup-link">
                <a href="#" class="signup-btn" data-action="signup">계정이 없으신가요? 회원가입</a>
            </div>
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
