/**
 * Premium city data for Kenya
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const KENYA_CITIES = {
    country: {
        name: 'Kenya',
        nameKo: '케냐',
        continent: 'Africa',
        continentKo: '아프리카',
        flag: '🇰🇪',
    },
    cities: [
        { ko: '나이로비', en: 'Nairobi', priority: 1, category: 'capital', region: 'Nairobi County', isCapital: true },
        { ko: '몸바사', en: 'Mombasa', priority: 2, category: 'major', region: 'Mombasa County', isCapital: false },
        { ko: '키수무', en: 'Kisumu', priority: 3, category: 'major', region: 'Kisumu County', isCapital: false },
        { ko: '나쿠루', en: 'Nakuru', priority: 4, category: 'major', region: 'Nakuru County', isCapital: false },
        { ko: '엘도레트', en: 'Eldoret', priority: 5, category: 'major', region: 'Uasin Gishu County', isCapital: false },
        { ko: '티카', en: 'Thika', priority: 6, category: 'major', region: 'Kiambu County', isCapital: false },
        { ko: '말린디', en: 'Malindi', priority: 7, category: 'tourist', region: 'Kilifi County', isCapital: false },
        { ko: '가리사', en: 'Garissa', priority: 8, category: 'major', region: 'Garissa County', isCapital: false },
        { ko: '카카메가', en: 'Kakamega', priority: 9, category: 'major', region: 'Kakamega County', isCapital: false },
        { ko: '마차코스', en: 'Machakos', priority: 10, category: 'major', region: 'Machakos County', isCapital: false },
    ],
    searchIndex: {
        koToEn: {
            '나이로비': 'Nairobi', '몸바사': 'Mombasa', '키수무': 'Kisumu', '나쿠루': 'Nakuru',
            '엘도레트': 'Eldoret', '티카': 'Thika', '말린디': 'Malindi', '가리사': 'Garissa',
            '카카메가': 'Kakamega', '마차코스': 'Machakos',
        },
        enToKo: {
            'Nairobi': '나이로비', 'Mombasa': '몸바사', 'Kisumu': '키수무', 'Nakuru': '나쿠루',
            'Eldoret': '엘도레트', 'Thika': '티카', 'Malindi': '말린디', 'Garissa': '가리사',
            'Kakamega': '카카메가', 'Machakos': '마차코스',
        },
    },
    stats: {
        totalCities: 10,
        capitalCities: 1,
        majorCities: 8,
        touristCities: 1,
    },
};
