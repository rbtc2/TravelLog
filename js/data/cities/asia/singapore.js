/**
 * 싱가포르 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const SINGAPORE_CITIES = {
    // 국가 정보
    country: {
        name: 'Singapore',
        nameKo: '싱가포르',
        code: 'SG',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 지역
        {
            ko: '싱가포르',
            en: 'Singapore',
            priority: 1,
            category: 'major',
            region: '중앙',
            isCapital: true
        },
        {
            ko: '마리나베이',
            en: 'Marina Bay',
            priority: 1,
            category: 'tourist',
            region: '중앙',
            isCapital: false
        },
        {
            ko: '오차드',
            en: 'Orchard',
            priority: 1,
            category: 'tourist',
            region: '중앙',
            isCapital: false
        },
        
        // 2순위: 주요 지역
        {
            ko: '센토사',
            en: 'Sentosa',
            priority: 2,
            category: 'tourist',
            region: '남부',
            isCapital: false
        },
        {
            ko: '차이나타운',
            en: 'Chinatown',
            priority: 2,
            category: 'tourist',
            region: '중앙',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '싱가포르': 'Singapore',
            '마리나베이': 'Marina Bay',
            '오차드': 'Orchard',
            '센토사': 'Sentosa',
            '차이나타운': 'Chinatown'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Singapore': '싱가포르',
            'Marina Bay': '마리나베이',
            'Orchard': '오차드',
            'Sentosa': '센토사',
            'Chinatown': '차이나타운'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 5,
        majorCities: 1,
        touristCities: 4,
        lastUpdated: '2025-09-30'
    }
};
