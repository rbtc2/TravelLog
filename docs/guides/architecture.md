# 🏗️ TravelLog 시스템 아키텍처

## 📋 개요

TravelLog는 모듈화된 아키텍처를 기반으로 설계된 SPA(Single Page Application)입니다. 각 탭이 완전히 독립적으로 동작하며, 동적 모듈 로딩을 통해 성능을 최적화합니다.

## 🏛️ 아키텍처 원칙

### 1. **모듈화 (Modularity)**
- 각 기능을 독립적인 모듈로 분리
- 명확한 인터페이스와 책임 분리
- 재사용 가능한 컴포넌트 설계

### 2. **독립성 (Independence)**
- 탭 간 의존성 최소화
- 각 모듈의 자체 생명주기 관리
- 격리된 상태 관리

### 3. **확장성 (Scalability)**
- 플러그인 방식의 탭 추가
- 모듈별 독립적인 버전 관리
- 점진적 기능 확장

### 4. **성능 (Performance)**
- 지연 로딩 (Lazy Loading)
- 메모리 효율적인 리소스 관리
- 최적화된 렌더링 파이프라인

## 🔧 핵심 컴포넌트

### 1. **애플리케이션 코어 (`app.js`)**
```javascript
class App {
    constructor() {
        this.tabManager = new TabManager();
        this.currentTab = null;
        this.tabs = new Map();
    }
    
    // 탭 전환 및 생명주기 관리
    async switchTab(tabName) { /* ... */ }
    
    // 모듈 동적 로딩
    async loadTabModule(tabName) { /* ... */ }
}
```

### 2. **탭 관리자 (`TabManager`)**
```javascript
class TabManager {
    constructor() {
        this.activeTab = null;
        this.tabModules = new Map();
    }
    
    // 탭 활성화/비활성화
    activateTab(tabName) { /* ... */ }
    
    // 리소스 정리
    cleanupTab(tabName) { /* ... */ }
}
```

### 3. **탭 모듈 인터페이스**
```javascript
class BaseTab {
    constructor() {
        this.isActive = false;
        this.container = null;
    }
    
    // 필수 메서드
    render() { /* 구현 필요 */ }
    cleanup() { /* 구현 필요 */ }
    bindEvents() { /* 구현 필요 */ }
}
```

## 📁 파일 구조 상세

### **JavaScript 모듈 구조**
```
js/
├── app.js                     # 애플리케이션 메인
├── config/
│   └── form-config.js        # 폼 설정
├── data/
│   └── countries-manager.js   # 국가 데이터 관리
├── modules/
│   ├── log-detail.js         # 일정 상세 모듈
│   ├── log-edit.js           # 일정 편집 모듈
│   ├── repository.js          # 데이터 저장소
│   ├── services/
│   │   └── log-service.js    # 일정 서비스
│   ├── ui-components/
│   │   ├── country-selector.js    # 국가 선택기
│   │   ├── modal-manager.js       # 모달 관리자
│   │   ├── pagination-manager.js  # 페이지네이션
│   │   ├── toast-manager.js       # 토스트 알림
│   │   └── view-manager.js        # 뷰 관리자
│   └── utils/
│       ├── country-data-manager.js # 국가 데이터
│       ├── demo-data.js           # 데모 데이터
│       ├── event-manager.js       # 이벤트 관리
│       ├── search-utility.js      # 검색 유틸리티
│       ├── storage-manager.js     # 저장소 관리
│       ├── theme-manager.js       # 테마 관리자
│       └── dark-mode-manager.js   # 다크모드 관리자
└── tabs/
    ├── home.js               # 홈 탭
    ├── search.js             # 검색 탭
    ├── add-log.js            # 일지 추가 탭
    ├── calendar.js            # 캘린더 탭
    └── my-logs.js            # 내 일지 탭
```

### **CSS 구조**
```
styles/
├── main.css                  # 메인 스타일 (모든 스타일 import)
├── base/                     # 기본 스타일
│   ├── variables.css         # CSS 변수
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
    ├── theme-transitions.css # 테마 전환 애니메이션
    ├── responsive.css        # 반응형
    ├── navigation-utils.css  # 네비게이션 유틸리티
    └── scroll-optimization.css # 스크롤 최적화
```

## 🔄 데이터 흐름

### 1. **애플리케이션 초기화**
```
index.html → app.js → TabManager → 기본 탭 로드
```

### 2. **탭 전환 프로세스**
```
사용자 탭 클릭 → TabManager.switchTab() → 
현재 탭 cleanup() → 새 탭 모듈 로드 → 
새 탭 render() → 새 탭 bindEvents()
```

### 3. **데이터 관리 흐름**
```
UI 이벤트 → 이벤트 핸들러 → 서비스 레이어 → 
데이터 저장소 → 로컬 스토리지 → UI 업데이트
```

## 🎯 설계 패턴

### 1. **MVC 패턴**
- **Model**: 데이터 및 비즈니스 로직
- **View**: UI 렌더링 및 사용자 인터페이스
- **Controller**: 사용자 입력 처리 및 상태 관리

### 2. **Observer 패턴**
- 이벤트 기반 통신
- 느슨한 결합 (Loose Coupling)
- 실시간 UI 업데이트

### 3. **Factory 패턴**
- 탭 모듈 동적 생성
- 설정 기반 컴포넌트 생성
- 유연한 확장성

### 4. **Strategy 패턴**
- 검색 알고리즘 전략
- 정렬 방식 전략
- 렌더링 전략

## 🚀 성능 최적화

### 1. **코드 분할 (Code Splitting)**
- 탭별 모듈 분리
- 필요시에만 로드
- 번들 크기 최적화

### 2. **메모리 관리**
- 탭 전환 시 리소스 정리
- 이벤트 리스너 정리
- DOM 요소 정리

### 3. **렌더링 최적화**
- 가상 스크롤링
- 지연 로딩
- 이미지 최적화

### 4. **캐싱 전략**
- 검색 결과 캐싱
- API 응답 캐싱
- 정적 자원 캐싱

## 🔒 보안 고려사항

### 1. **입력 검증**
- 사용자 입력 sanitization
- XSS 공격 방지
- CSRF 토큰 관리

### 2. **데이터 보호**
- 민감 정보 암호화
- 로컬 스토리지 보안
- API 키 보안

## 🧪 테스트 전략

### 1. **단위 테스트**
- 모듈별 기능 테스트
- 유틸리티 함수 테스트
- 컴포넌트 테스트

### 2. **통합 테스트**
- 탭 간 상호작용 테스트
- 데이터 흐름 테스트
- API 연동 테스트

### 3. **E2E 테스트**
- 사용자 시나리오 테스트
- 크로스 브라우저 테스트
- 성능 테스트

## 🌙 다크모드 아키텍처

### 1. **테마 관리 시스템**
- **ThemeManager**: 중앙화된 테마 상태 관리
- **DarkModeManager**: 실시간 다크모드 스타일 관리
- **테마 전환**: 부드러운 애니메이션과 함께 테마 전환
- **시스템 통합**: 자동 시스템 테마 감지

### 2. **다크모드 개발 도구**
- **CSS 생성기**: 자동화된 다크모드 스타일 생성
- **관리 스크립트**: 다크모드 작업을 위한 명령줄 도구
- **검증 시스템**: 실시간 다크모드 스타일 검증
- **자동 수정**: 다크모드 이슈 자동 수정

### 3. **설정 관리**
- **중앙화된 설정**: `config/dark-mode-config.js`로 테마 설정 관리
- **CSS 변수**: 동적 테마 변수 시스템
- **컴포넌트 스타일**: 컴포넌트별 사전 정의된 다크모드 스타일
- **접근성 지원**: 고대비 및 애니메이션 감소 지원

## 🔮 향후 아키텍처 개선

### 1. **마이크로 프론트엔드**
- 탭별 독립적 배포
- 버전 관리 개선
- 팀별 독립적 개발

### 2. **상태 관리 개선**
- 전역 상태 관리 도입
- 상태 동기화 개선
- 디버깅 도구 강화

### 3. **성능 모니터링**
- 실시간 성능 메트릭
- 사용자 행동 분석
- 자동 최적화

---

**다음 단계**: 
- [다크모드 개발 규칙](./../rules/dark-mode.md) - 다크모드 개발 가이드라인
- [검색 시스템](./../features/search-system.md) - 검색 기능 구현
- [국가 선택기](./../features/country-selector.md) - 국가 선택기 구현
