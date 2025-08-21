/**
 * 일지 추가 탭 모듈
 * 독립적으로 동작하며, 다른 탭에 영향을 주지 않음
 */

class AddLogTab {
    constructor() {
        this.isInitialized = false;
        this.eventListeners = [];
        this.formData = {};
    }
    
    render(container) {
        this.container = container;
        this.renderContent();
        this.bindEvents();
        this.isInitialized = true;
    }
    
    renderContent() {
        this.container.innerHTML = `
            <div class="tab-placeholder">
                <div class="tab-placeholder-icon">➕</div>
                <div class="tab-placeholder-title">여행 일지 추가</div>
                <div class="tab-placeholder-description">
                    새로운 여행 경험을 기록하고 공유할 수 있습니다.<br>
                    사진, 위치, 날짜, 감상을 자유롭게 작성하세요.
                </div>
                <div style="margin-top: 20px; padding: 16px; background: #f8f9fa; border-radius: 8px; max-width: 400px;">
                    <h3 style="margin-bottom: 12px; color: #495057;">향후 구현 예정 기능</h3>
                    <ul style="text-align: left; color: #6c757d;">
                        <li>여행지 정보 입력</li>
                        <li>사진/영상 업로드</li>
                        <li>위치 정보 연동</li>
                        <li>태그 및 카테고리</li>
                        <li>임시 저장 기능</li>
                        <li>여행 경비 기록</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // 향후 폼 관련 이벤트 리스너 추가 예정
        // 예: 입력값 변경, 폼 제출, 파일 업로드 등
    }
    
    async cleanup() {
        // 이벤트 리스너 정리
        this.eventListeners.forEach(listener => {
            if (listener.element && listener.event && listener.handler) {
                listener.element.removeEventListener(listener.event, listener.handler);
            }
        });
        
        this.eventListeners = [];
        this.isInitialized = false;
        this.formData = {};
        
        // 메모리 정리
        this.container = null;
    }
}

export default new AddLogTab();
