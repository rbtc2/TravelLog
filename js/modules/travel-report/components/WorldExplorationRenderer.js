/**
 * WorldExplorationRenderer - 전세계 탐험 현황 렌더링 전담
 * 
 * 🎯 책임:
 * - 전세계 탐험 현황 UI 렌더링
 * - 대륙별 카드 렌더링
 * - 진행바 렌더링 및 위치 계산
 * - 탐험 현황 관련 HTML 생성
 * 
 * @class WorldExplorationRenderer
 * @version 1.0.0
 * @since 2024-12-29
 */
import { EventManager } from '../../utils/event-manager.js';

export class WorldExplorationRenderer {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
    }

    /**
     * 전세계 탐험 현황을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    async render(container) {
        this.container = container;
        
        try {
            const explorationStats = this.controller.getWorldExplorationStats();
            container.innerHTML = this.getWorldExplorationHTML(explorationStats);
            this.updateProgressIndicator(explorationStats.progressPercentage);
            this.bindEvents();
        } catch (error) {
            console.error('WorldExplorationRenderer: 렌더링 오류:', error);
            container.innerHTML = this.getWorldExplorationErrorHTML();
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
     * 이벤트를 바인딩합니다
     */
    bindEvents() {
        this.bindContinentCardEvents();
        this.bindProgressIndicatorEvents();
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
            const allCards = this.container.querySelectorAll('.continent-mini');
            allCards.forEach(card => card.classList.remove('active'));
            this.restoreWorldExplorationStats();
            return;
        }

        // 다른 카드들의 active 클래스 제거
        const allCards = this.container.querySelectorAll('.continent-mini');
        allCards.forEach(card => card.classList.remove('active'));
        
        // 현재 카드에 active 클래스 추가
        cardElement.classList.add('active');
        
        // 대륙별 통계로 업데이트
        this.updateProgressBarForContinent(continent);
    }

    /**
     * 대륙별 진행바 업데이트
     * @param {string} continent - 대륙 코드
     */
    async updateProgressBarForContinent(continent) {
        try {
            const explorationStats = this.controller.getWorldExplorationStats();
            const continentStats = explorationStats.continentStats.find(c => c.continent === continent);
            
            if (!continentStats) return;

            // 헤더 정보 업데이트
            this.updateExplorationHeader(explorationStats, continent);
            
            // 진행바 업데이트
            this.updateProgressBar(continentStats);
        } catch (error) {
            console.error('대륙별 진행바 업데이트 오류:', error);
        }
    }

    /**
     * 전 세계 통계로 복원
     */
    restoreWorldExplorationStats() {
        const explorationStats = this.controller.getWorldExplorationStats();
        this.updateExplorationHeader(explorationStats, 'world');
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
            titleElement.textContent = '전 세계 탐험 현황';
            subtitleElement.textContent = `전 세계 ${explorationStats.totalCountries}개국 중 ${explorationStats.visitedCountries}개국 방문`;
            trackElement.setAttribute('data-total-label', `${explorationStats.totalCountries}개국`);
        } else {
            const continentStats = explorationStats.continentStats.find(c => c.continent === type);
            if (!continentStats) return;

            titleElement.textContent = `${continentStats.nameKo} 탐험 현황`;
            subtitleElement.textContent = `${continentStats.nameKo} ${continentStats.total}개국 중 ${continentStats.visited}개국 방문`;
            trackElement.setAttribute('data-total-label', `${continentStats.total}개국`);
        }
    }

    /**
     * 진행바 업데이트
     * @param {Object} stats - 통계 객체 (대륙별 또는 전 세계)
     */
    updateProgressBar(stats) {
        const progressFill = this.container.querySelector('.progress__fill');
        const progressLabel = this.container.querySelector('.progress__label');

        if (!progressFill || !progressLabel) return;

        // 통계 객체 구조에 따라 visited, total 값 결정
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

        const progressPercentage = Math.round((visited / total) * 100);

        // 진행바 업데이트
        progressFill.style.width = `${progressPercentage}%`;
        progressLabel.textContent = `${progressPercentage}%`;

        // 인디케이터 위치 계산 및 설정
        const trackElement = this.container.querySelector('.progress__track');
        if (trackElement) {
            this.calculateAndSetIndicatorPosition(trackElement, progressLabel, progressPercentage);
        }
    }

    /**
     * 진행바 인디케이터 이벤트 바인딩
     */
    bindProgressIndicatorEvents() {
        // 윈도우 리사이즈 이벤트 바인딩
        this.eventManager.add(window, 'resize', this.updateProgressIndicatorFromCurrentValue.bind(this));
        
        // 초기 위치 설정
        this.updateProgressIndicatorFromCurrentValue();
    }

    /**
     * 현재 값으로부터 인디케이터 업데이트
     */
    updateProgressIndicatorFromCurrentValue() {
        const progressLabel = this.container.querySelector('.progress__label');
        if (!progressLabel) return;

        const currentPercent = parseInt(progressLabel.textContent);
        this.updateProgressIndicator(currentPercent);
    }

    /**
     * 진행바 인디케이터 업데이트
     * @param {number} percent - 진행률 퍼센트
     */
    updateProgressIndicator(percent) {
        const trackElement = this.container.querySelector('.progress__track');
        const labelElement = this.container.querySelector('.progress__label');

        if (!trackElement || !labelElement) return;

        this.calculateAndSetIndicatorPosition(trackElement, labelElement, percent);
    }

    /**
     * 인디케이터 위치를 계산하고 설정합니다
     * @param {HTMLElement} trackElement - 트랙 요소
     * @param {HTMLElement} labelElement - 라벨 요소
     * @param {number} percent - 진행률
     */
    calculateAndSetIndicatorPosition(trackElement, labelElement, percent) {
        try {
            const trackRect = trackElement.getBoundingClientRect();
            const trackWidth = trackRect.width;
            
            if (trackWidth <= 0) return;

            const rawPosition = (percent / 100) * trackWidth;
            const labelRect = labelElement.getBoundingClientRect();
            const labelWidth = labelRect.width;
            
            const safetyMargin = 12;
            const isMobile = window.innerWidth <= 767;
            const knobSize = isMobile ? 12 : 14;
            const rightMargin = safetyMargin + knobSize + 8;
            
            const minPosition = safetyMargin + (labelWidth / 2);
            const maxPosition = trackWidth - rightMargin - (labelWidth / 2);
            const finalPosition = Math.max(minPosition, Math.min(maxPosition, rawPosition));
            
            labelElement.style.left = '0';
            labelElement.style.transform = `translateX(${finalPosition - (labelWidth / 2)}px)`;
            labelElement.style.display = 'block';
            labelElement.style.visibility = 'visible';
            labelElement.style.opacity = '1';
            
            const progressElement = trackElement.closest('.progress');
            if (progressElement) {
                progressElement.setAttribute('aria-valuenow', percent.toString());
            }
            
        } catch (error) {
            console.error('Progress indicator 위치 계산 오류:', error);
        }
    }

    /**
     * 리소스 정리
     */
    cleanup() {
        this.eventManager.cleanup();
        this.container = null;
    }
}
