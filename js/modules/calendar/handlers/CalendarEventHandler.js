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
