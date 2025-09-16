/**
 * TravelCollectionView - 여행 도감 메인 화면 (확장 가능한 서브탭 시스템)
 * 
 * 🎯 책임:
 * - 여행 도감 서브탭 관리 (국가, 도시, 맛집 등)
 * - 탭 간 전환 및 네비게이션
 * - 공통 UI 요소 관리
 * - 확장 가능한 컬렉션 아키텍처 제공
 * 
 * @class TravelCollectionView
 * @version 2.0.0 (서브탭 시스템 적용)
 * @since 2024-12-29
 */
import { EventManager } from '../../../modules/utils/event-manager.js';
import { CollectionTabManager } from './collections/CollectionTabManager.js';

class TravelCollectionView {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
        this.isInitialized = false;
        
        // 서브탭 관리자 초기화
        this.tabManager = new CollectionTabManager(controller);
        
        // 바인딩
        this.bindMethods();
        
        // 컬렉션들 등록
        this.registerCollections();
    }

    /**
     * 메서드 바인딩
     */
    bindMethods() {
        this.handleBackToHub = this.handleBackToHub.bind(this);
        this.handleCollectionChange = this.handleCollectionChange.bind(this);
    }
    
    /**
     * 컬렉션들을 등록합니다
     */
    registerCollections() {
        // 국가 컬렉션 등록
        this.tabManager.registerCollection('countries', {
            type: 'countries',
            icon: '🏴',
            title: '국가',
            description: '방문한 국가들을 모아보세요'
        }, async () => {
            const { CountriesCollectionView } = await import('./collections/CountriesCollectionView.js');
            return CountriesCollectionView;
        });
        
        // 향후 추가될 컬렉션들
        /*
        this.tabManager.registerCollection('cities', {
            type: 'cities',
            icon: '🏙️',
            title: '도시',
            description: '방문한 도시들을 모아보세요'
        }, async () => {
            const { CitiesCollectionView } = await import('./collections/CitiesCollectionView.js');
            return CitiesCollectionView;
        });
        
        this.tabManager.registerCollection('restaurants', {
            type: 'restaurants',
            icon: '🍽️',
            title: '맛집',
            description: '방문한 맛집들을 모아보세요'
        }, async () => {
            const { RestaurantsCollectionView } = await import('./collections/RestaurantsCollectionView.js');
            return RestaurantsCollectionView;
        });
        */
    }

    /**
     * 여행 도감 화면을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    async render(container) {
        this.container = container;
        
        try {
            this.renderContent();
            this.bindEvents();
            
            // 탭 매니저 렌더링
            const collectionContainer = this.container.querySelector('#travel-collection-content');
            if (collectionContainer) {
                await this.tabManager.render(collectionContainer);
            }
            
            this.isInitialized = true;
            console.log('TravelCollectionView: 서브탭 시스템 렌더링 완료');
        } catch (error) {
            console.error('TravelCollectionView: 렌더링 실패:', error);
            this.renderError(error);
        }
    }

    /**
     * 메인 컨텐츠 렌더링 (간소화된 버전)
     */
    renderContent() {
        this.container.innerHTML = `
            <div class="my-logs-container">
                <!-- 헤더 -->
                <div class="my-logs-header">
                    <div class="header-with-back">
                        <button class="back-btn" id="back-to-hub-from-collection">◀ 뒤로</button>
                        <div class="header-content">
                            <h1 class="my-logs-title">📖 여행 도감</h1>
                            <p class="my-logs-subtitle">나만의 여행 컬렉션</p>
                        </div>
                    </div>
                </div>
                
                <!-- 서브탭 컨텐츠 컨테이너 -->
                <div class="travel-collection-content" id="travel-collection-content">
                    <!-- 탭 네비게이션과 컬렉션 컨텐츠가 여기에 동적으로 렌더링됩니다 -->
                </div>
            </div>
        `;
    }

    /**
     * 이벤트를 바인딩합니다
     */
    bindEvents() {
        if (!this.container) return;
        
        // 뒤로 가기 버튼
        const backBtn = this.container.querySelector('#back-to-hub-from-collection');
        if (backBtn) {
            this.eventManager.add(backBtn, 'click', this.handleBackToHub);
        }
        
        // 탭 매니저 이벤트 리스너
        this.container.addEventListener('collectionTabManager:collectionChanged', this.handleCollectionChange);
    }
    
    /**
     * 컬렉션 변경을 처리합니다
     * @param {CustomEvent} e - 컬렉션 변경 이벤트
     */
    handleCollectionChange(e) {
        const { currentCollection, collection } = e.detail;
        
        // 필요시 추가 처리 로직
        this.dispatchEvent('collectionChanged', {
            collection: currentCollection,
            instance: collection
        });
    }
    
    /**
     * 허브로 돌아갑니다
     */
    handleBackToHub() {
        this.dispatchEvent('navigate', { view: 'hub' });
    }

    /**
     * 커스텀 이벤트를 발생시킵니다
     * @param {string} eventName - 이벤트 이름
     * @param {Object} detail - 이벤트 상세 정보
     */
    dispatchEvent(eventName, detail) {
        if (this.container) {
            const event = new CustomEvent(`travelCollectionView:${eventName}`, { detail });
            this.container.dispatchEvent(event);
        }
    }
    
    /**
     * 에러 상태를 렌더링합니다
     * @param {Error} error - 발생한 에러
     */
    renderError(error) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <div class="header-with-back">
                        <button class="back-btn" id="back-to-hub-from-collection">◀ 뒤로</button>
                        <div class="header-content">
                            <h1 class="my-logs-title">📖 여행 도감</h1>
                            <p class="my-logs-subtitle">오류가 발생했습니다</p>
                        </div>
                    </div>
                </div>
                
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>여행 도감을 불러올 수 없습니다</h3>
                    <p>${error.message}</p>
                    <button class="retry-btn" onclick="location.reload()">다시 시도</button>
                </div>
            </div>
        `;
        
        // 뒤로 가기 버튼 이벤트 재바인딩
        const backBtn = this.container.querySelector('#back-to-hub-from-collection');
        if (backBtn) {
            this.eventManager.add(backBtn, 'click', this.handleBackToHub);
        }
    }
    
    /**
     * 현재 활성 컬렉션을 반환합니다
     * @returns {string|null} 현재 컬렉션 타입
     */
    getCurrentCollection() {
        return this.tabManager.getCurrentCollection();
    }
    
    /**
     * 특정 컬렉션으로 이동합니다
     * @param {string} collectionType - 이동할 컬렉션 타입
     */
    async navigateToCollection(collectionType) {
        if (this.tabManager) {
            await this.tabManager.navigateToCollection(collectionType);
        }
    }
    
    /**
     * 컬렉션 개수를 새로고침합니다
     */
    refreshCollectionCounts() {
        if (this.tabManager) {
            this.tabManager.refreshCollectionCounts();
        }
    }
    
    /**
     * 리소스를 정리합니다
     */
    cleanup() {
        // 탭 매니저 정리
        if (this.tabManager) {
            this.tabManager.cleanup();
        }
        
        // 이벤트 매니저 정리
        if (this.eventManager) {
            this.eventManager.cleanup();
        }
        
        // 상태 초기화
        this.container = null;
        this.isInitialized = false;
        
        console.log('TravelCollectionView: 리소스 정리 완료');
    }
}

export default TravelCollectionView;