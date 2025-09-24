#!/usr/bin/env node

/**
 * CSS 네임스페이스 자동 수정 도구
 * CSS 파일에서 네임스페이스 위반을 자동으로 수정하는 도구
 * 
 * @version 1.0.0
 * @since 2024-01-15
 * @author REDIPX
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CSSClassValidator } from '../js/modules/utils/css-class-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CSSNamespaceAutoFixer {
    constructor() {
        this.cssValidator = new CSSClassValidator();
        this.namespaceMap = new Map();
        this.projectRoot = path.resolve(__dirname, '..');
        this.setupNamespaceMap();
    }
    
    /**
     * 네임스페이스 매핑 설정
     */
    setupNamespaceMap() {
        this.namespaceMap.set('country-selector', 'country-selector-container');
        this.namespaceMap.set('auth', 'auth-screen');
        this.namespaceMap.set('search', 'search-tab');
        this.namespaceMap.set('calendar', 'calendar-tab');
        this.namespaceMap.set('my-logs', 'my-logs-tab');
        this.namespaceMap.set('home', 'home-tab');
        this.namespaceMap.set('add-log', 'add-log-tab');
    }
    
    /**
     * 파일 경로에서 네임스페이스 감지
     * @param {string} filePath - 파일 경로
     * @returns {string|null} 네임스페이스
     */
    detectNamespace(filePath) {
        const relativePath = path.relative(this.projectRoot, filePath);
        
        for (const [key, namespace] of this.namespaceMap) {
            if (relativePath.includes(key)) {
                return namespace;
            }
        }
        
        return null;
    }
    
    /**
     * CSS 파일 자동 수정
     * @param {string} filePath - 파일 경로
     * @param {string} content - 파일 내용
     * @returns {Object} 수정 결과
     */
    autoFixCSSFile(filePath, content) {
        const namespace = this.detectNamespace(filePath);
        if (!namespace) {
            return {
                fixed: false,
                message: `파일 경로에서 네임스페이스를 감지할 수 없습니다: ${filePath}`,
                changes: []
            };
        }
        
        const changes = [];
        let fixedContent = content;
        
        // 전역 클래스명을 네임스페이스로 변환
        const globalClassPattern = /^\.([a-zA-Z][a-zA-Z0-9_-]*)\s*\{/gm;
        
        fixedContent = fixedContent.replace(globalClassPattern, (match, className) => {
            // 이미 네임스페이스가 적용된 클래스는 건너뛰기
            if (className.startsWith(namespace + '-') || 
                this.cssValidator.isValidClassName(className, filePath)) {
                return match;
            }
            
            // 네임스페이스 적용
            const newClassName = `${namespace}-${className}`;
            changes.push({
                original: className,
                fixed: newClassName,
                line: this.getLineNumber(content, match)
            });
            
            return `.${newClassName} {`;
        });
        
        // 중첩된 선택자 수정
        const nestedPattern = /^\.([a-zA-Z][a-zA-Z0-9_-]*)\s+\.([a-zA-Z][a-zA-Z0-9_-]*)\s*\{/gm;
        
        fixedContent = fixedContent.replace(nestedPattern, (match, parentClass, childClass) => {
            // 부모 클래스에 네임스페이스 적용
            let fixedParentClass = parentClass;
            if (!parentClass.startsWith(namespace + '-') && 
                !this.cssValidator.isValidClassName(parentClass, filePath)) {
                fixedParentClass = `${namespace}-${parentClass}`;
            }
            
            // 자식 클래스에 네임스페이스 적용
            let fixedChildClass = childClass;
            if (!childClass.startsWith(namespace + '-') && 
                !this.cssValidator.isValidClassName(childClass, filePath)) {
                fixedChildClass = `${namespace}-${childClass}`;
            }
            
            if (fixedParentClass !== parentClass || fixedChildClass !== childClass) {
                changes.push({
                    original: `${parentClass} .${childClass}`,
                    fixed: `${fixedParentClass} .${fixedChildClass}`,
                    line: this.getLineNumber(content, match)
                });
            }
            
            return `.${fixedParentClass} .${fixedChildClass} {`;
        });
        
        return {
            fixed: changes.length > 0,
            message: changes.length > 0 ? `${changes.length}개 클래스명이 수정되었습니다.` : '수정할 클래스명이 없습니다.',
            changes: changes,
            content: fixedContent
        };
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
     * 모든 CSS 파일 자동 수정
     * @param {boolean} dryRun - 실제 수정 없이 미리보기만
     * @returns {Promise<Object>} 수정 결과
     */
    async autoFixAllCSSFiles(dryRun = false) {
        console.log('🔧 CSS 네임스페이스 자동 수정 시작...');
        console.log(`모드: ${dryRun ? '미리보기' : '실제 수정'}`);
        console.log('='.repeat(50));
        
        const cssDir = path.join(this.projectRoot, 'styles');
        const files = this.getCSSFiles(cssDir);
        
        const results = {
            totalFiles: files.length,
            fixedFiles: 0,
            totalChanges: 0,
            errors: [],
            details: []
        };
        
        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const result = this.autoFixCSSFile(file, content);
                
                if (result.fixed) {
                    results.fixedFiles++;
                    results.totalChanges += result.changes.length;
                    
                    if (!dryRun) {
                        fs.writeFileSync(file, result.content, 'utf8');
                    }
                    
                    results.details.push({
                        file: path.relative(this.projectRoot, file),
                        fixed: true,
                        changes: result.changes,
                        message: result.message
                    });
                    
                    console.log(`  ✅ ${path.relative(this.projectRoot, file)} - ${result.message}`);
                } else {
                    results.details.push({
                        file: path.relative(this.projectRoot, file),
                        fixed: false,
                        changes: [],
                        message: result.message
                    });
                    
                    console.log(`  ⏭️  ${path.relative(this.projectRoot, file)} - ${result.message}`);
                }
            } catch (error) {
                const errorInfo = {
                    file: path.relative(this.projectRoot, file),
                    error: error.message
                };
                
                results.errors.push(errorInfo);
                console.error(`  ❌ ${path.relative(this.projectRoot, file)}: ${error.message}`);
            }
        }
        
        return results;
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
     * 수정 결과 리포트 생성
     * @param {Object} results - 수정 결과
     * @returns {string} 리포트 문자열
     */
    generateReport(results) {
        console.log('\n📊 수정 결과 리포트');
        console.log('='.repeat(50));
        
        console.log(`총 파일 수: ${results.totalFiles}`);
        console.log(`수정된 파일 수: ${results.fixedFiles}`);
        console.log(`총 변경 사항: ${results.totalChanges}`);
        
        if (results.errors.length > 0) {
            console.log(`오류 수: ${results.errors.length}`);
        }
        
        console.log('\n📁 상세 결과:');
        
        results.details.forEach(detail => {
            if (detail.fixed) {
                console.log(`  ✅ ${detail.file}:`);
                detail.changes.forEach(change => {
                    console.log(`    라인 ${change.line}: ${change.original} → ${change.fixed}`);
                });
            } else {
                console.log(`  ⏭️  ${detail.file}: ${detail.message}`);
            }
        });
        
        if (results.errors.length > 0) {
            console.log('\n❌ 오류:');
            results.errors.forEach(error => {
                console.log(`  - ${error.file}: ${error.error}`);
            });
        }
        
        return results;
    }
    
    /**
     * 백업 파일 생성
     * @param {string} filePath - 파일 경로
     * @returns {string} 백업 파일 경로
     */
    createBackup(filePath) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        const content = fs.readFileSync(filePath, 'utf8');
        fs.writeFileSync(backupPath, content, 'utf8');
        return backupPath;
    }
    
    /**
     * 백업 파일 복원
     * @param {string} filePath - 원본 파일 경로
     * @param {string} backupPath - 백업 파일 경로
     */
    restoreBackup(filePath, backupPath) {
        const content = fs.readFileSync(backupPath, 'utf8');
        fs.writeFileSync(filePath, content, 'utf8');
        fs.unlinkSync(backupPath);
    }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    const fixer = new CSSNamespaceAutoFixer();
    
    // 명령행 인수 처리
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run') || args.includes('-d');
    const help = args.includes('--help') || args.includes('-h');
    
    if (help) {
        console.log(`
CSS 네임스페이스 자동 수정 도구

사용법:
  node auto-fix-css-namespace.js [옵션]

옵션:
  --dry-run, -d    실제 수정 없이 미리보기만 실행
  --help, -h       도움말 표시

예시:
  node auto-fix-css-namespace.js --dry-run  # 미리보기
  node auto-fix-css-namespace.js            # 실제 수정
        `);
        process.exit(0);
    }
    
    const results = await fixer.autoFixAllCSSFiles(dryRun);
    fixer.generateReport(results);
    
    if (dryRun) {
        console.log('\n💡 실제 수정을 원하면 --dry-run 옵션을 제거하고 다시 실행하세요.');
    } else {
        console.log('\n🎉 자동 수정이 완료되었습니다!');
    }
}

// 기본 export
export default CSSNamespaceAutoFixer;
