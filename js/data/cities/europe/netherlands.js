/**
 * 네덜란드 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const NETHERLANDS_CITIES = {
    // 국가 정보
    country: {
        name: 'Netherlands',
        nameKo: '네덜란드',
        code: 'NL',
        continent: 'Europe'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '암스테르담',
            en: 'Amsterdam',
            priority: 1,
            category: 'major',
            region: '노르트홀란트',
            isCapital: true
        },
        {
            ko: '로테르담',
            en: 'Rotterdam',
            priority: 1,
            category: 'major',
            region: '자위드홀란트',
            isCapital: false
        },
        {
            ko: '헤이그',
            en: 'The Hague',
            priority: 1,
            category: 'major',
            region: '자위드홀란트',
            isCapital: false
        },
        {
            ko: '위트레흐트',
            en: 'Utrecht',
            priority: 1,
            category: 'major',
            region: '위트레흐트',
            isCapital: false
        },
        {
            ko: '아인트호벤',
            en: 'Eindhoven',
            priority: 1,
            category: 'major',
            region: '노르트브라반트',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '틸부르흐',
            en: 'Tilburg',
            priority: 2,
            category: 'major',
            region: '노르트브라반트',
            isCapital: false
        },
        {
            ko: '그로닝언',
            en: 'Groningen',
            priority: 2,
            category: 'major',
            region: '그로닝언',
            isCapital: false
        },
        {
            ko: '알메르',
            en: 'Almere',
            priority: 2,
            category: 'major',
            region: '플레볼란트',
            isCapital: false
        },
        {
            ko: '브레다',
            en: 'Breda',
            priority: 2,
            category: 'major',
            region: '노르트브라반트',
            isCapital: false
        },
        {
            ko: '네이메헌',
            en: 'Nijmegen',
            priority: 2,
            category: 'major',
            region: '헬데를란트',
            isCapital: false
        },
        {
            ko: '하를렘',
            en: 'Haarlem',
            priority: 2,
            category: 'tourist',
            region: '노르트홀란트',
            isCapital: false
        },
        {
            ko: '잔담',
            en: 'Zaandam',
            priority: 2,
            category: 'tourist',
            region: '노르트홀란트',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '암스테르담': 'Amsterdam',
            '로테르담': 'Rotterdam',
            '헤이그': 'The Hague',
            '위트레흐트': 'Utrecht',
            '아인트호벤': 'Eindhoven',
            '틸부르흐': 'Tilburg',
            '그로닝언': 'Groningen',
            '알메르': 'Almere',
            '브레다': 'Breda',
            '네이메헌': 'Nijmegen',
            '하를렘': 'Haarlem',
            '잔담': 'Zaandam'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Amsterdam': '암스테르담',
            'Rotterdam': '로테르담',
            'The Hague': '헤이그',
            'Utrecht': '위트레흐트',
            'Eindhoven': '아인트호벤',
            'Tilburg': '틸부르흐',
            'Groningen': '그로닝언',
            'Almere': '알메르',
            'Breda': '브레다',
            'Nijmegen': '네이메헌',
            'Haarlem': '하를렘',
            'Zaandam': '잔담'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 12,
        majorCities: 10,
        touristCities: 2,
        lastUpdated: '2025-09-30'
    }
};
