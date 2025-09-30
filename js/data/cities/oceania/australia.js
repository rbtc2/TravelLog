/**
 * 호주 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const AUSTRALIA_CITIES = {
    // 국가 정보
    country: {
        name: 'Australia',
        nameKo: '호주',
        code: 'AU',
        continent: 'Oceania'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '시드니',
            en: 'Sydney',
            priority: 1,
            category: 'major',
            region: '뉴사우스웨일스',
            isCapital: false
        },
        {
            ko: '멜버른',
            en: 'Melbourne',
            priority: 1,
            category: 'major',
            region: '빅토리아',
            isCapital: false
        },
        {
            ko: '브리즈번',
            en: 'Brisbane',
            priority: 1,
            category: 'major',
            region: '퀸즐랜드',
            isCapital: false
        },
        {
            ko: '퍼스',
            en: 'Perth',
            priority: 1,
            category: 'major',
            region: '웨스턴오스트레일리아',
            isCapital: false
        },
        {
            ko: '애들레이드',
            en: 'Adelaide',
            priority: 1,
            category: 'major',
            region: '사우스오스트레일리아',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '캔버라',
            en: 'Canberra',
            priority: 2,
            category: 'major',
            region: '오스트레일리아수도영토',
            isCapital: true
        },
        {
            ko: '골드코스트',
            en: 'Gold Coast',
            priority: 2,
            category: 'tourist',
            region: '퀸즐랜드',
            isCapital: false
        },
        {
            ko: '뉴캐슬',
            en: 'Newcastle',
            priority: 2,
            category: 'major',
            region: '뉴사우스웨일스',
            isCapital: false
        },
        {
            ko: '울런공',
            en: 'Wollongong',
            priority: 2,
            category: 'major',
            region: '뉴사우스웨일스',
            isCapital: false
        },
        {
            ko: '호바트',
            en: 'Hobart',
            priority: 2,
            category: 'major',
            region: '태즈메이니아',
            isCapital: false
        },
        {
            ko: '지롱',
            en: 'Geelong',
            priority: 2,
            category: 'major',
            region: '빅토리아',
            isCapital: false
        },
        {
            ko: '타운즈빌',
            en: 'Townsville',
            priority: 2,
            category: 'major',
            region: '퀸즐랜드',
            isCapital: false
        },
        {
            ko: '케언스',
            en: 'Cairns',
            priority: 2,
            category: 'tourist',
            region: '퀸즐랜드',
            isCapital: false
        },
        {
            ko: '다윈',
            en: 'Darwin',
            priority: 2,
            category: 'major',
            region: '노던테리토리',
            isCapital: false
        },
        {
            ko: '토웅가타',
            en: 'Toowoomba',
            priority: 2,
            category: 'major',
            region: '퀸즐랜드',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '시드니': 'Sydney',
            '멜버른': 'Melbourne',
            '브리즈번': 'Brisbane',
            '퍼스': 'Perth',
            '애들레이드': 'Adelaide',
            '캔버라': 'Canberra',
            '골드코스트': 'Gold Coast',
            '뉴캐슬': 'Newcastle',
            '울런공': 'Wollongong',
            '호바트': 'Hobart',
            '지롱': 'Geelong',
            '타운즈빌': 'Townsville',
            '케언스': 'Cairns',
            '다윈': 'Darwin',
            '토웅가타': 'Toowoomba'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Sydney': '시드니',
            'Melbourne': '멜버른',
            'Brisbane': '브리즈번',
            'Perth': '퍼스',
            'Adelaide': '애들레이드',
            'Canberra': '캔버라',
            'Gold Coast': '골드코스트',
            'Newcastle': '뉴캐슬',
            'Wollongong': '울런공',
            'Hobart': '호바트',
            'Geelong': '지롱',
            'Townsville': '타운즈빌',
            'Cairns': '케언스',
            'Darwin': '다윈',
            'Toowoomba': '토웅가타'
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
