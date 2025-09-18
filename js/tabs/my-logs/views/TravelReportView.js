/**
 * TravelReportView - 트래블 레포트 오케스트레이터
 * 
 * 🎯 책임:
 * - 트래블 레포트 컴포넌트들 조율
 * - 모듈 간 통신 관리
 * - 전체 렌더링 프로세스 오케스트레이션
 * 
 * @class TravelReportView
 * @version 2.0.0
 * @since 2024-12-29
 */
import { EventManager } from '../../../modules/utils/event-manager.js';
import { BasicStatsRenderer } from '../../../modules/travel-report/components/BasicStatsRenderer.js';
import { TravelDNARenderer } from '../../../modules/travel-report/components/TravelDNARenderer.js';
import { HeatmapRenderer } from '../../../modules/travel-report/components/HeatmapRenderer.js';
import { ChartRenderer } from '../../../modules/travel-report/components/ChartRenderer.js';
import { InsightsRenderer } from '../../../modules/travel-report/components/InsightsRenderer.js';
import { YearlyStatsRenderer } from '../../../modules/travel-report/components/YearlyStatsRenderer.js';
import { WorldExplorationRenderer } from '../../../modules/travel-report/components/WorldExplorationRenderer.js';
import { TravelReportHTMLRenderer } from '../../../modules/travel-report/components/TravelReportHTMLRenderer.js';
import { TravelReportEventHandler } from '../../../modules/travel-report/components/TravelReportEventHandler.js';
import { TravelReportStateManager } from '../../../modules/travel-report/components/TravelReportStateManager.js';

class TravelReportView {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
        
        // 핵심 컴포넌트들
        this.stateManager = new TravelReportStateManager();
        this.htmlRenderer = new TravelReportHTMLRenderer();
        this.eventHandler = new TravelReportEventHandler(controller, {
            onNavigateBack: this.onNavigateBack.bind(this),
            onChartTabChange: this.onChartTabChange.bind(this)
        });
        
        // 렌더러 모듈들
        this.basicStatsRenderer = new BasicStatsRenderer(controller);
        this.travelDNARenderer = new TravelDNARenderer(controller);
        this.heatmapRenderer = new HeatmapRenderer(controller);
        this.chartRenderer = new ChartRenderer(controller);
        this.insightsRenderer = new InsightsRenderer(controller);
        this.yearlyStatsRenderer = new YearlyStatsRenderer(controller);
        this.worldExplorationRenderer = new WorldExplorationRenderer(controller);
    }

    /**
     * 트래블 레포트 화면을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    async render(container) {
        this.container = container;
        this.stateManager.setLoading(true);
        
        try {
            // 1. 기본 HTML 구조 렌더링
            this.container.innerHTML = this.htmlRenderer.getTravelReportHTML();
            
            // 2. 각 섹션 렌더링
            await this.renderAllSections();
            
            // 3. 의존성 검증 (HTML 렌더링 후)
            const isValid = this.stateManager.validateDependencies();
            if (!isValid) {
                console.warn('일부 의존성 검증 실패, 하지만 계속 진행합니다.');
            }
            
            // 4. 이벤트 바인딩
            this.eventHandler.bindEvents(this.container);
            
            // 5. 상태 업데이트
            this.stateManager.setInitialized(true);
            this.stateManager.setLoading(false);
            
        } catch (error) {
            console.error('TravelReportView 렌더링 오류:', error);
            this.stateManager.setError(error);
            this.stateManager.setLoading(false);
        }
    }

    /**
     * 모든 섹션을 렌더링합니다
     */
    async renderAllSections() {
        const renderPromises = [
            this.renderWorldExploration(),
            this.renderBasicStats(),
            this.renderTravelDNA(),
            this.renderYearlyStats(),
            this.renderInitialHeatmap(),
            this.renderCharts(),
            this.renderInsights()
        ];
        
        await Promise.all(renderPromises);
    }

    /**
     * 전세계 탐험 현황을 렌더링합니다
     */
    async renderWorldExploration() {
        const container = this.container.querySelector('#world-exploration-section');
        if (container) {
            await this.worldExplorationRenderer.render(container);
        }
    }

    /**
     * 기본 통계를 렌더링합니다
     */
    async renderBasicStats() {
        const container = this.container.querySelector('#basic-stats-grid');
        if (container) {
            await this.basicStatsRenderer.render(container);
        }
    }

    /**
     * 여행 DNA를 렌더링합니다
     */
    async renderTravelDNA() {
        const container = this.container.querySelector('.travel-dna-section .dna-content');
        if (container) {
            await this.travelDNARenderer.render(container);
        }
    }

    /**
     * 연도별 통계를 렌더링합니다
     */
    async renderYearlyStats() {
        const container = this.container.querySelector('#yearly-stats-content');
        if (container) {
            await this.yearlyStatsRenderer.render(container);
        }
    }

    /**
     * 히트맵을 렌더링합니다
     */
    async renderInitialHeatmap() {
        const container = this.container.querySelector('#heatmap-grid');
        if (container) {
            await this.heatmapRenderer.render(container);
        }
    }

    /**
     * 차트를 렌더링합니다
     */
    async renderCharts() {
        const container = this.container.querySelector('#chart-content');
        if (container) {
            await this.chartRenderer.render(container);
        }
    }

    /**
     * 인사이트를 렌더링합니다
     */
    async renderInsights() {
        const container = this.container.querySelector('#insights-content');
        if (container) {
            await this.insightsRenderer.render(container);
        }
    }

    /**
     * 뒤로 가기 이벤트 처리
     */
    onNavigateBack() {
        this.dispatchEvent('navigate', { view: 'hub' });
    }

    /**
     * 차트 탭 변경 이벤트 처리
     * @param {string} chartType - 차트 타입
     */
    onChartTabChange(chartType) {
        this.stateManager.setCurrentChartTab(chartType);
    }

    /**
     * 커스텀 이벤트를 발생시킵니다
     * @param {string} eventName - 이벤트 이름
     * @param {Object} detail - 이벤트 상세 정보
     */
    dispatchEvent(eventName, detail) {
        if (this.container) {
            const event = new CustomEvent(`travelReportView:${eventName}`, { detail });
            this.container.dispatchEvent(event);
        }
    }









    /**
     * 커스텀 이벤트를 발생시킵니다
     * @param {string} eventName - 이벤트 이름
     * @param {Object} detail - 이벤트 상세 정보
     */
    dispatchEvent(eventName, detail) {
        if (this.container) {
            const event = new CustomEvent(`travelReportView:${eventName}`, { detail });
            this.container.dispatchEvent(event);
        }
    }

    /**
     * View 정리
     */
    cleanup() {
        // 핵심 컴포넌트들 정리
        if (this.stateManager) {
            this.stateManager.cleanup();
        }
        if (this.eventHandler) {
            this.eventHandler.cleanup();
        }
        if (this.worldExplorationRenderer) {
            this.worldExplorationRenderer.cleanup();
        }
        
        // 렌더러 모듈들 정리
        const renderers = [
            'basicStatsRenderer', 'travelDNARenderer', 'heatmapRenderer', 
            'chartRenderer', 'insightsRenderer', 'yearlyStatsRenderer'
        ];
        
        renderers.forEach(rendererName => {
            if (this[rendererName] && this[rendererName].cleanup) {
                this[rendererName].cleanup();
            }
        });
        
        if (this.eventManager) {
            this.eventManager.cleanup();
        }
        
        this.container = null;
    }
}

export { TravelReportView };
