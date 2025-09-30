/**
 * 마카오 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const MACAU_CITIES = {
    // 국가 정보
    country: {
        name: 'Macau',
        nameKo: '마카오',
        code: 'MO',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 지역
        {
            ko: '마카오',
            en: 'Macau',
            priority: 1,
            category: 'major',
            region: '마카오반도',
            isCapital: true
        },
        {
            ko: '타이파',
            en: 'Taipa',
            priority: 1,
            category: 'major',
            region: '타이파섬',
            isCapital: false
        },
        {
            ko: '콜로안',
            en: 'Coloane',
            priority: 1,
            category: 'tourist',
            region: '콜로안섬',
            isCapital: false
        },
        
        // 2순위: 주요 지역
        {
            ko: '코타이',
            en: 'Cotai',
            priority: 2,
            category: 'tourist',
            region: '코타이스트립',
            isCapital: false
        },
        {
            ko: '세나도광장',
            en: 'Senado Square',
            priority: 2,
            category: 'tourist',
            region: '마카오반도',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '마카오': 'Macau',
            '타이파': 'Taipa',
            '콜로안': 'Coloane',
            '코타이': 'Cotai',
            '세나도광장': 'Senado Square'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Macau': '마카오',
            'Taipa': '타이파',
            'Coloane': '콜로안',
            'Cotai': '코타이',
            'Senado Square': '세나도광장'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 5,
        majorCities: 2,
        touristCities: 3,
        lastUpdated: '2025-09-30'
    }
};
