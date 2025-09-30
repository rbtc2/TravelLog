/**
 * Premium city data for Belarus
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const BELARUS_CITIES = {
    country: {
        name: 'Belarus',
        nameKo: '벨라루스',
        continent: 'Europe',
        continentKo: '유럽',
        flag: '🇧🇾',
    },
    cities: [
        { ko: '민스크', en: 'Minsk', priority: 1, category: 'capital', region: 'Minsk Region', isCapital: true },
        { ko: '호멜', en: 'Gomel', priority: 2, category: 'major', region: 'Gomel Region', isCapital: false },
        { ko: '모길료프', en: 'Mogilev', priority: 3, category: 'major', region: 'Mogilev Region', isCapital: false },
        { ko: '비쳅스크', en: 'Vitebsk', priority: 4, category: 'major', region: 'Vitebsk Region', isCapital: false },
        { ko: '그로드노', en: 'Grodno', priority: 5, category: 'major', region: 'Grodno Region', isCapital: false },
        { ko: '브레스트', en: 'Brest', priority: 6, category: 'major', region: 'Brest Region', isCapital: false },
        { ko: '바브루이스크', en: 'Babruysk', priority: 7, category: 'major', region: 'Mogilev Region', isCapital: false },
        { ko: '바라나비치', en: 'Baranavichy', priority: 8, category: 'major', region: 'Brest Region', isCapital: false },
        { ko: '보리소프', en: 'Barysaw', priority: 9, category: 'major', region: 'Minsk Region', isCapital: false },
        { ko: '핀스크', en: 'Pinsk', priority: 10, category: 'major', region: 'Brest Region', isCapital: false },
    ],
    searchIndex: {
        koToEn: {
            '민스크': 'Minsk', '호멜': 'Gomel', '모길료프': 'Mogilev', '비쳅스크': 'Vitebsk',
            '그로드노': 'Grodno', '브레스트': 'Brest', '바브루이스크': 'Babruysk', '바라나비치': 'Baranavichy',
            '보리소프': 'Barysaw', '핀스크': 'Pinsk',
        },
        enToKo: {
            'Minsk': '민스크', 'Gomel': '호멜', 'Mogilev': '모길료프', 'Vitebsk': '비쳅스크',
            'Grodno': '그로드노', 'Brest': '브레스트', 'Babruysk': '바브루이스크', 'Baranavichy': '바라나비치',
            'Barysaw': '보리소프', 'Pinsk': '핀스크',
        },
    },
    stats: {
        totalCities: 10,
        capitalCities: 1,
        majorCities: 9,
        touristCities: 0,
    },
};
