/**
 * 체코 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const CZECH_REPUBLIC_CITIES = {
    // 국가 정보
    country: {
        name: 'Czech Republic',
        nameKo: '체코',
        code: 'CZ',
        continent: 'Europe'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '프라하',
            en: 'Prague',
            priority: 1,
            category: 'major',
            region: '프라하',
            isCapital: true
        },
        {
            ko: '브르노',
            en: 'Brno',
            priority: 1,
            category: 'major',
            region: '남모라바',
            isCapital: false
        },
        {
            ko: '오스트라바',
            en: 'Ostrava',
            priority: 1,
            category: 'major',
            region: '모라바슬레스코',
            isCapital: false
        },
        {
            ko: '플젠',
            en: 'Plzeň',
            priority: 1,
            category: 'major',
            region: '플젠',
            isCapital: false
        },
        {
            ko: '올로모우츠',
            en: 'Olomouc',
            priority: 1,
            category: 'major',
            region: '올로모우츠',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '리베레츠',
            en: 'Liberec',
            priority: 2,
            category: 'major',
            region: '리베레츠',
            isCapital: false
        },
        {
            ko: '체스케부데요비체',
            en: 'České Budějovice',
            priority: 2,
            category: 'major',
            region: '남보헤미아',
            isCapital: false
        },
        {
            ko: '하라드크크랄로베',
            en: 'Hradec Králové',
            priority: 2,
            category: 'major',
            region: '흐라데츠크랄로베',
            isCapital: false
        },
        {
            ko: '파르두비체',
            en: 'Pardubice',
            priority: 2,
            category: 'major',
            region: '파르두비체',
            isCapital: false
        },
        {
            ko: '카를로비바리',
            en: 'Karlovy Vary',
            priority: 2,
            category: 'tourist',
            region: '카를로비바리',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '프라하': 'Prague',
            '브르노': 'Brno',
            '오스트라바': 'Ostrava',
            '플젠': 'Plzeň',
            '올로모우츠': 'Olomouc',
            '리베레츠': 'Liberec',
            '체스케부데요비체': 'České Budějovice',
            '하라드크크랄로베': 'Hradec Králové',
            '파르두비체': 'Pardubice',
            '카를로비바리': 'Karlovy Vary'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'Prague': '프라하',
            'Brno': '브르노',
            'Ostrava': '오스트라바',
            'Plzeň': '플젠',
            'Olomouc': '올로모우츠',
            'Liberec': '리베레츠',
            'České Budějovice': '체스케부데요비체',
            'Hradec Králové': '하라드크크랄로베',
            'Pardubice': '파르두비체',
            'Karlovy Vary': '카를로비바리'
        }
    },
    
    // 통계 정보
    stats: {
        totalCities: 10,
        majorCities: 9,
        touristCities: 1,
        lastUpdated: '2025-09-30'
    }
};
