/**
 * ScrollManager - 스크롤 이벤트 관리 유틸리티
 * 
 * 🎯 책임:
 * - 스크롤 위치 저장 및 복원
 * - 스크롤 이벤트 차단 및 복원
 * - 스크롤 상태 관리
 * 
 * @class ScrollManager
 * @version 1.0.0
 * @since 2024-12-29
 */
class ScrollManager {
    constructor() {
        this.scrollPosition = undefined;
        this.handlers = {
            scroll: null,
            wheel: null,
            touchmove: null,
            keydown: null
        };
        this.isScrollBlocked = false;
    }

    /**
     * 현재 스크롤 위치를 저장합니다
     * @param {HTMLElement} container - 스크롤 컨테이너 (선택사항)
     */
    saveScrollPosition(container = null) {
        if (container) {
            this.scrollPosition = container.scrollTop;
        } else {
            this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        }
    }

    /**
     * 저장된 스크롤 위치를 복원합니다
     * @param {HTMLElement} container - 스크롤 컨테이너 (선택사항)
     */
    restoreScrollPosition(container = null) {
        if (this.scrollPosition === undefined) return;

        if (container) {
            // 약간의 지연 후 스크롤 위치 복원 (레이아웃 안정화 후)
            requestAnimationFrame(() => {
                container.scrollTop = this.scrollPosition;
            });
        } else {
            window.scrollTo(0, this.scrollPosition);
        }
        
        this.scrollPosition = undefined;
    }

    /**
     * 스크롤 이벤트를 차단합니다
     * @param {HTMLElement} container - 스크롤 컨테이너 (선택사항)
     */
    preventScroll(container = null) {
        if (this.isScrollBlocked) return;

        // 스크롤 이벤트 차단 함수들
        this.handlers.scroll = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        this.handlers.wheel = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        this.handlers.touchmove = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        this.handlers.keydown = (e) => {
            const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40]; // 스페이스, Page Up/Down, Home, End, 방향키
            if (scrollKeys.includes(e.keyCode)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        // 이벤트 리스너 등록
        document.addEventListener('scroll', this.handlers.scroll, { passive: false, capture: true });
        document.addEventListener('wheel', this.handlers.wheel, { passive: false, capture: true });
        document.addEventListener('touchmove', this.handlers.touchmove, { passive: false, capture: true });
        document.addEventListener('keydown', this.handlers.keydown, { passive: false, capture: true });

        // 컨테이너가 있는 경우 해당 컨테이너에도 적용
        if (container) {
            container.addEventListener('scroll', this.handlers.scroll, { passive: false, capture: true });
            container.addEventListener('wheel', this.handlers.wheel, { passive: false, capture: true });
            container.addEventListener('touchmove', this.handlers.touchmove, { passive: false, capture: true });
        }

        this.isScrollBlocked = true;
    }

    /**
     * 스크롤 이벤트 차단을 해제합니다
     * @param {HTMLElement} container - 스크롤 컨테이너 (선택사항)
     */
    restoreScroll(container = null) {
        if (!this.isScrollBlocked) return;

        // 이벤트 리스너 제거
        if (this.handlers.scroll) {
            document.removeEventListener('scroll', this.handlers.scroll, { capture: true });
            document.removeEventListener('wheel', this.handlers.wheel, { capture: true });
            document.removeEventListener('touchmove', this.handlers.touchmove, { capture: true });
            document.removeEventListener('keydown', this.handlers.keydown, { capture: true });

            // 컨테이너가 있는 경우 해당 컨테이너에서도 제거
            if (container) {
                container.removeEventListener('scroll', this.handlers.scroll, { capture: true });
                container.removeEventListener('wheel', this.handlers.wheel, { capture: true });
                container.removeEventListener('touchmove', this.handlers.touchmove, { capture: true });
            }
        }

        // 핸들러 정리
        this.handlers = {
            scroll: null,
            wheel: null,
            touchmove: null,
            keydown: null
        };

        this.isScrollBlocked = false;
    }

    /**
     * 스크롤 위치를 CSS 변수로 설정합니다 (시각적 위치 유지용)
     * @param {HTMLElement} container - 스크롤 컨테이너
     */
    setScrollOffset(container) {
        if (container && this.scrollPosition !== undefined) {
            container.style.setProperty('--scroll-offset', `-${this.scrollPosition}px`);
        }
    }

    /**
     * CSS 변수로 설정된 스크롤 오프셋을 제거합니다
     * @param {HTMLElement} container - 스크롤 컨테이너
     */
    removeScrollOffset(container) {
        if (container) {
            container.style.removeProperty('--scroll-offset');
        }
    }

    /**
     * 스크롤 상태를 초기화합니다
     */
    reset() {
        this.scrollPosition = undefined;
        this.restoreScroll();
    }

    /**
     * 현재 스크롤 차단 상태를 반환합니다
     * @returns {boolean} 스크롤이 차단되어 있는지 여부
     */
    isScrollPrevented() {
        return this.isScrollBlocked;
    }

    /**
     * ScrollManager를 정리합니다
     */
    cleanup() {
        this.reset();
    }
}

export { ScrollManager };
