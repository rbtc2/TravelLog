/**
 * TravelReportHTMLRenderer - 트래블 레포트 HTML 생성 전담
 * 
 * 🎯 책임:
 * - 트래블 레포트 전체 HTML 구조 생성
 * - 각 섹션별 HTML 템플릿 생성
 * - 차트 및 통계 HTML 생성
 * - HTML 템플릿 관리
 * 
 * @class TravelReportHTMLRenderer
 * @version 1.0.0
 * @since 2024-12-29
 */
export class TravelReportHTMLRenderer {
    constructor() {
        // HTML 템플릿 캐시
        this.templateCache = new Map();
    }

    /**
     * 트래블 레포트 전체 HTML을 생성합니다
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
            <div class="world-exploration-section" id="world-exploration-section">
                <!-- 전세계 탐험 현황이 여기에 동적으로 렌더링됩니다 -->
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
     * 여행 DNA 섹션 HTML을 생성합니다
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
                            <div class="dna-label">최애 도시</div>
                            <div class="dna-value">데이터 분석 중...</div>
                        </div>
                    </div>
                    
                    <div class="dna-item">
                        <div class="dna-icon">🌍</div>
                        <div class="dna-details">
                            <div class="dna-label">여행 스타일</div>
                            <div class="dna-value">데이터 분석 중...</div>
                        </div>
                    </div>
                    
                    <div class="dna-item">
                        <div class="dna-icon">📅</div>
                        <div class="dna-details">
                            <div class="dna-label">여행 패턴</div>
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
                    <h2 class="section-title">📈 연도별 여행 통계</h2>
                    <div class="year-selector-container">
                        <!-- 연도 선택기가 여기에 동적으로 렌더링됩니다 -->
                    </div>
                </div>
                <div class="yearly-stats-content" id="yearly-stats-content">
                    <!-- 연도별 통계가 여기에 동적으로 렌더링됩니다 -->
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
                    <h2 class="section-title">🗺️ 여행 히트맵</h2>
                    <div class="heatmap-controls">
                        <select id="heatmap-year-selector" class="year-selector">
                            <!-- 연도 선택 옵션이 여기에 동적으로 렌더링됩니다 -->
                        </select>
                    </div>
                </div>
                <div class="heatmap-content">
                    <div class="heatmap-grid" id="heatmap-grid">
                        <!-- 히트맵이 여기에 동적으로 렌더링됩니다 -->
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
                    <h2 class="section-title">💡 여행 인사이트</h2>
                </div>
                <div class="insights-content" id="insights-content">
                    <!-- 인사이트가 여기에 동적으로 렌더링됩니다 -->
                </div>
            </div>
        `;
    }

    /**
     * HTML 템플릿을 캐시에서 가져오거나 생성합니다
     * @param {string} templateName - 템플릿 이름
     * @param {Function} generator - 템플릿 생성 함수
     * @returns {string} HTML 문자열
     */
    getCachedTemplate(templateName, generator) {
        if (!this.templateCache.has(templateName)) {
            this.templateCache.set(templateName, generator());
        }
        return this.templateCache.get(templateName);
    }

    /**
     * 템플릿 캐시를 정리합니다
     */
    clearCache() {
        this.templateCache.clear();
    }
}
