# 🧩 Collections System - 여행 도감 컬렉션 시스템

## 📋 Overview
확장 가능한 컬렉션 시스템으로, 다양한 여행 관련 데이터를 체계적으로 관리할 수 있습니다. 플러그인 아키텍처를 통해 새로운 컬렉션 타입을 쉽게 추가할 수 있습니다.

## 🏗️ Architecture

### **4단계 계층 구조**
```
Level 1: TravelCollectionView (메인 컨테이너)
    ↓
Level 2: CollectionTabManager (서브탭 관리자)
    ↓
Level 3: BaseCollectionView (추상 베이스 클래스)
    ↓
Level 4: CountriesCollectionView (구체적 구현)
```

### **핵심 컴포넌트**

#### **1. TravelCollectionView.js**
- 메인 컬렉션 컨테이너
- 컬렉션 등록 및 초기화
- 공통 UI 요소 관리

#### **2. CollectionTabManager.js**
- 서브탭 네비게이션 관리
- 동적 모듈 로딩
- 인스턴스 캐싱

#### **3. BaseCollectionView.js**
- 추상 베이스 클래스
- 공통 인터페이스 정의
- 템플릿 메서드 패턴

#### **4. CountriesCollectionView.js**
- 국가 컬렉션 구현체
- 방문한 국가 관리
- 대륙별 필터링

## 🔌 Plugin System

### **컬렉션 등록**
```javascript
// TravelCollectionView.js에서
this.tabManager.registerCollection('countries', {
    type: 'countries',
    icon: '🏴',
    title: '국가',
    description: '방문한 국가들을 모아보세요'
}, async () => {
    const { CountriesCollectionView } = await import('./collections/index.js');
    return CountriesCollectionView;
});
```

### **새로운 컬렉션 추가**
```javascript
// 1. BaseCollectionView를 상속받은 새 클래스 생성
export class CitiesCollectionView extends BaseCollectionView {
    async loadData() {
        // 도시 데이터 로드 로직
    }
    
    renderFilterControls() {
        // 도시 필터 UI
    }
    
    renderItems() {
        // 도시 카드 렌더링
    }
}

// 2. CollectionTabManager에 등록
this.tabManager.registerCollection('cities', {
    type: 'cities',
    icon: '🏙️',
    title: '도시',
    description: '방문한 도시들을 모아보세요'
}, async () => {
    const { CitiesCollectionView } = await import('./collections/index.js');
    return CitiesCollectionView;
});
```

## 🎯 Design Patterns

### **1. Template Method Pattern**
```javascript
// BaseCollectionView에서 공통 워크플로우 정의
async render(container) {
    this.container = container;
    this.isLoading = true;
    
    try {
        this.renderContent();        // 공통 구현
        await this.loadData();       // 추상 메서드
        this.isLoading = false;
        this.renderContent();        // 공통 구현
        this.bindEvents();           // 공통 구현
        this.isInitialized = true;
    } catch (error) {
        this.renderError(error);     // 공통 구현
    }
}
```

### **2. Plugin Pattern**
```javascript
// 동적 모듈 로딩
const ViewClass = await collectionInfo.viewClassLoader();
const collection = new ViewClass(this.controller, collectionInfo.config);
```

### **3. Factory Pattern**
```javascript
// 컬렉션 인스턴스 생성
const collection = new ViewClass(this.controller, collectionInfo.config);
```

## 🚀 Performance Features

### **Lazy Loading**
- 컬렉션은 필요시에만 로드
- 초기 번들 크기 최소화
- 메모리 사용량 최적화

### **Instance Caching**
```javascript
// 이미 로드된 컬렉션 재사용
if (this.loadedCollections.has(type)) {
    return this.loadedCollections.get(type);
}
```

### **Memory Management**
```javascript
// 리소스 정리
cleanup() {
    this.eventManager.cleanup();
    this.isInitialized = false;
    this.container = null;
    this.data = [];
}
```

## 📊 Data Flow

```
User Interaction
    ↓
TravelCollectionView
    ↓
CollectionTabManager
    ↓
BaseCollectionView (Template Method)
    ↓
Concrete Collection (CountriesCollectionView)
    ↓
Controller (Data Management)
    ↓
Service Layer (Business Logic)
```

## 🔧 Development Guidelines

### **새로운 컬렉션 개발**
1. **BaseCollectionView 상속**
   ```javascript
   export class NewCollectionView extends BaseCollectionView {
       // 추상 메서드 구현
   }
   ```

2. **필수 메서드 구현**
   - `async loadData()`: 데이터 로드
   - `renderFilterControls()`: 필터 UI
   - `renderSortControls()`: 정렬 UI
   - `renderStats()`: 통계 UI
   - `renderItems()`: 아이템 렌더링
   - `getFilteredAndSortedData()`: 필터링/정렬 로직

3. **컬렉션 등록**
   ```javascript
   this.tabManager.registerCollection('newType', config, loader);
   ```

### **CSS 스타일링**
```css
/* 컬렉션별 고유 스타일 */
.new-collection-view {
    /* 기본 스타일 */
}

.new-collection-view .collection-grid {
    /* 그리드 레이아웃 */
}

.new-collection-view .collection-item {
    /* 아이템 스타일 */
}
```

## 📁 File Structure

```
collections/
├── README.md                    # 이 파일
├── index.js                     # Export 정리
├── TravelCollectionView.js      # 메인 컨테이너
├── CollectionTabManager.js      # 서브탭 관리자
├── BaseCollectionView.js        # 추상 베이스 클래스
└── CountriesCollectionView.js   # 국가 컬렉션 구현체
```

## 🔮 Future Extensions

### **계획된 컬렉션 타입들**
- **CitiesCollectionView**: 도시 컬렉션
- **RestaurantsCollectionView**: 맛집 컬렉션
- **AttractionsCollectionView**: 명소 컬렉션
- **MemoriesCollectionView**: 추억 컬렉션
- **PhotosCollectionView**: 사진 컬렉션

### **확장 방법**
1. `BaseCollectionView`를 상속받은 새 클래스 생성
2. `index.js`에 export 추가
3. `TravelCollectionView`에서 등록
4. 필요한 데이터 서비스 메서드 추가
5. CSS 스타일 추가

## 🐛 Troubleshooting

### **일반적인 문제들**
1. **컬렉션이 로드되지 않음**: `viewClassLoader` 함수 확인
2. **데이터가 표시되지 않음**: `loadData()` 메서드 확인
3. **필터가 작동하지 않음**: `getFilteredAndSortedData()` 메서드 확인
4. **이벤트가 작동하지 않음**: `bindCustomEvents()` 메서드 확인

### **디버깅 팁**
```javascript
// 컬렉션 상태 확인
console.log('Collection loaded:', this.isInitialized);
console.log('Data loaded:', this.data.length);

// 이벤트 리스너 확인
console.log('Event listeners:', this.eventManager.listeners);
```
