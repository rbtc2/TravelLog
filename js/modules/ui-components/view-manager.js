/**
 * 화면 렌더링 관리 모듈
 * MyLogsTab의 렌더링 로직을 분리하여 관리
 */

export class ViewManager {
    constructor() {
        this.currentView = 'hub';
    }

    /**
     * 현재 뷰를 설정합니다
     * @param {string} view - 설정할 뷰 ('hub', 'logs', 'settings', 'detail', 'travel-report')
     */
    setCurrentView(view) {
        this.currentView = view;
    }

    /**
     * 현재 뷰를 반환합니다
     * @returns {string} 현재 뷰
     */
    getCurrentView() {
        return this.currentView;
    }

    /**
     * 허브 화면을 렌더링합니다 (프로필, 요약, 보관함)
     * @param {Object} logService - LogService 인스턴스
     * @returns {string} HTML 문자열
     */
    renderHub(logService) {
        return `
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
                                <div class="summary-value">${logService.getAllLogs().length}</div>
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
     * @returns {string} HTML 문자열
     */
    renderTravelReport() {
        return `
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
     * @returns {string} HTML 문자열
     */
    renderSettings() {
        return `
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
     * 일지 목록을 표시하는 UI를 렌더링합니다
     * @param {Object} logService - LogService 인스턴스
     * @param {Function} renderLogItem - 개별 로그 아이템 렌더링 함수
     * @param {Function} renderPagination - 페이지네이션 렌더링 함수
     * @returns {string} HTML 문자열
     */
    renderLogsList(logService, renderLogItem, renderPagination) {
        try {
            // 콜백 함수들이 제대로 전달되었는지 확인
            if (typeof renderLogItem !== 'function') {
                console.error('ViewManager: renderLogItem 콜백이 함수가 아닙니다');
                return '<div class="error-message">렌더링 함수를 찾을 수 없습니다.</div>';
            }
            
            if (typeof renderPagination !== 'function') {
                console.error('ViewManager: renderPagination 콜백이 함수가 아닙니다');
                return '<div class="error-message">페이지네이션 함수를 찾을 수 없습니다.</div>';
            }
            
            const pageData = logService.getLogsByPage(
                logService.currentPage, 
                logService.logsPerPage
            );
            
            return `
                <div class="my-logs-container">
                    <div class="my-logs-header">
                        <div class="header-with-back">
                            <button class="back-btn" id="back-to-hub">◀ 뒤로</button>
                            <div class="header-content">
                                <h1 class="my-logs-title">📅 나의 일정</h1>
                                <p class="my-logs-subtitle">총 ${logService.getAllLogs().length}개의 여행 일지</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="logs-list">
                        ${pageData.logs.map(log => renderLogItem(log)).join('')}
                    </div>
                    
                    ${renderPagination(pageData.totalPages)}
                </div>
            `;
        } catch (error) {
            console.error('ViewManager: renderLogsList 오류:', error);
            return '<div class="error-message">일정 목록을 불러오는 중 오류가 발생했습니다.</div>';
        }
    }

    /**
     * 목적에 따른 아이콘을 반환합니다
     * @param {string} purpose - 목적
     * @returns {string} 아이콘
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
     * @param {string} purpose - 목적
     * @returns {string} 텍스트
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
            'other': '기타'
        };
        return purposeTexts[purpose] || purpose;
    }

    /**
     * 여행 스타일에 따른 텍스트를 반환합니다
     * @param {string} style - 여행 스타일
     * @returns {string} 텍스트
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

    /**
     * 메모를 적절한 길이로 자르고 말줄임표를 추가합니다
     * @param {string} memo - 메모 텍스트
     * @returns {string} 잘린 메모 텍스트
     */
    truncateMemo(memo) {
        if (!memo) return '';
        
        // 화면 크기에 따른 동적 길이 제한
        let maxLength;
        if (window.innerWidth <= 480) {
            maxLength = 60; // 매우 작은 모바일
        } else if (window.innerWidth <= 768) {
            maxLength = 80; // 일반 모바일
        } else if (window.innerWidth <= 1024) {
            maxLength = 100; // 태블릿
        } else {
            maxLength = 120; // 데스크톱
        }
        
        if (memo.length <= maxLength) {
            return memo;
        }
        
        // 단어 단위로 자르기 (마지막 단어가 잘리지 않도록)
        const truncated = memo.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        
        if (lastSpaceIndex > maxLength * 0.7) { // 70% 이상이면 단어 단위로 자르기
            return truncated.substring(0, lastSpaceIndex) + '...';
        } else {
            return truncated + '...';
        }
    }
}
