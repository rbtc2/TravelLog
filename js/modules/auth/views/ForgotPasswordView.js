/**
 * TravelLog 비밀번호 찾기 뷰
 * 비밀번호 재설정 폼과 관련 기능을 담당하는 뷰 클래스
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

import { BaseAuthView } from './BaseAuthView.js';

/**
 * 비밀번호 찾기 뷰 클래스
 * 비밀번호 재설정 폼의 렌더링과 이벤트 처리를 담당
 */
export class ForgotPasswordView extends BaseAuthView {
    constructor(container, config = {}) {
        super(container, {
            title: '비밀번호 찾기',
            subtitle: '이메일로 비밀번호 재설정 링크를 보내드립니다',
            icon: '✈️',
            ...config
        });
    }

    /**
     * 뷰 이름을 반환합니다
     * @returns {string} 뷰 이름
     */
    getViewName() {
        return 'forgot-password';
    }

    /**
     * 비밀번호 찾기 폼 내용을 렌더링합니다
     */
    renderContent() {
        const formContent = `
            <div class="form-group">
                <label for="forgot-email" class="form-label">이메일</label>
                <input 
                    type="email" 
                    id="forgot-email" 
                    name="email" 
                    class="form-input" 
                    placeholder="your@email.com"
                    required
                >
            </div>
            
            <button type="submit" class="login-btn" id="forgot-password-btn">
                재설정 링크 보내기
            </button>
            
            <div class="signup-link">
                <a href="#" class="login-btn-link" data-action="login">로그인으로 돌아가기</a>
            </div>
        `;

        this.container.innerHTML = this.renderFormContainer(formContent, 'forgot-password-form');
    }

    /**
     * 이벤트를 바인딩합니다
     */
    bindEvents() {
        // 비밀번호 찾기 폼 제출
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => {
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
        const formData = this.getFormData('forgot-password-form');
        const validation = this.validateForm(formData);

        if (!validation.isValid) {
            this.showError(validation.errors[0]);
            return;
        }

        this.onSubmit({
            type: 'forgot-password',
            data: {
                email: formData.email
            }
        });
    }

    /**
     * 링크 클릭을 처리합니다
     * @param {string} action - 액션 타입
     */
    handleLinkClick(action) {
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
            case 'forgot-password-btn':
                button.textContent = '재설정 링크 보내기';
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
        super.setLoadingState(isLoading, 'forgot-password-btn', '링크 발송 중...');
    }
}
