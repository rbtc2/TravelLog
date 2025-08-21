/**
 * TravelLog 메인 애플리케이션
 * 로그인 화면과 탭 관리 및 동적 모듈 로딩을 담당
 */

class AppManager {
    constructor() {
        this.currentTab = null;
        this.tabModules = new Map();
        this.isLoggedIn = false;
        
        // DOM 요소들
        this.loginScreen = document.getElementById('login-screen');
        this.mainApp = document.getElementById('main-app');
        this.loginForm = document.getElementById('login-form');
        this.demoBtn = document.getElementById('demo-btn');
        this.tabContent = document.getElementById('tab-content');
        this.tabButtons = document.querySelectorAll('.tab-btn');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.showLoginScreen();
    }
    
    bindEvents() {
        // 로그인 폼 제출
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // 데모 버튼 클릭
        this.demoBtn.addEventListener('click', () => {
            this.handleDemoLogin();
        });
        
        // 탭 버튼 클릭
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }
    
    handleLogin() {
        // 실제 로그인 기능은 구현하지 않음 (UI만)
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        console.log('로그인 시도:', { email, password, remember });
        
        // 데모 목적으로 바로 로그인 성공 처리
        this.loginSuccess();
    }
    
    handleDemoLogin() {
        // 데모 로그인 - 바로 앱 화면으로 전환
        console.log('데모 로그인 시작');
        this.loginSuccess();
    }
    
    loginSuccess() {
        this.isLoggedIn = true;
        this.showMainApp();
        this.loadTab('home'); // 기본 탭 로드
    }
    
    showLoginScreen() {
        this.loginScreen.style.display = 'flex';
        this.mainApp.classList.add('hidden');
    }
    
    showMainApp() {
        this.loginScreen.style.display = 'none';
        this.mainApp.classList.remove('hidden');
    }
    
    async switchTab(tabName) {
        if (this.currentTab === tabName) return;
        
        // 이전 탭 정리
        await this.cleanupCurrentTab();
        
        // 새 탭 로드
        await this.loadTab(tabName);
        
        // UI 상태 업데이트
        this.updateTabUI(tabName);
    }
    
    async loadTab(tabName) {
        try {
            // 로딩 상태 표시
            this.showLoading();
            
            // 동적 모듈 로드
            const module = await this.loadTabModule(tabName);
            
            // 탭 콘텐츠 렌더링
            this.renderTabContent(module);
            
            this.currentTab = tabName;
            
        } catch (error) {
            console.error(`탭 로드 실패: ${tabName}`, error);
            this.showError(tabName, error);
        }
    }
    
    async loadTabModule(tabName) {
        // 이미 로드된 모듈이 있다면 재사용
        if (this.tabModules.has(tabName)) {
            return this.tabModules.get(tabName);
        }
        
        // 동적 import로 모듈 로드
        const module = await import(`./tabs/${tabName}.js`);
        this.tabModules.set(tabName, module);
        
        return module;
    }
    
    renderTabContent(module) {
        if (module && module.default && typeof module.default.render === 'function') {
            this.tabContent.innerHTML = '';
            module.default.render(this.tabContent);
        } else {
            this.showPlaceholder();
        }
    }
    
    async cleanupCurrentTab() {
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
    
    updateTabUI(activeTabName) {
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === activeTabName);
        });
    }
    
    showLoading() {
        this.tabContent.innerHTML = `
            <div class="tab-loading">
                <div class="loading-spinner"></div>
                <span>탭을 로딩 중...</span>
            </div>
        `;
    }
    
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
    
    // 로그아웃 기능 (향후 구현 예정)
    logout() {
        this.isLoggedIn = false;
        this.currentTab = null;
        this.tabModules.clear();
        this.showLoginScreen();
    }
}

// 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    new AppManager();
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    // 모든 탭 모듈 정리
    // 실제 구현에서는 각 모듈의 cleanup 메서드 호출
});
