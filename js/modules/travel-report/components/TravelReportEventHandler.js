/**
 * TravelReportEventHandler - 트래블 레포트 이벤트 처리 전담
 * 
 * 🎯 책임:
 * - 트래블 레포트 관련 모든 이벤트 처리
 * - 네비게이션 이벤트 처리
 * - 차트 탭 전환 이벤트 처리
 * - 이벤트 바인딩 및 정리
 * 
 * @class TravelReportEventHandler
 * @version 1.0.0
 * @since 2024-12-29
 */
import { EventManager } from '../../utils/event-manager.js';

export class TravelReportEventHandler {
    constructor(controller, callbacks = {}) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
        
        // 콜백 함수들
        this.callbacks = {
            onNavigateBack: callbacks.onNavigateBack || (() => {}),
            onChartTabChange: callbacks.onChartTabChange || (() => {}),
            ...callbacks
        };
    }

    /**
     * 이벤트를 바인딩합니다
     * @param {HTMLElement} container - 이벤트를 바인딩할 컨테이너
     */
    bindEvents(container) {
        this.container = container;
        
        this.bindNavigationEvents();
        this.bindChartTabEvents();
    }

    /**
     * 네비게이션 이벤트를 바인딩합니다
     */
    bindNavigationEvents() {
        const backButton = this.container.querySelector('#back-to-hub-from-report');
        if (backButton) {
            this.eventManager.add(backButton, 'click', this.handleBackNavigation.bind(this));
        }
    }

    /**
     * 차트 탭 이벤트를 바인딩합니다
     */
    bindChartTabEvents() {
        const chartTabs = this.container.querySelectorAll('.chart-tab');
        chartTabs.forEach(tab => {
            this.eventManager.add(tab, 'click', this.handleChartTabClick.bind(this));
        });
    }

    /**
     * 뒤로 가기 버튼 클릭 처리
     * @param {Event} e - 클릭 이벤트
     */
    handleBackNavigation(e) {
        e.preventDefault();
        this.callbacks.onNavigateBack();
    }

    /**
     * 차트 탭 클릭 처리
     * @param {Event} e - 클릭 이벤트
     */
    async handleChartTabClick(e) {
        const clickedTab = e.currentTarget;
        const chartType = clickedTab.dataset.chart;
        
        if (!chartType) return;

        // 모든 탭에서 active 클래스 제거
        const allTabs = this.container.querySelectorAll('.chart-tab');
        allTabs.forEach(tab => tab.classList.remove('active'));
        
        // 클릭된 탭에 active 클래스 추가
        clickedTab.classList.add('active');
        
        // 차트 콘텐츠 업데이트
        await this.updateChartContent(chartType);
        
        // 콜백 호출
        this.callbacks.onChartTabChange(chartType);
    }

    /**
     * 차트 콘텐츠를 업데이트합니다
     * @param {string} chartType - 차트 타입
     */
    async updateChartContent(chartType) {
        const chartContent = this.container.querySelector('#chart-content');
        if (!chartContent) return;

        try {
            const { TravelReportHTMLRenderer } = await import('./TravelReportHTMLRenderer.js');
            const htmlRenderer = new TravelReportHTMLRenderer();
            
            switch (chartType) {
                case 'country-ranking':
                    chartContent.innerHTML = htmlRenderer.getCountryRankingChartHTML();
                    break;
                case 'city-ranking':
                    chartContent.innerHTML = htmlRenderer.getCityRankingChartHTML();
                    break;
                case 'heatmap':
                    chartContent.innerHTML = htmlRenderer.getHeatmapChartHTML();
                    break;
                default:
                    console.warn('알 수 없는 차트 타입:', chartType);
            }
        } catch (error) {
            console.error('차트 콘텐츠 업데이트 오류:', error);
        }
    }

    /**
     * 커스텀 이벤트를 발생시킵니다
     * @param {string} eventName - 이벤트 이름
     * @param {Object} detail - 이벤트 상세 정보
     */
    dispatchEvent(eventName, detail) {
        if (this.container) {
            const event = new CustomEvent(`travelReportEventHandler:${eventName}`, { detail });
            this.container.dispatchEvent(event);
        }
    }

    /**
     * 이벤트 리스너를 추가합니다
     * @param {HTMLElement} element - 이벤트를 바인딩할 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     */
    addEventListener(element, event, handler) {
        this.eventManager.add(element, event, handler);
    }

    /**
     * 이벤트 리스너를 제거합니다
     * @param {HTMLElement} element - 이벤트를 제거할 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     */
    removeEventListener(element, event, handler) {
        this.eventManager.remove(element, event, handler);
    }

    /**
     * 리소스를 정리합니다
     */
    cleanup() {
        this.eventManager.cleanup();
        this.container = null;
    }
}
