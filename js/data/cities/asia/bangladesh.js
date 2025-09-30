/**
 * 방글라데시 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const BANGLADESH_CITIES = {
    // 국가 정보
    country: {
        name: 'Bangladesh',
        nameKo: '방글라데시',
        code: 'BD',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '다카',
            en: 'Dhaka',
            priority: 1,
            category: 'major',
            region: '다카',
            isCapital: true
        },
        {
            ko: '치타공',
            en: 'Chittagong',
            priority: 1,
            category: 'major',
            region: '치타공',
            isCapital: false
        },
        {
            ko: '쿨나',
            en: 'Khulna',
            priority: 1,
            category: 'major',
            region: '쿨나',
            isCapital: false
        },
        {
            ko: '라지샤히',
            en: 'Rajshahi',
            priority: 1,
            category: 'major',
            region: '라지샤히',
            isCapital: false
        },
        {
            ko: '실헤트',
            en: 'Sylhet',
            priority: 1,
            category: 'major',
            region: '실헤트',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '바리살',
            en: 'Barisal',
            priority: 2,
            category: 'major',
            region: '바리살',
            isCapital: false
        },
        {
            ko: '랑푸르',
            en: 'Rangpur',
            priority: 2,
            category: 'major',
            region: '랑푸르',
            isCapital: false
        },
        {
            ko: '미멘싱',
            en: 'Mymensingh',
            priority: 2,
            category: 'major',
            region: '미멘싱',
            isCapital: false
        },
        {
            ko: '코밀라',
            en: 'Comilla',
            priority: 2,
            category: 'major',
            region: '치타공',
            isCapital: false
        },
        {
            ko: '나라얀간지',
            en: 'Narayanganj',
            priority: 2,
            category: 'major',
            region: '다카',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '다카': 'Dhaka',
            '치타공': 'Chittagong',
            '쿨나': 'Khulna',
            '라지샤히': 'Rajshahi',
            '실헤트': 'Sylhet',
            '바리살': 'Barisal',
            '랑푸르': 'Rangpur',
            '미멘싱': 'Mymensingh',
            '코밀라': 'Comilla',
            '나라얀간지': 'Narayanganj'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Dhaka': '다카',
            'Chittagong': '치타공',
            'Khulna': '쿨나',
            'Rajshahi': '라지샤히',
            'Sylhet': '실헤트',
            'Barisal': '바리살',
            'Rangpur': '랑푸르',
            'Mymensingh': '미멘싱',
            'Comilla': '코밀라',
            'Narayanganj': '나라얀간지'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 10,
        majorCities: 10,
        touristCities: 0,
        lastUpdated: '2025-09-30'
    }
};
