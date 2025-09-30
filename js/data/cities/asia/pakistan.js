/**
 * 파키스탄 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const PAKISTAN_CITIES = {
    // 국가 정보
    country: {
        name: 'Pakistan',
        nameKo: '파키스탄',
        code: 'PK',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '카라치',
            en: 'Karachi',
            priority: 1,
            category: 'major',
            region: '신드',
            isCapital: false
        },
        {
            ko: '라호르',
            en: 'Lahore',
            priority: 1,
            category: 'major',
            region: '펀자브',
            isCapital: false
        },
        {
            ko: '이슬라마바드',
            en: 'Islamabad',
            priority: 1,
            category: 'major',
            region: '이슬라마바드',
            isCapital: true
        },
        {
            ko: '페샤와르',
            en: 'Peshawar',
            priority: 1,
            category: 'major',
            region: '카이베르파크툰크와',
            isCapital: false
        },
        {
            ko: '라왈핀디',
            en: 'Rawalpindi',
            priority: 1,
            category: 'major',
            region: '펀자브',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '파이살라바드',
            en: 'Faisalabad',
            priority: 2,
            category: 'major',
            region: '펀자브',
            isCapital: false
        },
        {
            ko: '쿠에타',
            en: 'Quetta',
            priority: 2,
            category: 'major',
            region: '발루치스탄',
            isCapital: false
        },
        {
            ko: '시얄코트',
            en: 'Sialkot',
            priority: 2,
            category: 'major',
            region: '펀자브',
            isCapital: false
        },
        {
            ko: '구즈라트',
            en: 'Gujrat',
            priority: 2,
            category: 'major',
            region: '펀자브',
            isCapital: false
        },
        {
            ko: '수쿠르',
            en: 'Sukkur',
            priority: 2,
            category: 'major',
            region: '신드',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '카라치': 'Karachi',
            '라호르': 'Lahore',
            '이슬라마바드': 'Islamabad',
            '페샤와르': 'Peshawar',
            '라왈핀디': 'Rawalpindi',
            '파이살라바드': 'Faisalabad',
            '쿠에타': 'Quetta',
            '시얄코트': 'Sialkot',
            '구즈라트': 'Gujrat',
            '수쿠르': 'Sukkur'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Karachi': '카라치',
            'Lahore': '라호르',
            'Islamabad': '이슬라마바드',
            'Peshawar': '페샤와르',
            'Rawalpindi': '라왈핀디',
            'Faisalabad': '파이살라바드',
            'Quetta': '쿠에타',
            'Sialkot': '시얄코트',
            'Gujrat': '구즈라트',
            'Sukkur': '수쿠르'
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
