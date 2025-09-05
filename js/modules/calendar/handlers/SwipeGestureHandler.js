/**
 * 스와이프 제스처 핸들러
 * 모바일 터치 제스처 전용 처리
 */

import { addEventListener } from '../CalendarUtils.js';

export class SwipeGestureHandler {
    constructor(calendarTab) {
        this.calendarTab = calendarTab;
        this.eventListeners = [];
    }

    /**
     * 스와이프 제스처 바인딩
     */
    bindSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        const handleTouchStart = (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        };
        
        const handleTouchEnd = (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            this.handleSwipeGesture(startX, startY, endX, endY);
        };
        
        // 터치 이벤트 리스너 (passive로 성능 최적화)
        addEventListener(this.calendarTab.container, 'touchstart', handleTouchStart, { passive: true }, this.eventListeners);
        addEventListener(this.calendarTab.container, 'touchend', handleTouchEnd, { passive: true }, this.eventListeners);
    }

    /**
     * 스와이프 제스처 처리
     */
    handleSwipeGesture(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        
        // 수평 스와이프가 수직 스와이프보다 클 때만 처리
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // 오른쪽 스와이프 - 이전 달
                this.calendarTab.handleNavigation('prev');
            } else {
                // 왼쪽 스와이프 - 다음 달
                this.calendarTab.handleNavigation('next');
            }
        }
    }

    /**
     * 스와이프 핸들러 정리
     */
    cleanup() {
        // 이벤트 리스너는 CalendarEventHandler에서 관리되므로 여기서는 별도 정리 불필요
    }
}
