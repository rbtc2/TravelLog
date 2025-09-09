/**
 * 캘린더 탭 모듈 (리팩토링됨)
 * 해외 체류 기록을 캘린더 형태로 표시하는 독립 모듈
 * 모듈화된 아키텍처로 유지보수성과 확장성 향상
 */

// 데이터 관리 모듈 import
import { CalendarDataManager } from '../modules/calendar/CalendarDataManager.js';

// 렌더링 모듈 import
import { CalendarRenderer } from '../modules/calendar/CalendarRenderer.js';

// 이벤트 핸들러 모듈들 import
import { CalendarEventHandler } from '../modules/calendar/handlers/CalendarEventHandler.js';
import { KeyboardNavigationHandler } from '../modules/calendar/handlers/KeyboardNavigationHandler.js';
import { TooltipHandler } from '../modules/calendar/handlers/TooltipHandler.js';
import { SwipeGestureHandler } from '../modules/calendar/handlers/SwipeGestureHandler.js';

// 모달 모듈들 import
import { DatePickerModal } from '../modules/calendar/modals/DatePickerModal.js';

// 로그 상세 모듈 import
import LogDetailModule from '../modules/log-detail.js';

/**
 * 디버그 모드 확인 유틸리티
 * 브라우저 환경에서도 안전하게 작동
 */
function isDebugMode() {
    return typeof process !== 'undefined' && 
           process.env && 
           process.env.NODE_ENV === 'development';
}

class CalendarTab {
    constructor() {
        this.isInitialized = false;
        this.currentDate = new Date();
        this.currentView = 'month'; // 'month' | 'week'
        this.selectedDate = null;
        
        // 핵심 모듈들 초기화
        this.dataManager = new CalendarDataManager();
        this.renderer = null;
        
        // 이벤트 핸들러들 초기화
        this.eventHandler = null;
        this.keyboardHandler = null;
        this.tooltipHandler = null;
        this.swipeHandler = null;
        
        // 모달들 초기화
        this.datePickerModal = null;
        
        // 로그 상세 모듈 초기화
        this.logDetailModule = new LogDetailModule();
        this.isDetailMode = false;
        this.currentLogId = null;
        
        // 렌더링 최적화
        this.renderQueue = [];
        this.isRendering = false;
    }
    
    /**
     * 탭 렌더링 메인 메서드
     * @param {HTMLElement} container - 탭 콘텐츠 컨테이너
     */
    async render(container) {
        this.container = container;
        
        // 초기 렌더링 시 스크롤바 중복 방지
        this.container.style.overflow = 'hidden';
        
        try {
            // 데이터 초기화
            await this.dataManager.initializeCountriesManager();
            await this.dataManager.loadTravelLogs();
            
            // 핵심 모듈들 초기화
            this.renderer = new CalendarRenderer(container, this.dataManager);
            this.datePickerModal = new DatePickerModal(this);
            
            // 이벤트 핸들러들 초기화
            this.eventHandler = new CalendarEventHandler(this);
            this.keyboardHandler = new KeyboardNavigationHandler(this);
            this.tooltipHandler = new TooltipHandler(this);
            this.swipeHandler = new SwipeGestureHandler(this);
            
            // UI 렌더링 및 이벤트 바인딩
            if (this.isDetailMode && this.currentLogId) {
                // 상세 모드인 경우 상세 화면 렌더링
                const logData = this.dataManager.getLogById(this.currentLogId);
                if (logData) {
                    this.logDetailModule.render(this.container, logData, { context: 'calendar' });
                    this.bindDetailEvents();
                } else {
                    // 로그를 찾을 수 없으면 캘린더 화면으로 돌아가기
                    this.isDetailMode = false;
                    this.currentLogId = null;
                    this.renderer.renderContent(this.currentDate, this.currentView);
                    this.eventHandler.bindAllEvents();
                }
            } else {
                // 일반 모드인 경우 캘린더 화면 렌더링
                this.renderer.renderContent(this.currentDate, this.currentView);
                this.eventHandler.bindAllEvents();
            }
            
            this.isInitialized = true;
            
            // 초기화 완료 후 스크롤 설정 복원
            this.restoreScrollSettings();
            
            // 초기화 완료 (개발 환경에서만 로그)
            if (isDebugMode()) {
            console.log('캘린더 탭 초기화 완료');
            }
        } catch (error) {
            console.error('캘린더 탭 초기화 실패:', error);
            // 에러가 발생해도 기본 UI는 렌더링
            this.renderer = new CalendarRenderer(container, this.dataManager);
            this.renderer.renderContent(this.currentDate, this.currentView);
            this.eventHandler = new CalendarEventHandler(this);
            this.eventHandler.bindAllEvents();
            this.isInitialized = true;
        }
    }
    
    
    /**
     * 스크롤 설정 복원 (초기화 완료 후)
     */
    restoreScrollSettings() {
        // 다음 프레임에서 스크롤 설정 복원
        requestAnimationFrame(() => {
            if (this.container) {
                // 컨테이너 스크롤 설정 복원 - 상위 컨테이너에서만 스크롤
                this.container.style.overflow = '';
                this.container.style.overflowX = 'hidden';
                this.container.style.overflowY = 'auto';
                
                // 하드웨어 가속 적용
                this.container.style.transform = 'translateZ(0)';
                this.container.style.backfaceVisibility = 'hidden';
                this.container.style.webkitOverflowScrolling = 'touch';
            }
        });
    }
    
    /**
     * 핵심 비즈니스 로직 메서드들
     */
    
    /**
     * 로그 상세 화면 표시
     * @param {string} logId - 로그 ID
     */
    showLogDetail(logId) {
        if (!logId) return;
        
        try {
            // 로그 데이터 조회
            const logData = this.dataManager.getLogById(logId);
            if (!logData) {
                console.error('로그를 찾을 수 없습니다:', logId);
                return;
            }
            
            // 상세 모드로 전환
            this.isDetailMode = true;
            this.currentLogId = logId;
            
            // 로그 상세 화면 렌더링 (캘린더 컨텍스트)
            this.logDetailModule.render(this.container, logData, { context: 'calendar' });
            
            // 뒤로가기 이벤트 바인딩
            this.bindDetailEvents();
            
        } catch (error) {
            console.error('로그 상세 화면 표시 오류:', error);
        }
    }
    
    /**
     * 상세 화면에서 캘린더로 돌아가기
     */
    backToCalendar() {
        this.isDetailMode = false;
        this.currentLogId = null;
        
        // 캘린더 화면 다시 렌더링
        this.renderer.renderContent(this.currentDate, this.currentView);
        this.eventHandler.bindAllEvents();
    }
    
    /**
     * 상세 화면 이벤트 바인딩
     */
    bindDetailEvents() {
        // 뒤로가기 버튼 이벤트
        const backBtn = document.getElementById('back-to-logs');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.backToCalendar();
            });
        }
    }
    
    /**
     * 뷰 전환 처리
     * @param {string} view - 'month' | 'week'
     */
    switchView(view) {
        if (this.currentView === view) return;
        
        this.currentView = view;
        this.renderer.updateViewToggle(view);
        this.refreshCalendar();
        
        // 뷰 전환 로그 제거 (성능 최적화)
    }
    
    /**
     * 날짜 네비게이션 처리
     * @param {string} action - 'prev' | 'next' | 'today'
     */
    handleNavigation(action) {
        const newDate = new Date(this.currentDate);
        
        switch (action) {
            case 'prev':
                if (this.currentView === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1);
                } else {
                    newDate.setDate(newDate.getDate() - 7);
                }
                break;
            case 'next':
                if (this.currentView === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1);
                } else {
                    newDate.setDate(newDate.getDate() + 7);
                }
                break;
            case 'today':
                newDate.setTime(Date.now());
                break;
        }
        
        this.currentDate = newDate;
        this.refreshCalendar();
        // 날짜 네비게이션 로그 제거 (성능 최적화)
    }
    
    /**
     * 날짜 선택 처리
     * @param {Date} date - 선택된 날짜
     */
    selectDate(date) {
        this.selectedDate = date;
        this.renderer.updateSelectedDate(date);
        this.renderer.updateDetails(date);
        // 날짜 선택 로그 제거 (성능 최적화)
    }
    
    /**
     * 캘린더 새로고침
     * 성능 최적화를 위해 필요한 부분만 업데이트
     */
    refreshCalendar() {
        if (!this.renderer) return;
        
        try {
            this.renderer.refreshCalendar(this.currentDate, this.selectedDate);
            
            // 오래된 캐시 정리 (주기적으로)
            if (Math.random() < 0.1) {
                this.renderer.cleanupOldCache();
            }
        } catch (error) {
            console.error('캘린더 새로고침 중 오류 발생:', error);
        }
    }
    
    /**
     * 키보드 네비게이션 처리 (접근성 향상)
     * @param {KeyboardEvent} e - 키보드 이벤트
     */
    handleKeyboardNavigation(e) {
        if (!this.isInitialized || !this.keyboardHandler) return;
        this.keyboardHandler.handleKeyboardNavigation(e);
    }
    /**
     * 여행 로그 표시기 클릭 처리
     * @param {HTMLElement} indicator - 클릭된 표시기
     */
    handleIndicatorClick(indicator) {
        if (indicator.classList.contains('travel-log-more')) {
            // 더 보기 클릭 로그 제거 (성능 최적화)
        } else {
            const logId = indicator.dataset.logId;
            const country = indicator.dataset.country;
            // 여행 로그 클릭 로그 제거 (성능 최적화)
        }
    }
    
    /**
     * 툴팁 숨기기 (핸들러에 위임)
     */
    hideTooltip() {
        if (this.tooltipHandler) {
            this.tooltipHandler.hideTooltip();
        }
    }
    
    /**
     * 윈도우 리사이즈 처리 (반응형 대응)
     */
    handleResize() {
        if (!this.isInitialized) return;
        
        if (this.renderer) {
            this.renderer.clearCache();
        }
        
        const width = window.innerWidth;
        if (width < 768 && this.currentView === 'month') {
            // 모바일 화면 감지 로그 제거 (성능 최적화)
        }
    }
    
    /**
     * 유틸리티 메서드들
     */
    
    
    
    
    
    
    /**
     * 탭 정리 메서드 (메모리 관리)
     */
    async cleanup() {
        try {
            // 핸들러들 정리
            if (this.tooltipHandler) {
                this.tooltipHandler.cleanup();
            }
            if (this.eventHandler) {
                this.eventHandler.cleanup();
            }
            if (this.datePickerModal) {
                this.datePickerModal.cleanup();
            }
            
            // 캐시 정리
            if (this.renderer) {
                this.renderer.clearCache();
            }
            this.dataManager.clear();
            
            // 상태 초기화
            this.isInitialized = false;
            this.isDetailMode = false;
            this.currentLogId = null;
            this.renderQueue = [];
            this.isRendering = false;
            this.container = null;
            this.selectedDate = null;
            
            // 정리 완료 로그 제거 (성능 최적화)
        } catch (error) {
            console.error('캘린더 탭 정리 중 오류 발생:', error);
        }
    }
    
    /**
     * 날짜 피커 모달 표시
     */
    showDatePicker() {
        if (this.datePickerModal) {
            this.datePickerModal.show();
        }
    }
    /**
     * 성능 최적화: 배치 렌더링
     * @param {Array} items - 렌더링할 아이템 배열
     * @param {Function} renderFunction - 렌더링 함수
     */
    batchRender(items, renderFunction) {
        if (this.isRendering) {
            this.renderQueue.push({ items, renderFunction });
            return;
        }
        
        this.isRendering = true;
        const fragment = document.createDocumentFragment();
        
        // 배치 처리
        items.forEach(item => {
            const element = renderFunction(item);
            if (element) {
                fragment.appendChild(element);
            }
        });
        
        // DOM에 한 번에 추가
        requestAnimationFrame(() => {
            this.container.appendChild(fragment);
            this.isRendering = false;
            
            // 대기 중인 렌더링 작업 처리
            if (this.renderQueue.length > 0) {
                const next = this.renderQueue.shift();
                this.batchRender(next.items, next.renderFunction);
            }
        });
    }
    
    
    /**
     * 외부에서 호출 가능한 메서드들 (향후 확장)
     */
    
    /**
     * 특정 날짜로 이동
     * @param {Date} date - 이동할 날짜
     */
    goToDate(date) {
        this.currentDate = new Date(date);
        this.refreshCalendar();
    }
    
    /**
     * 여행 로그 데이터 업데이트 (향후 API 연동)
     * @param {Array} logs - 여행 로그 배열
     */
    updateTravelLogs(logs) {
        this.dataManager.updateTravelLogs(logs);
        this.refreshCalendar();
    }
    
    /**
     * 현재 선택된 날짜 반환
     * @returns {Date|null} 선택된 날짜
     */
    getSelectedDate() {
        return this.selectedDate;
    }
    
    /**
     * 현재 뷰 모드 반환
     * @returns {string} 'month' | 'week'
     */
    getCurrentView() {
        return this.currentView;
    }
}

export default new CalendarTab();