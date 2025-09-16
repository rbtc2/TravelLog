#!/usr/bin/env node

/**
 * CSS 빌드 프로세스 자동화 도구
 * 
 * 기능:
 * - CSS 파일 압축 및 최적화
 * - Critical CSS 추출
 * - CSS 번들링
 * - 성능 모니터링
 * - 자동화된 빌드 프로세스
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CSSBuilder {
    constructor() {
        this.config = {
            inputDir: './styles',
            outputDir: './dist/styles',
            criticalCSS: './dist/critical.css',
            mainCSS: './dist/main.css',
            minifiedCSS: './dist/main.min.css',
            sourceMap: true,
            watch: false,
            optimize: true
        };
        
        this.fileStats = {
            totalFiles: 0,
            processedFiles: 0,
            totalSize: 0,
            compressedSize: 0,
            compressionRatio: 0
        };
    }

    /**
     * CSS 빌드 프로세스 실행
     */
    async build() {
        console.log('🚀 CSS 빌드 프로세스 시작...\n');
        
        try {
            // 1. 출력 디렉토리 생성
            this.createOutputDirectory();
            
            // 2. CSS 파일 수집 및 분석
            const cssFiles = this.collectCSSFiles();
            console.log(`📁 발견된 CSS 파일: ${cssFiles.length}개\n`);
            
            // 3. Critical CSS 추출
            await this.extractCriticalCSS();
            
            // 4. 메인 CSS 번들링
            await this.bundleMainCSS();
            
            // 5. CSS 압축 및 최적화
            if (this.config.optimize) {
                await this.optimizeCSS();
            }
            
            // 6. 소스맵 생성
            if (this.config.sourceMap) {
                await this.generateSourceMap();
            }
            
            // 7. 성능 리포트 생성
            this.generatePerformanceReport();
            
            console.log('✅ CSS 빌드 프로세스 완료!\n');
            
        } catch (error) {
            console.error('❌ 빌드 프로세스 오류:', error.message);
            process.exit(1);
        }
    }

    /**
     * 출력 디렉토리 생성
     */
    createOutputDirectory() {
        if (!fs.existsSync(this.config.outputDir)) {
            fs.mkdirSync(this.config.outputDir, { recursive: true });
            console.log(`📁 출력 디렉토리 생성: ${this.config.outputDir}`);
        }
    }

    /**
     * CSS 파일 수집 및 분석
     */
    collectCSSFiles() {
        const cssFiles = [];
        
        const scanDirectory = (dir) => {
            const files = fs.readdirSync(dir);
            
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    scanDirectory(filePath);
                } else if (file.endsWith('.css')) {
                    const fileSize = stat.size;
                    cssFiles.push({
                        path: filePath,
                        size: fileSize,
                        relativePath: path.relative(this.config.inputDir, filePath)
                    });
                    
                    this.fileStats.totalFiles++;
                    this.fileStats.totalSize += fileSize;
                }
            });
        };
        
        scanDirectory(this.config.inputDir);
        return cssFiles;
    }

    /**
     * Critical CSS 추출
     */
    async extractCriticalCSS() {
        console.log('⚡ Critical CSS 추출 중...');
        
        const criticalFiles = [
            'base/variables.css',
            'base/reset.css',
            'base/typography.css',
            'base/layout.css',
            'utilities/performance.css',
            'components/common-components.css',
            // 모듈화된 검색 페이지 기본 스타일
            'pages/search/search-base.css',
            'pages/search/search-bar.css'
        ];
        
        let criticalCSS = '';
        
        criticalFiles.forEach(file => {
            const filePath = path.join(this.config.inputDir, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                criticalCSS += `/* ${file} */\n${content}\n\n`;
            }
        });
        
        // Critical CSS 최적화
        criticalCSS = this.optimizeCSSContent(criticalCSS);
        
        fs.writeFileSync(this.config.criticalCSS, criticalCSS);
        console.log(`✅ Critical CSS 생성: ${this.config.criticalCSS}`);
    }

    /**
     * 메인 CSS 번들링
     */
    async bundleMainCSS() {
        console.log('📦 메인 CSS 번들링 중...');
        
        const mainCSSPath = path.join(this.config.inputDir, 'main.css');
        if (!fs.existsSync(mainCSSPath)) {
            throw new Error('main.css 파일을 찾을 수 없습니다.');
        }
        
        let mainCSS = fs.readFileSync(mainCSSPath, 'utf8');
        
        // @import 문 처리
        mainCSS = this.processImports(mainCSS, this.config.inputDir);
        
        // CSS 최적화
        mainCSS = this.optimizeCSSContent(mainCSS);
        
        fs.writeFileSync(this.config.mainCSS, mainCSS);
        console.log(`✅ 메인 CSS 번들 생성: ${this.config.mainCSS}`);
    }

    /**
     * @import 문 처리
     */
    processImports(css, baseDir) {
        const importRegex = /@import\s+url\(['"]([^'"]+)['"]\);/g;
        let processedCSS = css;
        let match;
        
        while ((match = importRegex.exec(css)) !== null) {
            const importPath = match[1];
            const fullPath = path.resolve(baseDir, importPath);
            
            if (fs.existsSync(fullPath)) {
                const importedCSS = fs.readFileSync(fullPath, 'utf8');
                const processedImportedCSS = this.processImports(importedCSS, path.dirname(fullPath));
                
                processedCSS = processedCSS.replace(
                    match[0],
                    `/* ${importPath} */\n${processedImportedCSS}\n`
                );
            }
        }
        
        return processedCSS;
    }

    /**
     * CSS 최적화
     */
    async optimizeCSS() {
        console.log('🔧 CSS 최적화 중...');
        
        const mainCSS = fs.readFileSync(this.config.mainCSS, 'utf8');
        const optimizedCSS = this.optimizeCSSContent(mainCSS);
        
        fs.writeFileSync(this.config.minifiedCSS, optimizedCSS);
        
        const originalSize = Buffer.byteLength(mainCSS, 'utf8');
        const compressedSize = Buffer.byteLength(optimizedCSS, 'utf8');
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
        
        this.fileStats.compressedSize = compressedSize;
        this.fileStats.compressionRatio = compressionRatio;
        
        console.log(`✅ CSS 압축 완료: ${compressionRatio}% 압축`);
    }

    /**
     * CSS 콘텐츠 최적화
     */
    optimizeCSSContent(css) {
        return css
            // 주석 제거 (/* */ 형태)
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // 불필요한 공백 제거
            .replace(/\s+/g, ' ')
            // 세미콜론 전후 공백 제거
            .replace(/\s*;\s*/g, ';')
            // 중괄호 전후 공백 제거
            .replace(/\s*{\s*/g, '{')
            .replace(/\s*}\s*/g, '}')
            // 콜론 전후 공백 제거
            .replace(/\s*:\s*/g, ':')
            // 쉼표 전후 공백 제거
            .replace(/\s*,\s*/g, ',')
            // 불필요한 공백 제거
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * 소스맵 생성
     */
    async generateSourceMap() {
        console.log('🗺️ 소스맵 생성 중...');
        
        const sourceMap = {
            version: 3,
            sources: ['main.css'],
            names: [],
            mappings: '',
            file: 'main.min.css'
        };
        
        const sourceMapPath = this.config.minifiedCSS + '.map';
        fs.writeFileSync(sourceMapPath, JSON.stringify(sourceMap, null, 2));
        
        // CSS 파일에 소스맵 참조 추가
        const minifiedCSS = fs.readFileSync(this.config.minifiedCSS, 'utf8');
        const sourceMapComment = `\n/*# sourceMappingURL=main.min.css.map */`;
        fs.writeFileSync(this.config.minifiedCSS, minifiedCSS + sourceMapComment);
        
        console.log(`✅ 소스맵 생성: ${sourceMapPath}`);
    }

    /**
     * 성능 리포트 생성
     */
    generatePerformanceReport() {
        console.log('\n📊 성능 리포트');
        console.log('='.repeat(50));
        console.log(`총 파일 수: ${this.fileStats.totalFiles}개`);
        console.log(`처리된 파일: ${this.fileStats.processedFiles}개`);
        console.log(`원본 크기: ${this.formatBytes(this.fileStats.totalSize)}`);
        console.log(`압축된 크기: ${this.formatBytes(this.fileStats.compressedSize)}`);
        console.log(`압축률: ${this.fileStats.compressionRatio}%`);
        console.log('='.repeat(50));
        
        // 성능 리포트 파일 생성
        const report = {
            timestamp: new Date().toISOString(),
            stats: this.fileStats,
            config: this.config
        };
        
        const reportPath = path.join(this.config.outputDir, 'build-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📄 성능 리포트 저장: ${reportPath}`);
    }

    /**
     * 바이트를 읽기 쉬운 형태로 변환
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 파일 감시 모드
     */
    watch() {
        console.log('👀 파일 감시 모드 시작...');
        
        const watchDirectory = (dir) => {
            fs.watch(dir, { recursive: true }, (eventType, filename) => {
                if (filename && filename.endsWith('.css')) {
                    console.log(`📝 파일 변경 감지: ${filename}`);
                    this.build();
                }
            });
        };
        
        watchDirectory(this.config.inputDir);
    }
}

// CLI 실행
if (require.main === module) {
    const builder = new CSSBuilder();
    
    const args = process.argv.slice(2);
    
    if (args.includes('--watch') || args.includes('-w')) {
        builder.config.watch = true;
        builder.watch();
    } else {
        builder.build();
    }
}

module.exports = CSSBuilder;
