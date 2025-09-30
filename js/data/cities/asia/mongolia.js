/**
 * 몽골 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const MONGOLIA_CITIES = {
    // 국가 정보
    country: {
        name: 'Mongolia',
        nameKo: '몽골',
        code: 'MN',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '울란바토르',
            en: 'Ulaanbaatar',
            priority: 1,
            category: 'major',
            region: '울란바토르',
            isCapital: true
        },
        {
            ko: '에르데네트',
            en: 'Erdenet',
            priority: 1,
            category: 'major',
            region: '오르홍',
            isCapital: false
        },
        {
            ko: '다르한',
            en: 'Darkhan',
            priority: 1,
            category: 'major',
            region: '셀렝게',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '초이발산',
            en: 'Choibalsan',
            priority: 2,
            category: 'major',
            region: '도르노드',
            isCapital: false
        },
        {
            ko: '무르운',
            en: 'Mörön',
            priority: 2,
            category: 'major',
            region: '후브스굴',
            isCapital: false
        },
        {
            ko: '바얀홍고르',
            en: 'Bayanhongor',
            priority: 2,
            category: 'tourist',
            region: '바얀홍고르',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '울란바토르': 'Ulaanbaatar',
            '에르데네트': 'Erdenet',
            '다르한': 'Darkhan',
            '초이발산': 'Choibalsan',
            '무르운': 'Mörön',
            '바얀홍고르': 'Bayanhongor'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Ulaanbaatar': '울란바토르',
            'Erdenet': '에르데네트',
            'Darkhan': '다르한',
            'Choibalsan': '초이발산',
            'Mörön': '무르운',
            'Bayanhongor': '바얀홍고르'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 6,
        majorCities: 5,
        touristCities: 1,
        lastUpdated: '2025-09-30'
    }
};
