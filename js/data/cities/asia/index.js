/**
 * 아시아 프리미엄 도시 통합 관리
 * CitySelector 한국어 지원을 위한 아시아 지역 도시 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

import { SOUTH_KOREA_CITIES } from './south-korea.js';
import { JAPAN_CITIES } from './japan.js';
import { CHINA_CITIES } from './china.js';
import { THAILAND_CITIES } from './thailand.js';
import { SINGAPORE_CITIES } from './singapore.js';
import { VIETNAM_CITIES } from './vietnam.js';
import { TAIWAN_CITIES } from './taiwan.js';
import { HONG_KONG_CITIES } from './hong-kong.js';
import { MACAU_CITIES } from './macau.js';
import { MALDIVES_CITIES } from './maldives.js';
import { NEPAL_CITIES } from './nepal.js';
import { MONGOLIA_CITIES } from './mongolia.js';
import { MALAYSIA_CITIES } from './malaysia.js';
import { AZERBAIJAN_CITIES } from './azerbaijan.js';
import { BHUTAN_CITIES } from './bhutan.js';
import { CAMBODIA_CITIES } from './cambodia.js';
import { INDIA_CITIES } from './india.js';
import { QATAR_CITIES } from './qatar.js';
import { BANGLADESH_CITIES } from './bangladesh.js';

export const ASIA_CITIES = {
    // 국가별 데이터
    countries: {
        'South Korea': SOUTH_KOREA_CITIES,
        'Japan': JAPAN_CITIES,
        'China': CHINA_CITIES,
        'Thailand': THAILAND_CITIES,
        'Singapore': SINGAPORE_CITIES,
        'Vietnam': VIETNAM_CITIES,
        'Taiwan': TAIWAN_CITIES,
        'Hong Kong': HONG_KONG_CITIES,
        'Macau': MACAU_CITIES,
        'Maldives': MALDIVES_CITIES,
        'Nepal': NEPAL_CITIES,
        'Mongolia': MONGOLIA_CITIES,
        'Malaysia': MALAYSIA_CITIES,
        'Azerbaijan': AZERBAIJAN_CITIES,
        'Bhutan': BHUTAN_CITIES,
        'Cambodia': CAMBODIA_CITIES,
        'India': INDIA_CITIES,
        'Qatar': QATAR_CITIES,
        'Bangladesh': BANGLADESH_CITIES
    },
    
    // 통합 검색 인덱스
    searchIndex: {
        // 모든 한국어 도시명 → 영어 매핑
        koToEn: {},
        // 모든 영어 도시명 → 한국어 매핑
        enToKo: {},
        // 국가별 도시 그룹
        byCountry: {}
    },
    
    // 통계 정보
    stats: {
        totalCountries: 1,
        totalCities: 0,
        lastUpdated: '2024-12-29'
    }
};

/**
 * 통합 인덱스 빌드
 * 모든 국가의 도시 데이터를 통합하여 검색 인덱스 생성
 */
function buildSearchIndex() {
    // 인덱스 초기화
    ASIA_CITIES.searchIndex.koToEn = {};
    ASIA_CITIES.searchIndex.enToKo = {};
    ASIA_CITIES.searchIndex.byCountry = {};
    
    // 각 국가의 데이터를 통합 인덱스에 추가
    Object.entries(ASIA_CITIES.countries).forEach(([countryName, countryData]) => {
        const { cities, searchIndex } = countryData;
        
        // 국가별 도시 그룹 생성
        ASIA_CITIES.searchIndex.byCountry[countryName] = cities.map(city => ({
            ko: city.ko,
            en: city.en,
            priority: city.priority,
            category: city.category,
            region: city.region,
            isCapital: city.isCapital
        }));
        
        // 통합 매핑 테이블에 추가
        Object.assign(ASIA_CITIES.searchIndex.koToEn, searchIndex.koToEn);
        Object.assign(ASIA_CITIES.searchIndex.enToKo, searchIndex.enToKo);
    });
    
    // 통계 업데이트
    ASIA_CITIES.stats.totalCountries = Object.keys(ASIA_CITIES.countries).length;
    ASIA_CITIES.stats.totalCities = Object.values(ASIA_CITIES.countries)
        .reduce((total, country) => total + country.cities.length, 0);
}

// 인덱스 빌드 실행
buildSearchIndex();

/**
 * 아시아 도시 검색 유틸리티
 */
export const AsiaCityUtils = {
    /**
     * 한국어 도시명을 영어로 변환
     * @param {string} koreanCity - 한국어 도시명
     * @param {string} countryName - 국가명 (선택사항)
     * @returns {string|null} 영어 도시명 또는 null
     */
    koreanToEnglish(koreanCity, countryName = null) {
        if (countryName && ASIA_CITIES.searchIndex.byCountry[countryName]) {
            const countryCities = ASIA_CITIES.searchIndex.byCountry[countryName];
            const city = countryCities.find(c => c.ko === koreanCity);
            return city ? city.en : null;
        }
        
        return ASIA_CITIES.searchIndex.koToEn[koreanCity] || null;
    },
    
    /**
     * 영어 도시명을 한국어로 변환
     * @param {string} englishCity - 영어 도시명
     * @param {string} countryName - 국가명 (선택사항)
     * @returns {string|null} 한국어 도시명 또는 null
     */
    englishToKorean(englishCity, countryName = null) {
        if (countryName && ASIA_CITIES.searchIndex.byCountry[countryName]) {
            const countryCities = ASIA_CITIES.searchIndex.byCountry[countryName];
            const city = countryCities.find(c => c.en === englishCity);
            return city ? city.ko : null;
        }
        
        return ASIA_CITIES.searchIndex.enToKo[englishCity] || null;
    },
    
    /**
     * 국가별 도시 목록 조회
     * @param {string} countryName - 국가명
     * @returns {Array} 도시 목록
     */
    getCitiesByCountry(countryName) {
        return ASIA_CITIES.searchIndex.byCountry[countryName] || [];
    },
    
    /**
     * 도시 검색 (한국어 또는 영어)
     * @param {string} query - 검색어
     * @param {string} countryName - 국가명 (선택사항)
     * @returns {Array} 검색 결과
     */
    searchCities(query, countryName = null) {
        const searchTerm = query.toLowerCase().trim();
        
        if (countryName && ASIA_CITIES.searchIndex.byCountry[countryName]) {
            // 특정 국가에서 검색
            const countryCities = ASIA_CITIES.searchIndex.byCountry[countryName];
            return countryCities.filter(city => 
                city.ko.includes(searchTerm) || 
                city.en.toLowerCase().includes(searchTerm)
            );
        } else {
            // 모든 국가에서 검색
            const results = [];
            Object.entries(ASIA_CITIES.searchIndex.byCountry).forEach(([country, cities]) => {
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
    }
};
