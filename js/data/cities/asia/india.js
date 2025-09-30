/**
 * 인도 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const INDIA_CITIES = {
    // 국가 정보
    country: {
        name: 'India',
        nameKo: '인도',
        code: 'IN',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '뭄바이',
            en: 'Mumbai',
            priority: 1,
            category: 'major',
            region: '마하라슈트라',
            isCapital: false
        },
        {
            ko: '델리',
            en: 'Delhi',
            priority: 1,
            category: 'major',
            region: '델리',
            isCapital: true
        },
        {
            ko: '방갈로르',
            en: 'Bangalore',
            priority: 1,
            category: 'major',
            region: '카르나타카',
            isCapital: false
        },
        {
            ko: '콜카타',
            en: 'Kolkata',
            priority: 1,
            category: 'major',
            region: '서벵골',
            isCapital: false
        },
        {
            ko: '첸나이',
            en: 'Chennai',
            priority: 1,
            category: 'major',
            region: '타밀나두',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '하이데라바드',
            en: 'Hyderabad',
            priority: 2,
            category: 'major',
            region: '텔랑가나',
            isCapital: false
        },
        {
            ko: '아마다바드',
            en: 'Ahmedabad',
            priority: 2,
            category: 'major',
            region: '구자라트',
            isCapital: false
        },
        {
            ko: '푸네',
            en: 'Pune',
            priority: 2,
            category: 'major',
            region: '마하라슈트라',
            isCapital: false
        },
        {
            ko: '수라트',
            en: 'Surat',
            priority: 2,
            category: 'major',
            region: '구자라트',
            isCapital: false
        },
        {
            ko: '자이푸르',
            en: 'Jaipur',
            priority: 2,
            category: 'tourist',
            region: '라자스탄',
            isCapital: false
        },
        {
            ko: '고아',
            en: 'Goa',
            priority: 2,
            category: 'tourist',
            region: '고아',
            isCapital: false
        },
        {
            ko: '아그라',
            en: 'Agra',
            priority: 2,
            category: 'tourist',
            region: '우타르프라데시',
            isCapital: false
        },
        {
            ko: '바라나시',
            en: 'Varanasi',
            priority: 2,
            category: 'tourist',
            region: '우타르프라데시',
            isCapital: false
        },
        {
            ko: '코치',
            en: 'Kochi',
            priority: 2,
            category: 'major',
            region: '케랄라',
            isCapital: false
        },
        {
            ko: '인도르',
            en: 'Indore',
            priority: 2,
            category: 'major',
            region: '마디야프라데시',
            isCapital: false
        },
        {
            ko: '칸푸르',
            en: 'Kanpur',
            priority: 2,
            category: 'major',
            region: '우타르프라데시',
            isCapital: false
        },
        {
            ko: '나그푸르',
            en: 'Nagpur',
            priority: 2,
            category: 'major',
            region: '마하라슈트라',
            isCapital: false
        },
        {
            ko: '비샤카파트남',
            en: 'Visakhapatnam',
            priority: 2,
            category: 'major',
            region: '안드라프라데시',
            isCapital: false
        },
        {
            ko: '바다',
            en: 'Bhopal',
            priority: 2,
            category: 'major',
            region: '마디야프라데시',
            isCapital: false
        },
        {
            ko: '파트나',
            en: 'Patna',
            priority: 2,
            category: 'major',
            region: '비하르',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '뭄바이': 'Mumbai',
            '델리': 'Delhi',
            '방갈로르': 'Bangalore',
            '콜카타': 'Kolkata',
            '첸나이': 'Chennai',
            '하이데라바드': 'Hyderabad',
            '아마다바드': 'Ahmedabad',
            '푸네': 'Pune',
            '수라트': 'Surat',
            '자이푸르': 'Jaipur',
            '고아': 'Goa',
            '아그라': 'Agra',
            '바라나시': 'Varanasi',
            '코치': 'Kochi',
            '인도르': 'Indore',
            '칸푸르': 'Kanpur',
            '나그푸르': 'Nagpur',
            '비샤카파트남': 'Visakhapatnam',
            '바다': 'Bhopal',
            '파트나': 'Patna'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Mumbai': '뭄바이',
            'Delhi': '델리',
            'Bangalore': '방갈로르',
            'Kolkata': '콜카타',
            'Chennai': '첸나이',
            'Hyderabad': '하이데라바드',
            'Ahmedabad': '아마다바드',
            'Pune': '푸네',
            'Surat': '수라트',
            'Jaipur': '자이푸르',
            'Goa': '고아',
            'Agra': '아그라',
            'Varanasi': '바라나시',
            'Kochi': '코치',
            'Indore': '인도르',
            'Kanpur': '칸푸르',
            'Nagpur': '나그푸르',
            'Visakhapatnam': '비샤카파트남',
            'Bhopal': '바다',
            'Patna': '파트나'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 20,
        majorCities: 16,
        touristCities: 4,
        lastUpdated: '2025-09-30'
    }
};
