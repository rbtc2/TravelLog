/**
 * 몰디브 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const MALDIVES_CITIES = {
    // 국가 정보
    country: {
        name: 'Maldives',
        nameKo: '몰디브',
        code: 'MV',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 지역
        {
            ko: '말레',
            en: 'Malé',
            priority: 1,
            category: 'major',
            region: '말레',
            isCapital: true
        },
        {
            ko: '아두',
            en: 'Addu',
            priority: 1,
            category: 'major',
            region: '아두아톨',
            isCapital: false
        },
        {
            ko: '푸나두',
            en: 'Fuvahmulah',
            priority: 1,
            category: 'tourist',
            region: '푸나두',
            isCapital: false
        },
        
        // 2순위: 주요 지역
        {
            ko: '쿨후두후',
            en: 'Kulhudhuffushi',
            priority: 2,
            category: 'major',
            region: '하아알리프아톨',
            isCapital: false
        },
        {
            ko: '티나두',
            en: 'Thinadhoo',
            priority: 2,
            category: 'major',
            region: '가프알리프아톨',
            isCapital: false
        },
        {
            ko: '에이드후',
            en: 'Eydhafushi',
            priority: 2,
            category: 'tourist',
            region: '바아아톨',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '말레': 'Malé',
            '아두': 'Addu',
            '푸나두': 'Fuvahmulah',
            '쿨후두후': 'Kulhudhuffushi',
            '티나두': 'Thinadhoo',
            '에이드후': 'Eydhafushi'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Malé': '말레',
            'Addu': '아두',
            'Fuvahmulah': '푸나두',
            'Kulhudhuffushi': '쿨후두후',
            'Thinadhoo': '티나두',
            'Eydhafushi': '에이드후'
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
