/**
 * CollectionTabManager - 여행 도감 서브탭 관리자
 * 
 * 🎯 책임:
 * - 여러 컬렉션 뷰 간의 전환 관리
 * - 컬렉션 등록 및 동적 로딩
 * - 탭 네비게이션 UI 렌더링
 * - 메모리 효율적인 컬렉션 관리
 * 
 * @class CollectionTabManager
 * @version 1.0.0
 * @since 2024-12-29
 */
import { EventManager } from '../../../../modules/utils/event-manager.js';

export class CollectionTabManager {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
        
        // 등록된 컬렉션들
        this.collections = new Map();
        this.loadedCollections = new Map(); // 실제로 로드된 인스턴스들
        
        // 현재 상태
        this.currentCollection = null;
        this.defaultCollection = 'countries';
        
        // 바인딩
        this.handleTabClick = this.handleTabClick.bind(this);
    }
    
    /**
     * 컬렉션을 등록합니다
     * @param {string} type - 컬렉션 타입 (countries, cities, restaurants 등)
     * @param {Object} config - 컬렉션 설정
     * @param {Function} viewClassLoader - 뷰 클래스 로더 함수 (동적 import)
     */
    registerCollection(type, config, viewClassLoader) {
        this.collections.set(type, {
            config,
            viewClassLoader,
            isLoaded: false
        });
        
        // 컬렉션 등록 완료
    }
    
    /**
     * 탭 매니저를 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    async render(container) {
        this.container = container;
        
        try {
            this.renderTabNavigation();
            this.renderCollectionContainer();
            this.bindEvents();
            
            // 기본 컬렉션 로드
            await this.switchToCollection(this.defaultCollection);
            
            // 렌더링 완료
        } catch (error) {
            console.error('CollectionTabManager: 렌더링 실패:', error);
            this.renderError(error);
        }
    }
    
    /**
     * 탭 네비게이션을 렌더링합니다
     */
    renderTabNavigation() {
        const tabsHTML = Array.from(this.collections.entries())
            .map(([type, { config }]) => this.renderTabButton(type, config))
            .join('');
        
        const navigationHTML = `
            <div class="collection-navigation" style="margin-bottom: 24px;">
                <div class="collection-tabs" role="tablist" aria-label="컬렉션 탭" style="display: flex; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 12px; border: 1px solid #e2e8f0;">
                    ${tabsHTML}
                </div>
            </div>
        `;
        
        this.container.insertAdjacentHTML('afterbegin', navigationHTML);
    }
    
    /**
     * 개별 탭 버튼을 렌더링합니다
     * @param {string} type - 컬렉션 타입
     * @param {Object} config - 컬렉션 설정
     * @returns {string} HTML 문자열
     */
    renderTabButton(type, config) {
        try {
            const isActive = type === this.defaultCollection;
            const count = this.getCollectionCount(type);
            
            const buttonStyle = isActive 
                ? "background: #667eea; color: white; box-shadow: 0 2px 12px rgba(59, 130, 246, 0.3);"
                : "background: transparent; color: #718096;";
            
            return `
                <button 
                    class="collection-tab ${isActive ? 'active' : ''}" 
                    data-collection="${type}"
                    role="tab"
                    aria-selected="${isActive}"
                    aria-controls="${type}-collection-panel"
                    id="${type}-collection-tab"
                    style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; border: none; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; ${buttonStyle}"
                >
                    <span class="tab-icon" aria-hidden="true" style="font-size: 1.1em; line-height: 1;">${config.icon}</span>
                    <span class="tab-label" style="font-weight: 500;">${config.title}</span>
                    ${count > 0 ? `<span class="tab-count" aria-label="${count}개 항목" style="background: rgba(255, 255, 255, 0.2); color: inherit; padding: 2px 6px; border-radius: 8px; font-size: 12px; font-weight: 600; min-width: 20px; text-align: center;">${count}</span>` : ''}
                </button>
            `;
        } catch (error) {
            console.error(`CollectionTabManager: ${type} 탭 버튼 렌더링 실패:`, error);
            return `
                <button class="collection-tab" data-collection="${type}">
                    <span class="tab-label">${config.title || type}</span>
                </button>
            `;
        }
    }
    
    /**
     * 컬렉션 컨테이너를 렌더링합니다
     */
    renderCollectionContainer() {
        const containerHTML = `
            <div class="collection-container">
                <div 
                    class="collection-panel" 
                    id="collection-content"
                    role="tabpanel"
                    aria-labelledby="${this.defaultCollection}-collection-tab"
                >
                    <!-- 컬렉션 컨텐츠가 여기에 동적으로 로드됩니다 -->
                </div>
            </div>
        `;
        
        this.container.insertAdjacentHTML('beforeend', containerHTML);
    }
    
    /**
     * 이벤트를 바인딩합니다
     */
    bindEvents() {
        const tabs = this.container.querySelectorAll('.collection-tab');
        tabs.forEach(tab => {
            this.eventManager.add(tab, 'click', this.handleTabClick);
            
            // 키보드 네비게이션 지원
            this.eventManager.add(tab, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleTabClick(e);
                }
            });
        });
    }
    
    /**
     * 탭 클릭을 처리합니다
     * @param {Event} e - 클릭 이벤트
     */
    async handleTabClick(e) {
        const tab = e.currentTarget;
        const collectionType = tab.dataset.collection;
        
        if (collectionType && collectionType !== this.currentCollection) {
            await this.switchToCollection(collectionType);
        }
    }
    
    /**
     * 컬렉션을 전환합니다
     * @param {string} type - 전환할 컬렉션 타입
     */
    async switchToCollection(type) {
        if (!this.collections.has(type)) {
            console.error(`CollectionTabManager: 등록되지 않은 컬렉션 타입: ${type}`);
            return;
        }
        
        try {
            // 현재 컬렉션 정리
            this.cleanupCurrentCollection();
            
            // 새 컬렉션 로드
            const collection = await this.loadCollection(type);
            
            // 컬렉션 렌더링
            const contentContainer = this.container.querySelector('#collection-content');
            if (contentContainer && collection) {
                await collection.render(contentContainer);
                
                // 상태 업데이트
                this.currentCollection = type;
                this.updateTabStates(type);
                
                // 이벤트 발생
                this.dispatchEvent('collectionChanged', { 
                    previousCollection: this.currentCollection,
                    currentCollection: type,
                    collection: collection
                });
                
                // 컬렉션 전환 완료
            }
        } catch (error) {
            console.error(`CollectionTabManager: ${type} 컬렉션 전환 실패:`, error);
            this.showError(`${type} 컬렉션을 불러올 수 없습니다: ${error.message}`);
        }
    }
    
    /**
     * 컬렉션을 로드합니다 (지연 로딩)
     * @param {string} type - 로드할 컬렉션 타입
     * @returns {Object} 컬렉션 인스턴스
     */
    async loadCollection(type) {
        // 이미 로드된 컬렉션이 있다면 재사용
        if (this.loadedCollections.has(type)) {
            return this.loadedCollections.get(type);
        }
        
        const collectionInfo = this.collections.get(type);
        if (!collectionInfo) {
            throw new Error(`등록되지 않은 컬렉션: ${type}`);
        }
        
        // 동적으로 뷰 클래스 로드
        const ViewClass = await collectionInfo.viewClassLoader();
        
        // 인스턴스 생성
        const collection = new ViewClass(this.controller, collectionInfo.config);
        
        // 캐시에 저장
        this.loadedCollections.set(type, collection);
        collectionInfo.isLoaded = true;
        
        // 컬렉션 로드 완료
        return collection;
    }
    
    /**
     * 현재 컬렉션을 정리합니다
     */
    cleanupCurrentCollection() {
        if (this.currentCollection && this.loadedCollections.has(this.currentCollection)) {
            const collection = this.loadedCollections.get(this.currentCollection);
            if (collection && typeof collection.cleanup === 'function') {
                collection.cleanup();
            }
        }
    }
    
    /**
     * 탭 상태를 업데이트합니다
     * @param {string} activeType - 활성화할 컬렉션 타입
     */
    updateTabStates(activeType) {
        const tabs = this.container.querySelectorAll('.collection-tab');
        tabs.forEach(tab => {
            const isActive = tab.dataset.collection === activeType;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });
        
        // 패널 ARIA 속성 업데이트
        const panel = this.container.querySelector('#collection-content');
        if (panel) {
            panel.setAttribute('aria-labelledby', `${activeType}-collection-tab`);
        }
    }
    
    /**
     * 컬렉션 개수를 가져옵니다
     * @param {string} type - 컬렉션 타입
     * @returns {number} 컬렉션 아이템 개수
     */
    getCollectionCount(type) {
        try {
            switch (type) {
                case 'countries':
                    const visitedData = this.controller.getVisitedCountries();
                    return visitedData?.visitedCountryCodes?.length || 0;
                case 'cities':
                    // 향후 구현될 메서드
                    if (typeof this.controller.getVisitedCities === 'function') {
                        return this.controller.getVisitedCities()?.length || 0;
                    }
                    return 0;
                case 'restaurants':
                    // 향후 구현될 메서드
                    if (typeof this.controller.getVisitedRestaurants === 'function') {
                        return this.controller.getVisitedRestaurants()?.length || 0;
                    }
                    return 0;
                default:
                    return 0;
            }
        } catch (error) {
            return 0;
        }
    }
    
    /**
     * 에러 상태를 표시합니다
     * @param {string} message - 에러 메시지
     */
    showError(message) {
        const contentContainer = this.container.querySelector('#collection-content');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="collection-error">
                    <div class="error-icon">⚠️</div>
                    <h3>컬렉션 로드 실패</h3>
                    <p>${message}</p>
                    <button class="retry-btn" onclick="location.reload()">다시 시도</button>
                </div>
            `;
        }
    }
    
    /**
     * 전체 에러 상태를 렌더링합니다
     * @param {Error} error - 발생한 에러
     */
    renderError(error) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="collection-manager-error">
                <div class="error-icon">⚠️</div>
                <h3>여행 도감을 불러올 수 없습니다</h3>
                <p>${error.message}</p>
                <button class="retry-btn" onclick="location.reload()">다시 시도</button>
            </div>
        `;
    }
    
    /**
     * 커스텀 이벤트를 발생시킵니다
     * @param {string} eventName - 이벤트 이름
     * @param {Object} detail - 이벤트 상세 정보
     */
    dispatchEvent(eventName, detail) {
        if (this.container) {
            const event = new CustomEvent(`collectionTabManager:${eventName}`, { detail });
            this.container.dispatchEvent(event);
        }
    }
    
    /**
     * 현재 활성 컬렉션을 반환합니다
     * @returns {string|null} 현재 컬렉션 타입
     */
    getCurrentCollection() {
        return this.currentCollection;
    }
    
    /**
     * 로드된 컬렉션 인스턴스를 반환합니다
     * @param {string} type - 컬렉션 타입
     * @returns {Object|null} 컬렉션 인스턴스
     */
    getCollectionInstance(type) {
        return this.loadedCollections.get(type) || null;
    }
    
    /**
     * 등록된 모든 컬렉션 타입을 반환합니다
     * @returns {Array<string>} 컬렉션 타입 배열
     */
    getRegisteredCollections() {
        return Array.from(this.collections.keys());
    }
    
    /**
     * 특정 컬렉션으로 직접 이동합니다
     * @param {string} type - 이동할 컬렉션 타입
     */
    async navigateToCollection(type) {
        await this.switchToCollection(type);
    }
    
    /**
     * 모든 컬렉션 개수를 새로고침합니다
     */
    refreshCollectionCounts() {
        const tabs = this.container.querySelectorAll('.collection-tab');
        tabs.forEach(tab => {
            const type = tab.dataset.collection;
            const countElement = tab.querySelector('.tab-count');
            const newCount = this.getCollectionCount(type);
            
            if (countElement) {
                if (newCount > 0) {
                    countElement.textContent = newCount;
                    countElement.setAttribute('aria-label', `${newCount}개 항목`);
                    countElement.style.display = '';
                } else {
                    countElement.style.display = 'none';
                }
            } else if (newCount > 0) {
                // 카운트 요소가 없는데 개수가 있다면 추가
                const labelElement = tab.querySelector('.tab-label');
                if (labelElement) {
                    labelElement.insertAdjacentHTML('afterend', 
                        `<span class="tab-count" aria-label="${newCount}개 항목">${newCount}</span>`
                    );
                }
            }
        });
    }
    
    /**
     * 리소스를 정리합니다
     */
    cleanup() {
        // 모든 로드된 컬렉션 정리
        this.loadedCollections.forEach((collection) => {
            if (collection && typeof collection.cleanup === 'function') {
                collection.cleanup();
            }
        });
        
        // 이벤트 매니저 정리
        if (this.eventManager) {
            this.eventManager.cleanup();
        }
        
        // 상태 초기화
        this.loadedCollections.clear();
        this.currentCollection = null;
        this.container = null;
        
        // 리소스 정리 완료
    }
}
