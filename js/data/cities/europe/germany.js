/**
 * 독일 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const GERMANY_CITIES = {
    // 국가 정보
    country: {
        name: 'Germany',
        nameKo: '독일',
        code: 'DE',
        continent: 'Europe'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '베를린',
            en: 'Berlin',
            priority: 1,
            category: 'major',
            region: '베를린',
            isCapital: true
        },
        {
            ko: '함부르크',
            en: 'Hamburg',
            priority: 1,
            category: 'major',
            region: '함부르크',
            isCapital: false
        },
        {
            ko: '뮌헨',
            en: 'Munich',
            priority: 1,
            category: 'major',
            region: '바이에른',
            isCapital: false
        },
        {
            ko: '쾰른',
            en: 'Cologne',
            priority: 1,
            category: 'major',
            region: '노르트라인베스트팔렌',
            isCapital: false
        },
        {
            ko: '프랑크푸르트',
            en: 'Frankfurt',
            priority: 1,
            category: 'major',
            region: '헤센',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '슈투트가르트',
            en: 'Stuttgart',
            priority: 2,
            category: 'major',
            region: '바덴뷔르템베르크',
            isCapital: false
        },
        {
            ko: '뒤셀도르프',
            en: 'Düsseldorf',
            priority: 2,
            category: 'major',
            region: '노르트라인베스트팔렌',
            isCapital: false
        },
        {
            ko: '도르트문트',
            en: 'Dortmund',
            priority: 2,
            category: 'major',
            region: '노르트라인베스트팔렌',
            isCapital: false
        },
        {
            ko: '에센',
            en: 'Essen',
            priority: 2,
            category: 'major',
            region: '노르트라인베스트팔렌',
            isCapital: false
        },
        {
            ko: '라이프치히',
            en: 'Leipzig',
            priority: 2,
            category: 'major',
            region: '작센',
            isCapital: false
        },
        {
            ko: '브레멘',
            en: 'Bremen',
            priority: 2,
            category: 'major',
            region: '브레멘',
            isCapital: false
        },
        {
            ko: '드레스덴',
            en: 'Dresden',
            priority: 2,
            category: 'major',
            region: '작센',
            isCapital: false
        },
        
        // 3순위: 관광 도시
        {
            ko: '하노버',
            en: 'Hannover',
            priority: 3,
            category: 'major',
            region: '니더작센',
            isCapital: false
        },
        {
            ko: '뉘른베르크',
            en: 'Nuremberg',
            priority: 3,
            category: 'major',
            region: '바이에른',
            isCapital: false
        },
        {
            ko: '뒤스부르크',
            en: 'Duisburg',
            priority: 3,
            category: 'major',
            region: '노르트라인베스트팔렌',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '베를린': 'Berlin',
            '함부르크': 'Hamburg',
            '뮌헨': 'Munich',
            '쾰른': 'Cologne',
            '프랑크푸르트': 'Frankfurt',
            '슈투트가르트': 'Stuttgart',
            '뒤셀도르프': 'Düsseldorf',
            '도르트문트': 'Dortmund',
            '에센': 'Essen',
            '라이프치히': 'Leipzig',
            '브레멘': 'Bremen',
            '드레스덴': 'Dresden',
            '하노버': 'Hannover',
            '뉘른베르크': 'Nuremberg',
            '뒤스부르크': 'Duisburg'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Berlin': '베를린',
            'Hamburg': '함부르크',
            'Munich': '뮌헨',
            'Cologne': '쾰른',
            'Frankfurt': '프랑크푸르트',
            'Stuttgart': '슈투트가르트',
            'Düsseldorf': '뒤셀도르프',
            'Dortmund': '도르트문트',
            'Essen': '에센',
            'Leipzig': '라이프치히',
            'Bremen': '브레멘',
            'Dresden': '드레스덴',
            'Hannover': '하노버',
            'Nuremberg': '뉘른베르크',
            'Duisburg': '뒤스부르크'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 15,
        majorCities: 15,
        touristCities: 0,
        lastUpdated: '2025-09-30'
    }
};
