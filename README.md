# TravelLog - 여행 일지 애플리케이션

**버전**: DEMO  
**빌드**: 20250901  
**개발사**: REDIPX

## 📱 프로젝트 개요

TravelLog는 5탭 구조의 모바일/웹 호환 여행 일지 애플리케이션입니다. 각 탭이 완전히 독립적으로 동작하며, 확장 가능한 구조로 설계되었습니다.

## 🎨 CSS 아키텍처

TravelLog는 **모듈화된 CSS 아키텍처**를 사용합니다:

- **모듈화 기준**: 300줄 초과 CSS 파일은 기능별로 분리
- **성능 최적화**: 필요한 스타일만 로드하여 성능 향상
- **유지보수성**: 각 기능별로 독립적인 파일 관리
- **확장성**: 새로운 기능 추가 시 새 모듈 생성

> **자세한 가이드라인**: [CSS 모듈화 가이드라인](docs/rules/css-module-guidelines.md)

## 🚀 빠른 시작

### 1. 프로젝트 실행
```bash
# 로컬 서버 실행
python -m http.server 8000
# 또는
npx serve .
# 또는
php -S localhost:8000
```

### 2. 브라우저에서 접속
```
http://localhost:8000
```

## 🏗️ 주요 기능

- **🏠 홈**: 여행 로그 메인 화면
- **🔍 검색**: 여행지, 기록, 태그 검색
- **➕ 일지 추가**: 새로운 여행 경험 기록
- **📅 캘린더**: 여행 일정 및 기록 관리
- **📝 내 일지**: 개인 여행 일지 관리

## 🛠️ 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: 반응형 디자인, Flexbox, CSS Grid
- **JavaScript ES6+**: 모듈 시스템, 클래스, async/await

## 📚 상세 문서

프로젝트의 상세한 문서는 [`docs/`](./docs/) 폴더를 참조하세요:

- **📖 [시작 가이드](./docs/guides/getting-started.md)**
- **🏗️ [시스템 아키텍처](./docs/guides/architecture.md)**
- **🔍 [검색 시스템](./docs/features/search-system.md)**
- **🌍 [국가 선택기](./docs/features/country-selector.md)**
- **🎨 [스타일 가이드](./docs/styles/overview.md)**
- **🔌 [API 문서](./docs/api/README.md)**
- **🔧 [유지보수 가이드](./docs/maintenance/production-guide.md)**

## 🧪 테스트

프로젝트의 [`tests/`](./tests/) 폴더에서 각 기능을 테스트할 수 있습니다:

- **`tests/test-final-integration.html`**: 전체 시스템 통합 테스트
- **`tests/test-search-functionality.html`**: 검색 기능 종합 테스트

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**참고**: 현재 버전은 기본 구조만 구현된 상태입니다. 실제 기능은 향후 개발을 통해 추가될 예정입니다.
