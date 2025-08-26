/**
 * 나의 로그 탭 모듈
 * 허브 화면으로 구성: 프로필, 요약, 보관함
 */

import LogDetailModule from '../modules/log-detail.js';

class MyLogsTab {
    constructor() {
        this.isInitialized = false;
        this.eventListeners = [];
        this.logs = [];
        this.currentPage = 1;
        this.logsPerPage = 10;
        this.currentView = 'hub'; // 'hub', 'logs', 'settings', 'detail'
        this.currentLogId = null;
        this.logDetailModule = new LogDetailModule();
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
        const logToDelete = this.logs.find(log => log.id === logId);
        if (!logToDelete) return;
        
        this.showDeleteConfirmModal(logToDelete);
    }
    
    /**
     * 삭제 확인 모달을 표시합니다
     */
    showDeleteConfirmModal(log) {
        // 기존 모달이 있으면 제거
        const existingModal = document.querySelector('.delete-confirm-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'delete-confirm-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>일지 삭제 확인</h3>
                </div>
                <div class="modal-body">
                    <p>다음 일지를 정말로 삭제하시겠습니까?</p>
                    <div class="log-preview">
                        <div class="log-preview-header">
                            <span class="log-preview-country">${log.country}</span>
                            <span class="log-preview-city">${log.city}</span>
                        </div>
                        <div class="log-preview-dates">
                            ${log.startDate} ~ ${log.endDate}
                        </div>
                        <div class="log-preview-memo">
                            ${log.memo ? log.memo.substring(0, 50) + (log.memo.length > 50 ? '...' : '') : '메모 없음'}
                        </div>
                    </div>
                    <p class="warning-text">⚠️ 삭제된 일지는 복구할 수 없습니다.</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn cancel-btn" id="cancel-delete">취소</button>
                    <button class="modal-btn confirm-btn" id="confirm-delete">삭제</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 모달 이벤트 바인딩
        const cancelBtn = modal.querySelector('#cancel-delete');
        const confirmBtn = modal.querySelector('#confirm-delete');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            modal.remove();
        };
        
        cancelBtn.addEventListener('click', closeModal);
        confirmBtn.addEventListener('click', () => {
            this.performDelete(log.id);
            closeModal();
        });
        overlay.addEventListener('click', closeModal);
        
        // ESC 키로 모달 닫기
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscKey);
            }
        };
        document.addEventListener('keydown', handleEscKey);
    }
    
    /**
     * 실제 삭제를 수행합니다
     */
    performDelete(logId) {
        this.logs = this.logs.filter(log => log.id !== logId);
        this.saveLogs();
        
        // 현재 페이지가 비어있고 이전 페이지가 있으면 이전 페이지로 이동
        const totalPages = Math.ceil(this.logs.length / this.logsPerPage);
        if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
        }
        
        this.renderContent(); // UI 업데이트
        
        // 삭제 완료 토스트 메시지
        this.showToast('일지가 성공적으로 삭제되었습니다.', 3000);
    }
    
    renderContent() {
        if (this.currentView === 'hub') {
            this.renderHub();
        } else if (this.currentView === 'settings') {
            this.renderSettings();
        } else if (this.currentView === 'travel-report') {
            this.renderTravelReport();
        } else if (this.currentView === 'detail') {
            this.renderLogDetail();
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
                    <div class="header-with-settings">
                        <div class="header-content">
                            <h1 class="my-logs-title">📝 나의 로그</h1>
                            <p class="my-logs-subtitle">여행 기록과 계획을 한 곳에서 관리하세요</p>
                        </div>
                        <button class="settings-btn" id="settings-btn" title="설정">
                            ⚙️
                        </button>
                    </div>
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
                        
                        <!-- 추가 KPI 타일 1 (향후 구현 예정) -->
                        <div class="summary-item kpi-placeholder" style="display: none;">
                            <div class="summary-icon">🌍</div>
                            <div class="summary-details">
                                <div class="summary-value">0</div>
                                <div class="summary-label">방문 국가 수</div>
                            </div>
                        </div>
                        
                        <!-- 추가 KPI 타일 2 (향후 구현 예정) -->
                        <div class="summary-item kpi-placeholder" style="display: none;">
                            <div class="summary-icon">⭐</div>
                            <div class="summary-details">
                                <div class="summary-value">0</div>
                                <div class="summary-label">평균 평점</div>
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
                
                <!-- 트래블 레포트 섹션 -->
                <div class="hub-section travel-report-section">
                    <div class="section-header">
                        <h2 class="section-title">📊 트래블 레포트</h2>
                    </div>
                    <div class="travel-report-content">
                        <div class="report-action">
                            <button class="view-report-btn" id="view-report-btn">레포트 보기</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 트래블 레포트 화면을 렌더링합니다
     */
    renderTravelReport() {
        this.container.innerHTML = `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <div class="header-with-back">
                        <button class="back-btn" id="back-to-hub-from-report">◀ 뒤로</button>
                        <div class="header-content">
                            <h1 class="my-logs-title">📊 트래블 레포트</h1>
                            <p class="my-logs-subtitle">여행 데이터 분석 및 인사이트</p>
                        </div>
                    </div>
                </div>
                
                <!-- 나의 여행 DNA 카드 -->
                <div class="hub-section travel-dna-section">
                    <div class="section-header">
                        <h2 class="section-title">🧬 나의 여행 DNA</h2>
                    </div>
                    <div class="dna-content">
                        <div class="dna-item">
                            <div class="dna-icon">🏆</div>
                            <div class="dna-details">
                                <div class="dna-label">최애 국가</div>
                                <div class="dna-value">일본 (5회 방문, 총 47일)</div>
                            </div>
                        </div>
                        
                        <div class="dna-item">
                            <div class="dna-icon">🏙️</div>
                            <div class="dna-details">
                                <div class="dna-label">베이스캠프</div>
                                <div class="dna-value">도쿄 (3회, 총 21일)</div>
                            </div>
                        </div>
                        
                        <div class="dna-item">
                            <div class="dna-icon">⏱️</div>
                            <div class="dna-details">
                                <div class="dna-label">여행 스타일</div>
                                <div class="dna-value">장기체류형 (평균 9.2일)</div>
                            </div>
                        </div>
                        
                        <div class="dna-item">
                            <div class="dna-icon">🎯</div>
                            <div class="dna-details">
                                <div class="dna-label">주요 목적</div>
                                <div class="dna-value">여행 70%, 출장 30%</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 순위/활동 차트 섹션 -->
                <div class="hub-section charts-section">
                    <div class="section-header">
                        <h2 class="section-title">📈 순위/활동 차트</h2>
                    </div>
                    
                    <!-- 차트 프레임 1: 국가별 랭킹 -->
                    <div class="chart-frame">
                        <div class="chart-header">
                            <div class="chart-tabs">
                                <button class="chart-tab disabled" data-tab="visits">방문 횟수</button>
                                <button class="chart-tab disabled" data-tab="duration">체류일 수</button>
                            </div>
                        </div>
                        <div class="chart-placeholder">
                            <div class="placeholder-text">준비 중</div>
                        </div>
                    </div>
                    
                    <!-- 차트 프레임 2: 도시별 랭킹 -->
                    <div class="chart-frame">
                        <div class="chart-header">
                            <h3 class="chart-title">도시별 랭킹 (Top 5)</h3>
                        </div>
                        <div class="city-ranking-list">
                            <div class="city-ranking-item" data-city="도쿄">
                                <div class="city-rank">1</div>
                                <div class="city-info">
                                    <div class="city-name">도쿄</div>
                                    <div class="city-stats">3회 방문, 총 21일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                            <div class="city-ranking-item" data-city="파리">
                                <div class="city-rank">2</div>
                                <div class="city-info">
                                    <div class="city-name">파리</div>
                                    <div class="city-stats">2회 방문, 총 12일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                            <div class="city-ranking-item" data-city="방콕">
                                <div class="city-rank">3</div>
                                <div class="city-info">
                                    <div class="city-name">방콕</div>
                                    <div class="city-stats">1회 방문, 총 6일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                            <div class="city-ranking-item" data-city="런던">
                                <div class="city-rank">4</div>
                                <div class="city-info">
                                    <div class="city-name">런던</div>
                                    <div class="city-stats">1회 방문, 총 5일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                            <div class="city-ranking-item" data-city="뉴욕">
                                <div class="city-rank">5</div>
                                <div class="city-info">
                                    <div class="city-name">뉴욕</div>
                                    <div class="city-stats">1회 방문, 총 4일</div>
                                </div>
                                <div class="city-arrow">▶</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 차트 프레임 3: 월별 활동 히트맵 -->
                    <div class="chart-frame">
                        <div class="chart-header">
                            <div class="chart-controls">
                                <select class="year-selector disabled" disabled>
                                    <option>2024년</option>
                                    <option>2023년</option>
                                    <option>2022년</option>
                                </select>
                            </div>
                        </div>
                        <div class="heatmap-placeholder">
                            <div class="heatmap-grid">
                                ${Array.from({length: 12}, (_, i) => `
                                    <div class="heatmap-month">
                                        <div class="month-label">${i + 1}월</div>
                                        <div class="month-activity placeholder-box"></div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="heatmap-caption">언제 가장 많이 여행했나?</div>
                        </div>
                    </div>
                </div>
                
                <!-- 여행 패턴 인사이트 카드 -->
                <div class="hub-section insights-section">
                    <div class="section-header">
                        <h2 class="section-title">💡 여행 패턴 인사이트</h2>
                    </div>
                    <div class="insights-content">
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">주로 3–4월에 여행을 떠나시네요!</div>
                        </div>
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">출장보다 여행을 위한 방문이 많아요</div>
                        </div>
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">평균 체류기간이 늘어나고 있어요 📈</div>
                        </div>
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">일본을 정말 좋아하시는군요! 🇯🇵</div>
                        </div>
                        <div class="insight-item">
                            <div class="insight-icon">💡</div>
                            <div class="insight-text">가을철 여행 빈도가 점점 증가하고 있어요</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 설정 화면을 렌더링합니다
     */
    renderSettings() {
        this.container.innerHTML = `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <div class="header-with-back">
                        <button class="back-btn" id="back-to-hub-from-settings">◀ 뒤로</button>
                        <div class="header-content">
                            <h1 class="my-logs-title">⚙️ 설정</h1>
                            <p class="my-logs-subtitle">앱과 계정 설정을 관리하세요</p>
                        </div>
                    </div>
                </div>
                
                <!-- 앱 설정 섹션 -->
                <div class="hub-section app-settings-section">
                    <div class="section-header">
                        <h2 class="section-title">📱 앱 설정</h2>
                    </div>
                    <div class="settings-content">
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">🌙</div>
                                <div class="setting-details">
                                    <div class="setting-title">다크 모드</div>
                                    <div class="setting-description">어두운 테마로 앱을 사용하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">🔔</div>
                                <div class="setting-details">
                                    <div class="setting-title">알림</div>
                                    <div class="setting-description">여행 관련 알림을 받으세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">🌍</div>
                                <div class="setting-details">
                                    <div class="setting-title">언어</div>
                                    <div class="setting-description">앱 언어를 선택하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <select class="setting-select" disabled>
                                    <option>한국어</option>
                                    <option>English</option>
                                    <option>日本語</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">💾</div>
                                <div class="setting-details">
                                    <div class="setting-title">자동 저장</div>
                                    <div class="setting-description">작성 중인 내용을 자동으로 저장합니다</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" disabled checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 계정 설정 섹션 -->
                <div class="hub-section account-settings-section">
                    <div class="section-header">
                        <h2 class="section-title">👤 계정 설정</h2>
                    </div>
                    <div class="settings-content">
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">✏️</div>
                                <div class="setting-details">
                                    <div class="setting-title">프로필 편집</div>
                                    <div class="setting-description">사용자 프로필 정보를 수정하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <button class="setting-btn-secondary" disabled>편집</button>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">🔒</div>
                                <div class="setting-details">
                                    <div class="setting-title">비밀번호 변경</div>
                                    <div class="setting-description">계정 보안을 위해 비밀번호를 변경하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <button class="setting-btn-secondary" disabled>변경</button>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">📧</div>
                                <div class="setting-details">
                                    <div class="setting-title">이메일 설정</div>
                                    <div class="setting-description">알림 및 마케팅 이메일 수신 설정</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" disabled checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">📱</div>
                                <div class="setting-details">
                                    <div class="setting-title">계정 연동</div>
                                    <div class="setting-description">소셜 미디어 계정과 연동하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <button class="setting-btn-secondary" disabled>연동</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 하단 정보 섹션 -->
                <div class="hub-section info-section">
                    <div class="info-content">
                        <div class="info-item">
                            <span class="info-label">앱 버전:</span>
                            <span class="info-value">1.0.0</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">빌드 번호:</span>
                            <span class="info-value">20241201</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">개발사:</span>
                            <span class="info-value">TravelLog Team</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 일정 상세 화면을 렌더링합니다
     */
    renderLogDetail() {
        if (!this.currentLogId) {
            this.currentView = 'logs';
            this.renderContent();
            return;
        }
        
        const log = this.logs.find(l => l.id === this.currentLogId);
        if (!log) {
            this.currentView = 'logs';
            this.renderContent();
            return;
        }
        
        this.logDetailModule.render(this.container, log);
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
            <div class="log-item clickable" data-log-id="${log.id}">
                <!-- 1행: 헤더 (국가명 + 기간/목적 칩 + 편집/삭제 아이콘) -->
                <div class="log-header">
                    <div class="log-header-left">
                        <div class="log-country">${log.country}</div>
                        <div class="log-country-badge" title="국가 코드">🇰🇷</div>
                    </div>
                    
                    <div class="log-header-center">
                        <div class="log-chips">
                            <div class="log-chip duration-chip">
                                <span class="chip-icon">📅</span>
                                <span class="chip-text">${duration}일</span>
                            </div>
                            <div class="log-chip purpose-chip">
                                <span class="chip-icon">${purposeIcon}</span>
                                <span class="chip-text">${this.getPurposeText(log.purpose)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="log-header-right">
                        <button class="log-action-btn edit-btn" data-log-id="${log.id}" title="편집" aria-label="일지 편집">
                            ✏️
                        </button>
                        <button class="log-action-btn delete-btn" data-log-id="${log.id}" title="삭제" aria-label="일지 삭제">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <!-- 2행: 서브헤더 (도시명) -->
                <div class="log-subheader">
                    <div class="log-city">${log.city}</div>
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
        } else if (this.currentView === 'settings') {
            this.bindSettingsEvents();
        } else if (this.currentView === 'travel-report') {
            this.bindTravelReportEvents();
        } else if (this.currentView === 'detail') {
            this.bindDetailEvents();
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
        
        // 트래블 레포트 버튼
        const viewReportBtn = document.getElementById('view-report-btn');
        if (viewReportBtn) {
            this.addEventListener(viewReportBtn, 'click', () => {
                this.currentView = 'travel-report';
                this.renderContent();
                this.bindEvents();
                // 스크롤을 맨 위로 이동
                window.scrollTo(0, 0);
            });
        }

        // 설정 버튼 (미구현)
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            this.addEventListener(settingsBtn, 'click', () => {
                this.currentView = 'settings';
                this.renderContent();
                this.bindEvents();
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
        
        // 일지 아이템 클릭 (상세 화면으로 이동)
        const logItems = document.querySelectorAll('.log-item.clickable');
        logItems.forEach(item => {
            this.addEventListener(item, 'click', (e) => {
                // 편집/삭제 버튼 클릭 시에는 상세 화면으로 이동하지 않음
                if (e.target.closest('.log-action-btn')) {
                    return;
                }
                
                const logId = e.currentTarget.dataset.logId;
                this.showLogDetail(logId);
            });
        });
        
        // 일지 편집 버튼들
        const editBtns = document.querySelectorAll('.edit-btn');
        editBtns.forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                e.stopPropagation(); // 상세 화면 이동 방지
                const logId = e.currentTarget.dataset.logId;
                this.editLog(logId);
            });
        });
        
        // 일지 삭제 버튼들
        const deleteBtns = document.querySelectorAll('.delete-btn');
        deleteBtns.forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                e.stopPropagation(); // 상세 화면 이동 방지
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
     * 트래블 레포트 화면의 이벤트를 바인딩합니다
     */
    bindTravelReportEvents() {
        // 뒤로 가기 버튼
        const backBtn = document.getElementById('back-to-hub-from-report');
        if (backBtn) {
            this.addEventListener(backBtn, 'click', () => {
                this.currentView = 'hub';
                this.renderContent();
                this.bindEvents();
            });
        }
        
        // 도시 랭킹 아이템 클릭
        const cityRankingItems = document.querySelectorAll('.city-ranking-item');
        cityRankingItems.forEach(item => {
            this.addEventListener(item, 'click', (e) => {
                const cityName = e.currentTarget.dataset.city;
                this.showToast(`"${cityName}" 상세 정보는 준비 중입니다.`);
            });
        });
        
        // 차트 탭 클릭 (비활성)
        const chartTabs = document.querySelectorAll('.chart-tab');
        chartTabs.forEach(tab => {
            this.addEventListener(tab, 'click', () => {
                this.showToast('차트 기능은 준비 중입니다.');
            });
        });
        
        // 연도 선택기 클릭 (비활성)
        const yearSelector = document.querySelector('.year-selector');
        if (yearSelector) {
            this.addEventListener(yearSelector, 'change', () => {
                this.showToast('연도 선택 기능은 준비 중입니다.');
            });
        }
    }
    
    /**
     * 설정 화면의 이벤트를 바인딩합니다
     */
    bindSettingsEvents() {
        // 설정 화면에서 뒤로 가기 버튼
        const backBtn = document.getElementById('back-to-hub-from-settings');
        if (backBtn) {
            this.addEventListener(backBtn, 'click', () => {
                this.currentView = 'hub';
                this.renderContent();
                this.bindEvents();
            });
        }
    }
    
    /**
     * 상세 화면의 이벤트를 바인딩합니다
     */
    bindDetailEvents() {
        // 상세 화면에서 뒤로 가기 이벤트
        this.container.addEventListener('logDetailBack', (e) => {
            this.currentView = 'logs';
            this.currentLogId = null;
            this.renderContent();
            this.bindEvents();
        });
        
        // 상세 화면에서 삭제 이벤트
        this.container.addEventListener('logDetailDelete', (e) => {
            const logId = e.detail.logId;
            this.deleteLog(logId);
            // 삭제 후 목록으로 돌아가기
            this.currentView = 'logs';
            this.currentLogId = null;
            this.renderContent();
            this.bindEvents();
        });
    }
    
    /**
     * 일정 상세 화면을 표시합니다
     */
    showLogDetail(logId) {
        this.currentLogId = logId;
        this.currentView = 'detail';
        this.renderContent();
        this.bindEvents();
    }
    
    /**
     * 일지 편집 (향후 구현 예정)
     */
    editLog(logId) {
        alert('일지 편집 기능은 향후 구현 예정입니다.');
    }
    
    /**
     * 토스트 메시지를 표시합니다
     */
    showToast(message, duration = 2000) {
        // 기존 토스트가 있으면 제거
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 새 토스트 생성
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        
        // 스타일 적용
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
        
        // 자동 제거
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
        
        // 상세 모듈 정리
        if (this.logDetailModule) {
            this.logDetailModule.cleanup();
        }
        
        this.eventListeners = [];
        this.isInitialized = false;
        this.logs = [];
        this.currentPage = 1;
        this.currentView = 'hub';
        this.currentLogId = null;
        
        // 메모리 정리
        this.container = null;
    }
}

export default new MyLogsTab();
