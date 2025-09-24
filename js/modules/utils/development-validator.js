/**
 * 개발 시 실시간 검증기
 * 브라우저 환경에서 실시간으로 CSS-DOM 충돌을 감지하고 경고하는 도구
 * 
 * @version 1.0.0
 * @since 2024-01-15
 * @author REDIPX
 */

import { CSSClassValidator } from './css-class-validator.js';
import { DOMStructureValidator } from './dom-structure-validator.js';

export class DevelopmentValidator {
    constructor() {
        this.cssValidator = new CSSClassValidator();
        this.domValidator = new DOMStructureValidator();
        this.observer = null;
        this.isEnabled = false;
        this.violations = [];
        this.setupValidation();
    }
    
    /**
     * 검증 시스템 설정
     */
    setupValidation() {
        if (typeof window === 'undefined') {
            console.warn('DevelopmentValidator: 브라우저 환경에서만 작동합니다.');
            return;
        }
        
        // 개발 모드 확인
        this.isEnabled = this.isDevelopmentMode();
        
        if (this.isEnabled) {
            this.setupBrowserValidation();
            this.setupConsoleCommands();
            console.log('🔍 DevelopmentValidator: 실시간 검증 활성화됨');
        }
    }
    
    /**
     * 개발 모드 확인
     * @returns {boolean} 개발 모드 여부
     */
    isDevelopmentMode() {
        // URL에 개발 모드 표시가 있는지 확인
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.search.includes('dev=true')) {
            return true;
        }
        
        // 개발자 도구가 열려있는지 확인
        if (window.outerHeight - window.innerHeight > 200) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 브라우저에서 실시간 검증 설정
     */
    setupBrowserValidation() {
        // DOM 변경 감지
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.validateNewElements(mutation.addedNodes);
                }
            });
        });
        
        // 전체 문서 감시
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // CSS 변경 감지 (제한적)
        this.setupCSSValidation();
    }
    
    /**
     * CSS 검증 설정
     */
    setupCSSValidation() {
        // 스타일시트 로드 시 검증
        const originalInsertRule = CSSStyleSheet.prototype.insertRule;
        const self = this;
        
        CSSStyleSheet.prototype.insertRule = function(rule, index) {
            const result = originalInsertRule.call(this, rule, index);
            
            if (self.isEnabled) {
                self.validateCSSRule(rule);
            }
            
            return result;
        };
    }
    
    /**
     * CSS 규칙 검증
     * @param {string} rule - CSS 규칙
     */
    validateCSSRule(rule) {
        try {
            // 간단한 CSS 규칙 파싱
            const classSelectors = rule.match(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g);
            
            if (classSelectors) {
                classSelectors.forEach(selector => {
                    const className = selector.replace('.', '');
                    if (!this.cssValidator.isValidClassName(className, 'dynamic')) {
                        this.reportViolation({
                            type: 'css_namespace_violation',
                            className: className,
                            message: `동적 CSS 규칙에서 네임스페이스 위반: ${className}`,
                            severity: 'warning'
                        });
                    }
                });
            }
        } catch (error) {
            // CSS 파싱 오류는 무시
        }
    }
    
    /**
     * 새로 추가된 요소 검증
     * @param {NodeList} nodes - 추가된 노드 목록
     */
    validateNewElements(nodes) {
        nodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                this.validateElement(node);
            }
        });
    }
    
    /**
     * 개별 요소 검증
     * @param {HTMLElement} element - 검증할 요소
     */
    validateElement(element) {
        // Country Selector 검증
        if (element.classList.contains('country-selector-container')) {
            this.validateCountrySelector(element);
        }
        
        // Auth Manager 검증
        if (element.classList.contains('auth-screen')) {
            this.validateAuthManager(element);
        }
        
        // Search Tab 검증
        if (element.classList.contains('search-tab')) {
            this.validateSearchTab(element);
        }
        
        // Calendar Tab 검증
        if (element.classList.contains('calendar-tab')) {
            this.validateCalendarTab(element);
        }
        
        // My Logs Tab 검증
        if (element.classList.contains('my-logs-tab')) {
            this.validateMyLogsTab(element);
        }
        
        // Home Tab 검증
        if (element.classList.contains('home-tab')) {
            this.validateHomeTab(element);
        }
    }
    
    /**
     * Country Selector 검증
     * @param {HTMLElement} element - Country Selector 요소
     */
    validateCountrySelector(element) {
        const result = this.domValidator.validateComponent('country-selector', element);
        
        if (!result.valid) {
            this.reportViolation({
                type: 'dom_structure_error',
                component: 'country-selector',
                errors: result.errors,
                message: 'Country Selector DOM 구조 오류'
            });
        }
        
        if (result.warnings.length > 0) {
            result.warnings.forEach(warning => {
                this.reportViolation({
                    type: 'dom_structure_warning',
                    component: 'country-selector',
                    message: warning.message,
                    severity: 'warning'
                });
            });
        }
    }
    
    /**
     * Auth Manager 검증
     * @param {HTMLElement} element - Auth Manager 요소
     */
    validateAuthManager(element) {
        const result = this.domValidator.validateComponent('auth-manager', element);
        
        if (!result.valid) {
            this.reportViolation({
                type: 'dom_structure_error',
                component: 'auth-manager',
                errors: result.errors,
                message: 'Auth Manager DOM 구조 오류'
            });
        }
    }
    
    /**
     * Search Tab 검증
     * @param {HTMLElement} element - Search Tab 요소
     */
    validateSearchTab(element) {
        const result = this.domValidator.validateComponent('search-tab', element);
        
        if (!result.valid) {
            this.reportViolation({
                type: 'dom_structure_error',
                component: 'search-tab',
                errors: result.errors,
                message: 'Search Tab DOM 구조 오류'
            });
        }
    }
    
    /**
     * Calendar Tab 검증
     * @param {HTMLElement} element - Calendar Tab 요소
     */
    validateCalendarTab(element) {
        const result = this.domValidator.validateComponent('calendar-tab', element);
        
        if (!result.valid) {
            this.reportViolation({
                type: 'dom_structure_error',
                component: 'calendar-tab',
                errors: result.errors,
                message: 'Calendar Tab DOM 구조 오류'
            });
        }
    }
    
    /**
     * My Logs Tab 검증
     * @param {HTMLElement} element - My Logs Tab 요소
     */
    validateMyLogsTab(element) {
        const result = this.domValidator.validateComponent('my-logs-tab', element);
        
        if (!result.valid) {
            this.reportViolation({
                type: 'dom_structure_error',
                component: 'my-logs-tab',
                errors: result.errors,
                message: 'My Logs Tab DOM 구조 오류'
            });
        }
    }
    
    /**
     * Home Tab 검증
     * @param {HTMLElement} element - Home Tab 요소
     */
    validateHomeTab(element) {
        // Home Tab은 간단한 구조이므로 기본 검증만 수행
        const requiredClasses = ['home-tab'];
        
        requiredClasses.forEach(className => {
            if (!element.classList.contains(className)) {
                this.reportViolation({
                    type: 'missing_class',
                    component: 'home-tab',
                    className: className,
                    message: `Home Tab에 필수 클래스 누락: ${className}`,
                    severity: 'warning'
                });
            }
        });
    }
    
    /**
     * 위반 사항 리포트
     * @param {Object} violation - 위반 사항 정보
     */
    reportViolation(violation) {
        this.violations.push({
            ...violation,
            timestamp: new Date().toISOString(),
            url: window.location.href
        });
        
        // 콘솔에 경고 출력
        const message = `🔍 [${violation.type}] ${violation.message}`;
        
        if (violation.severity === 'error') {
            console.error(message, violation);
        } else if (violation.severity === 'warning') {
            console.warn(message, violation);
        } else {
            console.log(message, violation);
        }
        
        // 시각적 경고 (선택적)
        if (violation.severity === 'error') {
            this.showVisualWarning(violation);
        }
    }
    
    /**
     * 시각적 경고 표시
     * @param {Object} violation - 위반 사항 정보
     */
    showVisualWarning(violation) {
        // 간단한 토스트 알림
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
            max-width: 300px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        
        toast.textContent = `CSS-DOM 충돌 감지: ${violation.message}`;
        document.body.appendChild(toast);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
    
    /**
     * 콘솔 명령어 설정
     */
    setupConsoleCommands() {
        // 전역 함수로 등록
        window.validateAllComponents = () => this.validateAllComponents();
        window.getValidationReport = () => this.getValidationReport();
        window.clearValidationHistory = () => this.clearValidationHistory();
        window.toggleValidation = () => this.toggleValidation();
        
        console.log('🔍 사용 가능한 명령어:');
        console.log('  validateAllComponents() - 모든 컴포넌트 검증');
        console.log('  getValidationReport() - 검증 리포트 조회');
        console.log('  clearValidationHistory() - 검증 기록 초기화');
        console.log('  toggleValidation() - 검증 활성화/비활성화');
    }
    
    /**
     * 모든 컴포넌트 검증
     * @returns {Object} 검증 결과
     */
    validateAllComponents() {
        const results = {};
        const components = [
            'country-selector',
            'auth-manager',
            'search-tab',
            'calendar-tab',
            'my-logs-tab',
            'home-tab'
        ];
        
        components.forEach(componentType => {
            const elements = document.querySelectorAll(`.${componentType.replace('-', '-')}`);
            elements.forEach((element, index) => {
                const result = this.domValidator.validateComponent(componentType, element);
                results[`${componentType}-${index}`] = result;
            });
        });
        
        console.log('🔍 전체 컴포넌트 검증 완료:', results);
        return results;
    }
    
    /**
     * 검증 리포트 조회
     * @returns {Array} 위반 사항 목록
     */
    getValidationReport() {
        console.log('🔍 검증 리포트:', this.violations);
        return this.violations;
    }
    
    /**
     * 검증 기록 초기화
     */
    clearValidationHistory() {
        this.violations = [];
        console.log('🔍 검증 기록이 초기화되었습니다.');
    }
    
    /**
     * 검증 활성화/비활성화 토글
     */
    toggleValidation() {
        this.isEnabled = !this.isEnabled;
        
        if (this.isEnabled) {
            this.setupBrowserValidation();
            console.log('🔍 실시간 검증이 활성화되었습니다.');
        } else {
            if (this.observer) {
                this.observer.disconnect();
            }
            console.log('🔍 실시간 검증이 비활성화되었습니다.');
        }
    }
    
    /**
     * 검증기 정리
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // 전역 함수 제거
        delete window.validateAllComponents;
        delete window.getValidationReport;
        delete window.clearValidationHistory;
        delete window.toggleValidation;
        
        console.log('🔍 DevelopmentValidator가 정리되었습니다.');
    }
}

// 자동 초기화 (개발 모드에서만)
if (typeof window !== 'undefined') {
    const validator = new DevelopmentValidator();
    
    // 페이지 언로드 시 정리
    window.addEventListener('beforeunload', () => {
        validator.destroy();
    });
}

// 기본 export
export default DevelopmentValidator;
