/**
 * 검색 이벤트 핸들러
 * 검색 관련 모든 이벤트 처리를 담당
 */

import { SEARCH_STATES } from '../utils/SearchConstants.js';

export class SearchEventHandler {
    constructor() {
        this.eventListeners = [];
        this.searchInput = null;
    }

    /**
     * 이벤트 리스너를 등록합니다
     * @param {HTMLElement} element - 이벤트를 바인딩할 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러 함수
     */
    addEventListener(element, event, handler) {
        try {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        } catch (error) {
            console.error('이벤트 리스너 등록 오류:', error);
        }
    }

    /**
     * 검색 관련 이벤트들을 바인딩합니다
     * @param {Object} callbacks - 콜백 함수들
     */
    bindSearchEvents(callbacks) {
        try {
            // 검색 버튼 이벤트
            const searchBtn = document.getElementById('search-btn');
            if (searchBtn) {
                this.addEventListener(searchBtn, 'click', callbacks.handleSearch.bind(callbacks));
            }

            // 필터 토글 이벤트
            const filterToggle = document.getElementById('filter-toggle');
            if (filterToggle) {
                this.addEventListener(filterToggle, 'click', callbacks.toggleFilters.bind(callbacks));
            }

            // 필터 탭 전환 이벤트는 동적으로 바인딩 (bindFilterTabEvents 메서드 사용)

            // 별점 선택 이벤트
            this.bindSearchStarRating(callbacks);

            // 필터 적용 이벤트
            const filterApply = document.getElementById('filter-apply');
            if (filterApply) {
                this.addEventListener(filterApply, 'click', callbacks.applyFilters.bind(callbacks));
            }

            // 필터 초기화 이벤트
            const filterReset = document.getElementById('filter-reset');
            if (filterReset) {
                this.addEventListener(filterReset, 'click', callbacks.resetFilters.bind(callbacks));
            }

        } catch (error) {
            console.error('검색 이벤트 바인딩 오류:', error);
        }
    }

    /**
     * 상태별 이벤트들을 바인딩합니다
     * @param {Object} callbacks - 콜백 함수들
     * @param {string} searchState - 현재 검색 상태
     */
    bindStateEvents(callbacks, searchState) {
        try {
            // 정렬 옵션 이벤트 (검색 결과가 있을 때만)
            if (searchState === SEARCH_STATES.HAS_RESULTS) {
                const sortOptions = document.querySelectorAll('input[name="sort"]');
                sortOptions.forEach(option => {
                    this.addEventListener(option, 'change', callbacks.handleSortChange.bind(callbacks));
                });
            }

            // 재검색 버튼 이벤트 (결과 없음 상태일 때)
            if (searchState === SEARCH_STATES.NO_RESULTS) {
                const retryBtn = document.getElementById('retry-search');
                if (retryBtn) {
                    this.addEventListener(retryBtn, 'click', callbacks.handleRetrySearch.bind(callbacks));
                }
            }

            // 검색 결과 카드 클릭 이벤트 (결과 있음 상태일 때)
            if (searchState === SEARCH_STATES.HAS_RESULTS) {
                const resultItems = document.querySelectorAll('.search-result-item.clickable');
                resultItems.forEach(item => {
                    this.addEventListener(item, 'click', callbacks.handleResultItemClick.bind(callbacks));
                });
            }

        } catch (error) {
            console.error('상태별 이벤트 바인딩 오류:', error);
        }
    }

    /**
     * 상세 화면 이벤트들을 바인딩합니다
     * @param {Object} callbacks - 콜백 함수들
     */
    bindDetailEvents(callbacks) {
        try {
            // 뒤로가기 버튼 이벤트
            const backBtn = document.getElementById('back-to-logs');
            if (backBtn) {
                this.addEventListener(backBtn, 'click', callbacks.handleBackFromDetail.bind(callbacks));
            }

            // 편집 버튼 이벤트
            const editBtn = document.getElementById('edit-log-btn');
            if (editBtn) {
                this.addEventListener(editBtn, 'click', callbacks.handleLogEdit.bind(callbacks));
            }

            // 삭제 버튼 이벤트
            const deleteBtn = document.getElementById('delete-log-btn');
            if (deleteBtn) {
                this.addEventListener(deleteBtn, 'click', callbacks.handleLogDelete.bind(callbacks));
            }

        } catch (error) {
            console.error('상세 화면 이벤트 바인딩 오류:', error);
        }
    }

    /**
     * 필터 탭 이벤트를 동적으로 바인딩합니다
     * @param {Object} callbacks - 콜백 함수들
     */
    bindFilterTabEvents(callbacks) {
        try {
            console.log('🔗 필터 탭 이벤트 바인딩 시작');
            
            // 기존 필터 탭 이벤트 리스너 제거
            this.removeFilterTabEvents();
            
            // 필터 탭 전환 이벤트
            const filterTabs = document.querySelectorAll('.filter-tab');
            console.log(`발견된 필터 탭 개수: ${filterTabs.length}`);
            
            filterTabs.forEach((tab, index) => {
                const targetTab = tab.dataset.tab;
                console.log(`탭 ${index + 1}: ${targetTab}`);
                
                this.addEventListener(tab, 'click', (event) => {
                    event.preventDefault();
                    const clickedTab = event.currentTarget;
                    const targetTab = clickedTab.dataset.tab;
                    console.log(`필터 탭 클릭: ${targetTab}`);
                    
                    if (targetTab) {
                        callbacks.switchFilterTab(targetTab);
                    } else {
                        console.error('targetTab이 없습니다:', clickedTab);
                    }
                });
            });
            
            console.log('✅ 필터 탭 이벤트 바인딩 완료');
        } catch (error) {
            console.error('필터 탭 이벤트 바인딩 오류:', error);
        }
    }

    /**
     * 기존 필터 탭 이벤트 리스너를 제거합니다
     */
    removeFilterTabEvents() {
        try {
            // 필터 탭 관련 이벤트 리스너만 제거
            this.eventListeners = this.eventListeners.filter(listener => {
                if (listener.element && listener.element.classList.contains('filter-tab')) {
                    listener.element.removeEventListener(listener.event, listener.handler);
                    return false; // 제거
                }
                return true; // 유지
            });
        } catch (error) {
            console.error('필터 탭 이벤트 제거 오류:', error);
        }
    }

    /**
     * 검색 탭의 별점 컴포넌트 이벤트를 바인딩합니다
     * @param {Object} callbacks - 콜백 함수들
     */
    bindSearchStarRating(callbacks) {
        try {
            const starRating = document.getElementById('search-star-rating');
            if (!starRating) return;
            
            const stars = starRating.querySelectorAll('.star');
            
            /** @type {number} 현재 선택된 별점 */
            let currentRating = 0;
            /** @type {number} 호버 중인 별점 */
            let hoverRating = 0;
            
            // 별 클릭 이벤트
            stars.forEach((star, index) => {
                this.addEventListener(star, 'click', () => {
                    const value = index + 1;
                    
                    // 이미 선택된 별을 다시 클릭하면 선택 해제
                    if (currentRating === value) {
                        currentRating = 0;
                        callbacks.handleStarRatingChange(0);
                    } else {
                        currentRating = value;
                        callbacks.handleStarRatingChange(value);
                    }
                    
                    this.updateSearchStarDisplay(stars, hoverRating, currentRating);
                });
                
                // 호버 이벤트 (데스크탑)
                this.addEventListener(star, 'mouseenter', () => {
                    hoverRating = index + 1;
                    this.updateSearchStarDisplay(stars, hoverRating, currentRating);
                });
                
                this.addEventListener(star, 'mouseleave', () => {
                    hoverRating = 0;
                    this.updateSearchStarDisplay(stars, hoverRating, currentRating);
                });
            });
            
        } catch (error) {
            console.error('검색 별점 바인딩 오류:', error);
        }
    }

    /**
     * 별점 표시를 업데이트합니다
     * @param {NodeList} stars - 별 요소들
     * @param {number} hoverRating - 호버 중인 별점
     * @param {number} currentRating - 현재 선택된 별점
     */
    updateSearchStarDisplay(stars, hoverRating, currentRating) {
        const displayRating = hoverRating || currentRating;
        stars.forEach((star, index) => {
            if (index < displayRating) {
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
            }
        });
    }

    /**
     * 검색 입력 처리
     * @param {Event} event - 입력 이벤트
     * @param {Function} onInputChange - 입력 변경 콜백
     */
    handleSearchInput(event, onInputChange) {
        try {
            const query = event.target ? event.target.value : '';
            onInputChange(query);
        } catch (error) {
            console.error('검색 입력 처리 오류:', error);
        }
    }

    /**
     * 검색 키프레스 처리
     * @param {Event} event - 키프레스 이벤트
     * @param {Function} onSearch - 검색 콜백
     */
    handleSearchKeypress(event, onSearch) {
        if (event.key === 'Enter') {
            onSearch();
        }
    }

    /**
     * 검색 입력 필드 포커스 처리
     * @param {Event} event - 포커스 이벤트
     */
    handleSearchFocus(event) {
        try {
            const input = event.target;
            // 포커스 시 placeholder 제거
            input.setAttribute('data-original-placeholder', input.placeholder);
            input.placeholder = '';
            
            // 모바일에서 키보드가 올라올 때를 대비한 스크롤 처리
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        } catch (error) {
            console.error('검색 입력 포커스 처리 오류:', error);
        }
    }

    /**
     * 검색 입력 필드 블러 처리
     * @param {Event} event - 블러 이벤트
     */
    handleSearchBlur(event) {
        try {
            const input = event.target;
            // 입력값이 없을 때만 placeholder 복원
            if (!input.value.trim()) {
                const originalPlaceholder = input.getAttribute('data-original-placeholder');
                if (originalPlaceholder) {
                    input.placeholder = originalPlaceholder;
                }
            }
        } catch (error) {
            console.error('검색 입력 블러 처리 오류:', error);
        }
    }

    /**
     * 필터 토글 처리
     * @param {Function} onToggle - 토글 콜백
     */
    toggleFilters(onToggle) {
        try {
            onToggle();
        } catch (error) {
            console.error('필터 토글 오류:', error);
        }
    }

    /**
     * 필터 탭 전환 처리
     * @param {Event} event - 클릭 이벤트
     * @param {Function} onTabSwitch - 탭 전환 콜백
     */
    switchFilterTab(event, onTabSwitch) {
        try {
            const clickedTab = event.currentTarget;
            const targetTab = clickedTab.dataset.tab;
            onTabSwitch(targetTab);
        } catch (error) {
            console.error('필터 탭 전환 오류:', error);
        }
    }

    /**
     * 별점 변경 처리
     * @param {number} rating - 선택된 별점
     * @param {Function} onRatingChange - 별점 변경 콜백
     */
    handleStarRatingChange(rating, onRatingChange) {
        try {
            onRatingChange(rating);
        } catch (error) {
            console.error('별점 변경 처리 오류:', error);
        }
    }

    /**
     * 필터 적용 처리
     * @param {Function} onApplyFilters - 필터 적용 콜백
     */
    applyFilters(onApplyFilters) {
        try {
            onApplyFilters();
        } catch (error) {
            console.error('필터 적용 오류:', error);
        }
    }

    /**
     * 필터 초기화 처리
     * @param {Function} onResetFilters - 필터 초기화 콜백
     */
    resetFilters(onResetFilters) {
        try {
            onResetFilters();
        } catch (error) {
            console.error('필터 초기화 오류:', error);
        }
    }

    /**
     * 정렬 변경 처리
     * @param {Function} onSortChange - 정렬 변경 콜백
     */
    handleSortChange(onSortChange) {
        try {
            const selectedSort = document.querySelector('input[name="sort"]:checked');
            if (selectedSort) {
                onSortChange(selectedSort.value);
            }
        } catch (error) {
            console.error('정렬 변경 오류:', error);
        }
    }

    /**
     * 재검색 처리
     * @param {Function} onRetrySearch - 재검색 콜백
     */
    handleRetrySearch(onRetrySearch) {
        try {
            onRetrySearch();
        } catch (error) {
            console.error('재검색 처리 오류:', error);
        }
    }

    /**
     * 검색 결과 카드 클릭 처리
     * @param {Event} event - 클릭 이벤트
     * @param {Function} onResultClick - 결과 클릭 콜백
     */
    handleResultItemClick(event, onResultClick) {
        try {
            onResultClick(event);
        } catch (error) {
            console.error('검색 결과 클릭 처리 오류:', error);
        }
    }

    /**
     * 필터 탭 이벤트를 바인딩합니다
     * @param {Object} callbacks - 콜백 함수들
     */
    bindFilterTabEvents(callbacks) {
        try {
            // 필터 탭 전환 이벤트
            const filterTabs = document.querySelectorAll('.filter-tab');
            filterTabs.forEach(tab => {
                this.addEventListener(tab, 'click', (event) => {
                    const targetTab = event.currentTarget.dataset.tab;
                    if (targetTab) {
                        callbacks.switchFilterTab(targetTab);
                    } else {
                        console.error('필터 탭에 data-tab 속성이 없습니다:', event.currentTarget);
                    }
                });
            });
            
            console.log('🔗 필터 탭 이벤트 바인딩 완료');
        } catch (error) {
            console.error('필터 탭 이벤트 바인딩 오류:', error);
        }
    }

    /**
     * 상세 화면에서 뒤로가기 처리
     * @param {Function} onBackFromDetail - 뒤로가기 콜백
     */
    handleBackFromDetail(onBackFromDetail) {
        try {
            onBackFromDetail();
        } catch (error) {
            console.error('상세 화면 뒤로가기 오류:', error);
        }
    }

    /**
     * 로그 편집 처리
     * @param {Event} event - 클릭 이벤트
     * @param {Function} onLogEdit - 로그 편집 콜백
     */
    handleLogEdit(event, onLogEdit) {
        try {
            onLogEdit(event);
        } catch (error) {
            console.error('로그 편집 처리 오류:', error);
        }
    }

    /**
     * 로그 삭제 처리
     * @param {Event} event - 클릭 이벤트
     * @param {Function} onLogDelete - 로그 삭제 콜백
     */
    handleLogDelete(event, onLogDelete) {
        try {
            onLogDelete(event);
        } catch (error) {
            console.error('로그 삭제 처리 오류:', error);
        }
    }

    /**
     * 모든 이벤트 리스너를 정리합니다
     */
    cleanup() {
        try {
            console.log('🔧 검색 이벤트 핸들러 cleanup 시작');
            
            this.eventListeners.forEach(listener => {
                if (listener.element && listener.event && listener.handler) {
                    listener.element.removeEventListener(listener.event, listener.handler);
                }
            });
            
            this.eventListeners = [];
            this.searchInput = null;
            
            console.log('✅ 검색 이벤트 핸들러 cleanup 완료');
        } catch (error) {
            console.error('검색 이벤트 핸들러 정리 오류:', error);
        }
    }
}
