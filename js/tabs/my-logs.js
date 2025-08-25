/**
 * 나의 로그 탭 모듈
 * 허브 화면으로 구성: 프로필, 요약, 보관함
 */

class MyLogsTab {
    constructor() {
        this.isInitialized = false;
        this.eventListeners = [];
        this.logs = [];
        this.currentPage = 1;
        this.logsPerPage = 10;
        this.currentView = 'hub'; // 'hub' 또는 'logs'
    }
    
    render(container) {
        this.container = container;
        this.loadLogs();
        this.renderContent();
        this.bindEvents();
        this.isInitialized = true;
    }
    
    /**
     * 탭이 활성화될 때 데이터를 새로고침합니다
     */
    refresh() {
        if (this.isInitialized) {
            this.loadLogs();
            this.renderContent();
            this.bindEvents();
        }
    }
    
    /**
     * 로컬 스토리지에서 일지 데이터를 로드합니다
     */
    loadLogs() {
        try {
            const storedLogs = localStorage.getItem('travelLogs');
            this.logs = storedLogs ? JSON.parse(storedLogs) : [];
            
            // 데모 데이터가 없으면 샘플 데이터 추가
            if (this.logs.length === 0) {
                this.addDemoData();
            }
            
            // 날짜 순으로 정렬 (최신이 맨 위)
            this.logs.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        } catch (error) {
            console.error('일지 데이터 로드 실패:', error);
            this.logs = [];
        }
    }
    
    /**
     * 데모 데이터를 추가합니다
     */
    addDemoData() {
        const demoLogs = [
            {
                id: 'demo1',
                country: '일본',
                city: '도쿄',
                startDate: '2024-03-15',
                endDate: '2024-03-20',
                purpose: 'leisure',
                rating: '5',
                travelStyle: 'couple',
                memo: '도쿄의 봄을 만끽한 환상적인 여행이었습니다. 벚꽃 축제와 맛집 탐방이 특히 인상적이었어요.',
                createdAt: '2024-03-21T10:00:00.000Z'
            },
            {
                id: 'demo2',
                country: '프랑스',
                city: '파리',
                startDate: '2024-02-10',
                endDate: '2024-02-15',
                purpose: 'cultural',
                rating: '4',
                travelStyle: 'solo',
                memo: '루브르 박물관과 에펠탑을 방문했습니다. 예술의 도시 파리의 매력에 흠뻑 빠졌어요.',
                createdAt: '2024-02-16T14:30:00.000Z'
            },
            {
                id: 'demo3',
                country: '태국',
                city: '방콕',
                startDate: '2024-01-05',
                endDate: '2024-01-10',
                purpose: 'leisure',
                rating: '4',
                travelStyle: 'family',
                memo: '가족과 함께한 태국 여행. 따뜻한 날씨와 맛있는 태국 음식이 기억에 남습니다.',
                createdAt: '2024-01-11T09:15:00.000Z'
            }
        ];
        
        this.logs = demoLogs;
        this.saveLogs();
    }
    
    /**
     * 일지 데이터를 로컬 스토리지에 저장합니다
     */
    saveLogs() {
        try {
            localStorage.setItem('travelLogs', JSON.stringify(this.logs));
        } catch (error) {
            console.error('일지 데이터 저장 실패:', error);
        }
    }
    
    /**
     * 새로운 일지를 추가합니다
     */
    addLog(logData) {
        const newLog = {
            id: Date.now().toString(),
            ...logData,
            createdAt: new Date().toISOString()
        };
        
        this.logs.unshift(newLog); // 맨 앞에 추가
        this.saveLogs();
        this.renderContent(); // UI 업데이트
    }
    
    /**
     * 일지를 삭제합니다
     */
    deleteLog(logId) {
        if (confirm('정말로 이 일지를 삭제하시겠습니까?')) {
            this.logs = this.logs.filter(log => log.id !== logId);
            this.saveLogs();
            this.renderContent(); // UI 업데이트
        }
    }
    
    renderContent() {
        if (this.currentView === 'hub') {
            this.renderHub();
        } else {
            this.renderLogsList();
        }
    }
    
    /**
     * 허브 화면을 렌더링합니다 (프로필, 요약, 보관함)
     */
    renderHub() {
        this.container.innerHTML = `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <h1 class="my-logs-title">📝 나의 로그</h1>
                    <p class="my-logs-subtitle">여행 기록과 계획을 한 곳에서 관리하세요</p>
                </div>
                
                <!-- 프로필 섹션 -->
                <div class="hub-section profile-section">
                    <div class="section-header">
                        <h2 class="section-title">👤 프로필</h2>
                    </div>
                    <div class="profile-content">
                        <div class="profile-avatar">✈️</div>
                        <div class="profile-info">
                            <div class="profile-name">여행자</div>
                            <div class="profile-status">활발한 여행 중</div>
                        </div>
                    </div>
                </div>
                
                <!-- 요약 섹션 -->
                <div class="hub-section summary-section">
                    <div class="section-header">
                        <h2 class="section-title">📊 요약</h2>
                    </div>
                    <div class="summary-content">
                        <div class="summary-item">
                            <div class="summary-icon">📝</div>
                            <div class="summary-details">
                                <div class="summary-value">${this.logs.length}</div>
                                <div class="summary-label">여행 일지 수</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 보관함 섹션 -->
                <div class="hub-section archive-section">
                    <div class="section-header">
                        <h2 class="section-title">🗂️ 보관함</h2>
                    </div>
                    <div class="archive-content">
                        <div class="archive-item" id="my-schedules-btn">
                            <div class="archive-icon">📅</div>
                            <div class="archive-details">
                                <div class="archive-title">나의 일정</div>
                                <div class="archive-description">등록된 여행 일지를 확인하고 관리하세요</div>
                            </div>
                            <div class="archive-arrow">▶</div>
                        </div>
                        
                        <div class="archive-item disabled" id="bucket-list-btn">
                            <div class="archive-icon">🎯</div>
                            <div class="archive-details">
                                <div class="archive-title">버킷리스트</div>
                                <div class="archive-description">가고 싶은 곳들을 미리 계획해보세요</div>
                            </div>
                            <div class="archive-status">준비 중</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 일지 목록을 표시하는 UI
     */
    renderLogsList() {
        const startIndex = (this.currentPage - 1) * this.logsPerPage;
        const endIndex = startIndex + this.logsPerPage;
        const currentLogs = this.logs.slice(startIndex, endIndex);
        const totalPages = Math.ceil(this.logs.length / this.logsPerPage);
        
        this.container.innerHTML = `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <div class="header-with-back">
                        <button class="back-btn" id="back-to-hub">◀ 뒤로</button>
                        <div class="header-content">
                            <h1 class="my-logs-title">📅 나의 일정</h1>
                            <p class="my-logs-subtitle">총 ${this.logs.length}개의 여행 일지</p>
                        </div>
                    </div>
                </div>
                
                <div class="logs-list">
                    ${currentLogs.map(log => this.renderLogItem(log)).join('')}
                </div>
                
                ${this.renderPagination(totalPages)}
            </div>
        `;
    }
    
    /**
     * 개별 일지 아이템을 렌더링합니다
     */
    renderLogItem(log) {
        const startDate = new Date(log.startDate);
        const endDate = new Date(log.endDate);
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        const purposeIcon = this.getPurposeIcon(log.purpose);
        const ratingStars = '★'.repeat(parseInt(log.rating)) + '☆'.repeat(5 - parseInt(log.rating));
        
        return `
            <div class="log-item" data-log-id="${log.id}">
                <div class="log-header">
                    <div class="log-location">
                        <div class="log-country">${log.country}</div>
                        <div class="log-city">${log.city}</div>
                    </div>
                    <div class="log-actions">
                        <button class="log-edit-btn" data-log-id="${log.id}" title="편집">
                            ✏️
                        </button>
                        <button class="log-delete-btn" data-log-id="${log.id}" title="삭제">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="log-details">
                    <div class="log-dates">
                        <div class="log-date-range">
                            <span class="date-label">📅</span>
                            ${startDate.toLocaleDateString('ko-KR')} ~ ${endDate.toLocaleDateString('ko-KR')}
                        </div>
                        <div class="log-duration">(${duration}일)</div>
                    </div>
                    
                    <div class="log-purpose">
                        <span class="purpose-icon">${purposeIcon}</span>
                        <span class="purpose-text">${this.getPurposeText(log.purpose)}</span>
                    </div>
                    
                    <div class="log-rating">
                        <span class="rating-label">평점:</span>
                        <span class="rating-stars">${ratingStars}</span>
                        <span class="rating-value">(${log.rating}/5)</span>
                    </div>
                    
                    ${log.travelStyle ? `
                        <div class="log-travel-style">
                            <span class="style-icon">🎒</span>
                            <span class="style-text">${this.getTravelStyleText(log.travelStyle)}</span>
                        </div>
                    ` : ''}
                    
                    ${log.memo ? `
                        <div class="log-memo">
                            <span class="memo-icon">💭</span>
                            <span class="memo-text">${log.memo}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="log-footer">
                    <div class="log-created">
                        작성일: ${new Date(log.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 페이지네이션을 렌더링합니다
     */
    renderPagination(totalPages) {
        if (totalPages <= 1) return '';
        
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // 이전 페이지 버튼
        if (this.currentPage > 1) {
            pages.push(`<button class="page-btn prev-page" data-page="${this.currentPage - 1}">◀ 이전</button>`);
        }
        
        // 페이지 번호들
        for (let i = startPage; i <= endPage; i++) {
            pages.push(`
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `);
        }
        
        // 다음 페이지 버튼
        if (this.currentPage < totalPages) {
            pages.push(`<button class="page-btn next-page" data-page="${this.currentPage + 1}">다음 ▶</button>`);
        }
        
        return `
            <div class="pagination">
                ${pages.join('')}
            </div>
        `;
    }
    
    /**
     * 목적에 따른 아이콘을 반환합니다
     */
    getPurposeIcon(purpose) {
        const purposeIcons = {
            'business': '💼',
            'leisure': '🏖️',
            'study': '📚',
            'family': '👨‍👩‍👧‍👦',
            'backpacking': '🎒',
            'luxury': '✨',
            'cultural': '🏛️',
            'adventure': '🧗‍♂️'
        };
        return purposeIcons[purpose] || '✈️';
    }
    
    /**
     * 목적에 따른 텍스트를 반환합니다
     */
    getPurposeText(purpose) {
        const purposeTexts = {
            'business': '비즈니스',
            'leisure': '레저/휴양',
            'study': '학업/연수',
            'family': '가족 여행',
            'backpacking': '백패킹',
            'luxury': '럭셔리',
            'cultural': '문화 체험',
            'adventure': '모험/액티비티'
        };
        return purposeTexts[purpose] || purpose;
    }
    
    /**
     * 여행 스타일에 따른 텍스트를 반환합니다
     */
    getTravelStyleText(style) {
        const styleTexts = {
            'solo': '솔로 여행',
            'couple': '커플 여행',
            'group': '단체 여행',
            'family': '가족 여행',
            'friends': '친구와 함께'
        };
        return styleTexts[style] || style;
    }
    
    bindEvents() {
        if (this.currentView === 'hub') {
            this.bindHubEvents();
        } else {
            this.bindLogsEvents();
        }
    }
    
    /**
     * 허브 화면의 이벤트를 바인딩합니다
     */
    bindHubEvents() {
        // 나의 일정 버튼
        const mySchedulesBtn = document.getElementById('my-schedules-btn');
        if (mySchedulesBtn) {
            this.addEventListener(mySchedulesBtn, 'click', () => {
                this.currentView = 'logs';
                this.renderContent();
                this.bindEvents();
            });
        }
        
        // 버킷리스트 버튼 (미구현)
        const bucketListBtn = document.getElementById('bucket-list-btn');
        if (bucketListBtn) {
            this.addEventListener(bucketListBtn, 'click', () => {
                alert('버킷리스트 기능은 추후 구현 예정입니다.');
            });
        }
    }
    
    /**
     * 일지 목록 화면의 이벤트를 바인딩합니다
     */
    bindLogsEvents() {
        // 뒤로 가기 버튼
        const backBtn = document.getElementById('back-to-hub');
        if (backBtn) {
            this.addEventListener(backBtn, 'click', () => {
                this.currentView = 'hub';
                this.currentPage = 1; // 페이지 초기화
                this.renderContent();
                this.bindEvents();
            });
        }
        
        // 일지 편집 버튼들
        const editBtns = document.querySelectorAll('.log-edit-btn');
        editBtns.forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                const logId = e.currentTarget.dataset.logId;
                this.editLog(logId);
            });
        });
        
        // 일지 삭제 버튼들
        const deleteBtns = document.querySelectorAll('.log-delete-btn');
        deleteBtns.forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                const logId = e.currentTarget.dataset.logId;
                this.deleteLog(logId);
            });
        });
        
        // 페이지네이션 버튼들
        const pageBtns = document.querySelectorAll('.page-btn');
        pageBtns.forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.renderContent();
                    this.bindEvents();
                }
            });
        });
    }
    
    /**
     * 일지 편집 (향후 구현 예정)
     */
    editLog(logId) {
        alert('일지 편집 기능은 향후 구현 예정입니다.');
    }
    
    /**
     * 이벤트 리스너를 등록하고 추적합니다
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }
    
    async cleanup() {
        // 이벤트 리스너 정리
        this.eventListeners.forEach(listener => {
            if (listener.element && listener.event && listener.handler) {
                listener.element.removeEventListener(listener.event, listener.handler);
            }
        });
        
        this.eventListeners = [];
        this.isInitialized = false;
        this.logs = [];
        this.currentPage = 1;
        this.currentView = 'hub';
        
        // 메모리 정리
        this.container = null;
    }
}

export default new MyLogsTab();
