# CSS 컴포넌트 분리 계획

## Phase 2: 컴포넌트 분리 준비

### 계획된 폴더 구조
```
styles/
├── base/           # 기본 스타일 (리셋, 변수, 타이포그래피)
├── components/     # 재사용 가능한 컴포넌트
├── layouts/        # 레이아웃 관련 스타일
├── pages/          # 페이지별 스타일
├── utilities/      # 유틸리티 클래스
└── main.css        # 메인 파일 (import만)
```

### 의존성 순서
1. **base/** (가장 기본, 다른 모든 것에 의존)
   - variables.css
   - reset.css
   - typography.css

2. **components/** (base에 의존)
   - buttons.css
   - forms.css
   - modals.css
   - navigation.css
   - messages.css
   - sections.css

3. **layouts/** (base, components에 의존)
   - app-layout.css
   - tab-navigation.css

4. **pages/** (base, components, layouts에 의존)
   - login.css
   - add-log.css
   - my-logs.css
   - search.css
   - calendar.css

5. **utilities/** (base에 의존, 독립적)
   - animations.css
   - responsive.css
   - dark-mode.css

### 분리 예정 컴포넌트 분석

#### 1. buttons.css
- `.login-btn`, `.demo-btn`, `.submit-btn`, `.reset-btn`
- `.tab-btn`, `.settings-btn`, `.back-btn`
- `.view-report-btn`, `.add-first-log-btn`
- **의존성**: CSS 변수, 기본 스타일

#### 2. forms.css
- `.form-group`, `.form-label`, `.form-input`, `.form-textarea`
- `.radio-group`, `.radio-label`, `.chip-group`, `.chip-label`
- `.star-rating`, `.star`
- **의존성**: CSS 변수, 기본 스타일

#### 3. modals.css
- `.delete-confirm-modal`, `.modal-overlay`, `.modal-content`
- `.modal-header`, `.modal-body`, `.modal-footer`
- **의존성**: CSS 변수, 기본 스타일, z-index

#### 4. navigation.css
- `#tab-navigation`, `.tab-btn`, `.tab-icon`, `.tab-label`
- **의존성**: CSS 변수, 기본 스타일

#### 5. messages.css
- `.success-message`, `.error-message`
- `.success-content`, `.error-content`
- `.toast-message`
- **의존성**: CSS 변수, 기본 스타일, z-index

#### 6. sections.css
- `.hub-section`, `.section-header`, `.section-title`
- `.travel-report-section`, `.charts-section`
- **의존성**: CSS 변수, 기본 스타일

### 안전한 분리 전략

#### 1단계: 독립적 컴포넌트부터
- utilities/ 폴더의 스타일들 (가장 독립적)
- base/ 폴더의 기본 스타일들

#### 2단계: 의존성이 적은 컴포넌트
- components/ 폴더의 기본 컴포넌트들
- layouts/ 폴더의 레이아웃 스타일들

#### 3단계: 페이지별 스타일
- pages/ 폴더의 각 탭별 스타일들

### 각 단계별 테스트 체크리스트
- [ ] 로그인 화면 정상 작동
- [ ] 모든 탭 전환 정상 작동
- [ ] 일지 추가 기능 정상 작동
- [ ] 내 일지 조회/편집/삭제 정상 작동
- [ ] 검색 기능 정상 작동
- [ ] 반응형 디자인 정상 작동
- [ ] 다크모드 정상 작동

### 롤백 계획
- 각 단계 완료 후 백업 생성
- 문제 발생 시 즉시 이전 단계로 복원
- 단계별로 독립적인 테스트 가능
