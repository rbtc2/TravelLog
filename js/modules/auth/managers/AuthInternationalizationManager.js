/**
 * 인증 국제화 관리자
 * 다국어 지원 및 지역화를 담당
 * @class AuthInternationalizationManager
 * @version 1.0.0
 * @since 2024-12-29
 */
export class AuthInternationalizationManager {
    constructor(options = {}) {
        this.options = {
            // 기본 언어 설정
            defaultLanguage: 'ko',
            fallbackLanguage: 'en',
            
            // 언어 감지 설정
            autoDetectLanguage: true,
            detectFromBrowser: true,
            detectFromURL: true,
            detectFromStorage: true,
            
            // 번역 파일 설정
            translationPath: '/translations',
            loadOnDemand: true,
            cacheTranslations: true,
            
            // 날짜/시간 형식
            dateFormat: 'YYYY-MM-DD',
            timeFormat: 'HH:mm:ss',
            numberFormat: 'en-US',
            
            // RTL 언어 지원
            enableRTL: true,
            rtlLanguages: ['ar', 'he', 'fa', 'ur'],
            
            ...options
        };
        
        // 현재 언어
        this.currentLanguage = this.options.defaultLanguage;
        
        // 번역 데이터
        this.translations = new Map();
        
        // 언어 변경 리스너
        this.languageChangeListeners = new Set();
        
        // 번역 캐시
        this.translationCache = new Map();
        
        // 초기화
        this.initialize();
    }

    /**
     * 국제화를 초기화합니다
     */
    async initialize() {
        // 언어 감지
        if (this.options.autoDetectLanguage) {
            this.currentLanguage = await this.detectLanguage();
        }
        
        // 기본 언어 번역 로드
        await this.loadLanguage(this.currentLanguage);
        
        // RTL 설정 적용
        this.applyRTLSupport();
        
        // 언어 변경 이벤트 설정
        this.setupLanguageChangeEvents();
    }

    /**
     * 언어를 감지합니다
     * @returns {Promise<string>} 감지된 언어 코드
     */
    async detectLanguage() {
        // 1. URL 파라미터에서 감지
        if (this.options.detectFromURL) {
            const urlParams = new URLSearchParams(window.location.search);
            const langFromURL = urlParams.get('lang');
            if (langFromURL && this.isValidLanguage(langFromURL)) {
                return langFromURL;
            }
        }
        
        // 2. 로컬 스토리지에서 감지
        if (this.options.detectFromStorage) {
            const storedLang = localStorage.getItem('auth_language');
            if (storedLang && this.isValidLanguage(storedLang)) {
                return storedLang;
            }
        }
        
        // 3. 브라우저 언어에서 감지
        if (this.options.detectFromBrowser) {
            const browserLang = this.getBrowserLanguage();
            if (browserLang && this.isValidLanguage(browserLang)) {
                return browserLang;
            }
        }
        
        // 4. 기본 언어 반환
        return this.options.defaultLanguage;
    }

    /**
     * 브라우저 언어를 가져옵니다
     * @returns {string} 브라우저 언어 코드
     */
    getBrowserLanguage() {
        const languages = navigator.languages || [navigator.language];
        
        for (const lang of languages) {
            const languageCode = lang.split('-')[0];
            if (this.isValidLanguage(languageCode)) {
                return languageCode;
            }
        }
        
        return null;
    }

    /**
     * 유효한 언어인지 확인합니다
     * @param {string} language - 언어 코드
     * @returns {boolean} 유효 여부
     */
    isValidLanguage(language) {
        const supportedLanguages = [
            'ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'it', 'pt', 'ru',
            'ar', 'he', 'fa', 'ur', 'th', 'vi', 'id', 'ms', 'tl'
        ];
        return supportedLanguages.includes(language);
    }

    /**
     * 언어를 설정합니다
     * @param {string} language - 언어 코드
     * @param {boolean} persist - 저장 여부
     */
    async setLanguage(language, persist = true) {
        if (!this.isValidLanguage(language)) {
            throw new Error(`Unsupported language: ${language}`);
        }
        
        const previousLanguage = this.currentLanguage;
        this.currentLanguage = language;
        
        // 언어 번역 로드
        await this.loadLanguage(language);
        
        // RTL 설정 적용
        this.applyRTLSupport();
        
        // 언어 저장
        if (persist) {
            localStorage.setItem('auth_language', language);
        }
        
        // 언어 변경 이벤트 발생
        this.notifyLanguageChange(language, previousLanguage);
    }

    /**
     * 언어 번역을 로드합니다
     * @param {string} language - 언어 코드
     */
    async loadLanguage(language) {
        if (this.translations.has(language)) {
            return; // 이미 로드됨
        }
        
        try {
            const translations = await this.fetchTranslations(language);
            this.translations.set(language, translations);
        } catch (error) {
            console.warn(`Failed to load translations for ${language}:`, error);
            
            // 폴백 언어 로드
            if (language !== this.options.fallbackLanguage) {
                await this.loadLanguage(this.options.fallbackLanguage);
            }
        }
    }

    /**
     * 번역 파일을 가져옵니다
     * @param {string} language - 언어 코드
     * @returns {Promise<Object>} 번역 데이터
     */
    async fetchTranslations(language) {
        // 캐시에서 확인
        if (this.translationCache.has(language)) {
            return this.translationCache.get(language);
        }
        
        // 번역 파일 로드
        const response = await fetch(`${this.options.translationPath}/${language}.json`);
        
        if (!response.ok) {
            throw new Error(`Failed to load translations: ${response.status}`);
        }
        
        const translations = await response.json();
        
        // 캐시에 저장
        if (this.options.cacheTranslations) {
            this.translationCache.set(language, translations);
        }
        
        return translations;
    }

    /**
     * 텍스트를 번역합니다
     * @param {string} key - 번역 키
     * @param {Object} params - 매개변수
     * @param {string} language - 언어 코드 (선택사항)
     * @returns {string} 번역된 텍스트
     */
    translate(key, params = {}, language = null) {
        const targetLanguage = language || this.currentLanguage;
        const translations = this.translations.get(targetLanguage);
        
        if (!translations) {
            console.warn(`No translations found for language: ${targetLanguage}`);
            return key;
        }
        
        // 중첩된 키 지원 (예: 'auth.login.title')
        const value = this.getNestedValue(translations, key);
        
        if (value === undefined) {
            // 폴백 언어에서 찾기
            if (targetLanguage !== this.options.fallbackLanguage) {
                return this.translate(key, params, this.options.fallbackLanguage);
            }
            
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
        
        // 매개변수 치환
        return this.interpolate(value, params);
    }

    /**
     * 중첩된 값을 가져옵니다
     * @param {Object} obj - 객체
     * @param {string} path - 경로
     * @returns {any} 값
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * 텍스트에 매개변수를 삽입합니다
     * @param {string} text - 텍스트
     * @param {Object} params - 매개변수
     * @returns {string} 삽입된 텍스트
     */
    interpolate(text, params) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * RTL 지원을 적용합니다
     */
    applyRTLSupport() {
        if (!this.options.enableRTL) return;
        
        const isRTL = this.options.rtlLanguages.includes(this.currentLanguage);
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLanguage;
        
        // RTL 클래스 추가/제거
        if (isRTL) {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    }

    /**
     * 언어 변경 이벤트를 설정합니다
     */
    setupLanguageChangeEvents() {
        // 언어 변경 버튼 이벤트
        document.addEventListener('click', (event) => {
            if (event.target.matches('[data-language]')) {
                const language = event.target.getAttribute('data-language');
                this.setLanguage(language);
            }
        });
    }

    /**
     * 언어 변경 리스너를 추가합니다
     * @param {Function} listener - 리스너 함수
     */
    addLanguageChangeListener(listener) {
        this.languageChangeListeners.add(listener);
    }

    /**
     * 언어 변경 리스너를 제거합니다
     * @param {Function} listener - 리스너 함수
     */
    removeLanguageChangeListener(listener) {
        this.languageChangeListeners.delete(listener);
    }

    /**
     * 언어 변경을 알립니다
     * @param {string} newLanguage - 새 언어
     * @param {string} previousLanguage - 이전 언어
     */
    notifyLanguageChange(newLanguage, previousLanguage) {
        this.languageChangeListeners.forEach(listener => {
            try {
                listener(newLanguage, previousLanguage);
            } catch (error) {
                console.error('Language change listener error:', error);
            }
        });
    }

    /**
     * 날짜를 포맷합니다
     * @param {Date} date - 날짜 객체
     * @param {string} format - 포맷 문자열
     * @returns {string} 포맷된 날짜
     */
    formatDate(date, format = null) {
        const targetFormat = format || this.options.dateFormat;
        const locale = this.getLocale();
        
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    }

    /**
     * 시간을 포맷합니다
     * @param {Date} date - 날짜 객체
     * @param {string} format - 포맷 문자열
     * @returns {string} 포맷된 시간
     */
    formatTime(date, format = null) {
        const targetFormat = format || this.options.timeFormat;
        const locale = this.getLocale();
        
        return new Intl.DateTimeFormat(locale, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    }

    /**
     * 숫자를 포맷합니다
     * @param {number} number - 숫자
     * @param {Object} options - 옵션
     * @returns {string} 포맷된 숫자
     */
    formatNumber(number, options = {}) {
        const locale = this.getLocale();
        const numberFormat = this.options.numberFormat;
        
        return new Intl.NumberFormat(locale, {
            ...options
        }).format(number);
    }

    /**
     * 통화를 포맷합니다
     * @param {number} amount - 금액
     * @param {string} currency - 통화 코드
     * @param {Object} options - 옵션
     * @returns {string} 포맷된 통화
     */
    formatCurrency(amount, currency = 'USD', options = {}) {
        const locale = this.getLocale();
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            ...options
        }).format(amount);
    }

    /**
     * 로케일을 가져옵니다
     * @returns {string} 로케일 문자열
     */
    getLocale() {
        const languageMap = {
            'ko': 'ko-KR',
            'en': 'en-US',
            'ja': 'ja-JP',
            'zh': 'zh-CN',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-PT',
            'ru': 'ru-RU',
            'ar': 'ar-SA',
            'he': 'he-IL',
            'fa': 'fa-IR',
            'ur': 'ur-PK',
            'th': 'th-TH',
            'vi': 'vi-VN',
            'id': 'id-ID',
            'ms': 'ms-MY',
            'tl': 'tl-PH'
        };
        
        return languageMap[this.currentLanguage] || 'en-US';
    }

    /**
     * 현재 언어를 가져옵니다
     * @returns {string} 현재 언어 코드
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * 지원되는 언어 목록을 가져옵니다
     * @returns {Array} 지원되는 언어 목록
     */
    getSupportedLanguages() {
        return [
            { code: 'ko', name: '한국어', nativeName: '한국어' },
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'ja', name: 'Japanese', nativeName: '日本語' },
            { code: 'zh', name: 'Chinese', nativeName: '中文' },
            { code: 'es', name: 'Spanish', nativeName: 'Español' },
            { code: 'fr', name: 'French', nativeName: 'Français' },
            { code: 'de', name: 'German', nativeName: 'Deutsch' },
            { code: 'it', name: 'Italian', nativeName: 'Italiano' },
            { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
            { code: 'ru', name: 'Russian', nativeName: 'Русский' },
            { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
            { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
            { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
            { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
            { code: 'th', name: 'Thai', nativeName: 'ไทย' },
            { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
            { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
            { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
            { code: 'tl', name: 'Filipino', nativeName: 'Filipino' }
        ];
    }

    /**
     * 언어 선택기를 생성합니다
     * @param {Object} options - 옵션
     * @returns {HTMLElement} 언어 선택기 요소
     */
    createLanguageSelector(options = {}) {
        const {
            className = 'language-selector',
            showNativeNames = true,
            showFlags = true
        } = options;
        
        const selector = document.createElement('select');
        selector.className = className;
        selector.setAttribute('aria-label', this.translate('auth.language.selector.label'));
        
        const languages = this.getSupportedLanguages();
        
        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = showNativeNames ? lang.nativeName : lang.name;
            
            if (showFlags) {
                option.textContent = `${this.getFlagEmoji(lang.code)} ${option.textContent}`;
            }
            
            if (lang.code === this.currentLanguage) {
                option.selected = true;
            }
            
            selector.appendChild(option);
        });
        
        // 언어 변경 이벤트
        selector.addEventListener('change', (event) => {
            this.setLanguage(event.target.value);
        });
        
        return selector;
    }

    /**
     * 국기 이모지를 가져옵니다
     * @param {string} languageCode - 언어 코드
     * @returns {string} 국기 이모지
     */
    getFlagEmoji(languageCode) {
        const flagMap = {
            'ko': '🇰🇷',
            'en': '🇺🇸',
            'ja': '🇯🇵',
            'zh': '🇨🇳',
            'es': '🇪🇸',
            'fr': '🇫🇷',
            'de': '🇩🇪',
            'it': '🇮🇹',
            'pt': '🇵🇹',
            'ru': '🇷🇺',
            'ar': '🇸🇦',
            'he': '🇮🇱',
            'fa': '🇮🇷',
            'ur': '🇵🇰',
            'th': '🇹🇭',
            'vi': '🇻🇳',
            'id': '🇮🇩',
            'ms': '🇲🇾',
            'tl': '🇵🇭'
        };
        
        return flagMap[languageCode] || '🌐';
    }

    /**
     * 번역 상태를 가져옵니다
     * @returns {Object} 번역 상태
     */
    getTranslationStatus() {
        return {
            currentLanguage: this.currentLanguage,
            loadedLanguages: Array.from(this.translations.keys()),
            supportedLanguages: this.getSupportedLanguages().length,
            cacheSize: this.translationCache.size
        };
    }

    /**
     * 리소스를 정리합니다
     */
    cleanup() {
        this.translations.clear();
        this.translationCache.clear();
        this.languageChangeListeners.clear();
    }
}
