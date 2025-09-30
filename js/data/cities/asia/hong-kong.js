/**
 * 홍콩 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const HONG_KONG_CITIES = {
    // 국가 정보
    country: {
        name: 'Hong Kong',
        nameKo: '홍콩',
        code: 'HK',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 지역
        {
            ko: '홍콩',
            en: 'Hong Kong',
            priority: 1,
            category: 'major',
            region: '홍콩섬',
            isCapital: true
        },
        {
            ko: '중환',
            en: 'Central',
            priority: 1,
            category: 'major',
            region: '홍콩섬',
            isCapital: false
        },
        {
            ko: '완차이',
            en: 'Wan Chai',
            priority: 1,
            category: 'major',
            region: '홍콩섬',
            isCapital: false
        },
        {
            ko: '사이공',
            en: 'Sai Kung',
            priority: 1,
            category: 'tourist',
            region: '신계',
            isCapital: false
        },
        
        // 2순위: 주요 지역
        {
            ko: '칭이',
            en: 'Tsing Yi',
            priority: 2,
            category: 'major',
            region: '신계',
            isCapital: false
        },
        {
            ko: '사틴',
            en: 'Sha Tin',
            priority: 2,
            category: 'major',
            region: '신계',
            isCapital: false
        },
        {
            ko: '타이포',
            en: 'Tai Po',
            priority: 2,
            category: 'major',
            region: '신계',
            isCapital: false
        },
        {
            ko: '야우마테이',
            en: 'Yau Ma Tei',
            priority: 2,
            category: 'tourist',
            region: '구룡',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '홍콩': 'Hong Kong',
            '중환': 'Central',
            '완차이': 'Wan Chai',
            '사이공': 'Sai Kung',
            '칭이': 'Tsing Yi',
            '사틴': 'Sha Tin',
            '타이포': 'Tai Po',
            '야우마테이': 'Yau Ma Tei'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Hong Kong': '홍콩',
            'Central': '중환',
            'Wan Chai': '완차이',
            'Sai Kung': '사이공',
            'Tsing Yi': '칭이',
            'Sha Tin': '사틴',
            'Tai Po': '타이포',
            'Yau Ma Tei': '야우마테이'
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
