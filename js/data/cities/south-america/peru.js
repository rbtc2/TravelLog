/**
 * Premium city data for Peru
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const PERU_CITIES = {
    country: {
        name: 'Peru',
        nameKo: '페루',
        continent: 'South America',
        continentKo: '남아메리카',
        flag: '🇵🇪',
    },
    cities: [
        { ko: '리마', en: 'Lima', priority: 1, category: 'capital', region: 'Lima Province', isCapital: true },
        { ko: '아레키파', en: 'Arequipa', priority: 2, category: 'major', region: 'Arequipa Region', isCapital: false },
        { ko: '트루히요', en: 'Trujillo', priority: 3, category: 'major', region: 'La Libertad Region', isCapital: false },
        { ko: '치클라요', en: 'Chiclayo', priority: 4, category: 'major', region: 'Lambayeque Region', isCapital: false },
        { ko: '피우라', en: 'Piura', priority: 5, category: 'major', region: 'Piura Region', isCapital: false },
        { ko: '이키토스', en: 'Iquitos', priority: 6, category: 'major', region: 'Loreto Region', isCapital: false },
        { ko: '쿠스코', en: 'Cusco', priority: 7, category: 'tourist', region: 'Cusco Region', isCapital: false },
        { ko: '치무보테', en: 'Chimbote', priority: 8, category: 'major', region: 'Ancash Region', isCapital: false },
        { ko: '우안카요', en: 'Huancayo', priority: 9, category: 'major', region: 'Junín Region', isCapital: false },
        { ko: '타크나', en: 'Tacna', priority: 10, category: 'major', region: 'Tacna Region', isCapital: false },
    ],
    searchIndex: {
        koToEn: {
            '리마': 'Lima', '아레키파': 'Arequipa', '트루히요': 'Trujillo', '치클라요': 'Chiclayo',
            '피우라': 'Piura', '이키토스': 'Iquitos', '쿠스코': 'Cusco', '치무보테': 'Chimbote',
            '우안카요': 'Huancayo', '타크나': 'Tacna',
        },
        enToKo: {
            'Lima': '리마', 'Arequipa': '아레키파', 'Trujillo': '트루히요', 'Chiclayo': '치클라요',
            'Piura': '피우라', 'Iquitos': '이키토스', 'Cusco': '쿠스코', 'Chimbote': '치무보테',
            'Huancayo': '우안카요', 'Tacna': '타크나',
        },
    },
    stats: {
        totalCities: 10,
        capitalCities: 1,
        majorCities: 8,
        touristCities: 1,
    },
};
