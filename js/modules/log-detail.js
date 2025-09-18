/**
 * 일정 상세 화면 모듈
 * 개별 여행 일정의 상세 정보와 분석/지도 섹션을 표시합니다
 */

import LogEditModule from './log-edit.js';

class LogDetailModule {
    constructor() {
        this.currentLog = null;
        this.eventListeners = [];
        this.logEditModule = new LogEditModule();
    }
    
    /**
     * 상세 화면을 렌더링합니다
     * @param {HTMLElement} container - 컨테이너 요소
     * @param {Object} logData - 로그 데이터
     * @param {Object} options - 옵션 (context: 'calendar' | 'mylogs')
     */
    render(container, logData, options = {}) {
        this.currentLog = logData;
        this.container = container;
        this.context = options.context || 'mylogs';
        
        const detailHTML = this.generateDetailHTML(logData);
        container.innerHTML = detailHTML;
        
        this.bindEvents();
    }
    
    /**
     * 상세 화면 HTML을 생성합니다
     */
    generateDetailHTML(log) {
        const startDate = new Date(log.startDate);
        const endDate = new Date(log.endDate);
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        const purposeIcon = this.getPurposeIcon(log.purpose);
        const ratingStars = '★'.repeat(parseInt(log.rating)) + '☆'.repeat(5 - parseInt(log.rating));
        
        // 컨텍스트에 따라 다른 컨테이너 클래스 사용
        const containerClass = this.context === 'calendar' ? 'calendar-detail-container' : 'log-detail-container';
        const headerClass = this.context === 'calendar' ? 'calendar-detail-header' : 'detail-header';
        const titleClass = this.context === 'calendar' ? 'calendar-detail-title' : 'detail-title';
        const contentClass = this.context === 'calendar' ? 'calendar-detail-content' : 'detail-content';
        
        return `
            <div class="${containerClass}">
                <!-- 상단 액션 버튼들 -->
                <div class="top-actions">
                    <button class="back-btn" id="back-to-logs">◀ 뒤로</button>
                    <div class="header-actions">
                        <button class="action-btn edit-btn" id="edit-log-btn" title="편집">
                            ✏️
                        </button>
                        <button class="action-btn delete-btn" id="delete-log-btn" title="삭제">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <!-- 내용 -->
                <div class="${contentClass}">
                
                <!-- 요약 카드 -->
                <div class="summary-card">
                    <div class="summary-header">
                        <div class="location-info">
                            <div class="country-city">
                                <span class="country">${log.country}</span>
                                <span class="city">${log.city}</span>
                            </div>
                            <div class="flag">🏳️</div>
                        </div>
                        
                        <div class="trip-meta">
                            <div class="meta-item">
                                <span class="meta-icon">📅</span>
                                <span class="meta-text">${duration}일</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-icon">${purposeIcon}</span>
                                <span class="meta-text">${this.getPurposeText(log.purpose)}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-icon">⭐</span>
                                <span class="meta-text">${log.rating}/5</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="summary-details">
                        <div class="date-range">
                            <div class="date-item">
                                <span class="date-label">출발</span>
                                <span class="date-value">${startDate.toLocaleDateString('ko-KR')}</span>
                            </div>
                            <div class="date-separator">→</div>
                            <div class="date-item">
                                <span class="date-label">도착</span>
                                <span class="date-value">${endDate.toLocaleDateString('ko-KR')}</span>
                            </div>
                        </div>
                        
                        ${log.travelStyle ? `
                            <div class="travel-style">
                                <span class="style-icon">🎒</span>
                                <span class="style-text">${this.getTravelStyleText(log.travelStyle)}</span>
                            </div>
                        ` : ''}
                        
                        ${log.memo ? `
                            <div class="memo-section">
                                <div class="memo-header">
                                    <span class="memo-icon">💭</span>
                                    <span class="memo-title">메모</span>
                                </div>
                                <div class="memo-content">${log.memo}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- 분석 섹션 -->
                <div class="analysis-section">
                    <div class="section-header">
                        <h2 class="section-title">📊 여행 분석</h2>
                        <p class="section-subtitle">이 여행에 대한 인사이트와 통계</p>
                    </div>
                    
                    <div class="analysis-grid">
                        <!-- 비용 분석 -->
                        <div class="analysis-card">
                            <div class="card-header">
                                <h3 class="card-title">💰 비용 분석</h3>
                                <div class="card-status">준비 중</div>
                            </div>
                            <div class="card-content skeleton">
                                <div class="skeleton-item"></div>
                                <div class="skeleton-item"></div>
                                <div class="skeleton-item"></div>
                            </div>
                        </div>
                        
                        <!-- 활동 분석 -->
                        <div class="analysis-card">
                            <div class="card-header">
                                <h3 class="card-title">🎯 활동 분석</h3>
                                <div class="card-status">준비 중</div>
                            </div>
                            <div class="card-content skeleton">
                                <div class="skeleton-item"></div>
                                <div class="skeleton-item"></div>
                                <div class="skeleton-item"></div>
                            </div>
                        </div>
                        
                        <!-- 감정 분석 -->
                        <div class="analysis-card">
                            <div class="card-header">
                                <h3 class="card-title">😊 감정 분석</h3>
                                <div class="card-status">준비 중</div>
                            </div>
                            <div class="card-content skeleton">
                                <div class="skeleton-item"></div>
                                <div class="skeleton-item"></div>
                                <div class="skeleton-item"></div>
                            </div>
                        </div>
                        
                        <!-- 패턴 분석 -->
                        <div class="analysis-card">
                            <div class="card-header">
                                <h3 class="card-title">🔄 패턴 분석</h3>
                                <div class="card-status">준비 중</div>
                            </div>
                            <div class="card-content skeleton">
                                <div class="skeleton-item"></div>
                                <div class="skeleton-item"></div>
                                <div class="skeleton-item"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 지도 섹션 -->
                <div class="map-section">
                    <div class="section-header">
                        <h2 class="section-title">🗺️ 여행 지도</h2>
                        <p class="section-subtitle">방문한 장소와 경로를 지도에서 확인</p>
                    </div>
                    
                    <div class="map-container skeleton">
                        <div class="map-placeholder">
                            <div class="map-icon">🗺️</div>
                            <div class="map-text">지도 로딩 중...</div>
                            <div class="map-subtext">Google Maps API 연동 예정</div>
                        </div>
                    </div>
                    
                    <div class="map-controls">
                        <button class="map-btn disabled" disabled>
                            📍 핀 추가
                        </button>
                        <button class="map-btn disabled" disabled>
                            🛣️ 경로 그리기
                        </button>
                        <button class="map-btn disabled" disabled>
                            📸 사진 연동
                        </button>
                    </div>
                </div>
                
                <!-- 통계 섹션 -->
                <div class="stats-section">
                    <div class="section-header">
                        <h2 class="section-title">📈 상세 통계</h2>
                        <p class="section-subtitle">이 여행의 구체적인 수치들</p>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card skeleton">
                            <div class="stat-header">
                                <h3 class="stat-title">총 이동 거리</h3>
                            </div>
                            <div class="stat-content">
                                <div class="skeleton-value"></div>
                                <div class="skeleton-label"></div>
                            </div>
                        </div>
                        
                        <div class="stat-card skeleton">
                            <div class="stat-header">
                                <h3 class="stat-title">방문 장소 수</h3>
                            </div>
                            <div class="stat-content">
                                <div class="skeleton-value"></div>
                                <div class="skeleton-label"></div>
                            </div>
                        </div>
                        
                        <div class="stat-card skeleton">
                            <div class="stat-header">
                                <h3 class="stat-title">평균 체류 시간</h3>
                            </div>
                            <div class="stat-content">
                                <div class="skeleton-value"></div>
                                <div class="skeleton-label"></div>
                            </div>
                        </div>
                        
                        <div class="stat-card skeleton">
                            <div class="stat-header">
                                <h3 class="stat-title">사진 수</h3>
                            </div>
                            <div class="stat-content">
                                <div class="skeleton-value"></div>
                                <div class="skeleton-label"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 하단 액션 버튼 -->
                <div class="bottom-actions">
                    <button class="action-btn primary" id="share-log-btn">
                        📤 공유하기
                    </button>
                    <button class="action-btn secondary" id="export-log-btn">
                        📄 내보내기
                    </button>
                </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 이벤트를 바인딩합니다
     */
    bindEvents() {
        // 뒤로 가기 버튼
        const backBtn = document.getElementById('back-to-logs');
        if (backBtn) {
            this.addEventListener(backBtn, 'click', () => {
                this.goBack();
            });
        }
        
        // 편집 버튼
        const editBtn = document.getElementById('edit-log-btn');
        if (editBtn) {
            this.addEventListener(editBtn, 'click', () => {
                this.editLog();
            });
        }
        
        // 삭제 버튼
        const deleteBtn = document.getElementById('delete-log-btn');
        if (deleteBtn) {
            this.addEventListener(deleteBtn, 'click', () => {
                this.deleteLog();
            });
        }
        
        // 공유 버튼
        const shareBtn = document.getElementById('share-log-btn');
        if (shareBtn) {
            this.addEventListener(shareBtn, 'click', () => {
                this.showToast('공유 기능은 준비 중입니다.');
            });
        }
        
        // 내보내기 버튼
        const exportBtn = document.getElementById('export-log-btn');
        if (exportBtn) {
            this.addEventListener(exportBtn, 'click', () => {
                this.showToast('내보내기 기능은 준비 중입니다.');
            });
        }
        
        // 분석 카드 클릭
        const analysisCards = document.querySelectorAll('.analysis-card');
        analysisCards.forEach(card => {
            this.addEventListener(card, 'click', () => {
                this.showToast('분석 기능은 준비 중입니다.');
            });
        });
        
        // 지도 컨트롤 클릭
        const mapControls = document.querySelectorAll('.map-btn');
        mapControls.forEach(control => {
            this.addEventListener(control, 'click', () => {
                this.showToast('지도 기능은 준비 중입니다.');
            });
        });
    }
    
    /**
     * 뒤로 가기 처리
     */
    goBack() {
        // 이벤트를 통해 부모 컴포넌트에 뒤로 가기 요청
        const event = new CustomEvent('logDetailBack', {
            detail: { logId: this.currentLog?.id }
        });
        this.container.dispatchEvent(event);
    }
    
    /**
     * 일지 편집
     */
    editLog() {
        if (!this.currentLog) return;
        
        this.logEditModule.showEditModal(this.currentLog, (logId, updatedData) => {
            // 편집 완료 시 이벤트를 통해 부모 컴포넌트에 업데이트 요청
            const event = new CustomEvent('logDetailEdit', {
                detail: { logId, updatedData }
            });
            this.container.dispatchEvent(event);
        });
    }
    
    /**
     * 일지 삭제
     */
    deleteLog() {
        if (confirm('이 여행 일지를 정말로 삭제하시겠습니까?')) {
            // 이벤트를 통해 부모 컴포넌트에 삭제 요청
            const event = new CustomEvent('logDetailDelete', {
                detail: { logId: this.currentLog?.id }
            });
            this.container.dispatchEvent(event);
        }
    }
    
    /**
     * 토스트 메시지 표시
     */
    showToast(message, duration = 2000) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#333',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: '10000',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'opacity 0.3s ease'
        });
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
    
    /**
     * 목적에 따른 아이콘을 반환합니다
     */
    getPurposeIcon(purpose) {
        const purposeIcons = {
            'tourism': '🏖️',
            'business': '💼',
            'family': '👨‍👩‍👧‍👦',
            'study': '📚',
            'work': '💻',
            'training': '🎯',
            'event': '🎪',
            'volunteer': '🤝',
            'medical': '🏥',
            'transit': '✈️',
            'research': '🔬',
            'immigration': '🏠',
            'other': '❓'
        };
        return purposeIcons[purpose] || '✈️';
    }
    
    /**
     * 목적에 따른 텍스트를 반환합니다
     */
    getPurposeText(purpose) {
        const purposeTexts = {
            'tourism': '관광/여행',
            'business': '업무/출장',
            'family': '가족/지인 방문',
            'study': '학업',
            'work': '취업/근로',
            'training': '파견/연수',
            'event': '행사/컨퍼런스',
            'volunteer': '봉사활동',
            'medical': '의료',
            'transit': '경유/환승',
            'research': '연구/학술',
            'immigration': '이주/정착',
            'relocation': '이주/정착', // relocation을 immigration과 동일하게 처리
            'other': '기타'
        };
        return purposeTexts[purpose] || '기타';
    }
    
    /**
     * 여행 스타일에 따른 텍스트를 반환합니다
     */
    getTravelStyleText(style) {
        const styleTexts = {
            'alone': '혼자',
            'family': '가족과',
            'couple': '연인과',
            'friends': '친구와',
            'colleagues': '동료와',
            // 기존 데이터 호환성을 위한 매핑
            'solo': '혼자',
            'group': '단체 여행'
        };
        return styleTexts[style] || style;
    }
    
    /**
     * 이벤트 리스너를 등록하고 추적합니다
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }
    
    /**
     * 정리 작업을 수행합니다
     */
    cleanup() {
        this.eventListeners.forEach(listener => {
            if (listener.element && listener.event && listener.handler) {
                listener.element.removeEventListener(listener.event, listener.handler);
            }
        });
        
        // 편집 모듈 정리
        if (this.logEditModule) {
            this.logEditModule.cleanup();
        }
        
        this.eventListeners = [];
        this.currentLog = null;
        this.container = null;
    }
}

export default LogDetailModule;
