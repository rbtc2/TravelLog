/**
 * Stacking Context Debugger - Stacking Context 격리 문제 디버깅 도구
 * 
 * 이 모듈은 Stacking Context 격리 문제를 시각적으로 확인하고
 * 디버깅할 수 있는 도구를 제공합니다.
 * 
 * 주요 기능:
 * - Stacking Context 시각화
 * - Z-Index 값 표시
 * - 충돌 요소 하이라이트
 * - 성능 분석
 * - 개발자 도구 통합
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

class StackingContextDebugger {
    constructor() {
        this.isEnabled = false;
        this.highlightedElements = new Set();
        this.originalStyles = new Map();
        this.debugInfo = new Map();
        
        // 디버그 모드 설정 (브라우저 환경 호환)
        this.debugMode = this.isDevelopmentMode() || 
                        window.location.search.includes('debug=true') ||
                        window.location.search.includes('stacking-debug=true');
        
        this.init();
    }
    
    /**
     * 개발 모드 감지 (브라우저 환경 호환)
     * @returns {boolean} 개발 모드 여부
     */
    isDevelopmentMode() {
        // 여러 방법으로 개발 모드 감지
        return (
            // 1. URL에 localhost 또는 127.0.0.1 포함
            window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            // 2. URL에 개발 관련 키워드 포함
            window.location.href.includes('dev') ||
            window.location.href.includes('development') ||
            // 3. 파일 프로토콜 사용 (로컬 파일)
            window.location.protocol === 'file:' ||
            // 4. 개발자 도구가 열려있는지 확인 (간접적)
            this.isDevToolsOpen()
        );
    }
    
    /**
     * 개발자 도구가 열려있는지 간접적으로 감지
     * @returns {boolean} 개발자 도구 열림 여부
     */
    isDevToolsOpen() {
        const threshold = 160;
        return (
            window.outerHeight - window.innerHeight > threshold ||
            window.outerWidth - window.innerWidth > threshold
        );
    }
    
    /**
     * Stacking Context Debugger 초기화
     */
    init() {
        if (!this.debugMode) {
            console.log('Stacking Context Debugger는 개발 모드에서만 활성화됩니다.');
            return;
        }
        
        console.log('Stacking Context Debugger 초기화...');
        
        // 전역 함수 등록
        this.registerGlobalFunctions();
        
        // CSS 스타일 추가
        this.addDebugStyles();
        
        console.log('Stacking Context Debugger 초기화 완료');
        console.log('사용법: window.debugStackingContexts() 또는 window.showZIndexInfo()');
    }
    
    /**
     * 전역 함수 등록
     */
    registerGlobalFunctions() {
        window.debugStackingContexts = this.highlightStackingContexts.bind(this);
        window.showZIndexInfo = this.showZIndexInfo.bind(this);
        window.clearStackingContextDebug = this.clearHighlights.bind(this);
        window.analyzeStackingContexts = this.analyzeStackingContexts.bind(this);
        window.findStackingContextConflicts = this.findStackingContextConflicts.bind(this);
        window.enableStackingContextDebug = this.enableDebugMode.bind(this);
        window.disableStackingContextDebug = this.disableDebugMode.bind(this);
    }
    
    /**
     * 디버그용 CSS 스타일 추가
     */
    addDebugStyles() {
        const styleId = 'stacking-context-debug-styles';
        
        // 기존 스타일 제거
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Stacking Context 디버그 스타일 */
            .sc-debug-highlight {
                outline: 3px solid #ff0000 !important;
                outline-offset: 3px !important;
                position: relative !important;
            }
            
            .sc-debug-highlight::before {
                content: attr(data-sc-info);
                position: absolute;
                top: -25px;
                left: 0;
                background: rgba(255, 0, 0, 0.9);
                color: white;
                padding: 2px 6px;
                font-size: 10px;
                border-radius: 3px;
                z-index: 99999;
                white-space: nowrap;
                font-family: monospace;
            }
            
            .sc-debug-z-index {
                outline: 3px solid #00ff00 !important;
                outline-offset: 3px !important;
            }
            
            .sc-debug-z-index::after {
                content: "z-index: " attr(data-z-index);
                position: absolute;
                top: -25px;
                right: 0;
                background: rgba(0, 255, 0, 0.9);
                color: white;
                padding: 2px 6px;
                font-size: 10px;
                border-radius: 3px;
                z-index: 99999;
                white-space: nowrap;
                font-family: monospace;
            }
            
            .sc-debug-conflict {
                outline: 3px solid #ffff00 !important;
                outline-offset: 3px !important;
                animation: sc-conflict-pulse 1s infinite;
            }
            
            @keyframes sc-conflict-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .sc-debug-info-panel {
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 15px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 12px;
                max-width: 300px;
                z-index: 99999;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .sc-debug-info-panel h3 {
                margin: 0 0 10px 0;
                color: #00ff00;
            }
            
            .sc-debug-info-panel .info-item {
                margin: 5px 0;
                padding: 3px 0;
                border-bottom: 1px solid #333;
            }
            
            .sc-debug-info-panel .info-label {
                color: #ffff00;
                font-weight: bold;
            }
            
            .sc-debug-info-panel .info-value {
                color: #ffffff;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Stacking Context 하이라이트
     */
    highlightStackingContexts() {
        console.log('Stacking Context 하이라이트 시작...');
        
        // 기존 하이라이트 제거
        this.clearHighlights();
        
        const elements = document.querySelectorAll('*');
        let stackingContextCount = 0;
        
        elements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const zIndex = computedStyle.zIndex;
            const position = computedStyle.position;
            const transform = computedStyle.transform;
            const opacity = computedStyle.opacity;
            const filter = computedStyle.filter;
            const willChange = computedStyle.willChange;
            
            // Stacking Context 생성 조건 확인
            const createsStackingContext = this.createsStackingContext(element, computedStyle);
            
            if (createsStackingContext) {
                stackingContextCount++;
                
                // 하이라이트 적용
                element.classList.add('sc-debug-highlight');
                this.highlightedElements.add(element);
                
                // 정보 수집
                const info = {
                    element,
                    zIndex: zIndex !== 'auto' ? zIndex : 'auto',
                    position,
                    transform: transform !== 'none' ? 'has-transform' : 'none',
                    opacity: opacity !== '1' ? opacity : '1',
                    filter: filter !== 'none' ? 'has-filter' : 'none',
                    willChange: willChange !== 'auto' ? willChange : 'auto',
                    tagName: element.tagName,
                    className: element.className,
                    id: element.id
                };
                
                this.debugInfo.set(element, info);
                
                // 정보 표시
                const infoText = `SC-${stackingContextCount}: z-${zIndex}`;
                element.setAttribute('data-sc-info', infoText);
                
                console.log(`Stacking Context ${stackingContextCount}:`, {
                    element: element.tagName + (element.id ? '#' + element.id : '') + (element.className ? '.' + element.className.split(' ').join('.') : ''),
                    zIndex,
                    position,
                    reason: this.getStackingContextReason(computedStyle)
                });
            }
        });
        
        console.log(`총 ${stackingContextCount}개의 Stacking Context 발견`);
        
        // 정보 패널 표시
        this.showInfoPanel(stackingContextCount);
        
        return stackingContextCount;
    }
    
    /**
     * Stacking Context 생성 여부 확인
     * @param {HTMLElement} element - 요소
     * @param {CSSStyleDeclaration} computedStyle - 계산된 스타일
     * @returns {boolean} Stacking Context 생성 여부
     */
    createsStackingContext(element, computedStyle) {
        const zIndex = computedStyle.zIndex;
        const position = computedStyle.position;
        const transform = computedStyle.transform;
        const opacity = computedStyle.opacity;
        const filter = computedStyle.filter;
        const willChange = computedStyle.willChange;
        const isolation = computedStyle.isolation;
        
        // isolation: isolate
        if (isolation === 'isolate') {
            return true;
        }
        
        // position이 static이 아니고 z-index가 auto가 아닌 경우
        if (position !== 'static' && zIndex !== 'auto') {
            return true;
        }
        
        // position이 fixed 또는 sticky인 경우
        if (position === 'fixed' || position === 'sticky') {
            return true;
        }
        
        // transform이 none이 아닌 경우
        if (transform !== 'none') {
            return true;
        }
        
        // opacity가 1보다 작은 경우
        if (parseFloat(opacity) < 1) {
            return true;
        }
        
        // filter가 none이 아닌 경우
        if (filter !== 'none') {
            return true;
        }
        
        // will-change가 transform, opacity, filter 중 하나인 경우
        if (willChange && ['transform', 'opacity', 'filter'].some(prop => willChange.includes(prop))) {
            return true;
        }
        
        // flex 또는 grid 컨테이너의 자식 요소
        const parent = element.parentElement;
        if (parent) {
            const parentStyle = window.getComputedStyle(parent);
            const display = parentStyle.display;
            if (display.includes('flex') || display.includes('grid')) {
                const order = computedStyle.order;
                if (order !== '0') {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Stacking Context 생성 이유 반환
     * @param {CSSStyleDeclaration} computedStyle - 계산된 스타일
     * @returns {string} 생성 이유
     */
    getStackingContextReason(computedStyle) {
        const zIndex = computedStyle.zIndex;
        const position = computedStyle.position;
        const transform = computedStyle.transform;
        const opacity = computedStyle.opacity;
        const filter = computedStyle.filter;
        const isolation = computedStyle.isolation;
        
        if (isolation === 'isolate') {
            return 'isolation: isolate';
        }
        
        if (position !== 'static' && zIndex !== 'auto') {
            return `position: ${position}, z-index: ${zIndex}`;
        }
        
        if (position === 'fixed' || position === 'sticky') {
            return `position: ${position}`;
        }
        
        if (transform !== 'none') {
            return 'transform property';
        }
        
        if (parseFloat(opacity) < 1) {
            return `opacity: ${opacity}`;
        }
        
        if (filter !== 'none') {
            return 'filter property';
        }
        
        return 'unknown';
    }
    
    /**
     * Z-Index 정보 표시
     */
    showZIndexInfo() {
        console.log('Z-Index 정보 수집 중...');
        
        const elements = document.querySelectorAll('*');
        const zIndexElements = [];
        
        elements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const zIndex = computedStyle.zIndex;
            
            if (zIndex !== 'auto') {
                zIndexElements.push({
                    element,
                    zIndex: parseInt(zIndex),
                    tagName: element.tagName,
                    id: element.id,
                    className: element.className,
                    position: computedStyle.position
                });
            }
        });
        
        // Z-Index 순으로 정렬
        zIndexElements.sort((a, b) => a.zIndex - b.zIndex);
        
        console.log('Z-Index 정보:');
        zIndexElements.forEach(({ element, zIndex, tagName, id, className, position }) => {
            const identifier = `${tagName}${id ? '#' + id : ''}${className ? '.' + className.split(' ').join('.') : ''}`;
            console.log(`z-index: ${zIndex} - ${identifier} (position: ${position})`);
            
            // 하이라이트 적용
            element.classList.add('sc-debug-z-index');
            element.setAttribute('data-z-index', zIndex);
            this.highlightedElements.add(element);
        });
        
        return zIndexElements;
    }
    
    /**
     * Stacking Context 분석
     */
    analyzeStackingContexts() {
        console.log('Stacking Context 분석 시작...');
        
        const analysis = {
            totalElements: 0,
            stackingContexts: 0,
            zIndexElements: 0,
            conflicts: [],
            recommendations: []
        };
        
        const elements = document.querySelectorAll('*');
        analysis.totalElements = elements.length;
        
        elements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            
            // Stacking Context 확인
            if (this.createsStackingContext(element, computedStyle)) {
                analysis.stackingContexts++;
            }
            
            // Z-Index 확인
            if (computedStyle.zIndex !== 'auto') {
                analysis.zIndexElements++;
            }
        });
        
        // 충돌 분석
        analysis.conflicts = this.findStackingContextConflicts();
        
        // 권장사항 생성
        analysis.recommendations = this.generateRecommendations(analysis);
        
        console.log('Stacking Context 분석 결과:', analysis);
        
        return analysis;
    }
    
    /**
     * Stacking Context 충돌 찾기
     */
    findStackingContextConflicts() {
        const conflicts = [];
        const stackingContexts = [];
        
        // 모든 Stacking Context 수집
        document.querySelectorAll('*').forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            if (this.createsStackingContext(element, computedStyle)) {
                const rect = element.getBoundingClientRect();
                stackingContexts.push({
                    element,
                    zIndex: parseInt(computedStyle.zIndex) || 0,
                    rect,
                    computedStyle
                });
            }
        });
        
        // 충돌 확인
        for (let i = 0; i < stackingContexts.length; i++) {
            for (let j = i + 1; j < stackingContexts.length; j++) {
                const sc1 = stackingContexts[i];
                const sc2 = stackingContexts[j];
                
                // 요소들이 겹치는지 확인
                if (this.elementsOverlap(sc1.rect, sc2.rect)) {
                    // Z-Index가 비슷한 경우 충돌로 간주
                    if (Math.abs(sc1.zIndex - sc2.zIndex) < 10) {
                        conflicts.push({
                            element1: sc1.element,
                            element2: sc2.element,
                            zIndex1: sc1.zIndex,
                            zIndex2: sc2.zIndex,
                            overlap: this.calculateOverlap(sc1.rect, sc2.rect)
                        });
                        
                        // 충돌 요소 하이라이트
                        sc1.element.classList.add('sc-debug-conflict');
                        sc2.element.classList.add('sc-debug-conflict');
                        this.highlightedElements.add(sc1.element);
                        this.highlightedElements.add(sc2.element);
                    }
                }
            }
        }
        
        return conflicts;
    }
    
    /**
     * 두 요소가 겹치는지 확인
     * @param {DOMRect} rect1 - 첫 번째 요소의 위치
     * @param {DOMRect} rect2 - 두 번째 요소의 위치
     * @returns {boolean} 겹치는지 여부
     */
    elementsOverlap(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
    
    /**
     * 두 요소의 겹침 정도 계산
     * @param {DOMRect} rect1 - 첫 번째 요소의 위치
     * @param {DOMRect} rect2 - 두 번째 요소의 위치
     * @returns {number} 겹침 정도 (0-1)
     */
    calculateOverlap(rect1, rect2) {
        const overlapLeft = Math.max(rect1.left, rect2.left);
        const overlapRight = Math.min(rect1.right, rect2.right);
        const overlapTop = Math.max(rect1.top, rect2.top);
        const overlapBottom = Math.min(rect1.bottom, rect2.bottom);
        
        if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
            return 0;
        }
        
        const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
        const elementArea = (rect1.right - rect1.left) * (rect1.bottom - rect1.top);
        
        return overlapArea / elementArea;
    }
    
    /**
     * 권장사항 생성
     * @param {Object} analysis - 분석 결과
     * @returns {Array} 권장사항 배열
     */
    generateRecommendations(analysis) {
        const recommendations = [];
        
        if (analysis.stackingContexts > 20) {
            recommendations.push('Stacking Context가 너무 많습니다. 불필요한 position 속성을 제거하세요.');
        }
        
        if (analysis.zIndexElements > 10) {
            recommendations.push('Z-Index를 사용하는 요소가 많습니다. CSS 변수를 사용한 중앙 관리 시스템을 고려하세요.');
        }
        
        if (analysis.conflicts.length > 0) {
            recommendations.push(`${analysis.conflicts.length}개의 충돌이 발견되었습니다. Portal 패턴을 사용하여 해결하세요.`);
        }
        
        if (analysis.stackingContexts / analysis.totalElements > 0.1) {
            recommendations.push('Stacking Context 비율이 높습니다. CSS Isolation을 신중하게 사용하세요.');
        }
        
        return recommendations;
    }
    
    /**
     * 정보 패널 표시
     * @param {number} stackingContextCount - Stacking Context 개수
     */
    showInfoPanel(stackingContextCount) {
        // 기존 패널 제거
        const existingPanel = document.getElementById('sc-debug-info-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        const panel = document.createElement('div');
        panel.id = 'sc-debug-info-panel';
        panel.className = 'sc-debug-info-panel';
        
        const analysis = this.analyzeStackingContexts();
        
        panel.innerHTML = `
            <h3>Stacking Context Debug</h3>
            <div class="info-item">
                <span class="info-label">총 요소:</span>
                <span class="info-value">${analysis.totalElements}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Stacking Context:</span>
                <span class="info-value">${stackingContextCount}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Z-Index 요소:</span>
                <span class="info-value">${analysis.zIndexElements}</span>
            </div>
            <div class="info-item">
                <span class="info-label">충돌:</span>
                <span class="info-value">${analysis.conflicts.length}</span>
            </div>
            <div class="info-item">
                <span class="info-label">권장사항:</span>
                <span class="info-value">${analysis.recommendations.length}개</span>
            </div>
            <div style="margin-top: 10px;">
                <button onclick="window.clearStackingContextDebug()" style="padding: 5px 10px; margin-right: 5px;">정리</button>
                <button onclick="window.analyzeStackingContexts()" style="padding: 5px 10px;">분석</button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // 10초 후 자동 제거
        setTimeout(() => {
            if (panel.parentNode) {
                panel.parentNode.removeChild(panel);
            }
        }, 10000);
    }
    
    /**
     * 하이라이트 제거
     */
    clearHighlights() {
        this.highlightedElements.forEach(element => {
            element.classList.remove('sc-debug-highlight', 'sc-debug-z-index', 'sc-debug-conflict');
            element.removeAttribute('data-sc-info');
            element.removeAttribute('data-z-index');
        });
        
        this.highlightedElements.clear();
        this.debugInfo.clear();
        
        // 정보 패널 제거
        const panel = document.getElementById('sc-debug-info-panel');
        if (panel) {
            panel.remove();
        }
        
        console.log('Stacking Context 디버그 하이라이트 제거됨');
    }
    
    /**
     * 디버그 모드 수동 활성화
     */
    enableDebugMode() {
        this.debugMode = true;
        console.log('Stacking Context Debugger 활성화됨');
        console.log('사용 가능한 명령어:');
        console.log('- window.debugStackingContexts() : Stacking Context 하이라이트');
        console.log('- window.showZIndexInfo() : Z-Index 정보 표시');
        console.log('- window.analyzeStackingContexts() : 종합 분석');
        console.log('- window.findStackingContextConflicts() : 충돌 감지');
        console.log('- window.clearStackingContextDebug() : 하이라이트 정리');
    }
    
    /**
     * 디버그 모드 수동 비활성화
     */
    disableDebugMode() {
        this.debugMode = false;
        this.clearHighlights();
        console.log('Stacking Context Debugger 비활성화됨');
    }
    
    /**
     * 성능 분석
     */
    analyzePerformance() {
        const startTime = performance.now();
        
        // Stacking Context 분석 실행
        this.highlightStackingContexts();
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`Stacking Context 분석 소요 시간: ${duration.toFixed(2)}ms`);
        
        return {
            duration,
            elementsAnalyzed: document.querySelectorAll('*').length,
            stackingContextsFound: this.highlightedElements.size
        };
    }
}

// 전역 인스턴스 생성
window.stackingContextDebugger = new StackingContextDebugger();

// 모듈 내보내기
export default StackingContextDebugger;
