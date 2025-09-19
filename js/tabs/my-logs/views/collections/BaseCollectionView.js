/**
 * BaseCollectionView - 컬렉션 뷰의 공통 베이스 클래스
 * 
 * 🎯 책임:
 * - 모든 컬렉션 뷰의 공통 인터페이스 정의
 * - 공통 기능 구현 (이벤트 관리, 정리 등)
 * - 확장 가능한 아키텍처 제공
 * 
 * @abstract
 * @class BaseCollectionView
 * @version 1.0.0
 * @since 2024-12-29
 */
import { EventManager } from '../../../../modules/utils/event-manager.js';

export class BaseCollectionView {
    constructor(controller, config) {
        if (this.constructor === BaseCollectionView) {
            throw new Error("BaseCollectionView는 추상 클래스입니다. 직접 인스턴스화할 수 없습니다.");
        }
        
        this.controller = controller;
        this.config = config; // { type, icon, title, description }
        this.eventManager = new EventManager();
        this.container = null;
        this.isInitialized = false;
        
        // 공통 상태
        this.currentFilter = 'all';
        this.sortBy = 'visitCount';
        this.isLoading = false;
        this.data = [];
        
        // 메서드 바인딩
        this.bindMethods();
    }
    
    /**
     * 메서드 바인딩 (각 서브클래스에서 오버라이드)
     */
    bindMethods() {
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleSortChange = this.handleSortChange.bind(this);
        this.cleanup = this.cleanup.bind(this);
    }
    
    /**
     * 컬렉션 뷰를 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    async render(container) {
        this.container = container;
        
        try {
            this.isLoading = true;
            this.renderContent(); // 로딩 상태로 먼저 렌더링
            await this.loadData();
            this.isLoading = false; // 데이터 로드 완료 후 로딩 상태 해제
            this.renderContent(); // 데이터 로드 후 다시 렌더링
            this.bindEvents();
            this.isInitialized = true;
            
        } catch (error) {
            console.error(`${this.config.type}CollectionView: 렌더링 실패:`, error);
            this.isLoading = false; // 에러 발생 시에도 로딩 상태 해제
            this.renderError(error);
        }
    }
    
    /**
     * 컬렉션 데이터를 로드합니다 (각 서브클래스에서 구현)
     * @abstract
     */
    async loadData() {
        throw new Error('loadData() 메서드는 각 서브클래스에서 구현해야 합니다.');
    }
    
    /**
     * 컨텐츠를 렌더링합니다
     */
    renderContent() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="collection-content">
                
                <!-- 필터 및 정렬 컨트롤 (2025년 모던 디자인) -->
                <div class="modern-collection-controls">
                    <div class="controls-container">
                        ${this.renderFilterControls()}
                        ${this.renderSortControls()}
                    </div>
                </div>
                
                <!-- 컬렉션 아이템들 -->
                <div class="collection-items">
                    ${this.isLoading ? this.renderLoading() : this.renderItems()}
                </div>
            </div>
        `;
    }
    
    /**
     * 필터 컨트롤을 렌더링합니다 (각 서브클래스에서 구현)
     * @abstract
     * @returns {string} HTML 문자열
     */
    renderFilterControls() {
        throw new Error('renderFilterControls() 메서드는 각 서브클래스에서 구현해야 합니다.');
    }
    
    /**
     * 정렬 컨트롤을 렌더링합니다 (각 서브클래스에서 구현)
     * @abstract
     * @returns {string} HTML 문자열
     */
    renderSortControls() {
        throw new Error('renderSortControls() 메서드는 각 서브클래스에서 구현해야 합니다.');
    }
    
    /**
     * 통계 정보를 렌더링합니다 (각 서브클래스에서 구현)
     * @abstract
     * @returns {string} HTML 문자열
     */
    renderStats() {
        throw new Error('renderStats() 메서드는 각 서브클래스에서 구현해야 합니다.');
    }
    
    /**
     * 컬렉션 아이템들을 렌더링합니다 (각 서브클래스에서 구현)
     * @abstract
     * @returns {string} HTML 문자열
     */
    renderItems() {
        throw new Error('renderItems() 메서드는 각 서브클래스에서 구현해야 합니다.');
    }
    
    /**
     * 로딩 상태를 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderLoading() {
        return `
            <div class="loading-indicator">
                <div class="loading-spinner"></div>
                <p>컬렉션을 불러오는 중...</p>
            </div>
        `;
    }
    
    /**
     * 에러 상태를 렌더링합니다
     * @param {Error} error - 발생한 에러
     */
    renderError(error) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>컬렉션을 불러올 수 없습니다</h3>
                <p>${error.message}</p>
                <button class="retry-btn" onclick="location.reload()">다시 시도</button>
            </div>
        `;
    }
    
    /**
     * 이벤트를 바인딩합니다
     */
    bindEvents() {
        if (!this.container) return;
        
        // 필터 변경 이벤트
        const filterControls = this.container.querySelectorAll('.filter-control');
        filterControls.forEach(control => {
            this.eventManager.add(control, 'change', this.handleFilterChange);
        });
        
        // 정렬 변경 이벤트 - 실제 사용되는 클래스명으로 수정
        const sortControls = this.container.querySelectorAll('.sort-select');
        sortControls.forEach(control => {
            this.eventManager.add(control, 'change', this.handleSortChange);
        });
        
        // 각 서브클래스별 추가 이벤트 바인딩
        this.bindCustomEvents();
    }
    
    /**
     * 커스텀 이벤트를 바인딩합니다 (각 서브클래스에서 구현)
     */
    bindCustomEvents() {
        // 기본 구현 없음, 필요시 오버라이드
    }
    
    /**
     * 필터 변경을 처리합니다
     * @param {Event} e - 변경 이벤트
     */
    handleFilterChange(e) {
        this.currentFilter = e.target.value;
        this.updateItems();
    }
    
    /**
     * 정렬 변경을 처리합니다
     * @param {Event} e - 변경 이벤트
     */
    handleSortChange(e) {
        this.sortBy = e.target.value;
        this.updateItems();
    }
    
    /**
     * 아이템 목록을 업데이트합니다
     */
    updateItems() {
        const itemsContainer = this.container?.querySelector('.collection-items');
        if (itemsContainer) {
            itemsContainer.innerHTML = this.renderItems();
            
            // 업데이트 후 이벤트 재바인딩
            this.bindCustomEvents();
        }
    }
    
    /**
     * 컬렉션별 데이터를 필터링하고 정렬합니다 (각 서브클래스에서 구현)
     * @abstract
     * @returns {Array} 필터링/정렬된 데이터 배열
     */
    getFilteredAndSortedData() {
        throw new Error('getFilteredAndSortedData() 메서드는 각 서브클래스에서 구현해야 합니다.');
    }
    
    /**
     * 커스텀 이벤트를 발생시킵니다
     * @param {string} eventName - 이벤트 이름
     * @param {Object} detail - 이벤트 상세 정보
     */
    dispatchEvent(eventName, detail) {
        if (this.container) {
            const event = new CustomEvent(`${this.config.type}Collection:${eventName}`, { detail });
            this.container.dispatchEvent(event);
        }
    }
    
    /**
     * 리소스를 정리합니다
     */
    cleanup() {
        if (this.eventManager) {
            this.eventManager.cleanup();
        }
        
        this.container = null;
        this.isInitialized = false;
        
        console.log(`${this.config.type}CollectionView: 리소스 정리 완료`);
    }
    
    /**
     * 현재 설정된 필터를 반환합니다
     * @returns {string} 현재 필터
     */
    getCurrentFilter() {
        return this.currentFilter;
    }
    
    /**
     * 현재 설정된 정렬 방식을 반환합니다
     * @returns {string} 현재 정렬 방식
     */
    getCurrentSort() {
        return this.sortBy;
    }
    
    /**
     * 컬렉션 데이터를 반환합니다
     * @returns {Array} 컬렉션 데이터
     */
    getData() {
        return this.data;
    }
    
    /**
     * 컬렉션 타입을 반환합니다
     * @returns {string} 컬렉션 타입
     */
    getType() {
        return this.config.type;
    }
}
