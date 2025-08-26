/**
 * 모달 관리 모듈
 * 애플리케이션 전체에서 사용할 수 있는 모달 시스템
 */

export class ModalManager {
    constructor() {
        this.activeModal = null;
    }
    
    /**
     * 삭제 확인 모달을 표시합니다
     * @param {Object} log - 삭제할 로그 객체
     * @param {Function} onConfirm - 확인 시 실행할 콜백 함수
     */
    showDeleteConfirmModal(log, onConfirm) {
        // 기존 모달이 있으면 제거
        const existingModal = document.querySelector('.delete-confirm-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'delete-confirm-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>일지 삭제 확인</h3>
                </div>
                <div class="modal-body">
                    <p>다음 일지를 정말로 삭제하시겠습니까?</p>
                    <div class="log-preview">
                        <div class="log-preview-header">
                            <span class="log-preview-country">${log.country}</span>
                            <span class="log-preview-city">${log.city}</span>
                        </div>
                        <div class="log-preview-dates">
                            ${log.startDate} ~ ${log.endDate}
                        </div>
                        <div class="log-preview-memo">
                            ${log.memo ? log.memo.substring(0, 50) + (log.memo.length > 50 ? '...' : '') : '메모 없음'}
                        </div>
                    </div>
                    <p class="warning-text">⚠️ 삭제된 일지는 복구할 수 없습니다.</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn cancel-btn" id="cancel-delete">취소</button>
                    <button class="modal-btn confirm-btn" id="confirm-delete">삭제</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.activeModal = modal;
        
        // 모달 이벤트 바인딩
        const cancelBtn = modal.querySelector('#cancel-delete');
        const confirmBtn = modal.querySelector('#confirm-delete');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            this.closeModal();
        };
        
        cancelBtn.addEventListener('click', closeModal);
        confirmBtn.addEventListener('click', () => {
            onConfirm(log.id);
            closeModal();
        });
        overlay.addEventListener('click', closeModal);
        
        // ESC 키로 모달 닫기
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEscKey);
        
        // 모달이 닫힐 때 이벤트 리스너 정리
        modal.addEventListener('close', () => {
            document.removeEventListener('keydown', handleEscKey);
        });
    }
    
    /**
     * 현재 활성 모달을 닫습니다
     */
    closeModal() {
        if (this.activeModal) {
            this.activeModal.remove();
            this.activeModal = null;
        }
    }
    
    /**
     * 모든 모달을 닫습니다
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.delete-confirm-modal');
        modals.forEach(modal => modal.remove());
        this.activeModal = null;
    }
    
    /**
     * 현재 활성 모달이 있는지 확인합니다
     * @returns {boolean} 활성 모달 존재 여부
     */
    hasActiveModal() {
        return this.activeModal !== null;
    }
}
