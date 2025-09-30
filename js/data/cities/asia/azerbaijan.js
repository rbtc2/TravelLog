/**
 * 아제르바이잔 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const AZERBAIJAN_CITIES = {
    // 국가 정보
    country: {
        name: 'Azerbaijan',
        nameKo: '아제르바이잔',
        code: 'AZ',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '바쿠',
            en: 'Baku',
            priority: 1,
            category: 'major',
            region: '바쿠',
            isCapital: true
        },
        {
            ko: '간자',
            en: 'Ganja',
            priority: 1,
            category: 'major',
            region: '간자',
            isCapital: false
        },
        {
            ko: '수무가이트',
            en: 'Sumgayit',
            priority: 1,
            category: 'major',
            region: '수무가이트',
            isCapital: false
        },
        {
            ko: '민게체비르',
            en: 'Mingachevir',
            priority: 1,
            category: 'major',
            region: '민게체비르',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '시르반',
            en: 'Shirvan',
            priority: 2,
            category: 'major',
            region: '시르반',
            isCapital: false
        },
        {
            ko: '나흐치반',
            en: 'Nakhchivan',
            priority: 2,
            category: 'major',
            region: '나흐치반',
            isCapital: false
        },
        {
            ko: '레키',
            en: 'Lankaran',
            priority: 2,
            category: 'tourist',
            region: '레키',
            isCapital: false
        },
        {
            ko: '가발라',
            en: 'Gabala',
            priority: 2,
            category: 'tourist',
            region: '가발라',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '바쿠': 'Baku',
            '간자': 'Ganja',
            '수무가이트': 'Sumgayit',
            '민게체비르': 'Mingachevir',
            '시르반': 'Shirvan',
            '나흐치반': 'Nakhchivan',
            '레키': 'Lankaran',
            '가발라': 'Gabala'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Baku': '바쿠',
            'Ganja': '간자',
            'Sumgayit': '수무가이트',
            'Mingachevir': '민게체비르',
            'Shirvan': '시르반',
            'Nakhchivan': '나흐치반',
            'Lankaran': '레키',
            'Gabala': '가발라'
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
