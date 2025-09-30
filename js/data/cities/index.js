/**
 * 프리미엄 도시 데이터 메인 엔트리 포인트
 * CitySelector 한국어 지원을 위한 글로벌 도시 데이터 관리
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

import { ASIA_CITIES, AsiaCityUtils } from './asia/index.js';
import { EUROPE_CITIES, EuropeCityUtils } from './europe/index.js';
import { AMERICAS_CITIES, AmericasCityUtils } from './americas/index.js';

export const PREMIUM_CITIES = {
    // 대륙별 데이터
    continents: {
        'Asia': ASIA_CITIES,
        'Europe': EUROPE_CITIES,
        'Americas': AMERICAS_CITIES
    },
    
    // 글로벌 검색 인덱스
    globalSearchIndex: {
        koToEn: {},
        enToKo: {},
        byCountry: {},
        byContinent: {}
    },
    
    // 통계
    globalStats: {
        totalContinents: 3,
        totalCountries: 0,
        totalCities: 0,
        lastUpdated: '2025-09-30'
    }
};

/**
 * 글로벌 인덱스 빌드
 * 모든 대륙의 도시 데이터를 통합하여 글로벌 검색 인덱스 생성
 */
function buildGlobalIndex() {
    // 인덱스 초기화
    PREMIUM_CITIES.globalSearchIndex.koToEn = {};
    PREMIUM_CITIES.globalSearchIndex.enToKo = {};
    PREMIUM_CITIES.globalSearchIndex.byCountry = {};
    PREMIUM_CITIES.globalSearchIndex.byContinent = {};
    
    // 각 대륙의 데이터를 글로벌 인덱스에 통합
    Object.entries(PREMIUM_CITIES.continents).forEach(([continentName, continentData]) => {
        // 대륙별 도시 그룹 초기화
        PREMIUM_CITIES.globalSearchIndex.byContinent[continentName] = {};
        
        // 국가별 데이터 처리
        Object.entries(continentData.countries).forEach(([countryName, countryData]) => {
            // 국가별 도시 그룹 생성
            PREMIUM_CITIES.globalSearchIndex.byCountry[countryName] = countryData.cities.map(city => ({
                ko: city.ko,
                en: city.en,
                priority: city.priority,
                category: city.category,
                region: city.region,
                isCapital: city.isCapital,
                continent: continentName
            }));
            
            // 대륙별 도시 그룹에 추가
            PREMIUM_CITIES.globalSearchIndex.byContinent[continentName][countryName] = 
                PREMIUM_CITIES.globalSearchIndex.byCountry[countryName];
            
            // 통합 매핑 테이블에 추가
            Object.assign(PREMIUM_CITIES.globalSearchIndex.koToEn, countryData.searchIndex.koToEn);
            Object.assign(PREMIUM_CITIES.globalSearchIndex.enToKo, countryData.searchIndex.enToKo);
        });
    });
    
    // 글로벌 통계 업데이트
    PREMIUM_CITIES.globalStats.totalCountries = Object.keys(PREMIUM_CITIES.globalSearchIndex.byCountry).length;
    PREMIUM_CITIES.globalStats.totalCities = Object.values(PREMIUM_CITIES.globalSearchIndex.byCountry)
        .reduce((total, cities) => total + cities.length, 0);
}

// 글로벌 인덱스 빌드 실행
buildGlobalIndex();

/**
 * 글로벌 도시 검색 유틸리티
 */
export const CitySearchUtils = {
    /**
     * 한국어 도시명을 영어로 변환
     * @param {string} koreanCity - 한국어 도시명
     * @param {string} countryName - 국가명 (선택사항)
     * @returns {string|null} 영어 도시명 또는 null
     */
    koreanToEnglish(koreanCity, countryName = null) {
        if (countryName && PREMIUM_CITIES.globalSearchIndex.byCountry[countryName]) {
            const countryCities = PREMIUM_CITIES.globalSearchIndex.byCountry[countryName];
            const city = countryCities.find(c => c.ko === koreanCity);
            return city ? city.en : null;
        }
        
        return PREMIUM_CITIES.globalSearchIndex.koToEn[koreanCity] || null;
    },
    
    /**
     * 영어 도시명을 한국어로 변환
     * @param {string} englishCity - 영어 도시명
     * @param {string} countryName - 국가명 (선택사항)
     * @returns {string|null} 한국어 도시명 또는 null
     */
    englishToKorean(englishCity, countryName = null) {
        if (countryName && PREMIUM_CITIES.globalSearchIndex.byCountry[countryName]) {
            const countryCities = PREMIUM_CITIES.globalSearchIndex.byCountry[countryName];
            const city = countryCities.find(c => c.en === englishCity);
            return city ? city.ko : null;
        }
        
        return PREMIUM_CITIES.globalSearchIndex.enToKo[englishCity] || null;
    },
    
    /**
     * 국가별 도시 목록 조회
     * @param {string} countryName - 국가명
     * @returns {Array} 도시 목록
     */
    getCitiesByCountry(countryName) {
        return PREMIUM_CITIES.globalSearchIndex.byCountry[countryName] || [];
    },
    
    /**
     * 대륙별 도시 목록 조회
     * @param {string} continentName - 대륙명
     * @returns {Object} 국가별 도시 목록
     */
    getCitiesByContinent(continentName) {
        return PREMIUM_CITIES.globalSearchIndex.byContinent[continentName] || {};
    },
    
    /**
     * 도시 검색 (한국어 또는 영어)
     * @param {string} query - 검색어
     * @param {string} countryName - 국가명 (선택사항)
     * @returns {Array} 검색 결과
     */
    searchCities(query, countryName = null) {
        const searchTerm = query.toLowerCase().trim();
        
        if (countryName && PREMIUM_CITIES.globalSearchIndex.byCountry[countryName]) {
            // 특정 국가에서 검색
            const countryCities = PREMIUM_CITIES.globalSearchIndex.byCountry[countryName];
            return countryCities.filter(city => 
                city.ko.includes(searchTerm) || 
                city.en.toLowerCase().includes(searchTerm)
            );
        } else {
            // 모든 국가에서 검색
            const results = [];
            Object.entries(PREMIUM_CITIES.globalSearchIndex.byCountry).forEach(([country, cities]) => {
                const countryResults = cities.filter(city => 
                    city.ko.includes(searchTerm) || 
                    city.en.toLowerCase().includes(searchTerm)
                );
                results.push(...countryResults.map(city => ({
                    ...city,
                    country: country
                })));
            });
            return results;
        }
    },
    
    /**
     * 검색어가 한국어인지 확인
     * @param {string} text - 확인할 텍스트
     * @returns {boolean} 한국어 여부
     */
    isKorean(text) {
        return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
    },
    
    /**
     * 통계 정보 조회
     * @returns {Object} 통계 정보
     */
    getStats() {
        return PREMIUM_CITIES.globalStats;
    }
};

// 아시아 전용 유틸리티도 함께 export
export { AsiaCityUtils };
