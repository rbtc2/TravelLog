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
                        <button class="date-picker-trigger" id="date-picker-trigger" aria-label="날짜 선택">
                            <h3 class="current-month">${this.getCurrentMonthText()}</h3>
                            <p class="current-year">${this.currentDate.getFullYear()}</p>
                            <span class="date-picker-icon">📅</span>
                        </button>
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
        
        // 날짜 피커 트리거 이벤트
        const datePickerHandler = (e) => {
            const trigger = e.target.closest('.date-picker-trigger');
            if (!trigger) return;
            
            this.showDatePicker();
        };
        
        // 이벤트 리스너 등록
        this.addEventListener(this.container, 'click', viewToggleHandler);
        this.addEventListener(this.container, 'click', navigationHandler);
        this.addEventListener(this.container, 'click', dayClickHandler);
        this.addEventListener(this.container, 'click', datePickerHandler);
        
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
        
        // 스와이프 제스처 이벤트
        this.bindSwipeGestures();
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
        
        // 모달이 열려있으면 모달 내부 키보드 네비게이션 처리
        const datePickerModal = document.querySelector('.date-picker-modal');
        if (datePickerModal && datePickerModal.classList.contains('show')) {
            this.handleModalKeyboardNavigation(e);
            return;
        }
        
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
            case 'Enter':
            case ' ':
                // 날짜 피커 트리거에 포커스가 있을 때
                if (document.activeElement && document.activeElement.classList.contains('date-picker-trigger')) {
                    e.preventDefault();
                    this.showDatePicker();
                }
                break;
        }
    }
    
    /**
     * 모달 내부 키보드 네비게이션 처리
     * @param {KeyboardEvent} e - 키보드 이벤트
     */
    handleModalKeyboardNavigation(e) {
        const modal = document.querySelector('.date-picker-modal');
        if (!modal) return;
        
        const focusableElements = modal.querySelectorAll(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        switch (e.key) {
            case 'Tab':
                if (e.shiftKey) {
                    // Shift + Tab: 역방향 탭
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab: 순방향 탭
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                const closeBtn = modal.querySelector('#date-picker-close');
                if (closeBtn) closeBtn.click();
                break;
                
            case 'Enter':
            case ' ':
                // 현재 포커스된 요소가 버튼이면 클릭
                if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
                    e.preventDefault();
                    document.activeElement.click();
                }
                break;
                
            case 'ArrowLeft':
                // 연도 이전 버튼
                e.preventDefault();
                const yearPrevBtn = modal.querySelector('#year-prev');
                if (yearPrevBtn) yearPrevBtn.click();
                break;
                
            case 'ArrowRight':
                // 연도 다음 버튼
                e.preventDefault();
                const yearNextBtn = modal.querySelector('#year-next');
                if (yearNextBtn) yearNextBtn.click();
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
    addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        this.eventListeners.push({ element, event, handler, options });
    }
    
    /**
     * 탭 정리 메서드 (메모리 관리)
     */
    async cleanup() {
        // 이벤트 리스너 정리
        this.eventListeners.forEach(listener => {
            if (listener.element && listener.event && listener.handler) {
                listener.element.removeEventListener(listener.event, listener.handler, listener.options);
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
     * 날짜 피커 모달 표시
     */
    showDatePicker() {
        // 기존 모달이 있으면 제거
        const existingModal = document.querySelector('.date-picker-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 현재 포커스된 요소 저장 (접근성)
        this.previousFocusedElement = document.activeElement;
        
        const modal = document.createElement('div');
        modal.className = 'date-picker-modal';
        modal.innerHTML = this.renderDatePickerModal();
        
        document.body.appendChild(modal);
        
        // 모달 이벤트 바인딩
        this.bindDatePickerEvents(modal);
        
        // 애니메이션을 위한 지연
        setTimeout(() => {
            modal.classList.add('show');
            // 첫 번째 포커스 가능한 요소에 포커스
            const firstFocusable = modal.querySelector('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 10);
        
        console.log('날짜 피커 모달 표시');
    }
    
    /**
     * 날짜 피커 모달 HTML 렌더링
     */
    renderDatePickerModal() {
        const currentYear = this.currentDate.getFullYear();
        const currentMonth = this.currentDate.getMonth();
        
        return `
            <div class="modal-overlay" id="date-picker-overlay" aria-hidden="true"></div>
            <div class="modal-content date-picker-content" 
                 role="dialog" 
                 aria-modal="true" 
                 aria-labelledby="date-picker-title"
                 aria-describedby="date-picker-description">
                <div class="modal-header">
                    <h3 id="date-picker-title">📅 날짜 선택</h3>
                    <button class="modal-close-btn" id="date-picker-close" aria-label="날짜 선택 모달 닫기">×</button>
                </div>
                
                <div class="modal-body">
                    <div id="date-picker-description" class="sr-only">
                        연도와 월을 선택하여 캘린더를 이동할 수 있습니다. 
                        화살표 키로 연도를 변경하고, 월 버튼을 클릭하여 월을 선택하세요.
                    </div>
                    
                    <!-- 연도 선택 -->
                    <div class="year-selector" role="group" aria-label="연도 선택">
                        <button class="year-nav-btn" id="year-prev" aria-label="이전 연도로 이동">◀</button>
                        <h4 class="current-year-display" id="current-year-display" aria-live="polite">${currentYear}</h4>
                        <button class="year-nav-btn" id="year-next" aria-label="다음 연도로 이동">▶</button>
                    </div>
                    
                    <!-- 월 선택 그리드 -->
                    <div class="month-grid" id="month-grid" role="grid" aria-label="월 선택">
                        ${this.renderMonthGrid(currentYear, currentMonth)}
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="modal-btn cancel-btn" id="date-picker-cancel">취소</button>
                    <button class="modal-btn confirm-btn" id="date-picker-confirm">확인</button>
                </div>
            </div>
        `;
    }
    
    /**
     * 월 선택 그리드 렌더링
     */
    renderMonthGrid(year, selectedMonth) {
        const months = [
            '1월', '2월', '3월', '4월', '5월', '6월',
            '7월', '8월', '9월', '10월', '11월', '12월'
        ];
        
        let gridHTML = '';
        for (let i = 0; i < 12; i++) {
            const isSelected = i === selectedMonth;
            gridHTML += `
                <button class="month-btn ${isSelected ? 'selected' : ''}" 
                        data-month="${i}" 
                        data-year="${year}"
                        role="gridcell"
                        aria-selected="${isSelected}"
                        aria-label="${months[i]} ${isSelected ? '선택됨' : '선택'}"
                        tabindex="${isSelected ? '0' : '-1'}">
                    ${months[i]}
                </button>
            `;
        }
        
        return gridHTML;
    }
    
    /**
     * 날짜 피커 모달 이벤트 바인딩
     */
    bindDatePickerEvents(modal) {
        const overlay = modal.querySelector('#date-picker-overlay');
        const closeBtn = modal.querySelector('#date-picker-close');
        const cancelBtn = modal.querySelector('#date-picker-cancel');
        const confirmBtn = modal.querySelector('#date-picker-confirm');
        const yearPrevBtn = modal.querySelector('#year-prev');
        const yearNextBtn = modal.querySelector('#year-next');
        const yearDisplay = modal.querySelector('#current-year-display');
        const monthGrid = modal.querySelector('#month-grid');
        
        let selectedYear = this.currentDate.getFullYear();
        let selectedMonth = this.currentDate.getMonth();
        
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                // 원래 포커스된 요소로 돌아가기 (접근성)
                if (this.previousFocusedElement) {
                    this.previousFocusedElement.focus();
                }
            }, 300);
        };
        
        const updateYearDisplay = () => {
            yearDisplay.textContent = selectedYear;
            // 월 그리드 업데이트
            monthGrid.innerHTML = this.renderMonthGrid(selectedYear, selectedMonth);
            this.bindMonthSelection(modal, selectedYear);
        };
        
        const bindMonthSelection = (modal, year) => {
            const monthBtns = modal.querySelectorAll('.month-btn');
            monthBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // 기존 선택 해제
                    monthBtns.forEach(b => {
                        b.classList.remove('selected');
                        b.setAttribute('aria-selected', 'false');
                        b.setAttribute('tabindex', '-1');
                        b.setAttribute('aria-label', b.textContent + ' 선택');
                    });
                    // 새 선택 적용
                    btn.classList.add('selected');
                    btn.setAttribute('aria-selected', 'true');
                    btn.setAttribute('tabindex', '0');
                    btn.setAttribute('aria-label', btn.textContent + ' 선택됨');
                    selectedMonth = parseInt(btn.dataset.month);
                });
            });
        };
        
        // 이벤트 리스너 등록
        overlay.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        confirmBtn.addEventListener('click', () => {
            this.navigateToDate(selectedYear, selectedMonth);
            closeModal();
        });
        
        yearPrevBtn.addEventListener('click', () => {
            selectedYear = Math.max(2020, selectedYear - 1);
            updateYearDisplay();
        });
        
        yearNextBtn.addEventListener('click', () => {
            selectedYear = Math.min(2030, selectedYear + 1);
            updateYearDisplay();
        });
        
        // ESC 키로 모달 닫기
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEscKey);
        
        // 모달이 닫힐 때 이벤트 리스너 정리
        modal.addEventListener('close', () => {
            document.removeEventListener('keydown', handleEscKey);
        });
        
        // 초기 월 선택 바인딩
        this.bindMonthSelection = bindMonthSelection;
        bindMonthSelection(modal, selectedYear);
    }
    
    /**
     * 특정 연도/월로 이동
     */
    navigateToDate(year, month) {
        this.currentDate = new Date(year, month, 1);
        this.refreshCalendar();
        console.log(`날짜 이동: ${year}년 ${month + 1}월`);
    }
    
    /**
     * 스와이프 제스처 바인딩
     */
    bindSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        const handleTouchStart = (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        };
        
        const handleTouchEnd = (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            this.handleSwipeGesture(startX, startY, endX, endY);
        };
        
        // 터치 이벤트 리스너 (passive로 성능 최적화)
        this.addEventListener(this.container, 'touchstart', handleTouchStart, { passive: true });
        this.addEventListener(this.container, 'touchend', handleTouchEnd, { passive: true });
    }
    
    /**
     * 스와이프 제스처 처리
     */
    handleSwipeGesture(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        
        // 수평 스와이프가 수직 스와이프보다 클 때만 처리
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // 오른쪽 스와이프 - 이전 달
                this.handleNavigation('prev');
            } else {
                // 왼쪽 스와이프 - 다음 달
                this.handleNavigation('next');
            }
        }
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