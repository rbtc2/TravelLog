/**
 * TravelLog 인증 뷰 베이스 클래스
 * 모든 인증 뷰의 공통 기능을 제공하는 추상 클래스
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

/**
 * 인증 뷰 베이스 클래스
 * 모든 인증 뷰가 상속받아야 하는 추상 클래스
 */
export class BaseAuthView {
    constructor(container, config = {}) {
        // 추상 클래스 강제
        if (this.constructor === BaseAuthView) {
            throw new Error("BaseAuthView는 추상 클래스입니다. 직접 인스턴스화할 수 없습니다.");
        }

        this.container = container; // null일 수 있음 (나중에 설정)
        this.config = {
            title: config.title || 'TravelLog',
            subtitle: config.subtitle || '여행의 모든 순간을 기록하세요',
            icon: config.icon || '✈️',
            ...config
        };
        
        this.isInitialized = false;
        this.isRendered = false;
        
        // 콜백 함수들
        this.onViewChange = null;
        this.onSubmit = null;
        this.onError = null;
    }

    /**
     * 뷰를 초기화합니다
     * @param {Object} callbacks - 콜백 함수들
     * @param {Function} callbacks.onViewChange - 뷰 변경 콜백
     * @param {Function} callbacks.onSubmit - 폼 제출 콜백
     * @param {Function} callbacks.onError - 에러 콜백
     */
    initialize(callbacks = {}) {
        this.onViewChange = callbacks.onViewChange || (() => {});
        this.onSubmit = callbacks.onSubmit || (() => {});
        this.onError = callbacks.onError || (() => {});
        
        this.isInitialized = true;
    }

    /**
     * 뷰를 렌더링합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    render(skipCallback = false) {
        if (!this.isInitialized) {
            // 자동 초기화 수행 (조용히)
            this.initialize({
                onViewChange: () => {},
                onSubmit: () => {},
                onError: () => {}
            });
        }

        if (!this.container) {
            console.error(`${this.constructor.name}의 컨테이너가 설정되지 않았습니다.`);
            throw new Error(`${this.constructor.name}의 컨테이너가 설정되지 않았습니다.`);
        }

        this.renderContent();
        this.bindEvents();
        this.isRendered = true;

        if (!skipCallback && this.onViewChange) {
            this.onViewChange(this.getViewName());
        }
    }

    /**
     * 뷰 내용을 렌더링합니다 (하위 클래스에서 구현)
     * @abstract
     */
    renderContent() {
        throw new Error(`${this.constructor.name}에서 renderContent()를 구현해야 합니다.`);
    }

    /**
     * 이벤트를 바인딩합니다 (하위 클래스에서 구현)
     * @abstract
     */
    bindEvents() {
        throw new Error(`${this.constructor.name}에서 bindEvents()를 구현해야 합니다.`);
    }

    /**
     * 뷰 이름을 반환합니다 (하위 클래스에서 구현)
     * @abstract
     * @returns {string} 뷰 이름
     */
    getViewName() {
        throw new Error(`${this.constructor.name}에서 getViewName()을 구현해야 합니다.`);
    }

    /**
     * 공통 헤더를 렌더링합니다
     * @returns {string} 헤더 HTML
     */
    renderHeader() {
        return `
            <div class="login-header">
                <div class="login-logo">${this.config.icon}</div>
                <h1 class="login-title">${this.config.title}</h1>
                <p class="login-subtitle">${this.config.subtitle}</p>
            </div>
        `;
    }

    /**
     * 공통 폼 컨테이너를 렌더링합니다
     * @param {string} content - 폼 내용
     * @param {string} formId - 폼 ID
     * @returns {string} 폼 컨테이너 HTML
     */
    renderFormContainer(content, formId) {
        return `
            <div class="login-container">
                ${this.renderHeader()}
                <form class="login-form" id="${formId}">
                    ${content}
                </form>
            </div>
        `;
    }

    /**
     * 공통 링크 섹션을 렌더링합니다
     * @param {Array} links - 링크 배열
     * @returns {string} 링크 섹션 HTML
     */
    renderLinks(links = []) {
        if (links.length === 0) return '';

        return `
            <div class="signup-link">
                ${links.map(link => `
                    <a href="#" class="${link.className}" data-action="${link.action}">
                        ${link.text}
                    </a>
                `).join(' ')}
            </div>
        `;
    }

    /**
     * 폼 데이터를 수집합니다
     * @param {string} formId - 폼 ID
     * @returns {Object} 폼 데이터
     */
    getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    /**
     * 폼 유효성을 검사합니다
     * @param {Object} data - 폼 데이터
     * @returns {Object} 유효성 검사 결과
     */
    validateForm(data) {
        const errors = [];

        // 기본 유효성 검사
        Object.entries(data).forEach(([key, value]) => {
            if (!value || value.trim() === '') {
                errors.push(`${key} 필드는 필수입니다.`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 로딩 상태를 설정합니다
     * @param {boolean} isLoading - 로딩 상태
     * @param {string} buttonId - 버튼 ID
     * @param {string} loadingText - 로딩 텍스트
     */
    setLoadingState(isLoading, buttonId, loadingText = '처리 중...') {
        const button = document.getElementById(buttonId);
        if (!button) return;

        if (isLoading) {
            button.disabled = true;
            button.textContent = loadingText;
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            // 원래 텍스트로 복원 (하위 클래스에서 구현)
            this.restoreButtonText(buttonId);
        }
    }

    /**
     * 버튼 텍스트를 복원합니다 (하위 클래스에서 구현)
     * @param {string} buttonId - 버튼 ID
     */
    restoreButtonText(buttonId) {
        // 하위 클래스에서 구현
    }

    /**
     * 에러 메시지를 표시합니다
     * @param {string} message - 에러 메시지
     */
    showError(message) {
        this.onError(message);
    }

    /**
     * 뷰를 정리합니다
     */
    cleanup() {
        this.isInitialized = false;
        this.isRendered = false;
        this.container = null;
        this.onViewChange = null;
        this.onSubmit = null;
        this.onError = null;
    }
}
