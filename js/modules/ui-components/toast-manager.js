/**
 * 토스트 메시지 관리 모듈
 * 애플리케이션 전체에서 사용할 수 있는 토스트 메시지 시스템
 */

export class ToastManager {
    /**
     * 토스트 메시지를 표시합니다
     * @param {string} message - 표시할 메시지
     * @param {number} duration - 표시 시간 (밀리초, 기본값: 2000ms)
     */
    static show(message, duration = 2000) {
        // 기존 토스트가 있으면 제거
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 새 토스트 생성
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        
        // 스타일 적용
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#333',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: '10000',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'opacity 0.3s ease'
        });
        
        document.body.appendChild(toast);
        
        // 자동 제거
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
    
    /**
     * 성공 토스트 메시지를 표시합니다
     * @param {string} message - 표시할 메시지
     * @param {number} duration - 표시 시간 (밀리초, 기본값: 2000ms)
     */
    static success(message, duration = 2000) {
        this.show(`✅ ${message}`, duration);
    }
    
    /**
     * 에러 토스트 메시지를 표시합니다
     * @param {string} message - 표시할 메시지
     * @param {number} duration - 표시 시간 (밀리초, 기본값: 3000ms)
     */
    static error(message, duration = 3000) {
        this.show(`❌ ${message}`, duration);
    }
    
    /**
     * 경고 토스트 메시지를 표시합니다
     * @param {string} message - 표시할 메시지
     * @param {number} duration - 표시 시간 (밀리초, 기본값: 2500ms)
     */
    static warning(message, duration = 2500) {
        this.show(`⚠️ ${message}`, duration);
    }
    
    /**
     * 정보 토스트 메시지를 표시합니다
     * @param {string} message - 표시할 메시지
     * @param {number} duration - 표시 시간 (밀리초, 기본값: 2000ms)
     */
    static info(message, duration = 2000) {
        this.show(`ℹ️ ${message}`, duration);
    }
}
