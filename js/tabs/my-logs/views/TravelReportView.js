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
    }

    /**
     * 트래블 레포트 화면을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    render(container) {
        console.log('TravelReportView: render 호출됨');
        this.container = container;
        this.container.innerHTML = this.getTravelReportHTML();
        console.log('TravelReportView: HTML 렌더링 완료');
        this.renderBasicStats();
        console.log('TravelReportView: 기본 통계 렌더링 완료');
        this.renderTravelDNA();
        console.log('TravelReportView: 여행 DNA 렌더링 완료');
        this.renderInitialHeatmap();
        console.log('TravelReportView: 초기 히트맵 렌더링 완료');
        this.renderCharts();
        console.log('TravelReportView: 차트 렌더링 완료');
        this.renderInsights();
        console.log('TravelReportView: 인사이트 렌더링 완료');
        this.bindEvents();
        console.log('TravelReportView: 이벤트 바인딩 완료');
    }

    /**
     * 트래블 레포트 화면 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getTravelReportHTML() {
        return `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <div class="header-with-back">
                        <button class="back-btn" id="back-to-hub-from-report">◀ 뒤로</button>
                        <div class="header-content">
                            <h1 class="my-logs-title">📊 트래블 레포트</h1>
                            <p class="my-logs-subtitle">여행 데이터 분석 및 인사이트</p>
                        </div>
                    </div>
                </div>
                
                <!-- 기본 통계 카드 -->
                <div class="hub-section basic-stats-section">
                    <div class="stats-grid" id="basic-stats-grid">
                        <!-- 통계 카드들이 여기에 동적으로 렌더링됩니다 -->
                    </div>
                </div>
                
                <!-- 나의 여행 DNA 카드 -->
                <div class="hub-section travel-dna-section">
                    <div class="section-header">
                        <h2 class="section-title">🧬 나의 여행 DNA</h2>
                    </div>
                    <div class="dna-content">
                        <div class="dna-item">
                            <div class="dna-icon">🏆</div>
                            <div class="dna-details">
                                <div class="dna-label">주요 방문국</div>
                                <div class="dna-value">일본 (5회 방문, 총 47일)</div>
                            </div>
                        </div>
                        
                        <div class="dna-item">
                            <div class="dna-icon">🏙️</div>
                            <div class="dna-details">
                                <div class="dna-label">베이스캠프</div>
                                <div class="dna-value">도쿄 (3회, 총 21일)</div>
                            </div>
                        </div>
                        
                        <div class="dna-item">
                            <div class="dna-icon">⏱️</div>
                            <div class="dna-details">
                                <div class="dna-label">여행 스타일</div>
                                <div class="dna-value">장기체류형 (평균 9.2일)</div>
                            </div>
                        </div>
                        
                        <div class="dna-item">
                            <div class="dna-icon">🎯</div>
                            <div class="dna-details">
                                <div class="dna-label">주요 목적</div>
                                <div class="dna-value">여행 70%, 출장 30%</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 순위/활동 차트 섹션 -->
                <div class="hub-section charts-section">
                    <div class="section-header">
                        <h2 class="section-title">📈 순위/활동 차트</h2>
                    </div>
                    
                    <!-- 차트 프레임 1: 국가별 랭킹 -->
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
                    
                    <!-- 차트 프레임 2: 도시별 랭킹 -->
                    <div class="chart-frame">
                        <div class="chart-header">
                            <h3 class="chart-title">도시별 랭킹 (Top 5)</h3>
                        </div>
                        <div class="city-ranking-list">
                            <div class="city-ranking-item" data-city="도쿄">
                                <div class="city-rank">1</div>
                                <div class="city-info">
                                    <div class="city-name">도쿄</div>
                                    <div class="city-stats">3회 방문, 총 21일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                            <div class="city-ranking-item" data-city="파리">
                                <div class="city-rank">2</div>
                                <div class="city-info">
                                    <div class="city-name">파리</div>
                                    <div class="city-stats">2회 방문, 총 12일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                            <div class="city-ranking-item" data-city="방콕">
                                <div class="city-rank">3</div>
                                <div class="city-info">
                                    <div class="city-name">방콕</div>
                                    <div class="city-stats">1회 방문, 총 6일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                            <div class="city-ranking-item" data-city="런던">
                                <div class="city-rank">4</div>
                                <div class="city-info">
                                    <div class="city-name">런던</div>
                                    <div class="city-stats">1회 방문, 총 5일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                            <div class="city-ranking-item" data-city="뉴욕">
                                <div class="city-rank">5</div>
                                <div class="city-info">
                                    <div class="city-name">뉴욕</div>
                                    <div class="city-stats">1회 방문, 총 4일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 차트 프레임 3: 월별 활동 히트맵 -->
                    <div class="chart-frame">
                        <div class="chart-header">
                            <h3 class="chart-title">일정 히트맵</h3>
                            <div class="chart-controls">
                                <select class="year-selector" id="heatmap-year-selector">
                                    <option value="2025" selected>2025년</option>
                                    <option value="2024">2024년</option>
                                    <option value="2023">2023년</option>
                                    <option value="2022">2022년</option>
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
                </div>
                
                <!-- 여행 패턴 인사이트 카드 -->
                <div class="hub-section insights-section">
                    <div class="section-header">
                        <h2 class="section-title">💡 여행 패턴 인사이트</h2>
                    </div>
                    <div class="insights-content">
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">주로 3–4월에 여행을 떠나시네요!</div>
                        </div>
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">출장보다 여행을 위한 방문이 많아요</div>
                        </div>
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">평균 체류기간이 늘어나고 있어요 📈</div>
                        </div>
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">일본을 정말 좋아하시는군요! 🇯🇵</div>
                        </div>
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">가을철 여행 빈도가 점점 증가하고 있어요</div>
                        </div>
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
        
        if (this.eventManager) {
            this.eventManager.cleanup();
        }
        this.container = null;
    }
}

export { TravelReportView };
