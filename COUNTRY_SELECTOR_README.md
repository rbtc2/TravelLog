# 🌍 국가 선택기 시스템 (Country Selector System)

## 📋 개요

TravelLog 애플리케이션의 통계 정확성을 높이기 위해 설계된 완전히 독립적인 국가 데이터 관리 시스템입니다. 기존 코드에 영향을 주지 않으면서 텍스트 입력 방식을 표준화된 국가 선택 방식으로 전환할 수 있습니다.

## 🎯 핵심 특징

### ✅ **완전한 독립성**
- 기존 코드에 전혀 영향을 주지 않음
- 모듈화된 설계로 필요시에만 로드
- 기존 폼과 완벽하게 호환

### ✅ **하이브리드 시스템**
- 온라인: REST Countries API로 최신 데이터 동기화
- 오프라인: 로컬 캐시 및 내장 기본 데이터 사용
- 자동 온라인/오프라인 상태 감지

### ✅ **고성능 설계**
- 메모리 내 인덱싱으로 빠른 검색
- N-gram 검색으로 부분 매치 지원
- 디바운싱된 검색으로 성능 최적화
- 30일 캐시로 API 호출 최소화

## 🏗️ 시스템 구조

```
js/
├── modules/
│   ├── utils/
│   │   └── country-data-manager.js    # 국가 데이터 관리 핵심
│   └── ui-components/
│       └── country-selector.js         # UI 컴포넌트
├── examples/
│   └── country-selector-usage.js       # 사용 예시 및 통합 가이드
└── styles/
    └── components/
        └── country-selector.css        # 컴포넌트 스타일
```

## 🚀 빠른 시작

### 1. 기본 사용법

```javascript
import CountrySelector from './js/modules/ui-components/country-selector.js';

// 단일 국가 선택기
const countrySelector = new CountrySelector({
    multiple: false,
    placeholder: '국가를 선택하세요',
    showFlags: true,
    showCodes: true,
    searchable: true,
    filterable: true,
    onSelectionChange: (countries, codes) => {
        console.log('선택된 국가:', countries);
        console.log('선택된 코드:', codes);
    }
});

countrySelector.render('#container');
```

### 2. 다중 국가 선택기

```javascript
const multiSelector = new CountrySelector({
    multiple: true,
    maxSelections: 5,
    placeholder: '최대 5개 국가 선택',
    showFlags: true,
    searchable: true,
    filterable: true
});

multiSelector.render('#multi-container');
```

### 3. 기존 폼 교체

```javascript
import { replaceCountryInputWithSelector } from './js/examples/country-selector-usage.js';

// 기존 국가 입력 필드를 자동으로 국가 선택기로 교체
replaceCountryInputWithSelector();
```

## ⚙️ 설정 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `multiple` | boolean | `false` | 다중 선택 모드 |
| `placeholder` | string | `'국가를 선택하세요'` | 플레이스홀더 텍스트 |
| `maxSelections` | number | `10` | 최대 선택 개수 (다중 모드) |
| `showFlags` | boolean | `true` | 국기 이모지 표시 |
| `showCodes` | boolean | `true` | 국가 코드 표시 |
| `searchable` | boolean | `true` | 검색 기능 활성화 |
| `filterable` | boolean | `true` | 대륙별 필터 활성화 |
| `onSelectionChange` | function | `null` | 선택 변경 콜백 |
| `onSearch` | function | `null` | 검색 실행 콜백 |

## 🔧 API 참조

### CountrySelector 클래스

#### 생성자
```javascript
new CountrySelector(options)
```

#### 메서드

##### `render(target)`
컴포넌트를 DOM에 렌더링합니다.

```javascript
countrySelector.render('#container');
countrySelector.render(document.getElementById('container'));
```

##### `getSelectedCountryCodes()`
선택된 국가 코드 배열을 반환합니다.

```javascript
const selectedCodes = countrySelector.getSelectedCountryCodes();
// ['KR', 'JP', 'US']
```

##### `getSelectedCountries()`
선택된 국가 객체 배열을 반환합니다.

```javascript
const selectedCountries = countrySelector.getSelectedCountries();
// [{code: 'KR', nameKo: '대한민국', ...}, ...]
```

##### `setSelectedCountries(countryCodes)`
외부에서 선택된 국가를 설정합니다.

```javascript
countrySelector.setSelectedCountries(['KR', 'JP']);
```

##### `isCountrySelected(countryCode)`
특정 국가의 선택 상태를 확인합니다.

```javascript
const isSelected = countrySelector.isCountrySelected('KR');
// true/false
```

##### `clearAllSelections()`
모든 선택을 해제합니다.

```javascript
countrySelector.clearAllSelections();
```

##### `cleanup()`
컴포넌트를 정리하고 메모리를 해제합니다.

```javascript
countrySelector.cleanup();
```

### CountryDataManager 클래스

#### 정적 메서드

##### `getAllCountries()`
모든 국가 데이터를 반환합니다.

```javascript
const { countryDataManager } = await import('./country-data-manager.js');
const allCountries = countryDataManager.getAllCountries();
```

##### `getCountryByCode(code)`
코드로 국가를 검색합니다.

```javascript
const country = countryDataManager.getCountryByCode('KR');
// {code: 'KR', nameKo: '대한민국', ...}
```

##### `getCountryByName(name)`
이름으로 국가를 검색합니다.

```javascript
const country = countryDataManager.getCountryByName('대한민국');
// {code: 'KR', nameKo: '대한민국', ...}
```

##### `searchCountries(query, limit)`
검색어로 국가를 검색합니다.

```javascript
const results = countryDataManager.searchCountries('korea', 10);
```

##### `getCountriesByRegion(region)`
대륙별 국가 목록을 반환합니다.

```javascript
const asianCountries = countryDataManager.getCountriesByRegion('asia');
```

## 🔄 데이터 마이그레이션

### 기존 텍스트 데이터를 국가 코드로 변환

```javascript
import { migrateExistingCountryData } from './js/examples/country-selector-usage.js';

// 기존 로그 데이터의 국가 정보를 자동으로 변환
const migratedLogs = await migrateExistingCountryData();
```

### 변환 예시

**변환 전:**
```json
{
  "country": "대한민국",
  "city": "서울",
  "startDate": "2024-01-01"
}
```

**변환 후:**
```json
{
  "country": "KR",
  "countryName": "대한민국",
  "countryFlag": "🇰🇷",
  "city": "서울",
  "startDate": "2024-01-01"
}
```

## 📊 통계 및 분석

### 국가별 방문 통계 생성

```javascript
import { generateCountryStatistics } from './js/examples/country-selector-usage.js';

const countryStats = await generateCountryStatistics();
console.log(countryStats);
```

**출력 예시:**
```javascript
[
  {
    code: 'KR',
    nameKo: '대한민국',
    nameEn: 'South Korea',
    flag: '🇰🇷',
    region: 'asia',
    visitCount: 5,
    totalDays: 45,
    averageRating: 4.2
  },
  // ... 더 많은 국가들
]
```

## 🎨 스타일 커스터마이징

### CSS 변수 오버라이드

```css
:root {
  --primary-color: #667eea;
  --primary-color-alpha: rgba(102, 126, 234, 0.25);
  --border-color: #e2e8f0;
  --bg-color: #ffffff;
  --text-color: #2d3748;
  --text-muted: #718096;
}
```

### 반응형 디자인

시스템은 자동으로 모바일과 데스크탑 환경에 최적화됩니다:

- **데스크탑**: 전체 기능, 호버 효과, 키보드 네비게이션
- **모바일**: 터치 최적화, 적응형 레이아웃, 모바일 친화적 UI

## 🌐 다국어 지원

### 한국어/영어 자동 변환

주요 국가들은 자동으로 한국어 이름을 제공합니다:

```javascript
const country = countryDataManager.getCountryByCode('KR');
console.log(country.nameKo); // '대한민국'
console.log(country.nameEn); // 'South Korea'
```

### 새로운 언어 추가

`country-data-manager.js`의 `getKoreanName` 함수를 수정하여 더 많은 언어를 지원할 수 있습니다.

## 🔒 보안 및 성능

### 데이터 보안
- API 호출은 HTTPS만 사용
- 사용자 입력은 자동 이스케이프 처리
- XSS 공격 방지

### 성능 최적화
- 메모리 내 인덱싱으로 O(1) 검색
- 지연 로딩으로 초기 로딩 시간 단축
- 디바운싱된 검색으로 불필요한 API 호출 방지
- 30일 캐시로 네트워크 요청 최소화

## 🧪 테스트 및 디버깅

### 개발자 도구

```javascript
// 국가 데이터 매니저 상태 확인
const { countryDataManager } = await import('./country-data-manager.js');
console.log(countryDataManager.getStatus());

// 선택기 상태 확인
console.log(countrySelector.getSelectedCountries());
```

### 에러 처리

시스템은 자동으로 에러를 감지하고 폴백 메커니즘을 제공합니다:

- API 실패 시 내장 데이터 사용
- 네트워크 오류 시 오프라인 모드로 전환
- 데이터 손상 시 자동 복구 시도

## 📱 브라우저 지원

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **IE**: 지원하지 않음

## 🚀 향후 계획

### v1.1.0 예정 기능
- [ ] 더 많은 언어 지원 (중국어, 일본어 등)
- [ ] 고급 검색 필터 (인구, GDP 등)
- [ ] 사용자 정의 국가 추가 기능
- [ ] 데이터 내보내기/가져오기

### v1.2.0 예정 기능
- [ ] 실시간 국가 정보 업데이트
- [ ] 지역별 통계 대시보드
- [ ] AI 기반 여행 추천 시스템
- [ ] 모바일 앱 지원

## 🤝 기여하기

1. 이슈 리포트 생성
2. 기능 요청 제안
3. 코드 풀 리퀘스트
4. 문서 개선 제안

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 📞 지원

- **이슈**: GitHub Issues 사용
- **문서**: 이 README 파일 참조
- **예시**: `js/examples/` 폴더 확인

---

**국가 선택기 시스템**으로 TravelLog의 통계 정확성을 높이고, 사용자 경험을 개선하세요! 🎉
