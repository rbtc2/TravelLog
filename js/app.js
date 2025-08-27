/**
 * TravelLog 메인 애플리케이션
 * 로그인 화면과 탭 관리 및 동적 모듈 로딩을 담당
 */

// 모바일 환경 최적화
(function() {
    'use strict';
    
    // 터치 이벤트 최적화
    let touchStartY = 0;
    let touchStartX = 0;
    
    // 터치 시작 이벤트
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    // 터치 이동 이벤트 (가로 스크롤 방지, 스크롤 중일 때는 방해하지 않음)
    document.addEventListener('touchmove', function(e) {
        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        const deltaY = Math.abs(touchY - touchStartY);
        const deltaX = Math.abs(touchX - touchStartX);
        
        // 가로 스크롤만 방지하고, 스크롤 중일 때는 방해하지 않음
        if (deltaX > deltaY && deltaX > 10 && e.cancelable) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // 더블 탭 줌 방지 (스크롤 중일 때는 방해하지 않음)
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300 && e.cancelable) {
            // 더블 탭이면서 취소 가능한 경우에만 방지
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
    
    // 입력 필드 포커스 시 줌 방지
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // 입력 필드가 화면 중앙에 오도록 스크롤
            setTimeout(() => {
                this.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 300);
        });
    });
    
    // 모바일 키보드 표시 시 레이아웃 조정
    let initialViewportHeight = window.innerHeight;
    window.addEventListener('resize', function() {
        if (window.innerHeight < initialViewportHeight) {
            // 키보드가 표시됨
            document.body.style.height = window.innerHeight + 'px';
        } else {
            // 키보드가 숨겨짐
            document.body.style.height = '100vh';
        }
    });
    
    // 터치 피드백 효과
    const touchElements = document.querySelectorAll('button, .tab-btn, .login-btn, .demo-btn, a');
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        }, { passive: true });
    });
})();

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
        try {
            // 현재 탭 정리
            await this.cleanupCurrentTab();
            
            // 새 탭 로드
            const module = await this.loadTabModule(tabName);
            
            // 탭 콘텐츠 렌더링
            this.renderTabContent(module);
            
            // "내 일지" 탭인 경우 데이터 새로고침
            if (tabName === 'my-logs' && module.default && typeof module.default.refresh === 'function') {
                module.default.refresh();
            }
            
            // UI 업데이트
            this.updateTabUI(tabName);
            
            // 현재 탭 업데이트
            this.currentTab = tabName;
            
        } catch (error) {
            console.error(`탭 전환 실패: ${tabName}`, error);
            this.showError(tabName, error);
        }
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
