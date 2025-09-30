/**
 * Premium city data for Dominica
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const DOMINICA_CITIES = {
    country: {
        name: 'Dominica',
        nameKo: '도미니카',
        continent: 'North America',
        continentKo: '북아메리카',
        flag: '🇩🇲',
    },
    cities: [
        { ko: '로조', en: 'Roseau', priority: 1, category: 'capital', region: 'Saint George Parish', isCapital: true },
        { ko: '포츠무스', en: 'Portsmouth', priority: 2, category: 'major', region: 'Saint John Parish', isCapital: false },
        { ko: '마리고트', en: 'Marigot', priority: 3, category: 'major', region: 'Saint Andrew Parish', isCapital: false },
        { ko: '바테', en: 'Bath Estate', priority: 4, category: 'major', region: 'Saint George Parish', isCapital: false },
        { ko: '마호트', en: 'Mahaut', priority: 5, category: 'major', region: 'Saint Paul Parish', isCapital: false },
        { ko: '윈저', en: 'Windsor', priority: 6, category: 'major', region: 'Saint George Parish', isCapital: false },
        { ko: '칼리비시', en: 'Calibishie', priority: 7, category: 'major', region: 'Saint Andrew Parish', isCapital: false },
        { ko: '그랜드베이', en: 'Grand Bay', priority: 8, category: 'major', region: 'Saint Patrick Parish', isCapital: false },
        { ko: '라플라인', en: 'La Plaine', priority: 9, category: 'major', region: 'Saint Patrick Parish', isCapital: false },
        { ko: '쿨리브리', en: 'Coulibistrie', priority: 10, category: 'major', region: 'Saint Joseph Parish', isCapital: false },
    ],
    searchIndex: {
        koToEn: {
            '로조': 'Roseau', '포츠무스': 'Portsmouth', '마리고트': 'Marigot', '바테': 'Bath Estate',
            '마호트': 'Mahaut', '윈저': 'Windsor', '칼리비시': 'Calibishie', '그랜드베이': 'Grand Bay',
            '라플라인': 'La Plaine', '쿨리브리': 'Coulibistrie',
        },
        enToKo: {
            'Roseau': '로조', 'Portsmouth': '포츠무스', 'Marigot': '마리고트', 'Bath Estate': '바테',
            'Mahaut': '마호트', 'Windsor': '윈저', 'Calibishie': '칼리비시', 'Grand Bay': '그랜드베이',
            'La Plaine': '라플라인', 'Coulibistrie': '쿨리브리',
        },
    },
    stats: {
        totalCities: 10,
        capitalCities: 1,
        majorCities: 9,
        touristCities: 0,
    },
};
