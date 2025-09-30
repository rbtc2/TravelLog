/**
 * Premium city data for Dominican Republic
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const DOMINICAN_REPUBLIC_CITIES = {
    country: {
        name: 'Dominican Republic',
        nameKo: '도미니카공화국',
        continent: 'North America',
        continentKo: '북아메리카',
        flag: '🇩🇴',
    },
    cities: [
        { ko: '산토도밍고', en: 'Santo Domingo', priority: 1, category: 'capital', region: 'Distrito Nacional', isCapital: true },
        { ko: '산티아고데로스카바예로스', en: 'Santiago de los Caballeros', priority: 2, category: 'major', region: 'Santiago Province', isCapital: false },
        { ko: '라로마나', en: 'La Romana', priority: 3, category: 'major', region: 'La Romana Province', isCapital: false },
        { ko: '산프란시스코데마코리스', en: 'San Francisco de Macorís', priority: 4, category: 'major', region: 'Duarte Province', isCapital: false },
        { ko: '산페드로데마코리스', en: 'San Pedro de Macorís', priority: 5, category: 'major', region: 'San Pedro de Macorís Province', isCapital: false },
        { ko: '산크리스토발', en: 'San Cristóbal', priority: 6, category: 'major', region: 'San Cristóbal Province', isCapital: false },
        { ko: '라베가', en: 'La Vega', priority: 7, category: 'major', region: 'La Vega Province', isCapital: false },
        { ko: '바니', en: 'Bani', priority: 8, category: 'major', region: 'Peravia Province', isCapital: false },
        { ko: '푸에르토플라타', en: 'Puerto Plata', priority: 9, category: 'tourist', region: 'Puerto Plata Province', isCapital: false },
        { ko: '바바로', en: 'Bávaro', priority: 10, category: 'tourist', region: 'La Altagracia Province', isCapital: false },
    ],
    searchIndex: {
        koToEn: {
            '산토도밍고': 'Santo Domingo', '산티아고데로스카바예로스': 'Santiago de los Caballeros', '라로마나': 'La Romana',
            '산프란시스코데마코리스': 'San Francisco de Macorís', '산페드로데마코리스': 'San Pedro de Macorís',
            '산크리스토발': 'San Cristóbal', '라베가': 'La Vega', '바니': 'Bani', '푸에르토플라타': 'Puerto Plata',
            '바바로': 'Bávaro',
        },
        enToKo: {
            'Santo Domingo': '산토도밍고', 'Santiago de los Caballeros': '산티아고데로스카바예로스', 'La Romana': '라로마나',
            'San Francisco de Macorís': '산프란시스코데마코리스', 'San Pedro de Macorís': '산페드로데마코리스',
            'San Cristóbal': '산크리스토발', 'La Vega': '라베가', 'Bani': '바니', 'Puerto Plata': '푸에르토플라타',
            'Bávaro': '바바로',
        },
    },
    stats: {
        totalCities: 10,
        capitalCities: 1,
        majorCities: 7,
        touristCities: 2,
    },
};
