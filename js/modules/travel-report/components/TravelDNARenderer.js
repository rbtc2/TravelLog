/**
 * TravelDNARenderer - 여행 DNA 섹션 렌더링 모듈
 * 
 * 🎯 책임:
 * - 여행 DNA 섹션 UI 렌더링
 * - 목적 분석 데이터 기반 동적 업데이트
 * - DNA 아이템별 데이터 표시
 * 
 * @class TravelDNARenderer
 * @version 1.0.0
 * @since 2024-12-29
 */
import { EventManager } from '../../utils/event-manager.js';

class TravelDNARenderer {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
    }

    /**
     * 여행 DNA 섹션을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    render(container) {
        try {
            this.container = container;
            
            if (!container) {
                console.warn('TravelDNARenderer: 컨테이너가 제공되지 않았습니다.');
                return;
            }

            // 목적 분석 데이터 가져오기
            const purposeAnalysis = this.controller.getPurposeAnalysis();
            
            // DNA 아이템들을 동적으로 업데이트
            this.updateDNAItems(container, purposeAnalysis);
            
            console.log('TravelDNARenderer: 여행 DNA 렌더링 완료');
        } catch (error) {
            console.error('TravelDNARenderer: 렌더링 중 오류:', error);
            this.renderError(container);
        }
    }

    /**
     * DNA 아이템들을 업데이트합니다
     * @param {HTMLElement} container - DNA 컨텐츠 컨테이너
     * @param {Object} purposeAnalysis - 목적 분석 데이터
     */
    updateDNAItems(container, purposeAnalysis) {
        const dnaItems = container.querySelectorAll('.dna-item');
        
        // 주요 목적 아이템 찾기 (4번째 아이템)
        const purposeItem = dnaItems[3]; // 0: 최애 국가, 1: 베이스캠프, 2: 여행 스타일, 3: 주요 목적
        
        if (purposeItem) {
            const purposeValue = purposeItem.querySelector('.dna-value');
            if (purposeValue) {
                if (purposeAnalysis.hasData) {
                    purposeValue.textContent = purposeAnalysis.summary;
                } else {
                    purposeValue.textContent = '아직 여행 기록이 없습니다';
                }
            }
        }
    }

    /**
     * 에러 상태를 렌더링합니다
     * @param {HTMLElement} container - 컨테이너
     */
    renderError(container) {
        if (!container) return;
        
        const dnaItems = container.querySelectorAll('.dna-item');
        const purposeItem = dnaItems[3];
        
        if (purposeItem) {
            const purposeValue = purposeItem.querySelector('.dna-value');
            if (purposeValue) {
                purposeValue.textContent = '데이터 분석 중 오류가 발생했습니다';
            }
        }
    }

    /**
     * 여행 DNA를 새로고침합니다
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

export { TravelDNARenderer };
