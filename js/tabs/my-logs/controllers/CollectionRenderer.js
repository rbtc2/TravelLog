/**
 * CollectionRenderer - 컬렉션 UI 렌더링 전용 렌더러
 * 
 * 🎯 책임:
 * - 컬렉션 UI 요소 렌더링
 * - 애니메이션 및 인터랙션 관리
 * - 반응형 레이아웃 처리
 * - 접근성 및 사용성 최적화
 * 
 * @class CollectionRenderer
 * @version 1.0.0
 * @since 2024-12-29
 */

class CollectionRenderer {
    constructor() {
        this.animationQueue = [];
        this.isAnimating = false;
    }

    /**
     * 컬렉션 메인 화면을 렌더링합니다
     * @param {Object} collectionStats - 컬렉션 통계
     * @returns {string} HTML 문자열
     */
    renderCollectionMain(collectionStats) {
        const { visited, total, percentage, overallProgress, nextMilestone, achievements } = collectionStats;
        
        return `
            <div class="collection-main">
                <div class="collection-header">
                    <h1 class="collection-title">
                        <span class="collection-icon">🗺️</span>
                        여행 도감
                    </h1>
                    <p class="collection-subtitle">당신의 여행 기록을 한눈에 확인하세요</p>
                </div>
                
                <div class="collection-stats-overview">
                    ${this.renderOverallStats(visited, total, percentage, overallProgress)}
                    ${this.renderNextMilestone(nextMilestone)}
                </div>
                
                <div class="collection-achievements">
                    ${this.renderAchievements(achievements)}
                </div>
                
                <div class="collection-navigation">
                    ${this.renderCollectionTabs()}
                </div>
            </div>
        `;
    }

    /**
     * 전체 통계를 렌더링합니다
     * @param {number} visited - 방문한 국가 수
     * @param {number} total - 전체 국가 수
     * @param {number} percentage - 진행률
     * @param {Object} progress - 진행률 바 정보
     * @returns {string} HTML 문자열
     */
    renderOverallStats(visited, total, percentage, progress) {
        return `
            <div class="overall-stats">
                <div class="stats-card main-stats">
                    <div class="stats-icon">🌍</div>
                    <div class="stats-content">
                        <div class="stats-value">${visited}개국</div>
                        <div class="stats-label">방문한 국가</div>
                        <div class="stats-total">전 세계 ${total}개국 중</div>
                    </div>
                </div>
                
                <div class="progress-section">
                    <div class="progress-header">
                        <span class="progress-label">전체 진행률</span>
                        <span class="progress-percentage">${percentage}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${progress.color}" style="width: ${progress.width}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 다음 마일스톤을 렌더링합니다
     * @param {Object} milestone - 마일스톤 정보
     * @returns {string} HTML 문자열
     */
    renderNextMilestone(milestone) {
        if (milestone.remaining <= 0) {
            return `
                <div class="milestone-complete">
                    <div class="milestone-icon">🏆</div>
                    <div class="milestone-text">모든 목표를 달성했습니다!</div>
                </div>
            `;
        }

        return `
            <div class="next-milestone">
                <div class="milestone-header">
                    <span class="milestone-icon">🎯</span>
                    <span class="milestone-label">다음 목표</span>
                </div>
                <div class="milestone-content">
                    <div class="milestone-target">${milestone.target}개국 방문</div>
                    <div class="milestone-remaining">${milestone.remaining}개국 남음</div>
                    <div class="milestone-progress">
                        <div class="milestone-progress-bar">
                            <div class="milestone-progress-fill" style="width: ${milestone.percentage}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 업적을 렌더링합니다
     * @param {Array} achievements - 업적 목록
     * @returns {string} HTML 문자열
     */
    renderAchievements(achievements) {
        if (!achievements || achievements.length === 0) {
            return `
                <div class="achievements-empty">
                    <div class="achievements-icon">🏅</div>
                    <div class="achievements-text">아직 달성한 업적이 없습니다</div>
                </div>
            `;
        }

        return `
            <div class="achievements-section">
                <h3 class="achievements-title">
                    <span class="achievements-icon">🏆</span>
                    업적
                </h3>
                <div class="achievements-grid">
                    ${achievements.map(achievement => `
                        <div class="achievement-item" data-achievement="${achievement.id}">
                            <div class="achievement-icon">🏅</div>
                            <div class="achievement-content">
                                <div class="achievement-name">${achievement.name}</div>
                                <div class="achievement-description">${achievement.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 컬렉션 탭을 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderCollectionTabs() {
        return `
            <div class="collection-tabs">
                <button class="collection-tab active" data-tab="countries">
                    <span class="tab-icon">🏴</span>
                    <span class="tab-label">국가</span>
                </button>
                <button class="collection-tab" data-tab="continents">
                    <span class="tab-icon">🌍</span>
                    <span class="tab-label">대륙</span>
                </button>
                <button class="collection-tab" data-tab="cities">
                    <span class="tab-icon">🏙️</span>
                    <span class="tab-label">도시</span>
                </button>
                <button class="collection-tab" data-tab="restaurants">
                    <span class="tab-icon">🍽️</span>
                    <span class="tab-label">맛집</span>
                </button>
            </div>
        `;
    }

    /**
     * 국가 목록을 렌더링합니다
     * @param {Array} countries - 국가 목록
     * @param {Object} options - 렌더링 옵션
     * @returns {string} HTML 문자열
     */
    renderCountryList(countries, options = {}) {
        const { sortBy = 'visitCount', showFilters = true } = options;

        return `
            <div class="country-list-container">
                ${showFilters ? this.renderCountryFilters(sortBy) : ''}
                <div class="country-grid">
                    ${countries.map(country => this.renderCountryCard(country)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 국가 카드를 렌더링합니다
     * @param {Object} country - 국가 정보
     * @returns {string} HTML 문자열
     */
    renderCountryCard(country) {
        const lastVisit = country.lastVisit ? new Date(country.lastVisit).toLocaleDateString('ko-KR') : '방문 기록 없음';
        const averageRating = country.averageRating ? country.averageRating.toFixed(1) : '0.0';
        
        return `
            <div class="country-card" data-country="${country.code}">
                <div class="country-flag">${country.flag}</div>
                <div class="country-info">
                    <div class="country-name">${country.nameKo}</div>
                    <div class="country-name-en">${country.name}</div>
                    <div class="country-continent">${country.continent}</div>
                </div>
                <div class="country-stats">
                    <div class="country-stat">
                        <span class="stat-icon">✈️</span>
                        <span class="stat-value">${country.visitCount}회</span>
                    </div>
                    <div class="country-stat">
                        <span class="stat-icon">📅</span>
                        <span class="stat-value">${country.totalDays}일</span>
                    </div>
                    <div class="country-stat">
                        <span class="stat-icon">⭐</span>
                        <span class="stat-value">${averageRating}</span>
                    </div>
                </div>
                <div class="country-details">
                    <div class="last-visit">마지막 방문: ${lastVisit}</div>
                    <div class="cities-count">방문 도시: ${country.cities.length}개</div>
                </div>
            </div>
        `;
    }

    /**
     * 국가 필터를 렌더링합니다
     * @param {string} currentSort - 현재 정렬 기준
     * @returns {string} HTML 문자열
     */
    renderCountryFilters(currentSort) {
        return `
            <div class="country-filters">
                <div class="filter-group">
                    <label for="continent-filter" class="filter-label">대륙</label>
                    <select id="continent-filter" class="filter-select">
                        <option value="all">전체</option>
                        <option value="Asia">아시아</option>
                        <option value="Europe">유럽</option>
                        <option value="North America">북미</option>
                        <option value="South America">남미</option>
                        <option value="Africa">아프리카</option>
                        <option value="Oceania">오세아니아</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="sort-filter" class="filter-label">정렬</label>
                    <select id="sort-filter" class="filter-select">
                        <option value="visitCount" ${currentSort === 'visitCount' ? 'selected' : ''}>방문 횟수</option>
                        <option value="lastVisit" ${currentSort === 'lastVisit' ? 'selected' : ''}>최근 방문</option>
                        <option value="totalDays" ${currentSort === 'totalDays' ? 'selected' : ''}>총 여행일</option>
                        <option value="averageRating" ${currentSort === 'averageRating' ? 'selected' : ''}>평균 별점</option>
                        <option value="name" ${currentSort === 'name' ? 'selected' : ''}>이름순</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="search-filter" class="filter-label">검색</label>
                    <input type="text" id="search-filter" class="filter-input" placeholder="국가명 검색...">
                </div>
            </div>
        `;
    }

    /**
     * 대륙별 통계를 렌더링합니다
     * @param {Array} continentStats - 대륙별 통계
     * @returns {string} HTML 문자열
     */
    renderContinentStats(continentStats) {
        return `
            <div class="continent-stats-container">
                <div class="continent-stats-grid">
                    ${continentStats.map(continent => this.renderContinentCard(continent)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 대륙 카드를 렌더링합니다
     * @param {Object} continent - 대륙 정보
     * @returns {string} HTML 문자열
     */
    renderContinentCard(continent) {
        return `
            <div class="continent-card" data-continent="${continent.continent}">
                <div class="continent-header">
                    <div class="continent-emoji">${continent.emoji}</div>
                    <div class="continent-name">${continent.nameKo}</div>
                </div>
                
                <div class="continent-progress">
                    <div class="progress-info">
                        <span class="progress-text">${continent.visited}/${continent.total}개국</span>
                        <span class="progress-percentage">${continent.percentage}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${continent.progressBar.color}" style="width: ${continent.progressBar.width}%"></div>
                    </div>
                </div>
                
                <div class="continent-status status-${continent.status}">
                    ${this._getStatusText(continent.status)}
                </div>
            </div>
        `;
    }

    /**
     * 상태에 따른 텍스트 반환
     * @param {string} status - 상태
     * @returns {string} 상태 텍스트
     * @private
     */
    _getStatusText(status) {
        const statusTexts = {
            'excellent': '완벽!',
            'good': '좋음',
            'fair': '보통',
            'poor': '부족',
            'very-poor': '시작 필요'
        };
        return statusTexts[status] || '알 수 없음';
    }

    /**
     * 로딩 상태를 렌더링합니다
     * @param {string} message - 로딩 메시지
     * @returns {string} HTML 문자열
     */
    renderLoading(message = '로딩 중...') {
        return `
            <div class="collection-loading">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
    }

    /**
     * 에러 상태를 렌더링합니다
     * @param {string} message - 에러 메시지
     * @returns {string} HTML 문자열
     */
    renderError(message = '데이터를 불러올 수 없습니다.') {
        return `
            <div class="collection-error">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${message}</div>
                <button class="error-retry">다시 시도</button>
            </div>
        `;
    }

    /**
     * 애니메이션을 실행합니다
     * @param {HTMLElement} element - 애니메이션할 요소
     * @param {string} animationType - 애니메이션 타입
     */
    animateElement(element, animationType = 'fadeIn') {
        if (!element) return;

        const animations = {
            fadeIn: 'collection-fade-in',
            slideIn: 'collection-slide-in',
            scaleIn: 'collection-scale-in',
            bounceIn: 'collection-bounce-in'
        };

        const animationClass = animations[animationType] || animations.fadeIn;
        
        element.classList.add(animationClass);
        
        // 애니메이션 완료 후 클래스 제거
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 500);
    }

    /**
     * 카운트업 애니메이션을 실행합니다
     * @param {HTMLElement} element - 애니메이션할 요소
     * @param {number} targetValue - 목표 값
     * @param {number} duration - 애니메이션 지속 시간 (ms)
     */
    animateCountUp(element, targetValue, duration = 1000) {
        if (!element) return;

        const startValue = 0;
        const increment = targetValue / (duration / 16); // 60fps 기준
        let currentValue = startValue;

        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            element.textContent = Math.floor(currentValue);
        }, 16);
    }

    /**
     * 렌더러 정리
     */
    cleanup() {
        this.animationQueue = [];
        this.isAnimating = false;
    }
}

export { CollectionRenderer };
