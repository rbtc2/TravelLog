/**
 * 말레이시아 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const MALAYSIA_CITIES = {
    // 국가 정보
    country: {
        name: 'Malaysia',
        nameKo: '말레이시아',
        code: 'MY',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '쿠알라룸푸르',
            en: 'Kuala Lumpur',
            priority: 1,
            category: 'major',
            region: '쿠알라룸푸르',
            isCapital: true
        },
        {
            ko: '조호르바루',
            en: 'Johor Bahru',
            priority: 1,
            category: 'major',
            region: '조호르',
            isCapital: false
        },
        {
            ko: '이포',
            en: 'Ipoh',
            priority: 1,
            category: 'major',
            region: '페락',
            isCapital: false
        },
        {
            ko: '샤알람',
            en: 'Shah Alam',
            priority: 1,
            category: 'major',
            region: '셀랑고르',
            isCapital: false
        },
        {
            ko: '페낭',
            en: 'Penang',
            priority: 1,
            category: 'tourist',
            region: '페낭',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '쿠칭',
            en: 'Kuching',
            priority: 2,
            category: 'major',
            region: '사라왁',
            isCapital: false
        },
        {
            ko: '코타키나발루',
            en: 'Kota Kinabalu',
            priority: 2,
            category: 'tourist',
            region: '사바',
            isCapital: false
        },
        {
            ko: '쿠안탄',
            en: 'Kuantan',
            priority: 2,
            category: 'major',
            region: '팡안',
            isCapital: false
        },
        {
            ko: '알로르세타르',
            en: 'Alor Setar',
            priority: 2,
            category: 'major',
            region: '케다',
            isCapital: false
        },
        {
            ko: '말라카',
            en: 'Malacca',
            priority: 2,
            category: 'tourist',
            region: '말라카',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '쿠알라룸푸르': 'Kuala Lumpur',
            '조호르바루': 'Johor Bahru',
            '이포': 'Ipoh',
            '샤알람': 'Shah Alam',
            '페낭': 'Penang',
            '쿠칭': 'Kuching',
            '코타키나발루': 'Kota Kinabalu',
            '쿠안탄': 'Kuantan',
            '알로르세타르': 'Alor Setar',
            '말라카': 'Malacca'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Kuala Lumpur': '쿠알라룸푸르',
            'Johor Bahru': '조호르바루',
            'Ipoh': '이포',
            'Shah Alam': '샤알람',
            'Penang': '페낭',
            'Kuching': '쿠칭',
            'Kota Kinabalu': '코타키나발루',
            'Kuantan': '쿠안탄',
            'Alor Setar': '알로르세타르',
            'Malacca': '말라카'
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
