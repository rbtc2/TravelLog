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
        
        // 베이스캠프 아이템 업데이트 (2번째 아이템)
        this.updateBaseCamp(dnaItems[1]);
        
        // 여행 스타일 아이템 업데이트 (3번째 아이템)
        this.updateTravelStyle(dnaItems[2]);
        
        // 주요 목적 아이템 업데이트 (4번째 아이템)
        this.updateMainPurpose(dnaItems[3], purposeAnalysis);
    }

    /**
     * 주요방문국 순위 아이템을 업데이트합니다 (TOP 3 랭킹)
     * @param {HTMLElement} favoriteCountryItem - 주요방문국 순위 아이템
     */
    updateFavoriteCountry(favoriteCountryItem) {
        if (!favoriteCountryItem) return;

        try {
            const favoriteCountryAnalysis = this.controller.getFavoriteCountryAnalysis();
            console.log('TravelDNARenderer: 주요방문국 분석 데이터:', favoriteCountryAnalysis);
            const favoriteCountryValue = favoriteCountryItem.querySelector('.dna-value');
            
            if (favoriteCountryValue) {
                // 🚀 Phase 1 리팩토링 호환성: 새로운 데이터 구조 지원
                const top3Countries = favoriteCountryAnalysis.top3Countries || 
                    (favoriteCountryAnalysis.favoriteCountries && favoriteCountryAnalysis.favoriteCountries.slice(0, 3)) || 
                    [];
                const hasData = favoriteCountryAnalysis.hasData || 
                    (favoriteCountryAnalysis.totalVisitedCountries > 0) || 
                    top3Countries.length > 0;
                
                if (hasData && top3Countries.length > 0) {
                    // TOP 3 랭킹 HTML 생성
                    favoriteCountryValue.innerHTML = this.generateTop3RankingHTML(top3Countries);
                } else {
                    favoriteCountryValue.innerHTML = '<div class="no-data-message">아직 여행 기록이 없습니다</div>';
                }
            }
        } catch (error) {
            console.error('주요방문국 순위 업데이트 중 오류:', error);
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
            const avgRating = country.averageRating > 0 ? country.averageRating.toFixed(1) : 'N/A';
            
            return `
                <div class="${rankClass}">
                    <div class="rank-number">${rank}위</div>
                    <div class="country-info">
                        <div class="country-name">${countryName}</div>
                        <div class="country-stats">${country.visitCount}회 방문, 총 ${country.totalStayDays}일</div>
                    </div>
                    <div class="country-rating">
                        <span class="rating-star">⭐</span>
                        <span class="rating-value">${avgRating}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 베이스캠프 아이템을 업데이트합니다
     * @param {HTMLElement} baseCampItem - 베이스캠프 아이템
     */
    updateBaseCamp(baseCampItem) {
        if (!baseCampItem) return;

        try {
            const favoriteCountryAnalysis = this.controller.getFavoriteCountryAnalysis();
            const baseCampValue = baseCampItem.querySelector('.dna-value');
            
            if (baseCampValue) {
                // 🚀 Phase 1 리팩토링 호환성: 새로운 데이터 구조 지원
                const top3Countries = favoriteCountryAnalysis.top3Countries || 
                    (favoriteCountryAnalysis.favoriteCountries && favoriteCountryAnalysis.favoriteCountries.slice(0, 3)) || 
                    [];
                const hasData = favoriteCountryAnalysis.hasData || 
                    (favoriteCountryAnalysis.totalVisitedCountries > 0) || 
                    top3Countries.length > 0;
                
                if (hasData && top3Countries.length > 0) {
                    const topCountry = top3Countries[0];
                    const countryName = this.controller._getCountryDisplayName ? 
                        this.controller._getCountryDisplayName(topCountry.country) : 
                        topCountry.displayName || topCountry.country;
                    baseCampValue.textContent = `${countryName} (${topCountry.visitCount}회, 총 ${topCountry.totalStayDays}일)`;
                } else {
                    baseCampValue.textContent = '아직 여행 기록이 없습니다';
                }
            }
        } catch (error) {
            console.error('베이스캠프 업데이트 중 오류:', error);
            const baseCampValue = baseCampItem.querySelector('.dna-value');
            if (baseCampValue) {
                baseCampValue.textContent = '데이터 분석 중 오류가 발생했습니다';
            }
        }
    }

    /**
     * 여행 스타일 아이템을 업데이트합니다
     * @param {HTMLElement} travelStyleItem - 여행 스타일 아이템
     */
    updateTravelStyle(travelStyleItem) {
        if (!travelStyleItem) return;

        try {
            const logs = this.controller.getAllLogs();
            const travelStyleValue = travelStyleItem.querySelector('.dna-value');
            
            if (travelStyleValue) {
                if (logs.length > 0) {
                    // 평균 체류일수 계산
                    let totalDays = 0;
                    let validLogs = 0;
                    
                    logs.forEach(log => {
                        if (log.startDate && log.endDate) {
                            const start = new Date(log.startDate);
                            const end = new Date(log.endDate);
                            const diffTime = Math.abs(end - start);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                            totalDays += diffDays;
                            validLogs++;
                        }
                    });
                    
                    if (validLogs > 0) {
                        const avgDays = Math.round((totalDays / validLogs) * 10) / 10;
                        let style = '';
                        
                        if (avgDays >= 7) {
                            style = '장기체류형';
                        } else if (avgDays >= 3) {
                            style = '중기체류형';
                        } else {
                            style = '단기체류형';
                        }
                        
                        travelStyleValue.textContent = `${style} (평균 ${avgDays}일)`;
                    } else {
                        travelStyleValue.textContent = '아직 여행 기록이 없습니다';
                    }
                } else {
                    travelStyleValue.textContent = '아직 여행 기록이 없습니다';
                }
            }
        } catch (error) {
            console.error('여행 스타일 업데이트 중 오류:', error);
            const travelStyleValue = travelStyleItem.querySelector('.dna-value');
            if (travelStyleValue) {
                travelStyleValue.textContent = '데이터 분석 중 오류가 발생했습니다';
            }
        }
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
