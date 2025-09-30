/**
 * 캐나다 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const CANADA_CITIES = {
    // 국가 정보
    country: {
        name: 'Canada',
        nameKo: '캐나다',
        code: 'CA',
        continent: 'Americas'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '토론토',
            en: 'Toronto',
            priority: 1,
            category: 'major',
            region: '온타리오',
            isCapital: false
        },
        {
            ko: '몬트리올',
            en: 'Montreal',
            priority: 1,
            category: 'major',
            region: '퀘벡',
            isCapital: false
        },
        {
            ko: '밴쿠버',
            en: 'Vancouver',
            priority: 1,
            category: 'major',
            region: '브리티시컬럼비아',
            isCapital: false
        },
        {
            ko: '캘거리',
            en: 'Calgary',
            priority: 1,
            category: 'major',
            region: '앨버타',
            isCapital: false
        },
        {
            ko: '오타와',
            en: 'Ottawa',
            priority: 1,
            category: 'major',
            region: '온타리오',
            isCapital: true
        },
        
        // 2순위: 주요 도시
        {
            ko: '에드먼턴',
            en: 'Edmonton',
            priority: 2,
            category: 'major',
            region: '앨버타',
            isCapital: false
        },
        {
            ko: '위니펙',
            en: 'Winnipeg',
            priority: 2,
            category: 'major',
            region: '매니토바',
            isCapital: false
        },
        {
            ko: '퀘벡시티',
            en: 'Quebec City',
            priority: 2,
            category: 'major',
            region: '퀘벡',
            isCapital: false
        },
        {
            ko: '해밀턴',
            en: 'Hamilton',
            priority: 2,
            category: 'major',
            region: '온타리오',
            isCapital: false
        },
        {
            ko: '키치너',
            en: 'Kitchener',
            priority: 2,
            category: 'major',
            region: '온타리오',
            isCapital: false
        },
        {
            ko: '런던',
            en: 'London',
            priority: 2,
            category: 'major',
            region: '온타리오',
            isCapital: false
        },
        {
            ko: '빅토리아',
            en: 'Victoria',
            priority: 2,
            category: 'major',
            region: '브리티시컬럼비아',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '토론토': 'Toronto',
            '몬트리올': 'Montreal',
            '밴쿠버': 'Vancouver',
            '캘거리': 'Calgary',
            '오타와': 'Ottawa',
            '에드먼턴': 'Edmonton',
            '위니펙': 'Winnipeg',
            '퀘벡시티': 'Quebec City',
            '해밀턴': 'Hamilton',
            '키치너': 'Kitchener',
            '런던': 'London',
            '빅토리아': 'Victoria'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Toronto': '토론토',
            'Montreal': '몬트리올',
            'Vancouver': '밴쿠버',
            'Calgary': '캘거리',
            'Ottawa': '오타와',
            'Edmonton': '에드먼턴',
            'Winnipeg': '위니펙',
            'Quebec City': '퀘벡시티',
            'Hamilton': '해밀턴',
            'Kitchener': '키치너',
            'London': '런던',
            'Victoria': '빅토리아'
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
