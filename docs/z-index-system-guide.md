# 🔧 TravelLog Z-Index 시스템 가이드

## 📋 개요

TravelLog의 Z-Index 시스템은 Country Selector와 다른 UI 요소들 간의 z-index 충돌을 근본적으로 해결하기 위해 설계된 전문가 수준의 관리 시스템입니다.

## 🎯 주요 특징

- **중앙 집중식 관리**: CSS 변수를 통한 통합 z-index 관리
- **자동 충돌 감지**: 실시간 충돌 감지 및 해결
- **성능 최적화**: 불필요한 리페인트/리플로우 최소화
- **확장성**: 향후 새로운 컴포넌트 추가 시에도 적용 가능
- **개발자 도구**: 디버깅 및 모니터링 지원

## 🏗️ 아키텍처 구조

### Z-Index 계층 구조

```
Base Layer (0-99): 일반 페이지 요소
├── --z-base: 0
├── --z-content: 10
├── --z-elevated: 20
└── --z-floating: 30

Content Layer (100-199): 카드, 패널, 위젯
├── --z-card: 100
├── --z-panel: 110
├── --z-widget: 120
└── --z-overlay-content: 130

Navigation Layer (200-299): 네비게이션, 헤더, 푸터
├── --z-navigation: 200
├── --z-header: 210
├── --z-sidebar: 220
├── --z-footer: 230
└── --z-breadcrumb: 240

Overlay Layer (300-399): 모달, 팝업, 드롭다운
├── --z-dropdown: 300
├── --z-popover: 310
├── --z-tooltip: 320
├── --z-modal-backdrop: 330
├── --z-modal: 340
└── --z-drawer: 350

Critical UI Layer (400-499): Country Selector, 중요 드롭다운
├── --z-country-selector: 400
├── --z-country-dropdown: 410
├── --z-critical-dropdown: 420
└── --z-form-overlay: 430

System Layer (500+): 에러 메시지, 로딩, 시스템 알림
├── --z-loading: 500
├── --z-error: 510
├── --z-notification: 520
└── --z-system-overlay: 530
```

## 📁 파일 구조

```
styles/
├── base/
│   └── variables.css              # Z-Index 변수 정의
├── components/
│   ├── country-selector.css       # 기존 Country Selector (업데이트됨)
│   └── country-selector-v2.css   # 새로운 Country Selector V2
├── utilities/
│   └── z-index-conflict-resolution.css  # 충돌 해결 유틸리티
└── main.css                       # 메인 CSS 파일 (import 추가)

js/modules/utils/
└── z-index-manager.js             # Z-Index 관리 시스템

tests/
└── test-z-index-system.html       # 종합 테스트 페이지
```

## 🚀 사용 방법

### 1. 기본 사용법

#### CSS에서 Z-Index 변수 사용

```css
/* ✅ 올바른 사용법 */
.my-component {
    z-index: var(--z-country-selector);
}

.my-dropdown {
    z-index: var(--z-country-dropdown);
}

/* ❌ 잘못된 사용법 */
.my-component {
    z-index: 100000; /* 하드코딩된 값 */
}
```

#### JavaScript에서 Z-Index Manager 사용

```javascript
// Z-Index Manager 초기화 (자동으로 수행됨)
import ZIndexManager from './modules/utils/z-index-manager.js';

// 디버그 모드 활성화
zIndexManager.setDebugMode(true);

// 충돌 감지 활성화/비활성화
zIndexManager.setConflictDetection(true);

// 현재 상태 확인
const watchedElements = zIndexManager.getWatchedElements();
const activeElements = zIndexManager.getActiveElements();
const conflictHistory = zIndexManager.getConflictHistory();
```

### 2. Country Selector 사용법

#### 기존 Country Selector (업데이트됨)

```html
<div class="country-selector" id="country-selector">
    <div class="selector-input">
        <input type="text" placeholder="국가를 검색하세요...">
        <button class="dropdown-arrow">
            <span class="arrow-icon">▼</span>
        </button>
    </div>
    <div class="selector-dropdown">
        <!-- 드롭다운 내용 -->
    </div>
</div>
```

#### 새로운 Country Selector V2

```html
<div class="country-selector-v2" id="country-selector-v2">
    <div class="selector-input-container">
        <input type="text" class="selector-input" placeholder="국가를 검색하세요...">
        <button class="dropdown-arrow">
            <span class="arrow-icon">▼</span>
        </button>
    </div>
    <div class="selector-dropdown">
        <!-- 드롭다운 내용 -->
    </div>
</div>
```

### 3. 충돌 해결 유틸리티 사용

#### 자동 충돌 해결

```css
/* 모달이 열려있을 때 Country Selector 우선순위 조정 */
body:has(.modal.open) .country-selector-v2 {
    z-index: calc(var(--z-modal) + 10);
}

/* 다른 드롭다운이 열려있을 때 Country Selector 우선순위 조정 */
body:has(.dropdown.open:not(.country-selector-v2)) .country-selector-v2 {
    z-index: calc(var(--z-dropdown) + 20);
}
```

#### 수동 충돌 해결

```css
/* 동적 우선순위 클래스 */
.country-selector-v2.dynamic-priority {
    z-index: var(--dynamic-z-dropdown);
}

/* 모달과의 충돌 해결 */
.country-selector-v2.modal-conflict {
    z-index: calc(var(--z-modal) + 50);
}

/* 다른 드롭다운과의 충돌 해결 */
.country-selector-v2.dropdown-conflict {
    z-index: calc(var(--z-dropdown) + 100);
}
```

## 🧪 테스트 및 검증

### 테스트 페이지 사용법

1. **테스트 페이지 열기**: `tests/test-z-index-system.html`
2. **개별 테스트 실행**: 각 테스트 섹션의 버튼 클릭
3. **전체 테스트 실행**: 브라우저 콘솔에서 `runAllTests()` 실행

### 테스트 시나리오

1. **기본 Country Selector 기능**: 드롭다운 열림/닫힘 테스트
2. **모달과의 충돌 해결**: 모달 내부에서 Country Selector 사용
3. **다중 드롭다운 충돌 해결**: 여러 드롭다운 동시 사용
4. **툴팁과의 충돌 해결**: 툴팁과 Country Selector 동시 표시
5. **모바일 환경 폴백**: 모바일에서 fullscreen 모달 전환
6. **디버그 모드**: 시각적 충돌 확인
7. **성능 테스트**: 성능 및 메모리 사용량 측정

### 테스트 결과 해석

- ✅ **성공**: 모든 테스트 통과
- ⚠️ **경고**: 일부 테스트 실패 (기능은 정상 작동할 수 있음)
- ❌ **실패**: 심각한 문제 발생

## 🔧 개발자 도구

### 디버그 모드 활성화

```javascript
// 디버그 모드 활성화
zIndexManager.setDebugMode(true);

// 시각적 표시 활성화
document.body.classList.add('debug-z-index');
```

### Z-Index 정보 확인

```javascript
// 현재 CSS 변수 값 확인
const root = document.documentElement;
const zIndexValue = getComputedStyle(root).getPropertyValue('--z-country-selector');
console.log('Country Selector z-index:', zIndexValue);

// 감시 중인 요소 확인
const watchedElements = zIndexManager.getWatchedElements();
console.log('감시 중인 요소:', watchedElements);

// 충돌 히스토리 확인
const conflictHistory = zIndexManager.getConflictHistory();
console.log('충돌 해결 기록:', conflictHistory);
```

### 브라우저 개발자 도구 활용

1. **Elements 탭**: z-index 값 확인
2. **Console 탭**: Z-Index Manager 로그 확인
3. **Performance 탭**: 성능 측정
4. **Memory 탭**: 메모리 사용량 확인

## 📊 성능 최적화

### CSS 최적화

```css
/* GPU 가속 활성화 */
.country-selector-v2 .selector-dropdown,
.country-selector-v2 .country-item {
    will-change: transform, opacity;
}

/* 리페인트 최소화 */
.country-selector-v2 .selector-input-container {
    contain: layout style paint;
}
```

### JavaScript 최적화

```javascript
// 디바운스된 충돌 감지
const debouncedConflictDetection = zIndexManager.debounce(
    zIndexManager.detectConflicts.bind(zIndexManager), 
    100
);

// 스로틀된 스크롤 이벤트
const throttledScrollHandler = zIndexManager.throttle(
    zIndexManager.handleScroll.bind(zIndexManager), 
    16
);
```

## 🚫 주의사항 및 제한사항

### 사용하지 말아야 할 패턴

```css
/* ❌ 하드코딩된 z-index 값 */
.my-component {
    z-index: 9999;
}

/* ❌ !important 남용 */
.my-component {
    z-index: 1000 !important;
}

/* ❌ 일관성 없는 z-index 값 */
.component-a { z-index: 100; }
.component-b { z-index: 10000; }
.component-c { z-index: 50; }
```

### 브라우저 호환성

- **Chrome**: 완전 지원
- **Firefox**: 완전 지원
- **Safari**: 완전 지원
- **Edge**: 완전 지원
- **모바일 브라우저**: 완전 지원

### 성능 고려사항

- **MutationObserver**: DOM 변경 감지로 인한 약간의 성능 오버헤드
- **실시간 충돌 감지**: 복잡한 레이아웃에서 성능 영향 가능
- **메모리 사용량**: 충돌 히스토리 저장으로 인한 메모리 사용

## 🔮 향후 개선 계획

### Phase 1: 성능 최적화
- [ ] 가상화된 충돌 감지
- [ ] Web Workers를 활용한 백그라운드 처리
- [ ] 더 효율적인 DOM 관찰

### Phase 2: 기능 확장
- [ ] 자동 z-index 최적화
- [ ] 시각적 충돌 표시 도구
- [ ] 성능 모니터링 대시보드

### Phase 3: 개발자 경험
- [ ] VS Code 확장 프로그램
- [ ] 자동 테스트 통합
- [ ] 문서 자동 생성

## 📞 문제 해결

### 자주 발생하는 문제

1. **Country Selector가 다른 요소에 가려짐**
   - 해결책: 디버그 모드 활성화하여 z-index 값 확인
   - 확인사항: CSS 변수가 올바르게 로드되었는지 확인

2. **충돌 감지가 작동하지 않음**
   - 해결책: Z-Index Manager 초기화 상태 확인
   - 확인사항: MutationObserver가 정상적으로 작동하는지 확인

3. **성능 문제 발생**
   - 해결책: 충돌 감지 비활성화 또는 디바운스 시간 조정
   - 확인사항: 감시 중인 요소 수가 과도하지 않은지 확인

### 로그 분석

```javascript
// 상세 로그 활성화
zIndexManager.setDebugMode(true);

// 충돌 해결 과정 모니터링
document.addEventListener('z-index-conflict-resolved', (event) => {
    console.log('충돌 해결됨:', event.detail);
});
```

## 📚 참고 자료

- [CSS Z-Index MDN 문서](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index)
- [Stacking Context MDN 문서](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
- [MutationObserver MDN 문서](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

---

**이 가이드는 TravelLog의 Z-Index 시스템을 효과적으로 사용하고 문제를 해결하는 데 도움이 됩니다. 추가 질문이나 문제가 있으면 개발팀에 문의해 주세요.**
