/**
 * TravelLog 이메일 발송 완료 뷰
 * 이메일 발송 완료 상태와 관련 기능을 담당하는 뷰 클래스
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

import { BaseAuthView } from './BaseAuthView.js';

/**
 * 이메일 발송 완료 뷰 클래스
 * 이메일 발송 완료 상태의 렌더링과 이벤트 처리를 담당
 */
export class EmailSentView extends BaseAuthView {
    constructor(container, config = {}) {
        super(container, {
            title: '이메일 발송 완료',
            subtitle: '비밀번호 재설정 링크를 보내드렸습니다',
            icon: '📧',
            ...config
        });
    }

    /**
     * 뷰 이름을 반환합니다
     * @returns {string} 뷰 이름
     */
    getViewName() {
        return 'email-sent';
    }

    /**
     * 이메일 발송 완료 뷰 내용을 렌더링합니다
     */
    renderContent() {
        const content = `
            <div class="email-sent-content">
                <div class="sent-icon">✅</div>
                <p class="sent-message">
                    이메일로 비밀번호 재설정 링크를 보내드렸습니다.<br>
                    이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정해주세요.
                </p>
                
                <div class="signup-link">
                    <a href="#" class="login-btn-link" data-action="login">로그인으로 돌아가기</a>
                </div>
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
        // 이 뷰에는 버튼이 없음
    }

    /**
     * 로딩 상태를 설정합니다
     * @param {boolean} isLoading - 로딩 상태
     */
    setLoadingState(isLoading) {
        // 이 뷰에는 로딩 상태가 없음
    }
}
