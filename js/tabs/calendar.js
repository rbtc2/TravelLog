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
        
        // 데이터 구조
        this.travelLogs = new Map(); // 날짜별 여행 로그 데이터
        this.countries = new Map(); // 국가별 정보 캐시
        this.countriesManager = null; // CountriesManager 인스턴스
        
        // 성능 최적화를 위한 캐시
        this.calendarCache = new Map();
        this.lastRenderDate = null;
        
        // 툴팁 관련
        this.tooltipTimeout = null;
        this.currentTooltip = null;
        
        // 렌더링 최적화
        this.renderQueue = [];
        this.isRendering = false;
    }
    
    /**
     * 탭 렌더링 메인 메서드
     * @param {HTMLElement} container - 탭 콘텐츠 컨테이너
     */
    async render(container) {
        this.container = container;
        
        try {
            // CountriesManager 초기화
            await this.initializeCountriesManager();
            
            // 기존 여행 로그 데이터 로드
            await this.loadTravelLogs();
            
            this.renderContent();
            this.bindEvents();
            this.isInitialized = true;
            
            console.log('캘린더 탭 초기화 완료');
        } catch (error) {
            console.error('캘린더 탭 초기화 실패:', error);
            // 에러가 발생해도 기본 UI는 렌더링
            this.renderContent();
            this.bindEvents();
            this.isInitialized = true;
        }
    }
    
    /**
     * CountriesManager 초기화
     */
    async initializeCountriesManager() {
        try {
            // CountriesManager 동적 import
            const { countriesManager } = await import('../data/countries-manager.js');
            this.countriesManager = countriesManager;
            
            // 초기화
            if (!this.countriesManager.isInitialized) {
                await this.countriesManager.initialize();
            }
            
            console.log('CountriesManager 초기화 완료');
        } catch (error) {
            console.warn('CountriesManager 초기화 실패, 폴백 모드로 동작:', error);
        }
    }
    
    /**
     * 여행 로그 데이터 로드
     */
    async loadTravelLogs() {
        try {
            // StorageManager와 LogService 동적 import
            const { StorageManager } = await import('../modules/utils/storage-manager.js');
            const { LogService } = await import('../modules/services/log-service.js');
            
            const storageManager = new StorageManager();
            const logService = new LogService();
            
            // 저장된 로그 데이터 로드
            const savedLogs = storageManager.loadLogs();
            logService.setLogs(savedLogs);
            
            // 캘린더용 데이터 구조로 변환
            this.processTravelLogsForCalendar(logService.getAllLogs());
            
            console.log(`여행 로그 데이터 로드 완료: ${savedLogs.length}개`);
        } catch (error) {
            console.warn('여행 로그 데이터 로드 실패:', error);
        }
    }
    
    /**
     * 여행 로그를 캘린더용 데이터 구조로 변환
     * @param {Array} logs - 여행 로그 배열
     */
    processTravelLogsForCalendar(logs) {
        this.travelLogs.clear();
        
        logs.forEach(log => {
            // 날짜 문자열을 로컬 시간대로 정확히 파싱
            const startDate = this.parseLocalDate(log.startDate);
            const endDate = this.parseLocalDate(log.endDate);
            
            // 시작일부터 종료일까지 모든 날짜에 로그 추가
            for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                const dateString = this.formatDateString(date);
                
                if (!this.travelLogs.has(dateString)) {
                    this.travelLogs.set(dateString, []);
                }
                
                this.travelLogs.get(dateString).push(log);
            }
        });
    }
    
    /**
     * 날짜 문자열을 로컬 시간대로 정확히 파싱
     * @param {string} dateString - YYYY-MM-DD 형식의 날짜 문자열
     * @returns {Date} 로컬 시간대의 Date 객체
     */
    parseLocalDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day); // month는 0부터 시작하므로 -1
    }
    
    /**
     * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
     * @param {Date} date - Date 객체
     * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
     */
    formatDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
                    
                    <button class="nav-btn today-btn" data-action="today">
                        <span class="nav-icon">🏠</span>
                        <span class="nav-label">오늘</span>
                    </button>
                    
                    <button class="nav-btn next-btn" data-action="next">
                        <span class="nav-label">다음</span>
                        <span class="nav-icon">▶</span>
                    </button>
                    
                    <div class="current-date-display">
                        <button class="date-picker-trigger" id="date-picker-trigger" aria-label="날짜 선택">
                            <h3 class="current-month">${this.getCurrentMonthText()}</h3>
                            <p class="current-year">${this.currentDate.getFullYear()}</p>
                            <span class="date-picker-icon">📅</span>
                        </button>
                    </div>
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
                         data-date="${this.formatDateString(currentDate)}"
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
     * 여행 로그 표시기 렌더링 (국기 도트 + 멀티 레이어 시스템)
     * @param {Array} travelLogs - 해당 날짜의 여행 로그 배열
     */
    renderTravelLogIndicators(travelLogs) {
        if (!travelLogs || travelLogs.length === 0) return '';
        
        // 최대 3개까지만 표시 (나머지는 +N 형태)
        const maxDisplay = 3;
        const displayLogs = travelLogs.slice(0, maxDisplay);
        const remainingCount = travelLogs.length - maxDisplay;
        
        let indicatorsHTML = '<div class="travel-log-indicators" role="group" aria-label="여행 기록">';
        
        displayLogs.forEach((log, index) => {
            const countryInfo = this.getCountryInfo(log.country);
            const flag = this.getCountryFlag(log.country);
            const countryName = countryInfo ? countryInfo.nameKo : log.country;
            
            // 여행 기간 상태에 따른 클래스
            let statusClass = '';
            if (log.isStartDay) statusClass = 'start-day';
            else if (log.isEndDay) statusClass = 'end-day';
            else if (log.isMiddleDay) statusClass = 'middle-day';
            
            // 툴팁 텍스트 생성
            const tooltipText = this.generateTooltipText(log, countryName);
            
            indicatorsHTML += `
                <div class="travel-log-indicator ${statusClass}" 
                     data-country="${log.country || 'unknown'}"
                     data-log-id="${log.id || ''}"
                     data-day-of-trip="${log.dayOfTrip || 1}"
                     data-total-days="${log.totalDays || 1}"
                     title="${tooltipText}"
                     role="button"
                     tabindex="0"
                     aria-label="${tooltipText}">
                    <span class="flag-emoji" aria-hidden="true">${flag}</span>
                    ${log.isStartDay ? '<span class="start-indicator" aria-hidden="true">●</span>' : ''}
                    ${log.isEndDay ? '<span class="end-indicator" aria-hidden="true">●</span>' : ''}
                </div>
            `;
        });
        
        if (remainingCount > 0) {
            indicatorsHTML += `
                <div class="travel-log-more" 
                     title="${remainingCount}개 더 보기"
                     role="button"
                     tabindex="0"
                     aria-label="${remainingCount}개 더 보기">
                    +${remainingCount}
                </div>
            `;
        }
        
        indicatorsHTML += '</div>';
        return indicatorsHTML;
    }
    
    /**
     * 툴팁 텍스트 생성
     * @param {Object} log - 여행 로그 객체
     * @param {string} countryName - 국가명
     * @returns {string} 툴팁 텍스트
     */
    generateTooltipText(log, countryName) {
        const flag = this.getCountryFlag(log.country);
        const dayInfo = log.isStartDay ? '출발' : 
                       log.isEndDay ? '귀국' : 
                       `${log.dayOfTrip}일차`;
        
        return `${flag} ${countryName} ${dayInfo}`;
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
            // 날짜 문자열을 로컬 시간대로 정확히 파싱
            const [year, month, day] = dateString.split('-').map(Number);
            this.selectDate(new Date(year, month - 1, day));
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
        
        // 툴팁 이벤트
        this.bindTooltipEvents();
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
        const dateString = this.formatDateString(date);
        dayElements.forEach(day => {
            day.classList.toggle('selected', 
                day.dataset.date === dateString);
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
        try {
            // 성능 측정 시작
            const startTime = performance.now();
            
            // 캐시 무효화
            this.calendarCache.clear();
            
            // 현재 월/년도 표시 업데이트
            const monthDisplay = this.container.querySelector('.current-month');
            const yearDisplay = this.container.querySelector('.current-year');
            
            if (monthDisplay) monthDisplay.textContent = this.getCurrentMonthText();
            if (yearDisplay) yearDisplay.textContent = this.currentDate.getFullYear();
            
            // 캘린더 그리드 재렌더링 (배치 처리)
            const gridContainer = this.container.querySelector('.calendar-grid-container');
            if (gridContainer) {
                // DocumentFragment를 사용한 배치 렌더링
                const fragment = document.createDocumentFragment();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = this.renderCalendarGrid();
                
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                
                gridContainer.innerHTML = '';
                gridContainer.appendChild(fragment);
            }
            
            // 오래된 캐시 정리 (주기적으로)
            if (Math.random() < 0.1) { // 10% 확률로 실행
                this.cleanupOldCache();
            }
            
            // 성능 측정 완료
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            if (renderTime > 100) {
                console.warn(`캘린더 렌더링 시간이 100ms를 초과했습니다: ${renderTime.toFixed(2)}ms`);
            } else {
                console.log(`캘린더 렌더링 완료: ${renderTime.toFixed(2)}ms`);
            }
            
        } catch (error) {
            console.error('캘린더 새로고침 중 오류 발생:', error);
            // 에러 발생 시 기본 렌더링으로 폴백
            this.fallbackRender();
        }
    }
    
    /**
     * 폴백 렌더링 (에러 발생 시)
     */
    fallbackRender() {
        try {
            const gridContainer = this.container.querySelector('.calendar-grid-container');
            if (gridContainer) {
                gridContainer.innerHTML = `
                    <div class="calendar-error">
                        <div class="error-icon">⚠️</div>
                        <div class="error-message">캘린더를 불러오는 중 오류가 발생했습니다.</div>
                        <button class="retry-btn" onclick="location.reload()">다시 시도</button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('폴백 렌더링도 실패:', error);
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
        
        // 툴팁이 표시된 상태에서 ESC 키 처리
        if (e.key === 'Escape' && this.currentTooltip) {
            e.preventDefault();
            this.hideTooltip();
            return;
        }
        
        // 여행 로그 표시기에서 키보드 네비게이션
        const activeIndicator = document.activeElement.closest('.travel-log-indicator, .travel-log-more');
        if (activeIndicator) {
            this.handleIndicatorKeyboardNavigation(e, activeIndicator);
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
            case 'ArrowUp':
                e.preventDefault();
                this.handleNavigation('prev');
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.handleNavigation('next');
                break;
            case 'Home':
                e.preventDefault();
                this.handleNavigation('today');
                break;
            case 'Escape':
                this.selectedDate = null;
                this.hideTooltip();
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
     * 여행 로그 표시기 키보드 네비게이션
     * @param {KeyboardEvent} e - 키보드 이벤트
     * @param {HTMLElement} indicator - 현재 포커스된 표시기
     */
    handleIndicatorKeyboardNavigation(e, indicator) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.handleIndicatorClick(indicator);
                break;
            case 'Escape':
                e.preventDefault();
                indicator.blur();
                this.hideTooltip();
                break;
            case 'Tab':
                // 기본 탭 동작 허용
                break;
        }
    }
    
    /**
     * 여행 로그 표시기 클릭 처리
     * @param {HTMLElement} indicator - 클릭된 표시기
     */
    handleIndicatorClick(indicator) {
        if (indicator.classList.contains('travel-log-more')) {
            // 더 보기 클릭 시 상세 모달 표시 (향후 구현)
            console.log('더 보기 클릭');
        } else {
            // 개별 여행 로그 클릭 시 상세 정보 표시
            const logId = indicator.dataset.logId;
            const country = indicator.dataset.country;
            console.log('여행 로그 클릭:', { logId, country });
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
    
    /**
     * 특정 날짜에 여행 로그가 있는지 확인
     * @param {Date} date - 확인할 날짜
     * @returns {boolean} 여행 로그 존재 여부
     */
    hasTravelLogForDate(date) {
        const dateString = this.formatDateString(date);
        return this.travelLogs.has(dateString) && this.travelLogs.get(dateString).length > 0;
    }
    
    /**
     * 특정 날짜의 여행 로그를 가져옵니다
     * @param {Date} date - 조회할 날짜
     * @returns {Array} 해당 날짜의 여행 로그 배열
     */
    getTravelLogsForDate(date) {
        const dateString = this.formatDateString(date);
        const logs = this.travelLogs.get(dateString) || [];
        
        // 여행 기간 계산 및 정렬
        return logs.map(log => {
            const startDate = this.parseLocalDate(log.startDate);
            const endDate = this.parseLocalDate(log.endDate);
            const currentDate = new Date(date);
            
            // 여행 기간 내에서의 일차 계산 (로컬 시간 기준)
            const dayOfTrip = Math.ceil((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            
            return {
                ...log,
                dayOfTrip: Math.max(1, dayOfTrip),
                totalDays: Math.max(1, totalDays),
                isStartDay: this.formatDateString(currentDate) === this.formatDateString(startDate),
                isEndDay: this.formatDateString(currentDate) === this.formatDateString(endDate),
                isMiddleDay: currentDate > startDate && currentDate < endDate
            };
        }).sort((a, b) => {
            // 우선순위: 시작일 > 중간일 > 종료일
            if (a.isStartDay && !b.isStartDay) return -1;
            if (!a.isStartDay && b.isStartDay) return 1;
            if (a.isEndDay && !b.isEndDay) return 1;
            if (!a.isEndDay && b.isEndDay) return -1;
            return 0;
        });
    }
    
    /**
     * 국가명으로 국기 이모지를 가져옵니다
     * @param {string} country - 국가명 (한글 또는 영문)
     * @returns {string} 국기 이모지
     */
    getCountryFlag(country) {
        if (!country) return '🌍';
        
        // CountriesManager가 초기화되었는지 확인
        if (this.countriesManager && this.countriesManager.isInitialized) {
            const countryData = this.countriesManager.getCountryByName(country);
            if (countryData) {
                return countryData.flag;
            }
        }
        
        // 폴백: 기본 매핑
        const fallbackMap = {
            '한국': '🇰🇷', '대한민국': '🇰🇷', 'Korea': '🇰🇷', 'South Korea': '🇰🇷',
            '일본': '🇯🇵', 'Japan': '🇯🇵',
            '중국': '🇨🇳', 'China': '🇨🇳',
            '미국': '🇺🇸', 'United States': '🇺🇸', 'USA': '🇺🇸',
            '영국': '🇬🇧', 'United Kingdom': '🇬🇧', 'UK': '🇬🇧',
            '프랑스': '🇫🇷', 'France': '🇫🇷',
            '독일': '🇩🇪', 'Germany': '🇩🇪',
            '이탈리아': '🇮🇹', 'Italy': '🇮🇹',
            '스페인': '🇪🇸', 'Spain': '🇪🇸',
            '태국': '🇹🇭', 'Thailand': '🇹🇭',
            '베트남': '🇻🇳', 'Vietnam': '🇻🇳',
            '싱가포르': '🇸🇬', 'Singapore': '🇸🇬',
            '호주': '🇦🇺', 'Australia': '🇦🇺',
            '캐나다': '🇨🇦', 'Canada': '🇨🇦'
        };
        
        return fallbackMap[country] || '🌍';
    }
    
    /**
     * 국가 정보를 가져옵니다 (국기, 한글명, 영문명 포함)
     * @param {string} country - 국가명
     * @returns {Object|null} 국가 정보 객체 또는 null
     */
    getCountryInfo(country) {
        if (!country) return null;
        
        if (this.countriesManager && this.countriesManager.isInitialized) {
            const countryData = this.countriesManager.getCountryByName(country);
            if (countryData) {
                return {
                    code: countryData.code,
                    nameKo: countryData.nameKo,
                    nameEn: countryData.nameEn,
                    flag: countryData.flag,
                    continent: countryData.continentKo
                };
            }
        }
        
        return null;
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
        try {
            // 툴팁 정리
            this.hideTooltip();
            if (this.tooltipTimeout) {
                clearTimeout(this.tooltipTimeout);
                this.tooltipTimeout = null;
            }
            
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
            this.travelLogs.clear();
            this.countries.clear();
            
            // 렌더링 큐 정리
            this.renderQueue = [];
            this.isRendering = false;
            
            // 메모리 정리
            this.container = null;
            this.selectedDate = null;
            this.countriesManager = null;
            this.currentTooltip = null;
            
            console.log('캘린더 탭 정리 완료');
        } catch (error) {
            console.error('캘린더 탭 정리 중 오류 발생:', error);
        }
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
     * 툴팁 이벤트 바인딩
     */
    bindTooltipEvents() {
        let currentIndicator = null;
        let hideTimeout = null;
        
        // 마우스 오버 이벤트 (디바운싱 적용)
        const mouseOverHandler = (e) => {
            const indicator = e.target.closest('.travel-log-indicator, .travel-log-more');
            if (!indicator) return;
            
            // 같은 요소에 마우스가 들어온 경우 무시
            if (currentIndicator === indicator) return;
            
            // 기존 타이머들 모두 취소
            if (this.tooltipTimeout) {
                clearTimeout(this.tooltipTimeout);
                this.tooltipTimeout = null;
            }
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            
            currentIndicator = indicator;
            
            // 디바운싱 적용 (150ms 지연)
            this.tooltipTimeout = setTimeout(() => {
                if (currentIndicator === indicator) {
                    this.showTooltip(indicator, e);
                }
            }, 150);
        };
        
        // 마우스 아웃 이벤트
        const mouseOutHandler = (e) => {
            const indicator = e.target.closest('.travel-log-indicator, .travel-log-more');
            if (!indicator) return;
            
            // 툴팁 자체로 마우스가 이동한 경우 무시
            if (e.relatedTarget && e.relatedTarget.closest('.calendar-tooltip')) {
                return;
            }
            
            // 다른 표시기로 이동한 경우 무시
            if (e.relatedTarget && e.relatedTarget.closest('.travel-log-indicator, .travel-log-more')) {
                return;
            }
            
            // 디바운싱 취소
            if (this.tooltipTimeout) {
                clearTimeout(this.tooltipTimeout);
                this.tooltipTimeout = null;
            }
            
            currentIndicator = null;
            
            // 툴팁 숨기기 (즉시)
            this.hideTooltip();
        };
        
        // 포커스 이벤트 (키보드 접근성)
        const focusHandler = (e) => {
            const indicator = e.target.closest('.travel-log-indicator, .travel-log-more');
            if (!indicator) return;
            
            // 기존 타이머들 모두 취소
            if (this.tooltipTimeout) {
                clearTimeout(this.tooltipTimeout);
                this.tooltipTimeout = null;
            }
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            
            currentIndicator = indicator;
            
            this.tooltipTimeout = setTimeout(() => {
                if (currentIndicator === indicator) {
                    this.showTooltip(indicator, e);
                }
            }, 200);
        };
        
        // 블러 이벤트
        const blurHandler = (e) => {
            // 포커스가 다른 표시기로 이동한 경우 무시
            if (e.relatedTarget && e.relatedTarget.closest('.travel-log-indicator, .travel-log-more')) {
                return;
            }
            
            currentIndicator = null;
            this.hideTooltip();
        };
        
        // 이벤트 리스너 등록
        this.addEventListener(this.container, 'mouseover', mouseOverHandler);
        this.addEventListener(this.container, 'mouseout', mouseOutHandler);
        this.addEventListener(this.container, 'focusin', focusHandler);
        this.addEventListener(this.container, 'focusout', blurHandler);
    }
    
    /**
     * 툴팁 표시
     * @param {HTMLElement} indicator - 툴팁을 표시할 요소
     * @param {Event} event - 이벤트 객체
     */
    showTooltip(indicator, event) {
        // 기존 툴팁 제거
        this.hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'calendar-tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.setAttribute('aria-live', 'polite');
        
        // 툴팁 내용 생성
        const tooltipContent = this.createTooltipContent(indicator);
        tooltip.innerHTML = tooltipContent;
        
        // 툴팁 위치 계산
        const rect = indicator.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        // 툴팁 위치 설정
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${rect.left - containerRect.left + (rect.width / 2)}px`;
        tooltip.style.top = `${rect.top - containerRect.top - 10}px`;
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.zIndex = '1000';
        
        // 컨테이너에 추가
        this.container.appendChild(tooltip);
        this.currentTooltip = tooltip;
        
        // 애니메이션 적용
        requestAnimationFrame(() => {
            tooltip.classList.add('show');
        });
    }
    
    /**
     * 툴팁 내용 생성
     * @param {HTMLElement} indicator - 툴팁을 표시할 요소
     * @returns {string} 툴팁 HTML 내용
     */
    createTooltipContent(indicator) {
        const country = indicator.dataset.country;
        const logId = indicator.dataset.logId;
        const dayOfTrip = indicator.dataset.dayOfTrip;
        const totalDays = indicator.dataset.totalDays;
        
        if (indicator.classList.contains('travel-log-more')) {
            const count = indicator.textContent.replace('+', '');
            return `
                <div class="tooltip-content">
                    <div class="tooltip-title">${count}개 더 보기</div>
                    <div class="tooltip-description">클릭하여 전체 목록 보기</div>
                </div>
            `;
        }
        
        const countryInfo = this.getCountryInfo(country);
        const countryName = countryInfo ? countryInfo.nameKo : country;
        const flag = this.getCountryFlag(country);
        
        return `
            <div class="tooltip-content">
                <div class="tooltip-header">
                    <span class="tooltip-flag">${flag}</span>
                    <span class="tooltip-country">${countryName}</span>
                </div>
                <div class="tooltip-details">
                    <div class="tooltip-day">${dayOfTrip}/${totalDays}일차</div>
                    <div class="tooltip-action">클릭하여 상세 보기</div>
                </div>
            </div>
        `;
    }
    
    /**
     * 툴팁 숨기기
     */
    hideTooltip() {
        if (this.currentTooltip) {
            // 애니메이션 없이 즉시 제거
            if (this.currentTooltip.parentNode) {
                this.currentTooltip.parentNode.removeChild(this.currentTooltip);
            }
            this.currentTooltip = null;
        }
    }
    
    /**
     * 성능 최적화: 배치 렌더링
     * @param {Array} items - 렌더링할 아이템 배열
     * @param {Function} renderFunction - 렌더링 함수
     */
    batchRender(items, renderFunction) {
        if (this.isRendering) {
            this.renderQueue.push({ items, renderFunction });
            return;
        }
        
        this.isRendering = true;
        const fragment = document.createDocumentFragment();
        
        // 배치 처리
        items.forEach(item => {
            const element = renderFunction(item);
            if (element) {
                fragment.appendChild(element);
            }
        });
        
        // DOM에 한 번에 추가
        requestAnimationFrame(() => {
            this.container.appendChild(fragment);
            this.isRendering = false;
            
            // 대기 중인 렌더링 작업 처리
            if (this.renderQueue.length > 0) {
                const next = this.renderQueue.shift();
                this.batchRender(next.items, next.renderFunction);
            }
        });
    }
    
    /**
     * 메모리 정리 (3개월 이상된 캐시 삭제)
     */
    cleanupOldCache() {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        // 캘린더 캐시 정리
        for (const [key, value] of this.calendarCache.entries()) {
            const [year, month] = key.split('-').map(Number);
            const cacheDate = new Date(year, month, 1);
            
            if (cacheDate < threeMonthsAgo) {
                this.calendarCache.delete(key);
            }
        }
        
        // 여행 로그 캐시 정리
        for (const [dateString, logs] of this.travelLogs.entries()) {
            const logDate = new Date(dateString);
            if (logDate < threeMonthsAgo) {
                this.travelLogs.delete(dateString);
            }
        }
        
        console.log('오래된 캐시 정리 완료');
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