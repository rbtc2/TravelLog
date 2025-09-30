/**
 * 한국 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const SOUTH_KOREA_CITIES = {
    // 국가 정보
    country: {
        name: 'South Korea',
        nameKo: '대한민국',
        code: 'KR',
        continent: 'Asia'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시 (광역시)
        {
            ko: '서울',
            en: 'Seoul',
            priority: 1,
            category: 'major',
            region: '수도권',
            isCapital: true
        },
        {
            ko: '부산',
            en: 'Busan',
            priority: 1,
            category: 'major',
            region: '경상남도',
            isCapital: false
        },
        {
            ko: '제주',
            en: 'Jeju',
            priority: 1,
            category: 'tourist',
            region: '제주특별자치도',
            isCapital: false
        },
        
        // 2순위: 광역시
        {
            ko: '인천',
            en: 'Incheon',
            priority: 2,
            category: 'major',
            region: '수도권',
            isCapital: false
        },
        {
            ko: '대구',
            en: 'Daegu',
            priority: 2,
            category: 'major',
            region: '경상북도',
            isCapital: false
        },
        {
            ko: '광주',
            en: 'Gwangju',
            priority: 2,
            category: 'major',
            region: '전라남도',
            isCapital: false
        },
        {
            ko: '대전',
            en: 'Daejeon',
            priority: 2,
            category: 'major',
            region: '충청남도',
            isCapital: false
        },
        {
            ko: '울산',
            en: 'Ulsan',
            priority: 2,
            category: 'major',
            region: '경상남도',
            isCapital: false
        },
        
        // 3순위: 관광 도시
        {
            ko: '강릉',
            en: 'Gangneung',
            priority: 3,
            category: 'tourist',
            region: '강원도',
            isCapital: false
        },
        {
            ko: '전주',
            en: 'Jeonju',
            priority: 3,
            category: 'tourist',
            region: '전라북도',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '서울': 'Seoul',
            '부산': 'Busan',
            '제주': 'Jeju',
            '인천': 'Incheon',
            '대구': 'Daegu',
            '광주': 'Gwangju',
            '대전': 'Daejeon',
            '울산': 'Ulsan',
            '강릉': 'Gangneung',
            '전주': 'Jeonju'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Seoul': '서울',
            'Busan': '부산',
            'Jeju': '제주',
            'Incheon': '인천',
            'Daegu': '대구',
            'Gwangju': '광주',
            'Daejeon': '대전',
            'Ulsan': '울산',
            'Gangneung': '강릉',
            'Jeonju': '전주'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 10,
        majorCities: 8,
        touristCities: 2,
        lastUpdated: '2024-12-29'
    }
};
