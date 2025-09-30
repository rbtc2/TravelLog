/**
 * Premium city data for Croatia
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const CROATIA_CITIES = {
    country: {
        name: 'Croatia',
        nameKo: '크로아티아',
        continent: 'Europe',
        continentKo: '유럽',
        flag: '🇭🇷',
    },
    cities: [
        { ko: '자그레브', en: 'Zagreb', priority: 1, category: 'capital', region: 'City of Zagreb', isCapital: true },
        { ko: '스플리트', en: 'Split', priority: 2, category: 'major', region: 'Split-Dalmatia County', isCapital: false },
        { ko: '리예카', en: 'Rijeka', priority: 3, category: 'major', region: 'Primorje-Gorski Kotar County', isCapital: false },
        { ko: '오시예크', en: 'Osijek', priority: 4, category: 'major', region: 'Osijek-Baranja County', isCapital: false },
        { ko: '자다르', en: 'Zadar', priority: 5, category: 'tourist', region: 'Zadar County', isCapital: false },
        { ko: '슬라본스키브로드', en: 'Slavonski Brod', priority: 6, category: 'major', region: 'Brod-Posavina County', isCapital: false },
        { ko: '푸라', en: 'Pula', priority: 7, category: 'tourist', region: 'Istria County', isCapital: false },
        { ko: '카를로바츠', en: 'Karlovac', priority: 8, category: 'major', region: 'Karlovac County', isCapital: false },
        { ko: '시베니크', en: 'Šibenik', priority: 9, category: 'tourist', region: 'Šibenik-Knin County', isCapital: false },
        { ko: '두브로브니크', en: 'Dubrovnik', priority: 10, category: 'tourist', region: 'Dubrovnik-Neretva County', isCapital: false },
    ],
    searchIndex: {
        koToEn: {
            '자그레브': 'Zagreb', '스플리트': 'Split', '리예카': 'Rijeka', '오시예크': 'Osijek',
            '자다르': 'Zadar', '슬라본스키브로드': 'Slavonski Brod', '푸라': 'Pula', '카를로바츠': 'Karlovac',
            '시베니크': 'Šibenik', '두브로브니크': 'Dubrovnik',
        },
        enToKo: {
            'Zagreb': '자그레브', 'Split': '스플리트', 'Rijeka': '리예카', 'Osijek': '오시예크',
            'Zadar': '자다르', 'Slavonski Brod': '슬라본스키브로드', 'Pula': '푸라', 'Karlovac': '카를로바츠',
            'Šibenik': '시베니크', 'Dubrovnik': '두브로브니크',
        },
    },
    stats: {
        totalCities: 10,
        capitalCities: 1,
        majorCities: 5,
        touristCities: 4,
    },
};
