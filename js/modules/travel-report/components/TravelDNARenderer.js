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
        
        // 최애 국가 아이템 업데이트 (1번째 아이템)
        this.updateFavoriteCountry(dnaItems[0]);
        
        // 주요 목적 아이템 업데이트 (4번째 아이템)
        this.updateMainPurpose(dnaItems[3], purposeAnalysis);
    }

    /**
     * 최애 국가 아이템을 업데이트합니다 (TOP 3 랭킹)
     * @param {HTMLElement} favoriteCountryItem - 최애 국가 아이템
     */
    updateFavoriteCountry(favoriteCountryItem) {
        if (!favoriteCountryItem) return;

        try {
            const favoriteCountryAnalysis = this.controller.getFavoriteCountryAnalysis();
            const favoriteCountryValue = favoriteCountryItem.querySelector('.dna-value');
            
            if (favoriteCountryValue) {
                if (favoriteCountryAnalysis.hasData && favoriteCountryAnalysis.top3Countries) {
                    // TOP 3 랭킹 HTML 생성
                    favoriteCountryValue.innerHTML = this.generateTop3RankingHTML(favoriteCountryAnalysis.top3Countries);
                } else {
                    favoriteCountryValue.innerHTML = '<div class="no-data-message">아직 여행 기록이 없습니다</div>';
                }
            }
        } catch (error) {
            console.error('최애 국가 업데이트 중 오류:', error);
            const favoriteCountryValue = favoriteCountryItem.querySelector('.dna-value');
            if (favoriteCountryValue) {
                favoriteCountryValue.innerHTML = '<div class="error-message">데이터 분석 중 오류가 발생했습니다</div>';
            }
        }
    }

    /**
     * TOP 3 랭킹 HTML을 생성합니다
     * @param {Array} top3Countries - TOP 3 국가 배열
     * @returns {string} HTML 문자열
     */
    generateTop3RankingHTML(top3Countries) {
        if (!top3Countries || top3Countries.length === 0) {
            return '<div class="no-data-message">아직 여행 기록이 없습니다</div>';
        }

        return top3Countries.map((country, index) => {
            const rank = index + 1;
            const countryName = this.controller._getCountryDisplayName(country.country);
            const rankClass = rank === 1 ? 'ranking-item first-place' : 
                             rank === 2 ? 'ranking-item second-place' : 
                             'ranking-item third-place';
            
            return `
                <div class="${rankClass}">
                    <div class="rank-number">${rank}위</div>
                    <div class="country-info">
                        <div class="country-name">${countryName}</div>
                        <div class="country-stats">${country.visitCount}회 방문, 총 ${country.totalStayDays}일</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 주요 목적 아이템을 업데이트합니다
     * @param {HTMLElement} purposeItem - 주요 목적 아이템
     * @param {Object} purposeAnalysis - 목적 분석 데이터
     */
    updateMainPurpose(purposeItem, purposeAnalysis) {
        if (!purposeItem) return;

        const purposeValue = purposeItem.querySelector('.dna-value');
        if (purposeValue) {
            if (purposeAnalysis.hasData) {
                purposeValue.textContent = purposeAnalysis.summary;
            } else {
                purposeValue.textContent = '아직 여행 기록이 없습니다';
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
