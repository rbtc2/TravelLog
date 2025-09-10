#!/usr/bin/env node

/**
 * 다크모드 CSS 자동 생성 도구
 * 
 * 🎯 목적:
 * - 기존 CSS 파일에서 다크모드 스타일 자동 생성
 * - 일관된 다크모드 스타일 적용
 * - 개발 시간 단축 및 오류 방지
 * 
 * 사용법: node tools/dark-mode-generator.js [CSS 파일 경로]
 */

const fs = require('fs');
const path = require('path');

class DarkModeGenerator {
    constructor() {
        this.colorMappings = {
            // 기본 색상 매핑
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
            '#000000': '#ffffff',
            
            // 회색 계열
            '#f7fafc': '#1a202c',
            '#edf2f7': '#2d3748',
            '#e2e8f0': '#4a5568',
            '#cbd5e0': '#718096',
            '#a0aec0': '#a0aec0',
            '#718096': '#cbd5e0',
            '#4a5568': '#e2e8f0',
            '#2d3748': '#edf2f7',
            '#1a202c': '#f7fafc',
            
            // 파란색 계열
            '#ebf8ff': '#1a365d',
            '#bee3f8': '#2c5282',
            '#90cdf4': '#3182ce',
            '#63b3ed': '#4299e1',
            '#4299e1': '#63b3ed',
            '#3182ce': '#90cdf4',
            '#2c5282': '#bee3f8',
            '#1a365d': '#ebf8ff',
            
            // 빨간색 계열
            '#fed7d7': '#742a2a',
            '#feb2b2': '#9b2c2c',
            '#fc8181': '#e53e3e',
            '#f56565': '#f56565',
            '#e53e3e': '#fc8181',
            '#c53030': '#feb2b2',
            '#9b2c2c': '#fed7d7',
            '#742a2a': '#fed7d7',
            
            // 초록색 계열
            '#c6f6d5': '#22543d',
            '#9ae6b4': '#276749',
            '#68d391': '#38a169',
            '#48bb78': '#48bb78',
            '#38a169': '#68d391',
            '#2f855a': '#9ae6b4',
            '#276749': '#c6f6d5',
            '#22543d': '#c6f6d5',
            
            // 노란색 계열
            '#fefcbf': '#744210',
            '#faf089': '#975a16',
            '#f6e05e': '#d69e2e',
            '#ecc94b': '#ecc94b',
            '#d69e2e': '#f6e05e',
            '#b7791f': '#faf089',
            '#975a16': '#fefcbf',
            '#744210': '#fefcbf'
        };
        
        this.shadowMappings = {
            '0 1px 3px rgba(0, 0, 0, 0.1)': '0 1px 3px rgba(0, 0, 0, 0.3)',
            '0 4px 6px rgba(0, 0, 0, 0.1)': '0 4px 6px rgba(0, 0, 0, 0.3)',
            '0 10px 15px rgba(0, 0, 0, 0.1)': '0 10px 15px rgba(0, 0, 0, 0.4)',
            '0 20px 25px rgba(0, 0, 0, 0.1)': '0 20px 25px rgba(0, 0, 0, 0.5)',
            '0 25px 50px rgba(0, 0, 0, 0.1)': '0 25px 50px rgba(0, 0, 0, 0.6)'
        };
    }
    
    /**
     * CSS 파일에서 다크모드 스타일 생성
     * @param {string} filePath - CSS 파일 경로
     */
    generateDarkModeStyles(filePath) {
        try {
            const cssContent = fs.readFileSync(filePath, 'utf8');
            const darkModeCSS = this.processCSS(cssContent);
            
            // 다크모드 CSS 파일 생성
            const outputPath = this.getOutputPath(filePath);
            fs.writeFileSync(outputPath, darkModeCSS);
            
            console.log(`✅ 다크모드 CSS 생성 완료: ${outputPath}`);
            return darkModeCSS;
        } catch (error) {
            console.error(`❌ CSS 파일 처리 실패: ${error.message}`);
            return null;
        }
    }
    
    /**
     * CSS 내용 처리
     * @param {string} cssContent - CSS 내용
     * @returns {string} 다크모드 CSS
     */
    processCSS(cssContent) {
        let darkModeCSS = '';
        const lines = cssContent.split('\n');
        let inDarkModeBlock = false;
        let currentSelector = '';
        let currentBlock = '';
        let braceCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 다크모드 블록 시작 감지
            if (line.includes('.dark') || line.includes(':root.dark')) {
                inDarkModeBlock = true;
                darkModeCSS += line + '\n';
                continue;
            }
            
            // 다크모드 블록 끝 감지
            if (inDarkModeBlock && line === '}') {
                inDarkModeBlock = false;
                darkModeCSS += line + '\n';
                continue;
            }
            
            // 이미 다크모드 블록이면 그대로 추가
            if (inDarkModeBlock) {
                darkModeCSS += line + '\n';
                continue;
            }
            
            // 일반 CSS 규칙 처리
            if (line.includes('{')) {
                currentSelector = this.extractSelector(line);
                currentBlock = line + '\n';
                braceCount = 1;
                
                // 다크모드 스타일 생성
                const darkModeBlock = this.generateDarkModeBlock(currentSelector, currentBlock);
                if (darkModeBlock) {
                    darkModeCSS += darkModeBlock + '\n';
                }
                
                // 원본 CSS도 유지
                darkModeCSS += line + '\n';
            } else if (line.includes('}')) {
                currentBlock += line + '\n';
                darkModeCSS += line + '\n';
                
                if (braceCount > 0) {
                    braceCount--;
                    if (braceCount === 0) {
                        currentSelector = '';
                        currentBlock = '';
                    }
                }
            } else if (currentSelector && braceCount > 0) {
                currentBlock += line + '\n';
                darkModeCSS += line + '\n';
            } else {
                darkModeCSS += line + '\n';
            }
        }
        
        return darkModeCSS;
    }
    
    /**
     * CSS 선택자 추출
     * @param {string} line - CSS 라인
     * @returns {string} 선택자
     */
    extractSelector(line) {
        const match = line.match(/^([^{]+){/);
        return match ? match[1].trim() : '';
    }
    
    /**
     * 다크모드 블록 생성
     * @param {string} selector - CSS 선택자
     * @param {string} block - CSS 블록
     * @returns {string} 다크모드 블록
     */
    generateDarkModeBlock(selector, block) {
        // 다크모드가 필요한 선택자인지 확인
        if (!this.needsDarkMode(selector)) {
            return '';
        }
        
        const darkModeSelector = this.convertToDarkModeSelector(selector);
        const darkModeProperties = this.extractDarkModeProperties(block);
        
        if (Object.keys(darkModeProperties).length === 0) {
            return '';
        }
        
        let darkModeBlock = `.dark ${darkModeSelector} {\n`;
        
        Object.entries(darkModeProperties).forEach(([property, value]) => {
            darkModeBlock += `    ${property}: ${value};\n`;
        });
        
        darkModeBlock += '}\n';
        
        return darkModeBlock;
    }
    
    /**
     * 다크모드가 필요한 선택자인지 확인
     * @param {string} selector - CSS 선택자
     * @returns {boolean} 다크모드 필요 여부
     */
    needsDarkMode(selector) {
        // 다크모드가 필요한 선택자 패턴
        const patterns = [
            /^\./,  // 클래스 선택자
            /^#/,   // ID 선택자
            /^[a-zA-Z]/,  // 태그 선택자
            /button/,
            /input/,
            /card/,
            /container/,
            /header/,
            /footer/,
            /nav/,
            /menu/,
            /modal/,
            /overlay/,
            /section/,
            /article/,
            /aside/
        ];
        
        return patterns.some(pattern => pattern.test(selector));
    }
    
    /**
     * 선택자를 다크모드 선택자로 변환
     * @param {string} selector - 원본 선택자
     * @returns {string} 다크모드 선택자
     */
    convertToDarkModeSelector(selector) {
        // 이미 .dark가 포함된 경우 그대로 반환
        if (selector.includes('.dark')) {
            return selector;
        }
        
        // 복합 선택자 처리
        if (selector.includes(',')) {
            return selector.split(',').map(s => s.trim()).join(',\n.dark ');
        }
        
        return selector;
    }
    
    /**
     * 다크모드 속성 추출
     * @param {string} block - CSS 블록
     * @returns {Object} 다크모드 속성
     */
    extractDarkModeProperties(block) {
        const properties = {};
        const lines = block.split('\n');
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.includes(':') && !trimmedLine.includes('{') && !trimmedLine.includes('}')) {
                const [property, value] = trimmedLine.split(':').map(s => s.trim());
                const cleanValue = value.replace(';', '');
                
                if (this.shouldConvertProperty(property, cleanValue)) {
                    const darkValue = this.convertToDarkModeValue(property, cleanValue);
                    if (darkValue !== cleanValue) {
                        properties[property] = darkValue;
                    }
                }
            }
        });
        
        return properties;
    }
    
    /**
     * 변환해야 할 속성인지 확인
     * @param {string} property - CSS 속성
     * @param {string} value - CSS 값
     * @returns {boolean} 변환 필요 여부
     */
    shouldConvertProperty(property, value) {
        const convertibleProperties = [
            'background-color',
            'color',
            'border-color',
            'box-shadow',
            'background',
            'border'
        ];
        
        return convertibleProperties.some(prop => property.includes(prop));
    }
    
    /**
     * 다크모드 값으로 변환
     * @param {string} property - CSS 속성
     * @param {string} value - CSS 값
     * @returns {string} 다크모드 값
     */
    convertToDarkModeValue(property, value) {
        // 색상 매핑 확인
        if (this.colorMappings[value]) {
            return this.colorMappings[value];
        }
        
        // 그림자 매핑 확인
        if (property.includes('shadow') && this.shadowMappings[value]) {
            return this.shadowMappings[value];
        }
        
        // CSS 변수 처리
        if (value.startsWith('var(')) {
            return this.convertCSSVariable(value);
        }
        
        // RGB/RGBA 색상 처리
        if (value.startsWith('rgb')) {
            return this.convertRgbColor(value);
        }
        
        // HEX 색상 처리
        if (value.startsWith('#')) {
            return this.convertHexColor(value);
        }
        
        return value;
    }
    
    /**
     * CSS 변수 변환
     * @param {string} value - CSS 변수 값
     * @returns {string} 변환된 값
     */
    convertCSSVariable(value) {
        // var(--primary-color) → var(--dark-primary-color)
        return value.replace(/var\(--([^)]+)\)/g, 'var(--dark-$1)');
    }
    
    /**
     * RGB 색상 변환
     * @param {string} value - RGB 색상 값
     * @returns {string} 변환된 색상
     */
    convertRgbColor(value) {
        const match = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            const brightness = (r + g + b) / 3;
            
            if (brightness > 128) {
                // 밝은 색상 → 어두운 색상
                const newR = Math.max(0, r - 100);
                const newG = Math.max(0, g - 100);
                const newB = Math.max(0, b - 100);
                return `rgb(${newR}, ${newG}, ${newB})`;
            } else {
                // 어두운 색상 → 밝은 색상
                const newR = Math.min(255, r + 100);
                const newG = Math.min(255, g + 100);
                const newB = Math.min(255, b + 100);
                return `rgb(${newR}, ${newG}, ${newB})`;
            }
        }
        
        return value;
    }
    
    /**
     * HEX 색상 변환
     * @param {string} value - HEX 색상 값
     * @returns {string} 변환된 색상
     */
    convertHexColor(value) {
        const hex = value.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r + g + b) / 3;
        
        if (brightness > 128) {
            // 밝은 색상 → 어두운 색상
            const newR = Math.max(0, r - 100).toString(16).padStart(2, '0');
            const newG = Math.max(0, g - 100).toString(16).padStart(2, '0');
            const newB = Math.max(0, b - 100).toString(16).padStart(2, '0');
            return `#${newR}${newG}${newB}`;
        } else {
            // 어두운 색상 → 밝은 색상
            const newR = Math.min(255, r + 100).toString(16).padStart(2, '0');
            const newG = Math.min(255, g + 100).toString(16).padStart(2, '0');
            const newB = Math.min(255, b + 100).toString(16).padStart(2, '0');
            return `#${newR}${newG}${newB}`;
        }
    }
    
    /**
     * 출력 파일 경로 생성
     * @param {string} filePath - 원본 파일 경로
     * @returns {string} 출력 파일 경로
     */
    getOutputPath(filePath) {
        const dir = path.dirname(filePath);
        const name = path.basename(filePath, '.css');
        return path.join(dir, `${name}.dark.css`);
    }
    
    /**
     * 모든 CSS 파일 처리
     * @param {string} directory - CSS 파일 디렉토리
     */
    processAllCSSFiles(directory) {
        const files = fs.readdirSync(directory);
        const cssFiles = files.filter(file => file.endsWith('.css') && !file.includes('.dark.'));
        
        console.log(`📁 처리할 CSS 파일: ${cssFiles.length}개`);
        
        cssFiles.forEach(file => {
            const filePath = path.join(directory, file);
            this.generateDarkModeStyles(filePath);
        });
        
        console.log('🎉 모든 CSS 파일 처리 완료!');
    }
}

// CLI 실행
if (require.main === module) {
    const generator = new DarkModeGenerator();
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('사용법: node tools/dark-mode-generator.js [CSS 파일 경로 또는 디렉토리]');
        console.log('예시: node tools/dark-mode-generator.js styles/');
        console.log('예시: node tools/dark-mode-generator.js styles/main.css');
        process.exit(1);
    }
    
    const target = args[0];
    const stats = fs.statSync(target);
    
    if (stats.isDirectory()) {
        generator.processAllCSSFiles(target);
    } else if (stats.isFile()) {
        generator.generateDarkModeStyles(target);
    } else {
        console.error('❌ 잘못된 경로입니다.');
        process.exit(1);
    }
}

module.exports = DarkModeGenerator;
