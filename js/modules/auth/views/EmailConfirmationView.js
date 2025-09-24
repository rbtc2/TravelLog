/**
 * TravelLog 이메일 확인 뷰
 * 이메일 확인 상태와 관련 기능을 담당하는 뷰 클래스
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

import { BaseAuthView } from './BaseAuthView.js';
import { AuthForm, AuthButton, AuthHeader, AuthMessage } from '../components/index.js';

/**
 * 이메일 확인 뷰 클래스
 * 이메일 확인 상태의 렌더링과 이벤트 처리를 담당
 */
export class EmailConfirmationView extends BaseAuthView {
    constructor(container, config = {}) {
        super(container, {
            title: '이메일 확인',
            subtitle: '이메일로 전송된 확인 링크를 클릭해주세요',
            icon: '📧',
            ...config
        });
    }

    /**
     * 뷰 이름을 반환합니다
     * @returns {string} 뷰 이름
     */
    getViewName() {
        return 'email-confirmation';
    }

    /**
     * 이메일 확인 뷰 내용을 렌더링합니다
     */
    renderContent() {
        const content = `
            <div class="email-confirmation-content">
                ${AuthMessage.createEmailConfirmationMessage()}
                
                ${AuthButton.createResendButton()}
                
                ${AuthForm.createLink({ 
                    text: '로그인으로 돌아가기', 
                    className: 'login-btn-link', 
                    action: 'login' 
                })}
            </div>
        `;

        this.container.innerHTML = `
            <div class="login-container">
                ${this.renderHeader()}
                ${content}
            </div>
        `;
    }

    /**
     * 이벤트를 바인딩합니다
     */
    bindEvents() {
        // 이메일 다시 보내기 버튼
        const resendEmailBtn = document.getElementById('resend-email-btn');
        if (resendEmailBtn) {
            resendEmailBtn.addEventListener('click', () => {
                this.handleResendEmail();
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
     * 이메일 재발송을 처리합니다
     */
    handleResendEmail() {
        this.onSubmit({
            type: 'resend-email',
            data: {}
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
            case 'resend-email-btn':
                button.textContent = '이메일 다시 보내기';
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
        super.setLoadingState(isLoading, 'resend-email-btn', '발송 중...');
    }
}
