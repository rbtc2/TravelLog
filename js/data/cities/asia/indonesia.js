/**
 * 인도네시아 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const INDONESIA_CITIES = {
    // 국가 정보
    country: {
        name: 'Indonesia',
        nameKo: '인도네시아',
        code: 'ID',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '자카르타',
            en: 'Jakarta',
            priority: 1,
            category: 'major',
            region: '자카르타',
            isCapital: true
        },
        {
            ko: '수라바야',
            en: 'Surabaya',
            priority: 1,
            category: 'major',
            region: '동자바',
            isCapital: false
        },
        {
            ko: '반둥',
            en: 'Bandung',
            priority: 1,
            category: 'major',
            region: '서자바',
            isCapital: false
        },
        {
            ko: '메단',
            en: 'Medan',
            priority: 1,
            category: 'major',
            region: '북수마트라',
            isCapital: false
        },
        {
            ko: '팔렘방',
            en: 'Palembang',
            priority: 1,
            category: 'major',
            region: '남수마트라',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '세마랑',
            en: 'Semarang',
            priority: 2,
            category: 'major',
            region: '중앙자바',
            isCapital: false
        },
        {
            ko: '마카사르',
            en: 'Makassar',
            priority: 2,
            category: 'major',
            region: '남술라웨시',
            isCapital: false
        },
        {
            ko: '타시크말라야',
            en: 'Tasikmalaya',
            priority: 2,
            category: 'major',
            region: '서자바',
            isCapital: false
        },
        {
            ko: '데포크',
            en: 'Depok',
            priority: 2,
            category: 'major',
            region: '자카르타',
            isCapital: false
        },
        {
            ko: '발리',
            en: 'Bali',
            priority: 2,
            category: 'tourist',
            region: '발리',
            isCapital: false
        },
        {
            ko: '욕야카르타',
            en: 'Yogyakarta',
            priority: 2,
            category: 'tourist',
            region: '욕야카르타',
            isCapital: false
        },
        {
            ko: '반자르마신',
            en: 'Banjarmasin',
            priority: 2,
            category: 'major',
            region: '남칼리만탄',
            isCapital: false
        },
        {
            ko: '마나도',
            en: 'Manado',
            priority: 2,
            category: 'major',
            region: '북술라웨시',
            isCapital: false
        },
        {
            ko: '마타람',
            en: 'Mataram',
            priority: 2,
            category: 'major',
            region: '서누사텡가라',
            isCapital: false
        },
        {
            ko: '쿠팡',
            en: 'Kupang',
            priority: 2,
            category: 'major',
            region: '동누사텡가라',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '자카르타': 'Jakarta',
            '수라바야': 'Surabaya',
            '반둥': 'Bandung',
            '메단': 'Medan',
            '팔렘방': 'Palembang',
            '세마랑': 'Semarang',
            '마카사르': 'Makassar',
            '타시크말라야': 'Tasikmalaya',
            '데포크': 'Depok',
            '발리': 'Bali',
            '욕야카르타': 'Yogyakarta',
            '반자르마신': 'Banjarmasin',
            '마나도': 'Manado',
            '마타람': 'Mataram',
            '쿠팡': 'Kupang'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Jakarta': '자카르타',
            'Surabaya': '수라바야',
            'Bandung': '반둥',
            'Medan': '메단',
            'Palembang': '팔렘방',
            'Semarang': '세마랑',
            'Makassar': '마카사르',
            'Tasikmalaya': '타시크말라야',
            'Depok': '데포크',
            'Bali': '발리',
            'Yogyakarta': '욕야카르타',
            'Banjarmasin': '반자르마신',
            'Manado': '마나도',
            'Mataram': '마타람',
            'Kupang': '쿠팡'
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
