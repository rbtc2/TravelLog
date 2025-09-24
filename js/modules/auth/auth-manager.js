/**
 * TravelLog 인증 관리자 (리팩토링됨)
 * 인증 관련 모듈들을 조율하는 메인 컨트롤러
 * 
 * @version 2.0.0
 * @since 2024-12-29
 */

import { AuthController } from './auth-controller.js';
import { AuthViewManager } from './auth-view-manager.js';
import { AuthEventHandler } from './auth-event-handler.js';

class AuthManager {
    constructor() {
        this.isInitialized = false;
        
        // 모듈 인스턴스들
        this.authController = new AuthController();
        this.viewManager = new AuthViewManager();
        this.eventHandler = new AuthEventHandler();

        this.init();
    }

    /**
     * 인증 관리자를 초기화합니다
     */
    async init() {
        try {
            // 뷰 관리자 초기화
        this.viewManager.initialize({
            onViewChange: (viewName) => this.handleViewChange(viewName, true), // 콜백 체인 방지
            onSubmit: (data) => this.handleFormSubmit(data),
            onError: (message) => this.showError(message)
        });

            // 이벤트 핸들러 초기화
            this.eventHandler.initialize({
                onLogin: (data) => this.handleLogin(data),
                onGoogleLogin: () => this.handleGoogleLogin(),
                onSignup: (data) => this.handleSignup(data),
                onForgotPassword: (data) => this.handleForgotPassword(data),
                onResendEmail: () => this.handleResendEmail(),
                onViewChange: (viewName) => this.handleViewChange(viewName, true) // 콜백 체인 방지
            });

            // 인증 컨트롤러 초기화
            await this.authController.initialize({
                onAuthSuccess: () => this.handleAuthSuccess(),
                onAuthLogout: () => this.handleAuthLogout(),
                onError: (message) => this.showError(message)
            });
            
            // 현재 인증 상태 확인
            if (this.authController.isLoggedIn()) {
                this.handleAuthSuccess();
            } else {
                this.showLoginView(true); // 초기 호출 시 콜백 건너뛰기
            }
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('인증 관리자 초기화 실패:', error);
            this.showError('인증 시스템을 초기화할 수 없습니다.');
        }
    }

    /**
     * 이벤트 리스너를 바인딩합니다
     */
    bindEvents() {
        this.eventHandler.bindAllEvents();
    }

    /**
     * 로그인을 처리합니다
     * @param {Object} data - 로그인 데이터
     */
    async handleLogin(data) {
        try {
            this.viewManager.setLoadingState(true);
            const result = await this.authController.handleLogin(data.email, data.password, data.remember);
            
            if (result.success) {
                // 성공 시 handleAuthSuccess가 자동으로 호출됨
            }
            
        } catch (error) {
            console.error('로그인 처리 실패:', error);
        } finally {
            this.viewManager.setLoadingState(false);
        }
    }

    /**
     * Google 로그인을 처리합니다
     */
    async handleGoogleLogin() {
        try {
            this.viewManager.setLoadingState(true);
            
            // Google 로그인 기능은 아직 구현되지 않음
            // 토스트 메시지로 알림
            if (window.toastManager) {
                window.toastManager.show('Google 로그인 기능은 준비 중입니다.', 'info');
            } else {
                console.log('Google 로그인 기능은 준비 중입니다.');
            }
            
        } catch (error) {
            console.error('Google 로그인 처리 실패:', error);
            if (window.toastManager) {
                window.toastManager.show('Google 로그인 처리 중 오류가 발생했습니다.', 'error');
            }
        } finally {
            this.viewManager.setLoadingState(false);
        }
    }

    /**
     * 회원가입을 처리합니다
     * @param {Object} data - 회원가입 데이터
     */
    async handleSignup(data) {
        try {
            this.viewManager.setLoadingState(true);
            const result = await this.authController.handleSignup(data);
            
            if (result.success) {
                if (result.needsEmailConfirmation) {
                    this.viewManager.showEmailConfirmationView();
                } else {
                    // 즉시 로그인된 경우 handleAuthSuccess가 자동으로 호출됨
                }
            }
            
        } catch (error) {
            console.error('회원가입 처리 실패:', error);
        } finally {
            this.viewManager.setLoadingState(false);
        }
    }

    /**
     * 비밀번호 재설정을 처리합니다
     * @param {Object} data - 비밀번호 재설정 데이터
     */
    async handleForgotPassword(data) {
        try {
            this.viewManager.setLoadingState(true);
            const result = await this.authController.handleForgotPassword(data.email);
            
            if (result.success) {
                this.viewManager.showEmailSentView();
            }
            
        } catch (error) {
            console.error('비밀번호 재설정 처리 실패:', error);
        } finally {
            this.viewManager.setLoadingState(false);
        }
    }

    /**
     * 인증 성공을 처리합니다
     */
    handleAuthSuccess() {
        // 로그인 화면 숨기기
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.style.display = 'none';
        }
        
        // 메인 앱 표시
        const mainApp = document.getElementById('main-app');
        if (mainApp) {
            mainApp.classList.remove('hidden');
        }
        
        // 앱 매니저에 로그인 성공 알림
        if (window.appManager) {
            window.appManager.loginSuccess();
        }
    }

    /**
     * 로그아웃을 처리합니다
     */
    handleAuthLogout() {
        // 메인 앱 숨기기
        const mainApp = document.getElementById('main-app');
        if (mainApp) {
            mainApp.classList.add('hidden');
        }
        
        // 로그인 화면 표시
        this.showLoginView();
        
        // 앱 매니저에 로그아웃 알림
        if (window.appManager) {
            window.appManager.logoutSuccess();
        }
    }

    /**
     * 로그인 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showLoginView(skipCallback = false) {
        this.viewManager.showLoginView(skipCallback);
        this.bindEvents();
    }

    /**
     * 회원가입 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showSignupView(skipCallback = false) {
        this.viewManager.showSignupView(skipCallback);
        // CountrySelector는 viewManager에서 자동으로 초기화되므로 bindEvents만 호출
        this.bindEvents();
    }

    /**
     * 비밀번호 찾기 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showForgotPasswordView(skipCallback = false) {
        this.viewManager.showForgotPasswordView(skipCallback);
        this.bindEvents();
    }

    /**
     * 이메일 확인 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showEmailConfirmationView(skipCallback = false) {
        this.viewManager.showEmailConfirmationView(skipCallback);
        this.bindEvents();
    }

    /**
     * 이메일 발송 완료 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showEmailSentView(skipCallback = false) {
        this.viewManager.showEmailSentView(skipCallback);
        this.bindEvents();
    }

    /**
     * 뷰 변경을 처리합니다
     * @param {string} viewName - 뷰 이름
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    handleViewChange(viewName, skipCallback = false) {
        switch (viewName) {
            case 'login':
                this.showLoginView(skipCallback);
                break;
            case 'signup':
                this.showSignupView(skipCallback);
                break;
            case 'forgot-password':
                this.showForgotPasswordView(skipCallback);
                break;
            case 'email-confirmation':
                this.showEmailConfirmationView(skipCallback);
                break;
            case 'email-sent':
                this.showEmailSentView(skipCallback);
                break;
            default:
                console.warn('알 수 없는 뷰:', viewName);
        }
    }

    /**
     * 폼 제출을 처리합니다
     * @param {Object} data - 제출 데이터
     */
    handleFormSubmit(data) {
        switch (data.type) {
            case 'login':
                this.handleLogin(data.data);
                break;
            case 'google-login':
                this.handleGoogleLogin();
                break;
            case 'signup':
                this.handleSignup(data.data);
                break;
            case 'forgot-password':
                this.handleForgotPassword(data.data);
                break;
            case 'resend-email':
                this.handleResendEmail();
                break;
            default:
                console.warn('알 수 없는 폼 제출 타입:', data.type);
        }
    }

    /**
     * 이메일 재발송을 처리합니다
     */
    async handleResendEmail() {
        try {
            const result = await this.authController.handleResendEmail();
            
            if (result.success) {
                console.log('이메일 재발송 성공');
            }
            
        } catch (error) {
            console.error('이메일 재발송 처리 실패:', error);
        }
    }

    /**
     * 오류 메시지를 표시합니다
     * @param {string} message - 오류 메시지
     */
    showError(message) {
        console.error('AuthManager Error:', message);
        
        // 사용자에게 토스트 메시지로 알림
        if (window.toastManager) {
            window.toastManager.show(message, 'error');
        } else {
            // toastManager가 없는 경우 alert 사용
            alert(message);
        }
    }

    /**
     * 로그아웃을 실행합니다
     */
    async logout() {
        try {
            const result = await this.authController.logout();
            
            if (result.success) {
                console.log('로그아웃 성공');
            }
            
        } catch (error) {
            console.error('로그아웃 처리 실패:', error);
        }
    }

    /**
     * 인증 관리자를 정리합니다
     */
    cleanup() {
        if (this.authController) {
            this.authController.cleanup();
        }
        
        if (this.viewManager) {
            this.viewManager.cleanup();
        }
        
        if (this.eventHandler) {
            this.eventHandler.cleanup();
        }
        
        this.isInitialized = false;
    }
}

export default AuthManager;
