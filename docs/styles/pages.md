# 📄 TravelLog 페이지별 스타일 가이드

## 📋 개요

TravelLog의 페이지별 스타일은 각 탭과 화면에 특화된 스타일을 정의합니다. 모든 페이지는 일관된 디자인 시스템을 따르면서도 각각의 고유한 특성을 가집니다.

## 🏗️ 페이지 스타일 구조

### **파일 구조**
```
styles/pages/
├── home.css             # 홈 페이지
├── search.css           # 검색 페이지
├── add-log.css          # 일지 추가 페이지
├── calendar.css         # 캘린더 페이지
├── my-logs.css          # 내 일지 페이지
├── log-detail.css       # 일정 상세 페이지
├── login.css            # 로그인 페이지
├── settings.css         # 설정 페이지
├── travel-report.css    # 여행 리포트 페이지
└── error.css            # 에러 페이지
```

## 🏠 홈 페이지 스타일

### **홈 페이지 레이아웃**
```css
/* 홈 페이지 컨테이너 */
.home-container {
    padding: var(--spacing-6);
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: var(--white);
}

/* 홈 페이지 헤더 */
.home-header {
    text-align: center;
    margin-bottom: var(--spacing-8);
}

.home-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    margin-bottom: var(--spacing-4);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.home-subtitle {
    font-size: var(--font-size-lg);
    opacity: 0.9;
    margin-bottom: var(--spacing-6);
}

/* 홈 페이지 콘텐츠 */
.home-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-6);
    margin-bottom: var(--spacing-8);
}

/* 홈 페이지 카드 */
.home-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-xl);
    padding: var(--spacing-6);
    text-align: center;
    transition: all 0.3s ease-in-out;
}

.home-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
}

.home-card-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-4);
}

.home-card-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin-bottom: var(--spacing-2);
}

.home-card-description {
    opacity: 0.9;
    line-height: 1.6;
}
```

## 🔍 검색 페이지 스타일

### **검색 페이지 레이아웃**
```css
/* 검색 페이지 컨테이너 */
.search-container {
    padding: var(--spacing-6);
    max-width: 1000px;
    margin: 0 auto;
}

/* 검색 헤더 */
.search-header {
    margin-bottom: var(--spacing-8);
    text-align: center;
}

.search-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
}

.search-description {
    color: var(--text-muted);
    font-size: var(--font-size-lg);
}

/* 검색 바 */
.search-bar {
    position: relative;
    margin-bottom: var(--spacing-6);
}

.search-input {
    width: 100%;
    padding: var(--spacing-4) var(--spacing-6);
    padding-left: 50px;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-xl);
    font-size: var(--font-size-lg);
    background-color: var(--white);
    box-shadow: var(--shadow-md);
    transition: all 0.3s ease-in-out;
}

.search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: var(--font-size-lg);
}

/* 검색 필터 */
.search-filters {
    background-color: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-4);
    margin-bottom: var(--spacing-6);
    box-shadow: var(--shadow-sm);
}

.filter-group {
    display: flex;
    gap: var(--spacing-4);
    align-items: center;
    flex-wrap: wrap;
}

.filter-label {
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
}

.filter-select {
    padding: var(--spacing-2) var(--spacing-3);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--white);
    font-size: var(--font-size-sm);
}

/* 검색 결과 */
.search-results {
    margin-top: var(--spacing-6);
}

.search-results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-4);
}

.results-count {
    color: var(--text-muted);
    font-size: var(--font-size-sm);
}

.sort-select {
    padding: var(--spacing-2) var(--spacing-3);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--white);
    font-size: var(--font-size-sm);
}

/* 검색 결과 아이템 */
.search-result-item {
    background-color: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-6);
    margin-bottom: var(--spacing-4);
    box-shadow: var(--shadow-sm);
    transition: all 0.2s ease-in-out;
}

.search-result-item:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.result-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
}

.result-meta {
    display: flex;
    gap: var(--spacing-4);
    margin-bottom: var(--spacing-3);
    flex-wrap: wrap;
}

.result-date {
    color: var(--text-muted);
    font-size: var(--font-size-sm);
}

.result-location {
    color: var(--text-muted);
    font-size: var(--font-size-sm);
}

.result-description {
    color: var(--text-secondary);
    line-height: 1.6;
}

/* 검색 하이라이팅 */
.search-highlight {
    background: #fff3cd;
    color: #856404;
    padding: 2px 4px;
    border-radius: 3px;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
```

## ➕ 일지 추가 페이지 스타일

### **일지 추가 페이지 레이아웃**
```css
/* 일지 추가 컨테이너 */
.add-log-container {
    padding: var(--spacing-6);
    max-width: 800px;
    margin: 0 auto;
}

/* 폼 섹션 */
.form-section {
    background-color: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-6);
    margin-bottom: var(--spacing-6);
    box-shadow: var(--shadow-sm);
}

.section-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-4);
    padding-bottom: var(--spacing-2);
    border-bottom: 2px solid var(--primary-color);
}

/* 폼 그리드 */
.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-4);
}

.form-grid-full {
    grid-column: 1 / -1;
}

/* 날짜 선택기 */
.date-picker {
    display: flex;
    gap: var(--spacing-4);
    align-items: center;
}

.date-input {
    flex: 1;
    padding: var(--spacing-3) var(--spacing-4);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
}

/* 국가 선택기 */
.country-selector-container {
    position: relative;
}

.country-selector-input {
    width: 100%;
    padding: var(--spacing-3) var(--spacing-4);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    background-color: var(--white);
}

/* 파일 업로드 */
.file-upload {
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-8);
    text-align: center;
    transition: all 0.3s ease-in-out;
    cursor: pointer;
}

.file-upload:hover {
    border-color: var(--primary-color);
    background-color: var(--primary-light);
}

.file-upload-icon {
    font-size: 3rem;
    color: var(--text-muted);
    margin-bottom: var(--spacing-4);
}

.file-upload-text {
    color: var(--text-muted);
    font-size: var(--font-size-lg);
}

/* 액션 버튼 */
.form-actions {
    display: flex;
    gap: var(--spacing-4);
    justify-content: flex-end;
    margin-top: var(--spacing-6);
    padding-top: var(--spacing-6);
    border-top: 1px solid var(--border-color);
}
```

## 📅 캘린더 페이지 스타일

### **캘린더 페이지 레이아웃**
```css
/* 캘린더 컨테이너 */
.calendar-container {
    padding: var(--spacing-6);
    max-width: 1200px;
    margin: 0 auto;
}

/* 캘린더 헤더 */
.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-6);
}

.calendar-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-primary);
}

.calendar-nav {
    display: flex;
    gap: var(--spacing-2);
    align-items: center;
}

.calendar-nav-btn {
    padding: var(--spacing-2) var(--spacing-3);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--white);
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.calendar-nav-btn:hover {
    background-color: var(--gray-50);
}

.calendar-month {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
    min-width: 150px;
    text-align: center;
}

/* 캘린더 그리드 */
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background-color: var(--border-color);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.calendar-day-header {
    background-color: var(--gray-100);
    padding: var(--spacing-3);
    text-align: center;
    font-weight: 600;
    color: var(--text-primary);
    font-size: var(--font-size-sm);
}

.calendar-day {
    background-color: var(--white);
    padding: var(--spacing-3);
    min-height: 100px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.calendar-day:hover {
    background-color: var(--gray-50);
}

.calendar-day.other-month {
    background-color: var(--gray-50);
    color: var(--text-muted);
}

.calendar-day.today {
    background-color: var(--primary-light);
    color: var(--primary-color);
    font-weight: 600;
}

.calendar-day.has-events {
    background-color: var(--success-color);
    color: var(--white);
}

/* 이벤트 표시 */
.calendar-event {
    background-color: var(--primary-color);
    color: var(--white);
    padding: 2px 6px;
    border-radius: 3px;
    font-size: var(--font-size-xs);
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
```

## 📝 내 일지 페이지 스타일

### **내 일지 페이지 레이아웃**
```css
/* 내 일지 컨테이너 */
.my-logs-container {
    padding: var(--spacing-6);
    max-width: 1000px;
    margin: 0 auto;
}

/* 일지 헤더 */
.logs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-6);
}

.logs-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-primary);
}

.logs-actions {
    display: flex;
    gap: var(--spacing-3);
}

/* 일지 목록 */
.logs-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-6);
}

/* 일지 카드 */
.log-card {
    background-color: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s ease-in-out;
}

.log-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-4px);
}

.log-card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.log-card-content {
    padding: var(--spacing-4);
}

.log-card-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
}

.log-card-meta {
    display: flex;
    gap: var(--spacing-4);
    margin-bottom: var(--spacing-3);
    font-size: var(--font-size-sm);
    color: var(--text-muted);
}

.log-card-description {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: var(--spacing-4);
}

.log-card-actions {
    display: flex;
    gap: var(--spacing-2);
    justify-content: flex-end;
}

/* 일지 상세 */
.log-detail-container {
    padding: var(--spacing-6);
    max-width: 800px;
    margin: 0 auto;
}

.log-detail-header {
    margin-bottom: var(--spacing-6);
}

.log-detail-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
}

.log-detail-meta {
    display: flex;
    gap: var(--spacing-6);
    color: var(--text-muted);
    font-size: var(--font-size-sm);
}

.log-detail-content {
    background-color: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-6);
    box-shadow: var(--shadow-sm);
}

.log-detail-image {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-4);
}

.log-detail-description {
    color: var(--text-secondary);
    line-height: 1.8;
    font-size: var(--font-size-lg);
}
```

## 🔐 로그인 페이지 스타일

### **로그인 페이지 레이아웃**
```css
/* 로그인 컨테이너 */
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: var(--spacing-6);
}

/* 로그인 카드 */
.login-card {
    background-color: var(--white);
    border-radius: var(--radius-xl);
    padding: var(--spacing-8);
    box-shadow: var(--shadow-xl);
    width: 100%;
    max-width: 400px;
}

.login-header {
    text-align: center;
    margin-bottom: var(--spacing-8);
}

.login-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
}

.login-subtitle {
    color: var(--text-muted);
    font-size: var(--font-size-base);
}

/* 로그인 폼 */
.login-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
}

.login-input {
    width: 100%;
    padding: var(--spacing-4);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    transition: border-color 0.2s ease-in-out;
}

.login-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.login-button {
    width: 100%;
    padding: var(--spacing-4);
    background-color: var(--primary-color);
    color: var(--white);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
}

.login-button:hover {
    background-color: var(--primary-dark);
}

/* 로그인 링크 */
.login-links {
    text-align: center;
    margin-top: var(--spacing-6);
}

.login-link {
    color: var(--primary-color);
    text-decoration: none;
    font-size: var(--font-size-sm);
}

.login-link:hover {
    text-decoration: underline;
}
```

## ⚙️ 설정 페이지 스타일

### **설정 페이지 레이아웃**
```css
/* 설정 컨테이너 */
.settings-container {
    padding: var(--spacing-6);
    max-width: 800px;
    margin: 0 auto;
}

/* 설정 헤더 */
.settings-header {
    margin-bottom: var(--spacing-8);
}

.settings-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
}

.settings-description {
    color: var(--text-muted);
    font-size: var(--font-size-lg);
}

/* 설정 섹션 */
.settings-section {
    background-color: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-6);
    margin-bottom: var(--spacing-6);
    box-shadow: var(--shadow-sm);
}

.section-header {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-4);
}

.section-icon {
    font-size: var(--font-size-xl);
    margin-right: var(--spacing-3);
    color: var(--primary-color);
}

.section-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
}

/* 설정 항목 */
.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-4) 0;
    border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-label {
    font-size: var(--font-size-base);
    color: var(--text-primary);
}

.setting-description {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    margin-top: var(--spacing-1);
}

/* 토글 스위치 */
.toggle-switch {
    position: relative;
    width: 50px;
    height: 24px;
    background-color: var(--gray-300);
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 0.3s ease-in-out;
}

.toggle-switch.active {
    background-color: var(--primary-color);
}

.toggle-switch::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background-color: var(--white);
    border-radius: 50%;
    transition: transform 0.3s ease-in-out;
}

.toggle-switch.active::after {
    transform: translateX(26px);
}
```

## 📊 여행 리포트 페이지 스타일

### **여행 리포트 페이지 레이아웃**
```css
/* 리포트 컨테이너 */
.report-container {
    padding: var(--spacing-6);
    max-width: 1000px;
    margin: 0 auto;
}

/* 리포트 헤더 */
.report-header {
    text-align: center;
    margin-bottom: var(--spacing-8);
}

.report-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-4);
}

.report-subtitle {
    color: var(--text-muted);
    font-size: var(--font-size-lg);
}

/* 리포트 그리드 */
.report-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-6);
    margin-bottom: var(--spacing-8);
}

/* 리포트 카드 */
.report-card {
    background-color: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-6);
    box-shadow: var(--shadow-sm);
    text-align: center;
}

.report-card-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-4);
    color: var(--primary-color);
}

.report-card-value {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
}

.report-card-label {
    color: var(--text-muted);
    font-size: var(--font-size-base);
}

/* 차트 컨테이너 */
.chart-container {
    background-color: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-6);
    margin-bottom: var(--spacing-6);
    box-shadow: var(--shadow-sm);
}

.chart-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-4);
    text-align: center;
}

.chart-content {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
}
```

## ❌ 에러 페이지 스타일

### **에러 페이지 레이아웃**
```css
/* 에러 컨테이너 */
.error-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: var(--spacing-6);
    text-align: center;
    color: var(--white);
}

/* 에러 콘텐츠 */
.error-content {
    max-width: 500px;
}

.error-icon {
    font-size: 5rem;
    margin-bottom: var(--spacing-6);
    opacity: 0.8;
}

.error-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    margin-bottom: var(--spacing-4);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.error-description {
    font-size: var(--font-size-lg);
    opacity: 0.9;
    margin-bottom: var(--spacing-8);
    line-height: 1.6;
}

.error-actions {
    display: flex;
    gap: var(--spacing-4);
    justify-content: center;
    flex-wrap: wrap;
}

.error-button {
    padding: var(--spacing-4) var(--spacing-6);
    background-color: rgba(255, 255, 255, 0.2);
    color: var(--white);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: var(--radius-md);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease-in-out;
    backdrop-filter: blur(10px);
}

.error-button:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}
```

## 📱 반응형 디자인

### **모바일 최적화**
```css
@media (max-width: 767px) {
    /* 모든 페이지 공통 */
    .container {
        padding: var(--spacing-4);
    }
    
    /* 홈 페이지 */
    .home-content {
        grid-template-columns: 1fr;
        gap: var(--spacing-4);
    }
    
    /* 검색 페이지 */
    .filter-group {
        flex-direction: column;
        align-items: stretch;
    }
    
    /* 일지 추가 페이지 */
    .form-grid {
        grid-template-columns: 1fr;
    }
    
    /* 캘린더 페이지 */
    .calendar-day {
        min-height: 80px;
        padding: var(--spacing-2);
    }
    
    /* 내 일지 페이지 */
    .logs-list {
        grid-template-columns: 1fr;
    }
}
```

### **태블릿 최적화**
```css
@media (min-width: 768px) and (max-width: 1023px) {
    /* 검색 페이지 */
    .search-results {
        grid-template-columns: repeat(2, 1fr);
    }
    
    /* 내 일지 페이지 */
    .logs-list {
        grid-template-columns: repeat(2, 1fr);
    }
}
```

## 🎨 페이지별 테마 커스터마이징

### **페이지별 색상 테마**
```css
/* 홈 페이지 테마 */
.home-container {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 검색 페이지 테마 */
.search-container {
    --search-accent: #10b981;
}

/* 일지 추가 페이지 테마 */
.add-log-container {
    --form-accent: #f59e0b;
}

/* 캘린더 페이지 테마 */
.calendar-container {
    --calendar-accent: #3b82f6;
}
```

---

**다음 단계**: [스타일 시스템 개요](./overview.md) 또는 [컴포넌트 스타일](./components.md) 문서를 참조하세요.
