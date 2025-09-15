/**
 * HeatmapRenderer - 히트맵 렌더링 모듈
 * 
 * 🎯 책임:
 * - 히트맵 UI 렌더링 및 업데이트
 * - 월별 여행 활동 데이터 계산
 * - 히트맵 이벤트 처리
 * - 연도별 데이터 필터링
 * 
 * @class HeatmapRenderer
 * @version 1.0.0
 * @since 2024-12-29
 */
import { EventManager } from '../../utils/event-manager.js';

class HeatmapRenderer {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
        this.currentYear = '2025';
    }

    /**
     * 히트맵을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    render(container) {
        try {
            this.container = container;
            
            if (!container) {
                console.warn('HeatmapRenderer: 컨테이너가 제공되지 않았습니다.');
                return;
            }

            // 연도 선택기를 동적으로 생성합니다
            this.renderYearSelector();
            
            // 사용 가능한 연도 중 첫 번째(최신) 연도로 히트맵을 렌더링합니다
            const availableYears = this.controller.getAvailableYears();
            const defaultYear = availableYears.length > 0 ? availableYears[0] : '2025';
            this.updateHeatmap(defaultYear);
            this.bindEvents();
            
            console.log('HeatmapRenderer: 히트맵 렌더링 완료');
        } catch (error) {
            console.error('HeatmapRenderer: 렌더링 중 오류:', error);
            this.renderError(container);
        }
    }

    /**
     * 연도 선택기를 렌더링합니다
     */
    renderYearSelector() {
        try {
            const yearSelector = document.getElementById('heatmap-year-selector');
            if (yearSelector) {
                const availableYears = this.controller.getAvailableYears();
                
                // 현재 연도가 유효하지 않거나 목록에 없으면 첫 번째 연도(최신) 선택
                if (!this.currentYear || !availableYears.includes(this.currentYear)) {
                    this.currentYear = availableYears[0];
                }
                
                const options = availableYears.map(year => {
                    const isSelected = year === this.currentYear ? 'selected' : '';
                    return `<option value="${year}" ${isSelected}>${year}년</option>`;
                }).join('');
                
                yearSelector.innerHTML = options;
                console.log('HeatmapRenderer: 연도 선택기 업데이트 완료');
            }
        } catch (error) {
            console.error('HeatmapRenderer: 연도 선택기 렌더링 중 오류:', error);
        }
    }

    /**
     * 히트맵을 업데이트합니다
     * @param {string} year - 선택된 연도
     */
    updateHeatmap(year) {
        try {
            this.currentYear = year;
            
            // 컨트롤러에서 해당 연도의 여행 데이터를 가져옵니다
            const travelData = this.controller.getTravelDataByYear(year);
            
            // 히트맵 그리드를 업데이트합니다
            this.renderHeatmapGrid(travelData, year);
            
            console.log(`${year}년 히트맵 업데이트 완료`);
        } catch (error) {
            console.error('히트맵 업데이트 중 오류:', error);
            this.renderError(this.container);
        }
    }

    /**
     * 히트맵 그리드를 렌더링합니다
     * @param {Object} travelData - 여행 데이터
     * @param {string} year - 연도
     */
    renderHeatmapGrid(travelData, year) {
        if (!this.container) return;

        // 월별 여행 활동 데이터를 계산합니다
        const monthlyActivity = this.calculateMonthlyActivity(travelData, year);
        
        // 해당 연도의 최대 활동 수를 계산하여 상대적 강도 기준을 설정합니다
        const maxActivity = Math.max(...Object.values(monthlyActivity));
        const hasAnyActivity = maxActivity > 0;
        
        console.log(`${year}년 히트맵 데이터:`, monthlyActivity, `최대 활동: ${maxActivity}`);
        
        // 히트맵 그리드를 업데이트합니다
        this.container.innerHTML = Array.from({length: 12}, (_, i) => {
            const month = i + 1;
            const activity = monthlyActivity[month] || 0;
            const activityLevel = this.getActivityLevel(activity, maxActivity, hasAnyActivity);
            
            return `
                <div class="heatmap-month">
                    <div class="month-label">${month}월</div>
                    <div class="month-activity ${activityLevel}" data-month="${month}" data-activity="${activity}">
                        ${activity > 0 ? activity : ''}
                    </div>
                </div>
            `;
        }).join('');

        // 히트맵 아이템에 클릭 이벤트를 추가합니다
        this.bindHeatmapEvents();
    }

    /**
     * 월별 여행 활동을 계산합니다
     * @param {Object} travelData - 여행 데이터
     * @param {string} year - 연도
     * @returns {Object} 월별 활동 데이터
     */
    calculateMonthlyActivity(travelData, year) {
        const monthlyActivity = {};
        
        // 1월부터 12월까지 초기화
        for (let i = 1; i <= 12; i++) {
            monthlyActivity[i] = 0;
        }

        // 여행 데이터가 있는 경우 실제 계산
        if (travelData && travelData.logs) {
            travelData.logs.forEach(log => {
                const logDate = new Date(log.startDate);
                if (logDate.getFullYear() == year) {
                    const month = logDate.getMonth() + 1;
                    monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
                }
            });
        }

        return monthlyActivity;
    }

    /**
     * 활동 수준에 따른 CSS 클래스를 반환합니다 (상대적 강도 기반)
     * @param {number} activity - 활동 수
     * @param {number} maxActivity - 해당 연도의 최대 활동 수
     * @param {boolean} hasAnyActivity - 해당 연도에 활동이 있는지 여부
     * @returns {string} CSS 클래스명
     */
    getActivityLevel(activity, maxActivity = 0, hasAnyActivity = false) {
        if (activity === 0) return 'activity-none';
        
        // 해당 연도에 활동이 없으면 모든 활동을 low로 처리
        if (!hasAnyActivity || maxActivity === 0) return 'activity-low';
        
        // 상대적 강도 계산 (0-1 사이의 값)
        const relativeIntensity = activity / maxActivity;
        
        if (relativeIntensity <= 0.2) return 'activity-low';
        if (relativeIntensity <= 0.4) return 'activity-medium';
        if (relativeIntensity <= 0.7) return 'activity-high';
        return 'activity-very-high';
    }

    /**
     * 히트맵 이벤트를 바인딩합니다
     */
    bindEvents() {
        // 연도 선택기 변경
        const yearSelector = document.getElementById('heatmap-year-selector');
        if (yearSelector) {
            this.eventManager.add(yearSelector, 'change', (e) => {
                this.onYearSelectorChange(e.target.value);
            });
        }
    }

    /**
     * 히트맵 아이템 이벤트를 바인딩합니다
     */
    bindHeatmapEvents() {
        if (!this.container) return;
        
        const heatmapItems = this.container.querySelectorAll('.month-activity');
        heatmapItems.forEach(item => {
            this.eventManager.add(item, 'click', (e) => {
                const month = e.currentTarget.dataset.month;
                const activity = e.currentTarget.dataset.activity;
                this.onHeatmapItemClick(month, activity);
            });
        });
    }

    /**
     * 연도 선택기 변경
     * @param {string} selectedYear - 선택된 연도
     */
    onYearSelectorChange(selectedYear) {
        console.log(`히트맵 연도 변경: ${selectedYear}년`);
        this.updateHeatmap(selectedYear);
    }

    /**
     * 히트맵 아이템 클릭
     * @param {string} month - 월
     * @param {string} activity - 활동 수
     */
    onHeatmapItemClick(month, activity) {
        // 이벤트를 상위로 전달 (TravelReportView에서 처리)
        if (this.container && this.container.parentNode) {
            const event = new CustomEvent('heatmapItemClick', {
                detail: { month, activity, year: this.currentYear }
            });
            this.container.parentNode.dispatchEvent(event);
        }
    }

    /**
     * 에러 상태를 렌더링합니다
     * @param {HTMLElement} container - 컨테이너
     */
    renderError(container) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="heatmap-error">
                <div class="error-icon">⚠️</div>
                <div class="error-message">히트맵 데이터를 불러올 수 없습니다</div>
            </div>
        `;
    }

    /**
     * 히트맵을 새로고침합니다
     */
    refresh() {
        if (this.container) {
            this.updateHeatmap(this.currentYear);
        }
    }

    /**
     * 모듈 정리
     */
    cleanup() {
        if (this.eventManager) {
            this.eventManager.cleanup();
        }
        this.container = null;
    }
}

export { HeatmapRenderer };
