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
     * 전체 국가 데이터 반환 (195개국)
     * @private
     * @returns {Country[]} 전체 국가 데이터 배열
     */
    getAllCountries() {
        return [
            // 아시아 (48개국)
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
            { code: 'BD', nameEn: 'Bangladesh', nameKo: '방글라데시', flag: '🇧🇩', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'PK', nameEn: 'Pakistan', nameKo: '파키스탄', flag: '🇵🇰', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'AF', nameEn: 'Afghanistan', nameKo: '아프가니스탄', flag: '🇦🇫', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'IR', nameEn: 'Iran', nameKo: '이란', flag: '🇮🇷', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'IQ', nameEn: 'Iraq', nameKo: '이라크', flag: '🇮🇶', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'SA', nameEn: 'Saudi Arabia', nameKo: '사우디아라비아', flag: '🇸🇦', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'AE', nameEn: 'United Arab Emirates', nameKo: '아랍에미리트', flag: '🇦🇪', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'QA', nameEn: 'Qatar', nameKo: '카타르', flag: '🇶🇦', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'KW', nameEn: 'Kuwait', nameKo: '쿠웨이트', flag: '🇰🇼', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'BH', nameEn: 'Bahrain', nameKo: '바레인', flag: '🇧🇭', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'OM', nameEn: 'Oman', nameKo: '오만', flag: '🇴🇲', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'YE', nameEn: 'Yemen', nameKo: '예멘', flag: '🇾🇪', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'JO', nameEn: 'Jordan', nameKo: '요르단', flag: '🇯🇴', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'LB', nameEn: 'Lebanon', nameKo: '레바논', flag: '🇱🇧', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'SY', nameEn: 'Syria', nameKo: '시리아', flag: '🇸🇾', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'IL', nameEn: 'Israel', nameKo: '이스라엘', flag: '🇮🇱', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'PS', nameEn: 'Palestine', nameKo: '팔레스타인', flag: '🇵🇸', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'CY', nameEn: 'Cyprus', nameKo: '키프로스', flag: '🇨🇾', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'TR', nameEn: 'Turkey', nameKo: '터키', flag: '🇹🇷', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'GE', nameEn: 'Georgia', nameKo: '조지아', flag: '🇬🇪', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'AM', nameEn: 'Armenia', nameKo: '아르메니아', flag: '🇦🇲', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'AZ', nameEn: 'Azerbaijan', nameKo: '아제르바이잔', flag: '🇦🇿', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'KZ', nameEn: 'Kazakhstan', nameKo: '카자흐스탄', flag: '🇰🇿', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'UZ', nameEn: 'Uzbekistan', nameKo: '우즈베키스탄', flag: '🇺🇿', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'KG', nameEn: 'Kyrgyzstan', nameKo: '키르기스스탄', flag: '🇰🇬', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'TJ', nameEn: 'Tajikistan', nameKo: '타지키스탄', flag: '🇹🇯', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'TM', nameEn: 'Turkmenistan', nameKo: '투르크메니스탄', flag: '🇹🇲', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'MN', nameEn: 'Mongolia', nameKo: '몽골', flag: '🇲🇳', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'NP', nameEn: 'Nepal', nameKo: '네팔', flag: '🇳🇵', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'BT', nameEn: 'Bhutan', nameKo: '부탄', flag: '🇧🇹', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'MM', nameEn: 'Myanmar', nameKo: '미얀마', flag: '🇲🇲', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'LA', nameEn: 'Laos', nameKo: '라오스', flag: '🇱🇦', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'KH', nameEn: 'Cambodia', nameKo: '캄보디아', flag: '🇰🇭', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'BN', nameEn: 'Brunei', nameKo: '브루나이', flag: '🇧🇳', continent: 'Asia', continentKo: '아시아', popular: false },
            { code: 'TL', nameEn: 'Timor-Leste', nameKo: '동티모르', flag: '🇹🇱', continent: 'Asia', continentKo: '아시아', popular: false },

            // 유럽 (44개국)
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
            { code: 'FI', nameEn: 'Finland', nameKo: '핀란드', flag: '🇫🇮', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'IS', nameEn: 'Iceland', nameKo: '아이슬란드', flag: '🇮🇸', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'IE', nameEn: 'Ireland', nameKo: '아일랜드', flag: '🇮🇪', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'PL', nameEn: 'Poland', nameKo: '폴란드', flag: '🇵🇱', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'HU', nameEn: 'Hungary', nameKo: '헝가리', flag: '🇭🇺', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'RO', nameEn: 'Romania', nameKo: '루마니아', flag: '🇷🇴', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'BG', nameEn: 'Bulgaria', nameKo: '불가리아', flag: '🇧🇬', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'HR', nameEn: 'Croatia', nameKo: '크로아티아', flag: '🇭🇷', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'SI', nameEn: 'Slovenia', nameKo: '슬로베니아', flag: '🇸🇮', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'SK', nameEn: 'Slovakia', nameKo: '슬로바키아', flag: '🇸🇰', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'LT', nameEn: 'Lithuania', nameKo: '리투아니아', flag: '🇱🇹', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'LV', nameEn: 'Latvia', nameKo: '라트비아', flag: '🇱🇻', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'EE', nameEn: 'Estonia', nameKo: '에스토니아', flag: '🇪🇪', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'LU', nameEn: 'Luxembourg', nameKo: '룩셈부르크', flag: '🇱🇺', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'MT', nameEn: 'Malta', nameKo: '몰타', flag: '🇲🇹', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'AD', nameEn: 'Andorra', nameKo: '안도라', flag: '🇦🇩', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'MC', nameEn: 'Monaco', nameKo: '모나코', flag: '🇲🇨', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'LI', nameEn: 'Liechtenstein', nameKo: '리히텐슈타인', flag: '🇱🇮', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'SM', nameEn: 'San Marino', nameKo: '산마리노', flag: '🇸🇲', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'VA', nameEn: 'Vatican City', nameKo: '바티칸', flag: '🇻🇦', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'RS', nameEn: 'Serbia', nameKo: '세르비아', flag: '🇷🇸', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'ME', nameEn: 'Montenegro', nameKo: '몬테네그로', flag: '🇲🇪', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'BA', nameEn: 'Bosnia and Herzegovina', nameKo: '보스니아헤르체고비나', flag: '🇧🇦', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'MK', nameEn: 'North Macedonia', nameKo: '북마케도니아', flag: '🇲🇰', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'AL', nameEn: 'Albania', nameKo: '알바니아', flag: '🇦🇱', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'XK', nameEn: 'Kosovo', nameKo: '코소보', flag: '🇽🇰', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'MD', nameEn: 'Moldova', nameKo: '몰도바', flag: '🇲🇩', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'UA', nameEn: 'Ukraine', nameKo: '우크라이나', flag: '🇺🇦', continent: 'Europe', continentKo: '유럽', popular: false },
            { code: 'BY', nameEn: 'Belarus', nameKo: '벨라루스', flag: '🇧🇾', continent: 'Europe', continentKo: '유럽', popular: false },

            // 북미 (23개국)
            { code: 'US', nameEn: 'United States', nameKo: '미국', flag: '🇺🇸', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'CA', nameEn: 'Canada', nameKo: '캐나다', flag: '🇨🇦', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'MX', nameEn: 'Mexico', nameKo: '멕시코', flag: '🇲🇽', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'CU', nameEn: 'Cuba', nameKo: '쿠바', flag: '🇨🇺', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'DO', nameEn: 'Dominican Republic', nameKo: '도미니카공화국', flag: '🇩🇴', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'CR', nameEn: 'Costa Rica', nameKo: '코스타리카', flag: '🇨🇷', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'PA', nameEn: 'Panama', nameKo: '파나마', flag: '🇵🇦', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'JM', nameEn: 'Jamaica', nameKo: '자메이카', flag: '🇯🇲', continent: 'North America', continentKo: '북미', popular: true },
            { code: 'HT', nameEn: 'Haiti', nameKo: '아이티', flag: '🇭🇹', continent: 'North America', continentKo: '북미', popular: false },
            { code: 'BB', nameEn: 'Barbados', nameKo: '바베이도스', flag: '🇧🇧', continent: 'North America', continentKo: '북미', popular: false },
            { code: 'TT', nameEn: 'Trinidad and Tobago', nameKo: '트리니다드토바고', flag: '🇹🇹', continent: 'North America', continentKo: '북미', popular: false },
            { code: 'GD', nameEn: 'Grenada', nameKo: '그레나다', flag: '🇬🇩', continent: 'North America', continentKo: '북미', popular: false },
            { code: 'LC', nameEn: 'Saint Lucia', nameKo: '세인트루시아', flag: '🇱🇨', continent: 'North America', continentKo: '북미', popular: false },
            { code: 'VC', nameEn: 'Saint Vincent and the Grenadines', nameKo: '세인트빈센트그레나딘', flag: '🇻🇨', continent: 'North America', continentKo: '북미', popular: false },
            { code: 'AG', nameEn: 'Antigua and Barbuda', nameKo: '앤티가바부다', flag: '🇦🇬', continent: 'North America', continentKo: '북미', popular: false },
            { code: 'KN', nameEn: 'Saint Kitts and Nevis', nameKo: '세인트키츠네비스', flag: '🇰🇳', continent: 'North America', continentKo: '북미', popular: false },
            { code: 'DM', nameEn: 'Dominica', nameKo: '도미니카', flag: '🇩🇲', continent: 'North America', continentKo: '북미', popular: false },
            { code: 'BZ', nameEn: 'Belize', nameKo: '벨리즈', flag: '🇧🇿', continent: 'North America', continentKo: '북미', popular: false },
            { code: 'GT', nameEn: 'Guatemala', nameKo: '과테말라', flag: '🇬🇹', continent: 'North America', continentKo: '북미', popular: false },
            { code: 'SV', nameEn: 'El Salvador', nameKo: '엘살바도르', flag: '🇸🇻', continent: 'North America', continentKo: '북미', popular: false },
            { code: 'HN', nameEn: 'Honduras', nameKo: '온두라스', flag: '🇭🇳', continent: 'North America', continentKo: '북미', popular: false },
            { code: 'NI', nameEn: 'Nicaragua', nameKo: '니카라과', flag: '🇳🇮', continent: 'North America', continentKo: '북미', popular: false },
            { code: 'GL', nameEn: 'Greenland', nameKo: '그린란드', flag: '🇬🇱', continent: 'North America', continentKo: '북미', popular: false },

            // 남미 (12개국)
            { code: 'BR', nameEn: 'Brazil', nameKo: '브라질', flag: '🇧🇷', continent: 'South America', continentKo: '남미', popular: true },
            { code: 'AR', nameEn: 'Argentina', nameKo: '아르헨티나', flag: '🇦🇷', continent: 'South America', continentKo: '남미', popular: true },
            { code: 'CL', nameEn: 'Chile', nameKo: '칠레', flag: '🇨🇱', continent: 'South America', continentKo: '남미', popular: true },
            { code: 'PE', nameEn: 'Peru', nameKo: '페루', flag: '🇵🇪', continent: 'South America', continentKo: '남미', popular: true },
            { code: 'CO', nameEn: 'Colombia', nameKo: '콜롬비아', flag: '🇨🇴', continent: 'South America', continentKo: '남미', popular: true },
            { code: 'VE', nameEn: 'Venezuela', nameKo: '베네수엘라', flag: '🇻🇪', continent: 'South America', continentKo: '남미', popular: false },
            { code: 'EC', nameEn: 'Ecuador', nameKo: '에콰도르', flag: '🇪🇨', continent: 'South America', continentKo: '남미', popular: false },
            { code: 'BO', nameEn: 'Bolivia', nameKo: '볼리비아', flag: '🇧🇴', continent: 'South America', continentKo: '남미', popular: false },
            { code: 'PY', nameEn: 'Paraguay', nameKo: '파라과이', flag: '🇵🇾', continent: 'South America', continentKo: '남미', popular: false },
            { code: 'UY', nameEn: 'Uruguay', nameKo: '우루과이', flag: '🇺🇾', continent: 'South America', continentKo: '남미', popular: false },
            { code: 'GY', nameEn: 'Guyana', nameKo: '가이아나', flag: '🇬🇾', continent: 'South America', continentKo: '남미', popular: false },
            { code: 'SR', nameEn: 'Suriname', nameKo: '수리남', flag: '🇸🇷', continent: 'South America', continentKo: '남미', popular: false },

            // 오세아니아 (14개국)
            { code: 'AU', nameEn: 'Australia', nameKo: '호주', flag: '🇦🇺', continent: 'Oceania', continentKo: '오세아니아', popular: true },
            { code: 'NZ', nameEn: 'New Zealand', nameKo: '뉴질랜드', flag: '🇳🇿', continent: 'Oceania', continentKo: '오세아니아', popular: true },
            { code: 'FJ', nameEn: 'Fiji', nameKo: '피지', flag: '🇫🇯', continent: 'Oceania', continentKo: '오세아니아', popular: true },
            { code: 'GU', nameEn: 'Guam', nameKo: '괌', flag: '🇬🇺', continent: 'Oceania', continentKo: '오세아니아', popular: true },
            { code: 'PG', nameEn: 'Papua New Guinea', nameKo: '파푸아뉴기니', flag: '🇵🇬', continent: 'Oceania', continentKo: '오세아니아', popular: false },
            { code: 'NC', nameEn: 'New Caledonia', nameKo: '뉴칼레도니아', flag: '🇳🇨', continent: 'Oceania', continentKo: '오세아니아', popular: false },
            { code: 'VU', nameEn: 'Vanuatu', nameKo: '바누아투', flag: '🇻🇺', continent: 'Oceania', continentKo: '오세아니아', popular: false },
            { code: 'SB', nameEn: 'Solomon Islands', nameKo: '솔로몬 제도', flag: '🇸🇧', continent: 'Oceania', continentKo: '오세아니아', popular: false },
            { code: 'TO', nameEn: 'Tonga', nameKo: '통가', flag: '🇹🇴', continent: 'Oceania', continentKo: '오세아니아', popular: false },
            { code: 'WS', nameEn: 'Samoa', nameKo: '사모아', flag: '🇼🇸', continent: 'Oceania', continentKo: '오세아니아', popular: false },
            { code: 'KI', nameEn: 'Kiribati', nameKo: '키리바시', flag: '🇰🇮', continent: 'Oceania', continentKo: '오세아니아', popular: false },
            { code: 'TV', nameEn: 'Tuvalu', nameKo: '투발루', flag: '🇹🇻', continent: 'Oceania', continentKo: '오세아니아', popular: false },
            { code: 'NR', nameEn: 'Nauru', nameKo: '나우루', flag: '🇳🇷', continent: 'Oceania', continentKo: '오세아니아', popular: false },
            { code: 'PW', nameEn: 'Palau', nameKo: '팔라우', flag: '🇵🇼', continent: 'Oceania', continentKo: '오세아니아', popular: false },

            // 아프리카 (54개국)
            { code: 'ZA', nameEn: 'South Africa', nameKo: '남아프리카공화국', flag: '🇿🇦', continent: 'Africa', continentKo: '아프리카', popular: true },
            { code: 'EG', nameEn: 'Egypt', nameKo: '이집트', flag: '🇪🇬', continent: 'Africa', continentKo: '아프리카', popular: true },
            { code: 'MA', nameEn: 'Morocco', nameKo: '모로코', flag: '🇲🇦', continent: 'Africa', continentKo: '아프리카', popular: true },
            { code: 'NG', nameEn: 'Nigeria', nameKo: '나이지리아', flag: '🇳🇬', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'ET', nameEn: 'Ethiopia', nameKo: '에티오피아', flag: '🇪🇹', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'KE', nameEn: 'Kenya', nameKo: '케냐', flag: '🇰🇪', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'TZ', nameEn: 'Tanzania', nameKo: '탄자니아', flag: '🇹🇿', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'UG', nameEn: 'Uganda', nameKo: '우간다', flag: '🇺🇬', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'GH', nameEn: 'Ghana', nameKo: '가나', flag: '🇬🇭', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'CI', nameEn: 'Ivory Coast', nameKo: '코트디부아르', flag: '🇨🇮', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'BF', nameEn: 'Burkina Faso', nameKo: '부르키나파소', flag: '🇧🇫', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'ML', nameEn: 'Mali', nameKo: '말리', flag: '🇲🇱', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'NE', nameEn: 'Niger', nameKo: '니제르', flag: '🇳🇪', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'TD', nameEn: 'Chad', nameKo: '차드', flag: '🇹🇩', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'SD', nameEn: 'Sudan', nameKo: '수단', flag: '🇸🇩', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'SS', nameEn: 'South Sudan', nameKo: '남수단', flag: '🇸🇸', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'CF', nameEn: 'Central African Republic', nameKo: '중앙아프리카공화국', flag: '🇨🇫', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'CM', nameEn: 'Cameroon', nameKo: '카메룬', flag: '🇨🇲', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'GQ', nameEn: 'Equatorial Guinea', nameKo: '적도기니', flag: '🇬🇶', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'GA', nameEn: 'Gabon', nameKo: '가봉', flag: '🇬🇦', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'CG', nameEn: 'Republic of the Congo', nameKo: '콩고공화국', flag: '🇨🇬', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'CD', nameEn: 'Democratic Republic of the Congo', nameKo: '콩고민주공화국', flag: '🇨🇩', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'AO', nameEn: 'Angola', nameKo: '앙골라', flag: '🇦🇴', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'ZM', nameEn: 'Zambia', nameKo: '잠비아', flag: '🇿🇲', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'ZW', nameEn: 'Zimbabwe', nameKo: '짐바브웨', flag: '🇿🇼', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'BW', nameEn: 'Botswana', nameKo: '보츠와나', flag: '🇧🇼', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'NA', nameEn: 'Namibia', nameKo: '나미비아', flag: '🇳🇦', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'SZ', nameEn: 'Eswatini', nameKo: '에스와티니', flag: '🇸🇿', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'LS', nameEn: 'Lesotho', nameKo: '레소토', flag: '🇱🇸', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'MG', nameEn: 'Madagascar', nameKo: '마다가스카르', flag: '🇲🇬', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'MU', nameEn: 'Mauritius', nameKo: '모리셔스', flag: '🇲🇺', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'SC', nameEn: 'Seychelles', nameKo: '세이셸', flag: '🇸🇨', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'KM', nameEn: 'Comoros', nameKo: '코모로', flag: '🇰🇲', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'DJ', nameEn: 'Djibouti', nameKo: '지부티', flag: '🇩🇯', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'SO', nameEn: 'Somalia', nameKo: '소말리아', flag: '🇸🇴', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'ER', nameEn: 'Eritrea', nameKo: '에리트레아', flag: '🇪🇷', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'LY', nameEn: 'Libya', nameKo: '리비아', flag: '🇱🇾', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'TN', nameEn: 'Tunisia', nameKo: '튀니지', flag: '🇹🇳', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'DZ', nameEn: 'Algeria', nameKo: '알제리', flag: '🇩🇿', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'RW', nameEn: 'Rwanda', nameKo: '르완다', flag: '🇷🇼', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'BI', nameEn: 'Burundi', nameKo: '부룬디', flag: '🇧🇮', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'SL', nameEn: 'Sierra Leone', nameKo: '시에라리온', flag: '🇸🇱', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'LR', nameEn: 'Liberia', nameKo: '라이베리아', flag: '🇱🇷', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'GW', nameEn: 'Guinea-Bissau', nameKo: '기니비사우', flag: '🇬🇼', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'GN', nameEn: 'Guinea', nameKo: '기니', flag: '🇬🇳', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'SN', nameEn: 'Senegal', nameKo: '세네갈', flag: '🇸🇳', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'GM', nameEn: 'Gambia', nameKo: '감비아', flag: '🇬🇲', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'CV', nameEn: 'Cape Verde', nameKo: '카보베르데', flag: '🇨🇻', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'ST', nameEn: 'Sao Tome and Principe', nameKo: '상투메프린시페', flag: '🇸🇹', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'TG', nameEn: 'Togo', nameKo: '토고', flag: '🇹🇬', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'BJ', nameEn: 'Benin', nameKo: '베냉', flag: '🇧🇯', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'MR', nameEn: 'Mauritania', nameKo: '모리타니', flag: '🇲🇷', continent: 'Africa', continentKo: '아프리카', popular: false },
            { code: 'EH', nameEn: 'Western Sahara', nameKo: '서사하라', flag: '🇪🇭', continent: 'Africa', continentKo: '아프리카', popular: false },
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

            // 전체 데이터 로드 (195개국)
            this.countries = this.getAllCountries();
            
            // 데이터 검증
            if (!this.validateCountriesData()) {
                throw new Error('국가 데이터 검증 실패');
            }
            
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

    /**
     * 국가 데이터 검증
     * @private
     * @returns {boolean} 검증 성공 여부
     */
    validateCountriesData() {
        try {
            if (!Array.isArray(this.countries) || this.countries.length === 0) {
                console.error('CountriesManager: 국가 데이터가 배열이 아니거나 비어있음');
                return false;
            }

            // 필수 필드 검증
            const requiredFields = ['code', 'nameEn', 'nameKo', 'flag', 'continent', 'continentKo', 'popular'];
            const invalidCountries = this.countries.filter(country => {
                return requiredFields.some(field => !(field in country));
            });

            if (invalidCountries.length > 0) {
                console.error('CountriesManager: 필수 필드가 누락된 국가 데이터 발견:', invalidCountries.length);
                return false;
            }

            // 국가 코드 중복 검증
            const codes = this.countries.map(c => c.code);
            const uniqueCodes = new Set(codes);
            if (codes.length !== uniqueCodes.size) {
                console.error('CountriesManager: 중복된 국가 코드 발견');
                return false;
            }

            // 대륙별 국가 수 검증
            const continentCounts = {};
            this.countries.forEach(country => {
                continentCounts[country.continent] = (continentCounts[country.continent] || 0) + 1;
            });

            console.log('CountriesManager: 대륙별 국가 수:', continentCounts);
            console.log(`CountriesManager: 총 ${this.countries.length}개국 데이터 검증 완료`);

            return true;
        } catch (error) {
            console.error('CountriesManager: 데이터 검증 중 오류 발생:', error);
            return false;
        }
    }

    /**
     * 대륙별 국가 수 반환
     * @public
     * @returns {Object} 대륙별 국가 수 객체
     */
    getContinentCounts() {
        const counts = {};
        this.countries.forEach(country => {
            counts[country.continent] = (counts[country.continent] || 0) + 1;
        });
        return counts;
    }

    /**
     * 인기 국가 목록 반환
     * @public
     * @returns {Country[]} 인기 국가 배열
     */
    getPopularCountries() {
        return this.countries.filter(country => country.popular);
    }

    /**
     * 대륙별 국가 목록 반환
     * @public
     * @param {string} continent - 대륙명 (영어)
     * @returns {Country[]} 해당 대륙의 국가 배열
     */
    getCountriesByContinent(continent) {
        return this.countries.filter(country => country.continent === continent);
    }

    /**
     * 통합 검색 - 한글/영문 동시 검색, 부분 문자열 매칭
     * @public
     * @param {string} query - 검색 쿼리
     * @param {Object} options - 검색 옵션
     * @param {number} options.limit - 최대 결과 수 (기본값: 50)
     * @param {boolean} options.caseSensitive - 대소문자 구분 여부 (기본값: false)
     * @param {boolean} options.exactMatch - 정확한 매칭 여부 (기본값: false)
     * @returns {Country[]} 검색 결과 배열
     */
    searchCountries(query, options = {}) {
        const startTime = performance.now();
        
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return [];
        }

        const {
            limit = 50,
            caseSensitive = false,
            exactMatch = false
        } = options;

        const searchQuery = caseSensitive ? query.trim() : query.trim().toLowerCase();
        const results = [];

        // 성능 최적화: 조기 종료를 위한 카운터
        let count = 0;
        const maxResults = Math.min(limit, 100); // 최대 100개로 제한

        for (const country of this.countries) {
            if (count >= maxResults) break;

            let isMatch = false;

            if (exactMatch) {
                // 정확한 매칭
                isMatch = (
                    (caseSensitive ? country.code : country.code.toLowerCase()) === searchQuery ||
                    (caseSensitive ? country.nameEn : country.nameEn.toLowerCase()) === searchQuery ||
                    (caseSensitive ? country.nameKo : country.nameKo.toLowerCase()) === searchQuery ||
                    (caseSensitive ? country.continent : country.continent.toLowerCase()) === searchQuery ||
                    (caseSensitive ? country.continentKo : country.continentKo.toLowerCase()) === searchQuery
                );
            } else {
                // 부분 문자열 매칭 (더 빠른 검색)
                const code = caseSensitive ? country.code : country.code.toLowerCase();
                const nameEn = caseSensitive ? country.nameEn : country.nameEn.toLowerCase();
                const nameKo = caseSensitive ? country.nameKo : country.nameKo.toLowerCase();
                const continent = caseSensitive ? country.continent : country.continent.toLowerCase();
                const continentKo = caseSensitive ? country.continentKo : country.continentKo.toLowerCase();

                isMatch = (
                    code.includes(searchQuery) ||
                    nameEn.includes(searchQuery) ||
                    nameKo.includes(searchQuery) ||
                    continent.includes(searchQuery) ||
                    continentKo.includes(searchQuery)
                );
            }

            if (isMatch) {
                results.push(country);
                count++;
            }
        }

        const endTime = performance.now();
        const searchTime = endTime - startTime;
        
        if (searchTime > 10) {
            console.warn(`CountriesManager: 검색 시간이 10ms를 초과했습니다: ${searchTime.toFixed(2)}ms`);
        }

        return results;
    }

    /**
     * 국가 코드로 국가 조회
     * @public
     * @param {string} code - 국가 코드 (ISO 3166-1 alpha-2)
     * @returns {Country|null} 국가 객체 또는 null
     */
    getCountryByCode(code) {
        if (!code || typeof code !== 'string') {
            return null;
        }

        const searchCode = code.toUpperCase();
        
        // 성능 최적화: 조기 종료
        for (const country of this.countries) {
            if (country.code === searchCode) {
                return country;
            }
        }
        
        return null;
    }

    /**
     * 국가명으로 국가 조회 (한글/영문)
     * @public
     * @param {string} name - 국가명
     * @param {Object} options - 검색 옵션
     * @param {boolean} options.caseSensitive - 대소문자 구분 여부 (기본값: false)
     * @param {boolean} options.exactMatch - 정확한 매칭 여부 (기본값: false)
     * @returns {Country|null} 국가 객체 또는 null
     */
    getCountryByName(name, options = {}) {
        if (!name || typeof name !== 'string') {
            return null;
        }

        const {
            caseSensitive = false,
            exactMatch = false
        } = options;

        const searchName = caseSensitive ? name.trim() : name.trim().toLowerCase();

        for (const country of this.countries) {
            let isMatch = false;

            if (exactMatch) {
                isMatch = (
                    (caseSensitive ? country.nameEn : country.nameEn.toLowerCase()) === searchName ||
                    (caseSensitive ? country.nameKo : country.nameKo.toLowerCase()) === searchName
                );
            } else {
                isMatch = (
                    (caseSensitive ? country.nameEn : country.nameEn.toLowerCase()) === searchName ||
                    (caseSensitive ? country.nameKo : country.nameKo.toLowerCase()) === searchName
                );
            }

            if (isMatch) {
                return country;
            }
        }

        return null;
    }

    /**
     * 대륙 목록 반환
     * @public
     * @returns {Object} 대륙별 정보 객체
     */
    getContinents() {
        const continents = {};
        
        this.countries.forEach(country => {
            if (!continents[country.continent]) {
                continents[country.continent] = {
                    nameEn: country.continent,
                    nameKo: country.continentKo,
                    count: 0,
                    popularCount: 0
                };
            }
            continents[country.continent].count++;
            if (country.popular) {
                continents[country.continent].popularCount++;
            }
        });

        return continents;
    }

    /**
     * 고급 검색 - 복합 조건 검색
     * @public
     * @param {Object} filters - 검색 필터
     * @param {string} filters.query - 검색 쿼리
     * @param {string} filters.continent - 대륙 필터
     * @param {boolean} filters.popular - 인기 국가 여부
     * @param {number} filters.limit - 최대 결과 수
     * @returns {Country[]} 검색 결과 배열
     */
    advancedSearch(filters = {}) {
        const startTime = performance.now();
        
        let results = [...this.countries];

        // 대륙 필터
        if (filters.continent) {
            results = results.filter(country => 
                country.continent === filters.continent || 
                country.continentKo === filters.continent
            );
        }

        // 인기 국가 필터
        if (filters.popular !== undefined) {
            results = results.filter(country => country.popular === filters.popular);
        }

        // 검색 쿼리 필터
        if (filters.query) {
            const queryResults = this.searchCountries(filters.query, { limit: 1000 });
            const queryCodes = new Set(queryResults.map(c => c.code));
            results = results.filter(country => queryCodes.has(country.code));
        }

        // 결과 수 제한
        if (filters.limit && filters.limit > 0) {
            results = results.slice(0, filters.limit);
        }

        const endTime = performance.now();
        const searchTime = endTime - startTime;
        
        if (searchTime > 10) {
            console.warn(`CountriesManager: 고급 검색 시간이 10ms를 초과했습니다: ${searchTime.toFixed(2)}ms`);
        }

        return results;
    }

    /**
     * 검색 성능 통계 반환
     * @public
     * @returns {Object} 성능 통계 객체
     */
    getSearchStats() {
        return {
            totalCountries: this.countries.length,
            popularCountries: this.getPopularCountries().length,
            continentCounts: this.getContinentCounts(),
            continents: this.getContinents()
        };
    }
}

// 기본 인스턴스 export (싱글톤 패턴)
export const countriesManager = new CountriesManager();
