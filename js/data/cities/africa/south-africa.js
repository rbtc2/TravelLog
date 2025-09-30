/**
 * Premium city data for South Africa
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const SOUTH_AFRICA_CITIES = {
    country: {
        name: 'South Africa',
        nameKo: '남아프리카공화국',
        continent: 'Africa',
        continentKo: '아프리카',
        flag: '🇿🇦',
    },
    cities: [
        { ko: '케이프타운', en: 'Cape Town', priority: 1, category: 'capital', region: 'Western Cape', isCapital: true },
        { ko: '요하네스버그', en: 'Johannesburg', priority: 2, category: 'major', region: 'Gauteng', isCapital: false },
        { ko: '프리토리아', en: 'Pretoria', priority: 3, category: 'capital', region: 'Gauteng', isCapital: true },
        { ko: '더반', en: 'Durban', priority: 4, category: 'major', region: 'KwaZulu-Natal', isCapital: false },
        { ko: '포트엘리자베스', en: 'Port Elizabeth', priority: 5, category: 'major', region: 'Eastern Cape', isCapital: false },
        { ko: '블룸폰테인', en: 'Bloemfontein', priority: 6, category: 'capital', region: 'Free State', isCapital: true },
        { ko: '네이스프루이트', en: 'Nelspruit', priority: 7, category: 'major', region: 'Mpumalanga', isCapital: false },
        { ko: '폴로크웨인', en: 'Polokwane', priority: 8, category: 'major', region: 'Limpopo', isCapital: false },
        { ko: '킴벌리', en: 'Kimberley', priority: 9, category: 'major', region: 'Northern Cape', isCapital: false },
        { ko: '마후딩', en: 'Mahikeng', priority: 10, category: 'major', region: 'North West', isCapital: false },
    ],
    searchIndex: {
        koToEn: {
            '케이프타운': 'Cape Town', '요하네스버그': 'Johannesburg', '프리토리아': 'Pretoria', '더반': 'Durban',
            '포트엘리자베스': 'Port Elizabeth', '블룸폰테인': 'Bloemfontein', '네이스프루이트': 'Nelspruit',
            '폴로크웨인': 'Polokwane', '킴벌리': 'Kimberley', '마후딩': 'Mahikeng',
        },
        enToKo: {
            'Cape Town': '케이프타운', 'Johannesburg': '요하네스버그', 'Pretoria': '프리토리아', 'Durban': '더반',
            'Port Elizabeth': '포트엘리자베스', 'Bloemfontein': '블룸폰테인', 'Nelspruit': '네이스프루이트',
            'Polokwane': '폴로크웨인', 'Kimberley': '킴벌리', 'Mahikeng': '마후딩',
        },
    },
    stats: {
        totalCities: 10,
        capitalCities: 3,
        majorCities: 7,
        touristCities: 0,
    },
};
