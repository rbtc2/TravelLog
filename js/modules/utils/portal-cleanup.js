/**
 * Portal 정리 유틸리티
 * 탭 전환 시 남아있는 Portal 요소들을 강제로 정리
 * 
 * @version 1.0.0
 * @since 2024-12-29
 * @author REDIPX
 */

// z-index-manager와의 통합을 위한 전역 참조
let zIndexManager = null;

export class PortalCleanup {
    constructor() {
        this.portalSelectors = [
            '.city-selector-portal',
            '.country-selector-portal',
            '.selector-portal'
        ];
        
        // z-index-manager 참조 설정
        this.setZIndexManagerReference();
    }
    
    /**
     * z-index-manager 참조 설정
     */
    setZIndexManagerReference() {
        // 전역 z-index-manager 인스턴스 찾기
        if (window.zIndexManager) {
            zIndexManager = window.zIndexManager;
        } else {
            // 약간의 지연 후 다시 시도
            setTimeout(() => {
                if (window.zIndexManager) {
                    zIndexManager = window.zIndexManager;
                }
            }, 100);
        }
    }
    
    /**
     * 모든 Portal 요소 강제 정리
     */
    cleanupAllPortals() {
        console.log('Portal 정리 시작...');
        
        this.portalSelectors.forEach(selector => {
            const portals = document.querySelectorAll(selector);
            portals.forEach(portal => {
                try {
                    // z-index-manager에서 Portal 요소 unwatch
                    this.unwatchPortalFromZIndexManager(portal);
                    
                    // 드롭다운이 열려있다면 강제로 닫기
                    const dropdown = portal.querySelector('.selector-dropdown');
                    if (dropdown && dropdown.classList.contains('open')) {
                        dropdown.classList.remove('open');
                        dropdown.style.display = 'none';
                        
                        // z-index-manager에서 드롭다운 요소도 unwatch
                        this.unwatchPortalFromZIndexManager(dropdown);
                    }
                    
                    // Portal 제거
                    if (portal.parentNode) {
                        portal.parentNode.removeChild(portal);
                        console.log(`Portal 제거됨: ${selector}`);
                    }
                } catch (error) {
                    console.warn(`Portal 제거 실패 (${selector}):`, error);
                }
            });
        });
        
        console.log('Portal 정리 완료');
    }
    
    /**
     * 특정 Portal 정리
     * @param {string} selector - Portal 선택자
     */
    cleanupPortal(selector) {
        const portals = document.querySelectorAll(selector);
        portals.forEach(portal => {
            try {
                // 드롭다운이 열려있다면 강제로 닫기
                const dropdown = portal.querySelector('.selector-dropdown');
                if (dropdown && dropdown.classList.contains('open')) {
                    dropdown.classList.remove('open');
                    dropdown.style.display = 'none';
                }
                
                // Portal 제거
                if (portal.parentNode) {
                    portal.parentNode.removeChild(portal);
                    console.log(`Portal 제거됨: ${selector}`);
                }
            } catch (error) {
                console.warn(`Portal 제거 실패 (${selector}):`, error);
            }
        });
    }
    
    /**
     * 열린 드롭다운 강제 닫기
     */
    closeAllDropdowns() {
        const openDropdowns = document.querySelectorAll('.selector-dropdown.open');
        openDropdowns.forEach(dropdown => {
            try {
                dropdown.classList.remove('open');
                dropdown.style.display = 'none';
                
                // 접근성 속성 설정
                dropdown.setAttribute('aria-hidden', 'true');
                
                // 부모 Portal의 접근성 속성도 설정
                const portal = dropdown.closest('.city-selector-portal, .country-selector-portal');
                if (portal) {
                    portal.setAttribute('aria-hidden', 'true');
                }
                
                console.log('드롭다운 강제 닫기 완료');
            } catch (error) {
                console.warn('드롭다운 닫기 실패:', error);
            }
        });
    }
    
    /**
     * z-index-manager에서 Portal 요소 unwatch
     * @param {HTMLElement} element - unwatch할 요소
     */
    unwatchPortalFromZIndexManager(element) {
        if (!zIndexManager || !element) {
            return;
        }
        
        try {
            // z-index-manager의 unwatchElement 메서드 호출
            if (typeof zIndexManager.unwatchElement === 'function') {
                zIndexManager.unwatchElement(element);
                console.log('z-index-manager에서 요소 unwatch:', element);
            }
        } catch (error) {
            console.warn('z-index-manager unwatch 실패:', error);
        }
    }
    
    /**
     * Portal 상태 확인
     * @returns {Object} Portal 상태 정보
     */
    getPortalStatus() {
        const status = {
            totalPortals: 0,
            openDropdowns: 0,
            portals: []
        };
        
        this.portalSelectors.forEach(selector => {
            const portals = document.querySelectorAll(selector);
            status.totalPortals += portals.length;
            
            portals.forEach(portal => {
                const dropdown = portal.querySelector('.selector-dropdown');
                const isOpen = dropdown && dropdown.classList.contains('open');
                
                if (isOpen) {
                    status.openDropdowns++;
                }
                
                status.portals.push({
                    selector,
                    isOpen,
                    element: portal
                });
            });
        });
        
        return status;
    }
}

// 전역 인스턴스
export const portalCleanup = new PortalCleanup();

// 전역 함수로도 사용 가능
export function cleanupAllPortals() {
    portalCleanup.cleanupAllPortals();
}

export function closeAllDropdowns() {
    portalCleanup.closeAllDropdowns();
}

// 페이지 언로드 시 Portal 정리
window.addEventListener('beforeunload', () => {
    portalCleanup.cleanupAllPortals();
});

// 페이지 숨김 시 Portal 정리 (모바일에서 앱 전환 시)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        portalCleanup.closeAllDropdowns();
    }
});

// 전역 함수로 노출 (디버깅용)
window.portalCleanup = portalCleanup;
