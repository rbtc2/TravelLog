/**
 * 탭 관리 모듈
 * 탭 전환, 로딩, 렌더링, 정리를 담당
 * 
 * @version 1.0.0
 * @since 2024-12-29
 * @author REDIPX
 */

export class TabManager {
    constructor(appManager) {
        this.appManager = appManager;
        this.currentTab = null;
        this.tabModules = new Map();
        this.currentTabModule = null;
        
        // DOM 요소들
        this.tabContent = document.getElementById('tab-content');
        this.tabButtons = document.querySelectorAll('.tab-btn');
        
        this.init();
    }
    
    /**
     * 탭 매니저 초기화
     */
    init() {
        this.bindTabEvents();
        console.log('TabManager initialized');
    }
    
    /**
     * 탭 이벤트 바인딩
     */
    bindTabEvents() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }
    
    /**
     * 탭 전환
     * @param {string} tabName - 전환할 탭 이름
     */
    async switchTab(tabName) {
        try {
            // 현재 탭 정리
            await this.cleanupCurrentTab();
            
            // 새 탭 로드
            const module = await this.loadTabModule(tabName);
            
            // 데스크톱 레이아웃에서 탭 콘텐츠 렌더링
            if (this.appManager.desktopLayoutManager.isDesktopMode()) {
                await this.renderDesktopTabContent(module, tabName);
            } else {
                await this.renderTabContent(module);
            }
            
            // 모든 탭에 대해 데이터 새로고침 (데모 데이터 생성 포함)
            if (module.default && typeof module.default.refresh === 'function') {
                module.default.refresh();
            }
            
            // UI 업데이트
            this.updateTabUI(tabName);
            
            // 현재 탭 업데이트
            this.currentTab = tabName;
            
            // 탭 전환 후 스크롤을 상단으로 이동
            this.scrollToTop();
            
        } catch (error) {
            console.error(`탭 전환 실패: ${tabName}`, error);
            this.showError(tabName, error);
        }
    }
    
    /**
     * 탭 로드
     * @param {string} tabName - 로드할 탭 이름
     */
    async loadTab(tabName) {
        try {
            // 로딩 상태 표시
            this.showLoading();
            
            // 동적 모듈 로드
            const module = await this.loadTabModule(tabName);
            
            // 탭 콘텐츠 렌더링
            await this.renderTabContent(module);
            
            this.currentTab = tabName;
            
            // 탭 로드 후 스크롤을 상단으로 이동
            this.scrollToTop();
            
        } catch (error) {
            console.error(`탭 로드 실패: ${tabName}`, error);
            this.showError(tabName, error);
        }
    }
    
    /**
     * 탭 모듈 동적 로드
     * @param {string} tabName - 로드할 탭 이름
     * @returns {Promise<Object>} 로드된 모듈
     */
    async loadTabModule(tabName) {
        // 이미 로드된 모듈이 있다면 재사용
        if (this.tabModules.has(tabName)) {
            return this.tabModules.get(tabName);
        }
        
        // 동적 import로 모듈 로드
        let moduleName = tabName;
        if (tabName === 'my-logs') {
            moduleName = 'my-logs';
        } else if (tabName === 'search') {
            moduleName = 'search';
        }
        
        const module = await import(`../../tabs/${moduleName}.js`);
        this.tabModules.set(tabName, module);
        
        return module;
    }
    
    /**
     * 탭 콘텐츠 렌더링 (모바일)
     * @param {Object} module - 렌더링할 모듈
     */
    async renderTabContent(module) {
        if (module && module.default && typeof module.default.render === 'function') {
            this.tabContent.innerHTML = '';
            await module.default.render(this.tabContent);
        } else {
            this.showPlaceholder();
        }
    }
    
    /**
     * 데스크톱 레이아웃에서 탭 콘텐츠 렌더링
     * @param {Object} module - 렌더링할 모듈
     * @param {string} tabName - 탭 이름
     */
    async renderDesktopTabContent(module, tabName) {
        const desktopGrid = document.querySelector('.desktop-grid');
        if (!desktopGrid) {
            console.warn('데스크톱 그리드 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        // 기존 콘텐츠 정리
        desktopGrid.innerHTML = '';
        
        // 탭별 데스크톱 최적화 렌더링
        if (module && module.default && typeof module.default.render === 'function') {
            // 임시 컨테이너 생성
            const tempContainer = document.createElement('div');
            tempContainer.className = 'desktop-tab-content';
            tempContainer.style.width = '100%';
            tempContainer.style.gridColumn = '1 / -1';
            
            // 모듈 렌더링
            await module.default.render(tempContainer);
            this.currentTabModule = module.default;
            
            // 그리드에 추가
            desktopGrid.appendChild(tempContainer);
        } else {
            desktopGrid.innerHTML = '<div class="error-message">탭을 로드할 수 없습니다.</div>';
        }
    }
    
    /**
     * 데스크톱 레이아웃에서 탭 정리
     */
    async cleanupDesktopTab() {
        const desktopGrid = document.querySelector('.desktop-grid');
        if (desktopGrid) {
            // 기존 탭 모듈 정리
            if (this.currentTabModule && typeof this.currentTabModule.cleanup === 'function') {
                try {
                    await this.currentTabModule.cleanup();
                } catch (error) {
                    console.error('데스크톱 탭 정리 실패:', error);
                }
            }
            
            // 그리드 콘텐츠 정리
            desktopGrid.innerHTML = '';
        }
    }
    
    /**
     * 현재 탭 정리
     */
    async cleanupCurrentTab() {
        // 데스크톱 레이아웃에서 탭 정리
        if (this.appManager.desktopLayoutManager.isDesktopMode()) {
            await this.cleanupDesktopTab();
        }
        
        if (this.currentTab && this.tabModules.has(this.currentTab)) {
            const module = this.tabModules.get(this.currentTab);
            
            // 모듈에 cleanup 메서드가 있다면 호출
            if (module.default && typeof module.default.cleanup === 'function') {
                try {
                    await module.default.cleanup();
                } catch (error) {
                    console.error(`탭 정리 실패: ${this.currentTab}`, error);
                }
            }
        }
    }
    
    /**
     * 탭 UI 업데이트
     * @param {string} activeTabName - 활성 탭 이름
     */
    updateTabUI(activeTabName) {
        // 기존 모바일 탭 버튼 업데이트
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === activeTabName);
        });
        
        // 데스크톱 사이드바 네비게이션 업데이트
        if (this.appManager.desktopLayoutManager.isDesktopMode()) {
            this.appManager.desktopLayoutManager.updateDesktopSidebar(activeTabName);
        }
    }
    
    /**
     * 로딩 상태 표시
     */
    showLoading() {
        this.tabContent.innerHTML = `
            <div class="tab-loading">
                <div class="loading-spinner"></div>
                <span>탭을 로딩 중...</span>
            </div>
        `;
    }
    
    /**
     * 오류 상태 표시
     * @param {string} tabName - 탭 이름
     * @param {Error} error - 오류 객체
     */
    showError(tabName, error) {
        this.tabContent.innerHTML = `
            <div class="tab-placeholder">
                <div class="tab-placeholder-icon">⚠️</div>
                <div class="tab-placeholder-title">오류 발생</div>
                <div class="tab-placeholder-description">
                    ${tabName} 탭을 로드하는 중 오류가 발생했습니다.<br>
                    잠시 후 다시 시도해주세요.
                </div>
            </div>
        `;
    }
    
    /**
     * 플레이스홀더 표시
     */
    showPlaceholder() {
        this.tabContent.innerHTML = `
            <div class="tab-placeholder">
                <div class="tab-placeholder-icon">📱</div>
                <div class="tab-placeholder-title">준비 중</div>
                <div class="tab-placeholder-description">
                    이 탭의 기능은 현재 개발 중입니다.<br>
                    곧 새로운 기능을 만나보실 수 있습니다.
                </div>
            </div>
        `;
    }
    
    /**
     * 스크롤을 맨 위로 즉시 이동
     */
    scrollToTop() {
        // 모바일과 데스크톱 모두에서 스크롤을 맨 위로 이동
        if (this.appManager.desktopLayoutManager.isDesktopMode()) {
            // 데스크톱 모드: 메인 콘텐츠 영역 스크롤
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.scrollTop = 0;
            }
        } else {
            // 모바일 모드: 전체 페이지 스크롤
            window.scrollTo(0, 0);
        }
    }
    
    /**
     * 현재 탭 새로고침
     */
    refreshCurrentTab() {
        if (this.currentTab && this.tabModules.has(this.currentTab)) {
            const module = this.tabModules.get(this.currentTab);
            if (module.default && typeof module.default.refresh === 'function') {
                try {
                    module.default.refresh();
                    console.log(`탭 ${this.currentTab}이 새로고침되었습니다.`);
                } catch (error) {
                    console.error(`탭 ${this.currentTab} 새로고침 실패:`, error);
                }
            }
        }
    }
    
    /**
     * 탭 상태 초기화
     */
    resetTabState() {
        this.currentTab = null;
        this.tabModules.clear();
        this.currentTabModule = null;
    }
    
    /**
     * 탭 매니저 정리
     */
    cleanup() {
        // 모든 탭 정리
        this.cleanupCurrentTab();
        
        // 상태 초기화
        this.resetTabState();
        
        console.log('TabManager cleaned up');
    }
    
    /**
     * 현재 탭 정보 반환
     * @returns {string|null} 현재 탭 이름
     */
    getCurrentTab() {
        return this.currentTab;
    }
    
    /**
     * 로드된 탭 모듈 정보 반환
     * @returns {Map} 탭 모듈 맵
     */
    getTabModules() {
        return this.tabModules;
    }
}
