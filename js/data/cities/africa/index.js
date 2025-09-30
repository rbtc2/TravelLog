/**
 * Africa continent cities data aggregation
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

// 국가별 도시 데이터 import
import { EGYPT_CITIES } from './egypt.js';
import { SOUTH_AFRICA_CITIES } from './south-africa.js';
import { MOROCCO_CITIES } from './morocco.js';
import { KENYA_CITIES } from './kenya.js';
import { NIGERIA_CITIES } from './nigeria.js';

/**
 * 아프리카 대륙 도시 데이터 통합
 */
export const AFRICA_CITIES = {
    // 국가별 데이터
    countries: {
        'Egypt': EGYPT_CITIES,
        'South Africa': SOUTH_AFRICA_CITIES,
        'Morocco': MOROCCO_CITIES,
        'Kenya': KENYA_CITIES,
        'Nigeria': NIGERIA_CITIES,
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
 * 아프리카 도시 검색 유틸리티
 */
export class AfricaCityUtils {
    constructor() {
        this.buildSearchIndex();
        this.buildStats();
    }

    /**
     * 통합 검색 인덱스 구축
     */
    buildSearchIndex() {
        AFRICA_CITIES.searchIndex.koToEn = {};
        AFRICA_CITIES.searchIndex.enToKo = {};

        Object.values(AFRICA_CITIES.countries).forEach(countryData => {
            Object.assign(AFRICA_CITIES.searchIndex.koToEn, countryData.searchIndex.koToEn);
            Object.assign(AFRICA_CITIES.searchIndex.enToKo, countryData.searchIndex.enToKo);
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

        Object.values(AFRICA_CITIES.countries).forEach(countryData => {
            totalCities += countryData.stats.totalCities;
            capitalCities += countryData.stats.capitalCities;
            majorCities += countryData.stats.majorCities;
            touristCities += countryData.stats.touristCities;
        });

        AFRICA_CITIES.stats.totalCities = totalCities;
        AFRICA_CITIES.stats.capitalCities = capitalCities;
        AFRICA_CITIES.stats.majorCities = majorCities;
        AFRICA_CITIES.stats.touristCities = touristCities;
    }

    /**
     * 국가별 도시 검색
     */
    getCitiesByCountry(countryName) {
        const countryData = AFRICA_CITIES.countries[countryName];
        return countryData ? countryData.cities : [];
    }

    /**
     * 도시명 검색 (한국어/영어)
     */
    searchCities(query, countryName = null) {
        const results = [];
        const searchTerm = query.toLowerCase();

        Object.entries(AFRICA_CITIES.countries).forEach(([country, countryData]) => {
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
        return AFRICA_CITIES.searchIndex.koToEn[koreanName] || koreanName;
    }

    /**
     * 영어 도시명을 한국어로 변환
     */
    convertEnToKo(englishName) {
        return AFRICA_CITIES.searchIndex.enToKo[englishName] || englishName;
    }

    /**
     * 통계 정보 반환
     */
    getStats() {
        return AFRICA_CITIES.stats;
    }
}

// 인스턴스 생성 및 내보내기
export const africaCityUtils = new AfricaCityUtils();
