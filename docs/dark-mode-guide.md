# 🌙 TravelLog 다크모드 관리 가이드

## 📋 개요

TravelLog 프로젝트의 다크모드 기능을 효율적으로 관리하고 개발하는 방법을 안내합니다.

## 🏗️ 아키텍처

### 핵심 컴포넌트

1. **ThemeManager** (`js/modules/utils/theme-manager.js`)
   - 테마 상태 관리
   - 시스템 다크모드 감지
   - 테마 변경 이벤트 발생

2. **DarkModeManager** (`js/modules/utils/dark-mode-manager.js`)
   - 실시간 다크모드 스타일 관리
   - 자동 스타일 감지 및 수정
   - 접근성 검증

3. **DarkModeConfig** (`config/dark-mode-config.js`)
   - 중앙화된 다크모드 설정
   - 색상 팔레트 관리
   - 컴포넌트별 스타일 정의

## 🚀 빠른 시작

### 1. 기본 사용법

```javascript
// 테마 매니저 사용
import { themeManager } from './js/modules/utils/theme-manager.js';

// 다크모드 활성화
themeManager.setTheme('dark');

// 라이트모드 활성화
themeManager.setTheme('light');

// 테마 토글
themeManager.toggleTheme();

// 현재 테마 확인
const currentTheme = themeManager.getCurrentTheme();
```

### 2. 다크모드 매니저 사용

```javascript
// 다크모드 매니저 사용
import { darkModeManager } from './js/modules/utils/dark-mode-manager.js';

// 자동 수정 활성화
darkModeManager.setAutoFixEnabled(true);

// 다크모드 상태 확인
const isDark = darkModeManager.isDarkModeActive();

// 검증 리포트 생성
const report = darkModeManager.generateValidationReport();
```

## 🎨 스타일 관리

### 1. CSS 변수 사용

```css
/* 라이트 모드 */
.component {
    background-color: var(--white);
    color: var(--text-primary);
    border: 1px solid var(--gray-200);
}

/* 다크 모드 */
.dark .component {
    background-color: var(--bg-secondary, #2d2d2d);
    color: var(--text-primary, #f7fafc);
    border-color: var(--gray-400, #718096);
}
```

### 2. 컴포넌트별 스타일 등록

```javascript
// 수동으로 다크모드 스타일 등록
darkModeManager.registerDarkModeStyles('my-component', {
    'background-color': '#ffffff',
    'color': '#000000'
}, {
    'background-color': '#2d2d2d',
    'color': '#f7fafc'
});
```

## 🛠️ 개발 도구

### 1. 자동 생성 도구

```bash
# 모든 CSS 파일에 다크모드 스타일 생성
node tools/dark-mode-generator.js styles/

# 특정 CSS 파일만 처리
node tools/dark-mode-generator.js styles/main.css
```

### 2. 관리 스크립트

```bash
# 다크모드 스타일 생성
node scripts/dark-mode-manager.js generate

# 다크모드 스타일 검증
node scripts/dark-mode-manager.js validate

# 다크모드 이슈 자동 수정
node scripts/dark-mode-manager.js fix

# 다크모드 상태 확인
node scripts/dark-mode-manager.js status

# 다크모드 파일 정리
node scripts/dark-mode-manager.js clean
```

### 3. 테스트 도구

```bash
# 테스트 서버 시작
python -m http.server 8000

# 브라우저에서 테스트
http://localhost:8000/tests/test-dark-mode-comprehensive.html
```

## 📝 모범 사례

### 1. CSS 작성 규칙

```css
/* ✅ 좋은 예 */
.component {
    background-color: var(--white);
    color: var(--text-primary);
    border: 1px solid var(--gray-200);
}

.dark .component {
    background-color: var(--bg-secondary, #2d2d2d);
    color: var(--text-primary, #f7fafc);
    border-color: var(--gray-400, #718096);
}

/* ❌ 나쁜 예 */
.component {
    background-color: #ffffff;
    color: #000000;
}

.dark .component {
    background-color: #2d2d2d;
    color: #ffffff;
}
```

### 2. JavaScript 사용 규칙

```javascript
// ✅ 좋은 예
themeManager.setTheme('dark', true, true); // 저장, 애니메이션

// ❌ 나쁜 예
document.body.classList.add('dark');
```

### 3. 접근성 고려사항

```css
/* 애니메이션 감소 설정 */
@media (prefers-reduced-motion: reduce) {
    * {
        transition: none !important;
        animation: none !important;
    }
}

/* 고대비 모드 */
@media (prefers-contrast: high) {
    .dark {
        --text-primary: #ffffff;
        --bg-primary: #000000;
    }
}
```

## 🔧 문제 해결

### 1. 일반적인 문제

**문제**: 다크모드에서 텍스트가 보이지 않음
```css
/* 해결책 */
.dark .component {
    color: var(--text-primary, #f7fafc) !important;
}
```

**문제**: 다크모드 전환이 부드럽지 않음
```css
/* 해결책 */
.component {
    transition: background-color 0.3s ease, color 0.3s ease;
}
```

**문제**: 다크모드 스타일이 적용되지 않음
```javascript
// 해결책: CSS 특이성 확인
.dark .component { /* 더 구체적인 선택자 사용 */ }
```

### 2. 디버깅 도구

```javascript
// 다크모드 상태 확인
console.log('현재 테마:', themeManager.getCurrentTheme());
console.log('다크모드 활성화:', darkModeManager.isDarkModeActive());

// 등록된 스타일 확인
console.log('등록된 스타일:', darkModeManager.getRegisteredStyles());

// 검증 리포트 생성
const report = darkModeManager.generateValidationReport();
console.log('검증 리포트:', report);
```

## 📊 성능 최적화

### 1. CSS 최적화

```css
/* GPU 가속 사용 */
.component {
    transform: translateZ(0);
    will-change: background-color, color;
}

/* 효율적인 선택자 사용 */
.dark .component { /* 클래스 기반 */ }
/* .dark div.component { /* 태그 기반은 피하기 */ }
```

### 2. JavaScript 최적화

```javascript
// 이벤트 리스너 정리
const cleanup = themeManager.addThemeChangeListener(callback);
cleanup(); // 사용 후 정리

// 자동 수정 비활성화 (필요시)
darkModeManager.setAutoFixEnabled(false);
```

## 🧪 테스트

### 1. 자동 테스트

```javascript
// 테마 전환 테스트
test('테마 전환 테스트', () => {
    themeManager.setTheme('dark');
    expect(themeManager.getCurrentTheme()).toBe('dark');
    
    themeManager.setTheme('light');
    expect(themeManager.getCurrentTheme()).toBe('light');
});
```

### 2. 수동 테스트

1. 브라우저에서 `http://localhost:8000/tests/test-dark-mode-comprehensive.html` 접속
2. "전체 테스트 실행" 버튼 클릭
3. 결과 확인 및 이슈 수정

## 📚 참고 자료

- [WCAG 2.1 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS 변수 사용법](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [다크모드 디자인 가이드](https://material.io/design/color/dark-theme.html)

## 🤝 기여하기

1. 새로운 다크모드 스타일 추가 시 `config/dark-mode-config.js` 업데이트
2. CSS 변수 사용 시 폴백 값 제공
3. 접근성 가이드라인 준수
4. 테스트 코드 작성 및 실행

## 📞 지원

문제가 발생하거나 개선 사항이 있으면 이슈를 등록해 주세요.

---

**마지막 업데이트**: 2024-12-29
**버전**: 1.0.0
