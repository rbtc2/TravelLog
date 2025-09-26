# 메모리 누수 방지 시스템 가이드

## 📋 개요

TravelLog 프로젝트에 도입된 메모리 누수 방지 시스템은 다음과 같은 3개의 핵심 모듈로 구성됩니다:

1. **MemoryMonitor** - 메모리 사용량 모니터링 및 누수 감지
2. **EventManager** - 이벤트 리스너 추적 및 정리 검증
3. **CleanupVerifier** - 모듈 cleanup 메서드 호출 검증 및 로깅

## 🚀 주요 기능

### 1. 실시간 메모리 모니터링
- 5초마다 메모리 사용량 체크
- 메모리 누수 자동 감지 (10MB 이상 증가 시)
- 메모리 경고 및 위험 임계값 알림
- 성능 메트릭 추적

### 2. 이벤트 리스너 관리
- 모든 이벤트 리스너 자동 추적
- DOM 요소 유효성 검사
- 정리 실패 감지 및 보고
- 메모리 누수 감지

### 3. Cleanup 검증
- 모듈 cleanup 메서드 호출 추적
- 타임아웃 감지 (기본 3초)
- 성능 메트릭 수집
- 정리 실패 자동 감지

## 📁 파일 구조

```
js/modules/utils/
├── memory-monitor.js      # 메모리 모니터링 시스템
├── event-manager.js       # 이벤트 리스너 관리 (강화됨)
└── cleanup-verifier.js    # Cleanup 검증 시스템

js/modules/core/
└── tab-manager.js         # 탭 관리자 (강화됨)

js/app.js                  # 메인 앱 (통합됨)
```

## 🔧 사용법

### 1. 자동 초기화

시스템은 앱 시작 시 자동으로 초기화됩니다:

```javascript
// app.js에서 자동 초기화
setupMemoryLeakPrevention();
```

### 2. 메모리 모니터링

```javascript
import { memoryMonitor } from './modules/utils/memory-monitor.js';

// 메모리 정보 가져오기
const memoryInfo = memoryMonitor.getMemoryInfo();
console.log('현재 메모리 사용량:', memoryInfo.used);

// 메모리 스냅샷 기록
memoryMonitor.recordMemorySnapshot();

// 통계 정보 가져오기
const stats = memoryMonitor.getMemoryStats();
```

### 3. 이벤트 리스너 관리

```javascript
import { EventManager } from './modules/utils/event-manager.js';

const eventManager = new EventManager({
    enableMemoryTracking: true,
    enableLogging: true
});

// 이벤트 리스너 등록 (자동 추적)
const listenerId = eventManager.add(
    element, 
    'click', 
    handler, 
    { source: 'MyModule' }
);

// 이벤트 리스너 제거
eventManager.removeById(listenerId);

// 통계 정보
const stats = eventManager.getStats();
const leaks = eventManager.detectLeaks();
```

### 4. Cleanup 검증

```javascript
import { cleanupVerifier } from './modules/utils/cleanup-verifier.js';

// 모듈 등록
cleanupVerifier.registerModule('MyModule', moduleInstance, {
    requireCleanup: true,
    timeout: 3000,
    critical: false
});

// Cleanup 래핑
const originalCleanup = moduleInstance.cleanup;
moduleInstance.cleanup = cleanupVerifier.wrapCleanupMethod(
    'MyModule', 
    originalCleanup
);
```

## 📊 모니터링 및 디버깅

### 1. 콘솔 로그

시스템은 다음과 같은 로그를 출력합니다:

```
MemoryMonitor: 메모리 모니터링이 시작되었습니다.
TabManager: 메모리 누수 방지 정리 완료
EventManager: 5개의 리스너 제거됨
CleanupVerifier: Cleanup 완료: MyModule
```

### 2. 이벤트 리스너

다음 이벤트들을 통해 상태를 모니터링할 수 있습니다:

```javascript
// 메모리 누수 감지
window.addEventListener('memoryLeak', (event) => {
    console.error('메모리 누수 감지:', event.detail);
});

// 메모리 경고
window.addEventListener('memoryWarning', (event) => {
    console.warn('메모리 경고:', event.detail);
});

// Cleanup 이슈
window.addEventListener('cleanupVerifier:issues', (event) => {
    console.warn('Cleanup 이슈:', event.detail);
});
```

### 3. 개발자 도구

개발 모드에서 상세한 메모리 정보를 확인할 수 있습니다:

```javascript
// TabManager 통계
console.log(appManager.tabManager.getStats());

// 메모리 누수 감지
console.log(appManager.tabManager.detectMemoryLeaks());

// CleanupVerifier 통계
console.log(cleanupVerifier.getStats());
```

## ⚙️ 설정 옵션

### MemoryMonitor 설정

```javascript
const memoryMonitor = new MemoryMonitor({
    enableMonitoring: true,
    monitoringInterval: 5000,        // 5초마다 체크
    enableLeakDetection: true,
    memoryWarningThreshold: 50 * 1024 * 1024,  // 50MB
    memoryCriticalThreshold: 100 * 1024 * 1024, // 100MB
    leakDetectionThreshold: 10 * 1024 * 1024,  // 10MB
    enableConsoleLogging: true,
    enableDetailedLogging: false
});
```

### EventManager 설정

```javascript
const eventManager = new EventManager({
    enableMemoryTracking: true,
    enableLeakDetection: true,
    enableValidation: true,
    enableLogging: false,
    logLevel: 'warn'
});
```

### CleanupVerifier 설정

```javascript
const cleanupVerifier = new CleanupVerifier({
    enableVerification: true,
    enableLogging: true,
    enablePerformanceTracking: true,
    cleanupTimeout: 5000,             // 5초
    memoryThreshold: 10 * 1024 * 1024, // 10MB
    logLevel: 'info',
    detailedLogging: false
});
```

## 🚨 알림 및 임계값

### 메모리 임계값

- **경고**: 50MB 사용량
- **위험**: 100MB 사용량
- **누수 감지**: 10MB 증가

### Cleanup 임계값

- **타임아웃**: 3초 (TabManager), 5초 (기본)
- **성능 경고**: 평균 cleanup 시간 초과
- **실패 감지**: cleanup 메서드 실행 실패

## 🔍 문제 해결

### 1. 메모리 누수 감지 시

```javascript
// 1. 메모리 정리 수행
memoryMonitor.recordMemorySnapshot();

// 2. 강제 가비지 컬렉션 (개발 모드)
if (window.gc) {
    window.gc();
}

// 3. 탭 정리
appManager.tabManager.cleanupCurrentTab();
```

### 2. Cleanup 타임아웃 시

```javascript
// 1. 모듈 강제 정리
appManager.tabManager.forceCleanupModule(moduleInstance, 'TabName');

// 2. 이벤트 리스너 강제 정리
eventManager.cleanup({ force: true });

// 3. 메모리 정리
appManager.performEmergencyCleanup();
```

### 3. 이벤트 리스너 누수 시

```javascript
// 1. 통계 확인
const stats = eventManager.getStats();
console.log('리스너 통계:', stats);

// 2. 누수 감지
const leaks = eventManager.detectLeaks();
console.log('누수 감지:', leaks);

// 3. 강제 정리
eventManager.cleanup({ force: true });
```

## 📈 성능 최적화

### 1. 모니터링 간격 조정

```javascript
// 개발 모드: 더 자주 모니터링
const interval = AppInfo.isDevelopment ? 2000 : 5000;
memoryMonitor.options.monitoringInterval = interval;
```

### 2. 로깅 레벨 조정

```javascript
// 프로덕션 모드: 로깅 최소화
const logLevel = AppInfo.isDevelopment ? 'info' : 'error';
eventManager.options.logLevel = logLevel;
```

### 3. 히스토리 크기 제한

```javascript
// 메모리 히스토리 크기 제한
memoryMonitor.options.logRetentionCount = 50;
```

## 🎯 모범 사례

### 1. 모듈 개발 시

```javascript
class MyModule {
    constructor() {
        this.eventListeners = [];
        this.timeouts = [];
        this.isInitialized = false;
    }
    
    render(container) {
        this.container = container;
        this.isInitialized = true;
        // 렌더링 로직
    }
    
    cleanup() {
        // 이벤트 리스너 정리
        this.eventListeners.forEach(listener => {
            listener.element.removeEventListener(listener.event, listener.handler);
        });
        this.eventListeners = [];
        
        // 타이머 정리
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts = [];
        
        // 상태 초기화
        this.isInitialized = false;
        this.container = null;
    }
}
```

### 2. 이벤트 리스너 등록 시

```javascript
// ✅ 좋은 예: EventManager 사용
eventManager.add(element, 'click', handler, { source: 'MyModule' });

// ❌ 나쁜 예: 직접 등록
element.addEventListener('click', handler);
```

### 3. Cleanup 메서드 구현 시

```javascript
// ✅ 좋은 예: 비동기 처리
async cleanup() {
    try {
        await this.performCleanup();
        this.isInitialized = false;
    } catch (error) {
        console.error('Cleanup 실패:', error);
        throw error;
    }
}

// ❌ 나쁜 예: 동기 처리만
cleanup() {
    this.performCleanup();
    this.isInitialized = false;
}
```

## 🔄 업데이트 및 유지보수

### 1. 정기적인 모니터링

- 주간 메모리 사용량 리포트 확인
- Cleanup 성능 메트릭 분석
- 이벤트 리스너 누수 패턴 파악

### 2. 임계값 조정

- 사용자 행동 패턴에 따른 임계값 조정
- 성능 요구사항에 따른 모니터링 간격 조정
- 로깅 레벨 환경별 최적화

### 3. 새로운 모듈 통합

- 새 모듈 개발 시 메모리 누수 방지 패턴 적용
- CleanupVerifier에 모듈 등록
- 이벤트 리스너 추적 설정

## 📚 관련 문서

- [TravelLog Architecture Rules](architecture.md)
- [Performance Optimization Guidelines](performance.md)
- [Module Development Guidelines](module-patterns.md)

---

**주의사항**: 이 시스템은 개발 및 디버깅 목적으로 설계되었습니다. 프로덕션 환경에서는 성능에 미치는 영향을 고려하여 설정을 조정하세요.
