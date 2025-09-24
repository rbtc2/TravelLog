/**
 * 인증 헤더 공통 컴포넌트
 * @class AuthHeader
 * @version 1.0.0
 * @since 2024-12-29
 */
export class AuthHeader {
    /**
     * 기본 헤더를 생성합니다
     * @param {Object} config - 헤더 설정
     * @param {string} config.title - 제목
     * @param {string} config.subtitle - 부제목
     * @param {string} config.icon - 아이콘 (이모지)
     * @param {string} config.className - 추가 CSS 클래스
     * @returns {string} HTML 문자열
     */
    static createHeader(config) {
        const { title, subtitle, icon, className = '' } = config;
        
        const iconHtml = icon ? `<div class="auth-icon">${icon}</div>` : '';
        const subtitleHtml = subtitle ? `<p class="auth-subtitle">${subtitle}</p>` : '';

        return `
            <div class="auth-header ${className}">
                ${iconHtml}
                <h1 class="auth-title">${title}</h1>
                ${subtitleHtml}
            </div>
        `;
    }

    /**
     * 로그인 헤더를 생성합니다
     * @param {Object} config - 로그인 헤더 설정
     * @returns {string} HTML 문자열
     */
    static createLoginHeader(config = {}) {
        return this.createHeader({
            title: '로그인',
            subtitle: '여행 일지에 오신 것을 환영합니다',
            icon: '✈️',
            ...config
        });
    }

    /**
     * 회원가입 헤더를 생성합니다
     * @param {Object} config - 회원가입 헤더 설정
     * @returns {string} HTML 문자열
     */
    static createSignupHeader(config = {}) {
        return this.createHeader({
            title: '회원가입',
            subtitle: '새 계정을 만들어 여행을 기록해보세요',
            icon: '🌍',
            ...config
        });
    }

    /**
     * 비밀번호 찾기 헤더를 생성합니다
     * @param {Object} config - 비밀번호 찾기 헤더 설정
     * @returns {string} HTML 문자열
     */
    static createForgotPasswordHeader(config = {}) {
        return this.createHeader({
            title: '비밀번호 찾기',
            subtitle: '이메일로 비밀번호 재설정 링크를 보내드립니다',
            icon: '🔑',
            ...config
        });
    }

    /**
     * 이메일 확인 헤더를 생성합니다
     * @param {Object} config - 이메일 확인 헤더 설정
     * @returns {string} HTML 문자열
     */
    static createEmailConfirmationHeader(config = {}) {
        return this.createHeader({
            title: '이메일 확인',
            subtitle: '이메일을 확인하고 인증을 완료해주세요',
            icon: '📧',
            ...config
        });
    }

    /**
     * 이메일 발송 완료 헤더를 생성합니다
     * @param {Object} config - 이메일 발송 완료 헤더 설정
     * @returns {string} HTML 문자열
     */
    static createEmailSentHeader(config = {}) {
        return this.createHeader({
            title: '이메일 발송 완료',
            subtitle: '비밀번호 재설정 링크를 이메일로 보내드렸습니다',
            icon: '✅',
            ...config
        });
    }

    /**
     * 성공 메시지 헤더를 생성합니다
     * @param {Object} config - 성공 메시지 헤더 설정
     * @returns {string} HTML 문자열
     */
    static createSuccessHeader(config = {}) {
        return this.createHeader({
            title: '성공',
            subtitle: '요청이 성공적으로 처리되었습니다',
            icon: '🎉',
            className: 'success-header',
            ...config
        });
    }

    /**
     * 오류 메시지 헤더를 생성합니다
     * @param {Object} config - 오류 메시지 헤더 설정
     * @returns {string} HTML 문자열
     */
    static createErrorHeader(config = {}) {
        return this.createHeader({
            title: '오류',
            subtitle: '요청 처리 중 오류가 발생했습니다',
            icon: '❌',
            className: 'error-header',
            ...config
        });
    }
}
