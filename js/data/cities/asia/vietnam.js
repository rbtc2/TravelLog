/**
 * 베트남 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const VIETNAM_CITIES = {
    // 국가 정보
    country: {
        name: 'Vietnam',
        nameKo: '베트남',
        code: 'VN',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '호치민시',
            en: 'Ho Chi Minh City',
            priority: 1,
            category: 'major',
            region: '남부',
            isCapital: false
        },
        {
            ko: '하노이',
            en: 'Hanoi',
            priority: 1,
            category: 'major',
            region: '북부',
            isCapital: true
        },
        {
            ko: '다낭',
            en: 'Da Nang',
            priority: 1,
            category: 'major',
            region: '중부',
            isCapital: false
        },
        {
            ko: '하이퐁',
            en: 'Hai Phong',
            priority: 1,
            category: 'major',
            region: '북부',
            isCapital: false
        },
        {
            ko: '껀터',
            en: 'Can Tho',
            priority: 1,
            category: 'major',
            region: '남부',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '후에',
            en: 'Hue',
            priority: 2,
            category: 'tourist',
            region: '중부',
            isCapital: false
        },
        {
            ko: '나트랑',
            en: 'Nha Trang',
            priority: 2,
            category: 'tourist',
            region: '중부',
            isCapital: false
        },
        {
            ko: '호이안',
            en: 'Hoi An',
            priority: 2,
            category: 'tourist',
            region: '중부',
            isCapital: false
        },
        {
            ko: '달랏',
            en: 'Da Lat',
            priority: 2,
            category: 'tourist',
            region: '남부',
            isCapital: false
        },
        {
            ko: '푸꾸옥',
            en: 'Phu Quoc',
            priority: 2,
            category: 'tourist',
            region: '남부',
            isCapital: false
        },
        {
            ko: '빈',
            en: 'Vinh',
            priority: 2,
            category: 'major',
            region: '북부',
            isCapital: false
        },
        {
            ko: '부온마투옷',
            en: 'Buon Ma Thuot',
            priority: 2,
            category: 'major',
            region: '중부',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '호치민시': 'Ho Chi Minh City',
            '하노이': 'Hanoi',
            '다낭': 'Da Nang',
            '하이퐁': 'Hai Phong',
            '껀터': 'Can Tho',
            '후에': 'Hue',
            '나트랑': 'Nha Trang',
            '호이안': 'Hoi An',
            '달랏': 'Da Lat',
            '푸꾸옥': 'Phu Quoc',
            '빈': 'Vinh',
            '부온마투옷': 'Buon Ma Thuot'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Ho Chi Minh City': '호치민시',
            'Hanoi': '하노이',
            'Da Nang': '다낭',
            'Hai Phong': '하이퐁',
            'Can Tho': '껀터',
            'Hue': '후에',
            'Nha Trang': '나트랑',
            'Hoi An': '호이안',
            'Da Lat': '달랏',
            'Phu Quoc': '푸꾸옥',
            'Vinh': '빈',
            'Buon Ma Thuot': '부온마투옷'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 12,
        majorCities: 7,
        touristCities: 5,
        lastUpdated: '2025-09-30'
    }
};
