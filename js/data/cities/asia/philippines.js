/**
 * 필리핀 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const PHILIPPINES_CITIES = {
    // 국가 정보
    country: {
        name: 'Philippines',
        nameKo: '필리핀',
        code: 'PH',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '마닐라',
            en: 'Manila',
            priority: 1,
            category: 'major',
            region: '메트로마닐라',
            isCapital: true
        },
        {
            ko: '케손시티',
            en: 'Quezon City',
            priority: 1,
            category: 'major',
            region: '메트로마닐라',
            isCapital: false
        },
        {
            ko: '칼로오칸',
            en: 'Caloocan',
            priority: 1,
            category: 'major',
            region: '메트로마닐라',
            isCapital: false
        },
        {
            ko: '다바오',
            en: 'Davao',
            priority: 1,
            category: 'major',
            region: '다바오',
            isCapital: false
        },
        {
            ko: '세부',
            en: 'Cebu',
            priority: 1,
            category: 'tourist',
            region: '세부',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '마카티',
            en: 'Makati',
            priority: 2,
            category: 'major',
            region: '메트로마닐라',
            isCapital: false
        },
        {
            ko: '파시그',
            en: 'Pasig',
            priority: 2,
            category: 'major',
            region: '메트로마닐라',
            isCapital: false
        },
        {
            ko: '타기그',
            en: 'Taguig',
            priority: 2,
            category: 'major',
            region: '메트로마닐라',
            isCapital: false
        },
        {
            ko: '발렌수엘라',
            en: 'Valenzuela',
            priority: 2,
            category: 'major',
            region: '메트로마닐라',
            isCapital: false
        },
        {
            ko: '파라냐케',
            en: 'Parañaque',
            priority: 2,
            category: 'major',
            region: '메트로마닐라',
            isCapital: false
        },
        {
            ko: '라스피냐스',
            en: 'Las Piñas',
            priority: 2,
            category: 'major',
            region: '메트로마닐라',
            isCapital: false
        },
        {
            ko: '마카티',
            en: 'Makati',
            priority: 2,
            category: 'major',
            region: '메트로마닐라',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '마닐라': 'Manila',
            '케손시티': 'Quezon City',
            '칼로오칸': 'Caloocan',
            '다바오': 'Davao',
            '세부': 'Cebu',
            '마카티': 'Makati',
            '파시그': 'Pasig',
            '타기그': 'Taguig',
            '발렌수엘라': 'Valenzuela',
            '파라냐케': 'Parañaque',
            '라스피냐스': 'Las Piñas'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Manila': '마닐라',
            'Quezon City': '케손시티',
            'Caloocan': '칼로오칸',
            'Davao': '다바오',
            'Cebu': '세부',
            'Makati': '마카티',
            'Pasig': '파시그',
            'Taguig': '타기그',
            'Valenzuela': '발렌수엘라',
            'Parañaque': '파라냐케',
            'Las Piñas': '라스피냐스'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 12,
        majorCities: 11,
        touristCities: 1,
        lastUpdated: '2025-09-30'
    }
};
