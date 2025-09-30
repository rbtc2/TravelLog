/**
 * 사우디아라비아 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const SAUDI_ARABIA_CITIES = {
    // 국가 정보
    country: {
        name: 'Saudi Arabia',
        nameKo: '사우디아라비아',
        code: 'SA',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '리야드',
            en: 'Riyadh',
            priority: 1,
            category: 'major',
            region: '리야드',
            isCapital: true
        },
        {
            ko: '제다',
            en: 'Jeddah',
            priority: 1,
            category: 'major',
            region: '메카',
            isCapital: false
        },
        {
            ko: '메카',
            en: 'Mecca',
            priority: 1,
            category: 'tourist',
            region: '메카',
            isCapital: false
        },
        {
            ko: '메디나',
            en: 'Medina',
            priority: 1,
            category: 'tourist',
            region: '메디나',
            isCapital: false
        },
        {
            ko: '담맘',
            en: 'Dammam',
            priority: 1,
            category: 'major',
            region: '동부주',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '타이프',
            en: 'Taif',
            priority: 2,
            category: 'major',
            region: '메카',
            isCapital: false
        },
        {
            ko: '부라이다',
            en: 'Buraydah',
            priority: 2,
            category: 'major',
            region: '카심',
            isCapital: false
        },
        {
            ko: '타부크',
            en: 'Tabuk',
            priority: 2,
            category: 'major',
            region: '타부크',
            isCapital: false
        },
        {
            ko: '카미스무샤이트',
            en: 'Khamis Mushait',
            priority: 2,
            category: 'major',
            region: '아시르',
            isCapital: false
        },
        {
            ko: '하일',
            en: 'Hail',
            priority: 2,
            category: 'major',
            region: '하일',
            isCapital: false
        },
        {
            ko: '나지란',
            en: 'Najran',
            priority: 2,
            category: 'major',
            region: '나지란',
            isCapital: false
        },
        {
            ko: '알하사',
            en: 'Al Hasa',
            priority: 2,
            category: 'major',
            region: '동부주',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '리야드': 'Riyadh',
            '제다': 'Jeddah',
            '메카': 'Mecca',
            '메디나': 'Medina',
            '담맘': 'Dammam',
            '타이프': 'Taif',
            '부라이다': 'Buraydah',
            '타부크': 'Tabuk',
            '카미스무샤이트': 'Khamis Mushait',
            '하일': 'Hail',
            '나지란': 'Najran',
            '알하사': 'Al Hasa'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Riyadh': '리야드',
            'Jeddah': '제다',
            'Mecca': '메카',
            'Medina': '메디나',
            'Dammam': '담맘',
            'Taif': '타이프',
            'Buraydah': '부라이다',
            'Tabuk': '타부크',
            'Khamis Mushait': '카미스무샤이트',
            'Hail': '하일',
            'Najran': '나지란',
            'Al Hasa': '알하사'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 12,
        majorCities: 8,
        touristCities: 4,
        lastUpdated: '2025-09-30'
    }
};
