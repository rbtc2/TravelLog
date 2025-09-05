/**
 * 키보드 네비게이션 핸들러
 * 접근성을 위한 키보드 네비게이션 전용 처리
 */

export class KeyboardNavigationHandler {
    constructor(calendarTab) {
        this.calendarTab = calendarTab;
    }

    /**
     * 키보드 네비게이션 처리 (접근성 향상)
     * @param {KeyboardEvent} e - 키보드 이벤트
     */
    handleKeyboardNavigation(e) {
        if (!this.calendarTab.isInitialized) return;
        
        // 모달이 열려있으면 모달 내부 키보드 네비게이션 처리
        const datePickerModal = document.querySelector('.date-picker-modal');
        if (datePickerModal && datePickerModal.classList.contains('show')) {
            this.handleModalKeyboardNavigation(e);
            return;
        }
        
        // 툴팁이 표시된 상태에서 ESC 키 처리
        if (e.key === 'Escape' && this.calendarTab.tooltipHandler && this.calendarTab.tooltipHandler.currentTooltip) {
            e.preventDefault();
            this.calendarTab.hideTooltip();
            return;
        }
        
        // 여행 로그 표시기에서 키보드 네비게이션
        const activeIndicator = document.activeElement.closest('.travel-log-indicator, .travel-log-more');
        if (activeIndicator) {
            this.handleIndicatorKeyboardNavigation(e, activeIndicator);
            return;
        }
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.calendarTab.handleNavigation('prev');
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.calendarTab.handleNavigation('next');
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.calendarTab.handleNavigation('prev');
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.calendarTab.handleNavigation('next');
                break;
            case 'Home':
                e.preventDefault();
                this.calendarTab.handleNavigation('today');
                break;
            case 'Escape':
                this.calendarTab.selectedDate = null;
                this.calendarTab.hideTooltip();
                this.calendarTab.refreshCalendar();
                break;
            case 'Enter':
            case ' ':
                // 날짜 피커 트리거에 포커스가 있을 때
                if (document.activeElement && document.activeElement.classList.contains('date-picker-trigger')) {
                    e.preventDefault();
                    this.calendarTab.showDatePicker();
                }
                break;
        }
    }

    /**
     * 여행 로그 표시기 키보드 네비게이션
     * @param {KeyboardEvent} e - 키보드 이벤트
     * @param {HTMLElement} indicator - 현재 포커스된 표시기
     */
    handleIndicatorKeyboardNavigation(e, indicator) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.calendarTab.handleIndicatorClick(indicator);
                break;
            case 'Escape':
                e.preventDefault();
                indicator.blur();
                this.calendarTab.hideTooltip();
                break;
            case 'Tab':
                // 기본 탭 동작 허용
                break;
        }
    }

    /**
     * 모달 내부 키보드 네비게이션 처리
     * @param {KeyboardEvent} e - 키보드 이벤트
     */
    handleModalKeyboardNavigation(e) {
        const modal = document.querySelector('.date-picker-modal');
        if (!modal) return;
        
        const focusableElements = modal.querySelectorAll(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        switch (e.key) {
            case 'Tab':
                if (e.shiftKey) {
                    // Shift + Tab: 역방향 탭
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab: 순방향 탭
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                const closeBtn = modal.querySelector('#date-picker-close');
                if (closeBtn) closeBtn.click();
                break;
                
            case 'Enter':
            case ' ':
                // 현재 포커스된 요소가 버튼이면 클릭
                if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
                    e.preventDefault();
                    document.activeElement.click();
                }
                break;
                
            case 'ArrowLeft':
                // 연도 이전 버튼
                e.preventDefault();
                const yearPrevBtn = modal.querySelector('#year-prev');
                if (yearPrevBtn) yearPrevBtn.click();
                break;
                
            case 'ArrowRight':
                // 연도 다음 버튼
                e.preventDefault();
                const yearNextBtn = modal.querySelector('#year-next');
                if (yearNextBtn) yearNextBtn.click();
                break;
        }
    }
}
