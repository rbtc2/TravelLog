/**
 * LogoutManager - 로그아웃 처리 관리자
 * 
 * 🎯 책임:
 * - 로그아웃 확인 모달 관리
 * - 로그아웃 프로세스 실행
 * - 로그아웃 상태 관리
 * - 에러 처리 및 사용자 피드백
 * 
 * @class LogoutManager
 * @version 1.0.0
 * @since 2024-12-29
 */
class LogoutManager {
    constructor(eventManager, dispatchEvent) {
        this.eventManager = eventManager;
        this.dispatchEvent = dispatchEvent;
        this.isLoggingOut = false;
        this.currentModal = null;
    }

    /**
     * 로그아웃 프로세스를 시작합니다
     */
    onLogout() {
        console.log('LogoutManager.onLogout() 호출됨');
        
        // 중복 로그아웃 방지
        if (this.isLoggingOut) {
            console.log('이미 로그아웃 중입니다.');
            return;
        }
        this.isLoggingOut = true;
        
        console.log('로그아웃 확인 모달 표시 중...');
        this.showLogoutConfirmation();
    }

    /**
     * 로그아웃 확인 모달을 표시합니다
     */
    showLogoutConfirmation() {
        console.log('showLogoutConfirmation() 호출됨');
        
        // 기존 모달이 있다면 제거
        this.hideLogoutConfirmation();

        const modal = document.createElement('div');
        modal.className = 'logout-confirmation-modal';
        modal.innerHTML = this.getLogoutModalHTML();

        document.body.appendChild(modal);
        this.currentModal = modal;
        console.log('로그아웃 모달 DOM에 추가됨');

        // 이벤트 바인딩
        this.bindLogoutModalEvents(modal);
        console.log('로그아웃 모달 이벤트 바인딩 완료');

        // 모달 표시 애니메이션
        requestAnimationFrame(() => {
            modal.classList.add('show');
            console.log('로그아웃 모달 show 클래스 추가됨');
        });
    }

    /**
     * 로그아웃 확인 모달 HTML을 생성합니다
     * @returns {string} 모달 HTML 문자열
     */
    getLogoutModalHTML() {
        return `
            <div class="logout-confirmation-overlay">
                <div class="logout-confirmation-content">
                    <div class="logout-confirmation-header">
                        <h3 class="logout-confirmation-title">로그아웃</h3>
                        <p class="logout-confirmation-message">정말로 로그아웃하시겠습니까?</p>
                    </div>
                    <div class="logout-confirmation-actions">
                        <button class="logout-confirmation-btn cancel-btn" id="logout-cancel">
                            취소
                        </button>
                        <button class="logout-confirmation-btn confirm-btn" id="logout-confirm">
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 로그아웃 모달 이벤트를 바인딩합니다
     * @param {HTMLElement} modal - 모달 요소
     */
    bindLogoutModalEvents(modal) {
        const cancelBtn = document.getElementById('logout-cancel');
        const confirmBtn = document.getElementById('logout-confirm');
        const overlay = modal.querySelector('.logout-confirmation-overlay');

        if (cancelBtn) {
            this.eventManager.add(cancelBtn, 'click', () => {
                this.hideLogoutConfirmation();
            });
        }

        if (confirmBtn) {
            this.eventManager.add(confirmBtn, 'click', () => {
                this.performLogout();
            });
        }

        if (overlay) {
            this.eventManager.add(overlay, 'click', (e) => {
                if (e.target === overlay) {
                    this.hideLogoutConfirmation();
                }
            });
        }

        // ESC 키로 모달 닫기
        this.eventManager.add(document, 'keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.hideLogoutConfirmation();
            }
        });
    }

    /**
     * 로그아웃 확인 모달을 숨깁니다
     */
    hideLogoutConfirmation() {
        if (!this.currentModal) return;

        const modal = this.currentModal;
        modal.classList.remove('show');
        
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            this.currentModal = null;
            // 모달이 숨겨질 때 로그아웃 상태 리셋
            this.isLoggingOut = false;
        }, 300);
    }

    /**
     * 실제 로그아웃을 수행합니다
     */
    async performLogout() {
        if (!this.currentModal) return;

        try {
            // 로딩 상태 표시
            this.setLogoutLoadingState(true);

            // AuthService를 통해 로그아웃
            const { authService } = await import('../services/auth-service.js');
            await authService.signOut();

            // 모달 숨기기
            this.hideLogoutConfirmation();

            // 성공 메시지 표시
            this.dispatchEvent('showMessage', {
                type: 'success',
                message: '로그아웃되었습니다.'
            });

        } catch (error) {
            console.error('로그아웃 실패:', error);
            
            // 에러 메시지 표시
            this.dispatchEvent('showMessage', {
                type: 'error',
                message: '로그아웃 중 오류가 발생했습니다.'
            });

            // 버튼 상태 복원
            this.setLogoutLoadingState(false);

        } finally {
            // 로그아웃 상태 리셋
            this.isLoggingOut = false;
        }
    }

    /**
     * 로그아웃 버튼의 로딩 상태를 설정합니다
     * @param {boolean} isLoading - 로딩 상태 여부
     */
    setLogoutLoadingState(isLoading) {
        const confirmBtn = document.getElementById('logout-confirm');
        if (confirmBtn) {
            confirmBtn.disabled = isLoading;
            confirmBtn.textContent = isLoading ? '로그아웃 중...' : '로그아웃';
        }
    }

    /**
     * 현재 로그아웃 상태를 반환합니다
     * @returns {boolean} 로그아웃 중인지 여부
     */
    isLoggingOutProcess() {
        return this.isLoggingOut;
    }

    /**
     * 현재 모달이 표시되어 있는지 반환합니다
     * @returns {boolean} 모달 표시 여부
     */
    isModalVisible() {
        return this.currentModal !== null;
    }

    /**
     * LogoutManager를 정리합니다
     */
    cleanup() {
        // 모달이 열려있다면 닫기
        this.hideLogoutConfirmation();
        
        // 상태 초기화
        this.isLoggingOut = false;
        this.currentModal = null;
    }
}

export { LogoutManager };
