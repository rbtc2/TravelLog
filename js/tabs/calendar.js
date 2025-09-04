/**
 * 캘린더 탭 모듈
 * 해외 체류 기록을 캘린더 형태로 표시하는 독립 모듈
 * 향후 월간/주간 뷰 기능의 견고한 기반이 될 핵심 아키텍처
 */

// 유틸리티 함수들 import
import {
    parseLocalDate,
    formatDateString,
    formatDate,
    getCurrentMonthText,
    getCountryFlag,
    getCountryInfo,
    addEventListener,
    removeAllEventListeners,
    generateTooltipText,
    startPerformanceMeasurement,
    debounce,
    throttle
} from '../modules/calendar/CalendarUtils.js';

// 데이터 관리 모듈 import
import { CalendarDataManager } from '../modules/calendar/CalendarDataManager.js';

// 렌더링 모듈 import
import { CalendarRenderer } from '../modules/calendar/CalendarRenderer.js';

class CalendarTab {
    constructor() {
        this.isInitialized = false;
        this.eventListeners = [];
        this.currentDate = new Date();
        this.currentView = 'month'; // 'month' | 'week'
        this.selectedDate = null;
        
        // 데이터 관리자
        this.dataManager = new CalendarDataManager();
        
        // 렌더링 관리자
        this.renderer = null;
        
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
            await this.dataManager.initializeCountriesManager();
            
            // 기존 여행 로그 데이터 로드
            await this.dataManager.loadTravelLogs();
            
            // 렌더러 초기화
            this.renderer = new CalendarRenderer(container, this.dataManager);
            
            this.renderer.renderContent(this.currentDate, this.currentView);
            this.bindEvents();
            this.isInitialized = true;
            
            console.log('캘린더 탭 초기화 완료');
        } catch (error) {
            console.error('캘린더 탭 초기화 실패:', error);
            // 에러가 발생해도 기본 UI는 렌더링
            this.renderer = new CalendarRenderer(container, this.dataManager);
            this.renderer.renderContent(this.currentDate, this.currentView);
            this.bindEvents();
            this.isInitialized = true;
        }
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
        addEventListener(this.container, 'click', viewToggleHandler, {}, this.eventListeners);
        addEventListener(this.container, 'click', navigationHandler, {}, this.eventListeners);
        addEventListener(this.container, 'click', dayClickHandler, {}, this.eventListeners);
        addEventListener(this.container, 'click', datePickerHandler, {}, this.eventListeners);
        
        // 키보드 네비게이션 (접근성 향상)
        const keyboardHandler = (e) => {
            this.handleKeyboardNavigation(e);
        };
        
        addEventListener(document, 'keydown', keyboardHandler, {}, this.eventListeners);
        
        // 윈도우 리사이즈 이벤트 (반응형 대응)
        const resizeHandler = () => {
            this.handleResize();
        };
        
        addEventListener(window, 'resize', resizeHandler, {}, this.eventListeners);
        
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
        this.renderer.updateViewToggle(view);
        
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
        this.renderer.updateSelectedDate(date);
        
        // 상세 정보 업데이트
        this.renderer.updateDetails(date);
        
        console.log('날짜 선택:', date);
    }
    
    
    /**
     * 캘린더 새로고침
     * 성능 최적화를 위해 필요한 부분만 업데이트
     */
    refreshCalendar() {
        if (!this.renderer) return;
        
        try {
            // 렌더러를 통한 새로고침
            this.renderer.refreshCalendar(this.currentDate, this.selectedDate);
            
            // 오래된 캐시 정리 (주기적으로)
            if (Math.random() < 0.1) { // 10% 확률로 실행
                this.renderer.cleanupOldCache();
            }
            
        } catch (error) {
            console.error('캘린더 새로고침 중 오류 발생:', error);
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
        if (this.renderer) {
            this.renderer.clearCache();
        }
        
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
            removeAllEventListeners(this.eventListeners);
            this.isInitialized = false;
            
            // 캐시 정리
            if (this.renderer) {
                this.renderer.clearCache();
            }
            this.dataManager.clear();
            
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
        addEventListener(this.container, 'touchstart', handleTouchStart, { passive: true }, this.eventListeners);
        addEventListener(this.container, 'touchend', handleTouchEnd, { passive: true }, this.eventListeners);
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
        addEventListener(this.container, 'mouseover', mouseOverHandler, {}, this.eventListeners);
        addEventListener(this.container, 'mouseout', mouseOutHandler, {}, this.eventListeners);
        addEventListener(this.container, 'focusin', focusHandler, {}, this.eventListeners);
        addEventListener(this.container, 'focusout', blurHandler, {}, this.eventListeners);
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
        
        const countryInfo = getCountryInfo(country, this.dataManager.getCountriesManager());
        const countryName = countryInfo ? countryInfo.nameKo : country;
        const flag = getCountryFlag(country, this.dataManager.getCountriesManager());
        
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
        this.dataManager.updateTravelLogs(logs);
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