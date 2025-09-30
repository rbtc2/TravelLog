/**
 * 이탈리아 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const ITALY_CITIES = {
    // 국가 정보
    country: {
        name: 'Italy',
        nameKo: '이탈리아',
        code: 'IT',
        continent: 'Europe'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '로마',
            en: 'Rome',
            priority: 1,
            category: 'major',
            region: '라치오',
            isCapital: true
        },
        {
            ko: '밀라노',
            en: 'Milan',
            priority: 1,
            category: 'major',
            region: '롬바르디아',
            isCapital: false
        },
        {
            ko: '나폴리',
            en: 'Naples',
            priority: 1,
            category: 'major',
            region: '캄파니아',
            isCapital: false
        },
        {
            ko: '토리노',
            en: 'Turin',
            priority: 1,
            category: 'major',
            region: '피에몬테',
            isCapital: false
        },
        {
            ko: '베네치아',
            en: 'Venice',
            priority: 1,
            category: 'tourist',
            region: '베네토',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '피렌체',
            en: 'Florence',
            priority: 2,
            category: 'tourist',
            region: '토스카나',
            isCapital: false
        },
        {
            ko: '볼로냐',
            en: 'Bologna',
            priority: 2,
            category: 'major',
            region: '에밀리아로마냐',
            isCapital: false
        },
        {
            ko: '제노바',
            en: 'Genoa',
            priority: 2,
            category: 'major',
            region: '리구리아',
            isCapital: false
        },
        {
            ko: '팔레르모',
            en: 'Palermo',
            priority: 2,
            category: 'major',
            region: '시칠리아',
            isCapital: false
        },
        {
            ko: '카타니아',
            en: 'Catania',
            priority: 2,
            category: 'major',
            region: '시칠리아',
            isCapital: false
        },
        {
            ko: '베로나',
            en: 'Verona',
            priority: 2,
            category: 'major',
            region: '베네토',
            isCapital: false
        },
        {
            ko: '바리',
            en: 'Bari',
            priority: 2,
            category: 'major',
            region: '풀리아',
            isCapital: false
        },
        
        // 3순위: 관광 도시
        {
            ko: '시에나',
            en: 'Siena',
            priority: 3,
            category: 'tourist',
            region: '토스카나',
            isCapital: false
        },
        {
            ko: '피사',
            en: 'Pisa',
            priority: 3,
            category: 'tourist',
            region: '토스카나',
            isCapital: false
        },
        {
            ko: '소렌토',
            en: 'Sorrento',
            priority: 3,
            category: 'tourist',
            region: '캄파니아',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '로마': 'Rome',
            '밀라노': 'Milan',
            '나폴리': 'Naples',
            '토리노': 'Turin',
            '베네치아': 'Venice',
            '피렌체': 'Florence',
            '볼로냐': 'Bologna',
            '제노바': 'Genoa',
            '팔레르모': 'Palermo',
            '카타니아': 'Catania',
            '베로나': 'Verona',
            '바리': 'Bari',
            '시에나': 'Siena',
            '피사': 'Pisa',
            '소렌토': 'Sorrento'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Rome': '로마',
            'Milan': '밀라노',
            'Naples': '나폴리',
            'Turin': '토리노',
            'Venice': '베네치아',
            'Florence': '피렌체',
            'Bologna': '볼로냐',
            'Genoa': '제노바',
            'Palermo': '팔레르모',
            'Catania': '카타니아',
            'Verona': '베로나',
            'Bari': '바리',
            'Siena': '시에나',
            'Pisa': '피사',
            'Sorrento': '소렌토'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 15,
        majorCities: 12,
        touristCities: 3,
        lastUpdated: '2025-09-30'
    }
};
