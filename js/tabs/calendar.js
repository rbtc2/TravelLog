/**
 * 캘린더 탭 모듈
 * 해외 체류 기록을 캘린더 형태로 표시하는 독립 모듈
 * 향후 월간/주간 뷰 기능의 견고한 기반이 될 핵심 아키텍처
 */

class CalendarTab {
    constructor() {
        this.isInitialized = false;
        this.eventListeners = [];
        this.currentDate = new Date();
        this.currentView = 'month'; // 'month' | 'week'
        this.selectedDate = null;
        
        // 향후 확장을 위한 데이터 구조
        this.travelLogs = new Map(); // 날짜별 여행 로그 데이터
        this.countries = new Map(); // 국가별 정보 캐시
        
        // 성능 최적화를 위한 캐시
        this.calendarCache = new Map();
        this.lastRenderDate = null;
    }
    
    /**
     * 탭 렌더링 메인 메서드
     * @param {HTMLElement} container - 탭 콘텐츠 컨테이너
     */
    render(container) {
        this.container = container;
        this.renderContent();
        this.bindEvents();
        this.isInitialized = true;
        
        console.log('캘린더 탭 초기화 완료');
    }
    
    /**
     * 캘린더 UI 렌더링
     * 구글 캘린더 스타일의 깔끔한 디자인 적용
     */
    renderContent() {
        this.container.innerHTML = `
            <div class="calendar-container">
                <!-- 캘린더 헤더 -->
                <div class="calendar-header">
                    <div class="calendar-title">
                        <h2>📅 여행 캘린더</h2>
                        <p class="calendar-subtitle">해외 체류 기록을 한눈에 확인하세요</p>
                    </div>
                    
                    <!-- 뷰 전환 버튼 -->
                    <div class="view-toggle">
                        <button class="view-btn ${this.currentView === 'month' ? 'active' : ''}" data-view="month">
                            <span class="view-icon">📅</span>
                            <span class="view-label">월간</span>
                        </button>
                        <button class="view-btn ${this.currentView === 'week' ? 'active' : ''}" data-view="week">
                            <span class="view-icon">📆</span>
                            <span class="view-label">주간</span>
                        </button>
                    </div>
                </div>
                
                <!-- 날짜 네비게이션 -->
                <div class="calendar-navigation">
                    <button class="nav-btn prev-btn" data-action="prev">
                        <span class="nav-icon">◀</span>
                        <span class="nav-label">이전</span>
                    </button>
                    
                    <div class="current-date-display">
                        <h3 class="current-month">${this.getCurrentMonthText()}</h3>
                        <p class="current-year">${this.currentDate.getFullYear()}</p>
                    </div>
                    
                    <button class="nav-btn next-btn" data-action="next">
                        <span class="nav-label">다음</span>
                        <span class="nav-icon">▶</span>
                    </button>
                    
                    <button class="nav-btn today-btn" data-action="today">
                        <span class="nav-icon">🏠</span>
                        <span class="nav-label">오늘</span>
                    </button>
                </div>
                
                <!-- 캘린더 그리드 -->
                <div class="calendar-grid-container">
                    ${this.renderCalendarGrid()}
                </div>
                
                <!-- 일정 상세 정보 (향후 확장) -->
                <div class="calendar-details" id="calendar-details">
                    <div class="details-placeholder">
                        <div class="placeholder-icon">🗓️</div>
                        <div class="placeholder-title">날짜를 선택하세요</div>
                        <div class="placeholder-description">
                            캘린더에서 날짜를 클릭하면<br>
                            해당 날짜의 여행 기록을 확인할 수 있습니다.
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 캘린더 그리드 렌더링
     * 7×6 월간 캘린더 레이아웃 (구글 캘린더 스타일)
     */
    renderCalendarGrid() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 캐시 확인
        const cacheKey = `${year}-${month}`;
        if (this.calendarCache.has(cacheKey) && this.lastRenderDate === cacheKey) {
            return this.calendarCache.get(cacheKey);
        }
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        
        let gridHTML = `
            <div class="calendar-grid">
                <!-- 요일 헤더 -->
                <div class="calendar-weekdays">
                    <div class="weekday">일</div>
                    <div class="weekday">월</div>
                    <div class="weekday">화</div>
                    <div class="weekday">수</div>
                    <div class="weekday">목</div>
                    <div class="weekday">금</div>
                    <div class="weekday">토</div>
                </div>
                
                <!-- 날짜 그리드 -->
                <div class="calendar-days">
        `;
        
        // 6주 × 7일 = 42일 렌더링
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (week * 7) + day);
                
                const isCurrentMonthDay = currentDate.getMonth() === month;
                const isToday = isCurrentMonthDay && 
                               currentDate.getDate() === today.getDate() && 
                               isCurrentMonth;
                const isSelected = this.selectedDate && 
                                  this.selectedDate.toDateString() === currentDate.toDateString();
                
                // 향후 확장: 여행 로그 데이터 연동
                const hasTravelLog = this.hasTravelLogForDate(currentDate);
                const travelLogs = this.getTravelLogsForDate(currentDate);
                
                gridHTML += `
                    <div class="calendar-day ${isCurrentMonthDay ? 'current-month' : 'other-month'} 
                                        ${isToday ? 'today' : ''} 
                                        ${isSelected ? 'selected' : ''}
                                        ${hasTravelLog ? 'has-travel-log' : ''}"
                         data-date="${currentDate.toISOString().split('T')[0]}"
                         data-day="${currentDate.getDate()}">
                        
                        <div class="day-number">${currentDate.getDate()}</div>
                        
                        ${hasTravelLog ? this.renderTravelLogIndicators(travelLogs) : ''}
                        
                        ${isToday ? '<div class="today-indicator"></div>' : ''}
                    </div>
                `;
            }
        }
        
        gridHTML += `
                </div>
            </div>
        `;
        
        // 캐시 저장
        this.calendarCache.set(cacheKey, gridHTML);
        this.lastRenderDate = cacheKey;
        
        return gridHTML;
    }
    
    /**
     * 여행 로그 표시기 렌더링 (향후 확장)
     * @param {Array} travelLogs - 해당 날짜의 여행 로그 배열
     */
    renderTravelLogIndicators(travelLogs) {
        if (!travelLogs || travelLogs.length === 0) return '';
        
        // 최대 3개까지만 표시 (나머지는 +N 형태)
        const maxDisplay = 3;
        const displayLogs = travelLogs.slice(0, maxDisplay);
        const remainingCount = travelLogs.length - maxDisplay;
        
        let indicatorsHTML = '<div class="travel-log-indicators">';
        
        displayLogs.forEach(log => {
            indicatorsHTML += `
                <div class="travel-log-indicator" 
                     data-country="${log.country || 'unknown'}"
                     title="${log.title || '여행 기록'}">
                    ${this.getCountryFlag(log.country) || '✈️'}
                </div>
            `;
        });
        
        if (remainingCount > 0) {
            indicatorsHTML += `
                <div class="travel-log-more" title="${remainingCount}개 더 보기">
                    +${remainingCount}
                </div>
            `;
        }
        
        indicatorsHTML += '</div>';
        return indicatorsHTML;
    }
    
    /**
     * 이벤트 바인딩
     * 이벤트 위임(Event Delegation) 패턴 활용으로 성능 최적화
     */
    bindEvents() {
        // 뷰 전환 이벤트
        const viewToggleHandler = (e) => {
            const viewBtn = e.target.closest('.view-btn');
            if (!viewBtn) return;
            
            const view = viewBtn.dataset.view;
            this.switchView(view);
        };
        
        // 날짜 네비게이션 이벤트
        const navigationHandler = (e) => {
            const navBtn = e.target.closest('.nav-btn');
            if (!navBtn) return;
            
            const action = navBtn.dataset.action;
            this.handleNavigation(action);
        };
        
        // 날짜 선택 이벤트
        const dayClickHandler = (e) => {
            const dayElement = e.target.closest('.calendar-day');
            if (!dayElement) return;
            
            const dateString = dayElement.dataset.date;
            this.selectDate(new Date(dateString));
        };
        
        // 이벤트 리스너 등록
        this.addEventListener(this.container, 'click', viewToggleHandler);
        this.addEventListener(this.container, 'click', navigationHandler);
        this.addEventListener(this.container, 'click', dayClickHandler);
        
        // 키보드 네비게이션 (접근성 향상)
        const keyboardHandler = (e) => {
            this.handleKeyboardNavigation(e);
        };
        
        this.addEventListener(document, 'keydown', keyboardHandler);
        
        // 윈도우 리사이즈 이벤트 (반응형 대응)
        const resizeHandler = () => {
            this.handleResize();
        };
        
        this.addEventListener(window, 'resize', resizeHandler);
    }
    
    /**
     * 뷰 전환 처리
     * @param {string} view - 'month' | 'week'
     */
    switchView(view) {
        if (this.currentView === view) return;
        
        this.currentView = view;
        
        // UI 업데이트
        const viewBtns = this.container.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // 캘린더 그리드 재렌더링
        this.refreshCalendar();
        
        console.log(`뷰 전환: ${view}`);
    }
    
    /**
     * 날짜 네비게이션 처리
     * @param {string} action - 'prev' | 'next' | 'today'
     */
    handleNavigation(action) {
        const newDate = new Date(this.currentDate);
        
        switch (action) {
            case 'prev':
                if (this.currentView === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1);
                } else {
                    newDate.setDate(newDate.getDate() - 7);
                }
                break;
                
            case 'next':
                if (this.currentView === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1);
                } else {
                    newDate.setDate(newDate.getDate() + 7);
                }
                break;
                
            case 'today':
                newDate.setTime(Date.now());
                break;
        }
        
        this.currentDate = newDate;
        this.refreshCalendar();
        
        console.log(`날짜 네비게이션: ${action}`, this.currentDate);
    }
    
    /**
     * 날짜 선택 처리
     * @param {Date} date - 선택된 날짜
     */
    selectDate(date) {
        this.selectedDate = date;
        
        // UI 업데이트
        const dayElements = this.container.querySelectorAll('.calendar-day');
        dayElements.forEach(day => {
            day.classList.toggle('selected', 
                day.dataset.date === date.toISOString().split('T')[0]);
        });
        
        // 상세 정보 업데이트
        this.updateDetails(date);
        
        console.log('날짜 선택:', date);
    }
    
    /**
     * 상세 정보 업데이트 (향후 확장)
     * @param {Date} date - 선택된 날짜
     */
    updateDetails(date) {
        const detailsContainer = this.container.querySelector('#calendar-details');
        const travelLogs = this.getTravelLogsForDate(date);
        
        if (travelLogs.length > 0) {
            detailsContainer.innerHTML = `
                <div class="details-content">
                    <div class="details-header">
                        <h3>${this.formatDate(date)}</h3>
                        <span class="travel-count">${travelLogs.length}개 기록</span>
                    </div>
                    <div class="travel-logs-list">
                        ${travelLogs.map(log => `
                            <div class="travel-log-item">
                                <div class="log-country">${this.getCountryFlag(log.country)} ${log.country}</div>
                                <div class="log-title">${log.title}</div>
                                <div class="log-period">${log.startDate} ~ ${log.endDate}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            detailsContainer.innerHTML = `
                <div class="details-placeholder">
                    <div class="placeholder-icon">📅</div>
                    <div class="placeholder-title">${this.formatDate(date)}</div>
                    <div class="placeholder-description">
                        이 날짜에는 여행 기록이 없습니다.<br>
                        새로운 여행을 기록해보세요!
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * 캘린더 새로고침
     * 성능 최적화를 위해 필요한 부분만 업데이트
     */
    refreshCalendar() {
        // 캐시 무효화
        this.calendarCache.clear();
        
        // 현재 월/년도 표시 업데이트
        const monthDisplay = this.container.querySelector('.current-month');
        const yearDisplay = this.container.querySelector('.current-year');
        
        if (monthDisplay) monthDisplay.textContent = this.getCurrentMonthText();
        if (yearDisplay) yearDisplay.textContent = this.currentDate.getFullYear();
        
        // 캘린더 그리드 재렌더링
        const gridContainer = this.container.querySelector('.calendar-grid-container');
        if (gridContainer) {
            gridContainer.innerHTML = this.renderCalendarGrid();
        }
    }
    
    /**
     * 키보드 네비게이션 처리 (접근성 향상)
     * @param {KeyboardEvent} e - 키보드 이벤트
     */
    handleKeyboardNavigation(e) {
        if (!this.isInitialized) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.handleNavigation('prev');
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.handleNavigation('next');
                break;
            case 'Home':
                e.preventDefault();
                this.handleNavigation('today');
                break;
            case 'Escape':
                this.selectedDate = null;
                this.refreshCalendar();
                break;
        }
    }
    
    /**
     * 윈도우 리사이즈 처리 (반응형 대응)
     */
    handleResize() {
        if (!this.isInitialized) return;
        
        // 캐시 무효화 (레이아웃 변경 가능성)
        this.calendarCache.clear();
        
        // 필요시 그리드 재렌더링
        const width = window.innerWidth;
        if (width < 768 && this.currentView === 'month') {
            // 모바일에서는 주간 뷰로 자동 전환 고려
            console.log('모바일 화면 감지');
        }
    }
    
    /**
     * 유틸리티 메서드들
     */
    
    getCurrentMonthText() {
        const months = [
            '1월', '2월', '3월', '4월', '5월', '6월',
            '7월', '8월', '9월', '10월', '11월', '12월'
        ];
        return months[this.currentDate.getMonth()];
    }
    
    formatDate(date) {
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
    
    hasTravelLogForDate(date) {
        // 향후 실제 데이터 연동 시 구현
        const dateString = date.toISOString().split('T')[0];
        return this.travelLogs.has(dateString);
    }
    
    getTravelLogsForDate(date) {
        // 향후 실제 데이터 연동 시 구현
        const dateString = date.toISOString().split('T')[0];
        return this.travelLogs.get(dateString) || [];
    }
    
    getCountryFlag(country) {
        // 향후 국가별 국기 이모지 매핑 구현
        const flagMap = {
            '한국': '🇰🇷',
            '일본': '🇯🇵',
            '중국': '🇨🇳',
            '미국': '🇺🇸',
            '영국': '🇬🇧',
            '프랑스': '🇫🇷',
            '독일': '🇩🇪',
            '이탈리아': '🇮🇹',
            '스페인': '🇪🇸',
            '태국': '🇹🇭',
            '베트남': '🇻🇳',
            '싱가포르': '🇸🇬',
            '호주': '🇦🇺',
            '캐나다': '🇨🇦'
        };
        return flagMap[country] || '🌍';
    }
    
    /**
     * 이벤트 리스너 관리 (메모리 누수 방지)
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }
    
    /**
     * 탭 정리 메서드 (메모리 관리)
     */
    async cleanup() {
        // 이벤트 리스너 정리
        this.eventListeners.forEach(listener => {
            if (listener.element && listener.event && listener.handler) {
                listener.element.removeEventListener(listener.event, listener.handler);
            }
        });
        
        this.eventListeners = [];
        this.isInitialized = false;
        
        // 캐시 정리
        this.calendarCache.clear();
        
        // 메모리 정리
        this.container = null;
        this.selectedDate = null;
        this.travelLogs.clear();
        this.countries.clear();
        
        console.log('캘린더 탭 정리 완료');
    }
    
    /**
     * 외부에서 호출 가능한 메서드들 (향후 확장)
     */
    
    /**
     * 특정 날짜로 이동
     * @param {Date} date - 이동할 날짜
     */
    goToDate(date) {
        this.currentDate = new Date(date);
        this.refreshCalendar();
    }
    
    /**
     * 여행 로그 데이터 업데이트 (향후 API 연동)
     * @param {Array} logs - 여행 로그 배열
     */
    updateTravelLogs(logs) {
        this.travelLogs.clear();
        
        logs.forEach(log => {
            const startDate = new Date(log.startDate);
            const endDate = new Date(log.endDate);
            
            // 시작일부터 종료일까지 모든 날짜에 로그 추가
            for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                const dateString = date.toISOString().split('T')[0];
                
                if (!this.travelLogs.has(dateString)) {
                    this.travelLogs.set(dateString, []);
                }
                
                this.travelLogs.get(dateString).push(log);
            }
        });
        
        this.refreshCalendar();
    }
    
    /**
     * 현재 선택된 날짜 반환
     * @returns {Date|null} 선택된 날짜
     */
    getSelectedDate() {
        return this.selectedDate;
    }
    
    /**
     * 현재 뷰 모드 반환
     * @returns {string} 'month' | 'week'
     */
    getCurrentView() {
        return this.currentView;
    }
}

export default new CalendarTab();