#!/usr/bin/env node

/**
 * 다크모드 관리 스크립트
 * 
 * 🎯 목적:
 * - 다크모드 스타일 일괄 관리
 * - 자동화된 다크모드 검증 및 수정
 * - 개발 워크플로우 최적화
 * 
 * 사용법: node scripts/dark-mode-manager.js [명령어]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DarkModeManagerScript {
    constructor() {
        this.projectRoot = process.cwd();
        this.stylesDir = path.join(this.projectRoot, 'styles');
        this.configFile = path.join(this.projectRoot, 'config', 'dark-mode-config.js');
    }
    
    /**
     * 메인 실행 함수
     */
    run() {
        const command = process.argv[2];
        
        switch (command) {
            case 'generate':
                this.generateDarkModeStyles();
                break;
            case 'validate':
                this.validateDarkModeStyles();
                break;
            case 'fix':
                this.fixDarkModeIssues();
                break;
            case 'test':
                this.runDarkModeTests();
                break;
            case 'clean':
                this.cleanDarkModeFiles();
                break;
            case 'status':
                this.showDarkModeStatus();
                break;
            default:
                this.showHelp();
        }
    }
    
    /**
     * 다크모드 스타일 생성
     */
    generateDarkModeStyles() {
        console.log('🎨 다크모드 스타일 생성 중...');
        
        try {
            // CSS 파일 목록 가져오기
            const cssFiles = this.getCSSFiles();
            
            cssFiles.forEach(file => {
                console.log(`  📄 처리 중: ${file}`);
                this.generateDarkModeForFile(file);
            });
            
            console.log('✅ 다크모드 스타일 생성 완료!');
        } catch (error) {
            console.error('❌ 다크모드 스타일 생성 실패:', error.message);
        }
    }
    
    /**
     * 다크모드 스타일 검증
     */
    validateDarkModeStyles() {
        console.log('🔍 다크모드 스타일 검증 중...');
        
        try {
            const issues = [];
            const cssFiles = this.getCSSFiles();
            
            cssFiles.forEach(file => {
                const fileIssues = this.validateFile(file);
                issues.push(...fileIssues);
            });
            
            if (issues.length === 0) {
                console.log('✅ 모든 다크모드 스타일이 올바릅니다!');
            } else {
                console.log(`⚠️  ${issues.length}개의 이슈를 발견했습니다:`);
                issues.forEach(issue => {
                    console.log(`  - ${issue.file}: ${issue.message}`);
                });
            }
        } catch (error) {
            console.error('❌ 다크모드 스타일 검증 실패:', error.message);
        }
    }
    
    /**
     * 다크모드 이슈 자동 수정
     */
    fixDarkModeIssues() {
        console.log('🔧 다크모드 이슈 수정 중...');
        
        try {
            const cssFiles = this.getCSSFiles();
            
            cssFiles.forEach(file => {
                console.log(`  🔧 수정 중: ${file}`);
                this.fixFileIssues(file);
            });
            
            console.log('✅ 다크모드 이슈 수정 완료!');
        } catch (error) {
            console.error('❌ 다크모드 이슈 수정 실패:', error.message);
        }
    }
    
    /**
     * 다크모드 테스트 실행
     */
    runDarkModeTests() {
        console.log('🧪 다크모드 테스트 실행 중...');
        
        try {
            // 테스트 서버 시작
            console.log('  🚀 테스트 서버 시작 중...');
            const testUrl = 'http://localhost:8000/tests/test-dark-mode-comprehensive.html';
            
            console.log(`  📱 테스트 페이지: ${testUrl}`);
            console.log('  💡 브라우저에서 테스트 페이지를 열어 수동으로 테스트하세요.');
            
        } catch (error) {
            console.error('❌ 다크모드 테스트 실행 실패:', error.message);
        }
    }
    
    /**
     * 다크모드 파일 정리
     */
    cleanDarkModeFiles() {
        console.log('🧹 다크모드 파일 정리 중...');
        
        try {
            const cssFiles = this.getCSSFiles();
            let cleanedCount = 0;
            
            cssFiles.forEach(file => {
                const darkFile = this.getDarkModeFileName(file);
                if (fs.existsSync(darkFile)) {
                    fs.unlinkSync(darkFile);
                    console.log(`  🗑️  삭제: ${darkFile}`);
                    cleanedCount++;
                }
            });
            
            console.log(`✅ ${cleanedCount}개의 다크모드 파일을 정리했습니다.`);
        } catch (error) {
            console.error('❌ 다크모드 파일 정리 실패:', error.message);
        }
    }
    
    /**
     * 다크모드 상태 표시
     */
    showDarkModeStatus() {
        console.log('📊 다크모드 상태:');
        
        try {
            const cssFiles = this.getCSSFiles();
            const darkFiles = cssFiles.filter(file => {
                const darkFile = this.getDarkModeFileName(file);
                return fs.existsSync(darkFile);
            });
            
            console.log(`  📄 전체 CSS 파일: ${cssFiles.length}개`);
            console.log(`  🌙 다크모드 파일: ${darkFiles.length}개`);
            console.log(`  📈 완성도: ${Math.round((darkFiles.length / cssFiles.length) * 100)}%`);
            
            if (darkFiles.length < cssFiles.length) {
                const missingFiles = cssFiles.filter(file => {
                    const darkFile = this.getDarkModeFileName(file);
                    return !fs.existsSync(darkFile);
                });
                
                console.log('\n  ⚠️  다크모드가 없는 파일:');
                missingFiles.forEach(file => {
                    console.log(`    - ${file}`);
                });
            }
            
        } catch (error) {
            console.error('❌ 다크모드 상태 확인 실패:', error.message);
        }
    }
    
    /**
     * 도움말 표시
     */
    showHelp() {
        console.log(`
🌙 다크모드 관리 스크립트

사용법: node scripts/dark-mode-manager.js [명령어]

명령어:
  generate  - 다크모드 스타일 생성
  validate  - 다크모드 스타일 검증
  fix       - 다크모드 이슈 자동 수정
  test      - 다크모드 테스트 실행
  clean     - 다크모드 파일 정리
  status    - 다크모드 상태 확인
  help      - 이 도움말 표시

예시:
  node scripts/dark-mode-manager.js generate
  node scripts/dark-mode-manager.js validate
  node scripts/dark-mode-manager.js status
        `);
    }
    
    /**
     * CSS 파일 목록 가져오기
     */
    getCSSFiles() {
        const files = [];
        
        const scanDirectory = (dir) => {
            const items = fs.readdirSync(dir);
            
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (item.endsWith('.css') && !item.includes('.dark.')) {
                    files.push(fullPath);
                }
            });
        };
        
        scanDirectory(this.stylesDir);
        return files;
    }
    
    /**
     * 파일의 다크모드 스타일 생성
     */
    generateDarkModeForFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const darkContent = this.convertToDarkMode(content);
            
            const darkFilePath = this.getDarkModeFileName(filePath);
            fs.writeFileSync(darkFilePath, darkContent);
            
        } catch (error) {
            console.error(`  ❌ ${filePath} 처리 실패:`, error.message);
        }
    }
    
    /**
     * 다크모드 파일명 생성
     */
    getDarkModeFileName(filePath) {
        const dir = path.dirname(filePath);
        const name = path.basename(filePath, '.css');
        return path.join(dir, `${name}.dark.css`);
    }
    
    /**
     * CSS를 다크모드로 변환
     */
    convertToDarkMode(content) {
        // 간단한 다크모드 변환 로직
        let darkContent = content;
        
        // 색상 매핑
        const colorMappings = {
            '#ffffff': '#2d2d2d',
            '#f8f9fa': '#1a1a1a',
            '#e9ecef': '#495057',
            '#dee2e6': '#6c757d',
            '#ced4da': '#adb5bd',
            '#adb5bd': '#6c757d',
            '#6c757d': '#adb5bd',
            '#495057': '#e9ecef',
            '#343a40': '#f8f9fa',
            '#212529': '#ffffff',
            '#000000': '#ffffff'
        };
        
        Object.entries(colorMappings).forEach(([light, dark]) => {
            const regex = new RegExp(light.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            darkContent = darkContent.replace(regex, dark);
        });
        
        // 다크모드 클래스 추가
        darkContent = darkContent.replace(/(\.[\w-]+)/g, '.dark $1');
        
        return darkContent;
    }
    
    /**
     * 파일 검증
     */
    validateFile(filePath) {
        const issues = [];
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // 다크모드 클래스 확인
            if (!content.includes('.dark')) {
                issues.push({
                    file: filePath,
                    message: '다크모드 클래스가 없습니다'
                });
            }
            
            // 필수 속성 확인
            const requiredProperties = ['background-color', 'color'];
            requiredProperties.forEach(prop => {
                if (!content.includes(prop)) {
                    issues.push({
                        file: filePath,
                        message: `필수 속성 누락: ${prop}`
                    });
                }
            });
            
        } catch (error) {
            issues.push({
                file: filePath,
                message: `파일 읽기 실패: ${error.message}`
            });
        }
        
        return issues;
    }
    
    /**
     * 파일 이슈 수정
     */
    fixFileIssues(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let fixedContent = content;
            
            // 다크모드 클래스 추가
            if (!content.includes('.dark')) {
                fixedContent = fixedContent.replace(/(\.[\w-]+)/g, '.dark $1');
            }
            
            // 필수 속성 추가
            if (!content.includes('background-color')) {
                fixedContent += '\n    background-color: var(--bg-primary);\n';
            }
            
            if (!content.includes('color')) {
                fixedContent += '\n    color: var(--text-primary);\n';
            }
            
            fs.writeFileSync(filePath, fixedContent);
            
        } catch (error) {
            console.error(`  ❌ ${filePath} 수정 실패:`, error.message);
        }
    }
}

// 스크립트 실행
if (require.main === module) {
    const manager = new DarkModeManagerScript();
    manager.run();
}

module.exports = DarkModeManagerScript;
