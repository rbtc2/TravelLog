/**
 * 프랑스 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const FRANCE_CITIES = {
    // 국가 정보
    country: {
        name: 'France',
        nameKo: '프랑스',
        code: 'FR',
        continent: 'Europe'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '파리',
            en: 'Paris',
            priority: 1,
            category: 'major',
            region: '일드프랑스',
            isCapital: true
        },
        {
            ko: '마르세유',
            en: 'Marseille',
            priority: 1,
            category: 'major',
            region: '프로방스알프코트다쥐르',
            isCapital: false
        },
        {
            ko: '리옹',
            en: 'Lyon',
            priority: 1,
            category: 'major',
            region: '오베르뉴론알프',
            isCapital: false
        },
        {
            ko: '툴루즈',
            en: 'Toulouse',
            priority: 1,
            category: 'major',
            region: '옥시타니',
            isCapital: false
        },
        {
            ko: '니스',
            en: 'Nice',
            priority: 1,
            category: 'tourist',
            region: '프로방스알프코트다쥐르',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '낭트',
            en: 'Nantes',
            priority: 2,
            category: 'major',
            region: '페이드라루아르',
            isCapital: false
        },
        {
            ko: '스트라스부르',
            en: 'Strasbourg',
            priority: 2,
            category: 'major',
            region: '그랑테스트',
            isCapital: false
        },
        {
            ko: '몽펠리에',
            en: 'Montpellier',
            priority: 2,
            category: 'major',
            region: '옥시타니',
            isCapital: false
        },
        {
            ko: '보르도',
            en: 'Bordeaux',
            priority: 2,
            category: 'major',
            region: '누벨아키텐',
            isCapital: false
        },
        {
            ko: '릴',
            en: 'Lille',
            priority: 2,
            category: 'major',
            region: '오드프랑스',
            isCapital: false
        },
        {
            ko: '렌',
            en: 'Rennes',
            priority: 2,
            category: 'major',
            region: '브르타뉴',
            isCapital: false
        },
        {
            ko: '르아브르',
            en: 'Le Havre',
            priority: 2,
            category: 'major',
            region: '노르망디',
            isCapital: false
        },
        
        // 3순위: 관광 도시
        {
            ko: '칸',
            en: 'Cannes',
            priority: 3,
            category: 'tourist',
            region: '프로방스알프코트다쥐르',
            isCapital: false
        },
        {
            ko: '아비뇽',
            en: 'Avignon',
            priority: 3,
            category: 'tourist',
            region: '프로방스알프코트다쥐르',
            isCapital: false
        },
        {
            ko: '샤모니',
            en: 'Chamonix',
            priority: 3,
            category: 'tourist',
            region: '오베르뉴론알프',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '파리': 'Paris',
            '마르세유': 'Marseille',
            '리옹': 'Lyon',
            '툴루즈': 'Toulouse',
            '니스': 'Nice',
            '낭트': 'Nantes',
            '스트라스부르': 'Strasbourg',
            '몽펠리에': 'Montpellier',
            '보르도': 'Bordeaux',
            '릴': 'Lille',
            '렌': 'Rennes',
            '르아브르': 'Le Havre',
            '칸': 'Cannes',
            '아비뇽': 'Avignon',
            '샤모니': 'Chamonix'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Paris': '파리',
            'Marseille': '마르세유',
            'Lyon': '리옹',
            'Toulouse': '툴루즈',
            'Nice': '니스',
            'Nantes': '낭트',
            'Strasbourg': '스트라스부르',
            'Montpellier': '몽펠리에',
            'Bordeaux': '보르도',
            'Lille': '릴',
            'Rennes': '렌',
            'Le Havre': '르아브르',
            'Cannes': '칸',
            'Avignon': '아비뇽',
            'Chamonix': '샤모니'
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
