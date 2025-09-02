# 🎨 TravelLog 스타일 시스템 개요

## 📋 개요

TravelLog의 스타일 시스템은 모듈화된 CSS 아키텍처를 기반으로 설계되었습니다. 각 스타일 파일은 명확한 역할과 책임을 가지며, 유지보수성과 확장성을 고려하여 구성되었습니다.

## 🏗️ 스타일 시스템 구조

### **핵심 설계 원칙**
- **모듈화**: 기능별로 분리된 CSS 파일
- **계층화**: base → components → layouts → pages → utilities 순서
- **일관성**: CSS 변수를 통한 통일된 디자인 토큰
- **반응형**: 모바일 우선 반응형 디자인
- **접근성**: WCAG 가이드라인 준수

### **파일 구조**
```
styles/
├── main.css                  # 메인 스타일 (모든 스타일 import)
├── base/                     # 기본 스타일
│   ├── variables.css         # CSS 변수 (디자인 토큰)
│   ├── reset.css            # CSS 리셋
│   ├── typography.css       # 타이포그래피
│   ├── layout.css           # 기본 레이아웃
│   ├── buttons.css          # 기본 버튼
│   ├── forms.css            # 기본 폼
│   └── messages.css         # 메시지 스타일
├── components/               # 컴포넌트 스타일
│   ├── navigation.css       # 네비게이션
│   ├── buttons.css          # 버튼 컴포넌트
│   ├── forms.css            # 폼 컴포넌트
│   ├── modals.css           # 모달 컴포넌트
│   ├── cards.css            # 카드 컴포넌트
│   └── country-selector.css # 국가 선택기
├── layouts/                  # 레이아웃 스타일
│   ├── main-layout.css      # 메인 레이아웃
│   ├── tab-navigation.css   # 탭 네비게이션
│   └── tab-content.css      # 탭 콘텐츠
├── pages/                    # 페이지별 스타일
│   ├── home.css             # 홈 페이지
│   ├── search.css           # 검색 페이지
│   ├── add-log.css          # 일지 추가 페이지
│   ├── calendar.css         # 캘린더 페이지
│   ├── my-logs.css          # 내 일지 페이지
│   ├── log-detail.css       # 일정 상세 페이지
│   └── ...                  # 기타 페이지
└── utilities/                # 유틸리티 스타일
    ├── animations.css        # 애니메이션
    ├── accessibility.css     # 접근성
    ├── dark-mode.css         # 다크 모드
    ├── responsive.css        # 반응형
    ├── navigation-utils.css  # 네비게이션 유틸리티
    └── scroll-optimization.css # 스크롤 최적화
```

## 🎨 디자인 토큰 시스템

### **CSS 변수 (`styles/base/variables.css`)**
```css
:root {
    /* 색상 팔레트 */
    --primary-color: #667eea;
    --primary-light: #a5b4fc;
    --primary-dark: #4c51bf;
    
    /* 중성 색상 */
    --white: #ffffff;
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-400: #9ca3af;
    --gray-500: #6b7280;
    --gray-600: #4b5563;
    --gray-700: #374151;
    --gray-800: #1f2937;
    --gray-900: #111827;
    
    /* 상태 색상 */
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --error-color: #ef4444;
    --info-color: #3b82f6;
    
    /* 타이포그래피 */
    --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    
    /* 간격 */
    --spacing-1: 0.25rem;
    --spacing-2: 0.5rem;
    --spacing-3: 0.75rem;
    --spacing-4: 1rem;
    --spacing-5: 1.25rem;
    --spacing-6: 1.5rem;
    --spacing-8: 2rem;
    --spacing-10: 2.5rem;
    --spacing-12: 3rem;
    
    /* 그림자 */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    
    /* 테두리 반경 */
    --radius-sm: 0.125rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-2xl: 1rem;
    --radius-full: 9999px;
}
```

## 📱 반응형 디자인

### **브레이크포인트**
```css
/* 모바일 우선 접근법 */
/* 기본: 모바일 (320px+) */

/* 태블릿 */
@media (min-width: 768px) {
    /* 태블릿 스타일 */
}

/* 데스크톱 */
@media (min-width: 1024px) {
    /* 데스크톱 스타일 */
}

/* 대형 데스크톱 */
@media (min-width: 1280px) {
    /* 대형 데스크톱 스타일 */
}
```

### **반응형 유틸리티 클래스**
```css
/* 표시/숨김 */
.hidden { display: none; }
.block { display: block; }
.inline { display: inline; }
.inline-block { display: inline-block; }
.flex { display: flex; }
.grid { display: grid; }

/* 반응형 표시 */
@media (min-width: 768px) {
    .md\:block { display: block; }
    .md\:hidden { display: none; }
    .md\:flex { display: flex; }
}

@media (min-width: 1024px) {
    .lg\:block { display: block; }
    .lg\:hidden { display: none; }
    .lg\:flex { display: flex; }
}
```

## 🎭 애니메이션 시스템

### **기본 애니메이션 (`styles/utilities/animations.css`)**
```css
/* 페이드 인/아웃 */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

/* 슬라이드 애니메이션 */
@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 바운스 애니메이션 */
@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-10px);
    }
    60% {
        transform: translateY(-5px);
    }
}

/* 스피너 애니메이션 */
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

### **애니메이션 유틸리티 클래스**
```css
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
.animate-slide-up { animation: slideInUp 0.4s ease-out; }
.animate-bounce { animation: bounce 2s infinite; }
.animate-spin { animation: spin 1s linear infinite; }

/* 지연 애니메이션 */
.animate-delay-100 { animation-delay: 0.1s; }
.animate-delay-200 { animation-delay: 0.2s; }
.animate-delay-300 { animation-delay: 0.3s; }
```

## 🌙 다크 모드 지원

### **다크 모드 변수 (`styles/utilities/dark-mode.css`)**
```css
@media (prefers-color-scheme: dark) {
    :root {
        --bg-primary: #1a202c;
        --bg-secondary: #2d3748;
        --text-primary: #f7fafc;
        --text-secondary: #e2e8f0;
        --border-color: #4a5568;
    }
}

/* 다크 모드 클래스 */
.dark {
    --bg-primary: #1a202c;
    --bg-secondary: #2d3748;
    --text-primary: #f7fafc;
    --text-secondary: #e2e8f0;
    --border-color: #4a5568;
}
```

## ♿ 접근성 고려사항

### **접근성 유틸리티 (`styles/utilities/accessibility.css`)**
```css
/* 스크린 리더 전용 텍스트 */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* 포커스 표시 */
.focus\:ring:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
    :root {
        --primary-color: #0000ff;
        --text-primary: #000000;
        --bg-primary: #ffffff;
    }
}

/* 애니메이션 감소 설정 */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

## 🔧 스타일 사용 가이드

### **1. CSS 변수 사용**
```css
/* 좋은 예 */
.button {
    background-color: var(--primary-color);
    color: var(--white);
    padding: var(--spacing-3) var(--spacing-6);
    border-radius: var(--radius-md);
}

/* 나쁜 예 */
.button {
    background-color: #667eea;
    color: #ffffff;
    padding: 12px 24px;
    border-radius: 6px;
}
```

### **2. 반응형 디자인**
```css
/* 모바일 우선 접근법 */
.card {
    padding: var(--spacing-4);
    margin-bottom: var(--spacing-4);
}

@media (min-width: 768px) {
    .card {
        padding: var(--spacing-6);
        margin-bottom: var(--spacing-6);
    }
}

@media (min-width: 1024px) {
    .card {
        padding: var(--spacing-8);
        margin-bottom: var(--spacing-8);
    }
}
```

### **3. 컴포넌트 스타일링**
```css
/* 컴포넌트별 스타일 분리 */
.navigation {
    /* 네비게이션 전용 스타일 */
}

.button {
    /* 버튼 전용 스타일 */
}

.modal {
    /* 모달 전용 스타일 */
}
```

## 📊 성능 최적화

### **CSS 최적화 전략**
1. **CSS 변수 활용**: 일관된 디자인 토큰 사용
2. **모듈화**: 필요한 스타일만 로드
3. **중복 제거**: 공통 스타일을 유틸리티로 분리
4. **압축**: 프로덕션 환경에서 CSS 압축
5. **캐싱**: 정적 자원 캐싱 전략

### **파일 크기 최적화**
- **Base 스타일**: ~15KB (기본 스타일)
- **Components**: ~25KB (컴포넌트 스타일)
- **Pages**: ~30KB (페이지별 스타일)
- **Utilities**: ~10KB (유틸리티 스타일)
- **총 크기**: ~80KB (압축 후 ~20KB)

## 🚀 향후 개선 계획

### **Phase 1: 디자인 시스템 고도화**
- [ ] 디자인 토큰 확장
- [ ] 컴포넌트 라이브러리 구축
- [ ] 스타일 가이드 자동화

### **Phase 2: 성능 최적화**
- [ ] CSS 번들링 최적화
- [ ] Critical CSS 분리
- [ ] 지연 로딩 구현

### **Phase 3: 개발자 경험 개선**
- [ ] CSS-in-JS 도입 검토
- [ ] 스타일 린팅 도구 도입
- [ ] 자동화된 테스트 구축

---

**다음 단계**: [컴포넌트 스타일](./components.md) 또는 [페이지별 스타일](./pages.md) 문서를 참조하여 구체적인 스타일 구현을 확인하세요.
