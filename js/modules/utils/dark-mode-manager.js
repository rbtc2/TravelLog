/**
 * 다크모드 관리 전문가 솔루션
 * 
 * 🎯 목적:
 * - 다크모드 스타일의 중앙화된 관리
 * - 자동화된 다크모드 스타일 생성
 * - 실시간 다크모드 검증 및 수정
 * - 개발자 친화적인 API 제공
 * 
 * @class DarkModeManager
 * @version 1.0.0
 * @since 2024-12-29
 */

import { ThemeManager } from './theme-manager.js';

export class DarkModeManager {
    constructor() {
        this.themeManager = new ThemeManager();
        this.styleRegistry = new Map();
        this.autoFixEnabled = true;
        this.validationRules = this.initializeValidationRules();
        this.observers = [];
        
        // 자동 스타일 감지 및 등록
        this.initializeAutoDetection();
        
        // 실시간 검증 시작
        this.startRealTimeValidation();
    }
    
    /**
     * 검증 규칙 초기화
     * @private
     */
    initializeValidationRules() {
        return {
            // 필수 다크모드 속성들
            requiredProperties: [
                'background-color',
                'color',
                'border-color'
            ],
            
            // 자동 수정 가능한 속성들
            autoFixableProperties: [
                'background-color',
                'color',
                'border-color',
                'box-shadow'
            ],
            
            // 다크모드 색상 매핑
            colorMappings: {
                // 라이트 모드 → 다크 모드
                '#ffffff': '#2d2d2d',
                '#f8f9fa': '#1a1a1a',
                '#e2e8f0': '#4a5568',
                '#cbd5e0': '#718096',
                '#a0aec0': '#a0aec0',
                '#718096': '#cbd5e0',
                '#4a5568': '#e2e8f0',
                '#2d3748': '#f7fafc',
                '#1a202c': '#ffffff',
                '#000000': '#ffffff'
            },
            
            // 다크모드 그림자 매핑
            shadowMappings: {
                '0 1px 3px rgba(0, 0, 0, 0.1)': '0 1px 3px rgba(0, 0, 0, 0.3)',
                '0 4px 6px rgba(0, 0, 0, 0.1)': '0 4px 6px rgba(0, 0, 0, 0.3)',
                '0 10px 15px rgba(0, 0, 0, 0.1)': '0 10px 15px rgba(0, 0, 0, 0.4)',
                '0 20px 25px rgba(0, 0, 0, 0.1)': '0 20px 25px rgba(0, 0, 0, 0.5)'
            }
        };
    }
    
    /**
     * 자동 스타일 감지 초기화
     * @private
     */
    initializeAutoDetection() {
        // MutationObserver로 DOM 변경 감지
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.scanElementForDarkMode(node);
                        }
                    });
                }
            });
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // 기존 요소들 스캔
        this.scanElementForDarkMode(document.body);
    }
    
    /**
     * 요소의 다크모드 스타일 스캔
     * @param {HTMLElement} element - 스캔할 요소
     * @private
     */
    scanElementForDarkMode(element) {
        const elements = element.querySelectorAll('*');
        elements.forEach(el => {
            const className = el.className;
            if (className && !this.styleRegistry.has(className)) {
                this.registerElementForDarkMode(el);
            }
        });
    }
    
    /**
     * 요소를 다크모드 관리에 등록
     * @param {HTMLElement} element - 등록할 요소
     * @private
     */
    registerElementForDarkMode(element) {
        const className = element.className;
        if (!className || this.styleRegistry.has(className)) return;
        
        const computedStyle = getComputedStyle(element);
        const lightModeStyles = {};
        
        // 라이트 모드 스타일 추출
        this.validationRules.requiredProperties.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value !== 'rgba(0, 0, 0, 0)') {
                lightModeStyles[prop] = value;
            }
        });
        
        if (Object.keys(lightModeStyles).length > 0) {
            this.styleRegistry.set(className, {
                element: element,
                lightModeStyles: lightModeStyles,
                darkModeStyles: this.generateDarkModeStyles(lightModeStyles),
                needsDarkMode: true
            });
        }
    }
    
    /**
     * 다크모드 스타일 자동 생성
     * @param {Object} lightStyles - 라이트 모드 스타일
     * @returns {Object} 다크모드 스타일
     * @private
     */
    generateDarkModeStyles(lightStyles) {
        const darkStyles = {};
        
        Object.entries(lightStyles).forEach(([property, value]) => {
            if (this.validationRules.autoFixableProperties.includes(property)) {
                darkStyles[property] = this.convertToDarkMode(value, property);
            }
        });
        
        return darkStyles;
    }
    
    /**
     * 라이트 모드 값을 다크 모드 값으로 변환
     * @param {string} value - 라이트 모드 값
     * @param {string} property - CSS 속성
     * @returns {string} 다크 모드 값
     * @private
     */
    convertToDarkMode(value, property) {
        // 색상 매핑 확인
        if (this.validationRules.colorMappings[value]) {
            return this.validationRules.colorMappings[value];
        }
        
        // 그림자 매핑 확인
        if (property === 'box-shadow' && this.validationRules.shadowMappings[value]) {
            return this.validationRules.shadowMappings[value];
        }
        
        // 자동 색상 변환
        if (property.includes('color') || property.includes('background')) {
            return this.autoConvertColor(value);
        }
        
        return value;
    }
    
    /**
     * 색상 자동 변환
     * @param {string} color - 변환할 색상
     * @returns {string} 변환된 색상
     * @private
     */
    autoConvertColor(color) {
        // CSS 변수인 경우
        if (color.startsWith('var(')) {
            return color.replace('var(--', 'var(--dark-');
        }
        
        // RGB/RGBA 색상인 경우
        if (color.startsWith('rgb')) {
            const rgb = this.parseRgbColor(color);
            if (rgb) {
                const brightness = (rgb.r + rgb.g + rgb.b) / 3;
                if (brightness > 128) {
                    // 밝은 색상 → 어두운 색상
                    return `rgb(${Math.max(0, rgb.r - 100)}, ${Math.max(0, rgb.g - 100)}, ${Math.max(0, rgb.b - 100)})`;
                } else {
                    // 어두운 색상 → 밝은 색상
                    return `rgb(${Math.min(255, rgb.r + 100)}, ${Math.min(255, rgb.g + 100)}, ${Math.min(255, rgb.b + 100)})`;
                }
            }
        }
        
        // HEX 색상인 경우
        if (color.startsWith('#')) {
            const hex = color.replace('#', '');
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
        
        return color;
    }
    
    /**
     * RGB 색상 파싱
     * @param {string} color - RGB 색상 문자열
     * @returns {Object|null} RGB 값 객체
     * @private
     */
    parseRgbColor(color) {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };
        }
        return null;
    }
    
    /**
     * 실시간 검증 시작
     * @private
     */
    startRealTimeValidation() {
        // 테마 변경 이벤트 리스너
        this.themeManager.addThemeChangeListener((event) => {
            if (event.theme === 'dark') {
                this.applyDarkModeStyles();
            } else {
                this.applyLightModeStyles();
            }
        });
        
        // 주기적 검증 (5초마다)
        setInterval(() => {
            this.validateDarkModeStyles();
        }, 5000);
    }
    
    /**
     * 다크모드 스타일 적용
     * @private
     */
    applyDarkModeStyles() {
        this.styleRegistry.forEach((data, className) => {
            if (data.needsDarkMode && data.darkModeStyles) {
                const elements = document.querySelectorAll(`.${className}`);
                elements.forEach(element => {
                    Object.entries(data.darkModeStyles).forEach(([property, value]) => {
                        element.style.setProperty(property, value);
                    });
                });
            }
        });
    }
    
    /**
     * 라이트모드 스타일 적용
     * @private
     */
    applyLightModeStyles() {
        this.styleRegistry.forEach((data, className) => {
            if (data.needsDarkMode && data.lightModeStyles) {
                const elements = document.querySelectorAll(`.${className}`);
                elements.forEach(element => {
                    Object.entries(data.lightModeStyles).forEach(([property, value]) => {
                        element.style.setProperty(property, value);
                    });
                });
            }
        });
    }
    
    /**
     * 다크모드 스타일 검증
     * @private
     */
    validateDarkModeStyles() {
        if (this.themeManager.getCurrentTheme() !== 'dark') return;
        
        this.styleRegistry.forEach((data, className) => {
            if (data.needsDarkMode) {
                const elements = document.querySelectorAll(`.${className}`);
                elements.forEach(element => {
                    const computedStyle = getComputedStyle(element);
                    const issues = this.detectStyleIssues(element, computedStyle);
                    
                    if (issues.length > 0 && this.autoFixEnabled) {
                        this.autoFixStyleIssues(element, issues);
                    }
                });
            }
        });
    }
    
    /**
     * 스타일 이슈 감지
     * @param {HTMLElement} element - 검사할 요소
     * @param {CSSStyleDeclaration} computedStyle - 계산된 스타일
     * @returns {Array} 이슈 목록
     * @private
     */
    detectStyleIssues(element, computedStyle) {
        const issues = [];
        
        // 텍스트 가독성 검사
        const textColor = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;
        
        if (this.isLowContrast(textColor, backgroundColor)) {
            issues.push({
                type: 'contrast',
                property: 'color',
                current: textColor,
                suggested: this.getHighContrastColor(textColor, backgroundColor)
            });
        }
        
        // 배경색 검사
        if (this.isLightBackground(backgroundColor)) {
            issues.push({
                type: 'background',
                property: 'background-color',
                current: backgroundColor,
                suggested: this.getDarkBackground(backgroundColor)
            });
        }
        
        return issues;
    }
    
    /**
     * 낮은 대비 검사
     * @param {string} textColor - 텍스트 색상
     * @param {string} backgroundColor - 배경 색상
     * @returns {boolean} 낮은 대비 여부
     * @private
     */
    isLowContrast(textColor, backgroundColor) {
        // 간단한 대비 검사 (실제로는 더 정교한 알고리즘 필요)
        const textRgb = this.parseRgbColor(textColor);
        const bgRgb = this.parseRgbColor(backgroundColor);
        
        if (!textRgb || !bgRgb) return false;
        
        const textBrightness = (textRgb.r + textRgb.g + textRgb.b) / 3;
        const bgBrightness = (bgRgb.r + bgRgb.g + bgRgb.b) / 3;
        
        return Math.abs(textBrightness - bgBrightness) < 100;
    }
    
    /**
     * 밝은 배경 검사
     * @param {string} backgroundColor - 배경 색상
     * @returns {boolean} 밝은 배경 여부
     * @private
     */
    isLightBackground(backgroundColor) {
        const bgRgb = this.parseRgbColor(backgroundColor);
        if (!bgRgb) return false;
        
        const brightness = (bgRgb.r + bgRgb.g + bgRgb.b) / 3;
        return brightness > 200;
    }
    
    /**
     * 고대비 색상 생성
     * @param {string} textColor - 현재 텍스트 색상
     * @param {string} backgroundColor - 배경 색상
     * @returns {string} 고대비 색상
     * @private
     */
    getHighContrastColor(textColor, backgroundColor) {
        const bgRgb = this.parseRgbColor(backgroundColor);
        if (!bgRgb) return textColor;
        
        const bgBrightness = (bgRgb.r + bgRgb.g + bgRgb.b) / 3;
        
        if (bgBrightness > 128) {
            return '#000000'; // 어두운 배경 → 검은 텍스트
        } else {
            return '#ffffff'; // 밝은 배경 → 흰 텍스트
        }
    }
    
    /**
     * 어두운 배경 색상 생성
     * @param {string} backgroundColor - 현재 배경 색상
     * @returns {string} 어두운 배경 색상
     * @private
     */
    getDarkBackground(backgroundColor) {
        const bgRgb = this.parseRgbColor(backgroundColor);
        if (!bgRgb) return backgroundColor;
        
        const newR = Math.max(0, bgRgb.r - 100);
        const newG = Math.max(0, bgRgb.g - 100);
        const newB = Math.max(0, bgRgb.b - 100);
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }
    
    /**
     * 스타일 이슈 자동 수정
     * @param {HTMLElement} element - 수정할 요소
     * @param {Array} issues - 이슈 목록
     * @private
     */
    autoFixStyleIssues(element, issues) {
        issues.forEach(issue => {
            element.style.setProperty(issue.property, issue.suggested);
            console.log(`다크모드 자동 수정: ${issue.property} = ${issue.suggested}`);
        });
    }
    
    /**
     * 다크모드 스타일 수동 등록
     * @param {string} className - CSS 클래스명
     * @param {Object} lightStyles - 라이트 모드 스타일
     * @param {Object} darkStyles - 다크 모드 스타일
     */
    registerDarkModeStyles(className, lightStyles, darkStyles) {
        this.styleRegistry.set(className, {
            lightModeStyles: lightStyles,
            darkModeStyles: darkStyles,
            needsDarkMode: true
        });
    }
    
    /**
     * 다크모드 스타일 제거
     * @param {string} className - CSS 클래스명
     */
    unregisterDarkModeStyles(className) {
        this.styleRegistry.delete(className);
    }
    
    /**
     * 자동 수정 활성화/비활성화
     * @param {boolean} enabled - 활성화 여부
     */
    setAutoFixEnabled(enabled) {
        this.autoFixEnabled = enabled;
    }
    
    /**
     * 다크모드 상태 확인
     * @returns {boolean} 다크모드 활성화 여부
     */
    isDarkModeActive() {
        return this.themeManager.getCurrentTheme() === 'dark';
    }
    
    /**
     * 등록된 스타일 목록 조회
     * @returns {Array} 등록된 스타일 목록
     */
    getRegisteredStyles() {
        return Array.from(this.styleRegistry.keys());
    }
    
    /**
     * 다크모드 검증 리포트 생성
     * @returns {Object} 검증 리포트
     */
    generateValidationReport() {
        const report = {
            totalElements: this.styleRegistry.size,
            darkModeActive: this.isDarkModeActive(),
            issues: [],
            recommendations: []
        };
        
        this.styleRegistry.forEach((data, className) => {
            const elements = document.querySelectorAll(`.${className}`);
            elements.forEach(element => {
                const computedStyle = getComputedStyle(element);
                const issues = this.detectStyleIssues(element, computedStyle);
                
                if (issues.length > 0) {
                    report.issues.push({
                        className: className,
                        element: element,
                        issues: issues
                    });
                }
            });
        });
        
        return report;
    }
    
    /**
     * 정리 작업
     */
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.styleRegistry.clear();
    }
}

// 전역 인스턴스 생성
export const darkModeManager = new DarkModeManager();

// 전역 접근을 위한 window 객체에 추가
if (typeof window !== 'undefined') {
    window.darkModeManager = darkModeManager;
}
