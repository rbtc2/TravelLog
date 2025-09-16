/**
 * 날짜 범위 선택 모달 모듈
 * 검색 필터에서 시작일과 종료일을 한 번에 선택할 수 있는 모달
 */

export class DateRangePickerModal {
    constructor(searchTab) {
        this.searchTab = searchTab;
        this.modal = null;
        this.previousFocusedElement = null;
        this.selectedStartDate = null;
        this.selectedEndDate = null;
        this.currentDate = new Date();
        this.selectionMode = 'start'; // 'start' 또는 'end'
    }

    /**
     * 날짜 범위 선택 모달 표시
     * @param {string} startDate - 현재 시작일 (YYYY-MM-DD)
     * @param {string} endDate - 현재 종료일 (YYYY-MM-DD)
     */
    show(startDate = null, endDate = null) {
        // 기존 모달이 있으면 제거
        const existingModal = document.querySelector('.date-range-picker-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 현재 포커스된 요소 저장 (접근성)
        this.previousFocusedElement = document.activeElement;
        
        // 기존 날짜 설정
        this.selectedStartDate = startDate ? new Date(startDate) : null;
        this.selectedEndDate = endDate ? new Date(endDate) : null;
        this.selectionMode = 'start';
        
        this.modal = document.createElement('div');
        this.modal.className = 'date-range-picker-modal';
        this.modal.innerHTML = this.renderModal();
        
        document.body.appendChild(this.modal);
        
        // 모달 이벤트 바인딩
        this.bindModalEvents();
        
        // 애니메이션을 위한 지연
        setTimeout(() => {
            this.modal.classList.add('show');
            // 첫 번째 포커스 가능한 요소에 포커스
            const firstFocusable = this.modal.querySelector('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 10);
    }

    /**
     * 날짜 범위 선택 모달 HTML 렌더링
     */
    renderModal() {
        const currentYear = this.currentDate.getFullYear();
        const currentMonth = this.currentDate.getMonth();
        
        return `
            <div class="modal-overlay" id="date-range-picker-overlay" aria-hidden="true"></div>
            <div class="modal-content date-range-picker-content" 
                 role="dialog" 
                 aria-modal="true" 
                 aria-labelledby="date-range-picker-title"
                 aria-describedby="date-range-picker-description">
                <div class="modal-header">
                    <h3 id="date-range-picker-title">📅 기간 선택</h3>
                    <button class="modal-close-btn" id="date-range-picker-close" aria-label="기간 선택 모달 닫기">×</button>
                </div>
                
                <div class="modal-body">
                    <div id="date-range-picker-description" class="sr-only">
                        여행 기간을 선택하세요. 시작일을 먼저 선택하고 종료일을 선택하면 됩니다.
                        화살표 키로 월을 변경하고, 날짜를 클릭하여 선택하세요.
                    </div>
                    
                    <!-- 선택된 날짜 범위 표시 -->
                    <div class="selected-range-display" role="region" aria-label="선택된 날짜 범위">
                        <div class="range-info">
                            <div class="range-item start-date-info">
                                <label class="range-label">시작일</label>
                                <div class="range-value" id="selected-start-display">
                                    ${this.selectedStartDate ? this.formatDate(this.selectedStartDate) : '선택하세요'}
                                </div>
                            </div>
                            <div class="range-separator">~</div>
                            <div class="range-item end-date-info">
                                <label class="range-label">종료일</label>
                                <div class="range-value" id="selected-end-display">
                                    ${this.selectedEndDate ? this.formatDate(this.selectedEndDate) : '선택하세요'}
                                </div>
                            </div>
                        </div>
                        <div class="selection-mode-indicator">
                            <span class="mode-text" id="selection-mode-text">
                                ${this.selectionMode === 'start' ? '시작일을 선택하세요' : '종료일을 선택하세요'}
                            </span>
                        </div>
                    </div>
                    
                    <!-- 캘린더 네비게이션 -->
                    <div class="calendar-navigation">
                        <button class="nav-btn prev-month-btn" id="prev-month" aria-label="이전 달로 이동">◀</button>
                        <h4 class="current-month-display" id="current-month-display" aria-live="polite">
                            ${this.getMonthText(currentYear, currentMonth)}
                        </h4>
                        <button class="nav-btn next-month-btn" id="next-month" aria-label="다음 달로 이동">▶</button>
                    </div>
                    
                    <!-- 캘린더 그리드 -->
                    <div class="calendar-container">
                        <div class="calendar-grid" id="calendar-grid" role="grid" aria-label="날짜 선택">
                            ${this.renderCalendarGrid(currentYear, currentMonth)}
                        </div>
                    </div>
                    
                    <!-- 빠른 선택 버튼들 -->
                    <div class="quick-select-buttons">
                        <button class="quick-btn" data-days="7">최근 1주일</button>
                        <button class="quick-btn" data-days="30">최근 1개월</button>
                        <button class="quick-btn" data-days="90">최근 3개월</button>
                        <button class="quick-btn" data-action="clear">선택 초기화</button>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="modal-btn cancel-btn" id="date-range-picker-cancel">취소</button>
                    <button class="modal-btn confirm-btn" id="date-range-picker-confirm" 
                            ${(!this.selectedStartDate && !this.selectedEndDate) ? 'disabled' : ''}>
                        적용
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 캘린더 그리드 렌더링
     */
    renderCalendarGrid(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        const today = new Date();
        
        // 월요일 시작으로 조정
        const dayOfWeek = (firstDay.getDay() + 6) % 7;
        startDate.setDate(startDate.getDate() - dayOfWeek);
        
        let gridHTML = `
            <div class="calendar-header">
                <div class="day-header">월</div>
                <div class="day-header">화</div>
                <div class="day-header">수</div>
                <div class="day-header">목</div>
                <div class="day-header">금</div>
                <div class="day-header">토</div>
                <div class="day-header">일</div>
            </div>
            <div class="calendar-body">
        `;
        
        const currentDate = new Date(startDate);
        for (let week = 0; week < 6; week++) {
            gridHTML += '<div class="calendar-week">';
            
            for (let day = 0; day < 7; day++) {
                const isCurrentMonth = currentDate.getMonth() === month;
                const isToday = this.isSameDate(currentDate, today);
                const isSelected = this.isDateSelected(currentDate);
                const isInRange = this.isDateInRange(currentDate);
                const isStartDate = this.isSameDate(currentDate, this.selectedStartDate);
                const isEndDate = this.isSameDate(currentDate, this.selectedEndDate);
                const isPastDate = currentDate > today;
                
                let classes = ['calendar-day'];
                if (!isCurrentMonth) classes.push('other-month');
                if (isToday) classes.push('today');
                if (isSelected) classes.push('selected');
                if (isInRange) classes.push('in-range');
                if (isStartDate) classes.push('start-date');
                if (isEndDate) classes.push('end-date');
                if (isPastDate) classes.push('future-date');
                
                gridHTML += `
                    <button class="${classes.join(' ')}" 
                            data-date="${this.formatDateForData(currentDate)}"
                            data-year="${currentDate.getFullYear()}"
                            data-month="${currentDate.getMonth()}"
                            data-day="${currentDate.getDate()}"
                            role="gridcell"
                            aria-selected="${isSelected}"
                            aria-label="${this.formatDateForAria(currentDate)}"
                            ${!isCurrentMonth ? 'tabindex="-1"' : ''}
                            ${isPastDate ? 'disabled' : ''}>
                        <span class="day-number">${currentDate.getDate()}</span>
                    </button>
                `;
                
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            gridHTML += '</div>';
            
            // 현재 월의 날짜가 모두 표시되면 중단
            if (currentDate.getMonth() !== month && week >= 3) {
                break;
            }
        }
        
        gridHTML += '</div>';
        return gridHTML;
    }

    /**
     * 날짜 범위 선택 모달 이벤트 바인딩
     */
    bindModalEvents() {
        const overlay = this.modal.querySelector('#date-range-picker-overlay');
        const closeBtn = this.modal.querySelector('#date-range-picker-close');
        const cancelBtn = this.modal.querySelector('#date-range-picker-cancel');
        const confirmBtn = this.modal.querySelector('#date-range-picker-confirm');
        const prevMonthBtn = this.modal.querySelector('#prev-month');
        const nextMonthBtn = this.modal.querySelector('#next-month');
        const monthDisplay = this.modal.querySelector('#current-month-display');
        const calendarGrid = this.modal.querySelector('#calendar-grid');
        const quickButtons = this.modal.querySelectorAll('.quick-btn');
        
        let currentYear = this.currentDate.getFullYear();
        let currentMonth = this.currentDate.getMonth();
        
        const closeModal = () => {
            this.modal.classList.remove('show');
            setTimeout(() => {
                this.modal.remove();
                // 원래 포커스된 요소로 돌아가기 (접근성)
                if (this.previousFocusedElement) {
                    this.previousFocusedElement.focus();
                }
            }, 300);
        };
        
        const updateCalendar = () => {
            monthDisplay.textContent = this.getMonthText(currentYear, currentMonth);
            calendarGrid.innerHTML = this.renderCalendarGrid(currentYear, currentMonth);
            this.bindDateSelection();
        };
        
        const updateConfirmButton = () => {
            const hasSelection = this.selectedStartDate || this.selectedEndDate;
            confirmBtn.disabled = !hasSelection;
        };
        
        const updateSelectionDisplay = () => {
            const startDisplay = this.modal.querySelector('#selected-start-display');
            const endDisplay = this.modal.querySelector('#selected-end-display');
            const modeText = this.modal.querySelector('#selection-mode-text');
            
            startDisplay.textContent = this.selectedStartDate ? 
                this.formatDate(this.selectedStartDate) : '선택하세요';
            endDisplay.textContent = this.selectedEndDate ? 
                this.formatDate(this.selectedEndDate) : '선택하세요';
            
            if (this.selectedStartDate && this.selectedEndDate) {
                modeText.textContent = '날짜 범위가 선택되었습니다';
            } else if (this.selectionMode === 'start') {
                modeText.textContent = '시작일을 선택하세요';
            } else {
                modeText.textContent = '종료일을 선택하세요';
            }
        };
        
        // 이벤트 리스너 등록
        overlay.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        confirmBtn.addEventListener('click', () => {
            this.applyDateRange();
            closeModal();
        });
        
        prevMonthBtn.addEventListener('click', () => {
            if (currentMonth === 0) {
                currentYear--;
                currentMonth = 11;
            } else {
                currentMonth--;
            }
            updateCalendar();
        });
        
        nextMonthBtn.addEventListener('click', () => {
            if (currentMonth === 11) {
                currentYear++;
                currentMonth = 0;
            } else {
                currentMonth++;
            }
            updateCalendar();
        });
        
        // 빠른 선택 버튼 이벤트
        quickButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const days = btn.dataset.days;
                
                if (action === 'clear') {
                    this.selectedStartDate = null;
                    this.selectedEndDate = null;
                    this.selectionMode = 'start';
                } else if (days) {
                    const today = new Date();
                    const pastDate = new Date();
                    pastDate.setDate(today.getDate() - parseInt(days));
                    
                    this.selectedStartDate = pastDate;
                    this.selectedEndDate = today;
                    this.selectionMode = 'start';
                }
                
                updateSelectionDisplay();
                updateConfirmButton();
                updateCalendar();
            });
        });
        
        // ESC 키로 모달 닫기
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEscKey);
        
        // 모달이 닫힐 때 이벤트 리스너 정리
        this.modal.addEventListener('close', () => {
            document.removeEventListener('keydown', handleEscKey);
        });
        
        // 초기 날짜 선택 바인딩
        this.bindDateSelection();
        this.updateSelectionDisplay = updateSelectionDisplay;
        this.updateConfirmButton = updateConfirmButton;
        this.updateCalendar = updateCalendar;
    }

    /**
     * 날짜 선택 이벤트 바인딩
     */
    bindDateSelection() {
        const dayButtons = this.modal.querySelectorAll('.calendar-day:not(.other-month):not([disabled])');
        
        dayButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const dateStr = btn.dataset.date;
                const selectedDate = new Date(dateStr);
                
                if (this.selectionMode === 'start') {
                    this.selectedStartDate = selectedDate;
                    this.selectedEndDate = null;
                    this.selectionMode = 'end';
                } else {
                    if (selectedDate < this.selectedStartDate) {
                        // 시작일보다 이전 날짜를 선택한 경우, 시작일을 다시 설정
                        this.selectedEndDate = this.selectedStartDate;
                        this.selectedStartDate = selectedDate;
                    } else {
                        this.selectedEndDate = selectedDate;
                    }
                    this.selectionMode = 'start';
                }
                
                this.updateSelectionDisplay();
                this.updateConfirmButton();
                this.updateCalendar();
            });
        });
    }

    /**
     * 선택된 날짜 범위를 검색 필터에 적용
     */
    applyDateRange() {
        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        
        if (startDateInput && this.selectedStartDate) {
            startDateInput.value = this.formatDateForInput(this.selectedStartDate);
        }
        
        if (endDateInput && this.selectedEndDate) {
            endDateInput.value = this.formatDateForInput(this.selectedEndDate);
        }
        
        // 필터 자동 적용
        if (this.searchTab && this.searchTab.applyFilters) {
            this.searchTab.applyFilters();
        }
    }

    /**
     * 날짜가 선택된 범위에 있는지 확인
     */
    isDateInRange(date) {
        if (!this.selectedStartDate || !this.selectedEndDate) return false;
        return date > this.selectedStartDate && date < this.selectedEndDate;
    }

    /**
     * 날짜가 선택되었는지 확인
     */
    isDateSelected(date) {
        return this.isSameDate(date, this.selectedStartDate) || 
               this.isSameDate(date, this.selectedEndDate);
    }

    /**
     * 두 날짜가 같은지 확인
     */
    isSameDate(date1, date2) {
        if (!date1 || !date2) return false;
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    /**
     * 월 텍스트 반환
     */
    getMonthText(year, month) {
        const months = [
            '1월', '2월', '3월', '4월', '5월', '6월',
            '7월', '8월', '9월', '10월', '11월', '12월'
        ];
        return `${year}년 ${months[month]}`;
    }

    /**
     * 날짜 포맷 (표시용)
     */
    formatDate(date) {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }

    /**
     * 날짜 포맷 (데이터용)
     */
    formatDateForData(date) {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 날짜 포맷 (input용)
     */
    formatDateForInput(date) {
        if (!date) return '';
        return this.formatDateForData(date);
    }

    /**
     * 날짜 포맷 (접근성용)
     */
    formatDateForAria(date) {
        if (!date) return '';
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}년 ${month}월 ${day}일`;
    }

    /**
     * 모달 숨기기
     */
    hide() {
        if (this.modal) {
            this.modal.classList.remove('show');
            setTimeout(() => {
                if (this.modal && this.modal.parentNode) {
                    this.modal.parentNode.removeChild(this.modal);
                }
                this.modal = null;
            }, 300);
        }
    }

    /**
     * 모달 정리
     */
    cleanup() {
        this.hide();
        this.previousFocusedElement = null;
        this.selectedStartDate = null;
        this.selectedEndDate = null;
    }
}

