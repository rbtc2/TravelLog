/**
 * 대만 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const TAIWAN_CITIES = {
    // 국가 정보
    country: {
        name: 'Taiwan',
        nameKo: '대만',
        code: 'TW',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '타이베이',
            en: 'Taipei',
            priority: 1,
            category: 'major',
            region: '북부',
            isCapital: true
        },
        {
            ko: '가오슝',
            en: 'Kaohsiung',
            priority: 1,
            category: 'major',
            region: '남부',
            isCapital: false
        },
        {
            ko: '타이중',
            en: 'Taichung',
            priority: 1,
            category: 'major',
            region: '중부',
            isCapital: false
        },
        {
            ko: '타이난',
            en: 'Tainan',
            priority: 1,
            category: 'major',
            region: '남부',
            isCapital: false
        },
        {
            ko: '타오위안',
            en: 'Taoyuan',
            priority: 1,
            category: 'major',
            region: '북부',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '신주',
            en: 'Hsinchu',
            priority: 2,
            category: 'major',
            region: '북부',
            isCapital: false
        },
        {
            ko: '지룽',
            en: 'Keelung',
            priority: 2,
            category: 'major',
            region: '북부',
            isCapital: false
        },
        {
            ko: '자이',
            en: 'Chiayi',
            priority: 2,
            category: 'major',
            region: '중부',
            isCapital: false
        },
        {
            ko: '화롄',
            en: 'Hualien',
            priority: 2,
            category: 'tourist',
            region: '동부',
            isCapital: false
        },
        {
            ko: '이란',
            en: 'Yilan',
            priority: 2,
            category: 'tourist',
            region: '북부',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '타이베이': 'Taipei',
            '가오슝': 'Kaohsiung',
            '타이중': 'Taichung',
            '타이난': 'Tainan',
            '타오위안': 'Taoyuan',
            '신주': 'Hsinchu',
            '지룽': 'Keelung',
            '자이': 'Chiayi',
            '화롄': 'Hualien',
            '이란': 'Yilan'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Taipei': '타이베이',
            'Kaohsiung': '가오슝',
            'Taichung': '타이중',
            'Tainan': '타이난',
            'Taoyuan': '타오위안',
            'Hsinchu': '신주',
            'Keelung': '지룽',
            'Chiayi': '자이',
            'Hualien': '화롄',
            'Yilan': '이란'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 10,
        majorCities: 8,
        touristCities: 2,
        lastUpdated: '2025-09-30'
    }
};
