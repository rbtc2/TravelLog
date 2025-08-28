/**
 * @fileoverview 국가 데이터 관리 모듈
 * @description 국가 정보를 로드, 캐싱, 관리하는 클래스
 * @author TravelLog Team
 * @version 1.0.0
 */

/**
 * 국가 객체 타입 정의
 * @typedef {Object} Country
 * @property {string} code - 국가 코드 (ISO 3166-1 alpha-2)
 * @property {string} nameEn - 영어 국가명
 * @property {string} nameKo - 한국어 국가명
 * @property {string} flag - 국가 깃발 이모지
 * @property {string} continent - 대륙명 (영어)
 * @property {string} continentKo - 대륙명 (한국어)
 * @property {boolean} popular - 인기 국가 여부
 */

/**
 * 캐시 설정 상수
 * @constant
 */
const CACHE_CONFIG = {
    /** 캐시 유효 기간 (밀리초) - 30일 */
    VALIDITY_PERIOD: 30 * 24 * 60 * 60 * 1000,
    /** 캐시 키 */
    STORAGE_KEY: 'travelLog_countries_cache',
    /** 캐시 타임스탬프 키 */
    TIMESTAMP_KEY: 'travelLog_countries_timestamp'
};

/**
 * 국가 데이터 관리자 클래스
 * @class CountriesManager
 * @description 국가 정보를 효율적으로 관리하고 캐싱하는 클래스
 */
export class CountriesManager {
    /**
     * CountriesManager 인스턴스 생성
     * @constructor
     */
    constructor() {
        /** @type {Country[]} 국가 데이터 배열 */
        this.countries = [];
        
        /** @type {boolean} 초기화 완료 여부 */
        this.isInitialized = false;
        
        /** @type {boolean} 데이터 로딩 중 여부 */
        this.isLoading = false;
        
        /** @type {Error|null} 마지막 에러 정보 */
        this.lastError = null;
        
        /** @type {Date|null} 마지막 업데이트 시간 */
        this.lastUpdated = null;
    }

    /**
     * 기본 국가 데이터 반환 (50개국)
     * @private
     * @returns {Country[]} 기본 국가 데이터 배열
     */
    getFallbackCountries() {
        return [
            // 아시아 (15개국)
            { code: 'KR', nameEn: 'South Korea', nameKo: '대한민국', flag: '🇰🇷', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'JP', nameEn: 'Japan', nameKo: '일본', flag: '🇯🇵', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'CN', nameEn: 'China', nameKo: '중국', flag: '🇨🇳', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'TH', nameEn: 'Thailand', nameKo: '태국', flag: '🇹🇭', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'VN', nameEn: 'Vietnam', nameKo: '베트남', flag: '🇻🇳', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'SG', nameEn: 'Singapore', nameKo: '싱가포르', flag: '🇸🇬', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'MY', nameEn: 'Malaysia', nameKo: '말레이시아', flag: '🇲🇾', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'ID', nameEn: 'Indonesia', nameKo: '인도네시아', flag: '🇮🇩', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'PH', nameEn: 'Philippines', nameKo: '필리핀', flag: '🇵🇭', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'IN', nameEn: 'India', nameKo: '인도', flag: '🇮🇳', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'TW', nameEn: 'Taiwan', nameKo: '대만', flag: '🇹🇼', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'HK', nameEn: 'Hong Kong', nameKo: '홍콩', flag: '🇭🇰', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'MO', nameEn: 'Macau', nameKo: '마카오', flag: '🇲🇴', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'MV', nameEn: 'Maldives', nameKo: '몰디브', flag: '🇲🇻', continent: 'Asia', continentKo: '아시아', popular: true },
            { code: 'LK', nameEn: 'Sri Lanka', nameKo: '스리랑카', flag: '🇱🇰', continent: 'Asia', continentKo: '아시아', popular: true },

            // 유럽 (15개국)
            { code: 'FR', nameEn: 'France', nameKo: '프랑스', flag: '🇫🇷', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'DE', nameEn: 'Germany', nameKo: '독일', flag: '🇩🇪', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'GB', nameEn: 'United Kingdom', nameKo: '영국', flag: '🇬🇧', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'IT', nameEn: 'Italy', nameKo: '이탈리아', flag: '🇮🇹', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'ES', nameEn: 'Spain', nameKo: '스페인', flag: '🇪🇸', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'NL', nameEn: 'Netherlands', nameKo: '네덜란드', flag: '🇳🇱', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'CH', nameEn: 'Switzerland', nameKo: '스위스', flag: '🇨🇭', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'AT', nameEn: 'Austria', nameKo: '오스트리아', flag: '🇦🇹', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'CZ', nameEn: 'Czech Republic', nameKo: '체코', flag: '🇨🇿', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'GR', nameEn: 'Greece', nameKo: '그리스', flag: '🇬🇷', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'PT', nameEn: 'Portugal', nameKo: '포르투갈', flag: '🇵🇹', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'BE', nameEn: 'Belgium', nameKo: '벨기에', flag: '🇧🇪', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'DK', nameEn: 'Denmark', nameKo: '덴마크', flag: '🇩🇰', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'SE', nameEn: 'Sweden', nameKo: '스웨덴', flag: '🇸🇪', continent: 'Europe', continentKo: '유럽', popular: true },
            { code: 'NO', nameEn: 'Norway', nameKo: '노르웨이', flag: '🇳🇴', continent: 'Europe', continentKo: '유럽', popular: true },

            // 북미 (8개국)
            { code: 'US', nameEn: 'United States', nameKo: '미국', flag: '🇺🇸', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'CA', nameEn: 'Canada', nameKo: '캐나다', flag: '🇨🇦', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'MX', nameEn: 'Mexico', nameKo: '멕시코', flag: '🇲🇽', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'CU', nameEn: 'Cuba', nameKo: '쿠바', flag: '🇨🇺', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'DO', nameEn: 'Dominican Republic', nameKo: '도미니카공화국', flag: '🇩🇴', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'CR', nameEn: 'Costa Rica', nameKo: '코스타리카', flag: '🇨🇷', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'PA', nameEn: 'Panama', nameKo: '파나마', flag: '🇵🇦', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'JM', nameEn: 'Jamaica', nameKo: '자메이카', flag: '🇯🇲', continent: 'North America', continentKo: '북미', popular: true },

            // 남미 (5개국)
            { code: 'BR', nameEn: 'Brazil', nameKo: '브라질', flag: '🇧🇷', continent: 'South America', continentKo: '남미', popular: true },
            { code: 'AR', nameEn: 'Argentina', nameKo: '아르헨티나', flag: '🇦🇷', continent: 'South America', continentKo: '남미', popular: true },
            { code: 'CL', nameEn: 'Chile', nameKo: '칠레', flag: '🇨🇱', continent: 'South America', continentKo: '남미', popular: true },
            { code: 'PE', nameEn: 'Peru', nameKo: '페루', flag: '🇵🇪', continent: 'South America', continentKo: '남미', popular: true },
            { code: 'CO', nameEn: 'Colombia', nameKo: '콜롬비아', flag: '🇨🇴', continent: 'South America', continentKo: '남미', popular: true },

            // 오세아니아 (4개국)
            { code: 'AU', nameEn: 'Australia', nameKo: '호주', flag: '🇦🇺', continent: 'Oceania', continentKo: '오세아니아', popular: true },
            { code: 'NZ', nameEn: 'New Zealand', nameKo: '뉴질랜드', flag: '🇳🇿', continent: 'Oceania', continentKo: '오세아니아', popular: true },
            { code: 'FJ', nameEn: 'Fiji', nameKo: '피지', flag: '🇫🇯', continent: 'Oceania', continentKo: '오세아니아', popular: true },
            { code: 'GU', nameEn: 'Guam', nameKo: '괌', flag: '🇬🇺', continent: 'Oceania', continentKo: '오세아니아', popular: true },

            // 아프리카 (3개국)
            { code: 'ZA', nameEn: 'South Africa', nameKo: '남아프리카공화국', flag: '🇿🇦', continent: 'Africa', continentKo: '아프리카', popular: true },
            { code: 'EG', nameEn: 'Egypt', nameKo: '이집트', flag: '🇪🇬', continent: 'Africa', continentKo: '아프리카', popular: true },
            { code: 'MA', nameEn: 'Morocco', nameKo: '모로코', flag: '🇲🇦', continent: 'Africa', continentKo: '아프리카', popular: true }
        ];
    }

    /**
     * 모듈 초기화
     * @async
     * @returns {Promise<boolean>} 초기화 성공 여부
     * @throws {Error} 초기화 실패 시 에러
     */
    async initialize() {
        try {
            this.isLoading = true;
            this.lastError = null;

            // 캐시에서 데이터 로드 시도
            const cachedData = this.loadFromCache();
            
            if (cachedData && this.isCacheValid()) {
                this.countries = cachedData;
                this.isInitialized = true;
                this.lastUpdated = new Date();
                console.log('CountriesManager: 캐시에서 데이터 로드 완료');
                return true;
            }

            // 기본 데이터 로드 (50개국)
            this.countries = this.getFallbackCountries();
            this.isInitialized = true;
            this.lastUpdated = new Date();
            
            // 캐시에 저장
            this.saveToCache(this.countries);
            
            console.log(`CountriesManager: 초기화 완료 (${this.countries.length}개국 데이터 로드)`);
            return true;

        } catch (error) {
            this.lastError = error;
            console.error('CountriesManager: 초기화 실패:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 로컬스토리지에서 캐시된 데이터 로드
     * @private
     * @returns {Country[]|null} 캐시된 국가 데이터 또는 null
     */
    loadFromCache() {
        try {
            const cachedData = localStorage.getItem(CACHE_CONFIG.STORAGE_KEY);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            return null;
        } catch (error) {
            console.warn('CountriesManager: 캐시 로드 실패:', error);
            return null;
        }
    }

    /**
     * 데이터를 로컬스토리지에 캐시로 저장
     * @private
     * @param {Country[]} countries - 저장할 국가 데이터
     * @returns {boolean} 저장 성공 여부
     */
    saveToCache(countries) {
        try {
            localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(countries));
            localStorage.setItem(CACHE_CONFIG.TIMESTAMP_KEY, Date.now().toString());
            return true;
        } catch (error) {
            console.warn('CountriesManager: 캐시 저장 실패:', error);
            return false;
        }
    }

    /**
     * 캐시 유효성 검증
     * @private
     * @returns {boolean} 캐시가 유효한지 여부
     */
    isCacheValid() {
        try {
            const timestamp = localStorage.getItem(CACHE_CONFIG.TIMESTAMP_KEY);
            if (!timestamp) {
                return false;
            }

            const cacheAge = Date.now() - parseInt(timestamp);
            return cacheAge < CACHE_CONFIG.VALIDITY_PERIOD;
        } catch (error) {
            console.warn('CountriesManager: 캐시 유효성 검증 실패:', error);
            return false;
        }
    }

    /**
     * 캐시 무효화
     * @public
     * @returns {boolean} 무효화 성공 여부
     */
    invalidateCache() {
        try {
            localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
            localStorage.removeItem(CACHE_CONFIG.TIMESTAMP_KEY);
            this.isInitialized = false;
            this.countries = [];
            this.lastUpdated = null;
            console.log('CountriesManager: 캐시 무효화 완료');
            return true;
        } catch (error) {
            console.warn('CountriesManager: 캐시 무효화 실패:', error);
            return false;
        }
    }

    /**
     * 현재 상태 정보 반환
     * @public
     * @returns {Object} 상태 정보 객체
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isLoading: this.isLoading,
            countriesCount: this.countries.length,
            lastUpdated: this.lastUpdated,
            lastError: this.lastError,
            cacheValid: this.isCacheValid()
        };
    }

    /**
     * 에러 정보 반환
     * @public
     * @returns {Error|null} 마지막 에러 또는 null
     */
    getLastError() {
        return this.lastError;
    }

    /**
     * 에러 정보 초기화
     * @public
     */
    clearError() {
        this.lastError = null;
    }
}

// 기본 인스턴스 export (싱글톤 패턴)
export const countriesManager = new CountriesManager();
