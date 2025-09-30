/**
 * Premium city data for Finland
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const FINLAND_CITIES = {
    country: {
        name: 'Finland',
        nameKo: '핀란드',
        continent: 'Europe',
        continentKo: '유럽',
        flag: '🇫🇮',
    },
    cities: [
        { ko: '헬싱키', en: 'Helsinki', priority: 1, category: 'capital', region: 'Uusimaa', isCapital: true },
        { ko: '에스포', en: 'Espoo', priority: 2, category: 'major', region: 'Uusimaa', isCapital: false },
        { ko: '탐페레', en: 'Tampere', priority: 3, category: 'major', region: 'Pirkanmaa', isCapital: false },
        { ko: '반타', en: 'Vantaa', priority: 4, category: 'major', region: 'Uusimaa', isCapital: false },
        { ko: '투르쿠', en: 'Turku', priority: 5, category: 'major', region: 'Southwest Finland', isCapital: false },
        { ko: '올루', en: 'Oulu', priority: 6, category: 'major', region: 'North Ostrobothnia', isCapital: false },
        { ko: '라티', en: 'Lahti', priority: 7, category: 'major', region: 'Päijät-Häme', isCapital: false },
        { ko: '쿠오피오', en: 'Kuopio', priority: 8, category: 'major', region: 'North Savo', isCapital: false },
        { ko: '포리', en: 'Pori', priority: 9, category: 'major', region: 'Satakunta', isCapital: false },
        { ko: '요엔수', en: 'Joensuu', priority: 10, category: 'major', region: 'North Karelia', isCapital: false },
    ],
    searchIndex: {
        koToEn: {
            '헬싱키': 'Helsinki', '에스포': 'Espoo', '탐페레': 'Tampere', '반타': 'Vantaa',
            '투르쿠': 'Turku', '올루': 'Oulu', '라티': 'Lahti', '쿠오피오': 'Kuopio',
            '포리': 'Pori', '요엔수': 'Joensuu',
        },
        enToKo: {
            'Helsinki': '헬싱키', 'Espoo': '에스포', 'Tampere': '탐페레', 'Vantaa': '반타',
            'Turku': '투르쿠', 'Oulu': '올루', 'Lahti': '라티', 'Kuopio': '쿠오피오',
            'Pori': '포리', 'Joensuu': '요엔수',
        },
    },
    stats: {
        totalCities: 10,
        capitalCities: 1,
        majorCities: 9,
        touristCities: 0,
    },
};
