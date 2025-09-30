/**
 * Premium city data for Morocco
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const MOROCCO_CITIES = {
    country: {
        name: 'Morocco',
        nameKo: '모로코',
        continent: 'Africa',
        continentKo: '아프리카',
        flag: '🇲🇦',
    },
    cities: [
        { ko: '라바트', en: 'Rabat', priority: 1, category: 'capital', region: 'Rabat-Salé-Kénitra', isCapital: true },
        { ko: '카사블랑카', en: 'Casablanca', priority: 2, category: 'major', region: 'Casablanca-Settat', isCapital: false },
        { ko: '마라케시', en: 'Marrakech', priority: 3, category: 'tourist', region: 'Marrakech-Safi', isCapital: false },
        { ko: '페스', en: 'Fez', priority: 4, category: 'tourist', region: 'Fès-Meknès', isCapital: false },
        { ko: '아가디르', en: 'Agadir', priority: 5, category: 'tourist', region: 'Souss-Massa', isCapital: false },
        { ko: '탕헤르', en: 'Tangier', priority: 6, category: 'major', region: 'Tanger-Tétouan-Al Hoceïma', isCapital: false },
        { ko: '메크네스', en: 'Meknes', priority: 7, category: 'major', region: 'Fès-Meknès', isCapital: false },
        { ko: '우즈다', en: 'Oujda', priority: 8, category: 'major', region: 'Oriental', isCapital: false },
        { ko: '케니트라', en: 'Kenitra', priority: 9, category: 'major', region: 'Rabat-Salé-Kénitra', isCapital: false },
        { ko: '테투안', en: 'Tetouan', priority: 10, category: 'major', region: 'Tanger-Tétouan-Al Hoceïma', isCapital: false },
    ],
    searchIndex: {
        koToEn: {
            '라바트': 'Rabat', '카사블랑카': 'Casablanca', '마라케시': 'Marrakech', '페스': 'Fez',
            '아가디르': 'Agadir', '탕헤르': 'Tangier', '메크네스': 'Meknes', '우즈다': 'Oujda',
            '케니트라': 'Kenitra', '테투안': 'Tetouan',
        },
        enToKo: {
            'Rabat': '라바트', 'Casablanca': '카사블랑카', 'Marrakech': '마라케시', 'Fez': '페스',
            'Agadir': '아가디르', 'Tangier': '탕헤르', 'Meknes': '메크네스', 'Oujda': '우즈다',
            'Kenitra': '케니트라', 'Tetouan': '테투안',
        },
    },
    stats: {
        totalCities: 10,
        capitalCities: 1,
        majorCities: 6,
        touristCities: 3,
    },
};
