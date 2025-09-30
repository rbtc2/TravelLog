/**
 * 멕시코 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const MEXICO_CITIES = {
    // 국가 정보
    country: {
        name: 'Mexico',
        nameKo: '멕시코',
        code: 'MX',
        continent: 'Americas'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '멕시코시티',
            en: 'Mexico City',
            priority: 1,
            category: 'major',
            region: '멕시코시티',
            isCapital: true
        },
        {
            ko: '과달라하라',
            en: 'Guadalajara',
            priority: 1,
            category: 'major',
            region: '할리스코',
            isCapital: false
        },
        {
            ko: '몬테레이',
            en: 'Monterrey',
            priority: 1,
            category: 'major',
            region: '누에보레온',
            isCapital: false
        },
        {
            ko: '푸에블라',
            en: 'Puebla',
            priority: 1,
            category: 'major',
            region: '푸에블라',
            isCapital: false
        },
        {
            ko: '티후아나',
            en: 'Tijuana',
            priority: 1,
            category: 'major',
            region: '바하캘리포니아',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '레온',
            en: 'León',
            priority: 2,
            category: 'major',
            region: '과나후아토',
            isCapital: false
        },
        {
            ko: '후아레스',
            en: 'Juárez',
            priority: 2,
            category: 'major',
            region: '치와와',
            isCapital: false
        },
        {
            ko: '토레온',
            en: 'Torreón',
            priority: 2,
            category: 'major',
            region: '코아우일라',
            isCapital: false
        },
        {
            ko: '키타나로',
            en: 'Querétaro',
            priority: 2,
            category: 'major',
            region: '케레타로',
            isCapital: false
        },
        {
            ko: '산루이스포토시',
            en: 'San Luis Potosí',
            priority: 2,
            category: 'major',
            region: '산루이스포토시',
            isCapital: false
        },
        {
            ko: '메리다',
            en: 'Mérida',
            priority: 2,
            category: 'major',
            region: '유카탄',
            isCapital: false
        },
        {
            ko: '멕시칼리',
            en: 'Mexicali',
            priority: 2,
            category: 'major',
            region: '바하캘리포니아',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '멕시코시티': 'Mexico City',
            '과달라하라': 'Guadalajara',
            '몬테레이': 'Monterrey',
            '푸에블라': 'Puebla',
            '티후아나': 'Tijuana',
            '레온': 'León',
            '후아레스': 'Juárez',
            '토레온': 'Torreón',
            '키타나로': 'Querétaro',
            '산루이스포토시': 'San Luis Potosí',
            '메리다': 'Mérida',
            '멕시칼리': 'Mexicali'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Mexico City': '멕시코시티',
            'Guadalajara': '과달라하라',
            'Monterrey': '몬테레이',
            'Puebla': '푸에블라',
            'Tijuana': '티후아나',
            'León': '레온',
            'Juárez': '후아레스',
            'Torreón': '토레온',
            'Querétaro': '키타나로',
            'San Luis Potosí': '산루이스포토시',
            'Mérida': '메리다',
            'Mexicali': '멕시칼리'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 12,
        majorCities: 12,
        touristCities: 0,
        lastUpdated: '2025-09-30'
    }
};
