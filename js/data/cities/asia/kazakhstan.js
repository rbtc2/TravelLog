/**
 * 카자흐스탄 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const KAZAKHSTAN_CITIES = {
    // 국가 정보
    country: {
        name: 'Kazakhstan',
        nameKo: '카자흐스탄',
        code: 'KZ',
        continent: 'Europe'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '알마티',
            en: 'Almaty',
            priority: 1,
            category: 'major',
            region: '알마티',
            isCapital: false
        },
        {
            ko: '누르술탄',
            en: 'Nur-Sultan',
            priority: 1,
            category: 'major',
            region: '아크몰라',
            isCapital: true
        },
        {
            ko: '심켄트',
            en: 'Shymkent',
            priority: 1,
            category: 'major',
            region: '남카자흐스탄',
            isCapital: false
        },
        {
            ko: '아크타우',
            en: 'Aktau',
            priority: 1,
            category: 'major',
            region: '망기스타우',
            isCapital: false
        },
        {
            ko: '타라즈',
            en: 'Taraz',
            priority: 1,
            category: 'major',
            region: '잠빌',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '파블로다르',
            en: 'Pavlodar',
            priority: 2,
            category: 'major',
            region: '파블로다르',
            isCapital: false
        },
        {
            ko: '우스카메노고르스크',
            en: 'Ust-Kamenogorsk',
            priority: 2,
            category: 'major',
            region: '동카자흐스탄',
            isCapital: false
        },
        {
            ko: '세메이',
            en: 'Semey',
            priority: 2,
            category: 'major',
            region: '동카자흐스탄',
            isCapital: false
        },
        {
            ko: '오랄',
            en: 'Oral',
            priority: 2,
            category: 'major',
            region: '서카자흐스탄',
            isCapital: false
        },
        {
            ko: '아티라우',
            en: 'Atyrau',
            priority: 2,
            category: 'major',
            region: '아티라우',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '알마티': 'Almaty',
            '누르술탄': 'Nur-Sultan',
            '심켄트': 'Shymkent',
            '아크타우': 'Aktau',
            '타라즈': 'Taraz',
            '파블로다르': 'Pavlodar',
            '우스카메노고르스크': 'Ust-Kamenogorsk',
            '세메이': 'Semey',
            '오랄': 'Oral',
            '아티라우': 'Atyrau'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Almaty': '알마티',
            'Nur-Sultan': '누르술탄',
            'Shymkent': '심켄트',
            'Aktau': '아크타우',
            'Taraz': '타라즈',
            'Pavlodar': '파블로다르',
            'Ust-Kamenogorsk': '우스카메노고르스크',
            'Semey': '세메이',
            'Oral': '오랄',
            'Atyrau': '아티라우'
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
