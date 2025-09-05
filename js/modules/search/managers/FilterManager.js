/**
 * 필터 관리자
 * 검색 필터 상태와 적용/초기화 로직을 담당
 */

import { DEFAULT_FILTERS } from '../utils/SearchConstants.js';

export class FilterManager {
    constructor() {
        this.filters = { ...DEFAULT_FILTERS };
    }

    /**
     * 필터를 가져옵니다
     * @returns {Object} 현재 필터 상태
     */
    getFilters() {
        return { ...this.filters };
    }

    /**
     * 특정 필터를 설정합니다
     * @param {string} key - 필터 키
     * @param {*} value - 필터 값
     */
    setFilter(key, value) {
        if (key in this.filters) {
            this.filters[key] = value;
        } else {
            console.warn(`알 수 없는 필터 키: ${key}`);
        }
    }

    /**
     * 대륙 필터를 설정합니다
     * @param {Array} continents - 선택된 대륙 배열
     */
    setContinentFilter(continents) {
        this.filters.continent = Array.isArray(continents) ? continents : [];
    }

    /**
     * 목적 필터를 설정합니다
     * @param {string} purpose - 선택된 목적
     */
    setPurposeFilter(purpose) {
        this.filters.purpose = purpose || '';
    }

    /**
     * 여행 스타일 필터를 설정합니다
     * @param {Array|string} travelStyles - 선택된 여행 스타일들 (배열 또는 문자열)
     */
    setTravelStyleFilter(travelStyles) {
        if (Array.isArray(travelStyles)) {
            this.filters.travelStyle = travelStyles;
        } else {
            this.filters.travelStyle = travelStyles ? [travelStyles] : [];
        }
    }

    /**
     * 별점 필터를 설정합니다
     * @param {number} rating - 최소 별점
     */
    setRatingFilter(rating) {
        this.filters.rating = rating || '';
    }

    /**
     * 날짜 범위 필터를 설정합니다
     * @param {Object} dateRange - 날짜 범위 {start, end}
     */
    setDateRangeFilter(dateRange) {
        this.filters.dateRange = {
            start: dateRange?.start || '',
            end: dateRange?.end || ''
        };
    }

    /**
     * 필터를 초기화합니다
     */
    resetFilters() {
        this.filters = { ...DEFAULT_FILTERS };
    }

    /**
     * 필터가 설정되어 있는지 확인합니다
     * @returns {boolean} 필터 설정 여부
     */
    hasActiveFilters() {
        return (
            this.filters.continent.length > 0 ||
            this.filters.purpose !== '' ||
            this.filters.travelStyle.length > 0 ||
            this.filters.rating !== '' ||
            this.filters.dateRange.start !== '' ||
            this.filters.dateRange.end !== ''
        );
    }

    /**
     * 특정 필터가 설정되어 있는지 확인합니다
     * @param {string} key - 필터 키
     * @returns {boolean} 필터 설정 여부
     */
    hasFilter(key) {
        if (key === 'continent') {
            return this.filters.continent.length > 0;
        } else if (key === 'dateRange') {
            return this.filters.dateRange.start !== '' || this.filters.dateRange.end !== '';
        } else {
            return this.filters[key] !== '' && this.filters[key] !== null && this.filters[key] !== undefined;
        }
    }

    /**
     * 필터를 UI에서 읽어와서 설정합니다
     * @param {HTMLElement} container - 필터 컨테이너 요소
     */
    loadFiltersFromUI(container) {
        try {
            // 대륙 필터
            const continentCheckboxes = container.querySelectorAll('input[name="continent"]:checked');
            const selectedContinents = Array.from(continentCheckboxes).map(cb => cb.value);
            this.setContinentFilter(selectedContinents);

            // 목적 필터
            const purposeCheckbox = container.querySelector('input[name="purpose"]:checked');
            this.setPurposeFilter(purposeCheckbox ? purposeCheckbox.value : '');

            // 여행 스타일 필터 (체크박스 - 여러 개 선택 가능)
            const styleCheckboxes = container.querySelectorAll('input[name="travel-style"]:checked');
            const selectedStyles = Array.from(styleCheckboxes).map(cb => cb.value);
            this.setTravelStyleFilter(selectedStyles);

            // 별점 필터
            const ratingStars = container.querySelectorAll('#search-star-rating .star.filled');
            const rating = ratingStars.length > 0 ? ratingStars.length : '';
            this.setRatingFilter(rating);

            // 날짜 범위 필터
            const startDate = container.querySelector('#start-date')?.value || '';
            const endDate = container.querySelector('#end-date')?.value || '';
            this.setDateRangeFilter({ start: startDate, end: endDate });

        } catch (error) {
            console.error('UI에서 필터 로드 오류:', error);
        }
    }

    /**
     * 필터를 UI에 적용합니다
     * @param {HTMLElement} container - 필터 컨테이너 요소
     */
    applyFiltersToUI(container) {
        try {
            // 대륙 필터 적용
            const continentCheckboxes = container.querySelectorAll('input[name="continent"]');
            continentCheckboxes.forEach(cb => {
                cb.checked = this.filters.continent.includes(cb.value);
            });

            // 목적 필터 적용
            const purposeCheckboxes = container.querySelectorAll('input[name="purpose"]');
            purposeCheckboxes.forEach(cb => {
                cb.checked = cb.value === this.filters.purpose;
            });

            // 여행 스타일 필터 적용 (체크박스 - 여러 개 선택 가능)
            const styleCheckboxes = container.querySelectorAll('input[name="travel-style"]');
            styleCheckboxes.forEach(cb => {
                cb.checked = this.filters.travelStyle.includes(cb.value);
            });

            // 별점 필터 적용
            const stars = container.querySelectorAll('#search-star-rating .star');
            const rating = parseInt(this.filters.rating) || 0;
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.classList.add('filled');
                } else {
                    star.classList.remove('filled');
                }
            });

            // 날짜 범위 필터 적용
            const startDateInput = container.querySelector('#start-date');
            const endDateInput = container.querySelector('#end-date');
            if (startDateInput) startDateInput.value = this.filters.dateRange.start;
            if (endDateInput) endDateInput.value = this.filters.dateRange.end;

        } catch (error) {
            console.error('UI에 필터 적용 오류:', error);
        }
    }

    /**
     * 필터 정보를 디버깅용으로 반환합니다
     * @returns {Object} 필터 정보
     */
    getDebugInfo() {
        return {
            filters: { ...this.filters },
            hasActiveFilters: this.hasActiveFilters()
        };
    }
}
