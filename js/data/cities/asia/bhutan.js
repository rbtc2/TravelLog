/**
 * 부탄 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const BHUTAN_CITIES = {
    // 국가 정보
    country: {
        name: 'Bhutan',
        nameKo: '부탄',
        code: 'BT',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '팀부',
            en: 'Thimphu',
            priority: 1,
            category: 'major',
            region: '팀부',
            isCapital: true
        },
        {
            ko: '파로',
            en: 'Paro',
            priority: 1,
            category: 'tourist',
            region: '파로',
            isCapital: false
        },
        {
            ko: '푸나카',
            en: 'Punakha',
            priority: 1,
            category: 'tourist',
            region: '푸나카',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '왕두포드랑',
            en: 'Wangdue Phodrang',
            priority: 2,
            category: 'major',
            region: '왕두포드랑',
            isCapital: false
        },
        {
            ko: '자카르',
            en: 'Jakar',
            priority: 2,
            category: 'tourist',
            region: '분탕',
            isCapital: false
        },
        {
            ko: '게이풀',
            en: 'Gelephu',
            priority: 2,
            category: 'major',
            region: '사르팡',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '팀부': 'Thimphu',
            '파로': 'Paro',
            '푸나카': 'Punakha',
            '왕두포드랑': 'Wangdue Phodrang',
            '자카르': 'Jakar',
            '게이풀': 'Gelephu'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Thimphu': '팀부',
            'Paro': '파로',
            'Punakha': '푸나카',
            'Wangdue Phodrang': '왕두포드랑',
            'Jakar': '자카르',
            'Gelephu': '게이풀'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 6,
        majorCities: 3,
        touristCities: 3,
        lastUpdated: '2025-09-30'
    }
};
