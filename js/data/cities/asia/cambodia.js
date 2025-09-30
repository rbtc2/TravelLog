/**
 * 캄보디아 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const CAMBODIA_CITIES = {
    // 국가 정보
    country: {
        name: 'Cambodia',
        nameKo: '캄보디아',
        code: 'KH',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '프놈펜',
            en: 'Phnom Penh',
            priority: 1,
            category: 'major',
            region: '프놈펜',
            isCapital: true
        },
        {
            ko: '시엠립',
            en: 'Siem Reap',
            priority: 1,
            category: 'tourist',
            region: '시엠립',
            isCapital: false
        },
        {
            ko: '바탐방',
            en: 'Battambang',
            priority: 1,
            category: 'major',
            region: '바탐방',
            isCapital: false
        },
        {
            ko: '시하누크빌',
            en: 'Sihanoukville',
            priority: 1,
            category: 'tourist',
            region: '프레아시하누크',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '캄퐁참',
            en: 'Kampong Cham',
            priority: 2,
            category: 'major',
            region: '캄퐁참',
            isCapital: false
        },
        {
            ko: '캄퐁톰',
            en: 'Kampong Thom',
            priority: 2,
            category: 'major',
            region: '캄퐁톰',
            isCapital: false
        },
        {
            ko: '캄퐁치낭',
            en: 'Kampong Chhnang',
            priority: 2,
            category: 'major',
            region: '캄퐁치낭',
            isCapital: false
        },
        {
            ko: '캄퐁스페이',
            en: 'Kampong Speu',
            priority: 2,
            category: 'major',
            region: '캄퐁스페이',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '프놈펜': 'Phnom Penh',
            '시엠립': 'Siem Reap',
            '바탐방': 'Battambang',
            '시하누크빌': 'Sihanoukville',
            '캄퐁참': 'Kampong Cham',
            '캄퐁톰': 'Kampong Thom',
            '캄퐁치낭': 'Kampong Chhnang',
            '캄퐁스페이': 'Kampong Speu'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Phnom Penh': '프놈펜',
            'Siem Reap': '시엠립',
            'Battambang': '바탐방',
            'Sihanoukville': '시하누크빌',
            'Kampong Cham': '캄퐁참',
            'Kampong Thom': '캄퐁톰',
            'Kampong Chhnang': '캄퐁치낭',
            'Kampong Speu': '캄퐁스페이'
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
