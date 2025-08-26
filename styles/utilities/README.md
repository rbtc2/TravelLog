# Utilities

유틸리티 클래스 폴더입니다. 특정 기능을 위한 독립적인 스타일들을 포함합니다.

## 포함될 파일들

### 1. animations.css
- 애니메이션 관련 스타일
- `@keyframes`, `.loading-spinner` 등
- 전환 효과 및 애니메이션

### 2. responsive.css
- 반응형 디자인 스타일
- `@media` 쿼리들
- 모바일, 태블릿, 데스크톱 최적화

### 3. dark-mode.css
- 다크 모드 지원 스타일
- `@media (prefers-color-scheme: dark)` 쿼리
- 다크 테마 관련 모든 스타일

### 4. accessibility.css
- 접근성 관련 스타일
- `@media (prefers-reduced-motion: reduce)` 등
- 접근성 개선을 위한 스타일

## 의존성
- **base/** 폴더에 의존 (CSS 변수)
- **독립적**: 다른 유틸리티에 의존하지 않음
- **가장 독립적**: 다른 컴포넌트나 페이지에 의존하지 않음

## 사용 순서
- base/ 폴더의 파일들 이후에 로드
- 순서는 중요하지 않음 (독립적)

## 특징
- 특정 기능에 특화된 스타일
- 재사용 가능한 유틸리티 클래스
- 페이지나 컴포넌트와 독립적
- 성능 최적화에 유리
