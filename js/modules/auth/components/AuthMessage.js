/**
 * 인증 메시지 공통 컴포넌트
 * @class AuthMessage
 * @version 1.0.0
 * @since 2024-12-29
 */
export class AuthMessage {
    /**
     * 기본 메시지를 생성합니다
     * @param {Object} config - 메시지 설정
     * @param {string} config.type - 메시지 타입 (info, success, warning, error)
     * @param {string} config.title - 메시지 제목
     * @param {string} config.content - 메시지 내용
     * @param {string} config.icon - 아이콘 (이모지)
     * @param {string} config.className - 추가 CSS 클래스
     * @returns {string} HTML 문자열
     */
    static createMessage(config) {
        const { type, title, content, icon, className = '' } = config;
        
        const iconHtml = icon ? `<div class="message-icon">${icon}</div>` : '';
        const titleHtml = title ? `<h3 class="message-title">${title}</h3>` : '';

        return `
            <div class="auth-message message-${type} ${className}">
                ${iconHtml}
                <div class="message-content">
                    ${titleHtml}
                    <p class="message-text">${content}</p>
                </div>
            </div>
        `;
    }

    /**
     * 정보 메시지를 생성합니다
     * @param {Object} config - 정보 메시지 설정
     * @returns {string} HTML 문자열
     */
    static createInfoMessage(config) {
        return this.createMessage({
            type: 'info',
            icon: 'ℹ️',
            ...config
        });
    }

    /**
     * 성공 메시지를 생성합니다
     * @param {Object} config - 성공 메시지 설정
     * @returns {string} HTML 문자열
     */
    static createSuccessMessage(config) {
        return this.createMessage({
            type: 'success',
            icon: '✅',
            ...config
        });
    }

    /**
     * 경고 메시지를 생성합니다
     * @param {Object} config - 경고 메시지 설정
     * @returns {string} HTML 문자열
     */
    static createWarningMessage(config) {
        return this.createMessage({
            type: 'warning',
            icon: '⚠️',
            ...config
        });
    }

    /**
     * 오류 메시지를 생성합니다
     * @param {Object} config - 오류 메시지 설정
     * @returns {string} HTML 문자열
     */
    static createErrorMessage(config) {
        return this.createMessage({
            type: 'error',
            icon: '❌',
            ...config
        });
    }

    /**
     * 이메일 확인 메시지를 생성합니다
     * @param {Object} config - 이메일 확인 메시지 설정
     * @returns {string} HTML 문자열
     */
    static createEmailConfirmationMessage(config = {}) {
        return this.createInfoMessage({
            title: '이메일 확인 필요',
            content: '회원가입이 완료되었습니다. 이메일을 확인하고 인증을 완료해주세요.',
            ...config
        });
    }

    /**
     * 이메일 발송 완료 메시지를 생성합니다
     * @param {Object} config - 이메일 발송 완료 메시지 설정
     * @returns {string} HTML 문자열
     */
    static createEmailSentMessage(config = {}) {
        return this.createSuccessMessage({
            title: '이메일 발송 완료',
            content: '이메일로 비밀번호 재설정 링크를 보내드렸습니다. 이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정해주세요.',
            ...config
        });
    }

    /**
     * 로딩 메시지를 생성합니다
     * @param {Object} config - 로딩 메시지 설정
     * @returns {string} HTML 문자열
     */
    static createLoadingMessage(config = {}) {
        const { message = '처리 중...', className = '' } = config;
        
        return `
            <div class="auth-message message-loading ${className}">
                <div class="loading-spinner"></div>
                <p class="message-text">${message}</p>
            </div>
        `;
    }

    /**
     * 폼 유효성 검사 오류 메시지를 생성합니다
     * @param {string} message - 오류 메시지
     * @param {string} fieldId - 필드 ID
     * @returns {string} HTML 문자열
     */
    static createValidationError(message, fieldId) {
        return `
            <div class="form-error" id="${fieldId}-error" role="alert" aria-live="polite">
                ${message}
            </div>
        `;
    }

    /**
     * 폼 성공 메시지를 생성합니다
     * @param {string} message - 성공 메시지
     * @param {string} fieldId - 필드 ID
     * @returns {string} HTML 문자열
     */
    static createValidationSuccess(message, fieldId) {
        return `
            <div class="form-success" id="${fieldId}-success" role="status" aria-live="polite">
                ${message}
            </div>
        `;
    }
}
