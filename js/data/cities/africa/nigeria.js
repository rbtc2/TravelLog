/**
 * Premium city data for Nigeria
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const NIGERIA_CITIES = {
    country: {
        name: 'Nigeria',
        nameKo: '나이지리아',
        continent: 'Africa',
        continentKo: '아프리카',
        flag: '🇳🇬',
    },
    cities: [
        { ko: '아부자', en: 'Abuja', priority: 1, category: 'capital', region: 'Federal Capital Territory', isCapital: true },
        { ko: '라고스', en: 'Lagos', priority: 2, category: 'major', region: 'Lagos State', isCapital: false },
        { ko: '카노', en: 'Kano', priority: 3, category: 'major', region: 'Kano State', isCapital: false },
        { ko: '이바단', en: 'Ibadan', priority: 4, category: 'major', region: 'Oyo State', isCapital: false },
        { ko: '포트하커트', en: 'Port Harcourt', priority: 5, category: 'major', region: 'Rivers State', isCapital: false },
        { ko: '베닌시티', en: 'Benin City', priority: 6, category: 'major', region: 'Edo State', isCapital: false },
        { ko: '마이두구리', en: 'Maiduguri', priority: 7, category: 'major', region: 'Borno State', isCapital: false },
        { ko: '자리아', en: 'Zaria', priority: 8, category: 'major', region: 'Kaduna State', isCapital: false },
        { ko: '아바카', en: 'Aba', priority: 9, category: 'major', region: 'Abia State', isCapital: false },
        { ko: '조스', en: 'Jos', priority: 10, category: 'major', region: 'Plateau State', isCapital: false },
    ],
    searchIndex: {
        koToEn: {
            '아부자': 'Abuja', '라고스': 'Lagos', '카노': 'Kano', '이바단': 'Ibadan',
            '포트하커트': 'Port Harcourt', '베닌시티': 'Benin City', '마이두구리': 'Maiduguri',
            '자리아': 'Zaria', '아바카': 'Aba', '조스': 'Jos',
        },
        enToKo: {
            'Abuja': '아부자', 'Lagos': '라고스', 'Kano': '카노', 'Ibadan': '이바단',
            'Port Harcourt': '포트하커트', 'Benin City': '베닌시티', 'Maiduguri': '마이두구리',
            'Zaria': '자리아', 'Aba': '아바카', 'Jos': '조스',
        },
    },
    stats: {
        totalCities: 10,
        capitalCities: 1,
        majorCities: 9,
        touristCities: 0,
    },
};
