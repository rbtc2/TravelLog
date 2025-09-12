/**
 * BasicStatsRenderer - 기본 통계 카드 렌더링 모듈
 * 
 * 🎯 책임:
 * - 기본 통계 카드 UI 렌더링
 * - 통계 데이터 표시 및 에러 처리
 * - 통계 카드 이벤트 바인딩
 * 
 * @class BasicStatsRenderer
 * @version 1.0.0
 * @since 2024-12-29
 */
import { EventManager } from '../../utils/event-manager.js';

class BasicStatsRenderer {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
    }

    /**
     * 기본 통계 카드를 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    render(container) {
        try {
            this.container = container;
            
            if (!container) {
                console.warn('BasicStatsRenderer: 컨테이너가 제공되지 않았습니다.');
                return;
            }

            const stats = this.controller.getBasicStats();
            container.innerHTML = this.getBasicStatsHTML(stats);
            
            console.log('BasicStatsRenderer: 기본 통계 렌더링 완료');
        } catch (error) {
            console.error('BasicStatsRenderer: 렌더링 중 오류:', error);
            this.renderError(container);
        }
    }

    /**
     * 기본 통계 HTML을 생성합니다
     * @param {Object} stats - 통계 데이터
     * @returns {string} HTML 문자열
     */
    getBasicStatsHTML(stats) {
        if (!stats.hasData) {
            return this.getEmptyStatsHTML();
        }

        return `
            <div class="stats-card">
                <div class="stats-icon">🌍</div>
                <div class="stats-content">
                    <div class="stats-value">${stats.visitedCountries}개국</div>
                    <div class="stats-label">방문 국가</div>
                </div>
            </div>
            <div class="stats-card">
                <div class="stats-icon">🏙️</div>
                <div class="stats-content">
                    <div class="stats-value">${stats.visitedCities}개 도시</div>
                    <div class="stats-label">방문 도시</div>
                </div>
            </div>
            <div class="stats-card">
                <div class="stats-icon">📅</div>
                <div class="stats-content">
                    <div class="stats-value">${stats.totalTravelDays}일</div>
                    <div class="stats-label">총 여행일</div>
                </div>
            </div>
            <div class="stats-card">
                <div class="stats-icon">⭐</div>
                <div class="stats-content">
                    <div class="stats-value">${stats.averageRating}/5.0</div>
                    <div class="stats-label">평균 만족도</div>
                </div>
            </div>
        `;
    }

    /**
     * 데이터가 없을 때의 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getEmptyStatsHTML() {
        return `
            <div class="stats-card">
                <div class="stats-icon">🌍</div>
                <div class="stats-content">
                    <div class="stats-value">0개국</div>
                    <div class="stats-label">방문 국가</div>
                </div>
            </div>
            <div class="stats-card">
                <div class="stats-icon">🏙️</div>
                <div class="stats-content">
                    <div class="stats-value">0개 도시</div>
                    <div class="stats-label">방문 도시</div>
                </div>
            </div>
            <div class="stats-card">
                <div class="stats-icon">📅</div>
                <div class="stats-content">
                    <div class="stats-value">0일</div>
                    <div class="stats-label">총 여행일</div>
                </div>
            </div>
            <div class="stats-card">
                <div class="stats-icon">⭐</div>
                <div class="stats-content">
                    <div class="stats-value">-/5.0</div>
                    <div class="stats-label">평균 만족도</div>
                </div>
            </div>
        `;
    }

    /**
     * 에러 상태 HTML을 렌더링합니다
     * @param {HTMLElement} container - 컨테이너
     */
    renderError(container) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="stats-card error">
                <div class="stats-icon">⚠️</div>
                <div class="stats-content">
                    <div class="stats-value">오류</div>
                    <div class="stats-label">데이터를 불러올 수 없습니다</div>
                </div>
            </div>
        `;
    }

    /**
     * 통계 카드를 새로고침합니다
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

export { BasicStatsRenderer };
