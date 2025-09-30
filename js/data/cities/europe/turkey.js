/**
 * 튀르키예 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const TURKEY_CITIES = {
    // 국가 정보
    country: {
        name: 'Turkey',
        nameKo: '튀르키예',
        code: 'TR',
        continent: 'Europe'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '이스탄불',
            en: 'Istanbul',
            priority: 1,
            category: 'major',
            region: '마르마라',
            isCapital: false
        },
        {
            ko: '앙카라',
            en: 'Ankara',
            priority: 1,
            category: 'major',
            region: '중앙아나톨리아',
            isCapital: true
        },
        {
            ko: '이즈미르',
            en: 'Izmir',
            priority: 1,
            category: 'major',
            region: '에게해',
            isCapital: false
        },
        {
            ko: '부르사',
            en: 'Bursa',
            priority: 1,
            category: 'major',
            region: '마르마라',
            isCapital: false
        },
        {
            ko: '안탈리아',
            en: 'Antalya',
            priority: 1,
            category: 'tourist',
            region: '지중해',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '아다나',
            en: 'Adana',
            priority: 2,
            category: 'major',
            region: '지중해',
            isCapital: false
        },
        {
            ko: '콘야',
            en: 'Konya',
            priority: 2,
            category: 'major',
            region: '중앙아나톨리아',
            isCapital: false
        },
        {
            ko: '가지안테프',
            en: 'Gaziantep',
            priority: 2,
            category: 'major',
            region: '동남아나톨리아',
            isCapital: false
        },
        {
            ko: '메르신',
            en: 'Mersin',
            priority: 2,
            category: 'major',
            region: '지중해',
            isCapital: false
        },
        {
            ko: '디야르바키르',
            en: 'Diyarbakır',
            priority: 2,
            category: 'major',
            region: '동남아나톨리아',
            isCapital: false
        },
        {
            ko: '카이세리',
            en: 'Kayseri',
            priority: 2,
            category: 'major',
            region: '중앙아나톨리아',
            isCapital: false
        },
        {
            ko: '에스키셰히르',
            en: 'Eskişehir',
            priority: 2,
            category: 'major',
            region: '중앙아나톨리아',
            isCapital: false
        },
        {
            ko: '트라브존',
            en: 'Trabzon',
            priority: 2,
            category: 'tourist',
            region: '흑해',
            isCapital: false
        },
        {
            ko: '오르두',
            en: 'Ordu',
            priority: 2,
            category: 'major',
            region: '흑해',
            isCapital: false
        },
        {
            ko: '시바스',
            en: 'Sivas',
            priority: 2,
            category: 'major',
            region: '중앙아나톨리아',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '이스탄불': 'Istanbul',
            '앙카라': 'Ankara',
            '이즈미르': 'Izmir',
            '부르사': 'Bursa',
            '안탈리아': 'Antalya',
            '아다나': 'Adana',
            '콘야': 'Konya',
            '가지안테프': 'Gaziantep',
            '메르신': 'Mersin',
            '디야르바키르': 'Diyarbakır',
            '카이세리': 'Kayseri',
            '에스키셰히르': 'Eskişehir',
            '트라브존': 'Trabzon',
            '오르두': 'Ordu',
            '시바스': 'Sivas'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Istanbul': '이스탄불',
            'Ankara': '앙카라',
            'Izmir': '이즈미르',
            'Bursa': '부르사',
            'Antalya': '안탈리아',
            'Adana': '아다나',
            'Konya': '콘야',
            'Gaziantep': '가지안테프',
            'Mersin': '메르신',
            'Diyarbakır': '디야르바키르',
            'Kayseri': '카이세리',
            'Eskişehir': '에스키셰히르',
            'Trabzon': '트라브존',
            'Ordu': '오르두',
            'Sivas': '시바스'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 15,
        majorCities: 13,
        touristCities: 2,
        lastUpdated: '2025-09-30'
    }
};
