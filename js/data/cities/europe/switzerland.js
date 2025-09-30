/**
 * 스위스 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const SWITZERLAND_CITIES = {
    // 국가 정보
    country: {
        name: 'Switzerland',
        nameKo: '스위스',
        code: 'CH',
        continent: 'Europe'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '취리히',
            en: 'Zurich',
            priority: 1,
            category: 'major',
            region: '취리히',
            isCapital: false
        },
        {
            ko: '제네바',
            en: 'Geneva',
            priority: 1,
            category: 'major',
            region: '제네바',
            isCapital: false
        },
        {
            ko: '바젤',
            en: 'Basel',
            priority: 1,
            category: 'major',
            region: '바젤슈타트',
            isCapital: false
        },
        {
            ko: '베른',
            en: 'Bern',
            priority: 1,
            category: 'major',
            region: '베른',
            isCapital: true
        },
        {
            ko: '로잔',
            en: 'Lausanne',
            priority: 1,
            category: 'major',
            region: '보',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '루체른',
            en: 'Lucerne',
            priority: 2,
            category: 'tourist',
            region: '루체른',
            isCapital: false
        },
        {
            ko: '인터라켄',
            en: 'Interlaken',
            priority: 2,
            category: 'tourist',
            region: '베른',
            isCapital: false
        },
        {
            ko: '루가노',
            en: 'Lugano',
            priority: 2,
            category: 'tourist',
            region: '티치노',
            isCapital: false
        },
        {
            ko: '빈터투어',
            en: 'Winterthur',
            priority: 2,
            category: 'major',
            region: '취리히',
            isCapital: false
        },
        {
            ko: '성갈렌',
            en: 'St. Gallen',
            priority: 2,
            category: 'major',
            region: '성갈렌',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '취리히': 'Zurich',
            '제네바': 'Geneva',
            '바젤': 'Basel',
            '베른': 'Bern',
            '로잔': 'Lausanne',
            '루체른': 'Lucerne',
            '인터라켄': 'Interlaken',
            '루가노': 'Lugano',
            '빈터투어': 'Winterthur',
            '성갈렌': 'St. Gallen'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Zurich': '취리히',
            'Geneva': '제네바',
            'Basel': '바젤',
            'Bern': '베른',
            'Lausanne': '로잔',
            'Lucerne': '루체른',
            'Interlaken': '인터라켄',
            'Lugano': '루가노',
            'Winterthur': '빈터투어',
            'St. Gallen': '성갈렌'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 10,
        majorCities: 7,
        touristCities: 3,
        lastUpdated: '2025-09-30'
    }
};
