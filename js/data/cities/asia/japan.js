/**
 * 일본 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const JAPAN_CITIES = {
    // 국가 정보
    country: {
        name: 'Japan',
        nameKo: '일본',
        code: 'JP',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '도쿄',
            en: 'Tokyo',
            priority: 1,
            category: 'major',
            region: '간토',
            isCapital: true
        },
        {
            ko: '오사카',
            en: 'Osaka',
            priority: 1,
            category: 'major',
            region: '간사이',
            isCapital: false
        },
        {
            ko: '교토',
            en: 'Kyoto',
            priority: 1,
            category: 'tourist',
            region: '간사이',
            isCapital: false
        },
        {
            ko: '요코하마',
            en: 'Yokohama',
            priority: 1,
            category: 'major',
            region: '간토',
            isCapital: false
        },
        {
            ko: '나고야',
            en: 'Nagoya',
            priority: 1,
            category: 'major',
            region: '주부',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '삿포로',
            en: 'Sapporo',
            priority: 2,
            category: 'major',
            region: '홋카이도',
            isCapital: false
        },
        {
            ko: '후쿠오카',
            en: 'Fukuoka',
            priority: 2,
            category: 'major',
            region: '규슈',
            isCapital: false
        },
        {
            ko: '고베',
            en: 'Kobe',
            priority: 2,
            category: 'major',
            region: '간사이',
            isCapital: false
        },
        {
            ko: '히로시마',
            en: 'Hiroshima',
            priority: 2,
            category: 'major',
            region: '주고쿠',
            isCapital: false
        },
        {
            ko: '센다이',
            en: 'Sendai',
            priority: 2,
            category: 'major',
            region: '도호쿠',
            isCapital: false
        },
        {
            ko: '니가타',
            en: 'Niigata',
            priority: 2,
            category: 'major',
            region: '주부',
            isCapital: false
        },
        {
            ko: '시즈오카',
            en: 'Shizuoka',
            priority: 2,
            category: 'major',
            region: '주부',
            isCapital: false
        },
        
        // 3순위: 관광 도시
        {
            ko: '구마모토',
            en: 'Kumamoto',
            priority: 3,
            category: 'tourist',
            region: '규슈',
            isCapital: false
        },
        {
            ko: '오키나와',
            en: 'Okinawa',
            priority: 3,
            category: 'tourist',
            region: '오키나와',
            isCapital: false
        },
        {
            ko: '나라',
            en: 'Nara',
            priority: 3,
            category: 'tourist',
            region: '간사이',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '도쿄': 'Tokyo',
            '오사카': 'Osaka',
            '교토': 'Kyoto',
            '요코하마': 'Yokohama',
            '나고야': 'Nagoya',
            '삿포로': 'Sapporo',
            '후쿠오카': 'Fukuoka',
            '고베': 'Kobe',
            '히로시마': 'Hiroshima',
            '센다이': 'Sendai',
            '니가타': 'Niigata',
            '시즈오카': 'Shizuoka',
            '구마모토': 'Kumamoto',
            '오키나와': 'Okinawa',
            '나라': 'Nara'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Tokyo': '도쿄',
            'Osaka': '오사카',
            'Kyoto': '교토',
            'Yokohama': '요코하마',
            'Nagoya': '나고야',
            'Sapporo': '삿포로',
            'Fukuoka': '후쿠오카',
            'Kobe': '고베',
            'Hiroshima': '히로시마',
            'Sendai': '센다이',
            'Niigata': '니가타',
            'Shizuoka': '시즈오카',
            'Kumamoto': '구마모토',
            'Okinawa': '오키나와',
            'Nara': '나라'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 15,
        majorCities: 12,
        touristCities: 3,
        lastUpdated: '2025-09-30'
    }
};
