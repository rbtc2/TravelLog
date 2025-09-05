/**
 * 툴팁 핸들러
 * 툴팁 표시, 숨김, 이벤트 관리 전용
 */

import { addEventListener, getCountryFlag, getCountryInfo } from '../CalendarUtils.js';

export class TooltipHandler {
    constructor(calendarTab) {
        this.calendarTab = calendarTab;
        this.eventListeners = [];
        this.tooltipTimeout = null;
        this.currentTooltip = null;
    }

    /**
     * 툴팁 이벤트 바인딩
     */
    bindTooltipEvents() {
        let currentIndicator = null;
        let hideTimeout = null;
        
        // 마우스 오버 이벤트 (디바운싱 적용)
        const mouseOverHandler = (e) => {
            const indicator = e.target.closest('.travel-log-indicator, .travel-log-more');
            if (!indicator) return;
            
            // 같은 요소에 마우스가 들어온 경우 무시
            if (currentIndicator === indicator) return;
            
            // 기존 타이머들 모두 취소
            if (this.tooltipTimeout) {
                clearTimeout(this.tooltipTimeout);
                this.tooltipTimeout = null;
            }
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            
            currentIndicator = indicator;
            
            // 디바운싱 적용 (150ms 지연)
            this.tooltipTimeout = setTimeout(() => {
                if (currentIndicator === indicator) {
                    this.showTooltip(indicator, e);
                }
            }, 150);
        };
        
        // 마우스 아웃 이벤트
        const mouseOutHandler = (e) => {
            const indicator = e.target.closest('.travel-log-indicator, .travel-log-more');
            if (!indicator) return;
            
            // 툴팁 자체로 마우스가 이동한 경우 무시
            if (e.relatedTarget && e.relatedTarget.closest('.calendar-tooltip')) {
                return;
            }
            
            // 다른 표시기로 이동한 경우 무시
            if (e.relatedTarget && e.relatedTarget.closest('.travel-log-indicator, .travel-log-more')) {
                return;
            }
            
            // 디바운싱 취소
            if (this.tooltipTimeout) {
                clearTimeout(this.tooltipTimeout);
                this.tooltipTimeout = null;
            }
            
            currentIndicator = null;
            
            // 툴팁 숨기기 (즉시)
            this.hideTooltip();
        };
        
        // 포커스 이벤트 (키보드 접근성)
        const focusHandler = (e) => {
            const indicator = e.target.closest('.travel-log-indicator, .travel-log-more');
            if (!indicator) return;
            
            // 기존 타이머들 모두 취소
            if (this.tooltipTimeout) {
                clearTimeout(this.tooltipTimeout);
                this.tooltipTimeout = null;
            }
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            
            currentIndicator = indicator;
            
            this.tooltipTimeout = setTimeout(() => {
                if (currentIndicator === indicator) {
                    this.showTooltip(indicator, e);
                }
            }, 200);
        };
        
        // 블러 이벤트
        const blurHandler = (e) => {
            // 포커스가 다른 표시기로 이동한 경우 무시
            if (e.relatedTarget && e.relatedTarget.closest('.travel-log-indicator, .travel-log-more')) {
                return;
            }
            
            currentIndicator = null;
            this.hideTooltip();
        };
        
        // 이벤트 리스너 등록
        addEventListener(this.calendarTab.container, 'mouseover', mouseOverHandler, {}, this.eventListeners);
        addEventListener(this.calendarTab.container, 'mouseout', mouseOutHandler, {}, this.eventListeners);
        addEventListener(this.calendarTab.container, 'focusin', focusHandler, {}, this.eventListeners);
        addEventListener(this.calendarTab.container, 'focusout', blurHandler, {}, this.eventListeners);
    }

    /**
     * 툴팁 표시
     * @param {HTMLElement} indicator - 툴팁을 표시할 요소
     * @param {Event} event - 이벤트 객체
     */
    showTooltip(indicator, event) {
        // 기존 툴팁 제거
        this.hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'calendar-tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.setAttribute('aria-live', 'polite');
        
        // 툴팁 내용 생성
        const tooltipContent = this.createTooltipContent(indicator);
        tooltip.innerHTML = tooltipContent;
        
        // 툴팁 위치 계산
        const rect = indicator.getBoundingClientRect();
        const containerRect = this.calendarTab.container.getBoundingClientRect();
        
        // 툴팁 위치 설정
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${rect.left - containerRect.left + (rect.width / 2)}px`;
        tooltip.style.top = `${rect.top - containerRect.top - 10}px`;
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.zIndex = '1000';
        
        // 컨테이너에 추가
        this.calendarTab.container.appendChild(tooltip);
        this.currentTooltip = tooltip;
        
        // 애니메이션 적용
        requestAnimationFrame(() => {
            tooltip.classList.add('show');
        });
    }

    /**
     * 툴팁 내용 생성
     * @param {HTMLElement} indicator - 툴팁을 표시할 요소
     * @returns {string} 툴팁 HTML 내용
     */
    createTooltipContent(indicator) {
        const country = indicator.dataset.country;
        const logId = indicator.dataset.logId;
        const dayOfTrip = indicator.dataset.dayOfTrip;
        const totalDays = indicator.dataset.totalDays;
        
        if (indicator.classList.contains('travel-log-more')) {
            const count = indicator.textContent.replace('+', '');
            return `
                <div class="tooltip-content">
                    <div class="tooltip-title">${count}개 더 보기</div>
                    <div class="tooltip-description">클릭하여 전체 목록 보기</div>
                </div>
            `;
        }
        
        const countryInfo = getCountryInfo(country, this.calendarTab.dataManager.getCountriesManager());
        const countryName = countryInfo ? countryInfo.nameKo : country;
        const flag = getCountryFlag(country, this.calendarTab.dataManager.getCountriesManager());
        
        return `
            <div class="tooltip-content">
                <div class="tooltip-header">
                    <span class="tooltip-flag">${flag}</span>
                    <span class="tooltip-country">${countryName}</span>
                </div>
                <div class="tooltip-details">
                    <div class="tooltip-day">${dayOfTrip}/${totalDays}일차</div>
                    <div class="tooltip-action">클릭하여 상세 보기</div>
                </div>
            </div>
        `;
    }

    /**
     * 툴팁 숨기기
     */
    hideTooltip() {
        if (this.currentTooltip) {
            // 애니메이션 없이 즉시 제거
            if (this.currentTooltip.parentNode) {
                this.currentTooltip.parentNode.removeChild(this.currentTooltip);
            }
            this.currentTooltip = null;
        }
    }

    /**
     * 툴팁 핸들러 정리
     */
    cleanup() {
        this.hideTooltip();
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
            this.tooltipTimeout = null;
        }
    }
}
