/**
 * 홈 탭 모듈
 * 독립적으로 동작하며, 다른 탭에 영향을 주지 않음
 */

class HomeTab {
    constructor() {
        this.isInitialized = false;
        this.eventListeners = [];
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
                <div class="tab-placeholder-icon">🏠</div>
                <div class="tab-placeholder-title">홈</div>
                <div class="tab-placeholder-description">
                    여행 로그의 메인 화면입니다.<br>
                    최근 여행 기록과 추천 여행지를 확인할 수 있습니다.
                </div>
                <div style="margin-top: 20px; padding: 16px; background: #f8f9fa; border-radius: 8px; max-width: 400px;">
                    <h3 style="margin-bottom: 12px; color: #495057;">향후 구현 예정 기능</h3>
                    <ul style="text-align: left; color: #6c757d;">
                        <li>최근 여행 기록 미리보기</li>
                        <li>추천 여행지 카드</li>
                        <li>여행 통계 요약</li>
                        <li>빠른 액션 버튼</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // 향후 이벤트 리스너 추가 예정
        // 예: 버튼 클릭, 스크롤 이벤트 등
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
        
        // 메모리 정리
        this.container = null;
    }
}

export default new HomeTab();
