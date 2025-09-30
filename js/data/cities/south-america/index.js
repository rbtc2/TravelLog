/**
 * South America continent cities data aggregation
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

// 국가별 도시 데이터 import
import { BRAZIL_CITIES } from './brazil.js';
import { ARGENTINA_CITIES } from './argentina.js';

/**
 * 남아메리카 대륙 도시 데이터 통합
 */
export const SOUTH_AMERICA_CITIES = {
    // 국가별 데이터
    countries: {
        'Brazil': BRAZIL_CITIES,
        'Argentina': ARGENTINA_CITIES,
    },

    // 통합 검색 인덱스
    searchIndex: {
        koToEn: {},
        enToKo: {},
    },

    // 통계 정보
    stats: {
        totalCountries: 2,
        totalCities: 0,
        capitalCities: 0,
        majorCities: 0,
        touristCities: 0,
    },
};

/**
 * 남아메리카 도시 검색 유틸리티
 */
export class SouthAmericaCityUtils {
    constructor() {
        this.buildSearchIndex();
        this.buildStats();
    }

    /**
     * 통합 검색 인덱스 구축
     */
    buildSearchIndex() {
        SOUTH_AMERICA_CITIES.searchIndex.koToEn = {};
        SOUTH_AMERICA_CITIES.searchIndex.enToKo = {};

        Object.values(SOUTH_AMERICA_CITIES.countries).forEach(countryData => {
            Object.assign(SOUTH_AMERICA_CITIES.searchIndex.koToEn, countryData.searchIndex.koToEn);
            Object.assign(SOUTH_AMERICA_CITIES.searchIndex.enToKo, countryData.searchIndex.enToKo);
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

        Object.values(SOUTH_AMERICA_CITIES.countries).forEach(countryData => {
            totalCities += countryData.stats.totalCities;
            capitalCities += countryData.stats.capitalCities;
            majorCities += countryData.stats.majorCities;
            touristCities += countryData.stats.touristCities;
        });

        SOUTH_AMERICA_CITIES.stats.totalCities = totalCities;
        SOUTH_AMERICA_CITIES.stats.capitalCities = capitalCities;
        SOUTH_AMERICA_CITIES.stats.majorCities = majorCities;
        SOUTH_AMERICA_CITIES.stats.touristCities = touristCities;
    }

    /**
     * 국가별 도시 검색
     */
    getCitiesByCountry(countryName) {
        const countryData = SOUTH_AMERICA_CITIES.countries[countryName];
        return countryData ? countryData.cities : [];
    }

    /**
     * 도시명 검색 (한국어/영어)
     */
    searchCities(query, countryName = null) {
        const results = [];
        const searchTerm = query.toLowerCase();

        Object.entries(SOUTH_AMERICA_CITIES.countries).forEach(([country, countryData]) => {
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
        return SOUTH_AMERICA_CITIES.searchIndex.koToEn[koreanName] || koreanName;
    }

    /**
     * 영어 도시명을 한국어로 변환
     */
    convertEnToKo(englishName) {
        return SOUTH_AMERICA_CITIES.searchIndex.enToKo[englishName] || englishName;
    }

    /**
     * 통계 정보 반환
     */
    getStats() {
        return SOUTH_AMERICA_CITIES.stats;
    }
}

// 인스턴스 생성 및 내보내기
export const southAmericaCityUtils = new SouthAmericaCityUtils();
