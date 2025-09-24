/**
 * TravelLog 인증 관리자
 * 로그인/회원가입 화면 관리 및 인증 상태 처리
 */

import { authService } from '../services/auth-service.js';
import { toastManager } from '../ui-components/toast-manager.js';
import { CountrySelector } from '../ui-components/country-selector.js';

class AuthManager {
    constructor() {
        this.isInitialized = false;
        this.isLoggingOut = false;
        this.isHandlingAuthSuccess = false;
        this.authStateListenerSetup = false;
        this.currentView = 'login'; // 'login' | 'signup' | 'forgot-password'
        this.loginScreen = null;
        this.loginForm = null;
        this.signupForm = null;
        this.forgotPasswordForm = null;
        this.googleLoginBtn = null;
        this.countrySelector = null;

        this.init();
    }

    /**
     * 인증 관리자를 초기화합니다
     */
    async init() {
        try {
            // 인증 서비스 초기화
            await authService.initialize();
            
            // DOM 요소들 가져오기
            this.loginScreen = document.getElementById('login-screen');
            this.loginForm = document.getElementById('login-form');
            this.googleLoginBtn = document.getElementById('google-login-btn');
            
            // 이벤트 바인딩 (한 번만)
            if (!this.isInitialized) {
                this.bindEvents();
                
                // 인증 상태 리스너 등록
                this.setupAuthStateListener();
            }
            
            // 현재 인증 상태 확인
            if (authService.isLoggedIn()) {
                this.handleAuthSuccess();
            } else {
                this.showLoginView();
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
        // 기존 이벤트 리스너 제거 (중복 방지)
        if (this.loginForm) {
            this.loginForm.removeEventListener('submit', this.handleLoginSubmit);
        }
        
        // 로그인 폼 제출
        if (this.loginForm) {
            this.handleLoginSubmit = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleLogin();
            };
            this.loginForm.addEventListener('submit', this.handleLoginSubmit);
        }
        
        // 로그인 버튼 클릭
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Google 로그인 버튼 클릭
        const googleLoginBtn = document.getElementById('google-login-btn');
        console.log('Google 로그인 버튼 찾기:', googleLoginBtn);
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => {
                console.log('Google 로그인 버튼 클릭됨');
                this.handleGoogleLogin();
            });
        } else {
            console.warn('Google 로그인 버튼을 찾을 수 없습니다');
        }

        // 회원가입 링크 클릭
        const signupLink = document.querySelector('.signup-btn');
        if (signupLink) {
            signupLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignupView();
            });
        }

        // 비밀번호 찾기 링크 클릭
        const forgotPasswordLink = document.querySelector('.forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForgotPasswordView();
            });
        }

        // 회원가입 폼 제출
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }

        // 비밀번호 찾기 폼 제출
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

        // 로그인으로 돌아가기 링크
        const loginBtnLink = document.querySelector('.login-btn-link');
        if (loginBtnLink) {
            loginBtnLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginView();
            });
        }

        // 이메일 다시 보내기 버튼
        const resendEmailBtn = document.getElementById('resend-email-btn');
        if (resendEmailBtn) {
            resendEmailBtn.addEventListener('click', () => {
                this.handleResendEmail();
            });
        }
    }

    /**
     * 인증 상태 변경 리스너를 설정합니다
     */
    setupAuthStateListener() {
        // 중복 리스너 방지
        if (this.authStateListenerSetup) {
            return;
        }
        this.authStateListenerSetup = true;

        authService.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.handleAuthSuccess();
            } else if (event === 'SIGNED_OUT') {
                this.handleAuthLogout();
            }
        });
    }

    /**
     * 로그인을 처리합니다
     */
    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;


        if (!email || !password) {
            toastManager.show('이메일과 비밀번호를 입력해주세요.', 'error');
            return;
        }

        try {
            // 로딩 상태 표시
            this.setLoadingState(true);
            
            const result = await authService.signIn(email, password, remember);
            
            if (result && result.success) {
                this.handleAuthSuccess();
            } else {
                toastManager.show('로그인에 실패했습니다.', 'error');
            }
            
        } catch (error) {
            console.error('로그인 실패:', error);
            // 에러 메시지는 authService에서 toast로 표시됨
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Google 로그인을 처리합니다 (스켈레톤 UI)
     */
    async handleGoogleLogin() {
        try {
            console.log('Google 로그인 시작 (스켈레톤 UI)');
            console.log('toastManager 객체:', toastManager);
            
            // 스켈레톤 UI - 실제 기능은 구현하지 않음
            console.log('토스트 메시지 표시 시도...');
            toastManager.show('Google 로그인 기능은 준비 중입니다.', 'info');
            console.log('토스트 메시지 표시 완료');
            
            // TODO: 실제 Google OAuth 구현 시 아래 코드 활성화
            // const provider = new GoogleAuthProvider();
            // const result = await signInWithPopup(auth, provider);
            // this.handleAuthSuccess();
            
        } catch (error) {
            console.error('Google 로그인 실패:', error);
            toastManager.show('Google 로그인에 실패했습니다.', 'error');
        }
    }

    /**
     * 회원가입을 처리합니다
     */
    async handleSignup() {
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const fullName = document.getElementById('signup-full-name').value;
        const residenceCountry = document.getElementById('signup-residence-country').value;

        // 유효성 검사
        if (!email || !password || !confirmPassword || !fullName) {
            toastManager.show('모든 필드를 입력해주세요.', 'error');
            return;
        }

        if (!residenceCountry) {
            toastManager.show('현재 거주국을 선택해주세요.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            toastManager.show('비밀번호가 일치하지 않습니다.', 'error');
            return;
        }

        if (password.length < 6) {
            toastManager.show('비밀번호는 최소 6자 이상이어야 합니다.', 'error');
            return;
        }

        try {
            // 로딩 상태 표시
            this.setLoadingState(true);
            
            const result = await authService.signUp(email, password, { 
                fullName, 
                residenceCountry 
            });
            
            if (result.needsEmailConfirmation) {
                this.showEmailConfirmationView();
            } else {
                // 즉시 로그인된 경우
                this.handleAuthSuccess();
            }
            
        } catch (error) {
            console.error('회원가입 실패:', error);
            // 에러 메시지는 authService에서 toast로 표시됨
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * 비밀번호 재설정을 처리합니다
     */
    async handleForgotPassword() {
        const email = document.getElementById('forgot-email').value;

        if (!email) {
            toastManager.show('이메일을 입력해주세요.', 'error');
            return;
        }

        try {
            // 로딩 상태 표시
            this.setLoadingState(true);
            
            await authService.resetPassword(email);
            this.showEmailSentView();
            
        } catch (error) {
            console.error('비밀번호 재설정 실패:', error);
            // 에러 메시지는 authService에서 toast로 표시됨
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * 인증 성공을 처리합니다
     */
    handleAuthSuccess() {
        // 중복 호출 방지
        if (this.isHandlingAuthSuccess) {
            return;
        }
        this.isHandlingAuthSuccess = true;

        // 로그인 화면 숨기기
        if (this.loginScreen) {
            this.loginScreen.style.display = 'none';
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

        // 상태 리셋
        setTimeout(() => {
            this.isHandlingAuthSuccess = false;
        }, 1000);
    }

    /**
     * 로그아웃을 처리합니다
     */
    handleAuthLogout() {
        // 중복 호출 방지
        if (this.isLoggingOut) {
            return;
        }
        this.isLoggingOut = true;
        
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
        
        // 로그아웃 상태 리셋
        setTimeout(() => {
            this.isLoggingOut = false;
        }, 1000);
    }

    /**
     * 로그인 뷰를 표시합니다
     */
    showLoginView() {
        this.currentView = 'login';
        this.renderLoginForm();
    }

    /**
     * 회원가입 뷰를 표시합니다
     */
    showSignupView() {
        this.currentView = 'signup';
        this.renderSignupForm();
    }

    /**
     * 비밀번호 찾기 뷰를 표시합니다
     */
    showForgotPasswordView() {
        this.currentView = 'forgot-password';
        this.renderForgotPasswordForm();
    }

    /**
     * 이메일 확인 뷰를 표시합니다
     */
    showEmailConfirmationView() {
        this.currentView = 'email-confirmation';
        this.renderEmailConfirmationView();
    }

    /**
     * 이메일 발송 완료 뷰를 표시합니다
     */
    showEmailSentView() {
        this.currentView = 'email-sent';
        this.renderEmailSentView();
    }

    /**
     * 로그인 폼을 렌더링합니다
     */
    renderLoginForm() {
        if (!this.loginScreen) return;

        this.loginScreen.innerHTML = `
            <div class="login-container">
                <div class="login-header">
                    <div class="login-logo">✈️</div>
                    <h1 class="login-title">TravelLog</h1>
                    <p class="login-subtitle">여행의 모든 순간을 기록하세요</p>
                </div>
                
                <form class="login-form" id="login-form">
                    <div class="form-group">
                        <label for="email" class="form-label">이메일</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            class="form-input" 
                            placeholder="your@email.com"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="password" class="form-label">비밀번호</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            class="form-input" 
                            placeholder="••••••••"
                            required
                        >
                    </div>
                    
                    <div class="form-options">
                        <label class="checkbox-label" for="remember">
                            <input type="checkbox" id="remember" name="remember">
                            <span class="checkmark"></span>
                            로그인 상태 유지
                        </label>
                        <a href="#" class="forgot-password">비밀번호 찾기</a>
                    </div>
                    
                    <button type="submit" class="login-btn" id="login-btn">
                        로그인
                    </button>
                    
                    <div class="login-divider">
                        <span>또는</span>
                    </div>
                    
                    <button type="button" class="google-login-btn" id="google-login-btn">
                        <div class="google-btn-content">
                            <div class="google-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            </div>
                            <span class="google-btn-text">Google로 계속하기</span>
                        </div>
                    </button>
                    
                    <div class="signup-link">
                        계정이 없으신가요? <a href="#" class="signup-btn">회원가입</a>
                    </div>
                </form>
            </div>
        `;

        // 이벤트 리바인딩
        this.bindEvents();
    }

    /**
     * 회원가입 폼을 렌더링합니다
     */
    renderSignupForm() {
        if (!this.loginScreen) return;

        this.loginScreen.innerHTML = `
            <div class="login-container">
                <div class="login-header">
                    <div class="login-logo">✈️</div>
                    <h1 class="login-title">회원가입</h1>
                    <p class="login-subtitle">TravelLog에 오신 것을 환영합니다</p>
                </div>
                
                <form class="login-form" id="signup-form">
                    <div class="form-group">
                        <label for="signup-full-name" class="form-label">이름</label>
                        <input 
                            type="text" 
                            id="signup-full-name" 
                            name="fullName" 
                            class="form-input" 
                            placeholder="홍길동"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="signup-email" class="form-label">이메일</label>
                        <input 
                            type="email" 
                            id="signup-email" 
                            name="email" 
                            class="form-input" 
                            placeholder="your@email.com"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="signup-password" class="form-label">비밀번호</label>
                        <input 
                            type="password" 
                            id="signup-password" 
                            name="password" 
                            class="form-input" 
                            placeholder="••••••••"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="signup-confirm-password" class="form-label">비밀번호 확인</label>
                        <input 
                            type="password" 
                            id="signup-confirm-password" 
                            name="confirmPassword" 
                            class="form-input" 
                            placeholder="••••••••"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="signup-residence-country" class="form-label">현재 거주국</label>
                        <div id="signup-country-selector-container" class="country-selector-container">
                            <!-- Country selector will be initialized here -->
                        </div>
                        <input 
                            type="hidden" 
                            id="signup-residence-country" 
                            name="residenceCountry" 
                            value=""
                        >
                    </div>
                    
                    <button type="submit" class="login-btn" id="signup-btn">
                        회원가입
                    </button>
                    
                    <div class="signup-link">
                        이미 계정이 있으신가요? <a href="#" class="login-btn-link">로그인</a>
                    </div>
                </form>
            </div>
        `;

        // 이벤트 리바인딩
        this.bindEvents();
        
        // Country selector 초기화 (약간의 지연 후)
        setTimeout(() => {
            this.initializeCountrySelector();
        }, 100);
    }

    /**
     * Country selector를 초기화합니다
     */
    async initializeCountrySelector() {
        try {
            const { CountrySelector } = await import('../ui-components/country-selector.js');
            const container = document.getElementById('signup-country-selector-container');
            
            if (!container) {
                console.error('AuthManager: signup-country-selector-container를 찾을 수 없음');
                return;
            }

            // 기존 selector가 있다면 제거
            if (this.countrySelector) {
                this.countrySelector.destroy();
                this.countrySelector = null;
            }

            // Country selector 생성
            this.countrySelector = new CountrySelector(container, {
                placeholder: '현재 거주국을 선택하세요'
            });

            // 국가 선택 이벤트 리스너
            container.addEventListener('country-selected', (event) => {
                const selectedCountry = event.detail.country;
                this.handleCountrySelection(selectedCountry);
            });

        } catch (error) {
            console.error('AuthManager: Country Selector 초기화 실패:', error);
        }
    }

    /**
     * 국가 선택 이벤트를 처리합니다
     */
    handleCountrySelection(selectedCountry) {
        const hiddenInput = document.getElementById('signup-residence-country');
        if (hiddenInput && selectedCountry) {
            hiddenInput.value = selectedCountry.code;
            console.log('선택된 거주국:', selectedCountry.nameKo, selectedCountry.code);
        }
    }

    /**
     * 비밀번호 찾기 폼을 렌더링합니다
     */
    renderForgotPasswordForm() {
        if (!this.loginScreen) return;

        this.loginScreen.innerHTML = `
            <div class="login-container">
                <div class="login-header">
                    <div class="login-logo">✈️</div>
                    <h1 class="login-title">비밀번호 찾기</h1>
                    <p class="login-subtitle">이메일로 비밀번호 재설정 링크를 보내드립니다</p>
                </div>
                
                <form class="login-form" id="forgot-password-form">
                    <div class="form-group">
                        <label for="forgot-email" class="form-label">이메일</label>
                        <input 
                            type="email" 
                            id="forgot-email" 
                            name="email" 
                            class="form-input" 
                            placeholder="your@email.com"
                            required
                        >
                    </div>
                    
                    <button type="submit" class="login-btn" id="forgot-password-btn">
                        재설정 링크 보내기
                    </button>
                    
                    <div class="signup-link">
                        <a href="#" class="login-btn-link">로그인으로 돌아가기</a>
                    </div>
                </form>
            </div>
        `;

        // 이벤트 리바인딩
        this.bindEvents();
    }

    /**
     * 이메일 확인 뷰를 렌더링합니다
     */
    renderEmailConfirmationView() {
        if (!this.loginScreen) return;

        this.loginScreen.innerHTML = `
            <div class="login-container">
                <div class="login-header">
                    <div class="login-logo">📧</div>
                    <h1 class="login-title">이메일 확인</h1>
                    <p class="login-subtitle">이메일로 전송된 확인 링크를 클릭해주세요</p>
                </div>
                
                <div class="email-confirmation-content">
                    <div class="confirmation-icon">📬</div>
                    <p class="confirmation-message">
                        회원가입이 완료되었습니다!<br>
                        이메일로 전송된 확인 링크를 클릭하여 계정을 활성화해주세요.
                    </p>
                    
                    <button type="button" class="login-btn" id="resend-email-btn">
                        이메일 다시 보내기
                    </button>
                    
                    <div class="signup-link">
                        <a href="#" class="login-btn-link">로그인으로 돌아가기</a>
                    </div>
                </div>
            </div>
        `;

        // 이벤트 리바인딩
        this.bindEvents();
    }

    /**
     * 이메일 발송 완료 뷰를 렌더링합니다
     */
    renderEmailSentView() {
        if (!this.loginScreen) return;

        this.loginScreen.innerHTML = `
            <div class="login-container">
                <div class="login-header">
                    <div class="login-logo">📧</div>
                    <h1 class="login-title">이메일 발송 완료</h1>
                    <p class="login-subtitle">비밀번호 재설정 링크를 보내드렸습니다</p>
                </div>
                
                <div class="email-sent-content">
                    <div class="sent-icon">✅</div>
                    <p class="sent-message">
                        이메일로 비밀번호 재설정 링크를 보내드렸습니다.<br>
                        이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정해주세요.
                    </p>
                    
                    <div class="signup-link">
                        <a href="#" class="login-btn-link">로그인으로 돌아가기</a>
                    </div>
                </div>
            </div>
        `;

        // 이벤트 리바인딩
        this.bindEvents();
    }

    /**
     * 로딩 상태를 설정합니다
     * @param {boolean} isLoading - 로딩 상태
     */
    setLoadingState(isLoading) {
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const forgotPasswordBtn = document.getElementById('forgot-password-btn');
        
        const buttons = [loginBtn, signupBtn, forgotPasswordBtn].filter(Boolean);
        
        buttons.forEach(button => {
            if (isLoading) {
                button.disabled = true;
                button.textContent = '처리 중...';
                button.classList.add('loading');
            } else {
                button.disabled = false;
                button.classList.remove('loading');
                
                // 원래 텍스트로 복원
                if (button.id === 'login-btn') button.textContent = '로그인';
                else if (button.id === 'signup-btn') button.textContent = '회원가입';
                else if (button.id === 'forgot-password-btn') button.textContent = '재설정 링크 보내기';
            }
        });
    }

    /**
     * 오류 메시지를 표시합니다
     * @param {string} message - 오류 메시지
     */
    showError(message) {
        toastManager.show(message, 'error');
    }

    /**
     * 이메일 다시 보내기를 처리합니다
     */
    async handleResendEmail() {
        try {
            // 현재 사용자의 이메일로 다시 보내기
            const currentUser = authService.getCurrentUser();
            if (currentUser && currentUser.email) {
                await authService.resetPassword(currentUser.email);
            } else {
                toastManager.show('이메일 정보를 찾을 수 없습니다.', 'error');
            }
        } catch (error) {
            console.error('이메일 다시 보내기 실패:', error);
        }
    }

    /**
     * 로그아웃을 실행합니다
     */
    async logout() {
        try {
            await authService.signOut();
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    }
}

export default AuthManager;
