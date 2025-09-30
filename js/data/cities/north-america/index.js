/**
 * North America continent cities data aggregation
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

// 국가별 도시 데이터 import
import { UNITED_STATES_CITIES } from './united-states.js';
import { CANADA_CITIES } from './canada.js';
import { MEXICO_CITIES } from './mexico.js';
import { DOMINICAN_REPUBLIC_CITIES } from './dominican-republic.js';
import { DOMINICA_CITIES } from './dominica.js';

/**
 * 북아메리카 대륙 도시 데이터 통합
 */
export const NORTH_AMERICA_CITIES = {
    // 국가별 데이터
    countries: {
        'United States': UNITED_STATES_CITIES,
        'Canada': CANADA_CITIES,
        'Mexico': MEXICO_CITIES,
        'Dominican Republic': DOMINICAN_REPUBLIC_CITIES,
        'Dominica': DOMINICA_CITIES,
    },

    // 통합 검색 인덱스
    searchIndex: {
        koToEn: {},
        enToKo: {},
    },

    // 통계 정보
    stats: {
        totalCountries: 5,
        totalCities: 0,
        capitalCities: 0,
        majorCities: 0,
        touristCities: 0,
    },
};

/**
 * 북아메리카 도시 검색 유틸리티
 */
export class NorthAmericaCityUtils {
    constructor() {
        this.buildSearchIndex();
        this.buildStats();
    }

    /**
     * 통합 검색 인덱스 구축
     */
    buildSearchIndex() {
        NORTH_AMERICA_CITIES.searchIndex.koToEn = {};
        NORTH_AMERICA_CITIES.searchIndex.enToKo = {};

        Object.values(NORTH_AMERICA_CITIES.countries).forEach(countryData => {
            Object.assign(NORTH_AMERICA_CITIES.searchIndex.koToEn, countryData.searchIndex.koToEn);
            Object.assign(NORTH_AMERICA_CITIES.searchIndex.enToKo, countryData.searchIndex.enToKo);
        });
    }

    /**
     * 통계 정보 구축
     */
    buildStats() {
        let totalCities = 0;
        let capitalCities = 0;
        let majorCities = 0;
        let touristCities = 0;

        Object.values(NORTH_AMERICA_CITIES.countries).forEach(countryData => {
            totalCities += countryData.stats.totalCities;
            capitalCities += countryData.stats.capitalCities;
            majorCities += countryData.stats.majorCities;
            touristCities += countryData.stats.touristCities;
        });

        NORTH_AMERICA_CITIES.stats.totalCities = totalCities;
        NORTH_AMERICA_CITIES.stats.capitalCities = capitalCities;
        NORTH_AMERICA_CITIES.stats.majorCities = majorCities;
        NORTH_AMERICA_CITIES.stats.touristCities = touristCities;
    }

    /**
     * 국가별 도시 검색
     */
    getCitiesByCountry(countryName) {
        const countryData = NORTH_AMERICA_CITIES.countries[countryName];
        return countryData ? countryData.cities : [];
    }

    /**
     * 도시명 검색 (한국어/영어)
     */
    searchCities(query, countryName = null) {
        const results = [];
        const searchTerm = query.toLowerCase();

        Object.entries(NORTH_AMERICA_CITIES.countries).forEach(([country, countryData]) => {
            if (countryName && country !== countryName) return;

            countryData.cities.forEach(city => {
                const koMatch = city.ko.toLowerCase().includes(searchTerm);
                const enMatch = city.en.toLowerCase().includes(searchTerm);

                if (koMatch || enMatch) {
                    results.push({
                        ...city,
                        country: country,
                        countryKo: countryData.country.nameKo,
                    });
                }
            });
        });

        return results.sort((a, b) => a.priority - b.priority);
    }

    /**
     * 한국어 도시명을 영어로 변환
     */
    convertKoToEn(koreanName) {
        return NORTH_AMERICA_CITIES.searchIndex.koToEn[koreanName] || koreanName;
    }

    /**
     * 영어 도시명을 한국어로 변환
     */
    convertEnToKo(englishName) {
        return NORTH_AMERICA_CITIES.searchIndex.enToKo[englishName] || englishName;
    }

    /**
     * 통계 정보 반환
     */
    getStats() {
        return NORTH_AMERICA_CITIES.stats;
    }
}

// 인스턴스 생성 및 내보내기
export const northAmericaCityUtils = new NorthAmericaCityUtils();
