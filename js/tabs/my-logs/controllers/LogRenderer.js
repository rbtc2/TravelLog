/**
 * LogRenderer - 로그 UI 렌더링 전용 렌더러
 * 
 * 🎯 책임:
 * - 로그 목록 및 카드 렌더링
 * - 로그 상세 정보 렌더링
 * - 로그 검색 및 필터 UI 렌더링
 * - 로그 통계 및 차트 렌더링
 * 
 * @class LogRenderer
 * @version 1.0.0
 * @since 2024-12-29
 */

class LogRenderer {
    constructor() {
        this.isInitialized = false;
        this.animationQueue = [];
        this.isAnimating = false;
    }

    /**
     * 렌더러 초기화
     */
    async initialize() {
        try {
            console.log('LogRenderer: 초기화 시작');
            this.isInitialized = true;
            console.log('LogRenderer: 초기화 완료');
        } catch (error) {
            console.error('LogRenderer: 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 로그 목록을 렌더링합니다
     * @param {Array} logs - 로그 배열
     * @param {Object} options - 렌더링 옵션
     * @returns {string} HTML 문자열
     */
    renderLogList(logs, options = {}) {
        try {
            const {
                showFilters = true,
                showPagination = true,
                itemsPerPage = 10,
                currentPage = 1,
                sortBy = 'startDate',
                sortOrder = 'desc'
            } = options;

            if (!logs || logs.length === 0) {
                return this.renderEmptyState('등록된 여행 로그가 없습니다.');
            }

            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedLogs = logs.slice(startIndex, endIndex);
            const totalPages = Math.ceil(logs.length / itemsPerPage);

            return `
                <div class="log-list-container">
                    ${showFilters ? this.renderLogFilters(sortBy, sortOrder) : ''}
                    
                    <div class="log-list-header">
                        <div class="log-count">총 ${logs.length}개의 여행 로그</div>
                        <div class="log-actions">
                            <button class="btn btn-primary" onclick="openAddLogModal()">
                                <span class="btn-icon">➕</span>
                                새 로그 추가
                            </button>
                        </div>
                    </div>
                    
                    <div class="log-grid">
                        ${paginatedLogs.map(log => this.renderLogCard(log)).join('')}
                    </div>
                    
                    ${showPagination && totalPages > 1 ? this.renderPagination(currentPage, totalPages) : ''}
                </div>
            `;
        } catch (error) {
            console.error('LogRenderer: renderLogList 실패:', error);
            return this.renderError('로그 목록을 불러올 수 없습니다.');
        }
    }

    /**
     * 로그 카드를 렌더링합니다
     * @param {Object} log - 로그 데이터
     * @returns {string} HTML 문자열
     */
    renderLogCard(log) {
        try {
            const startDate = new Date(log.startDate).toLocaleDateString('ko-KR');
            const endDate = new Date(log.endDate).toLocaleDateString('ko-KR');
            const duration = log.duration || this._calculateDuration(log.startDate, log.endDate);
            const rating = log.rating ? this._renderStars(log.rating) : '<span class="no-rating">별점 없음</span>';
            
            return `
                <div class="log-card" data-log-id="${log.id}">
                    <div class="log-card-header">
                        <div class="log-country">
                            <span class="country-flag">${this._getCountryFlag(log.country)}</span>
                            <span class="country-name">${log.country}</span>
                        </div>
                        <div class="log-actions">
                            <button class="btn-icon" onclick="editLog('${log.id}')" title="수정">
                                ✏️
                            </button>
                            <button class="btn-icon" onclick="deleteLog('${log.id}')" title="삭제">
                                🗑️
                            </button>
                        </div>
                    </div>
                    
                    <div class="log-card-content">
                        <div class="log-city">${log.city || '도시 미입력'}</div>
                        <div class="log-dates">
                            <span class="date-range">${startDate} ~ ${endDate}</span>
                            <span class="duration">(${duration}일)</span>
                        </div>
                        <div class="log-purpose">${log.purpose || '목적 미입력'}</div>
                        <div class="log-rating">${rating}</div>
                    </div>
                    
                    ${log.notes ? `
                        <div class="log-card-footer">
                            <div class="log-notes">${this._truncateText(log.notes, 100)}</div>
                        </div>
                    ` : ''}
                    
                    <div class="log-card-actions">
                        <button class="btn btn-outline" onclick="viewLogDetail('${log.id}')">
                            상세보기
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('LogRenderer: renderLogCard 실패:', error);
            return this.renderError('로그 카드를 렌더링할 수 없습니다.');
        }
    }

    /**
     * 로그 상세 정보를 렌더링합니다
     * @param {Object} log - 로그 데이터
     * @returns {string} HTML 문자열
     */
    renderLogDetail(log) {
        try {
            const startDate = new Date(log.startDate).toLocaleDateString('ko-KR');
            const endDate = new Date(log.endDate).toLocaleDateString('ko-KR');
            const duration = log.duration || this._calculateDuration(log.startDate, log.endDate);
            const rating = log.rating ? this._renderStars(log.rating) : '<span class="no-rating">별점 없음</span>';
            const createdAt = new Date(log.createdAt).toLocaleDateString('ko-KR');
            const updatedAt = new Date(log.updatedAt).toLocaleDateString('ko-KR');

            return `
                <div class="log-detail-container">
                    <div class="log-detail-header">
                        <div class="log-detail-country">
                            <span class="country-flag">${this._getCountryFlag(log.country)}</span>
                            <span class="country-name">${log.country}</span>
                        </div>
                        <div class="log-detail-actions">
                            <button class="btn btn-outline" onclick="editLog('${log.id}')">
                                <span class="btn-icon">✏️</span>
                                수정
                            </button>
                            <button class="btn btn-danger" onclick="deleteLog('${log.id}')">
                                <span class="btn-icon">🗑️</span>
                                삭제
                            </button>
                        </div>
                    </div>
                    
                    <div class="log-detail-content">
                        <div class="detail-section">
                            <h3>기본 정보</h3>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>도시</label>
                                    <span>${log.city || '미입력'}</span>
                                </div>
                                <div class="detail-item">
                                    <label>여행 기간</label>
                                    <span>${startDate} ~ ${endDate} (${duration}일)</span>
                                </div>
                                <div class="detail-item">
                                    <label>여행 목적</label>
                                    <span>${log.purpose || '미입력'}</span>
                                </div>
                                <div class="detail-item">
                                    <label>별점</label>
                                    <span>${rating}</span>
                                </div>
                            </div>
                        </div>
                        
                        ${log.notes ? `
                            <div class="detail-section">
                                <h3>메모</h3>
                                <div class="log-notes-detail">${log.notes}</div>
                            </div>
                        ` : ''}
                        
                        ${log.photos && log.photos.length > 0 ? `
                            <div class="detail-section">
                                <h3>사진</h3>
                                <div class="log-photos">
                                    ${log.photos.map(photo => `
                                        <img src="${photo}" alt="여행 사진" class="log-photo" onclick="openPhotoModal('${photo}')">
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="detail-section">
                            <h3>기타 정보</h3>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>생성일</label>
                                    <span>${createdAt}</span>
                                </div>
                                <div class="detail-item">
                                    <label>수정일</label>
                                    <span>${updatedAt}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('LogRenderer: renderLogDetail 실패:', error);
            return this.renderError('로그 상세 정보를 렌더링할 수 없습니다.');
        }
    }

    /**
     * 로그 필터를 렌더링합니다
     * @param {string} currentSort - 현재 정렬 기준
     * @param {string} currentOrder - 현재 정렬 순서
     * @returns {string} HTML 문자열
     */
    renderLogFilters(currentSort, currentOrder) {
        return `
            <div class="log-filters">
                <div class="filter-group">
                    <label for="log-search" class="filter-label">검색</label>
                    <input type="text" id="log-search" class="filter-input" placeholder="국가, 도시, 목적으로 검색...">
                </div>
                
                <div class="filter-group">
                    <label for="log-country-filter" class="filter-label">국가</label>
                    <select id="log-country-filter" class="filter-select">
                        <option value="">전체</option>
                        <option value="KR">대한민국</option>
                        <option value="US">미국</option>
                        <option value="JP">일본</option>
                        <option value="CN">중국</option>
                        <option value="GB">영국</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="log-year-filter" class="filter-label">연도</label>
                    <select id="log-year-filter" class="filter-select">
                        <option value="">전체</option>
                        <option value="2024">2024년</option>
                        <option value="2023">2023년</option>
                        <option value="2022">2022년</option>
                        <option value="2021">2021년</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="log-purpose-filter" class="filter-label">목적</label>
                    <select id="log-purpose-filter" class="filter-select">
                        <option value="">전체</option>
                        <option value="관광">관광</option>
                        <option value="비즈니스">비즈니스</option>
                        <option value="방문">방문</option>
                        <option value="학습">학습</option>
                        <option value="휴양">휴양</option>
                        <option value="의료">의료</option>
                        <option value="기타">기타</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="log-sort" class="filter-label">정렬</label>
                    <select id="log-sort" class="filter-select">
                        <option value="startDate" ${currentSort === 'startDate' ? 'selected' : ''}>여행일</option>
                        <option value="country" ${currentSort === 'country' ? 'selected' : ''}>국가</option>
                        <option value="city" ${currentSort === 'city' ? 'selected' : ''}>도시</option>
                        <option value="purpose" ${currentSort === 'purpose' ? 'selected' : ''}>목적</option>
                        <option value="rating" ${currentSort === 'rating' ? 'selected' : ''}>별점</option>
                        <option value="createdAt" ${currentSort === 'createdAt' ? 'selected' : ''}>등록일</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="log-order" class="filter-label">순서</label>
                    <select id="log-order" class="filter-select">
                        <option value="desc" ${currentOrder === 'desc' ? 'selected' : ''}>내림차순</option>
                        <option value="asc" ${currentOrder === 'asc' ? 'selected' : ''}>오름차순</option>
                    </select>
                </div>
                
                <div class="filter-actions">
                    <button class="btn btn-outline" onclick="clearLogFilters()">초기화</button>
                    <button class="btn btn-primary" onclick="applyLogFilters()">적용</button>
                </div>
            </div>
        `;
    }

    /**
     * 페이지네이션을 렌더링합니다
     * @param {number} currentPage - 현재 페이지
     * @param {number} totalPages - 전체 페이지 수
     * @returns {string} HTML 문자열
     */
    renderPagination(currentPage, totalPages) {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return `
            <div class="pagination">
                <button class="pagination-btn" onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>
                    ⏮️
                </button>
                <button class="pagination-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                    ◀️
                </button>
                
                ${pages.map(page => `
                    <button class="pagination-btn ${page === currentPage ? 'active' : ''}" 
                            onclick="goToPage(${page})">
                        ${page}
                    </button>
                `).join('')}
                
                <button class="pagination-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                    ▶️
                </button>
                <button class="pagination-btn" onclick="goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
                    ⏭️
                </button>
            </div>
        `;
    }

    /**
     * 로그 통계를 렌더링합니다
     * @param {Object} statistics - 통계 데이터
     * @returns {string} HTML 문자열
     */
    renderLogStatistics(statistics) {
        try {
            const { total, groups, summary } = statistics;
            
            return `
                <div class="log-statistics">
                    <h3>여행 로그 통계</h3>
                    
                    <div class="stats-overview">
                        <div class="stat-card">
                            <div class="stat-value">${total}</div>
                            <div class="stat-label">총 로그 수</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${summary.totalDays}</div>
                            <div class="stat-label">총 여행일</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${summary.averageRating.toFixed(1)}</div>
                            <div class="stat-label">평균 별점</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${summary.countries.length}</div>
                            <div class="stat-label">방문 국가</div>
                        </div>
                    </div>
                    
                    <div class="stats-groups">
                        ${Object.entries(groups).map(([groupKey, groupStats]) => `
                            <div class="group-stat">
                                <h4>${groupKey}</h4>
                                <div class="group-details">
                                    <span>${groupStats.count}개 로그</span>
                                    <span>${groupStats.totalDays}일</span>
                                    <span>평균 ${groupStats.averageRating.toFixed(1)}점</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('LogRenderer: renderLogStatistics 실패:', error);
            return this.renderError('통계를 렌더링할 수 없습니다.');
        }
    }

    /**
     * 빈 상태를 렌더링합니다
     * @param {string} message - 메시지
     * @returns {string} HTML 문자열
     */
    renderEmptyState(message) {
        return `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <div class="empty-message">${message}</div>
                <button class="btn btn-primary" onclick="openAddLogModal()">
                    <span class="btn-icon">➕</span>
                    첫 여행 로그 추가하기
                </button>
            </div>
        `;
    }

    /**
     * 에러 상태를 렌더링합니다
     * @param {string} message - 에러 메시지
     * @returns {string} HTML 문자열
     */
    renderError(message) {
        return `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${message}</div>
                <button class="btn btn-outline" onclick="location.reload()">
                    새로고침
                </button>
            </div>
        `;
    }

    /**
     * 별점을 렌더링합니다
     * @param {number} rating - 별점
     * @returns {string} HTML 문자열
     * @private
     */
    _renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // 별점
        for (let i = 0; i < fullStars; i++) {
            stars += '⭐';
        }
        
        if (hasHalfStar) {
            stars += '✨';
        }
        
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }
        
        return `<span class="rating-stars">${stars}</span>`;
    }

    /**
     * 국가별 플래그를 반환합니다
     * @param {string} countryCode - 국가 코드
     * @returns {string} 플래그 이모지
     * @private
     */
    _getCountryFlag(countryCode) {
        const flags = {
            'KR': '🇰🇷',
            'US': '🇺🇸',
            'JP': '🇯🇵',
            'CN': '🇨🇳',
            'GB': '🇬🇧',
            'FR': '🇫🇷',
            'DE': '🇩🇪',
            'IT': '🇮🇹',
            'ES': '🇪🇸',
            'CA': '🇨🇦',
            'AU': '🇦🇺',
            'BR': '🇧🇷',
            'IN': '🇮🇳',
            'RU': '🇷🇺',
            'MX': '🇲🇽'
        };
        return flags[countryCode] || '🏳️';
    }

    /**
     * 텍스트를 자릅니다
     * @param {string} text - 원본 텍스트
     * @param {number} maxLength - 최대 길이
     * @returns {string} 잘린 텍스트
     * @private
     */
    _truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }

    /**
     * 여행 일수를 계산합니다
     * @param {string} startDate - 시작일
     * @param {string} endDate - 종료일
     * @returns {number} 여행 일수
     * @private
     */
    _calculateDuration(startDate, endDate) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        } catch (error) {
            return 1;
        }
    }

    /**
     * 렌더러 정리
     */
    cleanup() {
        this.animationQueue = [];
        this.isAnimating = false;
    }
}

export { LogRenderer };
