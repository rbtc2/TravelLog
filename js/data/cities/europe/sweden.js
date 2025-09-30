/**
 * Premium city data for Sweden
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const SWEDEN_CITIES = {
    country: {
        name: 'Sweden',
        nameKo: '스웨덴',
        continent: 'Europe',
        continentKo: '유럽',
        flag: '🇸🇪',
    },
    cities: [
        { ko: '스톡홀름', en: 'Stockholm', priority: 1, category: 'capital', region: 'Stockholm County', isCapital: true },
        { ko: '예테보리', en: 'Gothenburg', priority: 2, category: 'major', region: 'Västra Götaland County', isCapital: false },
        { ko: '말뫼', en: 'Malmö', priority: 3, category: 'major', region: 'Skåne County', isCapital: false },
        { ko: '웁살라', en: 'Uppsala', priority: 4, category: 'major', region: 'Uppsala County', isCapital: false },
        { ko: '바스테로스', en: 'Västerås', priority: 5, category: 'major', region: 'Västmanland County', isCapital: false },
        { ko: '오레브로', en: 'Örebro', priority: 6, category: 'major', region: 'Örebro County', isCapital: false },
        { ko: '링코핑', en: 'Linköping', priority: 7, category: 'major', region: 'Östergötland County', isCapital: false },
        { ko: '헬싱보리', en: 'Helsingborg', priority: 8, category: 'major', region: 'Skåne County', isCapital: false },
        { ko: '욘셰핑', en: 'Jönköping', priority: 9, category: 'major', region: 'Jönköping County', isCapital: false },
        { ko: '노르셰핑', en: 'Norrköping', priority: 10, category: 'major', region: 'Östergötland County', isCapital: false },
    ],
    searchIndex: {
        koToEn: {
            '스톡홀름': 'Stockholm', '예테보리': 'Gothenburg', '말뫼': 'Malmö', '웁살라': 'Uppsala',
            '바스테로스': 'Västerås', '오레브로': 'Örebro', '링코핑': 'Linköping', '헬싱보리': 'Helsingborg',
            '욘셰핑': 'Jönköping', '노르셰핑': 'Norrköping',
        },
        enToKo: {
            'Stockholm': '스톡홀름', 'Gothenburg': '예테보리', 'Malmö': '말뫼', 'Uppsala': '웁살라',
            'Västerås': '바스테로스', 'Örebro': '오레브로', 'Linköping': '링코핑', 'Helsingborg': '헬싱보리',
            'Jönköping': '욘셰핑', 'Norrköping': '노르셰핑',
        },
    },
    stats: {
        totalCities: 10,
        capitalCities: 1,
        majorCities: 9,
        touristCities: 0,
    },
};
