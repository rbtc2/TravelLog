/**
 * CSS 클래스명 검증기
 * CSS 파일 간 클래스명 충돌을 방지하기 위한 검증 도구
 * 
 * @version 1.0.0
 * @since 2024-01-15
 * @author REDIPX
 */

export const COMPONENT_NAMESPACES = {
    'country-selector': 'country-selector-container',
    'auth-manager': 'auth-screen',
    'search-tab': 'search-tab',
    'calendar-tab': 'calendar-tab',
    'my-logs-tab': 'my-logs-tab',
    'home-tab': 'home-tab',
    'add-log-tab': 'add-log-tab'
};

export const REQUIRED_DOM_STRUCTURES = {
    'country-selector': {
        container: '.country-selector-container',
        input: '.country-selector-container .selector-input',
        dropdown: '.country-selector-portal .selector-dropdown',
        portal: '.country-selector-portal'
    },
    'auth-manager': {
        screen: '.auth-screen',
        form: '.auth-screen .login-form',
        countrySelector: '.auth-screen .country-selector-container'
    },
    'search-tab': {
        container: '.search-tab',
        searchInput: '.search-tab .search-input',
        resultsContainer: '.search-tab .search-results'
    },
    'calendar-tab': {
        container: '.calendar-tab',
        calendarGrid: '.calendar-tab .calendar-grid',
        monthHeader: '.calendar-tab .month-header'
    },
    'my-logs-tab': {
        container: '.my-logs-tab',
        hubView: '.my-logs-tab .hub-view',
        logsListView: '.my-logs-tab .logs-list-view',
        settingsView: '.my-logs-tab .settings-view',
        travelReportView: '.my-logs-tab .travel-report-view',
        profileView: '.my-logs-tab .profile-view',
        travelCollectionView: '.my-logs-tab .travel-collection-view'
    }
};

export class CSSClassValidator {
    constructor() {
        this.violations = [];
        this.namespaceRules = new Map();
        this.setupNamespaceRules();
    }
    
    /**
     * 네임스페이스 규칙 설정
     */
    setupNamespaceRules() {
        // 허용된 네임스페이스 목록
        const allowedNamespaces = [
            'country-selector-container',
            'country-selector-portal',
            'auth-screen',
            'search-tab',
            'calendar-tab',
            'my-logs-tab',
            'home-tab',
            'add-log-tab',
            // My Logs 서브탭 네임스페이스
            'my-logs-tab-hub-view',
            'my-logs-tab-logs-list-view',
            'my-logs-tab-settings-view',
            'my-logs-tab-travel-report-view',
            'my-logs-tab-profile-view',
            'my-logs-tab-travel-collection-view',
            // 공통 유틸리티 클래스 (예외)
            'form-input',
            'form-label',
            'btn',
            'btn-primary',
            'btn-secondary',
            'modal',
            'modal-backdrop',
            'toast',
            'toast-success',
            'toast-error',
            'toast-info',
            'loading',
            'hidden',
            'active',
            'disabled',
            'selected',
            'open',
            'show'
        ];
        
        allowedNamespaces.forEach(namespace => {
            this.namespaceRules.set(namespace, true);
        });
    }
    
    /**
     * CSS 파일에서 네임스페이스 위반 검사
     * @param {string} filePath - CSS 파일 경로
     * @param {string} content - CSS 파일 내용
     * @returns {Array} 위반 사항 목록
     */
    validateCSSFile(filePath, content) {
        const lines = content.split('\n');
        const violations = [];
        
        lines.forEach((line, index) => {
            // CSS 클래스 선택자 패턴 검사
            const classSelectors = this.extractClassSelectors(line);
            
            classSelectors.forEach(selector => {
                const className = this.extractClassName(selector);
                if (className && !this.isValidClassName(className, filePath)) {
                    violations.push({
                        file: filePath,
                        line: index + 1,
                        className: className,
                        selector: selector,
                        message: `네임스페이스 위반: ${className} - 적절한 네임스페이스 접두사 필요`,
                        severity: 'error'
                    });
                }
            });
        });
        
        return violations;
    }
    
    /**
     * 라인에서 CSS 클래스 선택자 추출
     * @param {string} line - CSS 라인
     * @returns {Array} 클래스 선택자 목록
     */
    extractClassSelectors(line) {
        const selectors = [];
        
        // .class-name 패턴 찾기
        const classPattern = /\.([a-zA-Z][a-zA-Z0-9_-]*(?:-[a-zA-Z0-9_-]*)*)/g;
        let match;
        
        while ((match = classPattern.exec(line)) !== null) {
            selectors.push(match[0]);
        }
        
        return selectors;
    }
    
    /**
     * 선택자에서 클래스명 추출
     * @param {string} selector - CSS 선택자
     * @returns {string} 클래스명
     */
    extractClassName(selector) {
        return selector.replace('.', '');
    }
    
    /**
     * 클래스명이 유효한지 검사
     * @param {string} className - 클래스명
     * @param {string} filePath - 파일 경로
     * @returns {boolean} 유효성 여부
     */
    isValidClassName(className, filePath) {
        // 허용된 네임스페이스에 포함되는지 확인
        if (this.namespaceRules.has(className)) {
            return true;
        }
        
        // 파일 경로 기반 네임스페이스 확인
        const expectedNamespace = this.getExpectedNamespace(filePath);
        if (expectedNamespace && className.startsWith(expectedNamespace + '-')) {
            return true;
        }
        
        // 중첩된 선택자인 경우 (부모 네임스페이스 내부)
        if (this.isNestedSelector(className, filePath)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 파일 경로에서 예상 네임스페이스 추출
     * @param {string} filePath - 파일 경로
     * @returns {string|null} 예상 네임스페이스
     */
    getExpectedNamespace(filePath) {
        if (filePath.includes('country-selector')) {
            return 'country-selector-container';
        }
        if (filePath.includes('auth')) {
            return 'auth-screen';
        }
        if (filePath.includes('search')) {
            return 'search-tab';
        }
        if (filePath.includes('calendar')) {
            return 'calendar-tab';
        }
        if (filePath.includes('my-logs')) {
            return 'my-logs-tab';
        }
        if (filePath.includes('home')) {
            return 'home-tab';
        }
        if (filePath.includes('add-log')) {
            return 'add-log-tab';
        }
        
        return null;
    }
    
    /**
     * 중첩된 선택자인지 확인
     * @param {string} className - 클래스명
     * @param {string} filePath - 파일 경로
     * @returns {boolean} 중첩 여부
     */
    isNestedSelector(className, filePath) {
        const expectedNamespace = this.getExpectedNamespace(filePath);
        if (!expectedNamespace) return false;
        
        // 중첩된 선택자 패턴 확인
        const nestedPatterns = [
            `${expectedNamespace}-`,
            `${expectedNamespace} .`,
            `${expectedNamespace} >`,
            `${expectedNamespace} +`,
            `${expectedNamespace} ~`
        ];
        
        return nestedPatterns.some(pattern => className.includes(pattern));
    }
    
    /**
     * DOM 구조 일치성 검사
     * @param {string} componentType - 컴포넌트 타입
     * @param {HTMLElement} container - 컨테이너 요소
     * @returns {Array} 위반 사항 목록
     */
    validateDOMStructure(componentType, container) {
        const requiredStructure = REQUIRED_DOM_STRUCTURES[componentType];
        if (!requiredStructure) return [];
        
        const violations = [];
        
        Object.entries(requiredStructure).forEach(([key, selector]) => {
            const element = container.querySelector(selector);
            if (!element) {
                violations.push({
                    component: componentType,
                    missing: selector,
                    message: `필수 DOM 요소 누락: ${selector}`,
                    severity: 'error'
                });
            }
        });
        
        return violations;
    }
    
    /**
     * 검증 결과 리포트 생성
     * @param {Array} violations - 위반 사항 목록
     * @returns {string} 리포트 문자열
     */
    generateReport(violations) {
        if (violations.length === 0) {
            return '✅ CSS 클래스명 검증 통과: 충돌 없음';
        }
        
        let report = '❌ CSS 클래스명 검증 실패:\n';
        
        violations.forEach(violation => {
            report += `  - ${violation.file}:${violation.line} - ${violation.message}\n`;
            if (violation.selector) {
                report += `    선택자: ${violation.selector}\n`;
            }
        });
        
        return report;
    }
    
    /**
     * 자동 수정 제안 생성
     * @param {string} className - 클래스명
     * @param {string} filePath - 파일 경로
     * @returns {string|null} 수정 제안
     */
    suggestFix(className, filePath) {
        const expectedNamespace = this.getExpectedNamespace(filePath);
        if (!expectedNamespace) return null;
        
        return `${expectedNamespace}-${className}`;
    }
}

// 기본 export
export default CSSClassValidator;
