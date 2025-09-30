/**
 * Premium city data for Malta
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const MALTA_CITIES = {
    country: {
        name: 'Malta',
        nameKo: '몰타',
        continent: 'Europe',
        continentKo: '유럽',
        flag: '🇲🇹',
    },
    cities: [
        { ko: '발레타', en: 'Valletta', priority: 1, category: 'capital', region: 'Valletta', isCapital: true },
        { ko: '비르키르카라', en: 'Birkirkara', priority: 2, category: 'major', region: 'Birkirkara', isCapital: false },
        { ko: '모스타', en: 'Mosta', priority: 3, category: 'major', region: 'Mosta', isCapital: false },
        { ko: '쿠미', en: 'Qormi', priority: 4, category: 'major', region: 'Qormi', isCapital: false },
        { ko: '자바르', en: 'Żabbar', priority: 5, category: 'major', region: 'Żabbar', isCapital: false },
        { ko: '산파울일바하르', en: 'San Pawl il-Baħar', priority: 6, category: 'major', region: 'San Pawl il-Baħar', isCapital: false },
        { ko: '하자르', en: 'Ħaż-Żebbuġ', priority: 7, category: 'major', region: 'Ħaż-Żebbuġ', isCapital: false },
        { ko: '시지위', en: 'Sliema', priority: 8, category: 'tourist', region: 'Sliema', isCapital: false },
        { ko: '하마룬', en: 'Ħamrun', priority: 9, category: 'major', region: 'Ħamrun', isCapital: false },
        { ko: '나샤르', en: 'Naxxar', priority: 10, category: 'major', region: 'Naxxar', isCapital: false },
    ],
    searchIndex: {
        koToEn: {
            '발레타': 'Valletta', '비르키르카라': 'Birkirkara', '모스타': 'Mosta', '쿠미': 'Qormi',
            '자바르': 'Żabbar', '산파울일바하르': 'San Pawl il-Baħar', '하자르': 'Ħaż-Żebbuġ', '시지위': 'Sliema',
            '하마룬': 'Ħamrun', '나샤르': 'Naxxar',
        },
        enToKo: {
            'Valletta': '발레타', 'Birkirkara': '비르키르카라', 'Mosta': '모스타', 'Qormi': '쿠미',
            'Żabbar': '자바르', 'San Pawl il-Baħar': '산파울일바하르', 'Ħaż-Żebbuġ': '하자르', 'Sliema': '시지위',
            'Ħamrun': '하마룬', 'Naxxar': '나샤르',
        },
    },
    stats: {
        totalCities: 10,
        capitalCities: 1,
        majorCities: 8,
        touristCities: 1,
    },
};
