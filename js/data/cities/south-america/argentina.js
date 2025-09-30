/**
 * 아르헨티나 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const ARGENTINA_CITIES = {
    // 국가 정보
    country: {
        name: 'Argentina',
        nameKo: '아르헨티나',
        code: 'AR',
        continent: 'Americas'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '부에노스아이레스',
            en: 'Buenos Aires',
            priority: 1,
            category: 'major',
            region: '부에노스아이레스',
            isCapital: true
        },
        {
            ko: '코르도바',
            en: 'Córdoba',
            priority: 1,
            category: 'major',
            region: '코르도바',
            isCapital: false
        },
        {
            ko: '로사리오',
            en: 'Rosario',
            priority: 1,
            category: 'major',
            region: '산타페',
            isCapital: false
        },
        {
            ko: '멘도사',
            en: 'Mendoza',
            priority: 1,
            category: 'major',
            region: '멘도사',
            isCapital: false
        },
        {
            ko: '라플라타',
            en: 'La Plata',
            priority: 1,
            category: 'major',
            region: '부에노스아이레스',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '투쿠만',
            en: 'Tucumán',
            priority: 2,
            category: 'major',
            region: '투쿠만',
            isCapital: false
        },
        {
            ko: '마르델플라타',
            en: 'Mar del Plata',
            priority: 2,
            category: 'major',
            region: '부에노스아이레스',
            isCapital: false
        },
        {
            ko: '살타',
            en: 'Salta',
            priority: 2,
            category: 'major',
            region: '살타',
            isCapital: false
        },
        {
            ko: '산타페',
            en: 'Santa Fe',
            priority: 2,
            category: 'major',
            region: '산타페',
            isCapital: false
        },
        {
            ko: '산후안',
            en: 'San Juan',
            priority: 2,
            category: 'major',
            region: '산후안',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '부에노스아이레스': 'Buenos Aires',
            '코르도바': 'Córdoba',
            '로사리오': 'Rosario',
            '멘도사': 'Mendoza',
            '라플라타': 'La Plata',
            '투쿠만': 'Tucumán',
            '마르델플라타': 'Mar del Plata',
            '살타': 'Salta',
            '산타페': 'Santa Fe',
            '산후안': 'San Juan'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Buenos Aires': '부에노스아이레스',
            'Córdoba': '코르도바',
            'Rosario': '로사리오',
            'Mendoza': '멘도사',
            'La Plata': '라플라타',
            'Tucumán': '투쿠만',
            'Mar del Plata': '마르델플라타',
            'Salta': '살타',
            'Santa Fe': '산타페',
            'San Juan': '산후안'
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
