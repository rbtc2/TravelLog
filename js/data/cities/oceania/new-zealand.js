/**
 * 뉴질랜드 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const NEW_ZEALAND_CITIES = {
    // 국가 정보
    country: {
        name: 'New Zealand',
        nameKo: '뉴질랜드',
        code: 'NZ',
        continent: 'Oceania'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '오클랜드',
            en: 'Auckland',
            priority: 1,
            category: 'major',
            region: '오클랜드',
            isCapital: false
        },
        {
            ko: '웰링턴',
            en: 'Wellington',
            priority: 1,
            category: 'major',
            region: '웰링턴',
            isCapital: true
        },
        {
            ko: '크라이스트처치',
            en: 'Christchurch',
            priority: 1,
            category: 'major',
            region: '캔터베리',
            isCapital: false
        },
        {
            ko: '해밀턴',
            en: 'Hamilton',
            priority: 1,
            category: 'major',
            region: '와이카토',
            isCapital: false
        },
        {
            ko: '타우랑가',
            en: 'Tauranga',
            priority: 1,
            category: 'major',
            region: '베이오브플렌티',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '네이피어',
            en: 'Napier',
            priority: 2,
            category: 'major',
            region: '호크스베이',
            isCapital: false
        },
        {
            ko: '더니딘',
            en: 'Dunedin',
            priority: 2,
            category: 'major',
            region: '오타고',
            isCapital: false
        },
        {
            ko: '팔머스턴노스',
            en: 'Palmerston North',
            priority: 2,
            category: 'major',
            region: '마나와투완가누이',
            isCapital: false
        },
        {
            ko: '넬슨',
            en: 'Nelson',
            priority: 2,
            category: 'major',
            region: '넬슨',
            isCapital: false
        },
        {
            ko: '로토루아',
            en: 'Rotorua',
            priority: 2,
            category: 'tourist',
            region: '베이오브플렌티',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '오클랜드': 'Auckland',
            '웰링턴': 'Wellington',
            '크라이스트처치': 'Christchurch',
            '해밀턴': 'Hamilton',
            '타우랑가': 'Tauranga',
            '네이피어': 'Napier',
            '더니딘': 'Dunedin',
            '팔머스턴노스': 'Palmerston North',
            '넬슨': 'Nelson',
            '로토루아': 'Rotorua'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Auckland': '오클랜드',
            'Wellington': '웰링턴',
            'Christchurch': '크라이스트처치',
            'Hamilton': '해밀턴',
            'Tauranga': '타우랑가',
            'Napier': '네이피어',
            'Dunedin': '더니딘',
            'Palmerston North': '팔머스턴노스',
            'Nelson': '넬슨',
            'Rotorua': '로토루아'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 10,
        majorCities: 9,
        touristCities: 1,
        lastUpdated: '2025-09-30'
    }
};
