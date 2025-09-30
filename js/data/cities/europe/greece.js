/**
 * Premium city data for Greece
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const GREECE_CITIES = {
    country: {
        name: 'Greece',
        nameKo: '그리스',
        continent: 'Europe',
        continentKo: '유럽',
        flag: '🇬🇷',
    },
    cities: [
        { ko: '아테네', en: 'Athens', priority: 1, category: 'capital', region: 'Attica', isCapital: true },
        { ko: '테살로니키', en: 'Thessaloniki', priority: 2, category: 'major', region: 'Central Macedonia', isCapital: false },
        { ko: '파트라', en: 'Patras', priority: 3, category: 'major', region: 'Western Greece', isCapital: false },
        { ko: '피레아스', en: 'Piraeus', priority: 4, category: 'major', region: 'Attica', isCapital: false },
        { ko: '라리사', en: 'Larissa', priority: 5, category: 'major', region: 'Thessaly', isCapital: false },
        { ko: '헤라클리온', en: 'Heraklion', priority: 6, category: 'major', region: 'Crete', isCapital: false },
        { ko: '카발라', en: 'Kavala', priority: 7, category: 'major', region: 'Eastern Macedonia and Thrace', isCapital: false },
        { ko: '코르푸', en: 'Corfu', priority: 8, category: 'tourist', region: 'Ionian Islands', isCapital: false },
        { ko: '로도스', en: 'Rhodes', priority: 9, category: 'tourist', region: 'South Aegean', isCapital: false },
        { ko: '산토리니', en: 'Santorini', priority: 10, category: 'tourist', region: 'South Aegean', isCapital: false },
    ],
    searchIndex: {
        koToEn: {
            '아테네': 'Athens', '테살로니키': 'Thessaloniki', '파트라': 'Patras', '피레아스': 'Piraeus',
            '라리사': 'Larissa', '헤라클리온': 'Heraklion', '카발라': 'Kavala', '코르푸': 'Corfu',
            '로도스': 'Rhodes', '산토리니': 'Santorini',
        },
        enToKo: {
            'Athens': '아테네', 'Thessaloniki': '테살로니키', 'Patras': '파트라', 'Piraeus': '피레아스',
            'Larissa': '라리사', 'Heraklion': '헤라클리온', 'Kavala': '카발라', 'Corfu': '코르푸',
            'Rhodes': '로도스', 'Santorini': '산토리니',
        },
    },
    stats: {
        totalCities: 10,
        capitalCities: 1,
        majorCities: 6,
        touristCities: 3,
    },
};
