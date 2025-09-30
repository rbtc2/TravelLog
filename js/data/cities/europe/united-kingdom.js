/**
 * 영국 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const UNITED_KINGDOM_CITIES = {
    // 국가 정보
    country: {
        name: 'United Kingdom',
        nameKo: '영국',
        code: 'GB',
        continent: 'Europe'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '런던',
            en: 'London',
            priority: 1,
            category: 'major',
            region: '잉글랜드',
            isCapital: true
        },
        {
            ko: '버밍엄',
            en: 'Birmingham',
            priority: 1,
            category: 'major',
            region: '잉글랜드',
            isCapital: false
        },
        {
            ko: '맨체스터',
            en: 'Manchester',
            priority: 1,
            category: 'major',
            region: '잉글랜드',
            isCapital: false
        },
        {
            ko: '글래스고',
            en: 'Glasgow',
            priority: 1,
            category: 'major',
            region: '스코틀랜드',
            isCapital: false
        },
        {
            ko: '리버풀',
            en: 'Liverpool',
            priority: 1,
            category: 'major',
            region: '잉글랜드',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '리즈',
            en: 'Leeds',
            priority: 2,
            category: 'major',
            region: '잉글랜드',
            isCapital: false
        },
        {
            ko: '셰필드',
            en: 'Sheffield',
            priority: 2,
            category: 'major',
            region: '잉글랜드',
            isCapital: false
        },
        {
            ko: '에딘버러',
            en: 'Edinburgh',
            priority: 2,
            category: 'major',
            region: '스코틀랜드',
            isCapital: false
        },
        {
            ko: '브리스톨',
            en: 'Bristol',
            priority: 2,
            category: 'major',
            region: '잉글랜드',
            isCapital: false
        },
        {
            ko: '카디프',
            en: 'Cardiff',
            priority: 2,
            category: 'major',
            region: '웨일스',
            isCapital: false
        },
        {
            ko: '벨파스트',
            en: 'Belfast',
            priority: 2,
            category: 'major',
            region: '북아일랜드',
            isCapital: false
        },
        {
            ko: '레스터',
            en: 'Leicester',
            priority: 2,
            category: 'major',
            region: '잉글랜드',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '런던': 'London',
            '버밍엄': 'Birmingham',
            '맨체스터': 'Manchester',
            '글래스고': 'Glasgow',
            '리버풀': 'Liverpool',
            '리즈': 'Leeds',
            '셰필드': 'Sheffield',
            '에딘버러': 'Edinburgh',
            '브리스톨': 'Bristol',
            '카디프': 'Cardiff',
            '벨파스트': 'Belfast',
            '레스터': 'Leicester'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'London': '런던',
            'Birmingham': '버밍엄',
            'Manchester': '맨체스터',
            'Glasgow': '글래스고',
            'Liverpool': '리버풀',
            'Leeds': '리즈',
            'Sheffield': '셰필드',
            'Edinburgh': '에딘버러',
            'Bristol': '브리스톨',
            'Cardiff': '카디프',
            'Belfast': '벨파스트',
            'Leicester': '레스터'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 12,
        majorCities: 12,
        touristCities: 0,
        lastUpdated: '2025-09-30'
    }
};
