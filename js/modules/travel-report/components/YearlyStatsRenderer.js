/**
 * YearlyStatsRenderer - 연도별 통계 대시보드 렌더링 모듈
 * 
 * 🎯 책임:
 * - 연도별 통계 대시보드 UI 렌더링
 * - 연도 선택기 관리
 * - 전년 대비 증감률 표시
 * - 카운트업 애니메이션 효과
 * 
 * @class YearlyStatsRenderer
 * @version 1.0.0
 * @since 2024-12-29
 */
import { EventManager } from '../../utils/event-manager.js';

class YearlyStatsRenderer {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
        this.currentYear = new Date().getFullYear().toString();
        this.animationTimeouts = [];
    }

    /**
     * 연도별 통계 대시보드를 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    render(container) {
        try {
            this.container = container;
            
            if (!container) {
                console.warn('YearlyStatsRenderer: 컨테이너가 제공되지 않았습니다.');
                return;
            }

            this.renderYearlyStats();
            this.bindEvents();
            
            console.log('YearlyStatsRenderer: 연도별 통계 대시보드 렌더링 완료');
        } catch (error) {
            console.error('YearlyStatsRenderer: 렌더링 중 오류:', error);
            this.renderError(container);
        }
    }

    /**
     * 연도별 통계를 렌더링합니다
     */
    renderYearlyStats() {
        if (!this.container) {
            console.warn('YearlyStatsRenderer: 컨테이너가 없습니다.');
            return;
        }

        console.log('YearlyStatsRenderer: 연도별 통계 렌더링 시작, 연도:', this.currentYear);

        // 연도 선택기 먼저 렌더링
        this.renderYearSelector();
        
        const yearlyStats = this.controller.getYearlyStatsAnalysis(this.currentYear);
        console.log('YearlyStatsRenderer: 연도별 통계 데이터:', yearlyStats);
        
        this.container.innerHTML = this.generateYearlyStatsHTML(yearlyStats);
        
        // 카운트업 애니메이션 실행
        this.animateCountUp();
    }

    /**
     * 연도 선택기를 렌더링합니다
     */
    renderYearSelector() {
        const selectorContainer = document.querySelector('.year-selector-container');
        if (selectorContainer) {
            selectorContainer.innerHTML = this.generateYearSelector();
            // 동적으로 생성된 선택기에 이벤트 바인딩
            this.rebindYearSelectorEvents();
        }
    }

    /**
     * 연도 선택기를 동적으로 생성합니다
     */
    generateYearSelector() {
        const availableYears = this.controller.getAvailableYears();
        
        // 현재 연도가 유효하지 않거나 목록에 없으면 첫 번째 연도(최신) 선택
        if (!this.currentYear || !availableYears.includes(this.currentYear)) {
            this.currentYear = availableYears[0];
        }
        
        const options = availableYears.map(year => {
            const isSelected = year === this.currentYear ? 'selected' : '';
            return `<option value="${year}" ${isSelected}>${year}년</option>`;
        }).join('');
        
        return `
            <select id="yearly-stats-selector" class="year-selector">
                ${options}
            </select>
        `;
    }

    /**
     * 연도별 통계 HTML을 생성합니다
     * @param {Object} yearlyStats - 연도별 통계 데이터
     * @returns {string} HTML 문자열
     */
    generateYearlyStatsHTML(yearlyStats) {
        const stats = yearlyStats.currentStats;
        const changes = yearlyStats.changes;
        
        return `
            <div class="yearly-stats-grid">
                <div class="yearly-stat-card">
                    <div class="stat-icon">✈️</div>
                    <div class="stat-content">
                        <div class="stat-label">총 여행 횟수</div>
                        <div class="stat-value" data-target="${stats.totalTrips}">0</div>
                        <div class="stat-change ${changes.totalTrips.type}">
                            ${this.getChangeIcon(changes.totalTrips.type)} ${changes.totalTrips.display}
                        </div>
                    </div>
                </div>
                
                <div class="yearly-stat-card">
                    <div class="stat-icon">🌍</div>
                    <div class="stat-content">
                        <div class="stat-label">방문한 국가</div>
                        <div class="stat-value" data-target="${stats.uniqueCountries}">0</div>
                        <div class="stat-change ${changes.uniqueCountries.type}">
                            ${this.getChangeIcon(changes.uniqueCountries.type)} ${changes.uniqueCountries.display}
                        </div>
                    </div>
                </div>
                
                <div class="yearly-stat-card">
                    <div class="stat-icon">🏙️</div>
                    <div class="stat-content">
                        <div class="stat-label">방문한 도시</div>
                        <div class="stat-value" data-target="${stats.uniqueCities}">0</div>
                        <div class="stat-change ${changes.uniqueCities.type}">
                            ${this.getChangeIcon(changes.uniqueCities.type)} ${changes.uniqueCities.display}
                        </div>
                    </div>
                </div>
                
                <div class="yearly-stat-card">
                    <div class="stat-icon">📅</div>
                    <div class="stat-content">
                        <div class="stat-label">총 여행 일수</div>
                        <div class="stat-value" data-target="${stats.totalTravelDays}">0</div>
                        <div class="stat-change ${changes.totalTravelDays.type}">
                            ${this.getChangeIcon(changes.totalTravelDays.type)} ${changes.totalTravelDays.display}
                        </div>
                    </div>
                </div>
                
                <div class="yearly-stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-content">
                        <div class="stat-label">평균 여행 일수</div>
                        <div class="stat-value" data-target="${stats.averageTravelDays}">0</div>
                        <div class="stat-change ${changes.averageTravelDays.type}">
                            ${this.getChangeIcon(changes.averageTravelDays.type)} ${changes.averageTravelDays.display}
                        </div>
                    </div>
                </div>
                
                <div class="yearly-stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-content">
                        <div class="stat-label">평균 별점</div>
                        <div class="stat-value" data-target="${stats.averageRating}">0</div>
                        <div class="stat-change ${changes.averageRating.type}">
                            ${this.getChangeIcon(changes.averageRating.type)} ${changes.averageRating.display}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 증감 타입에 따른 아이콘을 반환합니다
     * @param {string} type - 증감 타입
     * @returns {string} 아이콘 문자열
     */
    getChangeIcon(type) {
        switch (type) {
            case 'positive': return '📈';
            case 'negative': return '📉';
            case 'neutral': return '➡️';
            case 'first': return '🆕';
            default: return '➡️';
        }
    }

    /**
     * 카운트업 애니메이션을 실행합니다
     */
    animateCountUp() {
        if (!this.container) return;

        const statValues = this.container.querySelectorAll('.stat-value[data-target]');
        
        statValues.forEach(element => {
            const target = parseFloat(element.dataset.target);
            const duration = 1500; // 1.5초
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // easeOutCubic 함수 적용
                const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(target * easeOutCubic * 10) / 10;
                
                element.textContent = current;
                
                if (progress < 1) {
                    this.animationTimeouts.push(requestAnimationFrame(animate));
                }
            };
            
            this.animationTimeouts.push(requestAnimationFrame(animate));
        });
    }

    /**
     * 연도 선택기 이벤트를 바인딩합니다
     */
    bindEvents() {
        if (!this.container) return;

        // 연도 선택기 변경 - 상위 컨테이너에서 찾기
        const yearSelector = document.querySelector('#yearly-stats-selector');
        if (yearSelector) {
            this.eventManager.add(yearSelector, 'change', (e) => {
                this.onYearChange(e.target.value);
            });
        }
    }

    /**
     * 연도 선택기 이벤트를 다시 바인딩합니다 (동적 생성 후)
     */
    rebindYearSelectorEvents() {
        const yearSelector = document.querySelector('#yearly-stats-selector');
        if (yearSelector) {
            // 기존 이벤트 제거
            this.eventManager.remove(yearSelector, 'change');
            // 새 이벤트 바인딩
            this.eventManager.add(yearSelector, 'change', (e) => {
                this.onYearChange(e.target.value);
            });
        }
    }

    /**
     * 연도 변경 처리
     * @param {string} selectedYear - 선택된 연도
     */
    onYearChange(selectedYear) {
        console.log(`연도별 통계 연도 변경: ${selectedYear}년`);
        this.currentYear = selectedYear;
        
        // 기존 애니메이션 정리
        this.clearAnimations();
        
        // 약간의 지연 후 새로운 통계 렌더링 (DOM 업데이트 완료 대기)
        setTimeout(() => {
            this.renderYearlyStats();
        }, 50);
    }

    /**
     * 애니메이션을 정리합니다
     */
    clearAnimations() {
        this.animationTimeouts.forEach(timeout => {
            cancelAnimationFrame(timeout);
        });
        this.animationTimeouts = [];
    }

    /**
     * 에러 상태를 렌더링합니다
     * @param {HTMLElement} container - 컨테이너
     */
    renderError(container) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="yearly-stats-error">
                <div class="error-icon">⚠️</div>
                <div class="error-message">연도별 통계 데이터를 불러올 수 없습니다</div>
            </div>
        `;
    }

    /**
     * 연도별 통계를 새로고침합니다
     */
    refresh() {
        if (this.container) {
            this.renderYearlyStats();
        }
    }

    /**
     * 모듈 정리
     */
    cleanup() {
        this.clearAnimations();
        
        if (this.eventManager) {
            this.eventManager.cleanup();
        }
        this.container = null;
    }
}

export { YearlyStatsRenderer };
