/**
 * 카타르 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const QATAR_CITIES = {
    // 국가 정보
    country: {
        name: 'Qatar',
        nameKo: '카타르',
        code: 'QA',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '도하',
            en: 'Doha',
            priority: 1,
            category: 'major',
            region: '도하',
            isCapital: true
        },
        {
            ko: '알라이얀',
            en: 'Al Rayyan',
            priority: 1,
            category: 'major',
            region: '알라이얀',
            isCapital: false
        },
        {
            ko: '알와크라',
            en: 'Al Wakrah',
            priority: 1,
            category: 'major',
            region: '알와크라',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '알코르',
            en: 'Al Khor',
            priority: 2,
            category: 'major',
            region: '알코르',
            isCapital: false
        },
        {
            ko: '두칸',
            en: 'Dukhan',
            priority: 2,
            category: 'major',
            region: '알샤마르',
            isCapital: false
        },
        {
            ko: '메사이드',
            en: 'Mesaieed',
            priority: 2,
            category: 'major',
            region: '알와크라',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '도하': 'Doha',
            '알라이얀': 'Al Rayyan',
            '알와크라': 'Al Wakrah',
            '알코르': 'Al Khor',
            '두칸': 'Dukhan',
            '메사이드': 'Mesaieed'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Doha': '도하',
            'Al Rayyan': '알라이얀',
            'Al Wakrah': '알와크라',
            'Al Khor': '알코르',
            'Dukhan': '두칸',
            'Mesaieed': '메사이드'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 6,
        majorCities: 6,
        touristCities: 0,
        lastUpdated: '2025-09-30'
    }
};
