/**
 * 인증 버튼 공통 컴포넌트
 * @class AuthButton
 * @version 1.0.0
 * @since 2024-12-29
 */
export class AuthButton {
    /**
     * 기본 버튼을 생성합니다
     * @param {Object} config - 버튼 설정
     * @param {string} config.id - 버튼 ID
     * @param {string} config.text - 버튼 텍스트
     * @param {string} config.type - 버튼 타입 (submit, button)
     * @param {string} config.className - CSS 클래스
     * @param {boolean} config.disabled - 비활성화 여부
     * @param {Object} config.attributes - 추가 속성
     * @returns {string} HTML 문자열
     */
    static createButton(config) {
        const {
            id,
            text,
            type = 'submit',
            className = 'login-btn',
            disabled = false,
            attributes = {}
        } = config;

        const disabledAttr = disabled ? 'disabled' : '';
        
        // 추가 속성들을 문자열로 변환
        const additionalAttrs = Object.entries(attributes)
            .map(([key, val]) => `${key}="${val}"`)
            .join(' ');

        return `
            <button type="${type}" class="${className}" id="${id}" ${disabledAttr} ${additionalAttrs}>
                ${text}
            </button>
        `;
    }

    /**
     * 로그인 버튼을 생성합니다
     * @param {Object} config - 로그인 버튼 설정
     * @returns {string} HTML 문자열
     */
    static createLoginButton(config = {}) {
        return this.createButton({
            id: 'login-btn',
            text: '로그인',
            type: 'submit',
            className: 'login-btn',
            ...config
        });
    }

    /**
     * 회원가입 버튼을 생성합니다
     * @param {Object} config - 회원가입 버튼 설정
     * @returns {string} HTML 문자열
     */
    static createSignupButton(config = {}) {
        return this.createButton({
            id: 'signup-btn',
            text: '회원가입',
            type: 'submit',
            className: 'login-btn',
            ...config
        });
    }

    /**
     * Google 로그인 버튼을 생성합니다
     * @param {Object} config - Google 버튼 설정
     * @returns {string} HTML 문자열
     */
    static createGoogleButton(config = {}) {
        const { id = 'google-login-btn', text = 'Google로 계속하기' } = config;
        
        return `
            <button type="button" class="google-btn" id="${id}">
                <div class="google-btn-content">
                    <div class="google-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                    </div>
                    <span class="google-btn-text">${text}</span>
                </div>
            </button>
        `;
    }

    /**
     * 비밀번호 재설정 버튼을 생성합니다
     * @param {Object} config - 재설정 버튼 설정
     * @returns {string} HTML 문자열
     */
    static createResetButton(config = {}) {
        return this.createButton({
            id: 'forgot-password-btn',
            text: '재설정 링크 보내기',
            type: 'submit',
            className: 'login-btn',
            ...config
        });
    }

    /**
     * 이메일 재발송 버튼을 생성합니다
     * @param {Object} config - 재발송 버튼 설정
     * @returns {string} HTML 문자열
     */
    static createResendButton(config = {}) {
        return this.createButton({
            id: 'resend-email-btn',
            text: '이메일 다시 보내기',
            type: 'button',
            className: 'login-btn',
            ...config
        });
    }

    /**
     * 로딩 상태를 설정합니다
     * @param {HTMLElement} button - 버튼 요소
     * @param {boolean} isLoading - 로딩 상태
     * @param {string} loadingText - 로딩 중 텍스트
     */
    static setLoadingState(button, isLoading, loadingText = '처리 중...') {
        if (!button) return;

        if (isLoading) {
            button.dataset.originalText = button.textContent;
            button.textContent = loadingText;
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.textContent = button.dataset.originalText || loadingText;
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
}
