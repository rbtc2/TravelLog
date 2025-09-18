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
        const container = this.container.querySelector('#world-exploration-section');
        if (!container) {
            console.error('TravelReportView: world-exploration-section 컨테이너를 찾을 수 없습니다');
            return;
        }

        try {
            // 컨트롤러에서 전세계 탐험 현황 데이터 가져오기
            const explorationStats = this.controller.getWorldExplorationStats();
            // 전세계 탐험 현황 데이터 로드
            container.innerHTML = this.getWorldExplorationHTML(explorationStats);
            
            // 인디케이터 위치 계산 및 설정
            this.updateProgressIndicator(explorationStats.progressPercentage);
        } catch (error) {
            console.error('TravelReportView: 전세계 탐험 현황 렌더링 오류:', error);
            container.innerHTML = this.getWorldExplorationErrorHTML();
            // 에러 상태에서도 인디케이터 위치 설정
            this.updateProgressIndicator(0);
        }
    }

    /**
     * 전세계 탐험 현황 HTML을 생성합니다
     * @param {Object} stats - 탐험 현황 통계
     * @returns {string} HTML 문자열
     */
    getWorldExplorationHTML(stats) {
        return `
            <div class="exploration-header">
                <div class="exploration-icon">🌍</div>
                <div class="exploration-info">
                    <h3 class="exploration-title">전 세계 탐험 현황</h3>
                    <p class="exploration-subtitle">전 세계 ${stats.totalCountries}개국 중 ${stats.visitedCountries}개국 방문</p>
                </div>
            </div>
            
            <div class="exploration-progress">
                <div class="progress" 
                     role="progressbar" 
                     aria-valuenow="${stats.progressPercentage}" 
                     aria-valuemin="0" 
                     aria-valuemax="100"
                     aria-label="전 세계 탐험 진행률">
                    <div class="progress__track" data-total-label="${stats.totalCountries}개국">
                        <div class="progress__fill" style="width: ${stats.progressPercentage}%"></div>
                    </div>
                    <div class="progress__label" aria-live="polite">${stats.progressPercentage}%</div>
                </div>
            </div>
            
            <!-- 대륙별 컴팩트 요약 -->
            <div class="continent-summary">
                ${this.generateContinentSummaryHTML(stats.continentStats)}
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
            <div class="exploration-header error">
                <div class="exploration-icon">🌍</div>
                <div class="exploration-info">
                    <h3 class="exploration-title">전 세계 탐험 현황</h3>
                    <p class="exploration-subtitle">데이터를 불러올 수 없습니다</p>
                </div>
            </div>
            <div class="exploration-progress">
                <div class="progress" 
                     role="progressbar" 
                     aria-valuenow="0" 
                     aria-valuemin="0" 
                     aria-valuemax="100"
                     aria-label="전 세계 탐험 진행률">
                    <div class="progress__track" data-total-label="195개국">
                        <div class="progress__fill" style="width: 0%"></div>
                    </div>
                    <div class="progress__label" aria-live="polite">0%</div>
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
        
        // 진행바 인디케이터 리사이즈 대응
        this.bindProgressIndicatorEvents();
        
        // 대륙별 카드 클릭 이벤트
        this.bindContinentCardEvents();
    }

    /**
     * 대륙별 카드 이벤트 바인딩
     */
    bindContinentCardEvents() {
        const continentCards = this.container.querySelectorAll('.continent-mini');
        continentCards.forEach(card => {
            this.eventManager.add(card, 'click', this.onContinentCardClick.bind(this));
        });
    }

    /**
     * 대륙별 카드 클릭 처리
     * @param {Event} e - 클릭 이벤트
     */
    onContinentCardClick(e) {
        const cardElement = e.currentTarget;
        const continent = cardElement.dataset.continent;
        if (!continent) return;

        // 이미 선택된 카드를 클릭한 경우 (토글)
        if (cardElement.classList.contains('active')) {
            // 모든 카드에서 active 클래스 제거
            const allCards = this.container.querySelectorAll('.continent-mini');
            allCards.forEach(card => card.classList.remove('active'));

            // 전 세계 통계로 복원
            this.restoreWorldExplorationStats();
            return;
        }

        // 다른 카드 선택
        const allCards = this.container.querySelectorAll('.continent-mini');
        allCards.forEach(card => card.classList.remove('active'));

        // 클릭된 카드에 active 클래스 추가
        cardElement.classList.add('active');

        // 진행바 업데이트
        this.updateProgressBarForContinent(continent);
    }

    /**
     * 대륙별 진행바 업데이트
     * @param {string} continent - 선택된 대륙
     */
    updateProgressBarForContinent(continent) {
        const explorationStats = this.controller.getWorldExplorationStats();
        const continentStats = explorationStats.continentStats.find(c => c.continent === continent);
        
        if (!continentStats) return;

        // 헤더 정보 업데이트
        this.updateExplorationHeader(explorationStats, continent);
        
        // 진행바 업데이트
        this.updateProgressBar(continentStats);
    }

    /**
     * 진행바 업데이트
     * @param {Object} stats - 통계 객체 (대륙별 또는 전 세계)
     */
    updateProgressBar(stats) {
        const progressFill = this.container.querySelector('.progress__fill');
        const progressLabel = this.container.querySelector('.progress__label');
        const progressElement = this.container.querySelector('.progress');

        if (!progressFill || !progressLabel || !progressElement) return;

        // 통계 객체 구조에 따라 진행률 계산
        let visited, total;
        if (stats.visited !== undefined && stats.total !== undefined) {
            // 대륙별 통계 구조
            visited = stats.visited;
            total = stats.total;
        } else if (stats.visitedCountries !== undefined && stats.totalCountries !== undefined) {
            // 전 세계 통계 구조
            visited = stats.visitedCountries;
            total = stats.totalCountries;
        } else {
            console.error('updateProgressBar: 잘못된 통계 객체 구조', stats);
            return;
        }

        // 진행률 계산
        const progressPercentage = Math.round((visited / total) * 100);

        // 진행바 채움 업데이트
        progressFill.style.width = `${progressPercentage}%`;

        // 말풍선 텍스트 업데이트
        progressLabel.textContent = `${progressPercentage}%`;

        // ARIA 속성 업데이트
        progressElement.setAttribute('aria-valuenow', progressPercentage.toString());

        // 인디케이터 위치 재계산
        this.updateProgressIndicator(progressPercentage);
    }

    /**
     * 전 세계 탐험 현황으로 복원
     */
    restoreWorldExplorationStats() {
        const explorationStats = this.controller.getWorldExplorationStats();
        
        // 헤더 정보 복원
        this.updateExplorationHeader(explorationStats, 'world');
        
        // 진행바 복원
        this.updateProgressBar(explorationStats);
    }

    /**
     * 탐험 현황 헤더 업데이트
     * @param {Object} explorationStats - 탐험 통계
     * @param {string} type - 'world' 또는 대륙명
     */
    updateExplorationHeader(explorationStats, type) {
        const titleElement = this.container.querySelector('.exploration-title');
        const subtitleElement = this.container.querySelector('.exploration-subtitle');
        const trackElement = this.container.querySelector('.progress__track');

        if (!titleElement || !subtitleElement || !trackElement) return;

        if (type === 'world') {
            // 전 세계 통계로 복원
            titleElement.textContent = '전 세계 탐험 현황';
            subtitleElement.textContent = `전 세계 ${explorationStats.totalCountries}개국 중 ${explorationStats.visitedCountries}개국 방문`;
            trackElement.setAttribute('data-total-label', `${explorationStats.totalCountries}개국`);
        } else {
            // 대륙별 통계
            const continentStats = explorationStats.continentStats.find(c => c.continent === type);
            if (!continentStats) return;

            titleElement.textContent = `${continentStats.nameKo} 탐험 현황`;
            subtitleElement.textContent = `${continentStats.nameKo} ${continentStats.total}개국 중 ${continentStats.visited}개국 방문`;
            trackElement.setAttribute('data-total-label', `${continentStats.total}개국`);
        }
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
     * 진행바 인디케이터 이벤트를 바인딩합니다
     */
    bindProgressIndicatorEvents() {
        // 리사이즈 이벤트 바인딩 (디바운스 적용)
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateProgressIndicatorFromCurrentValue();
            }, 100);
        };

        this.eventManager.add(window, 'resize', handleResize);
        
        // 폰트 로드 완료 시 재계산
        if (document.fonts) {
            document.fonts.ready.then(() => {
                this.updateProgressIndicatorFromCurrentValue();
            });
        }
    }

    /**
     * 현재 값으로부터 진행바 인디케이터를 업데이트합니다
     */
    updateProgressIndicatorFromCurrentValue() {
        const progressElement = this.container?.querySelector('.progress');
        if (!progressElement) return;

        const currentValue = parseInt(progressElement.getAttribute('aria-valuenow') || '0');
        this.updateProgressIndicator(currentValue);
    }

    /**
     * 진행바 인디케이터 위치를 계산하고 업데이트합니다
     * @param {number} percent - 진행률 (0-100)
     */
    updateProgressIndicator(percent) {
        const progressElement = this.container?.querySelector('.progress');
        const trackElement = this.container?.querySelector('.progress__track');
        const labelElement = this.container?.querySelector('.progress__label');
        
        if (!progressElement || !trackElement || !labelElement) {
            return;
        }

        // requestAnimationFrame으로 부드러운 애니메이션 보장
        requestAnimationFrame(() => {
            this.calculateAndSetIndicatorPosition(trackElement, labelElement, percent);
        });
    }

    /**
     * 인디케이터 위치를 계산하고 설정합니다
     * @param {HTMLElement} trackElement - 트랙 요소
     * @param {HTMLElement} labelElement - 라벨 요소
     * @param {number} percent - 진행률
     */
    calculateAndSetIndicatorPosition(trackElement, labelElement, percent) {
        try {
            // 트랙의 실제 가로폭 측정
            const trackRect = trackElement.getBoundingClientRect();
            const trackWidth = trackRect.width;
            
            if (trackWidth <= 0) {
                return;
            }

            // 기본 위치 계산 (퍼센트 기반)
            const rawPosition = (percent / 100) * trackWidth;
            
            // 라벨 너비 측정
            const labelRect = labelElement.getBoundingClientRect();
            const labelWidth = labelRect.width;
            
            // 세이프티 마진 (마감점과 겹치지 않도록 증가)
            const safetyMargin = 12;
            // 모바일 감지 및 knob 크기 조정
            const isMobile = window.innerWidth <= 767;
            const knobSize = isMobile ? 12 : 14;
            const rightMargin = safetyMargin + knobSize + 8;
            
            // 중앙 정렬을 위한 위치 계산
            const minPosition = safetyMargin + (labelWidth / 2);
            const maxPosition = trackWidth - rightMargin - (labelWidth / 2);
            const finalPosition = Math.max(minPosition, Math.min(maxPosition, rawPosition));
            
            // 라벨을 중앙 기준으로 배치
            labelElement.style.left = '0';
            labelElement.style.transform = `translateX(${finalPosition - (labelWidth / 2)}px)`;
            
            // 라벨이 보이도록 강제 설정
            labelElement.style.display = 'block';
            labelElement.style.visibility = 'visible';
            labelElement.style.opacity = '1';
            
            // ARIA 값 업데이트
            const progressElement = trackElement.closest('.progress');
            if (progressElement) {
                progressElement.setAttribute('aria-valuenow', percent.toString());
            }
            
        } catch (error) {
            console.error('Progress indicator 위치 계산 오류:', error);
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
