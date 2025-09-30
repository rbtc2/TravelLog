/**
 * 오스트리아 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const AUSTRIA_CITIES = {
    // 국가 정보
    country: {
        name: 'Austria',
        nameKo: '오스트리아',
        code: 'AT',
        continent: 'Europe'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '빈',
            en: 'Vienna',
            priority: 1,
            category: 'major',
            region: '빈',
            isCapital: true
        },
        {
            ko: '그라츠',
            en: 'Graz',
            priority: 1,
            category: 'major',
            region: '슈타이어마르크',
            isCapital: false
        },
        {
            ko: '린츠',
            en: 'Linz',
            priority: 1,
            category: 'major',
            region: '오버외스터라이히',
            isCapital: false
        },
        {
            ko: '잘츠부르크',
            en: 'Salzburg',
            priority: 1,
            category: 'tourist',
            region: '잘츠부르크',
            isCapital: false
        },
        {
            ko: '인스브루크',
            en: 'Innsbruck',
            priority: 1,
            category: 'tourist',
            region: '티롤',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '클라겐푸르트',
            en: 'Klagenfurt',
            priority: 2,
            category: 'major',
            region: '캐른텐',
            isCapital: false
        },
        {
            ko: '빌라흐',
            en: 'Villach',
            priority: 2,
            category: 'major',
            region: '캐른텐',
            isCapital: false
        },
        {
            ko: '벤스',
            en: 'Wels',
            priority: 2,
            category: 'major',
            region: '오버외스터라이히',
            isCapital: false
        },
        {
            ko: '장크트푈텐',
            en: 'Sankt Pölten',
            priority: 2,
            category: 'major',
            region: '니더외스터라이히',
            isCapital: false
        },
        {
            ko: '브레겐츠',
            en: 'Bregenz',
            priority: 2,
            category: 'tourist',
            region: '포어아를베르크',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '빈': 'Vienna',
            '그라츠': 'Graz',
            '린츠': 'Linz',
            '잘츠부르크': 'Salzburg',
            '인스브루크': 'Innsbruck',
            '클라겐푸르트': 'Klagenfurt',
            '빌라흐': 'Villach',
            '벤스': 'Wels',
            '장크트푈텐': 'Sankt Pölten',
            '브레겐츠': 'Bregenz'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Vienna': '빈',
            'Graz': '그라츠',
            'Linz': '린츠',
            'Salzburg': '잘츠부르크',
            'Innsbruck': '인스브루크',
            'Klagenfurt': '클라겐푸르트',
            'Villach': '빌라흐',
            'Wels': '벤스',
            'Sankt Pölten': '장크트푈텐',
            'Bregenz': '브레겐츠'
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
