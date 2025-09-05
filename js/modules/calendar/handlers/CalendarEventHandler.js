/**
 * 캘린더 이벤트 핸들러 통합 관리 모듈
 * 모든 이벤트 핸들러를 중앙에서 관리하고 조정
 */

import { addEventListener, removeAllEventListeners } from '../CalendarUtils.js';

export class CalendarEventHandler {
    constructor(calendarTab) {
        this.calendarTab = calendarTab;
        this.eventListeners = [];
    }

    /**
     * 모든 이벤트 바인딩
     */
    bindAllEvents() {
        this.bindViewToggleEvents();
        this.bindNavigationEvents();
        this.bindDateSelectionEvents();
        this.bindMinimalCardEvents();
        this.bindDatePickerEvents();
        this.bindKeyboardEvents();
        this.bindResizeEvents();
        this.bindSwipeEvents();
        this.bindTooltipEvents();
    }

    /**
     * 뷰 전환 이벤트 바인딩
     */
    bindViewToggleEvents() {
        const viewToggleHandler = (e) => {
            const viewBtn = e.target.closest('.view-btn');
            if (!viewBtn) return;
            
            const view = viewBtn.dataset.view;
            this.calendarTab.switchView(view);
        };

        addEventListener(this.calendarTab.container, 'click', viewToggleHandler, {}, this.eventListeners);
    }

    /**
     * 날짜 네비게이션 이벤트 바인딩
     */
    bindNavigationEvents() {
        const navigationHandler = (e) => {
            const navBtn = e.target.closest('.nav-btn');
            if (!navBtn) return;
            
            const action = navBtn.dataset.action;
            this.calendarTab.handleNavigation(action);
        };

        addEventListener(this.calendarTab.container, 'click', navigationHandler, {}, this.eventListeners);
    }

    /**
     * 날짜 선택 이벤트 바인딩
     */
    bindDateSelectionEvents() {
        const dayClickHandler = (e) => {
            const dayElement = e.target.closest('.calendar-day');
            if (!dayElement) return;
            
            const dateString = dayElement.dataset.date;
            // 날짜 문자열을 로컬 시간대로 정확히 파싱
            const [year, month, day] = dateString.split('-').map(Number);
            this.calendarTab.selectDate(new Date(year, month - 1, day));
        };

        addEventListener(this.calendarTab.container, 'click', dayClickHandler, {}, this.eventListeners);
    }

    /**
     * 미니멀 카드 클릭 이벤트 바인딩
     */
    bindMinimalCardEvents() {
        const cardClickHandler = (e) => {
            const moreBtn = e.target.closest('.card-more-btn');
            const card = e.target.closest('.minimal-travel-card');
            
            if (moreBtn && card) {
                e.preventDefault();
                e.stopPropagation();
                
                const logId = card.dataset.logId;
                this.handleMoreButtonClick(logId);
            } else if (card) {
                // 카드 전체 클릭 시 상세 정보 표시
                const logId = card.dataset.logId;
                this.handleCardClick(logId);
            }
        };

        addEventListener(this.calendarTab.container, 'click', cardClickHandler, {}, this.eventListeners);
    }

    /**
     * 더보기 버튼 클릭 처리
     * @param {string} logId - 여행 로그 ID
     */
    handleMoreButtonClick(logId) {
        if (!logId) return;
        
        // 여행 로그 상세 정보 모달 표시 또는 상세 페이지로 이동
        console.log('더보기 클릭:', logId);
        // TODO: 상세 정보 모달 또는 페이지 이동 구현
    }

    /**
     * 카드 클릭 처리
     * @param {string} logId - 여행 로그 ID
     */
    handleCardClick(logId) {
        if (!logId) return;
        
        // 카드 클릭 시 추가 정보 표시 또는 선택 상태 변경
        console.log('카드 클릭:', logId);
        // TODO: 카드 선택 상태 변경 또는 추가 정보 표시 구현
    }

    /**
     * 날짜 피커 트리거 이벤트 바인딩
     */
    bindDatePickerEvents() {
        const datePickerHandler = (e) => {
            const trigger = e.target.closest('.date-picker-trigger');
            if (!trigger) return;
            
            this.calendarTab.showDatePicker();
        };

        addEventListener(this.calendarTab.container, 'click', datePickerHandler, {}, this.eventListeners);
    }

    /**
     * 키보드 이벤트 바인딩
     */
    bindKeyboardEvents() {
        const keyboardHandler = (e) => {
            this.calendarTab.handleKeyboardNavigation(e);
        };

        addEventListener(document, 'keydown', keyboardHandler, {}, this.eventListeners);
    }

    /**
     * 윈도우 리사이즈 이벤트 바인딩
     */
    bindResizeEvents() {
        const resizeHandler = () => {
            this.calendarTab.handleResize();
        };

        addEventListener(window, 'resize', resizeHandler, {}, this.eventListeners);
    }

    /**
     * 스와이프 제스처 이벤트 바인딩
     */
    bindSwipeEvents() {
        if (this.calendarTab.swipeHandler) {
            this.calendarTab.swipeHandler.bindSwipeGestures();
        }
    }

    /**
     * 툴팁 이벤트 바인딩
     */
    bindTooltipEvents() {
        if (this.calendarTab.tooltipHandler) {
            this.calendarTab.tooltipHandler.bindTooltipEvents();
        }
    }

    /**
     * 모든 이벤트 리스너 정리
     */
    cleanup() {
        removeAllEventListeners(this.eventListeners);
        this.eventListeners = [];
    }
}
