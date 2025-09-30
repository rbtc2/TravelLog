/**
 * 브라질 프리미엄 도시 데이터
 * CitySelector 한국어 지원을 위한 한영 매핑 데이터
 * 
 * @version 1.0.0
 * @since 2025-09-30
 * @author REDIPX
 */

export const BRAZIL_CITIES = {
    // 국가 정보
    country: {
        name: 'Brazil',
        nameKo: '브라질',
        code: 'BR',
        continent: 'Americas'
    },
    
    // 도시 데이터 (우선순위별 정렬)
    cities: [
        // 1순위: 주요 대도시
        {
            ko: '상파울루',
            en: 'São Paulo',
            priority: 1,
            category: 'major',
            region: '상파울루',
            isCapital: false
        },
        {
            ko: '리우데자네이루',
            en: 'Rio de Janeiro',
            priority: 1,
            category: 'major',
            region: '리우데자네이루',
            isCapital: false
        },
        {
            ko: '브라질리아',
            en: 'Brasília',
            priority: 1,
            category: 'major',
            region: '연방구',
            isCapital: true
        },
        {
            ko: '벨루오리존치',
            en: 'Belo Horizonte',
            priority: 1,
            category: 'major',
            region: '미나스제라이스',
            isCapital: false
        },
        {
            ko: '포르탈레자',
            en: 'Fortaleza',
            priority: 1,
            category: 'major',
            region: '세아라',
            isCapital: false
        },
        
        // 2순위: 주요 도시
        {
            ko: '마나우스',
            en: 'Manaus',
            priority: 2,
            category: 'major',
            region: '아마조나스',
            isCapital: false
        },
        {
            ko: '쿠리치바',
            en: 'Curitiba',
            priority: 2,
            category: 'major',
            region: '파라나',
            isCapital: false
        },
        {
            ko: '레시페',
            en: 'Recife',
            priority: 2,
            category: 'major',
            region: '페르남부쿠',
            isCapital: false
        },
        {
            ko: '고이아니아',
            en: 'Goiânia',
            priority: 2,
            category: 'major',
            region: '고이아스',
            isCapital: false
        },
        {
            ko: '벨렝',
            en: 'Belém',
            priority: 2,
            category: 'major',
            region: '파라',
            isCapital: false
        },
        {
            ko: '포르투알레그리',
            en: 'Porto Alegre',
            priority: 2,
            category: 'major',
            region: '히우그란지두술',
            isCapital: false
        },
        {
            ko: '구아룰류스',
            en: 'Guarulhos',
            priority: 2,
            category: 'major',
            region: '상파울루',
            isCapital: false
        },
        {
            ko: '캄피나스',
            en: 'Campinas',
            priority: 2,
            category: 'major',
            region: '상파울루',
            isCapital: false
        },
        {
            ko: '상루이스',
            en: 'São Luís',
            priority: 2,
            category: 'major',
            region: '마라냥',
            isCapital: false
        },
        {
            ko: '마세이오',
            en: 'Maceió',
            priority: 2,
            category: 'major',
            region: '알라고아스',
            isCapital: false
        }
    ],
    
    // 검색 최적화를 위한 인덱스
    searchIndex: {
        // 한국어 → 영어 매핑
        koToEn: {
            '상파울루': 'São Paulo',
            '리우데자네이루': 'Rio de Janeiro',
            '브라질리아': 'Brasília',
            '벨루오리존치': 'Belo Horizonte',
            '포르탈레자': 'Fortaleza',
            '마나우스': 'Manaus',
            '쿠리치바': 'Curitiba',
            '레시페': 'Recife',
            '고이아니아': 'Goiânia',
            '벨렝': 'Belém',
            '포르투알레그리': 'Porto Alegre',
            '구아룰류스': 'Guarulhos',
            '캄피나스': 'Campinas',
            '상루이스': 'São Luís',
            '마세이오': 'Maceió'
        },
        // 영어 → 한국어 매핑
        enToKo: {
            'São Paulo': '상파울루',
            'Rio de Janeiro': '리우데자네이루',
            'Brasília': '브라질리아',
            'Belo Horizonte': '벨루오리존치',
            'Fortaleza': '포르탈레자',
            'Manaus': '마나우스',
            'Curitiba': '쿠리치바',
            'Recife': '레시페',
            'Goiânia': '고이아니아',
            'Belém': '벨렝',
            'Porto Alegre': '포르투알레그리',
            'Guarulhos': '구아룰류스',
            'Campinas': '캄피나스',
            'São Luís': '상루이스',
            'Maceió': '마세이오'
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
