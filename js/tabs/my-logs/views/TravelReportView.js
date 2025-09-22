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
        // 트래블 리포트 뷰 CSS 네임스페이스 클래스 추가
        this.container.classList.add('travel-report-view');
        this.stateManager.setLoading(true);
        
        try {
            // 1. 기본 HTML 구조 렌더링
            this.container.innerHTML = this.htmlRenderer.getTravelReportHTML();
            
            // 2. 각 섹션 렌더링
            await this.renderAllSections();
            
            // 3. 의존성 검증 (HTML 렌더링 후)
            this.stateManager.validateDependencies();
            
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
     * 모든 섹션을 렌더링합니다 (중앙 집중식 데이터 관리)
     */
    async renderAllSections() {
        try {
            // 1. 데이터를 한 번만 로드 (메모리 효율성)
            const sharedData = await this.loadSharedData();
            
            // 2. 각 섹션을 순차적으로 렌더링 (데이터 공유)
            await this.renderWorldExploration(sharedData);
            await this.renderBasicStats(sharedData);
            await this.renderTravelDNA(sharedData);
            await this.renderYearlyStats(sharedData);
            await this.renderInitialHeatmap(sharedData);
            await this.renderCharts(sharedData);
            await this.renderInsights(sharedData);
            
        } catch (error) {
            console.error('TravelReportView: 섹션 렌더링 중 오류:', error);
            throw error;
        }
    }

    /**
     * 공유 데이터를 로드합니다 (한 번만 로드하여 메모리 효율성 확보)
     * @returns {Object} 공유 데이터 객체
     */
    async loadSharedData() {
        try {
            const logs = this.controller.getAllLogs();
            
            // 기본 통계 계산 (한 번만)
            const basicStats = this.calculateBasicStats(logs);
            
            // 연도별 통계 계산 (한 번만)
            const currentYear = new Date().getFullYear().toString();
            const yearlyStats = this.controller.getYearlyStatsAnalysis(currentYear);
            
            return {
                logs: logs,
                basicStats: basicStats,
                yearlyStats: yearlyStats,
                currentYear: currentYear
            };
        } catch (error) {
            console.error('TravelReportView: 공유 데이터 로드 실패:', error);
            return {
                logs: [],
                basicStats: this.getEmptyBasicStats(),
                yearlyStats: { currentStats: this.getEmptyYearlyStats() },
                currentYear: new Date().getFullYear().toString()
            };
        }
    }

    /**
     * 기본 통계를 계산합니다 (중복 계산 방지)
     * @param {Array} logs - 여행 로그 배열
     * @returns {Object} 기본 통계
     */
    calculateBasicStats(logs) {
        if (!logs || logs.length === 0) {
            return this.getEmptyBasicStats();
        }

        // 국가 수 계산
        const uniqueCountries = new Set(logs.map(log => log.country)).size;
        
        // 도시 수 계산
        const uniqueCities = new Set(logs.map(log => log.city)).size;
        
        // 총 여행 일수 계산 (InsightsRenderer와 동일한 로직)
        const totalDays = this.calculateTotalTravelDays(logs);
        
        // 평균 만족도 계산
        const ratings = logs.map(log => log.rating || 0).filter(rating => rating > 0);
        const averageRating = ratings.length > 0 ? 
            ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

        return {
            totalTrips: logs.length,
            uniqueCountries: uniqueCountries,
            uniqueCities: uniqueCities,
            totalTravelDays: totalDays,
            averageRating: averageRating
        };
    }

    /**
     * 총 여행 일수를 계산합니다 (InsightsRenderer와 동일한 로직)
     * @param {Array} logs - 여행 로그 배열
     * @returns {number} 총 여행 일수
     */
    calculateTotalTravelDays(logs) {
        if (!logs || logs.length === 0) return 0;
        
        return logs.reduce((total, log) => {
            // days 필드가 있으면 사용, 없으면 계산
            if (log.days && typeof log.days === 'number') {
                return total + log.days;
            }
            
            // startDate와 endDate로 계산 (시작일과 종료일 포함)
            if (log.startDate && log.endDate) {
                const start = new Date(log.startDate);
                const end = new Date(log.endDate);
                
                // 유효한 날짜인지 확인
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    return total;
                }
                
                // 시작일과 종료일 포함하여 계산
                const diffTime = end.getTime() - start.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                return total + (diffDays > 0 ? diffDays : 0);
            }
            
            return total;
        }, 0);
    }

    /**
     * 빈 기본 통계를 반환합니다
     * @returns {Object} 빈 기본 통계
     */
    getEmptyBasicStats() {
        return {
            totalTrips: 0,
            uniqueCountries: 0,
            uniqueCities: 0,
            totalTravelDays: 0,
            averageRating: 0
        };
    }

    /**
     * 빈 연도별 통계를 반환합니다
     * @returns {Object} 빈 연도별 통계
     */
    getEmptyYearlyStats() {
        return {
            totalTrips: 0,
            uniqueCountries: 0,
            uniqueCities: 0,
            totalTravelDays: 0,
            averageTravelDays: 0,
            averageRating: 0
        };
    }

    /**
     * 전세계 탐험 현황을 렌더링합니다
     * @param {Object} sharedData - 공유 데이터
     */
    async renderWorldExploration(sharedData) {
        const container = this.container.querySelector('#world-exploration-section');
        if (container) {
            await this.worldExplorationRenderer.render(container, sharedData);
        }
    }

    /**
     * 기본 통계를 렌더링합니다
     * @param {Object} sharedData - 공유 데이터
     */
    async renderBasicStats(sharedData) {
        const container = this.container.querySelector('#basic-stats-grid');
        if (container) {
            await this.basicStatsRenderer.render(container, sharedData);
        }
    }

    /**
     * 여행 DNA를 렌더링합니다
     * @param {Object} sharedData - 공유 데이터
     */
    async renderTravelDNA(sharedData) {
        const container = this.container.querySelector('.travel-dna-section .dna-content');
        if (container) {
            await this.travelDNARenderer.render(container, sharedData);
        }
    }

    /**
     * 연도별 통계를 렌더링합니다
     * @param {Object} sharedData - 공유 데이터
     */
    async renderYearlyStats(sharedData) {
        const container = this.container.querySelector('#yearly-stats-content');
        if (container) {
            await this.yearlyStatsRenderer.render(container, sharedData);
        }
    }

    /**
     * 히트맵을 렌더링합니다
     * @param {Object} sharedData - 공유 데이터
     */
    async renderInitialHeatmap(sharedData) {
        const container = this.container.querySelector('#heatmap-grid');
        if (container) {
            await this.heatmapRenderer.render(container, sharedData);
        }
    }

    /**
     * 차트를 렌더링합니다
     * @param {Object} sharedData - 공유 데이터
     */
    async renderCharts(sharedData) {
        const container = this.container.querySelector('#chart-content');
        if (container) {
            await this.chartRenderer.render(container, sharedData);
        }
    }

    /**
     * 인사이트를 렌더링합니다
     * @param {Object} sharedData - 공유 데이터
     */
    async renderInsights(sharedData) {
        const container = this.container.querySelector('#insights-content');
        if (container) {
            await this.insightsRenderer.render(container, sharedData);
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
