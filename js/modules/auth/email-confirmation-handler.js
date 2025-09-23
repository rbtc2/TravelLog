/**
 * 이메일 확인 처리 모듈
 * URL 파라미터에서 이메일 확인 토큰을 확인하고 처리
 */

import { authService } from '../services/auth-service.js';
import { toastManager } from '../ui-components/toast-manager.js';

class EmailConfirmationHandler {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * 이메일 확인 핸들러를 초기화합니다
     */
    async initialize() {
        try {
            await authService.initialize();
            this.isInitialized = true;
            this.handleEmailConfirmation();
        } catch (error) {
            console.error('이메일 확인 핸들러 초기화 실패:', error);
        }
    }

    /**
     * URL에서 이메일 확인 토큰을 확인하고 처리합니다
     */
    handleEmailConfirmation() {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');

        // 이메일 확인 토큰이 있는 경우
        if (accessToken && refreshToken && type === 'email') {
            this.processEmailConfirmation(accessToken, refreshToken);
        }
    }

    /**
     * 이메일 확인을 처리합니다
     * @param {string} accessToken - 액세스 토큰
     * @param {string} refreshToken - 리프레시 토큰
     */
    async processEmailConfirmation(accessToken, refreshToken) {
        try {
            // 세션 설정
            const { data, error } = await authService.client.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });

            if (error) {
                throw new Error('이메일 확인에 실패했습니다: ' + error.message);
            }

            if (data.session && data.user) {
                // 이메일 확인 성공
                this.showEmailConfirmationSuccess();
                
                // URL에서 토큰 파라미터 제거
                this.cleanUrl();
                
                // 3초 후 메인 앱으로 이동
                setTimeout(() => {
                    this.redirectToMainApp();
                }, 3000);
            } else {
                throw new Error('세션을 생성할 수 없습니다.');
            }

        } catch (error) {
            console.error('이메일 확인 처리 실패:', error);
            this.showEmailConfirmationError(error.message);
        }
    }

    /**
     * 이메일 확인 성공 화면을 표시합니다
     */
    showEmailConfirmationSuccess() {
        // 기존 로그인 화면 숨기기
        const loginScreen = document.getElementById('login-screen');
        const mainApp = document.getElementById('main-app');
        
        if (loginScreen) {
            loginScreen.style.display = 'none';
        }
        if (mainApp) {
            mainApp.classList.add('hidden');
        }

        // 이메일 확인 성공 화면 생성
        const successScreen = document.createElement('div');
        successScreen.id = 'email-confirmation-success-screen';
        successScreen.className = 'login-screen';
        successScreen.innerHTML = `
            <div class="login-container">
                <div class="login-header">
                    <div class="login-logo">✅</div>
                    <h1 class="login-title">이메일 확인 완료!</h1>
                    <p class="login-subtitle">계정이 성공적으로 활성화되었습니다</p>
                </div>
                
                <div class="email-confirmation-content">
                    <div class="confirmation-icon">🎉</div>
                    <p class="confirmation-message">
                        이메일 확인이 완료되었습니다!<br>
                        잠시 후 메인 화면으로 이동합니다.
                    </p>
                    
                    <div class="loading-spinner" style="margin: 20px 0;">
                        <div style="width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                    </div>
                    
                    <div class="signup-link">
                        <a href="#" class="login-btn-link" id="go-to-main-now">지금 바로 시작하기</a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(successScreen);

        // 이벤트 바인딩
        const goToMainBtn = document.getElementById('go-to-main-now');
        goToMainBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.redirectToMainApp();
        });
    }

    /**
     * 이메일 확인 오류 화면을 표시합니다
     * @param {string} errorMessage - 오류 메시지
     */
    showEmailConfirmationError(errorMessage) {
        // 기존 로그인 화면 숨기기
        const loginScreen = document.getElementById('login-screen');
        const mainApp = document.getElementById('main-app');
        
        if (loginScreen) {
            loginScreen.style.display = 'none';
        }
        if (mainApp) {
            mainApp.classList.add('hidden');
        }

        // 이메일 확인 오류 화면 생성
        const errorScreen = document.createElement('div');
        errorScreen.id = 'email-confirmation-error-screen';
        errorScreen.className = 'login-screen';
        errorScreen.innerHTML = `
            <div class="login-container">
                <div class="login-header">
                    <div class="login-logo">❌</div>
                    <h1 class="login-title">이메일 확인 실패</h1>
                    <p class="login-subtitle">이메일 확인 중 오류가 발생했습니다</p>
                </div>
                
                <div class="email-confirmation-content">
                    <div class="confirmation-icon">⚠️</div>
                    <p class="confirmation-message">
                        ${errorMessage}<br>
                        다시 시도하거나 고객지원에 문의해주세요.
                    </p>
                    
                    <button type="button" class="login-btn" id="retry-confirmation-btn">
                        다시 시도
                    </button>
                    
                    <div class="signup-link">
                        <a href="#" class="login-btn-link" id="back-to-login-from-error">로그인으로 돌아가기</a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(errorScreen);

        // 이벤트 바인딩
        const retryBtn = document.getElementById('retry-confirmation-btn');
        const backToLoginBtn = document.getElementById('back-to-login-from-error');

        retryBtn.addEventListener('click', () => {
            window.location.reload();
        });

        backToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.redirectToLogin();
        });
    }

    /**
     * URL에서 토큰 파라미터를 제거합니다
     */
    cleanUrl() {
        const url = new URL(window.location);
        url.searchParams.delete('access_token');
        url.searchParams.delete('refresh_token');
        url.searchParams.delete('type');
        
        // URL 업데이트 (페이지 새로고침 없이)
        window.history.replaceState({}, '', url);
    }

    /**
     * 메인 앱으로 리다이렉트합니다
     */
    redirectToMainApp() {
        // 이메일 확인 화면 제거
        const successScreen = document.getElementById('email-confirmation-success-screen');
        const errorScreen = document.getElementById('email-confirmation-error-screen');
        
        if (successScreen) {
            successScreen.remove();
        }
        if (errorScreen) {
            errorScreen.remove();
        }

        // 메인 앱 표시
        const loginScreen = document.getElementById('login-screen');
        const mainApp = document.getElementById('main-app');
        
        if (loginScreen) {
            loginScreen.style.display = 'none';
        }
        if (mainApp) {
            mainApp.classList.remove('hidden');
        }

        // 앱 매니저에 로그인 성공 알림
        if (window.appManager) {
            window.appManager.loginSuccess();
        }

        toastManager.show('이메일 확인이 완료되었습니다! 환영합니다!', 'success');
    }

    /**
     * 로그인 페이지로 리다이렉트합니다
     */
    redirectToLogin() {
        // 이메일 확인 화면 제거
        const successScreen = document.getElementById('email-confirmation-success-screen');
        const errorScreen = document.getElementById('email-confirmation-error-screen');
        
        if (successScreen) {
            successScreen.remove();
        }
        if (errorScreen) {
            errorScreen.remove();
        }

        // 로그인 화면 표시
        const loginScreen = document.getElementById('login-screen');
        const mainApp = document.getElementById('main-app');
        
        if (loginScreen) {
            loginScreen.style.display = 'flex';
        }
        if (mainApp) {
            mainApp.classList.add('hidden');
        }
    }
}

export default EmailConfirmationHandler;
