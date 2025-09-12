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
        if (!this.container) return;

        // 현재는 하드코딩된 인사이트를 사용 (향후 실제 데이터 분석으로 교체)
        const insights = this.generateInsights();
        
        const insightsContent = this.container.querySelector('.insights-content');
        if (insightsContent) {
            insightsContent.innerHTML = insights.map(insight => `
                <div class="insight-item">
                    <div class="insight-icon">${insight.icon}</div>
                    <div class="insight-text">${insight.text}</div>
                </div>
            `).join('');
        }
    }

    /**
     * 인사이트 데이터를 생성합니다 (임시 하드코딩)
     * @returns {Array} 인사이트 데이터
     */
    generateInsights() {
        // 향후 실제 데이터 분석으로 교체 예정
        return [
            {
                icon: '💡',
                text: '주로 3–4월에 여행을 떠나시네요!'
            },
            {
                icon: '💡',
                text: '출장보다 여행을 위한 방문이 많아요'
            },
            {
                icon: '💡',
                text: '평균 체류기간이 늘어나고 있어요 📈'
            },
            {
                icon: '💡',
                text: '일본을 정말 좋아하시는군요! 🇯🇵'
            },
            {
                icon: '💡',
                text: '가을철 여행 빈도가 점점 증가하고 있어요'
            }
        ];
    }

    /**
     * 실제 데이터 기반 인사이트를 생성합니다 (향후 구현)
     * @returns {Array} 실제 데이터 기반 인사이트
     */
    generateRealInsights() {
        // TODO: 실제 여행 데이터를 분석하여 인사이트 생성
        // - 여행 패턴 분석
        // - 계절별 여행 빈도 분석
        // - 목적별 여행 패턴 분석
        // - 체류 기간 트렌드 분석
        // - 국가/도시 선호도 분석
        
        const logs = this.controller.getAllLogs();
        if (!logs || logs.length === 0) {
            return [{
                icon: '💡',
                text: '아직 여행 기록이 없어서 인사이트를 제공할 수 없습니다.'
            }];
        }

        // 실제 분석 로직은 향후 구현
        return this.generateInsights();
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
