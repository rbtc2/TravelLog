# TravelLog - 여행 기록 웹앱

여행의 순간들을 기록하고 공유할 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

- 📍 **지도 기반 여행 기록**: Leaflet을 활용한 인터랙티브 지도
- 📝 **여행 일지 작성**: 사진, 텍스트, 위치 정보를 포함한 상세 기록
- 🗺️ **여행 경로 시각화**: 방문한 장소들을 지도에 표시
- 📱 **반응형 디자인**: 모바일과 데스크톱에서 최적화된 사용자 경험
- 🎨 **모던 UI**: TailwindCSS를 활용한 깔끔하고 직관적인 인터페이스

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: TailwindCSS
- **Maps**: Leaflet.js
- **Development**: Live Server

## 📁 프로젝트 구조

```
travel-log/
├── src/
│   ├── components/          # 재사용 컴포넌트
│   │   ├── common/         # 공통 컴포넌트
│   │   ├── forms/          # 폼 관련
│   │   └── navigation/     # 네비게이션
│   ├── pages/              # 페이지 컴포넌트
│   ├── services/           # 비즈니스 로직
│   ├── store/              # 상태 관리
│   ├── utils/              # 유틸리티
│   └── assets/             # 정적 자원
├── public/
│   └── data/               # 국가/도시 데이터
├── docs/                   # 문서
└── tests/                  # 테스트
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 14.0.0 이상
- npm 또는 yarn

### 설치 및 실행

1. 저장소 클론
```bash
git clone https://github.com/yourusername/travel-log.git
cd travel-log
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

4. 브라우저에서 `http://localhost:3000` 접속

## 📝 개발 가이드

### 코드 스타일

- ES6+ 문법 사용
- 함수형 프로그래밍 지향
- 컴포넌트 기반 아키텍처
- 반응형 디자인 우선

### 폴더 구조 규칙

- `components/`: 재사용 가능한 UI 컴포넌트
- `pages/`: 페이지 레벨 컴포넌트
- `services/`: API 호출 및 비즈니스 로직
- `store/`: 상태 관리 (향후 Redux/Zustand 추가 예정)
- `utils/`: 헬퍼 함수 및 유틸리티

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/yourusername/travel-log](https://github.com/yourusername/travel-log)

## 🙏 감사의 말

- [TailwindCSS](https://tailwindcss.com/) - 유틸리티 우선 CSS 프레임워크
- [Leaflet](https://leafletjs.com/) - 오픈소스 인터랙티브 지도 라이브러리
- [Live Server](https://github.com/tapio/live-server) - 개발 서버

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!
