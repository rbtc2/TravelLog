/**
 * 중국 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const CHINA_CITIES = {
    // 국가 정보
    country: {
        name: 'China',
        nameKo: '중국',
        code: 'CN',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '베이징',
            en: 'Beijing',
            priority: 1,
            category: 'major',
            region: '화베이',
            isCapital: true
        },
        {
            ko: '상하이',
            en: 'Shanghai',
            priority: 1,
            category: 'major',
            region: '화둥',
            isCapital: false
        },
        {
            ko: '광저우',
            en: 'Guangzhou',
            priority: 1,
            category: 'major',
            region: '화난',
            isCapital: false
        },
        {
            ko: '선전',
            en: 'Shenzhen',
            priority: 1,
            category: 'major',
            region: '화난',
            isCapital: false
        },
        {
            ko: '청두',
            en: 'Chengdu',
            priority: 1,
            category: 'major',
            region: '시난',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '항저우',
            en: 'Hangzhou',
            priority: 2,
            category: 'major',
            region: '화둥',
            isCapital: false
        },
        {
            ko: '시안',
            en: 'Xian',
            priority: 2,
            category: 'major',
            region: '시베이',
            isCapital: false
        },
        {
            ko: '난징',
            en: 'Nanjing',
            priority: 2,
            category: 'major',
            region: '화둥',
            isCapital: false
        },
        {
            ko: '우한',
            en: 'Wuhan',
            priority: 2,
            category: 'major',
            region: '화중',
            isCapital: false
        },
        {
            ko: '톈진',
            en: 'Tianjin',
            priority: 2,
            category: 'major',
            region: '화베이',
            isCapital: false
        },
        {
            ko: '칭다오',
            en: 'Qingdao',
            priority: 2,
            category: 'major',
            region: '화둥',
            isCapital: false
        },
        {
            ko: '다롄',
            en: 'Dalian',
            priority: 2,
            category: 'major',
            region: '둥베이',
            isCapital: false
        },
        
        // 3순위: 관광 도시
        {
            ko: '하얼빈',
            en: 'Harbin',
            priority: 3,
            category: 'tourist',
            region: '둥베이',
            isCapital: false
        },
        {
            ko: '쿤밍',
            en: 'Kunming',
            priority: 3,
            category: 'tourist',
            region: '시난',
            isCapital: false
        },
        {
            ko: '샤먼',
            en: 'Xiamen',
            priority: 3,
            category: 'tourist',
            region: '화둥',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '베이징': 'Beijing',
            '상하이': 'Shanghai',
            '광저우': 'Guangzhou',
            '선전': 'Shenzhen',
            '청두': 'Chengdu',
            '항저우': 'Hangzhou',
            '시안': 'Xian',
            '난징': 'Nanjing',
            '우한': 'Wuhan',
            '톈진': 'Tianjin',
            '칭다오': 'Qingdao',
            '다롄': 'Dalian',
            '하얼빈': 'Harbin',
            '쿤밍': 'Kunming',
            '샤먼': 'Xiamen'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Beijing': '베이징',
            'Shanghai': '상하이',
            'Guangzhou': '광저우',
            'Shenzhen': '선전',
            'Chengdu': '청두',
            'Hangzhou': '항저우',
            'Xian': '시안',
            'Nanjing': '난징',
            'Wuhan': '우한',
            'Tianjin': '톈진',
            'Qingdao': '칭다오',
            'Dalian': '다롄',
            'Harbin': '하얼빈',
            'Kunming': '쿤밍',
            'Xiamen': '샤먼'
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
