/**
 * 테마 관리 모듈
 * 다크모드/라이트모드 전환 및 상태 관리를 담당
 * 
 * 🎯 책임:
 * - 테마 상태 관리 (라이트/다크)
 * - 시스템 다크모드 감지
 * - 테마 설정 저장/로드
 * - 테마 변경 이벤트 발생
 * 
 * @class ThemeManager
 * @version 1.0.0
 * @since 2024-12-29
 */

import { StorageManager } from './storage-manager.js';

export class ThemeManager {
    constructor() {
        this.storageManager = new StorageManager();
        this.storageKey = 'travelLog_theme';
        this.currentTheme = this.loadTheme();
        this.listeners = [];
        this.systemThemeQuery = null;
        
        // 시스템 다크모드 감지 설정
        this.initializeSystemThemeDetection();
        
        // 초기 테마 적용
        this.applyTheme(this.currentTheme);
    }
    
    /**
     * 시스템 다크모드 감지를 초기화합니다
     * @private
     */
    initializeSystemThemeDetection() {
        // 시스템 다크모드 미디어 쿼리 설정
        if (window.matchMedia) {
            this.systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // 시스템 테마 변경 감지
            this.systemThemeQuery.addEventListener('change', (e) => {
                this.handleSystemThemeChange(e);
            });
        }
    }
    
    /**
     * 시스템 테마 변경을 처리합니다
     * @param {MediaQueryListEvent} event - 미디어 쿼리 이벤트
     * @private
     */
    handleSystemThemeChange(event) {
        // 사용자가 수동으로 테마를 설정한 경우가 아니라면 시스템 테마를 따름
        const userTheme = this.storageManager.load(this.storageKey, null);
        
        if (userTheme === null) {
            const systemTheme = event.matches ? 'dark' : 'light';
            this.setTheme(systemTheme, false); // 저장하지 않음
        }
    }
    
    /**
     * 저장된 테마를 로드합니다
     * @returns {string} 테마 ('light' 또는 'dark')
     * @private
     */
    loadTheme() {
        // 1. 사용자가 설정한 테마 확인
        const userTheme = this.storageManager.loadTheme();
        if (userTheme && (userTheme === 'light' || userTheme === 'dark')) {
            return userTheme;
        }
        
        // 2. 시스템 다크모드 감지
        if (this.systemThemeQuery && this.systemThemeQuery.matches) {
            return 'dark';
        }
        
        // 3. 기본값은 라이트 모드
        return 'light';
    }
    
    /**
     * 테마를 설정합니다
     * @param {string} theme - 설정할 테마 ('light' 또는 'dark')
     * @param {boolean} save - 저장 여부 (기본값: true)
     * @param {boolean} withAnimation - 애니메이션 사용 여부 (기본값: true)
     * @returns {boolean} 설정 성공 여부
     */
    setTheme(theme, save = true, withAnimation = true) {
        if (theme !== 'light' && theme !== 'dark') {
            console.error('유효하지 않은 테마입니다:', theme);
            return false;
        }
        
        const previousTheme = this.currentTheme;
        this.currentTheme = theme;
        
        // 애니메이션과 함께 테마 적용
        this.applyTheme(theme, withAnimation);
        
        // 저장
        if (save) {
            this.storageManager.saveTheme(theme);
        }
        
        // 사용자 피드백 제공 (애니메이션이 활성화된 경우에만)
        if (withAnimation) {
            this.provideUserFeedback(theme);
        }
        
        // 이벤트 발생
        this.notifyListeners({
            type: 'themeChanged',
            theme: theme,
            previousTheme: previousTheme,
            isSystemTheme: !save,
            withAnimation: withAnimation
        });
        
        console.log(`테마가 ${theme}으로 변경되었습니다. (애니메이션: ${withAnimation})`);
        return true;
    }
    
    /**
     * 현재 테마를 반환합니다
     * @returns {string} 현재 테마
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    /**
     * 다크모드 여부를 반환합니다
     * @returns {boolean} 다크모드 여부
     */
    isDarkMode() {
        return this.currentTheme === 'dark';
    }
    
    /**
     * 라이트모드 여부를 반환합니다
     * @returns {boolean} 라이트모드 여부
     */
    isLightMode() {
        return this.currentTheme === 'light';
    }
    
    /**
     * 테마를 토글합니다
     * @param {boolean} withAnimation - 애니메이션 사용 여부 (기본값: true)
     * @returns {boolean} 토글 성공 여부
     */
    toggleTheme(withAnimation = true) {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        return this.setTheme(newTheme, true, withAnimation);
    }
    
    /**
     * 시스템 테마를 따르도록 설정합니다
     * @returns {boolean} 설정 성공 여부
     */
    followSystemTheme() {
        if (!this.systemThemeQuery) {
            console.warn('시스템 테마 감지가 지원되지 않습니다.');
            return false;
        }
        
        const systemTheme = this.systemThemeQuery.matches ? 'dark' : 'light';
        return this.setTheme(systemTheme, false, true);
    }
    
    /**
     * 테마 전환 시 사용자 피드백을 제공합니다
     * @param {string} theme - 새로운 테마
     * @private
     */
    provideUserFeedback(theme) {
        // 햅틱 피드백 (지원되는 경우)
        if (navigator.vibrate) {
            navigator.vibrate(50); // 짧은 진동
        }
        
        // 시각적 피드백 (토스트 메시지 등)
        this.showThemeChangeToast(theme);
    }
    
    /**
     * 테마 변경 토스트 메시지를 표시합니다
     * @param {string} theme - 새로운 테마
     * @private
     */
    showThemeChangeToast(theme) {
        // 기존 토스트가 있다면 제거
        const existingToast = document.querySelector('.theme-change-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 토스트 메시지 생성
        const toast = document.createElement('div');
        toast.className = 'theme-change-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${theme === 'dark' ? '🌙' : '☀️'}</span>
                <span class="toast-text">${theme === 'dark' ? '다크 모드' : '라이트 모드'}로 변경되었습니다</span>
            </div>
        `;
        
        // 토스트 스타일 적용
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary, #2d2d2d);
            color: var(--text-primary, #f7fafc);
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 14px;
            font-weight: 500;
        `;
        
        // 토스트 내용 스타일
        const toastContent = toast.querySelector('.toast-content');
        toastContent.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        // 아이콘 스타일
        const toastIcon = toast.querySelector('.toast-icon');
        toastIcon.style.cssText = `
            font-size: 16px;
        `;
        
        // 문서에 추가
        document.body.appendChild(toast);
        
        // 애니메이션으로 표시
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
        // 3초 후 자동 제거
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * 접근성 설정을 확인하고 적용합니다
     * @private
     */
    checkAccessibilitySettings() {
        // 애니메이션 감소 설정 확인
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // 고대비 설정 확인
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        
        // 접근성 설정에 따른 테마 조정
        if (prefersHighContrast) {
            this.applyHighContrastTheme();
        }
        
        return {
            reducedMotion: prefersReducedMotion,
            highContrast: prefersHighContrast
        };
    }
    
    /**
     * 고대비 테마를 적용합니다
     * @private
     */
    applyHighContrastTheme() {
        const root = document.documentElement;
        
        if (this.currentTheme === 'dark') {
            root.style.setProperty('--primary-color', '#60a5fa');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--bg-primary', '#000000');
            root.style.setProperty('--bg-secondary', '#1a1a1a');
        } else {
            root.style.setProperty('--primary-color', '#1d4ed8');
            root.style.setProperty('--text-primary', '#000000');
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f8f9fa');
        }
    }
    
    /**
     * 성능 최적화를 위한 테마 전환을 수행합니다
     * @param {string} theme - 새로운 테마
     * @private
     */
    optimizedThemeTransition(theme) {
        // GPU 가속을 위한 transform 속성 사용
        const body = document.body;
        body.style.willChange = 'background-color, color';
        
        // 테마 적용
        this.applyTheme(theme, true);
        
        // 애니메이션 완료 후 willChange 제거
        setTimeout(() => {
            body.style.willChange = 'auto';
        }, 400);
        
        return true;
    }
    
    /**
     * 테마를 적용합니다
     * @param {string} theme - 적용할 테마
     * @param {boolean} withAnimation - 애니메이션 사용 여부 (기본값: true)
     * @private
     */
    applyTheme(theme, withAnimation = true) {
        const body = document.body;
        const html = document.documentElement;
        
        // 테마 전환 애니메이션 시작 (애니메이션이 활성화된 경우에만)
        if (withAnimation) {
            body.classList.add('theme-transitioning');
        }
        
        // 테마 클래스 적용
        if (theme === 'dark') {
            body.classList.add('dark');
            body.classList.remove('light');
            html.classList.add('dark');
            html.classList.remove('light');
        } else {
            body.classList.add('light');
            body.classList.remove('dark');
            html.classList.add('light');
            html.classList.remove('dark');
        }
        
        // 애니메이션 완료 후 클래스 제거
        if (withAnimation) {
            setTimeout(() => {
                body.classList.remove('theme-transitioning');
            }, 400); // 애니메이션 시간에 맞춰 조정
        }
    }
    
    /**
     * 테마 변경 리스너를 등록합니다
     * @param {Function} listener - 리스너 함수
     * @returns {Function} 리스너 제거 함수
     */
    addThemeChangeListener(listener) {
        if (typeof listener !== 'function') {
            console.error('리스너는 함수여야 합니다.');
            return () => {};
        }
        
        this.listeners.push(listener);
        
        // 리스너 제거 함수 반환
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    
    /**
     * 테마 변경 리스너를 제거합니다
     * @param {Function} listener - 제거할 리스너 함수
     * @returns {boolean} 제거 성공 여부
     */
    removeThemeChangeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * 등록된 리스너들에게 이벤트를 알립니다
     * @param {Object} eventData - 이벤트 데이터
     * @private
     */
    notifyListeners(eventData) {
        this.listeners.forEach(listener => {
            try {
                listener(eventData);
            } catch (error) {
                console.error('테마 변경 리스너 실행 중 오류:', error);
            }
        });
    }
    
    /**
     * 시스템 테마를 따르도록 설정합니다
     * @returns {boolean} 설정 성공 여부
     */
    followSystemTheme() {
        // 사용자 설정 제거
        this.storageManager.removeTheme();
        
        // 시스템 테마 감지
        const systemTheme = this.systemThemeQuery && this.systemThemeQuery.matches ? 'dark' : 'light';
        return this.setTheme(systemTheme, false);
    }
    
    /**
     * 테마 설정을 초기화합니다
     * @returns {boolean} 초기화 성공 여부
     */
    resetTheme() {
        this.storageManager.removeTheme();
        const defaultTheme = 'light';
        return this.setTheme(defaultTheme, false);
    }
    
    /**
     * 테마 정보를 반환합니다
     * @returns {Object} 테마 정보
     */
    getThemeInfo() {
        return {
            currentTheme: this.currentTheme,
            isDarkMode: this.isDarkMode(),
            isLightMode: this.isLightMode(),
            isSystemTheme: !this.storageManager.hasTheme(),
            systemPrefersDark: this.systemThemeQuery ? this.systemThemeQuery.matches : false,
            listenersCount: this.listeners.length
        };
    }
    
    /**
     * 테마 매니저를 정리합니다
     */
    cleanup() {
        // 리스너 정리
        this.listeners = [];
        
        // 시스템 테마 감지 정리
        if (this.systemThemeQuery) {
            this.systemThemeQuery.removeEventListener('change', this.handleSystemThemeChange);
            this.systemThemeQuery = null;
        }
        
        console.log('테마 매니저가 정리되었습니다.');
    }
}

/**
 * 전역 테마 매니저 인스턴스
 * 애플리케이션 전체에서 사용할 수 있는 싱글톤 인스턴스
 */
export const themeManager = new ThemeManager();

/**
 * 테마 매니저를 가져오는 유틸리티 함수
 * @returns {ThemeManager} 테마 매니저 인스턴스
 */
export const getThemeManager = () => themeManager;

/**
 * 테마를 빠르게 변경하는 유틸리티 함수들
 */
export const ThemeUtils = {
    /**
     * 다크모드로 전환
     * @returns {boolean} 전환 성공 여부
     */
    enableDarkMode: () => themeManager.setTheme('dark'),
    
    /**
     * 라이트모드로 전환
     * @returns {boolean} 전환 성공 여부
     */
    enableLightMode: () => themeManager.setTheme('light'),
    
    /**
     * 테마 토글
     * @returns {boolean} 토글 성공 여부
     */
    toggle: () => themeManager.toggleTheme(),
    
    /**
     * 현재 테마 확인
     * @returns {string} 현재 테마
     */
    getCurrent: () => themeManager.getCurrentTheme(),
    
    /**
     * 다크모드 여부 확인
     * @returns {boolean} 다크모드 여부
     */
    isDark: () => themeManager.isDarkMode(),
    
    /**
     * 라이트모드 여부 확인
     * @returns {boolean} 라이트모드 여부
     */
    isLight: () => themeManager.isLightMode(),
    
    /**
     * 접근성 설정을 확인하고 적용합니다
     * @returns {Object} 접근성 설정 정보
     */
    checkAccessibility: () => themeManager.checkAccessibilitySettings(),
    
    /**
     * 성능 최적화된 테마 전환을 수행합니다
     * @param {string} theme - 새로운 테마
     * @returns {boolean} 전환 성공 여부
     */
    optimizedTransition: (theme) => themeManager.optimizedThemeTransition(theme)
};
