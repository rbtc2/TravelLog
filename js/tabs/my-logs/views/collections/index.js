/**
 * Collections Module - 여행 도감 컬렉션 시스템
 * 
 * 이 모듈은 확장 가능한 컬렉션 시스템을 제공합니다.
 * 새로운 컬렉션 타입을 추가할 때는 BaseCollectionView를 상속받아 구현하세요.
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

// 메인 컬렉션 뷰
export { default as TravelCollectionView } from './TravelCollectionView.js';

// 추상 베이스 클래스
export { BaseCollectionView } from './BaseCollectionView.js';

// 서브탭 관리자
export { CollectionTabManager } from './CollectionTabManager.js';

// 구체적 구현들
export { CountriesCollectionView } from './CountriesCollectionView.js';

// 향후 확장을 위한 컬렉션 타입들
// export { CitiesCollectionView } from './CitiesCollectionView.js';
// export { RestaurantsCollectionView } from './RestaurantsCollectionView.js';
// export { AttractionsCollectionView } from './AttractionsCollectionView.js';
