# Pages

페이지별 스타일 폴더입니다. 각 탭이나 페이지에서만 사용되는 고유한 스타일들을 포함합니다.

## 포함될 파일들

### 1. login.css
- 로그인 및 회원가입 화면 스타일
- `.login-screen`, `.login-container`, `.login-header` 등
- 인증 관련 모든 스타일

### 2. add-log.css
- 일지 추가 화면 스타일
- `.add-log-container`, `.add-log-header`, `.add-log-form` 등
- 일지 작성 폼 관련 스타일

### 3. my-logs.css
- 내 일지 목록 화면 스타일
- `.my-logs-container`, `.hub-section`, `.log-item` 등
- 일지 조회, 편집, 삭제 관련 스타일

### 4. search.css
- 검색 화면 스타일
- `.search-container`, `.search-bar`, `.filter-section` 등
- 검색 및 필터링 관련 스타일

### 5. calendar.css
- 캘린더 화면 스타일
- 캘린더 관련 모든 스타일 (향후 구현 예정)

## 의존성
- **base/** 폴더에 의존
- **components/** 폴더에 의존
- **layouts/** 폴더에 의존
- **독립적**: 다른 페이지에 의존하지 않음

## 사용 순서
- base/, components/, layouts/ 폴더의 파일들 이후에 로드
- 순서는 중요하지 않음 (독립적)

## 특징
- 각 페이지의 고유한 스타일만 포함
- 공통 컴포넌트는 components/ 폴더에 배치
- 페이지별로 독립적인 스타일 관리
