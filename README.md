# TravelLog - 여행 일지 애플리케이션

## 📱 프로젝트 개요

TravelLog는 5탭 구조의 모바일/웹 호환 여행 일지 애플리케이션입니다. 각 탭이 완전히 독립적으로 동작하며, 확장 가능한 구조로 설계되었습니다.

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
- **🔧 [유지보수 가이드](./docs/maintenance/production-guide.md)**

## 🧪 테스트

프로젝트 루트의 `test-*.html` 파일들을 통해 각 기능을 테스트할 수 있습니다.

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
