/**
 * 페이지네이션 관리 모듈
 * 페이지네이션 UI 생성 및 관리 로직을 분리
 */

export class PaginationManager {
    constructor() {
        this.maxVisiblePages = 5;
    }

    /**
     * 페이지네이션을 렌더링합니다
     * @param {number} totalPages - 전체 페이지 수
     * @param {number} currentPage - 현재 페이지
     * @returns {string} HTML 문자열
     */
    renderPagination(totalPages, currentPage) {
        if (totalPages <= 1) return '';
        
        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(this.maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + this.maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < this.maxVisiblePages) {
            startPage = Math.max(1, endPage - this.maxVisiblePages + 1);
        }
        
        // 이전 페이지 버튼
        if (currentPage > 1) {
            pages.push(`<button class="page-btn prev-page" data-page="${currentPage - 1}">◀ 이전</button>`);
        }
        
        // 페이지 번호들
        for (let i = startPage; i <= endPage; i++) {
            pages.push(`
                <button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `);
        }
        
        // 다음 페이지 버튼
        if (currentPage < totalPages) {
            pages.push(`<button class="page-btn next-page" data-page="${currentPage + 1}">다음 ▶</button>`);
        }
        
        return `
            <div class="pagination">
                ${pages.join('')}
            </div>
        `;
    }

    /**
     * 페이지네이션 버튼에 이벤트를 바인딩합니다
     * @param {Object} eventManager - EventManager 인스턴스
     * @param {Function} onPageChange - 페이지 변경 시 호출할 콜백 함수
     */
    bindPaginationEvents(eventManager, onPageChange) {
        const pageBtns = document.querySelectorAll('.page-btn');
        pageBtns.forEach(btn => {
            eventManager.add(btn, 'click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                if (page && onPageChange) {
                    onPageChange(page);
                }
            });
        });
    }

    /**
     * 페이지네이션 정보를 계산합니다
     * @param {number} totalItems - 전체 아이템 수
     * @param {number} itemsPerPage - 페이지당 아이템 수
     * @param {number} currentPage - 현재 페이지
     * @returns {Object} 페이지네이션 정보
     */
    calculatePaginationInfo(totalItems, itemsPerPage, currentPage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
        
        return {
            totalPages,
            currentPage,
            startIndex,
            endIndex,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            totalItems,
            itemsPerPage
        };
    }

    /**
     * 페이지네이션 설정을 변경합니다
     * @param {number} maxVisiblePages - 최대 표시 페이지 수
     */
    setMaxVisiblePages(maxVisiblePages) {
        this.maxVisiblePages = maxVisiblePages;
    }

    /**
     * 현재 페이지네이션 설정을 반환합니다
     * @returns {Object} 페이지네이션 설정
     */
    getPaginationConfig() {
        return {
            maxVisiblePages: this.maxVisiblePages
        };
    }
}
