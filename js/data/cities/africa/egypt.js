/**
 * Premium city data for Egypt
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const EGYPT_CITIES = {
    country: {
        name: 'Egypt',
        nameKo: '이집트',
        continent: 'Africa',
        continentKo: '아프리카',
        flag: '🇪🇬',
    },
    cities: [
        { ko: '카이로', en: 'Cairo', priority: 1, category: 'capital', region: 'Cairo Governorate', isCapital: true },
        { ko: '알렉산드리아', en: 'Alexandria', priority: 2, category: 'major', region: 'Alexandria Governorate', isCapital: false },
        { ko: '기자', en: 'Giza', priority: 3, category: 'major', region: 'Giza Governorate', isCapital: false },
        { ko: '룩소르', en: 'Luxor', priority: 4, category: 'tourist', region: 'Luxor Governorate', isCapital: false },
        { ko: '아스완', en: 'Aswan', priority: 5, category: 'tourist', region: 'Aswan Governorate', isCapital: false },
        { ko: '포트사이드', en: 'Port Said', priority: 6, category: 'major', region: 'Port Said Governorate', isCapital: false },
        { ko: '수에즈', en: 'Suez', priority: 7, category: 'major', region: 'Suez Governorate', isCapital: false },
        { ko: '담이타', en: 'Damietta', priority: 8, category: 'major', region: 'Damietta Governorate', isCapital: false },
        { ko: '이스마일리아', en: 'Ismailia', priority: 9, category: 'major', region: 'Ismailia Governorate', isCapital: false },
        { ko: '샤르키야', en: 'Sharqia', priority: 10, category: 'major', region: 'Sharqia Governorate', isCapital: false },
    ],
    searchIndex: {
        koToEn: {
            '카이로': 'Cairo', '알렉산드리아': 'Alexandria', '기자': 'Giza', '룩소르': 'Luxor',
            '아스완': 'Aswan', '포트사이드': 'Port Said', '수에즈': 'Suez', '담이타': 'Damietta',
            '이스마일리아': 'Ismailia', '샤르키야': 'Sharqia',
        },
        enToKo: {
            'Cairo': '카이로', 'Alexandria': '알렉산드리아', 'Giza': '기자', 'Luxor': '룩소르',
            'Aswan': '아스완', 'Port Said': '포트사이드', 'Suez': '수에즈', 'Damietta': '담이타',
            'Ismailia': '이스마일리아', 'Sharqia': '샤르키야',
        },
    },
    stats: {
        totalCities: 10,
        capitalCities: 1,
        majorCities: 7,
        touristCities: 2,
    },
};
