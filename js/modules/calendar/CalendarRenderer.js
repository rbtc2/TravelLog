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

export class CalendarRenderer {
    constructor(container, dataManager) {
        this.container = container;
        this.dataManager = dataManager;
        this.calendarCache = new Map();
        this.lastRenderDate = null;
    }

    /**
     * 캘린더 UI 렌더링
     * 구글 캘린더 스타일의 깔끔한 디자인 적용
     */
    renderContent(currentDate, currentView) {
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
            const countryInfo = getCountryInfo(log.country, this.dataManager.getCountriesManager());
            const flag = getCountryFlag(log.country, this.dataManager.getCountriesManager());
            const countryName = countryInfo ? countryInfo.nameKo : log.country;
            
            // 여행 기간 상태에 따른 클래스
            let statusClass = '';
            if (log.isStartDay) statusClass = 'start-day';
            else if (log.isEndDay) statusClass = 'end-day';
            else if (log.isMiddleDay) statusClass = 'middle-day';
            
            // 툴팁 텍스트 생성
            const tooltipText = generateTooltipText(log, countryName);
            
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
}
