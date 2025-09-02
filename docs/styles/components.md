# 🧩 TravelLog 컴포넌트 스타일 가이드

## 📋 개요

TravelLog의 컴포넌트 스타일은 재사용 가능한 UI 요소들의 스타일을 정의합니다. 각 컴포넌트는 독립적이며, 일관된 디자인 시스템을 따릅니다.

## 🎨 컴포넌트 스타일 구조

### **파일 구조**
```
styles/components/
├── navigation.css       # 네비게이션 컴포넌트
├── buttons.css          # 버튼 컴포넌트
├── forms.css            # 폼 컴포넌트
├── modals.css           # 모달 컴포넌트
├── cards.css            # 카드 컴포넌트
└── country-selector.css # 국가 선택기 컴포넌트
```

## 🧭 네비게이션 컴포넌트

### **기본 네비게이션 스타일**
```css
/* 네비게이션 컨테이너 */
.navigation {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--navigation-height, 80px);
    background: var(--navigation-bg, var(--bg-primary));
    border-top: 1px solid var(--navigation-border, var(--gray-200));
    box-shadow: var(--navigation-shadow, 0 -2px 10px rgba(0, 0, 0, 0.08));
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: var(--navigation-padding, 8px 4px);
}

/* 네비게이션 탭 */
.nav-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    border-radius: var(--radius-lg);
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    text-decoration: none;
    color: var(--text-muted, var(--gray-500));
    min-width: 60px;
}

.nav-tab:hover {
    background: var(--navigation-tab-hover, var(--gray-50));
    color: var(--text-primary, var(--gray-900));
}

.nav-tab.active {
    background: var(--navigation-tab-active, var(--primary-light));
    color: var(--navigation-tab-border, var(--primary-color));
}

/* 네비게이션 아이콘 */
.nav-icon {
    width: var(--navigation-icon-size, 24px);
    height: var(--navigation-icon-size, 24px);
    margin-bottom: 4px;
    transition: transform 0.2s ease-in-out;
}

.nav-tab:hover .nav-icon {
    transform: scale(1.1);
}

/* 네비게이션 라벨 */
.nav-label {
    font-size: var(--navigation-label-size, 11px);
    font-weight: 500;
    text-align: center;
    line-height: 1.2;
}
```

### **반응형 네비게이션**
```css
/* 모바일 */
@media (max-width: 767px) {
    .navigation {
        height: 70px;
        padding: 6px 2px;
    }
    
    .nav-icon {
        width: 20px;
        height: 20px;
    }
    
    .nav-label {
        font-size: 10px;
    }
}

/* 태블릿 */
@media (min-width: 768px) and (max-width: 1023px) {
    .navigation {
        height: 80px;
        padding: 8px 4px;
    }
}

/* 데스크톱 */
@media (min-width: 1024px) {
    .navigation {
        height: 90px;
        padding: 10px 6px;
    }
    
    .nav-tab {
        min-width: 80px;
    }
}
```

## 🔘 버튼 컴포넌트

### **기본 버튼 스타일**
```css
/* 기본 버튼 */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-3) var(--spacing-6);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-weight: 500;
    line-height: 1.5;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    user-select: none;
    white-space: nowrap;
}

/* 버튼 크기 변형 */
.btn-sm {
    padding: var(--spacing-2) var(--spacing-4);
    font-size: var(--font-size-sm);
}

.btn-lg {
    padding: var(--spacing-4) var(--spacing-8);
    font-size: var(--font-size-lg);
}

/* 버튼 색상 변형 */
.btn-primary {
    background-color: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
}

.btn-primary:hover {
    background-color: var(--primary-dark);
    border-color: var(--primary-dark);
}

.btn-secondary {
    background-color: var(--gray-100);
    color: var(--gray-700);
    border-color: var(--gray-300);
}

.btn-secondary:hover {
    background-color: var(--gray-200);
    border-color: var(--gray-400);
}

.btn-outline {
    background-color: transparent;
    color: var(--primary-color);
    border-color: var(--primary-color);
}

.btn-outline:hover {
    background-color: var(--primary-color);
    color: var(--white);
}

/* 버튼 상태 */
.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}
```

### **특수 버튼 스타일**
```css
/* 플로팅 액션 버튼 */
.fab {
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: var(--white);
    border: none;
    box-shadow: var(--shadow-lg);
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    z-index: 999;
}

.fab:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-xl);
}

/* 아이콘 버튼 */
.btn-icon {
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 버튼 그룹 */
.btn-group {
    display: flex;
    gap: var(--spacing-2);
}

.btn-group .btn {
    border-radius: 0;
}

.btn-group .btn:first-child {
    border-top-left-radius: var(--radius-md);
    border-bottom-left-radius: var(--radius-md);
}

.btn-group .btn:last-child {
    border-top-right-radius: var(--radius-md);
    border-bottom-right-radius: var(--radius-md);
}
```

## 📝 폼 컴포넌트

### **기본 폼 요소 스타일**
```css
/* 폼 그룹 */
.form-group {
    margin-bottom: var(--spacing-4);
}

/* 라벨 */
.form-label {
    display: block;
    margin-bottom: var(--spacing-2);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--text-primary);
}

/* 입력 필드 */
.form-input {
    width: 100%;
    padding: var(--spacing-3) var(--spacing-4);
    border: 1px solid var(--border-color, var(--gray-300));
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    line-height: 1.5;
    background-color: var(--white);
    color: var(--text-primary);
    transition: border-color 0.2s ease-in-out;
}

.form-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
    background-color: var(--gray-100);
    color: var(--gray-500);
    cursor: not-allowed;
}

/* 텍스트 영역 */
.form-textarea {
    min-height: 100px;
    resize: vertical;
}

/* 셀렉트 박스 */
.form-select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 12px center;
    background-repeat: no-repeat;
    background-size: 16px;
    padding-right: 40px;
}

/* 체크박스와 라디오 버튼 */
.form-checkbox,
.form-radio {
    width: 16px;
    height: 16px;
    margin-right: var(--spacing-2);
    accent-color: var(--primary-color);
}

/* 폼 검증 상태 */
.form-input.is-valid {
    border-color: var(--success-color);
}

.form-input.is-invalid {
    border-color: var(--error-color);
}

/* 폼 도움말 텍스트 */
.form-help {
    margin-top: var(--spacing-1);
    font-size: var(--font-size-sm);
    color: var(--text-muted);
}

.form-error {
    margin-top: var(--spacing-1);
    font-size: var(--font-size-sm);
    color: var(--error-color);
}
```

## 🃏 카드 컴포넌트

### **기본 카드 스타일**
```css
/* 카드 컨테이너 */
.card {
    background-color: var(--white);
    border: 1px solid var(--border-color, var(--gray-200));
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: all 0.2s ease-in-out;
}

.card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

/* 카드 헤더 */
.card-header {
    padding: var(--spacing-4) var(--spacing-6);
    border-bottom: 1px solid var(--border-color, var(--gray-200));
    background-color: var(--gray-50);
}

.card-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
}

.card-subtitle {
    margin: var(--spacing-1) 0 0 0;
    font-size: var(--font-size-sm);
    color: var(--text-muted);
}

/* 카드 본문 */
.card-body {
    padding: var(--spacing-6);
}

/* 카드 푸터 */
.card-footer {
    padding: var(--spacing-4) var(--spacing-6);
    border-top: 1px solid var(--border-color, var(--gray-200));
    background-color: var(--gray-50);
}

/* 카드 이미지 */
.card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

/* 카드 액션 */
.card-actions {
    display: flex;
    gap: var(--spacing-2);
    justify-content: flex-end;
    margin-top: var(--spacing-4);
}
```

### **카드 변형 스타일**
```css
/* 컴팩트 카드 */
.card-compact .card-header,
.card-compact .card-body,
.card-compact .card-footer {
    padding: var(--spacing-3) var(--spacing-4);
}

/* 플러시 카드 */
.card-flush .card-header,
.card-flush .card-footer {
    border: none;
    background-color: transparent;
}

/* 보더리스 카드 */
.card-borderless {
    border: none;
    box-shadow: var(--shadow-md);
}

/* 인터랙티브 카드 */
.card-interactive {
    cursor: pointer;
}

.card-interactive:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
}

/* 카드 그리드 */
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-6);
}

@media (max-width: 767px) {
    .card-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-4);
    }
}
```

## 🪟 모달 컴포넌트

### **기본 모달 스타일**
```css
/* 모달 오버레이 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease-in-out;
}

.modal-overlay.active {
    opacity: 1;
    visibility: visible;
}

/* 모달 컨테이너 */
.modal {
    background-color: var(--white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow: hidden;
    transform: scale(0.9);
    transition: transform 0.3s ease-in-out;
}

.modal-overlay.active .modal {
    transform: scale(1);
}

/* 모달 헤더 */
.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-6);
    border-bottom: 1px solid var(--border-color, var(--gray-200));
}

.modal-title {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-primary);
}

.modal-close {
    background: none;
    border: none;
    font-size: var(--font-size-xl);
    color: var(--text-muted);
    cursor: pointer;
    padding: var(--spacing-2);
    border-radius: var(--radius-md);
    transition: all 0.2s ease-in-out;
}

.modal-close:hover {
    background-color: var(--gray-100);
    color: var(--text-primary);
}

/* 모달 본문 */
.modal-body {
    padding: var(--spacing-6);
    overflow-y: auto;
}

/* 모달 푸터 */
.modal-footer {
    display: flex;
    gap: var(--spacing-3);
    justify-content: flex-end;
    padding: var(--spacing-6);
    border-top: 1px solid var(--border-color, var(--gray-200));
    background-color: var(--gray-50);
}
```

### **모달 크기 변형**
```css
/* 작은 모달 */
.modal-sm {
    max-width: 300px;
}

/* 큰 모달 */
.modal-lg {
    max-width: 800px;
}

/* 전체 화면 모달 */
.modal-fullscreen {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    border-radius: 0;
}
```

## 🌍 국가 선택기 컴포넌트

### **기본 국가 선택기 스타일**
```css
/* 국가 선택기 컨테이너 */
.country-selector {
    position: relative;
    width: 100%;
}

/* 선택기 입력 필드 */
.country-selector-input {
    width: 100%;
    padding: var(--spacing-3) var(--spacing-4);
    border: 1px solid var(--border-color, var(--gray-300));
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    background-color: var(--white);
    cursor: pointer;
    transition: border-color 0.2s ease-in-out;
}

.country-selector-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 드롭다운 메뉴 */
.country-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--white);
    border: 1px solid var(--border-color, var(--gray-300));
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.2s ease-in-out;
}

.country-dropdown.active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

/* 국가 옵션 */
.country-option {
    display: flex;
    align-items: center;
    padding: var(--spacing-3) var(--spacing-4);
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
}

.country-option:hover {
    background-color: var(--gray-50);
}

.country-option.selected {
    background-color: var(--primary-light);
    color: var(--primary-color);
}

/* 국가 플래그 */
.country-flag {
    width: 20px;
    height: 15px;
    margin-right: var(--spacing-3);
    border-radius: 2px;
}

/* 국가 이름 */
.country-name {
    flex: 1;
    font-size: var(--font-size-base);
}

.country-code {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    margin-left: var(--spacing-2);
}
```

## 🎨 컴포넌트 사용 가이드

### **1. 네비게이션 사용**
```html
<nav class="navigation">
    <a href="#home" class="nav-tab active">
        <div class="nav-icon">🏠</div>
        <div class="nav-label">홈</div>
    </a>
    <a href="#search" class="nav-tab">
        <div class="nav-icon">🔍</div>
        <div class="nav-label">검색</div>
    </a>
</nav>
```

### **2. 버튼 사용**
```html
<button class="btn btn-primary">기본 버튼</button>
<button class="btn btn-secondary btn-sm">작은 버튼</button>
<button class="btn btn-outline btn-lg">큰 버튼</button>
```

### **3. 카드 사용**
```html
<div class="card">
    <div class="card-header">
        <h3 class="card-title">카드 제목</h3>
        <p class="card-subtitle">카드 부제목</p>
    </div>
    <div class="card-body">
        <p>카드 내용</p>
    </div>
    <div class="card-footer">
        <button class="btn btn-primary">액션</button>
    </div>
</div>
```

### **4. 모달 사용**
```html
<div class="modal-overlay">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title">모달 제목</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <p>모달 내용</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary">취소</button>
            <button class="btn btn-primary">확인</button>
        </div>
    </div>
</div>
```

## 🔧 커스터마이징

### **CSS 변수 오버라이드**
```css
:root {
    /* 네비게이션 커스터마이징 */
    --navigation-height: 90px;
    --navigation-bg: #1a202c;
    --navigation-border: #4a5568;
    
    /* 버튼 커스터마이징 */
    --primary-color: #10b981;
    --primary-light: #34d399;
    --primary-dark: #059669;
    
    /* 카드 커스터마이징 */
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);
}
```

### **테마별 스타일**
```css
/* 다크 테마 */
.dark-theme {
    --bg-primary: #1a202c;
    --text-primary: #f7fafc;
    --border-color: #4a5568;
}

/* 라이트 테마 */
.light-theme {
    --bg-primary: #ffffff;
    --text-primary: #1a202c;
    --border-color: #e2e8f0;
}
```

---

**다음 단계**: [페이지별 스타일](./pages.md) 또는 [스타일 시스템 개요](./overview.md) 문서를 참조하세요.
