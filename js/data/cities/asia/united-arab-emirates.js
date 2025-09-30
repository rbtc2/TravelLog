/**
 * 아랍에미리트 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const UNITED_ARAB_EMIRATES_CITIES = {
    // 국가 정보
    country: {
        name: 'United Arab Emirates',
        nameKo: '아랍에미리트',
        code: 'AE',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '두바이',
            en: 'Dubai',
            priority: 1,
            category: 'major',
            region: '두바이',
            isCapital: false
        },
        {
            ko: '아부다비',
            en: 'Abu Dhabi',
            priority: 1,
            category: 'major',
            region: '아부다비',
            isCapital: true
        },
        {
            ko: '샤르자',
            en: 'Sharjah',
            priority: 1,
            category: 'major',
            region: '샤르자',
            isCapital: false
        },
        {
            ko: '아지만',
            en: 'Ajman',
            priority: 1,
            category: 'major',
            region: '아지만',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '라스알카이마',
            en: 'Ras Al Khaimah',
            priority: 2,
            category: 'major',
            region: '라스알카이마',
            isCapital: false
        },
        {
            ko: '푸자이라',
            en: 'Fujairah',
            priority: 2,
            category: 'major',
            region: '푸자이라',
            isCapital: false
        },
        {
            ko: '움알쿠와인',
            en: 'Umm Al Quwain',
            priority: 2,
            category: 'major',
            region: '움알쿠와인',
            isCapital: false
        },
        {
            ko: '알아인',
            en: 'Al Ain',
            priority: 2,
            category: 'tourist',
            region: '아부다비',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '두바이': 'Dubai',
            '아부다비': 'Abu Dhabi',
            '샤르자': 'Sharjah',
            '아지만': 'Ajman',
            '라스알카이마': 'Ras Al Khaimah',
            '푸자이라': 'Fujairah',
            '움알쿠와인': 'Umm Al Quwain',
            '알아인': 'Al Ain'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Dubai': '두바이',
            'Abu Dhabi': '아부다비',
            'Sharjah': '샤르자',
            'Ajman': '아지만',
            'Ras Al Khaimah': '라스알카이마',
            'Fujairah': '푸자이라',
            'Umm Al Quwain': '움알쿠와인',
            'Al Ain': '알아인'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 8,
        majorCities: 7,
        touristCities: 1,
        lastUpdated: '2025-09-30'
    }
};
