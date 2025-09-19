/**
 * MapCollectionView - 지도 기반 여행 컬렉션 뷰
 * 
 * 🎯 책임:
 * - 지도 기반 여행 현황 시각화
 * - 방문한 국가의 지도 표시
 * - 준비중 UI 제공
 * 
 * @class MapCollectionView
 * @extends BaseCollectionView
 * @version 1.0.0
 * @since 2024-12-29
 */
import { BaseCollectionView } from './BaseCollectionView.js';

export class MapCollectionView extends BaseCollectionView {
    constructor(controller, config) {
        super(controller, config);
        
        // 지도 관련 상태
        this.mapData = null;
        this.visitedCountries = [];
    }
    
    /**
     * 컬렉션 데이터를 로드합니다
     */
    async loadData() {
        try {
            // 방문한 국가 데이터 로드
            const visitedData = this.controller.getVisitedCountries();
            
            if (visitedData && visitedData.visitedCountryCodes && visitedData.visitedCountryCodes.length > 0) {
                this.visitedCountries = visitedData.visitedCountryCodes;
            } else {
                this.visitedCountries = [];
            }
            
            // 지도 데이터는 향후 구현 예정
            this.mapData = null;
        } catch (error) {
            console.error('MapCollectionView: 데이터 로드 실패:', error);
            this.visitedCountries = [];
            this.mapData = null;
        }
    }
    
    /**
     * 필터 컨트롤을 렌더링합니다 (지도에서는 사용하지 않음)
     * @returns {string} HTML 문자열
     */
    renderFilterControls() {
        return ''; // 지도에서는 필터가 필요하지 않음
    }
    
    /**
     * 정렬 컨트롤을 렌더링합니다 (지도에서는 사용하지 않음)
     * @returns {string} HTML 문자열
     */
    renderSortControls() {
        return ''; // 지도에서는 정렬이 필요하지 않음
    }
    
    /**
     * 통계 정보를 렌더링합니다
     * @returns {string} HTML 문자열
     */
    renderStats() {
        const totalCountries = 195; // 전 세계 총 국가 수
        const visitedCount = this.visitedCountries.length;
        const percentage = Math.round((visitedCount / totalCountries) * 100);
        
        return `
            <div class="map-stats">
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${visitedCount}</div>
                        <div class="stat-label">방문 국가</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${percentage}%</div>
                        <div class="stat-label">전체 진행률</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${totalCountries - visitedCount}</div>
                        <div class="stat-label">남은 국가</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 컬렉션 아이템들을 렌더링합니다 (준비중 UI)
     * @returns {string} HTML 문자열
     */
    renderItems() {
        return `
            <div class="map-container">
                <div class="map-placeholder">
                    <div class="map-icon">🗺️</div>
                    <h3>지도 기능 준비중</h3>
                    <p>방문한 국가를 지도에서 시각적으로 확인할 수 있는 기능을 준비하고 있습니다.</p>
                    <div class="coming-soon-badge">Coming Soon</div>
                </div>
                
                <!-- 향후 실제 지도가 들어갈 영역 -->
                <div class="map-canvas" id="world-map-canvas">
                    <!-- 실제 지도 구현 예정 -->
                </div>
            </div>
        `;
    }
    
    /**
     * BaseCollectionView의 추상 메서드 구현 - 필터링/정렬된 데이터 반환
     * @returns {Array} 필터링/정렬된 데이터 배열 (지도에서는 빈 배열)
     */
    getFilteredAndSortedData() {
        return []; // 지도에서는 별도의 데이터 정렬이 필요하지 않음
    }
    
    /**
     * 커스텀 이벤트를 바인딩합니다
     */
    bindCustomEvents() {
        if (!this.container) return;
        
        // 향후 지도 관련 이벤트 바인딩 예정
        // 예: 국가 클릭, 줌 인/아웃, 드래그 등
    }
    
    /**
     * 지도 초기화 (향후 구현 예정)
     */
    initializeMap() {
        // 향후 실제 지도 라이브러리 연동 예정
        console.log('지도 초기화 예정:', this.visitedCountries);
    }
    
    /**
     * 방문한 국가 데이터를 지도에 표시 (향후 구현 예정)
     * @param {Array} countries - 방문한 국가 코드 배열
     */
    updateMapWithVisitedCountries(countries) {
        // 향후 실제 지도 업데이트 로직 구현 예정
        console.log('지도 업데이트 예정:', countries);
    }
}

export default MapCollectionView;
