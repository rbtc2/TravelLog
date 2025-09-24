/**
 * TravelLog 인증 이벤트 핸들러
 * 인증 관련 이벤트 처리를 담당
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

/**
 * 인증 이벤트 핸들러 클래스
 * 인증 관련 이벤트 바인딩과 처리를 담당
 */
class AuthEventHandler {
    constructor() {
        this.eventListeners = new Map();
        this.isInitialized = false;
        
        // 콜백 함수들 (외부에서 주입받을 수 있도록)
        this.onLogin = null;
        this.onGoogleLogin = null;
        this.onSignup = null;
        this.onForgotPassword = null;
        this.onResendEmail = null;
        this.onViewChange = null;
    }

    /**
     * 이벤트 핸들러를 초기화합니다
     * @param {Object} callbacks - 콜백 함수들
     * @param {Function} callbacks.onLogin - 로그인 콜백
     * @param {Function} callbacks.onGoogleLogin - Google 로그인 콜백
     * @param {Function} callbacks.onSignup - 회원가입 콜백
     * @param {Function} callbacks.onForgotPassword - 비밀번호 찾기 콜백
     * @param {Function} callbacks.onResendEmail - 이메일 재발송 콜백
     * @param {Function} callbacks.onViewChange - 뷰 변경 콜백
     */
    initialize(callbacks = {}) {
        this.onLogin = callbacks.onLogin || (() => {});
        this.onGoogleLogin = callbacks.onGoogleLogin || (() => {});
        this.onSignup = callbacks.onSignup || (() => {});
        this.onForgotPassword = callbacks.onForgotPassword || (() => {});
        this.onResendEmail = callbacks.onResendEmail || (() => {});
        this.onViewChange = callbacks.onViewChange || (() => {});

        this.isInitialized = true;
    }

    /**
     * 모든 이벤트 리스너를 바인딩합니다
     */
    bindAllEvents() {
        if (!this.isInitialized) {
            console.error('AuthEventHandler가 초기화되지 않았습니다.');
            return;
        }

        this.bindLoginEvents();
        this.bindSignupEvents();
        this.bindForgotPasswordEvents();
        this.bindEmailConfirmationEvents();
        this.bindNavigationEvents();
    }

    /**
     * 로그인 관련 이벤트를 바인딩합니다
     */
    bindLoginEvents() {
        // 로그인 폼 제출
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            this.addEventListener(loginForm, 'submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleLoginSubmit();
            });
        }
        
        // 로그인 버튼 클릭
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            this.addEventListener(loginBtn, 'click', (e) => {
                e.preventDefault();
                this.handleLoginSubmit();
            });
        }

        // Google 로그인 버튼 클릭
        const googleLoginBtn = document.getElementById('google-login-btn');
        if (googleLoginBtn) {
            this.addEventListener(googleLoginBtn, 'click', () => {
                console.log('Google 로그인 버튼 클릭됨');
                this.handleGoogleLogin();
            });
        } else {
            console.warn('Google 로그인 버튼을 찾을 수 없습니다');
        }
    }

    /**
     * 회원가입 관련 이벤트를 바인딩합니다
     */
    bindSignupEvents() {
        // 회원가입 폼 제출
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            this.addEventListener(signupForm, 'submit', (e) => {
                e.preventDefault();
                this.handleSignupSubmit();
            });
        }
    }

    /**
     * 비밀번호 찾기 관련 이벤트를 바인딩합니다
     */
    bindForgotPasswordEvents() {
        // 비밀번호 찾기 폼 제출
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        if (forgotPasswordForm) {
            this.addEventListener(forgotPasswordForm, 'submit', (e) => {
                e.preventDefault();
                this.handleForgotPasswordSubmit();
            });
        }
    }

    /**
     * 이메일 확인 관련 이벤트를 바인딩합니다
     */
    bindEmailConfirmationEvents() {
        // 이메일 다시 보내기 버튼
        const resendEmailBtn = document.getElementById('resend-email-btn');
        if (resendEmailBtn) {
            this.addEventListener(resendEmailBtn, 'click', () => {
                this.handleResendEmail();
            });
        }
    }

    /**
     * 네비게이션 관련 이벤트를 바인딩합니다
     */
    bindNavigationEvents() {
        // 회원가입 링크 클릭
        const signupLink = document.querySelector('.signup-btn');
        if (signupLink) {
            this.addEventListener(signupLink, 'click', (e) => {
                e.preventDefault();
                this.onViewChange('signup');
            });
        }

        // 비밀번호 찾기 링크 클릭
        const forgotPasswordLink = document.querySelector('.forgot-password');
        if (forgotPasswordLink) {
            this.addEventListener(forgotPasswordLink, 'click', (e) => {
                e.preventDefault();
                this.onViewChange('forgot-password');
            });
        }

        // 로그인으로 돌아가기 링크
        const loginBtnLink = document.querySelector('.login-btn-link');
        if (loginBtnLink) {
            this.addEventListener(loginBtnLink, 'click', (e) => {
                e.preventDefault();
                this.onViewChange('login');
            });
        }
    }

    /**
     * 로그인 폼 제출을 처리합니다
     */
    handleLoginSubmit() {
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        const remember = document.getElementById('remember')?.checked;

        if (!email || !password) {
            console.error('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        this.onLogin({ email, password, remember });
    }

    /**
     * Google 로그인을 처리합니다
     */
    handleGoogleLogin() {
        this.onGoogleLogin();
    }

    /**
     * 회원가입 폼 제출을 처리합니다
     */
    handleSignupSubmit() {
        const email = document.getElementById('signup-email')?.value;
        const password = document.getElementById('signup-password')?.value;
        const confirmPassword = document.getElementById('signup-confirm-password')?.value;
        const fullName = document.getElementById('signup-full-name')?.value;
        const residenceCountry = document.getElementById('signup-residence-country')?.value;

        if (!email || !password || !confirmPassword || !fullName) {
            console.error('모든 필드를 입력해주세요.');
            return;
        }

        if (!residenceCountry) {
            console.error('현재 거주국을 선택해주세요.');
            return;
        }

        this.onSignup({ email, password, confirmPassword, fullName, residenceCountry });
    }

    /**
     * 비밀번호 찾기 폼 제출을 처리합니다
     */
    handleForgotPasswordSubmit() {
        const email = document.getElementById('forgot-email')?.value;

        if (!email) {
            console.error('이메일을 입력해주세요.');
            return;
        }

        this.onForgotPassword({ email });
    }

    /**
     * 이메일 재발송을 처리합니다
     */
    handleResendEmail() {
        this.onResendEmail();
    }

    /**
     * 이벤트 리스너를 추가합니다
     * @param {HTMLElement} element - 이벤트를 바인딩할 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     */
    addEventListener(element, event, handler) {
        if (!element) return;

        // 기존 리스너 제거 (중복 방지)
        this.removeEventListener(element, event);

        // 새 리스너 추가
        element.addEventListener(event, handler);
        
        // 리스너 추적
        const key = `${element.id || element.className || 'unknown'}_${event}`;
        this.eventListeners.set(key, { element, event, handler });
    }

    /**
     * 이벤트 리스너를 제거합니다
     * @param {HTMLElement} element - 이벤트를 제거할 요소
     * @param {string} event - 이벤트 타입
     */
    removeEventListener(element, event) {
        if (!element) return;

        const key = `${element.id || element.className || 'unknown'}_${event}`;
        const listener = this.eventListeners.get(key);
        
        if (listener) {
            element.removeEventListener(event, listener.handler);
            this.eventListeners.delete(key);
        }
    }

    /**
     * 특정 뷰의 이벤트만 다시 바인딩합니다
     * @param {string} viewName - 뷰 이름
     */
    rebindViewEvents(viewName) {
        // 기존 이벤트 제거
        this.unbindAllEvents();

        // 새 이벤트 바인딩
        this.bindAllEvents();
    }

    /**
     * 모든 이벤트 리스너를 제거합니다
     */
    unbindAllEvents() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            if (element && element.removeEventListener) {
                element.removeEventListener(event, handler);
            }
        });
        this.eventListeners.clear();
    }

    /**
     * 이벤트 핸들러를 정리합니다
     */
    cleanup() {
        this.unbindAllEvents();
        this.isInitialized = false;
        this.onLogin = null;
        this.onGoogleLogin = null;
        this.onSignup = null;
        this.onForgotPassword = null;
        this.onResendEmail = null;
        this.onViewChange = null;
    }
}

export { AuthEventHandler };
