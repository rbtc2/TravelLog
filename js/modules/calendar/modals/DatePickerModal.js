/**
 * 날짜 피커 모달 모듈
 * 날짜 선택 모달의 모든 기능을 담당
 */

export class DatePickerModal {
    constructor(calendarTab) {
        this.calendarTab = calendarTab;
        this.modal = null;
        this.previousFocusedElement = null;
    }

    /**
     * 날짜 피커 모달 표시
     */
    show() {
        // 기존 모달이 있으면 제거
        const existingModal = document.querySelector('.date-picker-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 현재 포커스된 요소 저장 (접근성)
        this.previousFocusedElement = document.activeElement;
        
        this.modal = document.createElement('div');
        this.modal.className = 'date-picker-modal';
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
        
        // 모달 표시 로그 제거 (성능 최적화)
    }

    /**
     * 날짜 피커 모달 HTML 렌더링
     */
    renderModal() {
        const currentYear = this.calendarTab.currentDate.getFullYear();
        const currentMonth = this.calendarTab.currentDate.getMonth();
        
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
    bindModalEvents() {
        const overlay = this.modal.querySelector('#date-picker-overlay');
        const closeBtn = this.modal.querySelector('#date-picker-close');
        const cancelBtn = this.modal.querySelector('#date-picker-cancel');
        const confirmBtn = this.modal.querySelector('#date-picker-confirm');
        const yearPrevBtn = this.modal.querySelector('#year-prev');
        const yearNextBtn = this.modal.querySelector('#year-next');
        const yearDisplay = this.modal.querySelector('#current-year-display');
        const monthGrid = this.modal.querySelector('#month-grid');
        
        let selectedYear = this.calendarTab.currentDate.getFullYear();
        let selectedMonth = this.calendarTab.currentDate.getMonth();
        
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
        
        const updateYearDisplay = () => {
            yearDisplay.textContent = selectedYear;
            // 월 그리드 업데이트
            monthGrid.innerHTML = this.renderMonthGrid(selectedYear, selectedMonth);
            this.bindMonthSelection(selectedYear);
        };
        
        const bindMonthSelection = (year) => {
            const monthBtns = this.modal.querySelectorAll('.month-btn');
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
        this.modal.addEventListener('close', () => {
            document.removeEventListener('keydown', handleEscKey);
        });
        
        // 초기 월 선택 바인딩
        this.bindMonthSelection = bindMonthSelection;
        bindMonthSelection(selectedYear);
    }

    /**
     * 특정 연도/월로 이동
     */
    navigateToDate(year, month) {
        this.calendarTab.currentDate = new Date(year, month, 1);
        this.calendarTab.refreshCalendar();
        // 날짜 이동 로그 제거 (성능 최적화)
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
    }
}
