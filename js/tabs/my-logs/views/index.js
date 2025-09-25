/**
 * My Logs Views - 나의 로그 탭의 모든 뷰 컴포넌트들
 * 
 * 이 모듈은 "나의 로그" 탭의 모든 뷰 컴포넌트들을 중앙에서 관리합니다.
 * 각 뷰는 독립적인 기능을 담당하며, 명확한 책임 분리를 통해
 * 유지보수성과 확장성을 확보했습니다.
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

// 메인 뷰들
export { HubView } from './HubView.js';
export { LogsListView } from './LogsListView.js';
export { TravelReportView } from './TravelReportView.js';
export { ProfileView } from './ProfileView.js';
export { ProfileEditView } from './ProfileEditView.js';
export { SettingsView } from './SettingsView.js';

// 컬렉션 시스템 (여행 도감)
export * from './collections/index.js';

// 뷰 타입 정의 (TypeScript 스타일 주석)
/**
 * @typedef {Object} ViewConfig
 * @property {string} type - 뷰 타입 ('hub' | 'logs' | 'travelReport' | 'profile' | 'settings' | 'collection')
 * @property {string} title - 뷰 제목
 * @property {string} description - 뷰 설명
 * @property {string} icon - 뷰 아이콘
 */

/**
 * @typedef {Object} CollectionConfig
 * @property {string} type - 컬렉션 타입 ('countries' | 'cities' | 'restaurants' | 'attractions')
 * @property {string} title - 컬렉션 제목
 * @property {string} description - 컬렉션 설명
 * @property {string} icon - 컬렉션 아이콘
 */
