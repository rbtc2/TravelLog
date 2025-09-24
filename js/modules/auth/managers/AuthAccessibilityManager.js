/**
 * 인증 접근성 관리자
 * ARIA 속성, 키보드 네비게이션, 스크린 리더 지원을 담당
 * @class AuthAccessibilityManager
 * @version 1.0.0
 * @since 2024-12-29
 */
export class AuthAccessibilityManager {
    constructor(options = {}) {
        this.options = {
            // 접근성 기능 설정
            enableARIA: true,
            enableKeyboardNavigation: true,
            enableScreenReader: true,
            enableHighContrast: true,
            enableFocusManagement: true,
            
            // 키보드 네비게이션 설정
            tabOrder: ['email', 'password', 'remember', 'forgot-password', 'submit', 'google-login', 'signup-link'],
            skipLinks: true,
            focusTrap: true,
            
            // 스크린 리더 설정
            announceChanges: true,
            liveRegions: true,
            descriptiveLabels: true,
            
            // 고대비 모드 설정
            highContrastClass: 'high-contrast',
            autoDetectHighContrast: true,
            
            ...options
        };
        
        // 접근성 상태
        this.state = {
            isHighContrast: false,
            isScreenReaderActive: false,
            currentFocus: null,
            focusHistory: [],
            announcements: []
        };
        
        // ARIA 라이브 리전
        this.liveRegion = null;
        this.setupLiveRegion();
        
        // 키보드 이벤트 리스너
        this.keyboardListeners = new Map();
        this.setupKeyboardNavigation();
        
        // 고대비 모드 감지
        if (this.options.autoDetectHighContrast) {
            this.detectHighContrast();
        }
        
        // 스크린 리더 감지
        this.detectScreenReader();
        
        // 포커스 관리
        this.setupFocusManagement();
    }

    /**
     * 접근성을 초기화합니다
     * @param {HTMLElement} container - 컨테이너 요소
     */
    initialize(container) {
        this.container = container;
        this.setupARIA(container);
        this.setupKeyboardNavigation(container);
        this.setupFocusManagement(container);
        this.announce('인증 화면이 로드되었습니다.');
    }

    /**
     * ARIA 속성을 설정합니다
     * @param {HTMLElement} container - 컨테이너 요소
     */
    setupARIA(container) {
        if (!this.options.enableARIA) return;
        
        // 메인 컨테이너
        container.setAttribute('role', 'main');
        container.setAttribute('aria-label', '인증 화면');
        
        // 폼 설정
        const forms = container.querySelectorAll('form');
        forms.forEach(form => {
            form.setAttribute('role', 'form');
            form.setAttribute('aria-label', '인증 폼');
        });
        
        // 입력 필드 설정
        this.setupInputFields(container);
        
        // 버튼 설정
        this.setupButtons(container);
        
        // 링크 설정
        this.setupLinks(container);
        
        // 에러 메시지 설정
        this.setupErrorMessages(container);
    }

    /**
     * 입력 필드의 ARIA 속성을 설정합니다
     * @param {HTMLElement} container - 컨테이너 요소
     */
    setupInputFields(container) {
        const inputs = container.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            const id = input.id;
            const type = input.type;
            const required = input.hasAttribute('required');
            const invalid = input.hasAttribute('aria-invalid');
            
            // 기본 ARIA 속성
            input.setAttribute('aria-describedby', `${id}-description`);
            
            if (required) {
                input.setAttribute('aria-required', 'true');
            }
            
            if (invalid) {
                input.setAttribute('aria-invalid', 'true');
            }
            
            // 타입별 특별 설정
            switch (type) {
                case 'email':
                    input.setAttribute('aria-label', '이메일 주소');
                    input.setAttribute('autocomplete', 'email');
                    break;
                case 'password':
                    input.setAttribute('aria-label', '비밀번호');
                    input.setAttribute('autocomplete', 'current-password');
                    break;
                case 'checkbox':
                    input.setAttribute('role', 'checkbox');
                    break;
            }
            
            // 설명 텍스트 추가
            this.addDescriptionText(input);
        });
    }

    /**
     * 버튼의 ARIA 속성을 설정합니다
     * @param {HTMLElement} container - 컨테이너 요소
     */
    setupButtons(container) {
        const buttons = container.querySelectorAll('button');
        
        buttons.forEach(button => {
            const id = button.id;
            const text = button.textContent.trim();
            const type = button.type;
            
            // 기본 ARIA 속성
            button.setAttribute('role', 'button');
            
            // 버튼별 특별 설정
            switch (id) {
                case 'login-btn':
                    button.setAttribute('aria-label', '로그인 버튼');
                    break;
                case 'signup-btn':
                    button.setAttribute('aria-label', '회원가입 버튼');
                    break;
                case 'google-login-btn':
                    button.setAttribute('aria-label', 'Google로 로그인');
                    break;
                case 'forgot-password-btn':
                    button.setAttribute('aria-label', '비밀번호 재설정');
                    break;
                case 'resend-email-btn':
                    button.setAttribute('aria-label', '이메일 다시 보내기');
                    break;
            }
            
            // 로딩 상태 설정
            if (button.classList.contains('loading')) {
                button.setAttribute('aria-busy', 'true');
                button.setAttribute('aria-label', `${text} (처리 중)`);
            }
        });
    }

    /**
     * 링크의 ARIA 속성을 설정합니다
     * @param {HTMLElement} container - 컨테이너 요소
     */
    setupLinks(container) {
        const links = container.querySelectorAll('a');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();
            const action = link.getAttribute('data-action');
            
            // 기본 ARIA 속성
            link.setAttribute('role', 'link');
            
            // 액션별 설정
            switch (action) {
                case 'forgot-password':
                    link.setAttribute('aria-label', '비밀번호 찾기 링크');
                    break;
                case 'signup':
                    link.setAttribute('aria-label', '회원가입 링크');
                    break;
                case 'login':
                    link.setAttribute('aria-label', '로그인 링크');
                    break;
            }
            
            // 외부 링크 표시
            if (href && href.startsWith('http') && !href.includes(window.location.hostname)) {
                link.setAttribute('aria-label', `${text} (외부 링크)`);
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }

    /**
     * 에러 메시지의 ARIA 속성을 설정합니다
     * @param {HTMLElement} container - 컨테이너 요소
     */
    setupErrorMessages(container) {
        const errorMessages = container.querySelectorAll('.error-message, .form-error');
        
        errorMessages.forEach(error => {
            error.setAttribute('role', 'alert');
            error.setAttribute('aria-live', 'polite');
        });
    }

    /**
     * 설명 텍스트를 추가합니다
     * @param {HTMLElement} input - 입력 요소
     */
    addDescriptionText(input) {
        const id = input.id;
        const type = input.type;
        
        if (!id) return;
        
        let description = '';
        
        switch (type) {
            case 'email':
                description = '이메일 주소를 입력하세요. 예: user@example.com';
                break;
            case 'password':
                description = '비밀번호를 입력하세요. 최소 6자 이상이어야 합니다.';
                break;
            case 'checkbox':
                description = '로그인 상태를 유지하려면 체크하세요.';
                break;
        }
        
        if (description) {
            const descriptionElement = document.createElement('div');
            descriptionElement.id = `${id}-description`;
            descriptionElement.className = 'sr-only';
            descriptionElement.textContent = description;
            
            input.parentNode.insertBefore(descriptionElement, input.nextSibling);
        }
    }

    /**
     * 키보드 네비게이션을 설정합니다
     * @param {HTMLElement} container - 컨테이너 요소
     */
    setupKeyboardNavigation(container) {
        if (!this.options.enableKeyboardNavigation) return;
        
        // Tab 키 처리
        this.addKeyboardListener('keydown', (event) => {
            if (event.key === 'Tab') {
                this.handleTabNavigation(event);
            }
        });
        
        // Enter 키 처리
        this.addKeyboardListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.handleEnterKey(event);
            }
        });
        
        // Escape 키 처리
        this.addKeyboardListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.handleEscapeKey(event);
            }
        });
        
        // 화살표 키 처리
        this.addKeyboardListener('keydown', (event) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                this.handleArrowKeys(event);
            }
        });
    }

    /**
     * Tab 네비게이션을 처리합니다
     * @param {KeyboardEvent} event - 키보드 이벤트
     */
    handleTabNavigation(event) {
        const focusableElements = this.getFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement);
        
        if (event.shiftKey) {
            // Shift + Tab (이전 요소)
            if (currentIndex <= 0) {
                event.preventDefault();
                focusableElements[focusableElements.length - 1].focus();
            }
        } else {
            // Tab (다음 요소)
            if (currentIndex >= focusableElements.length - 1) {
                event.preventDefault();
                focusableElements[0].focus();
            }
        }
    }

    /**
     * Enter 키를 처리합니다
     * @param {KeyboardEvent} event - 키보드 이벤트
     */
    handleEnterKey(event) {
        const target = event.target;
        
        if (target.tagName === 'BUTTON') {
            // 버튼 클릭
            target.click();
        } else if (target.tagName === 'A') {
            // 링크 클릭
            target.click();
        } else if (target.tagName === 'INPUT' && target.type === 'checkbox') {
            // 체크박스 토글
            target.checked = !target.checked;
            target.dispatchEvent(new Event('change'));
        }
    }

    /**
     * Escape 키를 처리합니다
     * @param {KeyboardEvent} event - 키보드 이벤트
     */
    handleEscapeKey(event) {
        // 모달이 열려있으면 닫기
        const modal = this.container.querySelector('.modal, .popup');
        if (modal) {
            modal.style.display = 'none';
            this.announce('모달이 닫혔습니다.');
        }
        
        // 에러 메시지 숨기기
        const errorMessages = this.container.querySelectorAll('.error-message, .form-error');
        errorMessages.forEach(error => {
            error.style.display = 'none';
        });
    }

    /**
     * 화살표 키를 처리합니다
     * @param {KeyboardEvent} event - 키보드 이벤트
     */
    handleArrowKeys(event) {
        const target = event.target;
        
        if (target.tagName === 'INPUT' && target.type === 'checkbox') {
            // 체크박스에서 화살표 키로 토글
            if (['ArrowUp', 'ArrowLeft'].includes(event.key)) {
                target.checked = false;
            } else if (['ArrowDown', 'ArrowRight'].includes(event.key)) {
                target.checked = true;
            }
            target.dispatchEvent(new Event('change'));
        }
    }

    /**
     * 포커스 가능한 요소들을 가져옵니다
     * @returns {HTMLElement[]} 포커스 가능한 요소 배열
     */
    getFocusableElements() {
        const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        return Array.from(this.container.querySelectorAll(selector))
            .filter(element => {
                return !element.disabled && 
                       !element.hidden && 
                       element.offsetParent !== null;
            });
    }

    /**
     * 포커스 관리를 설정합니다
     * @param {HTMLElement} container - 컨테이너 요소
     */
    setupFocusManagement(container) {
        if (!this.options.enableFocusManagement) return;
        
        // 포커스 트랩 설정
        if (this.options.focusTrap) {
            this.setupFocusTrap(container);
        }
        
        // 포커스 히스토리 관리
        this.addKeyboardListener('focusin', (event) => {
            this.state.currentFocus = event.target;
            this.state.focusHistory.push(event.target);
            
            // 히스토리 크기 제한
            if (this.state.focusHistory.length > 10) {
                this.state.focusHistory.shift();
            }
        });
    }

    /**
     * 포커스 트랩을 설정합니다
     * @param {HTMLElement} container - 컨테이너 요소
     */
    setupFocusTrap(container) {
        const focusableElements = this.getFocusableElements();
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // 첫 번째 요소에 포커스
        firstElement.focus();
        
        // Tab 키로 마지막 요소에서 첫 번째 요소로 이동
        lastElement.addEventListener('keydown', (event) => {
            if (event.key === 'Tab' && !event.shiftKey) {
                event.preventDefault();
                firstElement.focus();
            }
        });
        
        // Shift + Tab 키로 첫 번째 요소에서 마지막 요소로 이동
        firstElement.addEventListener('keydown', (event) => {
            if (event.key === 'Tab' && event.shiftKey) {
                event.preventDefault();
                lastElement.focus();
            }
        });
    }

    /**
     * 라이브 리전을 설정합니다
     */
    setupLiveRegion() {
        if (!this.options.liveRegions) return;
        
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only';
        this.liveRegion.id = 'auth-live-region';
        
        document.body.appendChild(this.liveRegion);
    }

    /**
     * 공지를 발표합니다
     * @param {string} message - 공지 메시지
     * @param {string} priority - 우선순위 (polite, assertive)
     */
    announce(message, priority = 'polite') {
        if (!this.options.announceChanges) return;
        
        if (this.liveRegion) {
            this.liveRegion.setAttribute('aria-live', priority);
            this.liveRegion.textContent = message;
            
            // 메시지 히스토리에 추가
            this.state.announcements.push({
                message,
                priority,
                timestamp: Date.now()
            });
        }
    }

    /**
     * 고대비 모드를 감지합니다
     */
    detectHighContrast() {
        if (!this.options.enableHighContrast) return;
        
        // 미디어 쿼리로 고대비 모드 감지
        const mediaQuery = window.matchMedia('(prefers-contrast: high)');
        
        const handleChange = (e) => {
            this.state.isHighContrast = e.matches;
            this.applyHighContrast(e.matches);
        };
        
        mediaQuery.addEventListener('change', handleChange);
        handleChange(mediaQuery);
    }

    /**
     * 고대비 모드를 적용합니다
     * @param {boolean} enabled - 고대비 모드 활성화 여부
     */
    applyHighContrast(enabled) {
        if (enabled) {
            document.body.classList.add(this.options.highContrastClass);
            this.announce('고대비 모드가 활성화되었습니다.');
        } else {
            document.body.classList.remove(this.options.highContrastClass);
            this.announce('고대비 모드가 비활성화되었습니다.');
        }
    }

    /**
     * 스크린 리더를 감지합니다
     */
    detectScreenReader() {
        if (!this.options.enableScreenReader) return;
        
        // 스크린 리더 감지 방법들
        const detectionMethods = [
            () => window.speechSynthesis && window.speechSynthesis.getVoices().length > 0,
            () => navigator.userAgent.includes('NVDA'),
            () => navigator.userAgent.includes('JAWS'),
            () => navigator.userAgent.includes('VoiceOver'),
            () => window.screen.width === 0 || window.screen.height === 0
        ];
        
        const isScreenReaderActive = detectionMethods.some(method => {
            try {
                return method();
            } catch (e) {
                return false;
            }
        });
        
        this.state.isScreenReaderActive = isScreenReaderActive;
        
        if (isScreenReaderActive) {
            this.announce('스크린 리더가 감지되었습니다. 접근성 기능이 활성화되었습니다.');
        }
    }

    /**
     * 키보드 리스너를 추가합니다
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 핸들러 함수
     */
    addKeyboardListener(event, handler) {
        const listener = (e) => {
            if (this.container && this.container.contains(e.target)) {
                handler(e);
            }
        };
        
        document.addEventListener(event, listener);
        this.keyboardListeners.set(event, listener);
    }

    /**
     * 접근성 상태를 가져옵니다
     * @returns {Object} 접근성 상태
     */
    getAccessibilityState() {
        return {
            ...this.state,
            focusableElements: this.getFocusableElements().length,
            hasLiveRegion: !!this.liveRegion,
            keyboardListeners: this.keyboardListeners.size
        };
    }

    /**
     * 접근성 테스트를 실행합니다
     * @returns {Object} 테스트 결과
     */
    runAccessibilityTest() {
        const results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            issues: []
        };
        
        // ARIA 속성 테스트
        this.testARIAAttributes(results);
        
        // 키보드 네비게이션 테스트
        this.testKeyboardNavigation(results);
        
        // 색상 대비 테스트
        this.testColorContrast(results);
        
        // 포커스 관리 테스트
        this.testFocusManagement(results);
        
        return results;
    }

    /**
     * ARIA 속성을 테스트합니다
     * @param {Object} results - 테스트 결과 객체
     */
    testARIAAttributes(results) {
        const requiredAttributes = ['role', 'aria-label', 'aria-describedby'];
        const elements = this.container.querySelectorAll('button, input, a, form');
        
        elements.forEach(element => {
            const hasRequiredAttributes = requiredAttributes.some(attr => 
                element.hasAttribute(attr)
            );
            
            if (hasRequiredAttributes) {
                results.passed++;
            } else {
                results.failed++;
                results.issues.push({
                    type: 'ARIA',
                    element: element.tagName,
                    issue: '필수 ARIA 속성이 없습니다.'
                });
            }
        });
    }

    /**
     * 키보드 네비게이션을 테스트합니다
     * @param {Object} results - 테스트 결과 객체
     */
    testKeyboardNavigation(results) {
        const focusableElements = this.getFocusableElements();
        
        if (focusableElements.length > 0) {
            results.passed++;
        } else {
            results.failed++;
            results.issues.push({
                type: 'Keyboard',
                issue: '포커스 가능한 요소가 없습니다.'
            });
        }
    }

    /**
     * 색상 대비를 테스트합니다
     * @param {Object} results - 테스트 결과 객체
     */
    testColorContrast(results) {
        // 간단한 색상 대비 테스트
        const textElements = this.container.querySelectorAll('p, span, div, label');
        let hasLowContrast = false;
        
        textElements.forEach(element => {
            const style = window.getComputedStyle(element);
            const color = style.color;
            const backgroundColor = style.backgroundColor;
            
            // 실제 대비 계산은 복잡하므로 간단한 체크만 수행
            if (color === backgroundColor) {
                hasLowContrast = true;
            }
        });
        
        if (hasLowContrast) {
            results.warnings++;
            results.issues.push({
                type: 'Contrast',
                issue: '색상 대비가 부족할 수 있습니다.'
            });
        } else {
            results.passed++;
        }
    }

    /**
     * 포커스 관리를 테스트합니다
     * @param {Object} results - 테스트 결과 객체
     */
    testFocusManagement(results) {
        const focusableElements = this.getFocusableElements();
        
        if (focusableElements.length > 0) {
            // 첫 번째 요소에 포커스 가능한지 테스트
            try {
                focusableElements[0].focus();
                results.passed++;
            } catch (e) {
                results.failed++;
                results.issues.push({
                    type: 'Focus',
                    issue: '포커스 설정에 실패했습니다.'
                });
            }
        }
    }

    /**
     * 리소스를 정리합니다
     */
    cleanup() {
        // 키보드 리스너 제거
        this.keyboardListeners.forEach((listener, event) => {
            document.removeEventListener(event, listener);
        });
        this.keyboardListeners.clear();
        
        // 라이브 리전 제거
        if (this.liveRegion) {
            this.liveRegion.remove();
            this.liveRegion = null;
        }
        
        // 상태 초기화
        this.state = {
            isHighContrast: false,
            isScreenReaderActive: false,
            currentFocus: null,
            focusHistory: [],
            announcements: []
        };
    }
}
