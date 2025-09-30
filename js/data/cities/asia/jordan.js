/**
 * 요르단 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const JORDAN_CITIES = {
    // 국가 정보
    country: {
        name: 'Jordan',
        nameKo: '요르단',
        code: 'JO',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '암만',
            en: 'Amman',
            priority: 1,
            category: 'major',
            region: '암만',
            isCapital: true
        },
        {
            ko: '자르카',
            en: 'Zarqa',
            priority: 1,
            category: 'major',
            region: '자르카',
            isCapital: false
        },
        {
            ko: '이르비드',
            en: 'Irbid',
            priority: 1,
            category: 'major',
            region: '이르비드',
            isCapital: false
        },
        {
            ko: '루사이파',
            en: 'Russeifa',
            priority: 1,
            category: 'major',
            region: '암만',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '와디무사',
            en: 'Wadi Musa',
            priority: 2,
            category: 'tourist',
            region: '마안',
            isCapital: false
        },
        {
            ko: '아카바',
            en: 'Aqaba',
            priority: 2,
            category: 'tourist',
            region: '아카바',
            isCapital: false
        },
        {
            ko: '사르트',
            en: 'Salt',
            priority: 2,
            category: 'major',
            region: '발카',
            isCapital: false
        },
        {
            ko: '마안',
            en: 'Ma\'an',
            priority: 2,
            category: 'major',
            region: '마안',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '암만': 'Amman',
            '자르카': 'Zarqa',
            '이르비드': 'Irbid',
            '루사이파': 'Russeifa',
            '와디무사': 'Wadi Musa',
            '아카바': 'Aqaba',
            '사르트': 'Salt',
            '마안': 'Ma\'an'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Amman': '암만',
            'Zarqa': '자르카',
            'Irbid': '이르비드',
            'Russeifa': '루사이파',
            'Wadi Musa': '와디무사',
            'Aqaba': '아카바',
            'Salt': '사르트',
            'Ma\'an': '마안'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 8,
        majorCities: 6,
        touristCities: 2,
        lastUpdated: '2025-09-30'
    }
};
