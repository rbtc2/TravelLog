/**
 * 홈 탭 모듈
 * 독립적으로 동작하며, 다른 탭에 영향을 주지 않음
 */

class HomeTab {
    constructor() {
        this.isInitialized = false;
        this.isRendering = false;
        this.eventListeners = [];
    }
    
    render(container) {
        // 중복 렌더링 방지
        if (this.isRendering) {
            return;
        }
        this.isRendering = true;

        this.container = container;
        // 홈 탭 CSS 네임스페이스 클래스 추가
        this.container.classList.add('home-tab');
        this.renderContent();
        this.bindEvents();
        this.isInitialized = true;
        
        // 탭 렌더링 후 스크롤을 상단으로 이동
        this.scrollToTop();

        // 렌더링 완료
        this.isRendering = false;
    }
    
    renderContent() {
        this.container.innerHTML = `
            <div class="tab-placeholder" style="padding-bottom: calc(var(--spacing-lg) + var(--navigation-height, 80px) + 20px);">
                <div class="tab-placeholder-icon">🎉</div>
                <div class="tab-placeholder-title">환영합니다!</div>
                <div class="tab-placeholder-description">
                    TravelLog에 오신 것을 환영합니다!<br>
                    여행의 모든 순간을 기록하고 공유해보세요.
                </div>
                
                <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; max-width: 500px; color: white;">
                    <h3 style="margin-bottom: 16px; color: white; font-size: 20px;">🚀 빠른 시작 가이드</h3>
                    <div style="text-align: left; color: rgba(255,255,255,0.9);">
                        <p style="margin-bottom: 12px;"><strong>1단계:</strong> ✈️ 여행 일지 추가하기</p>
                        <p style="margin-bottom: 12px;"><strong>2단계:</strong> 📅 캘린더에서 일정 관리하기</p>
                        <p style="margin-bottom: 12px;"><strong>3단계:</strong> 🔍 여행 기록 검색하기</p>
                        <p style="margin-bottom: 0;"><strong>4단계:</strong> 📝 내 일지 관리하기</p>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 16px; background: #f8f9fa; border-radius: 8px; max-width: 400px;">
                    <h3 style="margin-bottom: 12px; color: #495057;">향후 구현 예정 기능</h3>
                    <ul style="text-align: left; color: #6c757d;">
                        <li>최근 여행 기록 미리보기</li>
                        <li>추천 여행지 카드</li>
                        <li>여행 통계 요약</li>
                        <li>빠른 액션 버튼</li>
                        <li>개인화된 대시보드</li>
                    </ul>
                </div>
                
                <div style="margin-top: 20px; padding: 16px; background: #e7f3ff; border-radius: 8px; max-width: 400px; border-left: 4px solid #007bff;">
                    <h4 style="margin-bottom: 8px; color: #007bff;">💡 팁</h4>
                    <p style="color: #0056b3; margin: 0; font-size: 14px;">
                        하단의 탭을 클릭하여 각 기능을 탐색해보세요.<br>
                        모든 기능은 현재 데모 모드로 동작합니다.
                    </p>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // 향후 이벤트 리스너 추가 예정
        // 예: 버튼 클릭, 스크롤 이벤트 등
    }
    
    /**
     * 스크롤을 맨 위로 즉시 이동시킵니다
     */
    scrollToTop() {
        requestAnimationFrame(() => {
            window.scrollTo({ 
                top: 0, 
                left: 0, 
                behavior: 'instant' 
            });
        });
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
