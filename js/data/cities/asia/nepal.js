/**
 * 네팔 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const NEPAL_CITIES = {
    // 국가 정보
    country: {
        name: 'Nepal',
        nameKo: '네팔',
        code: 'NP',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '카트만두',
            en: 'Kathmandu',
            priority: 1,
            category: 'major',
            region: '바그마티',
            isCapital: true
        },
        {
            ko: '포카라',
            en: 'Pokhara',
            priority: 1,
            category: 'tourist',
            region: '간다키',
            isCapital: false
        },
        {
            ko: '비라트나가르',
            en: 'Biratnagar',
            priority: 1,
            category: 'major',
            region: '코시',
            isCapital: false
        },
        {
            ko: '라리트푸르',
            en: 'Lalitpur',
            priority: 1,
            category: 'major',
            region: '바그마티',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '비르간지',
            en: 'Birgunj',
            priority: 2,
            category: 'major',
            region: '나라야니',
            isCapital: false
        },
        {
            ko: '바라트푸르',
            en: 'Bharatpur',
            priority: 2,
            category: 'major',
            region: '나라야니',
            isCapital: false
        },
        {
            ko: '부타왈',
            en: 'Butwal',
            priority: 2,
            category: 'major',
            region: '루분데히',
            isCapital: false
        },
        {
            ko: '다란',
            en: 'Dharan',
            priority: 2,
            category: 'tourist',
            region: '코시',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '카트만두': 'Kathmandu',
            '포카라': 'Pokhara',
            '비라트나가르': 'Biratnagar',
            '라리트푸르': 'Lalitpur',
            '비르간지': 'Birgunj',
            '바라트푸르': 'Bharatpur',
            '부타왈': 'Butwal',
            '다란': 'Dharan'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Kathmandu': '카트만두',
            'Pokhara': '포카라',
            'Biratnagar': '비라트나가르',
            'Lalitpur': '라리트푸르',
            'Birgunj': '비르간지',
            'Bharatpur': '바라트푸르',
            'Butwal': '부타왈',
            'Dharan': '다란'
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
