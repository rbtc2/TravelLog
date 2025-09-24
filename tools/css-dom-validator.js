#!/usr/bin/env node

/**
 * CSS-DOM 검증 도구
 * 빌드 시 CSS 클래스명 충돌과 DOM 구조 불일치를 검증하는 도구
 * 
 * @version 1.0.0
 * @since 2024-01-15
 * @author REDIPX
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CSSClassValidator } from '../js/modules/utils/css-class-validator.js';
import { DOMStructureValidator } from '../js/modules/utils/dom-structure-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BuildTimeValidator {
    constructor() {
        this.cssValidator = new CSSClassValidator();
        this.domValidator = new DOMStructureValidator();
        this.errors = [];
        this.warnings = [];
        this.projectRoot = path.resolve(__dirname, '..');
    }
    
    /**
     * 모든 CSS 파일 검증
     * @returns {Promise<Array>} 검증 결과
     */
    async validateAllCSSFiles() {
        console.log('🔍 CSS 파일 검증 시작...');
        
        const cssDir = path.join(this.projectRoot, 'styles');
        const files = this.getCSSFiles(cssDir);
        
        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const violations = this.cssValidator.validateCSSFile(file, content);
                
                if (violations.length > 0) {
                    this.errors.push(...violations);
                }
                
                console.log(`  ✅ ${path.relative(this.projectRoot, file)}`);
            } catch (error) {
                console.error(`  ❌ ${path.relative(this.projectRoot, file)}: ${error.message}`);
                this.errors.push({
                    file: file,
                    line: 0,
                    message: `파일 읽기 실패: ${error.message}`,
                    severity: 'error'
                });
            }
        }
        
        return this.errors;
    }
    
    /**
     * CSS 파일 목록 가져오기
     * @param {string} dir - 디렉토리 경로
     * @returns {Array} CSS 파일 목록
     */
    getCSSFiles(dir) {
        const files = [];
        
        if (!fs.existsSync(dir)) {
            return files;
        }
        
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
                files.push(...this.getCSSFiles(fullPath));
            } else if (item.name.endsWith('.css')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }
    
    /**
     * HTML 파일에서 DOM 구조 검증
     * @returns {Promise<Array>} 검증 결과
     */
    async validateHTMLFiles() {
        console.log('🔍 HTML 파일 검증 시작...');
        
        const htmlFiles = this.getHTMLFiles();
        const domErrors = [];
        
        for (const file of htmlFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const domErrors = this.validateHTMLContent(file, content);
                
                if (domErrors.length > 0) {
                    this.errors.push(...domErrors);
                }
                
                console.log(`  ✅ ${path.relative(this.projectRoot, file)}`);
            } catch (error) {
                console.error(`  ❌ ${path.relative(this.projectRoot, file)}: ${error.message}`);
                this.errors.push({
                    file: file,
                    line: 0,
                    message: `HTML 파일 검증 실패: ${error.message}`,
                    severity: 'error'
                });
            }
        }
        
        return domErrors;
    }
    
    /**
     * HTML 파일 목록 가져오기
     * @returns {Array} HTML 파일 목록
     */
    getHTMLFiles() {
        const files = [];
        const htmlDir = this.projectRoot;
        
        const items = fs.readdirSync(htmlDir, { withFileTypes: true });
        
        for (const item of items) {
            if (item.isFile() && item.name.endsWith('.html')) {
                files.push(path.join(htmlDir, item.name));
            }
        }
        
        return files;
    }
    
    /**
     * HTML 내용 검증
     * @param {string} filePath - 파일 경로
     * @param {string} content - HTML 내용
     * @returns {Array} 검증 결과
     */
    validateHTMLContent(filePath, content) {
        const errors = [];
        
        // 간단한 HTML 파싱 (실제로는 더 정교한 파서 필요)
        const componentPatterns = [
            { name: 'country-selector', pattern: /class="[^"]*country-selector-container[^"]*"/g },
            { name: 'auth-manager', pattern: /class="[^"]*auth-screen[^"]*"/g },
            { name: 'search-tab', pattern: /class="[^"]*search-tab[^"]*"/g },
            { name: 'calendar-tab', pattern: /class="[^"]*calendar-tab[^"]*"/g },
            { name: 'my-logs-tab', pattern: /class="[^"]*my-logs-tab[^"]*"/g },
            { name: 'home-tab', pattern: /class="[^"]*home-tab[^"]*"/g }
        ];
        
        componentPatterns.forEach(({ name, pattern }) => {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach((match, index) => {
                    // 클래스명 추출
                    const classMatch = match.match(/class="([^"]+)"/);
                    if (classMatch) {
                        const classes = classMatch[1].split(' ');
                        
                        // 필수 클래스 확인
                        const requiredClasses = this.getRequiredClasses(name);
                        requiredClasses.forEach(requiredClass => {
                            if (!classes.includes(requiredClass)) {
                                errors.push({
                                    file: filePath,
                                    line: this.getLineNumber(content, match),
                                    component: name,
                                    missing: requiredClass,
                                    message: `${name}에 필수 클래스 누락: ${requiredClass}`,
                                    severity: 'error'
                                });
                            }
                        });
                    }
                });
            }
        });
        
        return errors;
    }
    
    /**
     * 컴포넌트별 필수 클래스 목록
     * @param {string} componentName - 컴포넌트 이름
     * @returns {Array} 필수 클래스 목록
     */
    getRequiredClasses(componentName) {
        const requiredClasses = {
            'country-selector': ['country-selector-container'],
            'auth-manager': ['auth-screen'],
            'search-tab': ['search-tab'],
            'calendar-tab': ['calendar-tab'],
            'my-logs-tab': ['my-logs-tab'],
            'home-tab': ['home-tab']
        };
        
        return requiredClasses[componentName] || [];
    }
    
    /**
     * 문자열에서 라인 번호 찾기
     * @param {string} content - 전체 내용
     * @param {string} searchString - 찾을 문자열
     * @returns {number} 라인 번호
     */
    getLineNumber(content, searchString) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchString)) {
                return i + 1;
            }
        }
        return 1;
    }
    
    /**
     * JavaScript 파일에서 DOM 구조 검증
     * @returns {Promise<Array>} 검증 결과
     */
    async validateJavaScriptFiles() {
        console.log('🔍 JavaScript 파일 검증 시작...');
        
        const jsFiles = this.getJavaScriptFiles();
        const jsErrors = [];
        
        for (const file of jsFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const errors = this.validateJavaScriptContent(file, content);
                
                if (errors.length > 0) {
                    jsErrors.push(...errors);
                }
                
                console.log(`  ✅ ${path.relative(this.projectRoot, file)}`);
            } catch (error) {
                console.error(`  ❌ ${path.relative(this.projectRoot, file)}: ${error.message}`);
                jsErrors.push({
                    file: file,
                    line: 0,
                    message: `JavaScript 파일 검증 실패: ${error.message}`,
                    severity: 'error'
                });
            }
        }
        
        return jsErrors;
    }
    
    /**
     * JavaScript 파일 목록 가져오기
     * @returns {Array} JavaScript 파일 목록
     */
    getJavaScriptFiles() {
        const files = [];
        const jsDir = path.join(this.projectRoot, 'js');
        
        if (!fs.existsSync(jsDir)) {
            return files;
        }
        
        const items = fs.readdirSync(jsDir, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(jsDir, item.name);
            
            if (item.isDirectory()) {
                files.push(...this.getJavaScriptFilesRecursive(fullPath));
            } else if (item.name.endsWith('.js')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }
    
    /**
     * JavaScript 파일 재귀 검색
     * @param {string} dir - 디렉토리 경로
     * @returns {Array} JavaScript 파일 목록
     */
    getJavaScriptFilesRecursive(dir) {
        const files = [];
        
        if (!fs.existsSync(dir)) {
            return files;
        }
        
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
                files.push(...this.getJavaScriptFilesRecursive(fullPath));
            } else if (item.name.endsWith('.js')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }
    
    /**
     * JavaScript 내용 검증
     * @param {string} filePath - 파일 경로
     * @param {string} content - JavaScript 내용
     * @returns {Array} 검증 결과
     */
    validateJavaScriptContent(filePath, content) {
        const errors = [];
        
        // DOM 생성 패턴 검사
        const domPatterns = [
            { name: 'createElement', pattern: /createElement\(['"`]([^'"`]+)['"`]\)/g },
            { name: 'innerHTML', pattern: /innerHTML\s*=\s*['"`]([^'"`]+)['"`]/g },
            { name: 'classList.add', pattern: /classList\.add\(['"`]([^'"`]+)['"`]\)/g }
        ];
        
        domPatterns.forEach(({ name, pattern }) => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const elementOrClass = match[1];
                
                // 클래스명 검증
                if (name === 'classList.add' || elementOrClass.includes('class=')) {
                    const classNames = this.extractClassNames(elementOrClass);
                    classNames.forEach(className => {
                        if (!this.cssValidator.isValidClassName(className, filePath)) {
                            errors.push({
                                file: filePath,
                                line: this.getLineNumber(content, match[0]),
                                className: className,
                                message: `JavaScript에서 네임스페이스 위반: ${className}`,
                                severity: 'error'
                            });
                        }
                    });
                }
            }
        });
        
        return errors;
    }
    
    /**
     * 문자열에서 클래스명 추출
     * @param {string} str - 문자열
     * @returns {Array} 클래스명 목록
     */
    extractClassNames(str) {
        const classPattern = /class="([^"]+)"/g;
        const classes = [];
        let match;
        
        while ((match = classPattern.exec(str)) !== null) {
            const classList = match[1].split(' ');
            classes.push(...classList.map(cls => cls.trim()).filter(cls => cls));
        }
        
        return classes;
    }
    
    /**
     * 검증 결과 리포트 생성
     * @returns {boolean} 검증 성공 여부
     */
    generateReport() {
        console.log('\n📊 검증 결과 리포트');
        console.log('='.repeat(50));
        
        if (this.errors.length === 0) {
            console.log('✅ CSS-DOM 검증 통과: 충돌 없음');
            return true;
        }
        
        console.log(`❌ CSS-DOM 검증 실패: ${this.errors.length}개 오류 발견`);
        console.log('');
        
        // 오류별 그룹화
        const errorsByType = this.groupErrorsByType();
        
        Object.entries(errorsByType).forEach(([type, errors]) => {
            console.log(`📁 ${type}:`);
            errors.forEach(error => {
                const relativePath = path.relative(this.projectRoot, error.file);
                console.log(`  - ${relativePath}:${error.line} - ${error.message}`);
                if (error.className) {
                    console.log(`    클래스명: ${error.className}`);
                }
                if (error.selector) {
                    console.log(`    선택자: ${error.selector}`);
                }
            });
            console.log('');
        });
        
        return false;
    }
    
    /**
     * 오류를 타입별로 그룹화
     * @returns {Object} 그룹화된 오류
     */
    groupErrorsByType() {
        const groups = {};
        
        this.errors.forEach(error => {
            const type = error.type || 'general';
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(error);
        });
        
        return groups;
    }
    
    /**
     * 전체 검증 실행
     * @returns {Promise<boolean>} 검증 성공 여부
     */
    async validateAll() {
        console.log('🚀 CSS-DOM 검증 시작');
        console.log('='.repeat(50));
        
        try {
            // CSS 파일 검증
            await this.validateAllCSSFiles();
            
            // HTML 파일 검증
            await this.validateHTMLFiles();
            
            // JavaScript 파일 검증
            await this.validateJavaScriptFiles();
            
            // 결과 리포트
            const isValid = this.generateReport();
            
            if (isValid) {
                console.log('\n🎉 모든 검증이 성공적으로 완료되었습니다!');
                return true;
            } else {
                console.log('\n💥 검증 실패: 수정 후 다시 실행해주세요.');
                return false;
            }
            
        } catch (error) {
            console.error('❌ 검증 중 오류 발생:', error.message);
            return false;
        }
    }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new BuildTimeValidator();
    const success = await validator.validateAll();
    process.exit(success ? 0 : 1);
}

// 기본 export
export default BuildTimeValidator;
