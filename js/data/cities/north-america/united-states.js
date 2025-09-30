/**
 * 미국 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const UNITED_STATES_CITIES = {
    // 국가 정보
    country: {
        name: 'United States',
        nameKo: '미국',
        code: 'US',
        continent: 'Americas'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '뉴욕',
            en: 'New York',
            priority: 1,
            category: 'major',
            region: '뉴욕',
            isCapital: false
        },
        {
            ko: '로스앤젤레스',
            en: 'Los Angeles',
            priority: 1,
            category: 'major',
            region: '캘리포니아',
            isCapital: false
        },
        {
            ko: '시카고',
            en: 'Chicago',
            priority: 1,
            category: 'major',
            region: '일리노이',
            isCapital: false
        },
        {
            ko: '휴스턴',
            en: 'Houston',
            priority: 1,
            category: 'major',
            region: '텍사스',
            isCapital: false
        },
        {
            ko: '피닉스',
            en: 'Phoenix',
            priority: 1,
            category: 'major',
            region: '애리조나',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '필라델피아',
            en: 'Philadelphia',
            priority: 2,
            category: 'major',
            region: '펜실베이니아',
            isCapital: false
        },
        {
            ko: '샌안토니오',
            en: 'San Antonio',
            priority: 2,
            category: 'major',
            region: '텍사스',
            isCapital: false
        },
        {
            ko: '샌디에이고',
            en: 'San Diego',
            priority: 2,
            category: 'major',
            region: '캘리포니아',
            isCapital: false
        },
        {
            ko: '댈러스',
            en: 'Dallas',
            priority: 2,
            category: 'major',
            region: '텍사스',
            isCapital: false
        },
        {
            ko: '샌호세',
            en: 'San Jose',
            priority: 2,
            category: 'major',
            region: '캘리포니아',
            isCapital: false
        },
        {
            ko: '오스틴',
            en: 'Austin',
            priority: 2,
            category: 'major',
            region: '텍사스',
            isCapital: false
        },
        {
            ko: '잭슨빌',
            en: 'Jacksonville',
            priority: 2,
            category: 'major',
            region: '플로리다',
            isCapital: false
        },
        {
            ko: '포트워스',
            en: 'Fort Worth',
            priority: 2,
            category: 'major',
            region: '텍사스',
            isCapital: false
        },
        {
            ko: '콜럼버스',
            en: 'Columbus',
            priority: 2,
            category: 'major',
            region: '오하이오',
            isCapital: false
        },
        {
            ko: '샬럿',
            en: 'Charlotte',
            priority: 2,
            category: 'major',
            region: '노스캐롤라이나',
            isCapital: false
        },
        
        // 3순위: 관광 도시
        {
            ko: '샌프란시스코',
            en: 'San Francisco',
            priority: 3,
            category: 'tourist',
            region: '캘리포니아',
            isCapital: false
        },
        {
            ko: '인디애나폴리스',
            en: 'Indianapolis',
            priority: 3,
            category: 'major',
            region: '인디애나',
            isCapital: false
        },
        {
            ko: '시애틀',
            en: 'Seattle',
            priority: 3,
            category: 'major',
            region: '워싱턴',
            isCapital: false
        },
        {
            ko: '덴버',
            en: 'Denver',
            priority: 3,
            category: 'major',
            region: '콜로라도',
            isCapital: false
        },
        {
            ko: '워싱턴',
            en: 'Washington',
            priority: 3,
            category: 'major',
            region: '워싱턴 D.C.',
            isCapital: true
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '뉴욕': 'New York',
            '로스앤젤레스': 'Los Angeles',
            '시카고': 'Chicago',
            '휴스턴': 'Houston',
            '피닉스': 'Phoenix',
            '필라델피아': 'Philadelphia',
            '샌안토니오': 'San Antonio',
            '샌디에이고': 'San Diego',
            '댈러스': 'Dallas',
            '샌호세': 'San Jose',
            '오스틴': 'Austin',
            '잭슨빌': 'Jacksonville',
            '포트워스': 'Fort Worth',
            '콜럼버스': 'Columbus',
            '샬럿': 'Charlotte',
            '샌프란시스코': 'San Francisco',
            '인디애나폴리스': 'Indianapolis',
            '시애틀': 'Seattle',
            '덴버': 'Denver',
            '워싱턴': 'Washington'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'New York': '뉴욕',
            'Los Angeles': '로스앤젤레스',
            'Chicago': '시카고',
            'Houston': '휴스턴',
            'Phoenix': '피닉스',
            'Philadelphia': '필라델피아',
            'San Antonio': '샌안토니오',
            'San Diego': '샌디에이고',
            'Dallas': '댈러스',
            'San Jose': '샌호세',
            'Austin': '오스틴',
            'Jacksonville': '잭슨빌',
            'Fort Worth': '포트워스',
            'Columbus': '콜럼버스',
            'Charlotte': '샬럿',
            'San Francisco': '샌프란시스코',
            'Indianapolis': '인디애나폴리스',
            'Seattle': '시애틀',
            'Denver': '덴버',
            'Washington': '워싱턴'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 20,
        majorCities: 19,
        touristCities: 1,
        lastUpdated: '2025-09-30'
    }
};
