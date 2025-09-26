/**
 * 탭 관리 모듈
 * 탭 전환, 로딩, 렌더링, 정리를 담당
 * 메모리 누수 방지 및 강화된 cleanup 시스템 포함
 * 
 * @version 2.0.0
 * @since 2024-12-29
 * @author REDIPX
 */

import { memoryMonitor } from '../utils/memory-monitor.js';
import { cleanupVerifier } from '../utils/cleanup-verifier.js';
import { errorHandler, ERROR_TYPES, ERROR_SEVERITY } from '../utils/error-handler.js';

export class TabManager {
    constructor(appManager) {
        this.appManager = appManager;
        this.currentTab = null;
        this.tabModules = new Map();
        this.currentTabModule = null;
        
        // 메모리 누수 방지 설정
        this.options = {
            enableMemoryTracking: true,
            enableCleanupVerification: true,
            enableForceCleanup: true,
            cleanupTimeout: 3000, // 3초
            enableLogging: false
        };
        
        // 탭 전환 히스토리 (메모리 누수 감지용)
        this.tabSwitchHistory = [];
        this.cleanupHistory = new Map();
        
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
        this.setupMemoryTracking();
        this.setupCleanupVerification();
        if (this.options.enableLogging) {
            console.log('TabManager initialized with memory leak prevention');
        }
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
            errorHandler.handleError({
                type: ERROR_TYPES.SYSTEM_INITIALIZATION,
                severity: ERROR_SEVERITY.HIGH,
                message: `탭 전환 실패: ${tabName}`,
                stack: error.stack,
                source: 'TabManager.switchTab',
                context: { tabName },
                userMessage: `${tabName} 탭을 전환하는 중 문제가 발생했습니다.`
            });
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
            errorHandler.handleError({
                type: ERROR_TYPES.SYSTEM_INITIALIZATION,
                severity: ERROR_SEVERITY.HIGH,
                message: `탭 로드 실패: ${tabName}`,
                stack: error.stack,
                source: 'TabManager.loadTab',
                context: { tabName },
                userMessage: `${tabName} 탭을 로드하는 중 문제가 발생했습니다.`
            });
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
     * 현재 탭 정리 (강화된 버전)
     */
    async cleanupCurrentTab() {
        if (!this.currentTab) {
            return;
        }
        
        const cleanupId = this.startCleanupTracking(this.currentTab);
        const startTime = Date.now();
        
        try {
            // 데스크톱 레이아웃에서 탭 정리
            if (this.appManager.desktopLayoutManager.isDesktopMode()) {
                await this.cleanupDesktopTab();
            }
            
            if (this.tabModules.has(this.currentTab)) {
                const module = this.tabModules.get(this.currentTab);
                
                // 강화된 모듈 정리
                await this.performModuleCleanup(module, this.currentTab);
            }
            
            // 탭 전환 히스토리 기록
            this.recordTabSwitch(this.currentTab, 'cleanup', Date.now() - startTime);
            
            // 정리 완료 추적
            this.finishCleanupTracking(cleanupId, { success: true });
            
        } catch (error) {
            console.error(`탭 정리 실패: ${this.currentTab}`, error);
            this.finishCleanupTracking(cleanupId, { success: false, error });
            throw error;
        }
    }
    
    /**
     * 모듈 정리 수행 (강화된 버전)
     * @param {Object} module - 정리할 모듈
     * @param {string} tabName - 탭 이름
     */
    async performModuleCleanup(module, tabName) {
        if (!module || !module.default) {
            return;
        }
        
        const moduleInstance = module.default;
        
        // cleanup 메서드가 있는지 확인
        if (typeof moduleInstance.cleanup === 'function') {
            // 타임아웃 설정
            const cleanupPromise = moduleInstance.cleanup();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Cleanup timeout')), this.options.cleanupTimeout);
            });
            
            try {
                await Promise.race([cleanupPromise, timeoutPromise]);
                
                if (this.options.enableLogging) {
                    console.log(`TabManager: ${tabName} 탭 정리 완료`);
                }
                
            } catch (error) {
                if (error.message === 'Cleanup timeout') {
                    console.warn(`TabManager: ${tabName} 탭 정리 타임아웃`);
                    
                    // 강제 정리 시도
                    if (this.options.enableForceCleanup) {
                        await this.forceCleanupModule(moduleInstance, tabName);
                    }
                } else {
                    throw error;
                }
            }
        }
        
        // 추가 정리 작업
        await this.performAdditionalCleanup(moduleInstance, tabName);
    }
    
    /**
     * 강제 모듈 정리
     * @param {Object} moduleInstance - 모듈 인스턴스
     * @param {string} tabName - 탭 이름
     */
    async forceCleanupModule(moduleInstance, tabName) {
        try {
            // 이벤트 리스너 강제 정리
            if (moduleInstance.eventListeners && Array.isArray(moduleInstance.eventListeners)) {
                moduleInstance.eventListeners.forEach(listener => {
                    try {
                        if (listener.element && listener.event && listener.handler) {
                            listener.element.removeEventListener(listener.event, listener.handler);
                        }
                    } catch (error) {
                        console.warn(`TabManager: 강제 정리 중 이벤트 리스너 제거 실패:`, error);
                    }
                });
                moduleInstance.eventListeners = [];
            }
            
            // 타이머 강제 정리
            if (moduleInstance.timeouts && Array.isArray(moduleInstance.timeouts)) {
                moduleInstance.timeouts.forEach(timeout => {
                    try {
                        clearTimeout(timeout);
                    } catch (error) {
                        console.warn(`TabManager: 강제 정리 중 타이머 정리 실패:`, error);
                    }
                });
                moduleInstance.timeouts = [];
            }
            
            // 컨테이너 정리
            if (moduleInstance.container) {
                moduleInstance.container = null;
            }
            
            if (this.options.enableLogging) {
                console.log(`TabManager: ${tabName} 탭 강제 정리 완료`);
            }
            
        } catch (error) {
            console.error(`TabManager: ${tabName} 탭 강제 정리 실패:`, error);
        }
    }
    
    /**
     * 추가 정리 작업 수행
     * @param {Object} moduleInstance - 모듈 인스턴스
     * @param {string} tabName - 탭 이름
     */
    async performAdditionalCleanup(moduleInstance, tabName) {
        // 메모리 정리
        if (this.options.enableMemoryTracking && memoryMonitor) {
            memoryMonitor.recordMemorySnapshot();
        }
        
        // 모듈 상태 초기화
        if (moduleInstance.isInitialized !== undefined) {
            moduleInstance.isInitialized = false;
        }
        
        // 컨테이너 참조 정리
        if (moduleInstance.container) {
            moduleInstance.container = null;
        }
        
        // 정리 히스토리 기록
        this.cleanupHistory.set(tabName, {
            timestamp: Date.now(),
            success: true
        });
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
                    if (this.options.enableLogging) {
                        console.log(`탭 ${this.currentTab}이 새로고침되었습니다.`);
                    }
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
     * 탭 매니저 정리 (강화된 버전)
     */
    async cleanup() {
        const cleanupId = this.startCleanupTracking('TabManager');
        
        try {
            // 모든 탭 정리
            await this.cleanupCurrentTab();
            
            // 모든 모듈 강제 정리
            await this.forceCleanupAllModules();
            
            // 상태 초기화
            this.resetTabState();
            
            // 메모리 정리
            if (this.options.enableMemoryTracking && memoryMonitor) {
                memoryMonitor.recordMemorySnapshot();
            }
            
            this.finishCleanupTracking(cleanupId, { success: true });
            if (this.options.enableLogging) {
                console.log('TabManager cleaned up with memory leak prevention');
            }
            
        } catch (error) {
            this.finishCleanupTracking(cleanupId, { success: false, error });
            console.error('TabManager cleanup failed:', error);
            throw error;
        }
    }
    
    /**
     * 모든 모듈 강제 정리
     */
    async forceCleanupAllModules() {
        const cleanupPromises = [];
        
        this.tabModules.forEach((module, tabName) => {
            if (module && module.default) {
                cleanupPromises.push(
                    this.performModuleCleanup(module, tabName)
                        .catch(error => {
                            console.error(`TabManager: ${tabName} 모듈 강제 정리 실패:`, error);
                        })
                );
            }
        });
        
        await Promise.allSettled(cleanupPromises);
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
    
    // ===============================
    // 메모리 누수 방지 유틸리티 메서드들
    // ===============================
    
    /**
     * 메모리 추적 설정
     */
    setupMemoryTracking() {
        if (!this.options.enableMemoryTracking || !memoryMonitor) {
            return;
        }
        
        // 메모리 누수 이벤트 리스너
        window.addEventListener('memoryLeak', (event) => {
            console.warn('TabManager: 메모리 누수 감지됨', event.detail);
            this.handleMemoryLeak(event.detail);
        });
        
        // 메모리 경고 이벤트 리스너
        window.addEventListener('memoryWarning', (event) => {
            console.warn('TabManager: 메모리 경고', event.detail);
            this.handleMemoryWarning(event.detail);
        });
    }
    
    /**
     * Cleanup 검증 설정
     */
    setupCleanupVerification() {
        if (!this.options.enableCleanupVerification || !cleanupVerifier) {
            return;
        }
        
        // TabManager 자체를 등록
        cleanupVerifier.registerModule('TabManager', this, {
            requireCleanup: true,
            cleanupMethod: 'cleanup',
            timeout: this.options.cleanupTimeout,
            critical: true
        });
    }
    
    /**
     * Cleanup 추적 시작
     * @param {string} moduleId - 모듈 ID
     * @returns {string} 추적 ID
     */
    startCleanupTracking(moduleId) {
        if (!cleanupVerifier) {
            return null;
        }
        
        return cleanupVerifier.startCleanup(moduleId, {
            tabManager: true,
            timestamp: Date.now()
        });
    }
    
    /**
     * Cleanup 추적 완료
     * @param {string} cleanupId - 추적 ID
     * @param {Object} result - 결과 정보
     */
    finishCleanupTracking(cleanupId, result) {
        if (!cleanupId || !cleanupVerifier) {
            return;
        }
        
        if (result.success) {
            cleanupVerifier.finishCleanup(cleanupId, result);
        } else {
            cleanupVerifier.failCleanup(cleanupId, result.error);
        }
    }
    
    /**
     * 탭 전환 기록
     * @param {string} tabName - 탭 이름
     * @param {string} action - 액션 ('switch', 'cleanup')
     * @param {number} duration - 소요 시간
     */
    recordTabSwitch(tabName, action, duration) {
        const record = {
            tabName,
            action,
            duration,
            timestamp: Date.now(),
            memorySnapshot: this.options.enableMemoryTracking && memoryMonitor ? 
                memoryMonitor.getMemoryInfo() : null
        };
        
        this.tabSwitchHistory.push(record);
        
        // 히스토리 크기 제한 (최근 50개만 유지)
        if (this.tabSwitchHistory.length > 50) {
            this.tabSwitchHistory = this.tabSwitchHistory.slice(-50);
        }
        
        // 메모리 누수 감지
        this.detectTabSwitchMemoryLeak();
    }
    
    /**
     * 탭 전환 메모리 누수 감지
     */
    detectTabSwitchMemoryLeak() {
        if (this.tabSwitchHistory.length < 5) {
            return;
        }
        
        const recentSwitches = this.tabSwitchHistory.slice(-5);
        const memoryGrowth = this.calculateMemoryGrowth(recentSwitches);
        
        if (memoryGrowth > 5 * 1024 * 1024) { // 5MB 증가
            console.warn('TabManager: 탭 전환 중 메모리 누수 의심', {
                memoryGrowth: this.formatBytes(memoryGrowth),
                recentSwitches: recentSwitches.length
            });
            
            // 메모리 정리 시도
            this.performMemoryCleanup();
        }
    }
    
    /**
     * 메모리 증가량 계산
     * @param {Array} switches - 탭 전환 기록
     * @returns {number} 메모리 증가량
     */
    calculateMemoryGrowth(switches) {
        if (switches.length < 2) {
            return 0;
        }
        
        const first = switches[0];
        const last = switches[switches.length - 1];
        
        if (!first.memorySnapshot || !last.memorySnapshot) {
            return 0;
        }
        
        return last.memorySnapshot.used - first.memorySnapshot.used;
    }
    
    /**
     * 메모리 정리 수행
     */
    performMemoryCleanup() {
        try {
            // 가비지 컬렉션 힌트
            if (window.gc) {
                window.gc();
            }
            
            // 메모리 스냅샷 기록
            if (memoryMonitor) {
                memoryMonitor.recordMemorySnapshot();
            }
            
            if (this.options.enableLogging) {
                console.log('TabManager: 메모리 정리 수행됨');
            }
            
        } catch (error) {
            console.error('TabManager: 메모리 정리 실패:', error);
        }
    }
    
    /**
     * 메모리 누수 처리
     * @param {Object} leakInfo - 누수 정보
     */
    handleMemoryLeak(leakInfo) {
        console.error('TabManager: 메모리 누수 감지됨', leakInfo);
        
        // 강제 정리 수행
        this.performMemoryCleanup();
        
        // 모든 탭 강제 정리
        this.forceCleanupAllModules();
    }
    
    /**
     * 메모리 경고 처리
     * @param {Object} warningInfo - 경고 정보
     */
    handleMemoryWarning(warningInfo) {
        console.warn('TabManager: 메모리 경고', warningInfo);
        
        // 예방적 정리 수행
        this.performMemoryCleanup();
    }
    
    /**
     * 바이트를 읽기 쉬운 형식으로 변환
     * @param {number} bytes - 바이트 수
     * @returns {string} 포맷된 문자열
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * 탭 매니저 통계 가져오기
     * @returns {Object} 통계 정보
     */
    getStats() {
        return {
            currentTab: this.currentTab,
            loadedModules: this.tabModules.size,
            switchHistory: this.tabSwitchHistory.length,
            cleanupHistory: this.cleanupHistory.size,
            memoryInfo: this.options.enableMemoryTracking && memoryMonitor ? 
                memoryMonitor.getMemoryInfo() : null,
            recentSwitches: this.tabSwitchHistory.slice(-10)
        };
    }
    
    /**
     * 메모리 누수 감지 결과 가져오기
     * @returns {Object} 감지 결과
     */
    detectMemoryLeaks() {
        const leaks = [];
        
        // 정리되지 않은 모듈 체크
        this.tabModules.forEach((module, tabName) => {
            const cleanupRecord = this.cleanupHistory.get(tabName);
            if (!cleanupRecord) {
                leaks.push({
                    type: 'uncleaned_module',
                    tabName,
                    description: '정리되지 않은 탭 모듈'
                });
            }
        });
        
        // 메모리 증가 체크
        if (this.tabSwitchHistory.length >= 10) {
            const recentSwitches = this.tabSwitchHistory.slice(-10);
            const memoryGrowth = this.calculateMemoryGrowth(recentSwitches);
            
            if (memoryGrowth > 10 * 1024 * 1024) { // 10MB
                leaks.push({
                    type: 'memory_growth',
                    growth: memoryGrowth,
                    description: `탭 전환 중 메모리 증가: ${this.formatBytes(memoryGrowth)}`
                });
            }
        }
        
        return {
            hasLeaks: leaks.length > 0,
            leaks,
            stats: this.getStats()
        };
    }
}
