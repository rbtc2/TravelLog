/**
 * 스페인 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const SPAIN_CITIES = {
    // 국가 정보
    country: {
        name: 'Spain',
        nameKo: '스페인',
        code: 'ES',
        continent: 'Europe'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '마드리드',
            en: 'Madrid',
            priority: 1,
            category: 'major',
            region: '마드리드',
            isCapital: true
        },
        {
            ko: '바르셀로나',
            en: 'Barcelona',
            priority: 1,
            category: 'major',
            region: '카탈루냐',
            isCapital: false
        },
        {
            ko: '발렌시아',
            en: 'Valencia',
            priority: 1,
            category: 'major',
            region: '발렌시아',
            isCapital: false
        },
        {
            ko: '세비야',
            en: 'Seville',
            priority: 1,
            category: 'major',
            region: '안달루시아',
            isCapital: false
        },
        {
            ko: '사라고사',
            en: 'Zaragoza',
            priority: 1,
            category: 'major',
            region: '아라곤',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '말라가',
            en: 'Málaga',
            priority: 2,
            category: 'major',
            region: '안달루시아',
            isCapital: false
        },
        {
            ko: '무르시아',
            en: 'Murcia',
            priority: 2,
            category: 'major',
            region: '무르시아',
            isCapital: false
        },
        {
            ko: '팔마',
            en: 'Palma',
            priority: 2,
            category: 'tourist',
            region: '발레아레스제도',
            isCapital: false
        },
        {
            ko: '라스팔마스',
            en: 'Las Palmas',
            priority: 2,
            category: 'major',
            region: '카나리아제도',
            isCapital: false
        },
        {
            ko: '빌바오',
            en: 'Bilbao',
            priority: 2,
            category: 'major',
            region: '바스크',
            isCapital: false
        },
        {
            ko: '아코루냐',
            en: 'A Coruña',
            priority: 2,
            category: 'major',
            region: '갈리시아',
            isCapital: false
        },
        {
            ko: '산타크루스데테네리페',
            en: 'Santa Cruz de Tenerife',
            priority: 2,
            category: 'major',
            region: '카나리아제도',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '마드리드': 'Madrid',
            '바르셀로나': 'Barcelona',
            '발렌시아': 'Valencia',
            '세비야': 'Seville',
            '사라고사': 'Zaragoza',
            '말라가': 'Málaga',
            '무르시아': 'Murcia',
            '팔마': 'Palma',
            '라스팔마스': 'Las Palmas',
            '빌바오': 'Bilbao',
            '아코루냐': 'A Coruña',
            '산타크루스데테네리페': 'Santa Cruz de Tenerife'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Madrid': '마드리드',
            'Barcelona': '바르셀로나',
            'Valencia': '발렌시아',
            'Seville': '세비야',
            'Zaragoza': '사라고사',
            'Málaga': '말라가',
            'Murcia': '무르시아',
            'Palma': '팔마',
            'Las Palmas': '라스팔마스',
            'Bilbao': '빌바오',
            'A Coruña': '아코루냐',
            'Santa Cruz de Tenerife': '산타크루스데테네리페'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 12,
        majorCities: 11,
        touristCities: 1,
        lastUpdated: '2025-09-30'
    }
};
