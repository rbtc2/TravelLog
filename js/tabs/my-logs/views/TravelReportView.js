/**
 * TravelReportView - 트래블 레포트 화면 렌더링 및 이벤트 처리
 * 
 * 🎯 책임:
 * - 트래블 레포트 화면 UI 렌더링
 * - 트래블 레포트 화면 이벤트 바인딩
 * - 여행 데이터 분석 및 인사이트 표시
 * 
 * @class TravelReportView
 */
import { EventManager } from '../../../modules/utils/event-manager.js';
import { BasicStatsRenderer } from '../../../modules/travel-report/components/BasicStatsRenderer.js';
import { TravelDNARenderer } from '../../../modules/travel-report/components/TravelDNARenderer.js';
import { HeatmapRenderer } from '../../../modules/travel-report/components/HeatmapRenderer.js';
import { ChartRenderer } from '../../../modules/travel-report/components/ChartRenderer.js';
import { InsightsRenderer } from '../../../modules/travel-report/components/InsightsRenderer.js';
import { YearlyStatsRenderer } from '../../../modules/travel-report/components/YearlyStatsRenderer.js';
import { QuickValidator } from '../../../modules/utils/dependency-validator.js';
import { FeatureManager } from '../../../config/app-config.js';

class TravelReportView {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
        
        // 모듈 인스턴스들
        this.basicStatsRenderer = new BasicStatsRenderer(controller);
        this.travelDNARenderer = new TravelDNARenderer(controller);
        this.heatmapRenderer = new HeatmapRenderer(controller);
        this.chartRenderer = new ChartRenderer(controller);
        this.insightsRenderer = new InsightsRenderer(controller);
        this.yearlyStatsRenderer = new YearlyStatsRenderer(controller);
    }

    /**
     * 트래블 레포트 화면을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    render(container) {
        this.container = container;
        this.container.innerHTML = this.getTravelReportHTML();
        
        // Phase 1: 의존성 검증 추가
        this.validateDependencies();
        
        this.renderWorldExploration();
        this.renderBasicStats();
        this.renderTravelDNA();
        this.renderYearlyStats();
        this.renderInitialHeatmap();
        this.renderCharts();
        this.renderInsights();
        this.bindEvents();
        
        // 렌더링 완료
    }

    /**
     * 의존성을 검증합니다 (Phase 1)
     */
    validateDependencies() {
        // TravelReport 의존성 검증 시작
        
        // 1. 기능 활성화 상태 검증
        const requiredFeatures = ['travelDNA', 'yearlyStats', 'basicStats', 'heatmap', 'charts', 'insights'];
        const inactiveFeatures = requiredFeatures.filter(feature => 
            !FeatureManager.isFeatureActive(feature)
        );
        
        if (inactiveFeatures.length > 0) {
            // 비활성화된 기능들 발견
        }
        
        // 2. HTML 요소 존재 여부 검증
        const requiredElements = [
            '.travel-dna-section',
            '.yearly-stats-section', 
            '.basic-stats-section',
            '.heatmap-section',
            '.charts-section',
            '.insights-section'
        ];
        
        const elementValidation = QuickValidator.checkMultipleElements(requiredElements);
        
        if (!elementValidation.success) {
            console.error('❌ 필수 HTML 요소가 누락되었습니다:', elementValidation.missing);
        }
        
        // 3. 렌더러 인스턴스 검증
        const renderers = [
            { name: 'travelDNARenderer', instance: this.travelDNARenderer },
            { name: 'yearlyStatsRenderer', instance: this.yearlyStatsRenderer },
            { name: 'basicStatsRenderer', instance: this.basicStatsRenderer },
            { name: 'heatmapRenderer', instance: this.heatmapRenderer },
            { name: 'chartRenderer', instance: this.chartRenderer },
            { name: 'insightsRenderer', instance: this.insightsRenderer }
        ];
        
        const missingRenderers = renderers.filter(r => !r.instance);
        if (missingRenderers.length > 0) {
            console.error('❌ 누락된 렌더러들:', missingRenderers.map(r => r.name));
        }
        
        // 4. 전체 검증 결과 요약
        const allValid = inactiveFeatures.length === 0 && elementValidation.success && missingRenderers.length === 0;
        
        if (!allValid) {
            console.error('❌ TravelReport 의존성 검증 실패: 일부 요소에 문제가 있습니다.');
        }
        
        return allValid;
    }

    /**
     * 트래블 레포트 화면 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getTravelReportHTML() {
        return `
            <div class="my-logs-container">
                ${this.getHeaderHTML()}
                ${this.getWorldExplorationSectionHTML()}
                ${this.getBasicStatsSectionHTML()}
                ${this.getTravelDNASectionHTML()}
                ${this.getYearlyStatsSectionHTML()}
                ${this.getHeatmapSectionHTML()}
                ${this.getChartsSectionHTML()}
                ${this.getInsightsSectionHTML()}
            </div>
        `;
    }

    /**
     * 헤더 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getHeaderHTML() {
        return `
            <div class="my-logs-header">
                <div class="header-with-back">
                    <button class="back-btn" id="back-to-hub-from-report">◀ 뒤로</button>
                    <div class="header-content">
                        <h1 class="my-logs-title">📊 트래블 레포트</h1>
                        <p class="my-logs-subtitle">여행 데이터 분석 및 인사이트</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 전세계 탐험 현황 섹션 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getWorldExplorationSectionHTML() {
        return `
            <div class="hub-section world-exploration-section">
                <div class="world-exploration-card" id="world-exploration-card">
                    <!-- 전세계 탐험 현황이 여기에 동적으로 렌더링됩니다 -->
                </div>
            </div>
        `;
    }

    /**
     * 기본 통계 섹션 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getBasicStatsSectionHTML() {
        return `
            <div class="hub-section basic-stats-section">
                <div class="stats-grid" id="basic-stats-grid">
                    <!-- 통계 카드들이 여기에 동적으로 렌더링됩니다 -->
                </div>
            </div>
        `;
    }

    /**
     * 여행 DNA 섹션 HTML을 생성합니다 (기본 DNA 아이템들 포함)
     * @returns {string} HTML 문자열
     */
    getTravelDNASectionHTML() {
        return `
            <div class="hub-section travel-dna-section">
                <div class="section-header">
                    <h2 class="section-title">🧬 나의 여행 DNA</h2>
                </div>
                <div class="dna-content">
                    <div class="dna-item">
                        <div class="dna-icon">🏆</div>
                        <div class="dna-details">
                            <div class="dna-label">최애 국가</div>
                            <div class="dna-value">데이터 분석 중...</div>
                        </div>
                    </div>
                    
                    <div class="dna-item">
                        <div class="dna-icon">🏙️</div>
                        <div class="dna-details">
                            <div class="dna-label">베이스캠프</div>
                            <div class="dna-value">데이터 분석 중...</div>
                        </div>
                    </div>
                    
                    <div class="dna-item">
                        <div class="dna-icon">⏱️</div>
                        <div class="dna-details">
                            <div class="dna-label">여행 스타일</div>
                            <div class="dna-value">데이터 분석 중...</div>
                        </div>
                    </div>
                    
                    <div class="dna-item">
                        <div class="dna-icon">🎯</div>
                        <div class="dna-details">
                            <div class="dna-label">주요 목적</div>
                            <div class="dna-value">데이터 분석 중...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 연도별 통계 섹션 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getYearlyStatsSectionHTML() {
        return `
            <div class="hub-section yearly-stats-section">
                <div class="section-header">
                    <h2 class="section-title">📅 연도별 통계</h2>
                    <div class="year-selector-container">
                        <!-- 연도 선택기가 여기에 동적으로 렌더링됩니다 -->
                    </div>
                </div>
                <div class="yearly-stats-content">
                    <!-- 연도별 통계 카드들이 여기에 동적으로 렌더링됩니다 -->
                </div>
            </div>
        `;
    }

    /**
     * 히트맵 섹션 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getHeatmapSectionHTML() {
        return `
            <div class="hub-section heatmap-section">
                <div class="section-header">
                    <h2 class="section-title">🔥 여행 히트맵</h2>
                </div>
                
                <div class="heatmap-content">
                    <div class="heatmap-controls">
                        <select class="year-selector" id="heatmap-year-selector">
                            <!-- 연도 선택기는 HeatmapRenderer에서 동적으로 생성됩니다 -->
                        </select>
                    </div>
                    <div class="heatmap-container">
                        <div class="heatmap-grid">
                            ${Array.from({length: 12}, (_, i) => `
                                <div class="heatmap-month">
                                    <div class="month-label">${i + 1}월</div>
                                    <div class="month-activity placeholder-box"></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 차트 섹션 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getChartsSectionHTML() {
        return `
            <div class="hub-section charts-section">
                <div class="section-header">
                    <h2 class="section-title">📈 순위/활동 차트</h2>
                </div>
                
                ${this.getCountryRankingChartHTML()}
                ${this.getCityRankingChartHTML()}
            </div>
        `;
    }

    /**
     * 국가별 랭킹 차트 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getCountryRankingChartHTML() {
        return `
            <div class="chart-frame">
                <div class="chart-header">
                    <div class="chart-tabs">
                        <button class="chart-tab disabled" data-tab="visits">방문 횟수</button>
                        <button class="chart-tab disabled" data-tab="duration">체류일 수</button>
                    </div>
                </div>
                <div class="chart-placeholder">
                    <div class="placeholder-text">준비 중</div>
                </div>
            </div>
        `;
    }

    /**
     * 도시별 랭킹 차트 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getCityRankingChartHTML() {
        const cities = [
            { name: '도쿄', visits: 3, days: 21 },
            { name: '파리', visits: 2, days: 12 },
            { name: '방콕', visits: 1, days: 6 },
            { name: '런던', visits: 1, days: 5 },
            { name: '뉴욕', visits: 1, days: 4 }
        ];

        return `
            <div class="chart-frame">
                <div class="chart-header">
                    <h3 class="chart-title">도시별 랭킹 (Top 5)</h3>
                </div>
                <div class="city-ranking-list">
                    ${cities.map((city, index) => `
                        <div class="city-ranking-item" data-city="${city.name}">
                            <div class="city-rank">${index + 1}</div>
                            <div class="city-info">
                                <div class="city-name">${city.name}</div>
                                <div class="city-stats">${city.visits}회 방문, 총 ${city.days}일</div>
                            </div>
                            <div class="city-arrow">▶</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 히트맵 차트 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getHeatmapChartHTML() {
        return `
            <div class="chart-frame">
                <div class="chart-header">
                    <h3 class="chart-title">일정 히트맵</h3>
                    <div class="chart-controls">
                        <select class="year-selector" id="heatmap-year-selector">
                            <!-- 연도 선택기는 HeatmapRenderer에서 동적으로 생성됩니다 -->
                        </select>
                    </div>
                </div>
                <div class="heatmap-placeholder">
                    <div class="heatmap-grid">
                        ${Array.from({length: 12}, (_, i) => `
                            <div class="heatmap-month">
                                <div class="month-label">${i + 1}월</div>
                                <div class="month-activity placeholder-box"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 인사이트 섹션 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getInsightsSectionHTML() {
        return `
            <div class="hub-section insights-section">
                <div class="section-header">
                    <h2 class="section-title">💡 여행 패턴 인사이트</h2>
                </div>
                <div class="insights-content">
                    <!-- 인사이트가 여기에 동적으로 렌더링됩니다 -->
                </div>
            </div>
        `;
    }

    /**
     * 전세계 탐험 현황을 렌더링합니다
     */
    renderWorldExploration() {
        const container = this.container.querySelector('#world-exploration-card');
        if (!container) {
            console.error('TravelReportView: world-exploration-card 컨테이너를 찾을 수 없습니다');
            return;
        }

        try {
            // 컨트롤러에서 전세계 탐험 현황 데이터 가져오기
            const explorationStats = this.controller.getWorldExplorationStats();
            // 전세계 탐험 현황 데이터 로드
            container.innerHTML = this.getWorldExplorationHTML(explorationStats);
        } catch (error) {
            console.error('TravelReportView: 전세계 탐험 현황 렌더링 오류:', error);
            container.innerHTML = this.getWorldExplorationErrorHTML();
        }
    }

    /**
     * 전세계 탐험 현황 HTML을 생성합니다
     * @param {Object} stats - 탐험 현황 통계
     * @returns {string} HTML 문자열
     */
    getWorldExplorationHTML(stats) {
        return `
            <div class="world-exploration-content">
                <div class="exploration-header">
                    <div class="exploration-icon">🌍</div>
                    <div class="exploration-info">
                        <h3 class="exploration-title">전 세계 탐험 현황</h3>
                        <p class="exploration-subtitle">전 세계 ${stats.totalCountries}개국 중 ${stats.visitedCountries}개국 방문</p>
                    </div>
                    <div class="exploration-percentage">${stats.progressPercentage}%</div>
                </div>
                
                <!-- 대륙별 컴팩트 요약 -->
                <div class="continent-summary">
                    ${this.generateContinentSummaryHTML(stats.continentStats)}
                </div>
                
                <div class="exploration-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${stats.progressPercentage}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 대륙별 컴팩트 요약 HTML을 생성합니다
     * @param {Array} continentStats - 대륙별 통계 배열
     * @returns {string} HTML 문자열
     */
    generateContinentSummaryHTML(continentStats) {
        if (!continentStats || continentStats.length === 0) {
            return '<div class="continent-mini">데이터 없음</div>';
        }
        
        return continentStats.map(continent => `
            <div class="continent-mini" data-continent="${continent.continent}">
                <span class="continent-emoji">${continent.emoji}</span>
                <span class="continent-name">${continent.nameKo}</span>
                <span class="continent-count">${continent.visited}/${continent.total}</span>
            </div>
        `).join('');
    }

    /**
     * 전세계 탐험 현황 에러 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getWorldExplorationErrorHTML() {
        return `
            <div class="world-exploration-content error">
                <div class="exploration-header">
                    <div class="exploration-icon">🌍</div>
                    <div class="exploration-info">
                        <h3 class="exploration-title">전 세계 탐험 현황</h3>
                        <p class="exploration-subtitle">데이터를 불러올 수 없습니다</p>
                    </div>
                    <div class="exploration-percentage">--%</div>
                </div>
                <div class="exploration-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 여행 DNA 섹션을 렌더링합니다
     */
    renderTravelDNA() {
        const dnaContent = document.querySelector('.dna-content');
        if (dnaContent) {
            this.travelDNARenderer.render(dnaContent);
        } else {
            console.warn('여행 DNA 컨텐츠를 찾을 수 없습니다.');
        }
    }

    /**
     * 초기 히트맵을 렌더링합니다
     */
    renderInitialHeatmap() {
        const heatmapGrid = document.querySelector('.heatmap-grid');
        if (heatmapGrid) {
            this.heatmapRenderer.render(heatmapGrid);
        } else {
            console.warn('히트맵 그리드를 찾을 수 없습니다.');
        }
    }

    /**
     * 기본 통계 카드를 렌더링합니다
     */
    renderBasicStats() {
        const statsGrid = document.getElementById('basic-stats-grid');
        if (statsGrid) {
            this.basicStatsRenderer.render(statsGrid);
        } else {
            console.warn('기본 통계 그리드를 찾을 수 없습니다.');
        }
    }

    /**
     * 차트 섹션을 렌더링합니다
     */
    renderCharts() {
        const chartsSection = document.querySelector('.charts-section');
        if (chartsSection) {
            this.chartRenderer.render(chartsSection);
        } else {
            console.warn('차트 섹션을 찾을 수 없습니다.');
        }
    }

    /**
     * 인사이트 섹션을 렌더링합니다
     */
    renderInsights() {
        const insightsSection = document.querySelector('.insights-section');
        if (insightsSection) {
            this.insightsRenderer.render(insightsSection);
        } else {
            console.warn('인사이트 섹션을 찾을 수 없습니다.');
        }
    }

    /**
     * 연도별 통계 섹션을 렌더링합니다
     */
    renderYearlyStats() {
        const yearlyStatsContent = document.querySelector('.yearly-stats-content');
        if (yearlyStatsContent) {
            // 연도별 통계 컨텐츠 렌더링
            this.yearlyStatsRenderer.render(yearlyStatsContent);
        } else {
            console.warn('연도별 통계 컨텐츠를 찾을 수 없습니다.');
        }
    }


    /**
     * 트래블 레포트 화면의 이벤트를 바인딩합니다
     */
    bindEvents() {
        // 뒤로 가기 버튼
        const backBtn = document.getElementById('back-to-hub-from-report');
        if (backBtn) {
            this.eventManager.add(backBtn, 'click', () => {
                this.onNavigateBack();
            });
        }
        
        // 차트 관련 이벤트 (ChartRenderer에서 발생)
        this.container.addEventListener('cityClick', (e) => {
            this.onCityClick(e.detail.cityName);
        });
        
        this.container.addEventListener('chartTabClick', (e) => {
            this.onChartTabClick(e.detail.message);
        });
        
        // 히트맵 아이템 클릭 이벤트 (HeatmapRenderer에서 발생)
        this.container.addEventListener('heatmapItemClick', (e) => {
            this.onHeatmapItemClick(e.detail.month, e.detail.activity, e.detail.year);
        });
        
        // 인사이트 아이템 클릭 이벤트 (InsightsRenderer에서 발생)
        this.container.addEventListener('insightClick', (e) => {
            this.onInsightClick(e.detail.index, e.detail.message);
        });
    }

    /**
     * 뒤로 가기
     */
    onNavigateBack() {
        this.dispatchEvent('navigate', { view: 'hub' });
    }

    /**
     * 도시 클릭
     * @param {string} cityName - 도시 이름
     */
    onCityClick(cityName) {
        this.dispatchEvent('showMessage', { 
            type: 'info', 
            message: `"${cityName}" 상세 정보는 준비 중입니다.` 
        });
    }

    /**
     * 차트 탭 클릭
     * @param {string} message - 메시지
     */
    onChartTabClick(message) {
        this.dispatchEvent('showMessage', { 
            type: 'info', 
            message: message 
        });
    }

    /**
     * 히트맵 아이템 클릭
     * @param {string} month - 월
     * @param {string} activity - 활동 수
     * @param {string} year - 연도
     */
    onHeatmapItemClick(month, activity, year) {
        this.dispatchEvent('showMessage', { 
            type: 'info', 
            message: `${year}년 ${month}월: ${activity}번의 여행 활동` 
        });
    }

    /**
     * 인사이트 아이템 클릭
     * @param {number} index - 인사이트 인덱스
     * @param {string} message - 메시지
     */
    onInsightClick(index, message) {
        this.dispatchEvent('showMessage', { 
            type: 'info', 
            message: message 
        });
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
        // 모듈들 정리
        if (this.basicStatsRenderer) {
            this.basicStatsRenderer.cleanup();
        }
        if (this.travelDNARenderer) {
            this.travelDNARenderer.cleanup();
        }
        if (this.heatmapRenderer) {
            this.heatmapRenderer.cleanup();
        }
        if (this.chartRenderer) {
            this.chartRenderer.cleanup();
        }
        if (this.insightsRenderer) {
            this.insightsRenderer.cleanup();
        }
        // if (this.yearlyStatsRenderer) {
        //     this.yearlyStatsRenderer.cleanup();
        // }
        
        if (this.eventManager) {
            this.eventManager.cleanup();
        }
        this.container = null;
    }
}

export { TravelReportView };
