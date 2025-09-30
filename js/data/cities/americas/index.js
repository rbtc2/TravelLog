/**
 * 아메리카 프리미엄 도시 데이터 통합 인덱스
 * CitySelector 한국어 지원을 위한 아메리카 도시 통합 관리
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

import { UNITED_STATES_CITIES } from './united-states.js';
import { CANADA_CITIES } from './canada.js';
import { BRAZIL_CITIES } from './brazil.js';
import { MEXICO_CITIES } from './mexico.js';
import { ARGENTINA_CITIES } from './argentina.js';

export const AMERICAS_CITIES = {
    // 국가별 데이터
    countries: {
        'United States': UNITED_STATES_CITIES,
        'Canada': CANADA_CITIES,
        'Brazil': BRAZIL_CITIES,
        'Mexico': MEXICO_CITIES,
        'Argentina': ARGENTINA_CITIES
    },
    
    // 통합 검색 인덱스
    searchIndex: {
        // 모든 한국어 도시명 → 영어 매핑
        koToEn: {},
        // 모든 영어 도시명 → 한국어 매핑
        enToKo: {}
    },
    
    // 통계 정보
    stats: {
        totalCountries: 5,
        totalCities: 0,
        lastUpdated: '2025-09-30'
    }
};

// 통합 인덱스 구축
function buildSearchIndex() {
    const koToEn = {};
    const enToKo = {};
    let totalCities = 0;
    
    Object.values(AMERICAS_CITIES.countries).forEach(countryData => {
        totalCities += countryData.cities.length;
        
        // 각 국가의 검색 인덱스를 통합 인덱스에 병합
        Object.assign(koToEn, countryData.searchIndex.koToEn);
        Object.assign(enToKo, countryData.searchIndex.enToKo);
    });
    
    AMERICAS_CITIES.searchIndex.koToEn = koToEn;
    AMERICAS_CITIES.searchIndex.enToKo = enToKo;
    AMERICAS_CITIES.stats.totalCities = totalCities;
}

// 인덱스 구축 실행
buildSearchIndex();

// 아메리카 도시 검색 유틸리티
export class AmericasCityUtils {
    /**
     * 국가별 도시 목록 조회
     * @param {string} countryName - 국가명 (영어)
     * @returns {Array} 도시 목록
     */
    static getCitiesByCountry(countryName) {
        const countryData = AMERICAS_CITIES.countries[countryName];
        if (!countryData) return [];
        
        return countryData.cities.map(city => ({
            ko: city.ko,
            en: city.en,
            priority: city.priority,
            category: city.category,
            region: city.region,
            isCapital: city.isCapital,
            country: countryName
        }));
    }
    
    /**
     * 도시 검색
     * @param {string} query - 검색어
     * @param {string} countryName - 국가명 (영어)
     * @returns {Array} 검색 결과
     */
    static searchCities(query, countryName) {
        const cities = this.getCitiesByCountry(countryName);
        if (!query || !query.trim()) return cities;
        
        const searchTerm = query.toLowerCase().trim();
        
        return cities.filter(city => 
            city.ko.toLowerCase().includes(searchTerm) ||
            city.en.toLowerCase().includes(searchTerm)
        );
    }
    
    /**
     * 한국어 도시명을 영어로 변환
     * @param {string} koreanName - 한국어 도시명
     * @returns {string|null} 영어 도시명
     */
    static convertKoToEn(koreanName) {
        return AMERICAS_CITIES.searchIndex.koToEn[koreanName] || null;
    }
    
    /**
     * 영어 도시명을 한국어로 변환
     * @param {string} englishName - 영어 도시명
     * @returns {string|null} 한국어 도시명
     */
    static convertEnToKo(englishName) {
        return AMERICAS_CITIES.searchIndex.enToKo[englishName] || null;
    }
    
    /**
     * 통계 정보 조회
     * @returns {Object} 통계 정보
     */
    static getStats() {
        return {
            ...AMERICAS_CITIES.stats,
            countries: Object.keys(AMERICAS_CITIES.countries).map(country => ({
                name: country,
                cityCount: AMERICAS_CITIES.countries[country].cities.length
            }))
        };
    }
}
