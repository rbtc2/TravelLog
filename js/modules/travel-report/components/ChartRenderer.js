/**
 * ChartRenderer - 차트 렌더링 모듈
 * 
 * 🎯 책임:
 * - 차트 섹션 UI 렌더링
 * - 도시 랭킹 표시
 * - 차트 탭 관리
 * - 차트 이벤트 처리
 * 
 * @class ChartRenderer
 * @version 1.0.0
 * @since 2024-12-29
 */
import { EventManager } from '../../utils/event-manager.js';

class ChartRenderer {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
    }

    /**
     * 차트 섹션을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    render(container) {
        try {
            this.container = container;
            
            if (!container) {
                console.warn('ChartRenderer: 컨테이너가 제공되지 않았습니다.');
                return;
            }

            this.renderCityRanking();
            this.bindEvents();
            
            console.log('ChartRenderer: 차트 렌더링 완료');
        } catch (error) {
            console.error('ChartRenderer: 렌더링 중 오류:', error);
            this.renderError(container);
        }
    }

    /**
     * 도시 랭킹을 렌더링합니다
     */
    renderCityRanking() {
        if (!this.container) return;

        // 현재는 하드코딩된 데이터를 사용 (향후 실제 데이터로 교체)
        const cityRankingData = this.getCityRankingData();
        
        const cityRankingList = this.container.querySelector('.city-ranking-list');
        if (cityRankingList) {
            cityRankingList.innerHTML = cityRankingData.map((city, index) => `
                <div class="city-ranking-item" data-city="${city.name}">
                    <div class="city-rank">${index + 1}</div>
                    <div class="city-info">
                        <div class="city-name">${city.name}</div>
                        <div class="city-stats">${city.visits}회 방문, 총 ${city.days}일</div>
                    </div>
                    <div class="city-arrow">▶</div>
                </div>
            `).join('');
        }
    }

    /**
     * 도시 랭킹 데이터를 가져옵니다 (임시 하드코딩)
     * @returns {Array} 도시 랭킹 데이터
     */
    getCityRankingData() {
        // 향후 실제 데이터 분석으로 교체 예정
        return [
            { name: '도쿄', visits: 3, days: 21 },
            { name: '파리', visits: 2, days: 12 },
            { name: '방콕', visits: 1, days: 6 },
            { name: '런던', visits: 1, days: 5 },
            { name: '뉴욕', visits: 1, days: 4 }
        ];
    }

    /**
     * 차트 이벤트를 바인딩합니다
     */
    bindEvents() {
        if (!this.container) return;

        // 도시 랭킹 아이템 클릭
        const cityRankingItems = this.container.querySelectorAll('.city-ranking-item');
        cityRankingItems.forEach(item => {
            this.eventManager.add(item, 'click', (e) => {
                const cityName = e.currentTarget.dataset.city;
                this.onCityClick(cityName);
            });
        });
        
        // 차트 탭 클릭 (비활성)
        const chartTabs = this.container.querySelectorAll('.chart-tab');
        chartTabs.forEach(tab => {
            this.eventManager.add(tab, 'click', () => {
                this.onChartTabClick();
            });
        });
    }

    /**
     * 도시 클릭 처리
     * @param {string} cityName - 도시 이름
     */
    onCityClick(cityName) {
        // 이벤트를 상위로 전달 (TravelReportView에서 처리)
        if (this.container && this.container.parentNode) {
            const event = new CustomEvent('cityClick', {
                detail: { cityName }
            });
            this.container.parentNode.dispatchEvent(event);
        }
    }

    /**
     * 차트 탭 클릭 처리
     */
    onChartTabClick() {
        // 이벤트를 상위로 전달 (TravelReportView에서 처리)
        if (this.container && this.container.parentNode) {
            const event = new CustomEvent('chartTabClick', {
                detail: { message: '차트 기능은 준비 중입니다.' }
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
        
        const cityRankingList = container.querySelector('.city-ranking-list');
        if (cityRankingList) {
            cityRankingList.innerHTML = `
                <div class="chart-error">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">차트 데이터를 불러올 수 없습니다</div>
                </div>
            `;
        }
    }

    /**
     * 차트를 새로고침합니다
     */
    refresh() {
        if (this.container) {
            this.render(this.container);
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

export { ChartRenderer };
