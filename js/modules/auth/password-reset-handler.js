/**
 * 비밀번호 재설정 처리 모듈
 * URL 파라미터에서 토큰을 확인하고 비밀번호 재설정 페이지로 리다이렉트
 */

import { authService } from '../services/auth-service.js';
import { toastManager } from '../ui-components/toast-manager.js';

class PasswordResetHandler {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * 비밀번호 재설정 핸들러를 초기화합니다
     */
    async initialize() {
        try {
            await authService.initialize();
            this.isInitialized = true;
            this.handlePasswordReset();
        } catch (error) {
            console.error('비밀번호 재설정 핸들러 초기화 실패:', error);
        }
    }

    /**
     * URL에서 비밀번호 재설정 토큰을 확인하고 처리합니다
     */
    handlePasswordReset() {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');

        // 비밀번호 재설정 토큰이 있는 경우
        if (accessToken && refreshToken && type === 'recovery') {
            this.showPasswordResetForm(accessToken, refreshToken);
        }
    }

    /**
     * 비밀번호 재설정 폼을 표시합니다
     * @param {string} accessToken - 액세스 토큰
     * @param {string} refreshToken - 리프레시 토큰
     */
    showPasswordResetForm(accessToken, refreshToken) {
        // 기존 로그인 화면 숨기기
        const loginScreen = document.getElementById('login-screen');
        const mainApp = document.getElementById('main-app');
        
        if (loginScreen) {
            loginScreen.style.display = 'none';
        }
        if (mainApp) {
            mainApp.classList.add('hidden');
        }

        // 비밀번호 재설정 폼 생성
        const resetForm = document.createElement('div');
        resetForm.id = 'password-reset-screen';
        resetForm.className = 'login-screen';
        resetForm.innerHTML = `
            <div class="login-container">
                <div class="login-header">
                    <div class="login-logo">🔐</div>
                    <h1 class="login-title">비밀번호 재설정</h1>
                    <p class="login-subtitle">새로운 비밀번호를 입력해주세요</p>
                </div>
                
                <form class="login-form" id="password-reset-form">
                    <div class="form-group">
                        <label for="new-password" class="form-label">새 비밀번호</label>
                        <input 
                            type="password" 
                            id="new-password" 
                            name="newPassword" 
                            class="form-input" 
                            placeholder="••••••••"
                            required
                            minlength="6"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="confirm-password" class="form-label">비밀번호 확인</label>
                        <input 
                            type="password" 
                            id="confirm-password" 
                            name="confirmPassword" 
                            class="form-input" 
                            placeholder="••••••••"
                            required
                            minlength="6"
                        >
                    </div>
                    
                    <button type="submit" class="login-btn" id="reset-password-btn">
                        비밀번호 재설정
                    </button>
                    
                    <div class="signup-link">
                        <a href="#" class="login-btn-link" id="back-to-login">로그인으로 돌아가기</a>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(resetForm);

        // 이벤트 바인딩
        this.bindResetFormEvents(accessToken, refreshToken);
    }

    /**
     * 비밀번호 재설정 폼 이벤트를 바인딩합니다
     * @param {string} accessToken - 액세스 토큰
     * @param {string} refreshToken - 리프레시 토큰
     */
    bindResetFormEvents(accessToken, refreshToken) {
        const resetForm = document.getElementById('password-reset-form');
        const backToLoginLink = document.getElementById('back-to-login');

        // 폼 제출 이벤트
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handlePasswordUpdate(accessToken, refreshToken);
        });

        // 로그인으로 돌아가기 링크
        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.redirectToLogin();
        });

        // 비밀번호 확인 실시간 검증
        const newPasswordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-password');

        confirmPasswordInput.addEventListener('input', () => {
            this.validatePasswordMatch();
        });

        newPasswordInput.addEventListener('input', () => {
            this.validatePasswordMatch();
        });
    }

    /**
     * 비밀번호 일치 여부를 검증합니다
     */
    validatePasswordMatch() {
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const resetBtn = document.getElementById('reset-password-btn');

        if (confirmPassword && newPassword !== confirmPassword) {
            confirmPasswordInput.style.borderColor = '#f56565';
            resetBtn.disabled = true;
            resetBtn.textContent = '비밀번호가 일치하지 않습니다';
        } else {
            confirmPasswordInput.style.borderColor = '#e2e8f0';
            resetBtn.disabled = false;
            resetBtn.textContent = '비밀번호 재설정';
        }
    }

    /**
     * 비밀번호 업데이트를 처리합니다
     * @param {string} accessToken - 액세스 토큰
     * @param {string} refreshToken - 리프레시 토큰
     */
    async handlePasswordUpdate(accessToken, refreshToken) {
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const resetBtn = document.getElementById('reset-password-btn');

        // 유효성 검사
        if (!newPassword || !confirmPassword) {
            toastManager.show('모든 필드를 입력해주세요.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            toastManager.show('비밀번호가 일치하지 않습니다.', 'error');
            return;
        }

        if (newPassword.length < 6) {
            toastManager.show('비밀번호는 최소 6자 이상이어야 합니다.', 'error');
            return;
        }

        try {
            // 로딩 상태 표시
            resetBtn.disabled = true;
            resetBtn.textContent = '처리 중...';

            // 세션 설정
            const { error: sessionError } = await authService.client.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });

            if (sessionError) {
                throw new Error('세션 설정에 실패했습니다.');
            }

            // 비밀번호 업데이트
            const { error: updateError } = await authService.client.auth.updateUser({
                password: newPassword
            });

            if (updateError) {
                throw new Error(authService.getErrorMessage(updateError));
            }

            toastManager.show('비밀번호가 성공적으로 재설정되었습니다.', 'success');
            
            // 2초 후 로그인 페이지로 리다이렉트
            setTimeout(() => {
                this.redirectToLogin();
            }, 2000);

        } catch (error) {
            console.error('비밀번호 재설정 실패:', error);
            toastManager.show(error.message, 'error');
            
            // 버튼 상태 복원
            resetBtn.disabled = false;
            resetBtn.textContent = '비밀번호 재설정';
        }
    }

    /**
     * 로그인 페이지로 리다이렉트합니다
     */
    redirectToLogin() {
        // URL에서 토큰 파라미터 제거
        const url = new URL(window.location);
        url.searchParams.delete('access_token');
        url.searchParams.delete('refresh_token');
        url.searchParams.delete('type');
        
        // URL 업데이트 (페이지 새로고침 없이)
        window.history.replaceState({}, '', url);
        
        // 비밀번호 재설정 화면 제거
        const resetScreen = document.getElementById('password-reset-screen');
        if (resetScreen) {
            resetScreen.remove();
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

export default PasswordResetHandler;
