/**
 * 데스크톱 레이아웃 매니저 - PHASE 1
 * 
 * 🎯 책임:
 * - 데스크톱 레이아웃 활성화/비활성화 관리
 * - 화면 크기별 레이아웃 모드 자동 전환
 * - 사용자 설정 기반 레이아웃 모드 저장/복원
 * - 기존 모바일 레이아웃과의 완전한 호환성 보장
 * 
 * @class DesktopLayoutManager
 * @version 1.0.0
 * @since 2024-12-29
 */

class DesktopLayoutManager {
    constructor() {
        this.isInitialized = false;
        this.currentMode = 'mobile'; // 'mobile' | 'desktop'
        this.storageKey = 'travellog-desktop-layout-mode';
        this.breakpoints = {
            tablet: 768,
            smallDesktop: 1024,
            mediumDesktop: 1280,
            largeDesktop: 1440,
            extraLargeDesktop: 1600
        };
        
        // 이벤트 리스너들
        this.eventListeners = [];
        
        // 바인딩
        this.handleResize = this.handleResize.bind(this);
        this.handleStorageChange = this.handleStorageChange.bind(this);
    }
    
    /**
     * 데스크톱 레이아웃 매니저 초기화
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // 저장된 레이아웃 모드 복원
            await this.loadLayoutMode();
            
            // 화면 크기 기반 자동 모드 설정
            this.setAutoMode();
            
            // 이벤트 리스너 등록
            this.bindEvents();
            
            // 초기 레이아웃 적용
            this.applyLayout();
            
            this.isInitialized = true;
            console.log('DesktopLayoutManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize DesktopLayoutManager:', error);
            throw error;
        }
    }
    
    /**
     * 저장된 레이아웃 모드 로드
     */
    async loadLayoutMode() {
        try {
            const savedMode = localStorage.getItem(this.storageKey);
            if (savedMode && ['mobile', 'desktop'].includes(savedMode)) {
                this.currentMode = savedMode;
            }
        } catch (error) {
            console.warn('Failed to load layout mode from storage:', error);
            this.currentMode = 'mobile';
        }
    }
    
    /**
     * 레이아웃 모드 저장
     */
    async saveLayoutMode() {
        try {
            localStorage.setItem(this.storageKey, this.currentMode);
        } catch (error) {
            console.warn('Failed to save layout mode to storage:', error);
        }
    }
    
    /**
     * 화면 크기 기반 자동 모드 설정 - PHASE 1 개선
     */
    setAutoMode() {
        const screenWidth = window.innerWidth;
        const isMobileDevice = this.isMobileDevice();
        
        // 모바일 디바이스에서는 항상 모바일 모드 강제
        if (isMobileDevice || screenWidth < this.breakpoints.smallDesktop) {
            this.currentMode = 'mobile';
            return;
        }
        
        // 자동 모드 설정 규칙 - PHASE 1 정교화
        if (screenWidth >= this.breakpoints.extraLargeDesktop) {
            // 초대형 데스크톱 (1600px+): 데스크톱 모드 기본 활성화
            this.currentMode = 'desktop';
        } else if (screenWidth >= this.breakpoints.largeDesktop) {
            // 대형 데스크톱 (1440px-1599px): 데스크톱 모드 기본 활성화
            this.currentMode = 'desktop';
        } else if (screenWidth >= this.breakpoints.mediumDesktop) {
            // 중형 데스크톱 (1280px-1439px): 사용자 설정 유지, 기본값은 모바일
            if (this.currentMode === 'mobile') {
                // 사용자가 이전에 데스크톱 모드를 선택했다면 유지
                const savedMode = localStorage.getItem(this.storageKey);
                if (savedMode === 'desktop') {
                    this.currentMode = 'desktop';
                }
            }
        } else if (screenWidth >= this.breakpoints.smallDesktop) {
            // 소형 데스크톱 (1024px-1279px): 사용자 설정 유지, 기본값은 모바일
            if (this.currentMode === 'mobile') {
                const savedMode = localStorage.getItem(this.storageKey);
                if (savedMode === 'desktop') {
                    this.currentMode = 'desktop';
                }
            }
        }
    }
    
    /**
     * 모바일 디바이스 감지
     */
    isMobileDevice() {
        // User Agent 기반 모바일 디바이스 감지
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
        
        // 터치 지원 여부 확인
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // 화면 크기와 터치 지원을 종합적으로 판단
        const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
        const isSmallScreen = window.innerWidth <= 768;
        
        return (isMobileUA || (hasTouch && isSmallScreen));
    }
    
    /**
     * 이벤트 리스너 바인딩 - PHASE 1 수정
     */
    bindEvents() {
        // 화면 크기 변경 감지
        window.addEventListener('resize', this.handleResize);
        this.eventListeners.push(['window', 'resize', this.handleResize]);
        
        // 로컬 스토리지 변경 감지 (다른 탭에서의 변경)
        window.addEventListener('storage', this.handleStorageChange);
        this.eventListeners.push(['window', 'storage', this.handleStorageChange]);
        
        // PHASE 1 수정: 로그인 상태 변경 감지
        this.observeLoginState();
    }
    
    /**
     * PHASE 1: 로그인 상태 관찰
     */
    observeLoginState() {
        // MutationObserver를 사용하여 로그인 화면 표시/숨김 감지
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const loginScreen = document.querySelector('#login-screen');
                    if (loginScreen) {
                        const isLoginVisible = loginScreen.style.display !== 'none';
                        if (isLoginVisible) {
                            // 로그인 화면이 표시되면 데스크톱 레이아웃 비활성화
                            this.currentMode = 'mobile';
                            this.applyLayout();
                        }
                    }
                }
            });
        });
        
        // 로그인 화면 요소 관찰 시작
        const loginScreen = document.querySelector('#login-screen');
        if (loginScreen) {
            observer.observe(loginScreen, { attributes: true, attributeFilter: ['style'] });
        }
        
        // 메인 앱 요소도 관찰
        const mainApp = document.querySelector('.main-app');
        if (mainApp) {
            observer.observe(mainApp, { attributes: true, attributeFilter: ['class'] });
        }
    }
    
    /**
     * 화면 크기 변경 처리
     */
    handleResize() {
        // 디바운싱 적용
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.setAutoMode();
            this.applyLayout();
        }, 150);
    }
    
    /**
     * 로컬 스토리지 변경 처리
     */
    handleStorageChange(event) {
        if (event.key === this.storageKey) {
            this.loadLayoutMode();
            this.applyLayout();
        }
    }
    
    /**
     * 레이아웃 모드 전환
     * @param {string} mode - 'mobile' | 'desktop'
     */
    async switchMode(mode) {
        if (!['mobile', 'desktop'].includes(mode)) {
            throw new Error('Invalid layout mode. Must be "mobile" or "desktop"');
        }
        
        if (this.currentMode === mode) return;
        
        const previousMode = this.currentMode;
        this.currentMode = mode;
        
        try {
            // 레이아웃 적용
            this.applyLayout();
            
            // 설정 저장
            await this.saveLayoutMode();
            
            // 이벤트 발생
            this.dispatchModeChangeEvent(previousMode, mode);
            
            console.log(`Layout mode switched from ${previousMode} to ${mode}`);
        } catch (error) {
            // 롤백
            this.currentMode = previousMode;
            this.applyLayout();
            throw error;
        }
    }
    
    /**
     * 현재 레이아웃 적용 - PHASE 1 수정
     */
    applyLayout() {
        const mainApp = document.querySelector('.main-app');
        const loginScreen = document.querySelector('#login-screen');
        
        if (!mainApp) return;
        
        // PHASE 1 수정: 로그인 화면이 표시되어 있으면 데스크톱 레이아웃 비활성화
        if (loginScreen && loginScreen.style.display !== 'none') {
            this.currentMode = 'mobile';
            mainApp.classList.remove('mobile-mode', 'desktop-mode');
            mainApp.classList.add('mobile-mode');
            this.manageDesktopLayout();
            return;
        }
        
        // 기존 클래스 제거
        mainApp.classList.remove('mobile-mode', 'desktop-mode');
        
        // 현재 모드에 따른 클래스 추가
        if (this.currentMode === 'desktop') {
            mainApp.classList.add('desktop-mode');
        } else {
            mainApp.classList.add('mobile-mode');
        }
        
        // 데스크톱 레이아웃 컨테이너 생성/제거
        this.manageDesktopLayout();
    }
    
    /**
     * 데스크톱 레이아웃 컨테이너 관리 - PHASE 1 수정
     */
    manageDesktopLayout() {
        let desktopLayout = document.querySelector('.desktop-layout');
        
        if (this.currentMode === 'desktop') {
            if (!desktopLayout) {
                desktopLayout = this.createDesktopLayout();
                // PHASE 1 수정: main-app 내부에 추가
                const mainApp = document.querySelector('.main-app');
                if (mainApp) {
                    mainApp.appendChild(desktopLayout);
                } else {
                    // main-app이 없으면 body에 추가 (fallback)
                    document.body.appendChild(desktopLayout);
                }
            }
        } else {
            if (desktopLayout) {
                desktopLayout.remove();
            }
        }
    }
    
    /**
     * 데스크톱 레이아웃 HTML 생성
     */
    createDesktopLayout() {
        const desktopLayout = document.createElement('div');
        desktopLayout.className = 'desktop-layout';
        desktopLayout.innerHTML = `
            <!-- 데스크톱 사이드바 -->
            <aside class="desktop-sidebar">
                <div class="desktop-sidebar-nav">
                    <!-- 메인 네비게이션 그룹 -->
                    <div class="desktop-sidebar-nav-group">
                        <div class="desktop-sidebar-nav-group-title">메인</div>
                        <div class="desktop-sidebar-nav-item active" data-tab="home">
                            <span class="icon">🏠</span>
                            <span>홈</span>
                        </div>
                        <div class="desktop-sidebar-nav-item" data-tab="calendar">
                            <span class="icon">📅</span>
                            <span>캘린더</span>
                        </div>
                        <div class="desktop-sidebar-nav-item" data-tab="add-log">
                            <span class="icon">✈️</span>
                            <span>일지 추가</span>
                        </div>
                    </div>
                    
                    <!-- 도구 네비게이션 그룹 -->
                    <div class="desktop-sidebar-nav-group">
                        <div class="desktop-sidebar-nav-group-title">도구</div>
                        <div class="desktop-sidebar-nav-item" data-tab="search">
                            <span class="icon">🔍</span>
                            <span>검색</span>
                        </div>
                        <div class="desktop-sidebar-nav-item" data-tab="my-logs">
                            <span class="icon">📝</span>
                            <span>내 일지</span>
                        </div>
                    </div>
                </div>
            </aside>
            
            <!-- 데스크톱 메인 콘텐츠 -->
            <main class="desktop-main-content">
                <!-- 데스크톱 헤더 -->
                <header class="desktop-header">
                    <h1 class="desktop-header-title">TravelLog</h1>
                    <div class="desktop-header-actions">
                        <button class="btn-secondary" id="layout-toggle-btn">
                            <span class="icon">📱</span>
                            <span>모바일 모드</span>
                        </button>
                        <button class="btn-primary" id="desktop-refresh-btn">
                            <span class="icon">🔄</span>
                            <span>새로고침</span>
                        </button>
                    </div>
                </header>
                
                <!-- 데스크톱 브레드크럼 -->
                <nav class="desktop-breadcrumb">
                    <span class="desktop-breadcrumb-item">홈</span>
                    <span class="desktop-breadcrumb-separator">></span>
                    <span class="desktop-breadcrumb-item">현재 탭</span>
                </nav>
                
                <!-- 데스크톱 콘텐츠 컨테이너 -->
                <div class="desktop-content-container">
                    <div class="desktop-grid">
                        <!-- 탭 콘텐츠가 여기에 동적으로 로드됩니다 -->
                    </div>
                </div>
                
                <!-- 데스크톱 푸터 -->
                <footer class="desktop-footer">
                    <p>&copy; 2024 TravelLog. 모든 권리 보유.</p>
                </footer>
            </main>
        `;
        
        // 이벤트 리스너 등록
        this.bindDesktopLayoutEvents(desktopLayout);
        
        return desktopLayout;
    }
    
    /**
     * 데스크톱 레이아웃 이벤트 바인딩
     */
    bindDesktopLayoutEvents(desktopLayout) {
        // 레이아웃 토글 버튼
        const toggleBtn = desktopLayout.querySelector('#layout-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.switchMode('mobile');
            });
            this.eventListeners.push([toggleBtn, 'click', () => this.switchMode('mobile')]);
        }
        
        // 데스크톱 새로고침 버튼
        const refreshBtn = desktopLayout.querySelector('#desktop-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDesktopLayout();
            });
            this.eventListeners.push([refreshBtn, 'click', () => this.refreshDesktopLayout()]);
        }
        
        // 사이드바 네비게이션
        const navItems = desktopLayout.querySelectorAll('.desktop-sidebar-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.handleDesktopTabClick(tab, e.currentTarget);
            });
            this.eventListeners.push([item, 'click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.handleDesktopTabClick(tab, e.currentTarget);
            }]);
        });
    }
    
    /**
     * 데스크톱 탭 클릭 처리
     */
    handleDesktopTabClick(tab, element) {
        // 활성 탭 업데이트
        const navItems = document.querySelectorAll('.desktop-sidebar-nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        element.classList.add('active');
        
        // 브레드크럼 업데이트
        this.updateBreadcrumb(tab);
        
        // 기존 탭 전환 로직 호출
        if (window.TabManager && typeof window.TabManager.switchTab === 'function') {
            window.TabManager.switchTab(tab);
        }
    }
    
    /**
     * 데스크톱 사이드바 네비게이션 업데이트
     */
    updateDesktopSidebar(activeTab) {
        const navItems = document.querySelectorAll('.desktop-sidebar-nav-item');
        navItems.forEach(item => {
            const tab = item.dataset.tab;
            if (tab === activeTab) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    /**
     * 브레드크럼 업데이트
     */
    updateBreadcrumb(tab) {
        const breadcrumb = document.querySelector('.desktop-breadcrumb');
        if (!breadcrumb) return;
        
        const tabNames = {
            'home': '홈',
            'calendar': '캘린더',
            'add-log': '일지 추가',
            'search': '검색',
            'my-logs': '내 일지'
        };
        
        const currentTabName = tabNames[tab] || tab;
        breadcrumb.innerHTML = `
            <span class="desktop-breadcrumb-item">홈</span>
            <span class="desktop-breadcrumb-separator">></span>
            <span class="desktop-breadcrumb-item">${currentTabName}</span>
        `;
    }
    
    /**
     * 모드 변경 이벤트 발생
     */
    dispatchModeChangeEvent(previousMode, currentMode) {
        const event = new CustomEvent('layoutModeChanged', {
            detail: {
                previousMode,
                currentMode,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * 데스크톱 레이아웃 새로고침
     */
    refreshDesktopLayout() {
        if (this.currentMode === 'desktop') {
            // 현재 탭 다시 로드
            if (window.TabManager && typeof window.TabManager.switchTab === 'function') {
                const currentTab = this.getCurrentActiveTab();
                if (currentTab) {
                    window.TabManager.switchTab(currentTab);
                }
            }
        }
    }
    
    /**
     * 현재 활성 탭 가져오기
     */
    getCurrentActiveTab() {
        const activeItem = document.querySelector('.desktop-sidebar-nav-item.active');
        return activeItem ? activeItem.dataset.tab : 'home';
    }
    
    /**
     * 현재 모드 반환
     */
    getCurrentMode() {
        return this.currentMode;
    }
    
    /**
     * 데스크톱 모드 여부 확인
     */
    isDesktopMode() {
        return this.currentMode === 'desktop';
    }
    
    /**
     * 모바일 모드 여부 확인
     */
    isMobileMode() {
        return this.currentMode === 'mobile';
    }
    
    /**
     * 리소스 정리
     */
    cleanup() {
        // 이벤트 리스너 제거
        this.eventListeners.forEach(([element, event, handler]) => {
            if (element && element.removeEventListener) {
                element.removeEventListener(event, handler);
            }
        });
        this.eventListeners = [];
        
        // 타이머 정리
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        // 데스크톱 레이아웃 제거
        const desktopLayout = document.querySelector('.desktop-layout');
        if (desktopLayout) {
            desktopLayout.remove();
        }
        
        this.isInitialized = false;
    }
}

// 전역에서 접근할 수 있도록 등록
if (typeof window !== 'undefined') {
    window.DesktopLayoutManager = DesktopLayoutManager;
}

export default DesktopLayoutManager;
