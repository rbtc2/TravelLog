/**
 * 태국 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const THAILAND_CITIES = {
    // 국가 정보
    country: {
        name: 'Thailand',
        nameKo: '태국',
        code: 'TH',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '방콕',
            en: 'Bangkok',
            priority: 1,
            category: 'major',
            region: '중부',
            isCapital: true
        },
        {
            ko: '치앙마이',
            en: 'Chiang Mai',
            priority: 1,
            category: 'tourist',
            region: '북부',
            isCapital: false
        },
        {
            ko: '푸켓',
            en: 'Phuket',
            priority: 1,
            category: 'tourist',
            region: '남부',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '파타야',
            en: 'Pattaya',
            priority: 2,
            category: 'tourist',
            region: '중부',
            isCapital: false
        },
        {
            ko: '코사무이',
            en: 'Koh Samui',
            priority: 2,
            category: 'tourist',
            region: '남부',
            isCapital: false
        },
        {
            ko: '치앙라이',
            en: 'Chiang Rai',
            priority: 2,
            category: 'tourist',
            region: '북부',
            isCapital: false
        },
        {
            ko: '핫야이',
            en: 'Hat Yai',
            priority: 2,
            category: 'major',
            region: '남부',
            isCapital: false
        },
        {
            ko: '우본라차타니',
            en: 'Ubon Ratchathani',
            priority: 2,
            category: 'major',
            region: '동북부',
            isCapital: false
        },
        
        // 3순위: 관광 도시
        {
            ko: '촌부리',
            en: 'Chonburi',
            priority: 3,
            category: 'tourist',
            region: '중부',
            isCapital: false
        },
        {
            ko: '수코타이',
            en: 'Sukhothai',
            priority: 3,
            category: 'tourist',
            region: '북부',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '방콕': 'Bangkok',
            '치앙마이': 'Chiang Mai',
            '푸켓': 'Phuket',
            '파타야': 'Pattaya',
            '코사무이': 'Koh Samui',
            '치앙라이': 'Chiang Rai',
            '핫야이': 'Hat Yai',
            '우본라차타니': 'Ubon Ratchathani',
            '촌부리': 'Chonburi',
            '수코타이': 'Sukhothai'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Bangkok': '방콕',
            'Chiang Mai': '치앙마이',
            'Phuket': '푸켓',
            'Pattaya': '파타야',
            'Koh Samui': '코사무이',
            'Chiang Rai': '치앙라이',
            'Hat Yai': '핫야이',
            'Ubon Ratchathani': '우본라차타니',
            'Chonburi': '촌부리',
            'Sukhothai': '수코타이'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 10,
        majorCities: 4,
        touristCities: 6,
        lastUpdated: '2025-09-30'
    }
};
