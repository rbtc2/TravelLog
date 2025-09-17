# 🌙 TravelLog 다크모드 개발 규칙

## 📋 개요
TravelLog 프로젝트의 다크모드 기능 개발 및 관리에 대한 규칙과 가이드라인을 정의합니다.

## 🎯 핵심 원칙

### 1. **자동화 우선**
- 수동 작업 최소화
- 자동 스타일 감지 및 적용
- 실시간 검증 및 수정

### 2. **일관성 보장**
- 중앙화된 설정 관리
- 통일된 색상 팔레트
- 일관된 컴포넌트 스타일

### 3. **접근성 준수**
- WCAG AA 기준 대비율
- 애니메이션 감소 지원
- 고대비 모드 지원

### 4. **성능 최적화**
- GPU 가속 활용
- 메모리 효율적 관리
- 부드러운 전환 애니메이션

## 🏗️ 아키텍처 규칙

### **1. 테마 관리 시스템**
```javascript
// 필수: ThemeManager 사용
import { themeManager } from './js/modules/utils/theme-manager.js';

// 테마 설정
themeManager.setTheme('dark', true, true); // 테마, 저장, 애니메이션

// 테마 토글
themeManager.toggleTheme();

// 현재 테마 확인
const currentTheme = themeManager.getCurrentTheme();
```

### **2. 다크모드 매니저 사용**
```javascript
// 필수: DarkModeManager 사용
import { darkModeManager } from './js/modules/utils/dark-mode-manager.js';

// 자동 수정 활성화
darkModeManager.setAutoFixEnabled(true);

// 다크모드 상태 확인
const isDark = darkModeManager.isDarkModeActive();
```

### **3. 중앙화된 설정**
```javascript
// 필수: config/dark-mode-config.js 사용
import { darkModeConfig } from './config/dark-mode-config.js';

// 색상 사용
const primaryColor = darkModeConfig.colors.brand.primary;
const backgroundColor = darkModeConfig.colors.background.primary;
```

## 🎨 CSS 개발 규칙

### **1. CSS 변수 사용 (필수)**
```css
/* ✅ 올바른 방법 */
.component {
    background-color: var(--bg-primary, #ffffff);
    color: var(--text-primary, #000000);
    border: 1px solid var(--border-color, #e2e8f0);
}

/* ❌ 잘못된 방법 */
.component {
    background-color: #ffffff;
    color: #000000;
}
```

### **2. 다크모드 클래스 구조**
```css
/* 기본 스타일 */
.component {
    background-color: var(--white);
    color: var(--text-primary);
}

/* 다크모드 스타일 */
.dark .component {
    background-color: var(--bg-secondary, #2d2d2d);
    color: var(--text-primary, #f7fafc);
}
```

### **3. 폴백 값 제공 (필수)**
```css
/* ✅ 폴백 값 포함 */
.dark .component {
    background-color: var(--bg-secondary, #2d2d2d);
    color: var(--text-primary, #f7fafc);
}

/* ❌ 폴백 값 없음 */
.dark .component {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
}
```

### **4. 애니메이션 규칙**
```css
/* 테마 전환 애니메이션 */
.component {
    transition: background-color 0.3s ease, color 0.3s ease;
}

/* 애니메이션 감소 지원 */
@media (prefers-reduced-motion: reduce) {
    .component {
        transition: none;
    }
}
```

## 🔧 개발 도구 사용 규칙

### **1. 자동 생성 도구 사용**
```bash
# CSS 파일에 다크모드 스타일 생성
node tools/dark-mode-generator.js styles/

# 특정 파일만 처리
node tools/dark-mode-generator.js styles/main.css
```

### **2. 관리 스크립트 사용**
```bash
# 다크모드 스타일 생성
node scripts/dark-mode-manager.js generate

# 다크모드 검증
node scripts/dark-mode-manager.js validate

# 이슈 자동 수정
node scripts/dark-mode-manager.js fix

# 상태 확인
node scripts/dark-mode-manager.js status
```

### **3. 테스트 도구 사용**
```bash
# 테스트 서버 시작
python -m http.server 8000

# 브라우저에서 테스트
http://localhost:8000/tests/test-dark-mode-comprehensive.html
```

## 📝 컴포넌트 개발 규칙

### **1. 컴포넌트 등록**
```javascript
// 새로운 컴포넌트의 다크모드 스타일 등록
darkModeManager.registerDarkModeStyles('my-component', {
    'background-color': '#ffffff',
    'color': '#000000',
    'border-color': '#e2e8f0'
}, {
    'background-color': '#2d2d2d',
    'color': '#f7fafc',
    'border-color': '#4a5568'
});
```

### **2. 이벤트 리스너 관리**
```javascript
// 테마 변경 이벤트 리스너 등록
themeManager.addThemeChangeListener((event) => {
    if (event.theme === 'dark') {
        // 다크모드 처리
        this.applyDarkModeStyles();
    } else {
        // 라이트모드 처리
        this.applyLightModeStyles();
    }
});
```

### **3. 리소스 정리**
```javascript
// 컴포넌트 정리 시 다크모드 스타일 제거
cleanup() {
    darkModeManager.unregisterDarkModeStyles('my-component');
    // 기타 정리 작업
}
```

## 🎨 색상 사용 규칙

### **1. 색상 팔레트 준수**
```css
/* 배경 색상 */
--bg-primary: #1a1a1a;      /* 메인 배경 */
--bg-secondary: #2d2d2d;    /* 카드/컨테이너 배경 */
--bg-tertiary: #3a3a3a;     /* 호버/액티브 배경 */

/* 텍스트 색상 */
--text-primary: #f7fafc;    /* 주요 텍스트 */
--text-secondary: #a0aec0;  /* 보조 텍스트 */
--text-muted: #718096;      /* 비활성 텍스트 */

/* 테두리 색상 */
--border-primary: #4a5568;  /* 주요 테두리 */
--border-secondary: #718096; /* 보조 테두리 */
```

### **2. 상태 색상 사용**
```css
/* 성공 */
--success-color: #48bb78;
--success-dark: #38a169;

/* 오류 */
--error-color: #f56565;
--error-dark: #c53030;

/* 경고 */
--warning-color: #ed8936;
--warning-dark: #f59e0b;
```

## ♿ 접근성 규칙

### **1. 대비율 준수**
```css
/* 최소 4.5:1 대비율 보장 */
.dark .text-primary {
    color: #f7fafc; /* 배경 #1a1a1a 대비 4.5:1 */
}

.dark .text-secondary {
    color: #a0aec0; /* 배경 #1a1a1a 대비 3:1 */
}
```

### **2. 애니메이션 감소 지원**
```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

### **3. 고대비 모드 지원**
```css
@media (prefers-contrast: high) {
    .dark {
        --text-primary: #ffffff;
        --bg-primary: #000000;
        --border-primary: #ffffff;
    }
}
```

## 🚀 성능 규칙

### **1. GPU 가속 사용**
```css
/* 테마 전환 시 GPU 가속 */
.theme-transitioning {
    will-change: background-color, color;
    transform: translateZ(0);
}
```

### **2. 효율적인 선택자 사용**
```css
/* ✅ 좋은 선택자 */
.dark .component { }

/* ❌ 비효율적인 선택자 */
.dark div.component .nested-element { }
```

### **3. 메모리 관리**
```javascript
// 이벤트 리스너 정리
cleanup() {
    themeManager.removeThemeChangeListener(this.themeChangeHandler);
    darkModeManager.cleanup();
}
```

## 🧪 테스트 규칙

### **1. 자동 테스트 실행**
```bash
# 전체 다크모드 테스트
node scripts/dark-mode-manager.js test

# 수동 테스트
http://localhost:8000/tests/test-dark-mode-comprehensive.html
```

### **2. 검증 체크리스트**
- [ ] 모든 컴포넌트에 다크모드 스타일 적용
- [ ] CSS 변수 사용 및 폴백 값 제공
- [ ] 접근성 기준 대비율 준수
- [ ] 애니메이션 감소 지원
- [ ] 고대비 모드 지원
- [ ] 테마 전환 애니메이션 동작
- [ ] 자동 수정 기능 동작

## 📊 모니터링 규칙

### **1. 성능 모니터링**
```javascript
// 다크모드 전환 성능 측정
const startTime = performance.now();
themeManager.setTheme('dark');
const endTime = performance.now();
console.log(`Theme switch took ${endTime - startTime}ms`);
```

### **2. 검증 리포트 생성**
```javascript
// 다크모드 검증 리포트
const report = darkModeManager.generateValidationReport();
console.log('Dark mode issues:', report.issues);
```

## 🚫 금지 사항

### **1. 하드코딩 금지**
```css
/* ❌ 금지: 하드코딩된 색상 */
.dark .component {
    background-color: #2d2d2d;
    color: #ffffff;
}

/* ✅ 권장: CSS 변수 사용 */
.dark .component {
    background-color: var(--bg-secondary, #2d2d2d);
    color: var(--text-primary, #ffffff);
}
```

### **2. 수동 관리 금지**
```javascript
// ❌ 금지: 수동으로 클래스 추가/제거
document.body.classList.add('dark');

// ✅ 권장: ThemeManager 사용
themeManager.setTheme('dark');
```

### **3. 일관성 없는 네이밍 금지**
```css
/* ❌ 금지: 일관성 없는 클래스명 */
.dark-mode .component { }
.darkTheme .component { }
.dark .component { }

/* ✅ 권장: 통일된 클래스명 */
.dark .component { }
```

## 🔮 향후 개선 사항

### **1. 자동화 강화**
- 더 많은 자동 수정 기능
- 실시간 스타일 검증
- 자동 테스트 생성

### **2. 성능 최적화**
- 가상 스크롤링 지원
- 더 효율적인 메모리 관리
- 번들 크기 최적화

### **3. 개발자 경험 개선**
- 더 나은 에러 메시지
- 실시간 디버깅 도구
- 자동 문서 생성

---

**마지막 업데이트**: 2024-12-29  
**버전**: 1.0.0  
**적용 범위**: TravelLog 전체 프로젝트
