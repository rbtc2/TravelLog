# 🔌 TravelLog API 문서

## 📋 개요

TravelLog의 API 문서는 애플리케이션의 모든 JavaScript 모듈과 함수에 대한 상세한 참조 가이드입니다. 각 모듈의 기능, 사용법, 매개변수, 반환값을 포함합니다.

## 🏗️ API 구조

### **모듈 분류**
```
js/
├── app.js                    # 메인 애플리케이션
├── config/                   # 설정 파일
│   └── form-config.js       # 폼 설정
├── data/                     # 데이터 관리
│   └── countries-manager.js # 국가 데이터 관리
├── modules/                  # 핵심 모듈
│   ├── log-detail.js        # 일지 상세
│   ├── log-edit.js          # 일지 편집
│   ├── repository.js        # 데이터 저장소
│   └── services/            # 서비스 레이어
│       └── log-service.js   # 일지 서비스
├── modules/ui-components/    # UI 컴포넌트
│   ├── country-selector.js  # 국가 선택기
│   ├── modal-manager.js     # 모달 관리
│   ├── pagination-manager.js # 페이지네이션
│   ├── toast-manager.js     # 토스트 알림
│   └── view-manager.js      # 뷰 관리
├── modules/utils/            # 유틸리티
│   ├── country-data-manager.js # 국가 데이터 관리
│   ├── demo-data.js         # 데모 데이터
│   ├── event-manager.js     # 이벤트 관리
│   ├── search-utility.js    # 검색 유틸리티
│   └── storage-manager.js   # 저장소 관리
└── tabs/                     # 탭 모듈
    ├── add-log.js           # 일지 추가
    ├── calendar.js          # 캘린더
    ├── home.js              # 홈
    ├── my-logs.js           # 내 일지
    └── search.js            # 검색
```

## 🎯 핵심 API

### **메인 애플리케이션 (`app.js`)**

#### `App` 클래스
```javascript
class App {
    constructor()
    init()
    loadTab(tabName)
    showTab(tabName)
    hideAllTabs()
    setupEventListeners()
    handleTabClick(event)
    handleNavigation()
}
```

**주요 메서드:**
- `init()`: 애플리케이션 초기화
- `loadTab(tabName)`: 탭 동적 로드
- `showTab(tabName)`: 탭 표시
- `hideAllTabs()`: 모든 탭 숨김

### **탭 모듈 API**

#### **홈 탭 (`home.js`)**
```javascript
class HomeTab {
    constructor()
    render()
    createWelcomeCard()
    createQuickActions()
    createRecentLogs()
    createStatistics()
    loadRecentLogs()
    loadStatistics()
}
```

#### **검색 탭 (`search.js`)**
```javascript
class SearchTab {
    constructor()
    render()
    setupEventListeners()
    handleSearch()
    performSearch(query)
    displayResults(results)
    highlightSearchTerm(text, term)
    clearResults()
    sortResults(results, sortBy)
}
```

#### **일지 추가 탭 (`add-log.js`)**
```javascript
class AddLogTab {
    constructor()
    render()
    setupEventListeners()
    handleSubmit(event)
    validateForm()
    saveLog(logData)
    resetForm()
    handleFileUpload(event)
}
```

#### **캘린더 탭 (`calendar.js`)**
```javascript
class CalendarTab {
    constructor()
    render()
    generateCalendar(year, month)
    createCalendarHeader()
    createCalendarGrid()
    createDayCell(day, isCurrentMonth)
    loadEventsForMonth(year, month)
    handleDayClick(event)
    showEventModal(event)
}
```

#### **내 일지 탭 (`my-logs.js`)**
```javascript
class MyLogsTab {
    constructor()
    render()
    loadLogs()
    displayLogs(logs)
    createLogCard(log)
    handleLogClick(event)
    handleEditLog(event)
    handleDeleteLog(event)
    confirmDelete(logId)
}
```

## 🧩 UI 컴포넌트 API

### **국가 선택기 (`country-selector.js`)**
```javascript
class CountrySelector {
    constructor(containerId, options)
    init()
    render()
    setupEventListeners()
    handleInput(event)
    filterCountries(query)
    displayResults(results)
    selectCountry(country)
    getSelectedCountry()
    clearSelection()
    destroy()
}
```

**사용법:**
```javascript
const selector = new CountrySelector('country-selector', {
    placeholder: '국가를 선택하세요',
    showFlags: true,
    searchEnabled: true
});
```

### **모달 관리자 (`modal-manager.js`)**
```javascript
class ModalManager {
    constructor()
    showModal(modalId, options)
    hideModal(modalId)
    createModal(id, content, options)
    destroyModal(modalId)
    showConfirmDialog(message, callback)
    showAlertDialog(message)
    showPromptDialog(message, callback)
}
```

**사용법:**
```javascript
const modalManager = new ModalManager();
modalManager.showModal('my-modal', {
    title: '제목',
    content: '내용',
    buttons: [
        { text: '확인', action: 'confirm' },
        { text: '취소', action: 'cancel' }
    ]
});
```

### **토스트 관리자 (`toast-manager.js`)**
```javascript
class ToastManager {
    constructor()
    show(message, type, duration)
    showSuccess(message, duration)
    showError(message, duration)
    showWarning(message, duration)
    showInfo(message, duration)
    hide(toastId)
    clearAll()
}
```

**사용법:**
```javascript
const toastManager = new ToastManager();
toastManager.showSuccess('저장되었습니다!');
toastManager.showError('오류가 발생했습니다.');
```

### **페이지네이션 관리자 (`pagination-manager.js`)**
```javascript
class PaginationManager {
    constructor(containerId, options)
    render(currentPage, totalPages, totalItems)
    createPaginationButtons()
    handlePageClick(event)
    updatePaginationInfo()
    goToPage(page)
    goToFirstPage()
    goToLastPage()
    goToPreviousPage()
    goToNextPage()
}
```

### **뷰 관리자 (`view-manager.js`)**
```javascript
class ViewManager {
    constructor()
    showView(viewId)
    hideView(viewId)
    switchView(fromViewId, toViewId)
    createView(viewId, content)
    destroyView(viewId)
    getCurrentView()
    getViewHistory()
    goBack()
    goForward()
}
```

## 🔧 유틸리티 API

### **검색 유틸리티 (`search-utility.js`)**
```javascript
class SearchUtility {
    static searchLogs(logs, query, options)
    static highlightText(text, query)
    static sortResults(results, sortBy)
    static filterByDate(results, startDate, endDate)
    static filterByLocation(results, location)
    static filterByTags(results, tags)
    static calculateRelevanceScore(log, query)
}
```

**사용법:**
```javascript
const results = SearchUtility.searchLogs(logs, '파리', {
    fields: ['title', 'description', 'location'],
    caseSensitive: false,
    exactMatch: false
});
```

### **저장소 관리자 (`storage-manager.js`)**
```javascript
class StorageManager {
    static save(key, data)
    static load(key)
    static remove(key)
    static clear()
    static exists(key)
    static getAllKeys()
    static getStorageSize()
    static exportData()
    static importData(data)
}
```

**사용법:**
```javascript
// 데이터 저장
StorageManager.save('travel-logs', logs);

// 데이터 로드
const logs = StorageManager.load('travel-logs');

// 데이터 삭제
StorageManager.remove('travel-logs');
```

### **이벤트 관리자 (`event-manager.js`)**
```javascript
class EventManager {
    constructor()
    on(event, callback)
    off(event, callback)
    emit(event, data)
    once(event, callback)
    removeAllListeners(event)
    getListeners(event)
}
```

**사용법:**
```javascript
const eventManager = new EventManager();

// 이벤트 리스너 등록
eventManager.on('log-saved', (log) => {
    console.log('일지가 저장되었습니다:', log);
});

// 이벤트 발생
eventManager.emit('log-saved', logData);
```

### **국가 데이터 관리자 (`country-data-manager.js`)**
```javascript
class CountryDataManager {
    static getCountries()
    static getCountryByCode(code)
    static getCountryByName(name)
    static searchCountries(query)
    static getCountriesByRegion(region)
    static getCountryFlag(code)
    static validateCountryCode(code)
}
```

## 📊 서비스 API

### **일지 서비스 (`log-service.js`)**
```javascript
class LogService {
    constructor()
    getAllLogs()
    getLogById(id)
    createLog(logData)
    updateLog(id, logData)
    deleteLog(id)
    searchLogs(query, filters)
    getLogsByDateRange(startDate, endDate)
    getLogsByLocation(location)
    exportLogs(format)
    importLogs(data)
    getStatistics()
}
```

**사용법:**
```javascript
const logService = new LogService();

// 모든 일지 조회
const logs = await logService.getAllLogs();

// 새 일지 생성
const newLog = await logService.createLog({
    title: '파리 여행',
    location: 'Paris, France',
    date: '2024-01-15',
    description: '에펠탑 방문'
});

// 일지 검색
const results = await logService.searchLogs('파리', {
    dateRange: { start: '2024-01-01', end: '2024-12-31' }
});
```

## 🗂️ 데이터 관리 API

### **저장소 (`repository.js`)**
```javascript
class Repository {
    constructor(storageKey)
    save(data)
    load()
    clear()
    exists()
    getSize()
    export()
    import(data)
    backup()
    restore(backupData)
}
```

### **국가 관리자 (`countries-manager.js`)**
```javascript
class CountriesManager {
    constructor()
    loadCountries()
    getCountries()
    searchCountries(query)
    getCountryByCode(code)
    getCountryByName(name)
    getCountriesByRegion(region)
    updateCountries()
    isOnline()
    getLastUpdate()
}
```

## ⚙️ 설정 API

### **폼 설정 (`form-config.js`)**
```javascript
const FormConfig = {
    validation: {
        title: { required: true, minLength: 1, maxLength: 100 },
        location: { required: true, minLength: 1, maxLength: 100 },
        date: { required: true, type: 'date' },
        description: { required: false, maxLength: 1000 }
    },
    fields: [
        { name: 'title', type: 'text', label: '제목' },
        { name: 'location', type: 'text', label: '위치' },
        { name: 'date', type: 'date', label: '날짜' },
        { name: 'description', type: 'textarea', label: '설명' }
    ],
    submitButton: { text: '저장', class: 'btn-primary' }
};
```

## 🔄 이벤트 시스템

### **전역 이벤트**
```javascript
// 애플리케이션 이벤트
'app:init'           // 앱 초기화 완료
'app:tab:change'     // 탭 변경
'app:error'          // 오류 발생

// 일지 이벤트
'log:created'        // 일지 생성
'log:updated'        // 일지 수정
'log:deleted'        // 일지 삭제
'log:search'         // 일지 검색

// UI 이벤트
'modal:show'         // 모달 표시
'modal:hide'         // 모달 숨김
'toast:show'         // 토스트 표시
'toast:hide'         // 토스트 숨김
```

### **이벤트 사용법**
```javascript
// 이벤트 리스너 등록
document.addEventListener('log:created', (event) => {
    console.log('새 일지가 생성되었습니다:', event.detail);
});

// 이벤트 발생
const event = new CustomEvent('log:created', {
    detail: { id: 1, title: '파리 여행' }
});
document.dispatchEvent(event);
```

## 📝 사용 예제

### **기본 사용법**
```javascript
// 애플리케이션 초기화
const app = new App();
app.init();

// 검색 기능 사용
const searchTab = new SearchTab();
searchTab.render();
searchTab.performSearch('파리');

// 일지 추가
const addLogTab = new AddLogTab();
addLogTab.render();
```

### **컴포넌트 조합**
```javascript
// 국가 선택기와 모달 조합
const countrySelector = new CountrySelector('country-selector');
const modalManager = new ModalManager();

// 모달에서 국가 선택기 사용
modalManager.showModal('country-modal', {
    content: '<div id="country-selector"></div>',
    onShow: () => countrySelector.init()
});
```

### **데이터 관리**
```javascript
// 일지 서비스 사용
const logService = new LogService();

// 일지 생성
const newLog = await logService.createLog({
    title: '도쿄 여행',
    location: 'Tokyo, Japan',
    date: '2024-02-15',
    description: '첫 일본 여행'
});

// 검색 및 필터링
const results = await logService.searchLogs('도쿄', {
    dateRange: { start: '2024-01-01', end: '2024-12-31' },
    location: 'Japan'
});
```

## 🚨 오류 처리

### **오류 타입**
```javascript
class TravelLogError extends Error {
    constructor(message, code, details)
}

// 오류 코드
const ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    STORAGE_ERROR: 'STORAGE_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    PERMISSION_DENIED: 'PERMISSION_DENIED'
};
```

### **오류 처리 예제**
```javascript
try {
    const log = await logService.createLog(logData);
    toastManager.showSuccess('일지가 저장되었습니다.');
} catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
        toastManager.showError('입력 데이터를 확인해주세요.');
    } else if (error.code === 'STORAGE_ERROR') {
        toastManager.showError('저장 중 오류가 발생했습니다.');
    } else {
        toastManager.showError('알 수 없는 오류가 발생했습니다.');
    }
}
```

## 🔧 개발자 도구

### **디버깅**
```javascript
// 디버그 모드 활성화
window.TravelLogDebug = true;

// 로그 레벨 설정
const DEBUG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

// 디버그 로그
console.debug('TravelLog:', 'Debug message');
```

### **성능 모니터링**
```javascript
// 성능 측정
const startTime = performance.now();
// ... 작업 수행
const endTime = performance.now();
console.log(`작업 시간: ${endTime - startTime}ms`);
```

---

**다음 단계**: [시스템 아키텍처](../guides/architecture.md) 또는 [시작 가이드](../guides/getting-started.md)를 참조하여 전체 시스템을 이해하세요.
