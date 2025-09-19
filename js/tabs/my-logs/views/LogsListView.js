/**
 * LogsListView - 로그 목록 화면 렌더링 및 이벤트 처리
 * 
 * 🎯 책임:
 * - 로그 목록 화면 UI 렌더링
 * - 로그 목록 화면 이벤트 바인딩
 * - 페이지네이션 관리
 * - 로그 아이템 렌더링
 * 
 * @class LogsListView
 */
import { EventManager } from '../../../modules/utils/event-manager.js';
import { ViewManager } from '../../../modules/ui-components/view-manager.js';
import { PaginationManager } from '../../../modules/ui-components/pagination-manager.js';

class LogsListView {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.viewManager = new ViewManager();
        this.paginationManager = new PaginationManager();
        this.container = null;
        
        // 저장된 뷰 모드 불러오기 (기본값: 'card')
        this.viewMode = localStorage.getItem('travelLog_viewMode') || 'card';
    }

    /**
     * 로그 목록 화면을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    render(container) {
        this.container = container;
        // 로그 목록 뷰 CSS 네임스페이스 클래스 추가
        this.container.classList.add('logs-list-view');
        this.renderLogsList();
        this.bindEvents();
    }

    /**
     * 로그 목록을 렌더링합니다
     */
    renderLogsList() {
        // LogService를 사용하여 페이지네이션된 로그 가져오기
        const pageData = this.controller.getLogsByPage(
            this.controller.logService.currentPage, 
            this.controller.logService.logsPerPage
        );
        
        // ViewManager를 사용하여 로그 목록 렌더링
        this.container.innerHTML = this.viewManager.renderLogsList(
            this.controller.logService,
            (log) => this.renderLogItem(log),
            (totalPages) => this.renderPagination(totalPages),
            this.viewMode
        );
    }

    /**
     * 개별 일지 아이템을 렌더링합니다
     * @param {Object} log - 로그 객체
     * @returns {string} HTML 문자열
     */
    renderLogItem(log) {
        if (this.viewMode === 'list') {
            return this.renderLogItemList(log);
        } else {
            return this.renderLogItemCard(log);
        }
    }

    /**
     * 국가 정보를 조회하고 표시용 데이터를 반환합니다
     * @param {Object} log - 로그 객체
     * @returns {Object} 국가 표시 정보
     */
    getCountryDisplayInfo(log) {
        let countryDisplayName = log.country;
        let countryFlag = '🇰🇷'; // 기본값
        
        // 국가 코드인 경우 한국어 국가명으로 변환
        if (log.country && log.country.length === 2) {
            try {
                const countryInfo = this.controller.getCountryByCode(log.country);
                if (countryInfo) {
                    countryDisplayName = countryInfo.nameKo;
                    countryFlag = countryInfo.flag;
                }
            } catch (error) {
                // 국가 정보 조회 실패 시 기본값 사용
            }
        }
        
        return { countryDisplayName, countryFlag };
    }

    /**
     * ViewManager 메서드를 안전하게 호출합니다
     * @param {Object} log - 로그 객체
     * @returns {Object} ViewManager 결과
     */
    getViewManagerData(log) {
        try {
            return {
                purposeIcon: this.viewManager.getPurposeIcon(log.purpose),
                purposeText: this.viewManager.getPurposeText(log.purpose),
                travelStyleText: log.travelStyle ? this.viewManager.getTravelStyleText(log.travelStyle) : '',
                memoText: log.memo ? this.viewManager.truncateMemo(log.memo) : ''
            };
        } catch (error) {
            return {
                purposeIcon: '✈️',
                purposeText: log.purpose || '기타',
                travelStyleText: log.travelStyle || '',
                memoText: log.memo ? (log.memo.length > 50 ? log.memo.substring(0, 50) + '...' : log.memo) : ''
            };
        }
    }

    /**
     * 카드 형태의 일지 아이템을 렌더링합니다
     * @param {Object} log - 로그 객체
     * @returns {string} HTML 문자열
     */
    renderLogItemCard(log) {
        const startDate = new Date(log.startDate);
        const endDate = new Date(log.endDate);
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        const { purposeIcon, purposeText, travelStyleText, memoText } = this.getViewManagerData(log);
        const { countryDisplayName, countryFlag } = this.getCountryDisplayInfo(log);
        const ratingStars = '★'.repeat(parseInt(log.rating)) + '☆'.repeat(5 - parseInt(log.rating));
        
        return `
            <div class="log-item log-item-card clickable" data-log-id="${log.id}">
            <!-- 1행: 헤더 (국가명 + 국가코드 + 도시명 + 편집/삭제 버튼) -->
            <div class="log-header">
                <div class="log-header-left">
                    <div class="log-location-info">
                        <span class="log-country">${countryDisplayName}</span>
                        <span class="log-country-badge" title="국가 코드">${countryFlag}</span>
                        <span class="log-city">${log.city}</span>
                    </div>
                </div>
                
                <div class="log-header-right">
                    <div class="log-action-buttons">
                        <button class="log-action-btn edit-btn" data-log-id="${log.id}" title="편집" aria-label="일지 편집">
                            ✏️
                        </button>
                        <button class="log-action-btn delete-btn" data-log-id="${log.id}" title="삭제" aria-label="일지 삭제">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
                
                <!-- 2행: 기간/목적 칩 -->
                <div class="log-chips-row">
                    <div class="log-chip duration-chip">
                        <span class="chip-icon">📅</span>
                        <span class="chip-text">${duration}일</span>
                    </div>
                    <div class="log-chip purpose-chip">
                        <span class="chip-icon">${purposeIcon}</span>
                        <span class="chip-text">${purposeText}</span>
                    </div>
                </div>
                
                <div class="log-details">
                    <div class="log-dates">
                        <div class="log-date-range">
                            <span class="date-label">📅</span>
                            ${startDate.toLocaleDateString('ko-KR')} ~ ${endDate.toLocaleDateString('ko-KR')}
                        </div>
                    </div>
                    
                    <div class="log-rating">
                        <span class="rating-label">평점:</span>
                        <span class="rating-stars">${ratingStars}</span>
                        <span class="rating-value">(${log.rating}/5)</span>
                    </div>
                    
                    ${log.travelStyle ? `
                        <div class="log-travel-style">
                            <span class="style-icon">🎒</span>
                            <span class="style-text">${travelStyleText}</span>
                        </div>
                    ` : ''}
                    
                    ${log.memo ? `
                        <div class="log-memo">
                            <span class="memo-icon">💭</span>
                            <span class="memo-text">${memoText}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="log-footer">
                    <div class="log-created">
                        작성일: ${new Date(log.createdAt).toLocaleDateString('ko-KR')}
                        ${log.updatedAt ? `<span class="log-updated"> | 수정일: ${new Date(log.updatedAt).toLocaleDateString('ko-KR')}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 리스트 형태의 일지 아이템을 렌더링합니다 (한 줄)
     * @param {Object} log - 로그 객체
     * @returns {string} HTML 문자열
     */
    renderLogItemList(log) {
        const startDate = new Date(log.startDate);
        const endDate = new Date(log.endDate);
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        const { purposeIcon, purposeText } = this.getViewManagerData(log);
        const { countryDisplayName, countryFlag } = this.getCountryDisplayInfo(log);
        
        return `
            <div class="log-item log-item-list clickable" data-log-id="${log.id}">
                <div class="log-list-content">
                    <div class="log-list-left">
                        <div class="log-list-flag">${countryFlag}</div>
                        <div class="log-list-info">
                            <div class="log-list-location">${countryDisplayName} · ${log.city}</div>
                            <div class="log-list-dates">${startDate.toLocaleDateString('ko-KR')} ~ ${endDate.toLocaleDateString('ko-KR')}</div>
                        </div>
                    </div>
                    <div class="log-list-center">
                        <div class="log-list-chips">
                            <span class="log-list-chip duration">${duration}일</span>
                            <span class="log-list-chip purpose">${purposeIcon} ${purposeText}</span>
                        </div>
                    </div>
                    <div class="log-list-right">
                        <div class="log-list-rating">${'★'.repeat(parseInt(log.rating))}${'☆'.repeat(5 - parseInt(log.rating))}</div>
                        <div class="log-list-actions">
                            <button class="log-action-btn edit-btn" data-log-id="${log.id}" title="편집">
                                ✏️
                            </button>
                            <button class="log-action-btn delete-btn" data-log-id="${log.id}" title="삭제">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 페이지네이션을 렌더링합니다
     * @param {number} totalPages - 전체 페이지 수
     * @returns {string} HTML 문자열
     */
    renderPagination(totalPages) {
        return this.paginationManager.renderPagination(totalPages, this.controller.logService.currentPage);
    }

    /**
     * 로그 목록 화면의 이벤트를 바인딩합니다
     */
    bindEvents() {
        // 이벤트 위임을 사용하여 동적 요소들 처리
        this.eventManager.add(this.container, 'click', (e) => {
            // 뒤로 가기 버튼
            if (e.target.id === 'back-to-hub') {
                this.onNavigateBack();
                return;
            }
            
            // 편집 버튼
            if (e.target.classList.contains('edit-btn')) {
                e.stopPropagation();
                const logId = e.target.dataset.logId;
                this.onEditLog(logId);
                return;
            }
            
            // 삭제 버튼
            if (e.target.classList.contains('delete-btn')) {
                e.stopPropagation();
                const logId = e.target.dataset.logId;
                this.onDeleteLog(logId);
                return;
            }
            
            // 페이지네이션 버튼
            if (e.target.classList.contains('page-btn')) {
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.controller.logService.currentPage) {
                    this.onPageChange(page);
                }
                return;
            }
            
            // 뷰 모드 토글 버튼
            if (e.target.classList.contains('view-mode-btn')) {
                const mode = e.target.dataset.mode;
                this.onViewModeChange(mode);
                return;
            }
            
            // 로그 아이템 클릭 (상세 화면으로 이동)
            const logItem = e.target.closest('.log-item.clickable');
            if (logItem && !e.target.closest('.log-action-btn')) {
                const logId = logItem.dataset.logId;
                this.onShowLogDetail(logId);
            }
        });
    }

    /**
     * 뒤로 가기
     */
    onNavigateBack() {
        this.controller.setCurrentPage(1); // 페이지 초기화
        this.dispatchEvent('navigate', { view: 'hub' });
    }

    /**
     * 로그 편집
     * @param {string} logId - 로그 ID
     */
    onEditLog(logId) {
        this.dispatchEvent('editLog', { logId });
    }

    /**
     * 로그 삭제
     * @param {string} logId - 로그 ID
     */
    onDeleteLog(logId) {
        this.dispatchEvent('deleteLog', { logId });
    }

    /**
     * 로그 상세 보기
     * @param {string} logId - 로그 ID
     */
    onShowLogDetail(logId) {
        this.dispatchEvent('showLogDetail', { logId });
    }

    /**
     * 페이지 변경
     * @param {number} page - 페이지 번호
     */
    onPageChange(page) {
        this.controller.setCurrentPage(page);
        this.renderLogsList();
        // 이벤트 위임을 사용하므로 bindEvents() 재호출 불필요
    }

    /**
     * 뷰 모드 변경
     * @param {string} mode - 뷰 모드 ('card' 또는 'list')
     */
    onViewModeChange(mode) {
        if (mode === this.viewMode) return;
        
        this.viewMode = mode;
        this.renderLogsList();
        // 이벤트 위임을 사용하므로 bindEvents() 재호출 불필요
        
        // 뷰 모드 상태를 로컬 스토리지에 저장
        localStorage.setItem('travelLog_viewMode', mode);
    }

    /**
     * 커스텀 이벤트를 발생시킵니다
     * @param {string} eventName - 이벤트 이름
     * @param {Object} detail - 이벤트 상세 정보
     */
    dispatchEvent(eventName, detail) {
        if (this.container) {
            const event = new CustomEvent(`logsListView:${eventName}`, { detail });
            this.container.dispatchEvent(event);
        }
    }

    /**
     * View 정리
     */
    cleanup() {
        if (this.eventManager) {
            this.eventManager.cleanup();
        }
        this.container = null;
    }
}

export { LogsListView };
