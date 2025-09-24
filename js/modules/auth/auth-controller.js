/**
 * TravelLog 인증 컨트롤러
 * 인증 관련 비즈니스 로직만 담당
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

import { authService } from '../services/auth-service.js';
import { toastManager } from '../ui-components/toast-manager.js';

/**
 * 인증 컨트롤러 클래스
 * 인증 관련 비즈니스 로직과 상태 관리를 담당
 */
class AuthController {
    constructor() {
        this.isInitialized = false;
        this.isLoggingOut = false;
        this.isHandlingAuthSuccess = false;
        this.authStateListenerSetup = false;
        
        // 콜백 함수들 (외부에서 주입받을 수 있도록)
        this.onAuthSuccess = null;
        this.onAuthLogout = null;
        this.onError = null;
    }

    /**
     * 인증 컨트롤러를 초기화합니다
     * @param {Object} callbacks - 콜백 함수들
     * @param {Function} callbacks.onAuthSuccess - 인증 성공 콜백
     * @param {Function} callbacks.onAuthLogout - 로그아웃 콜백
     * @param {Function} callbacks.onError - 에러 콜백
     */
    async initialize(callbacks = {}) {
        try {
            // 콜백 함수들 설정
            this.onAuthSuccess = callbacks.onAuthSuccess || (() => {});
            this.onAuthLogout = callbacks.onAuthLogout || (() => {});
            this.onError = callbacks.onError || (() => {});

            // 인증 서비스 초기화
            await authService.initialize();
            
            // 인증 상태 리스너 설정
            this.setupAuthStateListener();
            
            this.isInitialized = true;
            
            // 현재 인증 상태 확인
            if (authService.isLoggedIn()) {
                this.handleAuthSuccess();
            }
            
        } catch (error) {
            console.error('인증 컨트롤러 초기화 실패:', error);
            this.onError('인증 시스템을 초기화할 수 없습니다.');
            throw error;
        }
    }

    /**
     * 인증 상태 변경 리스너를 설정합니다
     */
    setupAuthStateListener() {
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
     * @param {string} email - 이메일
     * @param {string} password - 비밀번호
     * @param {boolean} remember - 로그인 상태 유지 여부
     * @returns {Promise<Object>} 로그인 결과
     */
    async handleLogin(email, password, remember = false) {
        if (!this.isInitialized) {
            throw new Error('AuthController가 초기화되지 않았습니다.');
        }

        if (!email || !password) {
            const error = '이메일과 비밀번호를 입력해주세요.';
            toastManager.show(error, 'error');
            return { success: false, error };
        }

        try {
            const result = await authService.signIn(email, password, remember);
            
            if (result && result.success) {
                this.handleAuthSuccess();
                return { success: true };
            } else {
                const error = '로그인에 실패했습니다.';
                toastManager.show(error, 'error');
                return { success: false, error };
            }
            
        } catch (error) {
            console.error('로그인 실패:', error);
            // 에러 메시지는 authService에서 toast로 표시됨
            return { success: false, error: error.message };
        }
    }

    /**
     * Google 로그인을 처리합니다 (스켈레톤 UI)
     * @returns {Promise<Object>} Google 로그인 결과
     */
    async handleGoogleLogin() {
        try {
            console.log('Google 로그인 시작 (스켈레톤 UI)');
            
            // 스켈레톤 UI - 실제 기능은 구현하지 않음
            toastManager.show('Google 로그인 기능은 준비 중입니다.', 'info');
            
            // TODO: 실제 Google OAuth 구현 시 아래 코드 활성화
            // const provider = new GoogleAuthProvider();
            // const result = await signInWithPopup(auth, provider);
            // this.handleAuthSuccess();
            
            return { success: false, message: 'Google 로그인 기능은 준비 중입니다.' };
            
        } catch (error) {
            console.error('Google 로그인 실패:', error);
            toastManager.show('Google 로그인에 실패했습니다.', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * 회원가입을 처리합니다
     * @param {Object} userData - 사용자 데이터
     * @param {string} userData.email - 이메일
     * @param {string} userData.password - 비밀번호
     * @param {string} userData.confirmPassword - 비밀번호 확인
     * @param {string} userData.fullName - 이름
     * @param {string} userData.residenceCountry - 거주국
     * @returns {Promise<Object>} 회원가입 결과
     */
    async handleSignup(userData) {
        if (!this.isInitialized) {
            throw new Error('AuthController가 초기화되지 않았습니다.');
        }

        const { email, password, confirmPassword, fullName, residenceCountry } = userData;

        // 유효성 검사
        if (!email || !password || !confirmPassword || !fullName) {
            const error = '모든 필드를 입력해주세요.';
            toastManager.show(error, 'error');
            return { success: false, error };
        }

        if (!residenceCountry) {
            const error = '현재 거주국을 선택해주세요.';
            toastManager.show(error, 'error');
            return { success: false, error };
        }

        if (password !== confirmPassword) {
            const error = '비밀번호가 일치하지 않습니다.';
            toastManager.show(error, 'error');
            return { success: false, error };
        }

        if (password.length < 6) {
            const error = '비밀번호는 최소 6자 이상이어야 합니다.';
            toastManager.show(error, 'error');
            return { success: false, error };
        }

        try {
            const result = await authService.signUp(email, password, { 
                fullName, 
                residenceCountry 
            });
            
            if (result.needsEmailConfirmation) {
                return { 
                    success: true, 
                    needsEmailConfirmation: true,
                    user: result.user
                };
            } else {
                // 즉시 로그인된 경우
                this.handleAuthSuccess();
                return { 
                    success: true, 
                    needsEmailConfirmation: false,
                    user: result.user
                };
            }
            
        } catch (error) {
            console.error('회원가입 실패:', error);
            // 에러 메시지는 authService에서 toast로 표시됨
            return { success: false, error: error.message };
        }
    }

    /**
     * 비밀번호 재설정을 처리합니다
     * @param {string} email - 이메일
     * @returns {Promise<Object>} 비밀번호 재설정 결과
     */
    async handleForgotPassword(email) {
        if (!this.isInitialized) {
            throw new Error('AuthController가 초기화되지 않았습니다.');
        }

        if (!email) {
            const error = '이메일을 입력해주세요.';
            toastManager.show(error, 'error');
            return { success: false, error };
        }

        try {
            await authService.resetPassword(email);
            return { success: true };
            
        } catch (error) {
            console.error('비밀번호 재설정 실패:', error);
            // 에러 메시지는 authService에서 toast로 표시됨
            return { success: false, error: error.message };
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

        // 사용자 정보 저장
        this.saveUserInfo();

        // 외부 콜백 호출
        this.onAuthSuccess();

        // 상태 리셋
        setTimeout(() => {
            this.isHandlingAuthSuccess = false;
        }, 1000);
    }

    /**
     * 사용자 정보를 저장합니다
     */
    saveUserInfo() {
        try {
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                const userInfo = {
                    id: currentUser.id || 'user_' + Date.now(),
                    email: currentUser.email || 'user@example.com',
                    lastLogin: new Date().toISOString(),
                    createdAt: currentUser.created_at || new Date().toISOString()
                };
                
                localStorage.setItem('travelLog_user', JSON.stringify(userInfo));
                console.log('사용자 정보 저장됨:', userInfo);
            }
        } catch (error) {
            console.error('사용자 정보 저장 실패:', error);
        }
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
        
        // 외부 콜백 호출
        this.onAuthLogout();
        
        // 로그아웃 상태 리셋
        setTimeout(() => {
            this.isLoggingOut = false;
        }, 1000);
    }

    /**
     * 로그아웃을 실행합니다
     * @returns {Promise<Object>} 로그아웃 결과
     */
    async logout() {
        try {
            await authService.signOut();
            return { success: true };
        } catch (error) {
            console.error('로그아웃 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 이메일 다시 보내기를 처리합니다
     * @returns {Promise<Object>} 이메일 재발송 결과
     */
    async handleResendEmail() {
        try {
            // 현재 사용자의 이메일로 다시 보내기
            const currentUser = authService.getCurrentUser();
            if (currentUser && currentUser.email) {
                const result = await authService.resetPassword(currentUser.email);
                return { success: true };
            } else {
                const error = '이메일 정보를 찾을 수 없습니다.';
                toastManager.show(error, 'error');
                return { success: false, error };
            }
        } catch (error) {
            console.error('이메일 다시 보내기 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 현재 사용자 정보를 가져옵니다
     * @returns {Object|null} 현재 사용자 정보
     */
    getCurrentUser() {
        return authService.getCurrentUser();
    }

    /**
     * 로그인 상태를 확인합니다
     * @returns {boolean} 로그인 상태
     */
    isLoggedIn() {
        return authService.isLoggedIn();
    }

    /**
     * 컨트롤러를 정리합니다
     */
    cleanup() {
        this.isInitialized = false;
        this.isLoggingOut = false;
        this.isHandlingAuthSuccess = false;
        this.authStateListenerSetup = false;
        this.onAuthSuccess = null;
        this.onAuthLogout = null;
        this.onError = null;
    }
}

export { AuthController };
