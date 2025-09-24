/**
 * 캘린더 렌더링 모듈
 * UI 렌더링 및 DOM 조작을 담당
 */

import { 
    formatDateString, 
    formatDate, 
    getCurrentMonthText, 
    getCountryFlag, 
    getCountryInfo,
    generateTooltipText 
} from './CalendarUtils.js';
import { continentColorManager } from './ContinentColorManager.js';

export class CalendarRenderer {
    constructor(container, dataManager) {
        this.container = container;
        this.dataManager = dataManager;
        this.calendarCache = new Map();
        this.lastRenderDate = null;
        this.isDarkMode = false; // 다크모드 상태 추적
        this.useBarSystem = true; // 바 형태 시스템 강제 사용 (레거시 시스템 제거)
    }

    /**
     * 캘린더 UI 렌더링
     * 구글 캘린더 스타일의 깔끔한 디자인 적용
     */
    renderContent(currentDate, currentView) {
        // 초기 렌더링 시 스크롤바 중복 방지를 위한 임시 스타일 적용
        this.container.style.overflow = 'hidden';
        
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
                        <button class="view-btn ${currentView === 'month' ? 'active' : ''}" data-view="month">
                            <span class="view-icon">📅</span>
                            <span class="view-label">월간</span>
                        </button>
                        <button class="view-btn ${currentView === 'week' ? 'active' : ''}" data-view="week">
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
                            <h3 class="current-month">${getCurrentMonthText(currentDate)}</h3>
                            <p class="current-year">${currentDate.getFullYear()}</p>
                            <span class="date-picker-icon">📅</span>
                        </button>
                    </div>
                </div>
                
                <!-- 캘린더 그리드 -->
                <div class="calendar-grid-container">
                    ${this.renderCalendarGrid(currentDate, null)}
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
        
        // 렌더링 완료 후 스크롤 설정 복원
        this.restoreScrollSettings();
    }
    
    /**
     * 로그 상세 화면 렌더링 (통일된 DOM 구조)
     * @param {Object} logData - 로그 데이터
     */
    renderLogDetail(logData) {
        this.container.innerHTML = `
            <div class="log-detail-container">
                <!-- 로그 상세 내용은 LogDetailModule에서 처리 -->
            </div>
        `;
    }
    
    /**
     * 스크롤 설정 복원 (렌더링 완료 후)
     */
    restoreScrollSettings() {
        // 다음 프레임에서 스크롤 설정 복원
        requestAnimationFrame(() => {
            // 컨테이너 스크롤 설정 복원 - 상위 컨테이너에서만 스크롤
            this.container.style.overflow = '';
            this.container.style.overflowX = 'hidden';
            this.container.style.overflowY = 'auto';
            
            // 하드웨어 가속 적용
            this.container.style.transform = 'translateZ(0)';
            this.container.style.backfaceVisibility = 'hidden';
            this.container.style.webkitOverflowScrolling = 'touch';
            
            // 캘린더 컨테이너 - 스크롤 완전 제거
            const calendarContainer = this.container.querySelector('.calendar-container');
            if (calendarContainer) {
                calendarContainer.style.overflow = 'visible';
                calendarContainer.style.transform = 'translateZ(0)';
                calendarContainer.style.backfaceVisibility = 'hidden';
            }
            
            // 그리드 컨테이너 - 스크롤 완전 제거
            const gridContainer = this.container.querySelector('.calendar-grid-container');
            if (gridContainer) {
                gridContainer.style.overflow = 'visible';
                gridContainer.style.transform = 'translateZ(0)';
                gridContainer.style.backfaceVisibility = 'hidden';
            }
        });
    }

    /**
     * 캘린더 그리드 렌더링
     * 7×6 월간 캘린더 레이아웃 (구글 캘린더 스타일)
     */
    renderCalendarGrid(currentDate, selectedDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
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
                const isSelected = selectedDate && 
                                  selectedDate.toDateString() === currentDate.toDateString();
                
                // 여행 로그 데이터 연동
                const hasTravelLog = this.dataManager.hasTravelLogForDate(currentDate);
                const travelLogs = this.dataManager.getTravelLogsForDate(currentDate);
                
                gridHTML += `
                    <div class="calendar-day ${isCurrentMonthDay ? 'current-month' : 'other-month'} 
                                        ${isToday ? 'today' : ''} 
                                        ${isSelected ? 'selected' : ''}
                                        ${hasTravelLog ? 'has-travel-log' : ''}"
                         data-date="${formatDateString(currentDate)}"
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
     * 여행 로그 바 형태 표시기 렌더링 (멀티 라인 시스템)
     * @param {Array} travelLogs - 해당 날짜의 여행 로그 배열
     */
    renderTravelLogIndicators(travelLogs) {
        if (!travelLogs || travelLogs.length === 0) return '';
        
        // 다크모드 상태 확인
        this.updateDarkModeState();
        
        // 최대 6개까지 표시 (한 줄에 3개씩, 2줄)
        const maxDisplay = 6;
        const displayLogs = travelLogs.slice(0, maxDisplay);
        const remainingCount = travelLogs.length - maxDisplay;
        
        let indicatorsHTML = '<div class="travel-log-bars" role="group" aria-label="여행 기록">';
        
        // 더보기 표시 (6개 초과 시)
        if (remainingCount > 0) {
            indicatorsHTML += `
                <div class="travel-log-more-badge" 
                     title="${remainingCount}개 더 보기"
                     role="button"
                     tabindex="0"
                     aria-label="${remainingCount}개 더 보기">
                    +${remainingCount}
                </div>
            `;
        }
        
        // 바 형태로 일정 표시
        displayLogs.forEach((log, index) => {
            const countryInfo = getCountryInfo(log.country, this.dataManager.getCountriesManager());
            const countryName = countryInfo ? countryInfo.nameKo : log.country;
            const continent = continentColorManager.getContinent(log.country);
            const barColor = continentColorManager.getCountryColor(log.country, this.isDarkMode);
            
            // 여행 기간 상태에 따른 클래스
            let statusClass = '';
            if (log.isStartDay) statusClass = 'start-day';
            else if (log.isEndDay) statusClass = 'end-day';
            else if (log.isMiddleDay) statusClass = 'middle-day';
            
            // 툴팁 텍스트 생성
            const tooltipText = generateTooltipText(log, countryName);
            
            indicatorsHTML += `
                <div class="travel-log-bar ${statusClass}" 
                     data-country="${log.country || 'unknown'}"
                     data-log-id="${log.id || ''}"
                     data-day-of-trip="${log.dayOfTrip || 1}"
                     data-total-days="${log.totalDays || 1}"
                     data-continent="${continent}"
                     style="--bar-color: ${barColor};"
                     title="${tooltipText}"
                     role="button"
                     tabindex="0"
                     aria-label="${tooltipText}">
                    <div class="bar-content">
                        <span class="bar-text">${countryName}</span>
                        ${log.isStartDay ? '<span class="start-indicator" aria-hidden="true">●</span>' : ''}
                        ${log.isEndDay ? '<span class="end-indicator" aria-hidden="true">●</span>' : ''}
                    </div>
                </div>
            `;
        });
        
        indicatorsHTML += '</div>';
        return indicatorsHTML;
    }

    /**
     * 레거시 여행 로그 표시기 렌더링 (기존 도트 시스템) - 제거됨
     * @deprecated 이 메서드는 더 이상 사용되지 않습니다. renderTravelLogIndicators를 사용하세요.
     */
    renderTravelLogIndicatorsLegacy(travelLogs) {
        console.warn('renderTravelLogIndicatorsLegacy는 더 이상 사용되지 않습니다. renderTravelLogIndicators를 사용하세요.');
        return this.renderTravelLogIndicators(travelLogs);
    }

    /**
     * 상세 정보 업데이트 (향후 확장)
     * @param {Date} date - 선택된 날짜
     */
    updateDetails(date) {
        const detailsContainer = this.container.querySelector('#calendar-details');
        const travelLogs = this.dataManager.getTravelLogsForDate(date);
        
        if (travelLogs.length > 0) {
            detailsContainer.innerHTML = `
                <div class="details-content">
                    <div class="details-header">
                        <h3>${formatDate(date)}</h3>
                        <span class="travel-count">${travelLogs.length}개 기록</span>
                    </div>
                    <div class="travel-logs-list">
                        ${travelLogs.map(log => this.renderTravelLogItem(log)).join('')}
                    </div>
                </div>
            `;
        } else {
            detailsContainer.innerHTML = `
                <div class="details-placeholder">
                    <div class="placeholder-icon">📅</div>
                    <div class="placeholder-title">${formatDate(date)}</div>
                    <div class="placeholder-description">
                        이 날짜에는 여행 기록이 없습니다.<br>
                        새로운 여행을 기록해보세요!
                    </div>
                </div>
            `;
        }
    }

    /**
     * 여행 로그 아이템 렌더링 (미니멀 카드 디자인)
     * @param {Object} log - 여행 로그 객체
     * @returns {string} HTML 문자열
     */
    renderTravelLogItem(log) {
        const countriesManager = this.dataManager.getCountriesManager();
        const countryInfo = getCountryInfo(log.country, countriesManager);
        const flag = getCountryFlag(log.country, countriesManager);
        const countryName = countryInfo ? countryInfo.nameKo : log.country;
        const city = log.city || '';
        
        // 여행 기간 정보
        const startDate = new Date(log.startDate);
        const endDate = new Date(log.endDate);
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // 별점 표시 (간단한 텍스트 형태)
        const rating = parseFloat(log.rating) || 0;
        const ratingText = `⭐ ${rating}/5`;
        
        // 날짜 포맷팅 (MM.DD 형태)
        const formatDate = (date) => {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${month}.${day}`;
        };
        
        const startDateFormatted = formatDate(startDate);
        const endDateFormatted = formatDate(endDate);
        
        return `
            <div class="minimal-travel-card" data-log-id="${log.id || ''}">
                <div class="card-line-1">
                    <div class="card-left">
                        <span class="card-flag">${flag}</span>
                        <span class="card-location">${countryName}${city ? ' · ' + city : ''}</span>
                    </div>
                    <div class="card-rating">${ratingText}</div>
                </div>
                <div class="card-line-2">
                    <span class="card-period">${startDateFormatted} - ${endDateFormatted} (${totalDays}일)</span>
                </div>
            </div>
        `;
    }


    /**
     * 캘린더 새로고침
     * 성능 최적화를 위해 필요한 부분만 업데이트
     */
    refreshCalendar(currentDate, selectedDate) {
        try {
            // 성능 측정 시작
            const startTime = performance.now();
            
            // 캐시 무효화
            this.calendarCache.clear();
            
            // 현재 월/년도 표시 업데이트
            const monthDisplay = this.container.querySelector('.current-month');
            const yearDisplay = this.container.querySelector('.current-year');
            
            if (monthDisplay) monthDisplay.textContent = getCurrentMonthText(currentDate);
            if (yearDisplay) yearDisplay.textContent = currentDate.getFullYear();
            
            // 캘린더 그리드 재렌더링 (배치 처리)
            const gridContainer = this.container.querySelector('.calendar-grid-container');
            if (gridContainer) {
                // DocumentFragment를 사용한 배치 렌더링
                const fragment = document.createDocumentFragment();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = this.renderCalendarGrid(currentDate, selectedDate);
                
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                
                gridContainer.innerHTML = '';
                gridContainer.appendChild(fragment);
            }
            
            // 성능 측정 완료
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            // 성능 경고만 유지 (100ms 초과 시에만)
            if (renderTime > 100) {
                console.warn(`캘린더 렌더링 시간이 100ms를 초과했습니다: ${renderTime.toFixed(2)}ms`);
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
     * 뷰 전환 UI 업데이트
     * @param {string} view - 'month' | 'week'
     */
    updateViewToggle(view) {
        const viewBtns = this.container.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    }

    /**
     * 선택된 날짜 UI 업데이트
     * @param {Date} selectedDate - 선택된 날짜
     */
    updateSelectedDate(selectedDate) {
        const dayElements = this.container.querySelectorAll('.calendar-day');
        const dateString = formatDateString(selectedDate);
        dayElements.forEach(day => {
            day.classList.toggle('selected', 
                day.dataset.date === dateString);
        });
    }

    /**
     * 다크모드 상태 업데이트
     */
    updateDarkModeState() {
        this.isDarkMode = document.documentElement.classList.contains('dark') || 
                         document.body.classList.contains('dark');
    }

    /**
     * 바 형태 시스템 사용 여부 설정
     * @param {boolean} useBarSystem - 바 형태 시스템 사용 여부
     */
    setBarSystem(useBarSystem) {
        this.useBarSystem = useBarSystem;
        // 캐시 무효화하여 새로운 시스템으로 다시 렌더링
        this.clearCache();
    }

    /**
     * 현재 사용 중인 시스템 반환
     * @returns {string} 'bar' | 'legacy'
     */
    getCurrentSystem() {
        return this.useBarSystem ? 'bar' : 'legacy';
    }

    /**
     * 캐시 정리
     */
    clearCache() {
        this.calendarCache.clear();
        this.lastRenderDate = null;
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
        
        // 캐시 정리 로그 제거 (성능 최적화)
    }

    /**
     * 바 형태 렌더링 성능 최적화
     * @param {Array} travelLogs - 여행 로그 배열
     * @returns {string} 최적화된 HTML
     */
    renderTravelLogIndicatorsOptimized(travelLogs) {
        if (!travelLogs || travelLogs.length === 0) return '';
        
        // 다크모드 상태 확인 (캐시된 값 사용)
        if (!this.isDarkMode) {
            this.updateDarkModeState();
        }
        
        // 최대 6개까지 표시 (한 줄에 3개씩, 2줄)
        const maxDisplay = 6;
        const displayLogs = travelLogs.slice(0, maxDisplay);
        const remainingCount = travelLogs.length - maxDisplay;
        
        // DocumentFragment 사용으로 DOM 조작 최소화
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');
        container.className = 'travel-log-bars';
        container.setAttribute('role', 'group');
        container.setAttribute('aria-label', '여행 기록');
        
        // 더보기 배지 (6개 초과 시)
        if (remainingCount > 0) {
            const moreBadge = document.createElement('div');
            moreBadge.className = 'travel-log-more-badge';
            moreBadge.title = `${remainingCount}개 더 보기`;
            moreBadge.setAttribute('role', 'button');
            moreBadge.setAttribute('tabindex', '0');
            moreBadge.setAttribute('aria-label', `${remainingCount}개 더 보기`);
            moreBadge.textContent = `+${remainingCount}`;
            moreBadge.style.position = 'absolute';
            moreBadge.style.top = '-8px';
            moreBadge.style.right = '2px';
            moreBadge.style.zIndex = '3';
            container.appendChild(moreBadge);
        }
        
        // 바 형태로 일정 표시 (배치 처리)
        displayLogs.forEach((log, index) => {
            const countryInfo = getCountryInfo(log.country, this.dataManager.getCountriesManager());
            const countryName = countryInfo ? countryInfo.nameKo : log.country;
            const continent = continentColorManager.getContinent(log.country);
            const barColor = continentColorManager.getCountryColor(log.country, this.isDarkMode);
            
            // 여행 기간 상태에 따른 클래스
            let statusClass = '';
            if (log.isStartDay) statusClass = 'start-day';
            else if (log.isEndDay) statusClass = 'end-day';
            else if (log.isMiddleDay) statusClass = 'middle-day';
            
            // 툴팁 텍스트 생성
            const tooltipText = generateTooltipText(log, countryName);
            
            const bar = document.createElement('div');
            bar.className = `travel-log-bar ${statusClass}`;
            bar.setAttribute('data-country', log.country || 'unknown');
            bar.setAttribute('data-log-id', log.id || '');
            bar.setAttribute('data-day-of-trip', log.dayOfTrip || 1);
            bar.setAttribute('data-total-days', log.totalDays || 1);
            bar.setAttribute('data-continent', continent);
            bar.style.setProperty('--bar-color', barColor);
            bar.title = tooltipText;
            bar.setAttribute('role', 'button');
            bar.setAttribute('tabindex', '0');
            bar.setAttribute('aria-label', tooltipText);
            
            const barContent = document.createElement('div');
            barContent.className = 'bar-content';
            
            const barText = document.createElement('span');
            barText.className = 'bar-text';
            barText.textContent = countryName;
            barContent.appendChild(barText);
            
            // 시작일/종료일 표시기
            if (log.isStartDay) {
                const startIndicator = document.createElement('span');
                startIndicator.className = 'start-indicator';
                startIndicator.setAttribute('aria-hidden', 'true');
                startIndicator.textContent = '●';
                barContent.appendChild(startIndicator);
            }
            
            if (log.isEndDay) {
                const endIndicator = document.createElement('span');
                endIndicator.className = 'end-indicator';
                endIndicator.setAttribute('aria-hidden', 'true');
                endIndicator.textContent = '●';
                barContent.appendChild(endIndicator);
            }
            
            bar.appendChild(barContent);
            container.appendChild(bar);
        });
        
        fragment.appendChild(container);
        
        // HTML 문자열로 변환하여 반환
        return container.outerHTML;
    }
}
