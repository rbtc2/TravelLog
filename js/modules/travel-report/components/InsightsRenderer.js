/**
 * InsightsRenderer - 여행 패턴 인사이트 렌더링 모듈
 * 
 * 🎯 책임:
 * - 여행 패턴 인사이트 UI 렌더링
 * - 인사이트 데이터 분석 및 생성
 * - 인사이트 이벤트 처리
 * 
 * @class InsightsRenderer
 * @version 1.0.0
 * @since 2024-12-29
 */
import { EventManager } from '../../utils/event-manager.js';

class InsightsRenderer {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
    }

    /**
     * 인사이트 섹션을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    render(container) {
        try {
            this.container = container;
            
            if (!container) {
                console.warn('InsightsRenderer: 컨테이너가 제공되지 않았습니다.');
                return;
            }

            this.renderInsights();
            this.bindEvents();
            
            console.log('InsightsRenderer: 인사이트 렌더링 완료');
        } catch (error) {
            console.error('InsightsRenderer: 렌더링 중 오류:', error);
            this.renderError(container);
        }
    }

    /**
     * 인사이트를 렌더링합니다
     */
    renderInsights() {
        if (!this.container) {
            console.warn('InsightsRenderer: 컨테이너가 없습니다.');
            return;
        }

        // 실제 데이터 기반 인사이트 생성 (백오프로 하드코딩된 데이터)
        const insights = this.generateRealInsights();
        
        // 컨테이너 자체에 직접 렌더링 (ID 선택자 문제 해결)
        this.container.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-text">${insight.text}</div>
            </div>
        `).join('');
    }


    /**
     * 실제 데이터 기반 인사이트를 생성합니다
     * @returns {Array} 실제 데이터 기반 인사이트
     */
    generateRealInsights() {
        const logs = this.controller.getAllLogs();
        
        // 일정이 없는 경우
        if (!logs || logs.length === 0) {
            return [{
                icon: '💡',
                text: '일정이 추가되면 인사이트를 분석합니다.'
            }];
        }

        // 일정이 있는 경우 - 기본 분석 수행
        return this.generateBasicInsights(logs);
    }

    /**
     * 기본 인사이트를 생성합니다 (Phase 1)
     * 향후 확장 시 별도 파일로 분리 예정
     * @param {Array} logs - 여행 로그 배열
     * @returns {Array} 기본 인사이트 배열
     */
    generateBasicInsights(logs) {
        const insights = [];
        
        // 1. 여행 시작 연도 분석
        const startYear = this.getTravelStartYear(logs);
        if (startYear) {
            insights.push({
                icon: '🚀',
                text: `${startYear}년부터 여행을 시작하셨네요!`
            });
        }
        
        // 2. 총 여행 일수 분석
        const totalDays = this.getTotalTravelDays(logs);
        if (totalDays > 0) {
            insights.push({
                icon: '📅',
                text: `총 ${totalDays}일간 여행하셨어요!`
            });
        }
        
        // 향후 확장을 위한 플레이스홀더
        // TODO: Phase 2에서 추가될 분석들
        // - 국가 수 분석
        // - 가장 많이 방문한 국가
        // - 계절별 여행 패턴
        // - 연도별 트렌드
        
        return insights;
    }

    /**
     * 여행 시작 연도를 분석합니다
     * @param {Array} logs - 여행 로그 배열
     * @returns {string|null} 시작 연도
     */
    getTravelStartYear(logs) {
        if (!logs || logs.length === 0) return null;
        
        const years = logs
            .map(log => new Date(log.startDate).getFullYear())
            .filter(year => !isNaN(year))
            .sort((a, b) => a - b);
        
        return years.length > 0 ? years[0] : null;
    }

    /**
     * 총 여행 일수를 계산합니다
     * @param {Array} logs - 여행 로그 배열
     * @returns {number} 총 여행 일수
     */
    getTotalTravelDays(logs) {
        if (!logs || logs.length === 0) return 0;
        
        return logs.reduce((total, log) => {
            // days 필드가 있으면 사용, 없으면 계산
            if (log.days && typeof log.days === 'number') {
                return total + log.days;
            }
            
            // startDate와 endDate로 계산
            if (log.startDate && log.endDate) {
                const start = new Date(log.startDate);
                const end = new Date(log.endDate);
                const diffTime = end - start;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return total + (diffDays > 0 ? diffDays : 1);
            }
            
            return total;
        }, 0);
    }

    /**
     * 인사이트 이벤트를 바인딩합니다
     */
    bindEvents() {
        if (!this.container) return;

        // 인사이트 아이템 클릭 (향후 상세 정보 표시용)
        const insightItems = this.container.querySelectorAll('.insight-item');
        insightItems.forEach((item, index) => {
            this.eventManager.add(item, 'click', () => {
                this.onInsightClick(index);
            });
        });
    }

    /**
     * 인사이트 아이템 클릭 처리
     * @param {number} index - 인사이트 인덱스
     */
    onInsightClick(index) {
        // 이벤트를 상위로 전달 (TravelReportView에서 처리)
        if (this.container && this.container.parentNode) {
            const event = new CustomEvent('insightClick', {
                detail: { index, message: '인사이트 상세 정보는 준비 중입니다.' }
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
        
        const insightsContent = container.querySelector('.insights-content');
        if (insightsContent) {
            insightsContent.innerHTML = `
                <div class="insights-error">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">인사이트 데이터를 불러올 수 없습니다</div>
                </div>
            `;
        }
    }

    /**
     * 인사이트를 새로고침합니다
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

export { InsightsRenderer };
