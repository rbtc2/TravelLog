/**
 * DOM 구조 검증기
 * JavaScript와 CSS 간 DOM 구조 일치성을 검증하는 도구
 * 
 * @version 1.0.0
 * @since 2024-01-15
 * @author REDIPX
 */

export const DOM_TEMPLATES = {
    'country-selector': {
        required: `
            <div class="country-selector-container">
                <div class="selector-input">
                    <input type="text" class="form-input" />
                    <button class="dropdown-arrow">
                        <span class="arrow-icon">▼</span>
                    </button>
                </div>
            </div>
        `,
        portal: `
            <div class="country-selector-portal">
                <div class="selector-dropdown">
                    <div class="countries-section">
                        <h3 class="section-title">국가 검색</h3>
                        <div class="countries-list">
                            <!-- 동적 생성 -->
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    'auth-manager': {
        required: `
            <div class="auth-screen">
                <div class="login-container">
                    <form class="login-form">
                        <div class="country-selector-container">
                            <!-- Country Selector가 여기에 삽입됨 -->
                        </div>
                    </form>
                </div>
            </div>
        `
    },
    'search-tab': {
        required: `
            <div class="search-tab">
                <div class="search-container">
                    <input type="text" class="search-input" />
                    <div class="search-results">
                        <!-- 검색 결과가 여기에 표시됨 -->
                    </div>
                </div>
            </div>
        `
    },
    'calendar-tab': {
        required: `
            <div class="calendar-tab">
                <div class="calendar-container">
                    <div class="month-header">
                        <!-- 월 헤더 -->
                    </div>
                    <div class="calendar-grid">
                        <!-- 달력 그리드 -->
                    </div>
                </div>
            </div>
        `
    },
    'my-logs-tab': {
        required: `
            <div class="my-logs-tab">
                <div class="my-logs-container">
                    <div class="hub-view">
                        <!-- Hub 뷰 -->
                    </div>
                    <div class="logs-list-view">
                        <!-- 로그 목록 뷰 -->
                    </div>
                    <div class="settings-view">
                        <!-- 설정 뷰 -->
                    </div>
                    <div class="travel-report-view">
                        <!-- 여행 리포트 뷰 -->
                    </div>
                    <div class="profile-view">
                        <!-- 프로필 뷰 -->
                    </div>
                    <div class="travel-collection-view">
                        <!-- 여행 컬렉션 뷰 -->
                    </div>
                </div>
            </div>
        `
    }
};

export class DOMStructureValidator {
    constructor() {
        this.templates = DOM_TEMPLATES;
        this.violations = [];
    }
    
    /**
     * 컴포넌트 DOM 구조 검증
     * @param {string} componentType - 컴포넌트 타입
     * @param {HTMLElement} container - 컨테이너 요소
     * @returns {Object} 검증 결과
     */
    validateComponent(componentType, container) {
        const template = this.templates[componentType];
        if (!template) {
            return { 
                valid: true, 
                errors: [],
                warnings: [`알 수 없는 컴포넌트 타입: ${componentType}`]
            };
        }
        
        const errors = [];
        const warnings = [];
        
        // 필수 요소 검사
        const requiredElements = this.extractRequiredElements(template.required);
        requiredElements.forEach(selector => {
            if (!container.querySelector(selector)) {
                errors.push({
                    type: 'missing_element',
                    selector: selector,
                    message: `필수 요소 누락: ${selector}`,
                    severity: 'error'
                });
            }
        });
        
        // 클래스명 일치성 검사
        const classMismatches = this.checkClassMismatches(template.required, container);
        errors.push(...classMismatches);
        
        // 구조적 일치성 검사
        const structureMismatches = this.checkStructureMismatches(template.required, container);
        warnings.push(...structureMismatches);
        
        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }
    
    /**
     * 템플릿에서 필수 요소 추출
     * @param {string} template - DOM 템플릿
     * @returns {Array} 필수 요소 선택자 목록
     */
    extractRequiredElements(template) {
        const classPattern = /class="([^"]+)"/g;
        const selectors = [];
        let match;
        
        while ((match = classPattern.exec(template)) !== null) {
            const classes = match[1].split(' ');
            classes.forEach(cls => {
                if (cls.trim()) {
                    selectors.push(`.${cls.trim()}`);
                }
            });
        }
        
        return selectors;
    }
    
    /**
     * 클래스명 불일치 검사
     * @param {string} template - DOM 템플릿
     * @param {HTMLElement} container - 컨테이너 요소
     * @returns {Array} 불일치 사항 목록
     */
    checkClassMismatches(template, container) {
        const errors = [];
        const templateClasses = this.extractAllClasses(template);
        const domClasses = this.extractAllClasses(container.innerHTML);
        
        templateClasses.forEach(templateClass => {
            if (!domClasses.includes(templateClass)) {
                errors.push({
                    type: 'class_mismatch',
                    expected: templateClass,
                    message: `클래스명 불일치: ${templateClass} 예상됨`,
                    severity: 'error'
                });
            }
        });
        
        return errors;
    }
    
    /**
     * 구조적 불일치 검사
     * @param {string} template - DOM 템플릿
     * @param {HTMLElement} container - 컨테이너 요소
     * @returns {Array} 불일치 사항 목록
     */
    checkStructureMismatches(template, container) {
        const warnings = [];
        
        // 중첩 구조 검사
        const templateStructure = this.extractStructure(template);
        const domStructure = this.extractStructure(container.innerHTML);
        
        // 구조 비교
        this.compareStructures(templateStructure, domStructure, warnings);
        
        return warnings;
    }
    
    /**
     * HTML에서 모든 클래스 추출
     * @param {string} html - HTML 문자열
     * @returns {Array} 클래스 목록
     */
    extractAllClasses(html) {
        const classPattern = /class="([^"]+)"/g;
        const classes = [];
        let match;
        
        while ((match = classPattern.exec(html)) !== null) {
            const classList = match[1].split(' ');
            classes.push(...classList.map(cls => cls.trim()).filter(cls => cls));
        }
        
        return classes;
    }
    
    /**
     * HTML에서 구조 추출
     * @param {string} html - HTML 문자열
     * @returns {Object} 구조 정보
     */
    extractStructure(html) {
        const structure = {
            elements: [],
            hierarchy: []
        };
        
        // 간단한 구조 분석 (실제로는 더 복잡한 파싱이 필요)
        const elementPattern = /<(\w+)[^>]*class="([^"]+)"[^>]*>/g;
        let match;
        
        while ((match = elementPattern.exec(html)) !== null) {
            structure.elements.push({
                tag: match[1],
                classes: match[2].split(' ').map(cls => cls.trim()).filter(cls => cls)
            });
        }
        
        return structure;
    }
    
    /**
     * 구조 비교
     * @param {Object} templateStructure - 템플릿 구조
     * @param {Object} domStructure - DOM 구조
     * @param {Array} warnings - 경고 목록
     */
    compareStructures(templateStructure, domStructure, warnings) {
        // 템플릿의 각 요소가 DOM에 존재하는지 확인
        templateStructure.elements.forEach(templateElement => {
            const found = domStructure.elements.find(domElement => 
                domElement.tag === templateElement.tag &&
                templateElement.classes.every(cls => domElement.classes.includes(cls))
            );
            
            if (!found) {
                warnings.push({
                    type: 'structure_mismatch',
                    expected: `${templateElement.tag} with classes: ${templateElement.classes.join(', ')}`,
                    message: `구조적 불일치: ${templateElement.tag} 요소가 예상과 다름`,
                    severity: 'warning'
                });
            }
        });
    }
    
    /**
     * 검증 결과 리포트 생성
     * @param {Object} result - 검증 결과
     * @returns {string} 리포트 문자열
     */
    generateReport(result) {
        if (result.valid && result.warnings.length === 0) {
            return '✅ DOM 구조 검증 통과: 모든 요소가 올바르게 구성됨';
        }
        
        let report = '';
        
        if (!result.valid) {
            report += '❌ DOM 구조 검증 실패:\n';
            result.errors.forEach(error => {
                report += `  - ${error.message}\n`;
                if (error.selector) {
                    report += `    선택자: ${error.selector}\n`;
                }
            });
        }
        
        if (result.warnings.length > 0) {
            report += '\n⚠️ DOM 구조 경고:\n';
            result.warnings.forEach(warning => {
                report += `  - ${warning.message}\n`;
            });
        }
        
        return report;
    }
    
    /**
     * 자동 수정 제안 생성
     * @param {string} componentType - 컴포넌트 타입
     * @param {HTMLElement} container - 컨테이너 요소
     * @returns {Array} 수정 제안 목록
     */
    generateFixSuggestions(componentType, container) {
        const suggestions = [];
        const template = this.templates[componentType];
        
        if (!template) return suggestions;
        
        const requiredElements = this.extractRequiredElements(template.required);
        
        requiredElements.forEach(selector => {
            if (!container.querySelector(selector)) {
                suggestions.push({
                    type: 'add_element',
                    selector: selector,
                    suggestion: `다음 요소를 추가하세요: ${selector}`,
                    code: this.generateElementCode(selector)
                });
            }
        });
        
        return suggestions;
    }
    
    /**
     * 요소 코드 생성
     * @param {string} selector - 선택자
     * @returns {string} 요소 코드
     */
    generateElementCode(selector) {
        const className = selector.replace('.', '');
        const tagName = this.getTagNameForClass(className);
        
        return `<${tagName} class="${className}"></${tagName}>`;
    }
    
    /**
     * 클래스명에 따른 태그명 추출
     * @param {string} className - 클래스명
     * @returns {string} 태그명
     */
    getTagNameForClass(className) {
        if (className.includes('input')) return 'input';
        if (className.includes('button')) return 'button';
        if (className.includes('form')) return 'form';
        if (className.includes('header')) return 'header';
        if (className.includes('section')) return 'section';
        if (className.includes('list')) return 'ul';
        if (className.includes('item')) return 'li';
        return 'div';
    }
}

// 기본 export
export default DOMStructureValidator;
