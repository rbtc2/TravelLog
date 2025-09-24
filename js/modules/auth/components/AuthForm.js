/**
 * 인증 폼 공통 컴포넌트
 * @class AuthForm
 * @version 1.0.0
 * @since 2024-12-29
 */
export class AuthForm {
    /**
     * 폼 그룹을 생성합니다
     * @param {Object} config - 폼 그룹 설정
     * @param {string} config.id - 입력 필드 ID
     * @param {string} config.name - 입력 필드 name
     * @param {string} config.type - 입력 필드 타입
     * @param {string} config.label - 라벨 텍스트
     * @param {string} config.placeholder - 플레이스홀더 텍스트
     * @param {boolean} config.required - 필수 여부
     * @param {string} config.value - 기본값
     * @param {Object} config.attributes - 추가 속성
     * @returns {string} HTML 문자열
     */
    static createFormGroup(config) {
        const {
            id,
            name,
            type = 'text',
            label,
            placeholder = '',
            required = false,
            value = '',
            attributes = {}
        } = config;

        const requiredAttr = required ? 'required' : '';
        const valueAttr = value ? `value="${value}"` : '';
        
        // 추가 속성들을 문자열로 변환
        const additionalAttrs = Object.entries(attributes)
            .map(([key, val]) => `${key}="${val}"`)
            .join(' ');

        return `
            <div class="form-group">
                <label for="${id}" class="form-label">${label}</label>
                <input 
                    type="${type}" 
                    id="${id}" 
                    name="${name}" 
                    class="form-input" 
                    placeholder="${placeholder}"
                    ${requiredAttr}
                    ${valueAttr}
                    ${additionalAttrs}
                >
            </div>
        `;
    }

    /**
     * 이메일 입력 필드를 생성합니다
     * @param {Object} config - 이메일 필드 설정
     * @returns {string} HTML 문자열
     */
    static createEmailField(config = {}) {
        return this.createFormGroup({
            type: 'email',
            label: '이메일',
            placeholder: 'your@email.com',
            required: true,
            ...config
        });
    }

    /**
     * 비밀번호 입력 필드를 생성합니다
     * @param {Object} config - 비밀번호 필드 설정
     * @returns {string} HTML 문자열
     */
    static createPasswordField(config = {}) {
        return this.createFormGroup({
            type: 'password',
            label: '비밀번호',
            placeholder: '••••••••',
            required: true,
            ...config
        });
    }

    /**
     * 텍스트 입력 필드를 생성합니다
     * @param {Object} config - 텍스트 필드 설정
     * @returns {string} HTML 문자열
     */
    static createTextField(config = {}) {
        return this.createFormGroup({
            type: 'text',
            ...config
        });
    }

    /**
     * 체크박스를 생성합니다
     * @param {Object} config - 체크박스 설정
     * @param {string} config.id - 체크박스 ID
     * @param {string} config.name - 체크박스 name
     * @param {string} config.label - 라벨 텍스트
     * @param {boolean} config.checked - 체크 상태
     * @returns {string} HTML 문자열
     */
    static createCheckbox(config) {
        const { id, name, label, checked = false } = config;
        const checkedAttr = checked ? 'checked' : '';

        return `
            <div class="form-group">
                <label class="checkbox-label" for="${id}">
                    <input type="checkbox" id="${id}" name="${name}" ${checkedAttr}>
                    <span class="checkmark"></span>
                    ${label}
                </label>
            </div>
        `;
    }

    /**
     * 폼 컨테이너를 생성합니다
     * @param {string} content - 폼 내용
     * @param {string} formId - 폼 ID
     * @param {string} className - 추가 CSS 클래스
     * @returns {string} HTML 문자열
     */
    static createFormContainer(content, formId, className = '') {
        return `
            <form class="login-form ${className}" id="${formId}" novalidate>
                ${content}
            </form>
        `;
    }

    /**
     * 폼 옵션 영역을 생성합니다 (체크박스, 링크 등)
     * @param {string} content - 옵션 내용
     * @returns {string} HTML 문자열
     */
    static createFormOptions(content) {
        return `
            <div class="form-options">
                ${content}
            </div>
        `;
    }

    /**
     * 링크를 생성합니다
     * @param {Object} config - 링크 설정
     * @param {string} config.text - 링크 텍스트
     * @param {string} config.className - CSS 클래스
     * @param {string} config.action - 액션 타입
     * @returns {string} HTML 문자열
     */
    static createLink(config) {
        const { text, className, action } = config;
        return `
            <div class="signup-link">
                <a href="#" class="${className}" data-action="${action}">${text}</a>
            </div>
        `;
    }
}
