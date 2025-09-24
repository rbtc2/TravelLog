/**
 * TravelLog 인증 뷰 관리자
 * 인증 관련 UI 뷰 관리 및 전환을 담당
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

import { CountrySelector } from '../ui-components/country-selector.js';

/**
 * 인증 뷰 관리자 클래스
 * 인증 관련 UI 뷰의 렌더링과 전환을 담당
 */
class AuthViewManager {
    constructor() {
        this.loginScreen = null;
        this.currentView = 'login'; // 'login' | 'signup' | 'forgot-password' | 'email-confirmation' | 'email-sent'
        this.countrySelector = null;
        this.isCountrySelectorInitializing = false; // 초기화 중 상태 추적
        
        // 콜백 함수들 (외부에서 주입받을 수 있도록)
        this.onViewChange = null;
        this.onCountrySelection = null;
    }

    /**
     * 뷰 관리자를 초기화합니다
     * @param {Object} callbacks - 콜백 함수들
     * @param {Function} callbacks.onViewChange - 뷰 변경 콜백
     * @param {Function} callbacks.onCountrySelection - 국가 선택 콜백
     */
    initialize(callbacks = {}) {
        this.onViewChange = callbacks.onViewChange || (() => {});
        this.onCountrySelection = callbacks.onCountrySelection || (() => {});

        // DOM 요소 가져오기
        this.loginScreen = document.getElementById('login-screen');
        
        if (!this.loginScreen) {
            console.error('AuthViewManager: login-screen 요소를 찾을 수 없습니다.');
        }
    }

    /**
     * 로그인 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showLoginView(skipCallback = false) {
        this.currentView = 'login';
        this.renderLoginForm();
        if (!skipCallback) {
            this.onViewChange('login');
        }
    }

    /**
     * 회원가입 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showSignupView(skipCallback = false) {
        this.currentView = 'signup';
        this.renderSignupForm();
        if (!skipCallback) {
            this.onViewChange('signup');
        }
    }

    /**
     * 비밀번호 찾기 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showForgotPasswordView(skipCallback = false) {
        this.currentView = 'forgot-password';
        this.renderForgotPasswordForm();
        if (!skipCallback) {
            this.onViewChange('forgot-password');
        }
    }

    /**
     * 이메일 확인 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showEmailConfirmationView(skipCallback = false) {
        this.currentView = 'email-confirmation';
        this.renderEmailConfirmationView();
        if (!skipCallback) {
            this.onViewChange('email-confirmation');
        }
    }

    /**
     * 이메일 발송 완료 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showEmailSentView(skipCallback = false) {
        this.currentView = 'email-sent';
        this.renderEmailSentView();
        if (!skipCallback) {
            this.onViewChange('email-sent');
        }
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
    }

    /**
     * 회원가입 폼을 렌더링합니다
     */
    renderSignupForm() {
        if (!this.loginScreen) return;

        // 기존 CountrySelector 정리
        if (this.countrySelector) {
            this.countrySelector.destroy();
            this.countrySelector = null;
        }

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
            // 이미 초기화 중인 경우 중복 실행 방지
            if (this.isCountrySelectorInitializing) {
                console.log('AuthViewManager: CountrySelector 초기화 중, 중복 실행 방지');
                return;
            }

            const container = document.getElementById('signup-country-selector-container');
            
            if (!container) {
                console.error('AuthViewManager: signup-country-selector-container를 찾을 수 없음');
                return;
            }

            // 이미 초기화된 경우 중복 초기화 방지
            if (this.countrySelector && this.countrySelector.isInitialized) {
                console.log('AuthViewManager: CountrySelector가 이미 초기화됨, 중복 초기화 방지');
                return;
            }

            this.isCountrySelectorInitializing = true;

            // 기존 selector가 있다면 제거
            if (this.countrySelector) {
                this.countrySelector.destroy();
                this.countrySelector = null;
            }

            // Country selector 생성
            this.countrySelector = new CountrySelector(container, {
                placeholder: '현재 거주국을 선택하세요'
            });

            // 초기화 상태 표시
            this.countrySelector.isInitialized = true;

            // 국가 선택 이벤트 리스너
            container.addEventListener('country-selected', (event) => {
                const selectedCountry = event.detail.country;
                this.handleCountrySelection(selectedCountry);
            });

            this.isCountrySelectorInitializing = false;

        } catch (error) {
            console.error('AuthViewManager: Country Selector 초기화 실패:', error);
            this.isCountrySelectorInitializing = false;
        }
    }

    /**
     * 국가 선택 이벤트를 처리합니다
     * @param {Object} selectedCountry - 선택된 국가 정보
     */
    handleCountrySelection(selectedCountry) {
        const hiddenInput = document.getElementById('signup-residence-country');
        if (hiddenInput && selectedCountry) {
            hiddenInput.value = selectedCountry.code;
            console.log('선택된 거주국:', selectedCountry.nameKo, selectedCountry.code);
            this.onCountrySelection(selectedCountry);
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
     * 현재 뷰를 가져옵니다
     * @returns {string} 현재 뷰
     */
    getCurrentView() {
        return this.currentView;
    }

    /**
     * 뷰 관리자를 정리합니다
     */
    cleanup() {
        if (this.countrySelector) {
            this.countrySelector.destroy();
            this.countrySelector = null;
        }
        
        this.isCountrySelectorInitializing = false;
        this.loginScreen = null;
        this.currentView = 'login';
        this.onViewChange = null;
        this.onCountrySelection = null;
    }
}

export { AuthViewManager };
