/**
 * CountryUtils - 국가 관련 유틸리티 함수들을 제공
 * 
 * 🎯 책임:
 * - 국가 코드 변환 및 검증
 * - 국가별 데이터 필터링
 * - 국가명 정규화
 * - 대륙별 분류
 * 
 * @class CountryUtils
 * @version 1.0.0
 * @since 2024-12-29
 */
class CountryUtils {
    // 국가 코드 매핑 (ISO 3166-1 alpha-2 기준)
    static COUNTRY_NAMES = {
        // 아시아
        'JP': '일본',
        'KR': '한국',
        'CN': '중국',
        'TH': '태국',
        'SG': '싱가포르',
        'MY': '말레이시아',
        'ID': '인도네시아',
        'VN': '베트남',
        'PH': '필리핀',
        'IN': '인도',
        'TW': '대만',
        'HK': '홍콩',
        'MO': '마카오',
        'MN': '몽골',
        'KZ': '카자흐스탄',
        'UZ': '우즈베키스탄',
        'AF': '아프가니스탄',
        'BD': '방글라데시',
        'BT': '부탄',
        'MM': '미얀마',
        'NP': '네팔',
        'LK': '스리랑카',
        'MV': '몰디브',
        
        // 유럽
        'GB': '영국',
        'FR': '프랑스',
        'DE': '독일',
        'IT': '이탈리아',
        'ES': '스페인',
        'PT': '포르투갈',
        'NL': '네덜란드',
        'BE': '벨기에',
        'CH': '스위스',
        'AT': '오스트리아',
        'SE': '스웨덴',
        'NO': '노르웨이',
        'DK': '덴마크',
        'FI': '핀란드',
        'IS': '아이슬란드',
        'IE': '아일랜드',
        'PL': '폴란드',
        'CZ': '체코',
        'SK': '슬로바키아',
        'HU': '헝가리',
        'RO': '루마니아',
        'BG': '불가리아',
        'HR': '크로아티아',
        'SI': '슬로베니아',
        'RS': '세르비아',
        'GR': '그리스',
        'CY': '키프로스',
        'MT': '몰타',
        'RU': '러시아',
        'UA': '우크라이나',
        'BY': '벨라루스',
        'LT': '리투아니아',
        'LV': '라트비아',
        'EE': '에스토니아',
        'TR': '터키',
        
        // 북미
        'US': '미국',
        'CA': '캐나다',
        'MX': '멕시코',
        'GT': '과테말라',
        'BZ': '벨리즈',
        'SV': '엘살바도르',
        'HN': '온두라스',
        'NI': '니카라과',
        'CR': '코스타리카',
        'PA': '파나마',
        
        // 남미
        'BR': '브라질',
        'AR': '아르헨티나',
        'CL': '칠레',
        'PE': '페루',
        'CO': '콜롬비아',
        'VE': '베네수엘라',
        'EC': '에콰도르',
        'BO': '볼리비아',
        'PY': '파라과이',
        'UY': '우루과이',
        'GY': '가이아나',
        'SR': '수리남',
        
        // 오세아니아
        'AU': '호주',
        'NZ': '뉴질랜드',
        'FJ': '피지',
        'PG': '파푸아뉴기니',
        'SB': '솔로몬제도',
        'VU': '바누아투',
        'NC': '뉴칼레도니아',
        'PF': '프랑스령 폴리네시아',
        
        // 아프리카
        'EG': '이집트',
        'MA': '모로코',
        'TN': '튀니지',
        'DZ': '알제리',
        'LY': '리비아',
        'SD': '수단',
        'ET': '에티오피아',
        'KE': '케냐',
        'TZ': '탄자니아',
        'UG': '우간다',
        'RW': '르완다',
        'ZA': '남아프리카공화국',
        'ZW': '짐바브웨',
        'BW': '보츠와나',
        'NA': '나미비아',
        'ZM': '잠비아',
        'MW': '말라위',
        'MZ': '모잠비크',
        'MG': '마다가스카르',
        'MU': '모리셔스',
        'SC': '세이셸',
        
        // 중동
        'AE': '아랍에미리트',
        'SA': '사우디아라비아',
        'QA': '카타르',
        'KW': '쿠웨이트',
        'BH': '바레인',
        'OM': '오만',
        'YE': '예멘',
        'JO': '요단',
        'LB': '레바논',
        'SY': '시리아',
        'IQ': '이라크',
        'IR': '이란',
        'IL': '이스라엘',
        'PS': '팔레스타인'
    };

    // 대륙별 분류
    static CONTINENT_MAPPING = {
        'Asia': ['JP', 'KR', 'CN', 'TH', 'SG', 'MY', 'ID', 'VN', 'PH', 'IN', 'TW', 'HK', 'MO', 'MN', 'KZ', 'UZ', 'AF', 'BD', 'BT', 'MM', 'NP', 'LK', 'MV'],
        'Europe': ['GB', 'FR', 'DE', 'IT', 'ES', 'PT', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'IS', 'IE', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR', 'SI', 'RS', 'GR', 'CY', 'MT', 'RU', 'UA', 'BY', 'LT', 'LV', 'EE'],
        'North America': ['US', 'CA', 'MX', 'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA'],
        'South America': ['BR', 'AR', 'CL', 'PE', 'CO', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR'],
        'Oceania': ['AU', 'NZ', 'FJ', 'PG', 'SB', 'VU', 'NC', 'PF'],
        'Africa': ['EG', 'MA', 'TN', 'DZ', 'LY', 'SD', 'ET', 'KE', 'TZ', 'UG', 'RW', 'ZA', 'ZW', 'BW', 'NA', 'ZM', 'MW', 'MZ', 'MG', 'MU', 'SC'],
        'Middle East': ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'YE', 'JO', 'LB', 'SY', 'IQ', 'IR', 'IL', 'PS', 'TR']
    };

    /**
     * 국가 코드를 한글 이름으로 변환합니다
     * @param {string} countryCode - 국가 코드 (ISO 3166-1 alpha-2)
     * @returns {string} 한글 국가명
     */
    static getCountryName(countryCode) {
        if (!countryCode || typeof countryCode !== 'string') {
            return '알 수 없음';
        }
        
        const code = countryCode.trim().toUpperCase();
        return this.COUNTRY_NAMES[code] || code;
    }

    /**
     * 한글 국가명을 국가 코드로 변환합니다
     * @param {string} countryName - 한글 국가명
     * @returns {string|null} 국가 코드 또는 null
     */
    static getCountryCode(countryName) {
        if (!countryName || typeof countryName !== 'string') {
            return null;
        }
        
        const name = countryName.trim();
        for (const [code, koreanName] of Object.entries(this.COUNTRY_NAMES)) {
            if (koreanName === name) {
                return code;
            }
        }
        return null;
    }

    /**
     * 국가 코드가 유효한지 확인합니다
     * @param {string} countryCode - 확인할 국가 코드
     * @returns {boolean} 유효한 국가 코드인지 여부
     */
    static isValidCountryCode(countryCode) {
        if (!countryCode || typeof countryCode !== 'string') {
            return false;
        }
        
        const code = countryCode.trim().toUpperCase();
        return this.COUNTRY_NAMES.hasOwnProperty(code);
    }

    /**
     * 국가의 대륙을 반환합니다
     * @param {string} countryCode - 국가 코드
     * @returns {string|null} 대륙명 또는 null
     */
    static getContinent(countryCode) {
        if (!this.isValidCountryCode(countryCode)) {
            return null;
        }
        
        const code = countryCode.trim().toUpperCase();
        for (const [continent, countries] of Object.entries(this.CONTINENT_MAPPING)) {
            if (countries.includes(code)) {
                return continent;
            }
        }
        return null;
    }

    /**
     * 대륙별로 국가를 그룹화합니다
     * @param {Array} logs - 로그 배열
     * @returns {Object} 대륙별 그룹화된 데이터
     */
    static groupLogsByContinent(logs) {
        try {
            if (!Array.isArray(logs)) {
                return {};
            }
            
            const continentGroups = {};
            
            logs.forEach(log => {
                if (!log.country) return;
                
                const continent = this.getContinent(log.country) || 'Unknown';
                
                if (!continentGroups[continent]) {
                    continentGroups[continent] = {
                        continent: continent,
                        countries: new Set(),
                        logs: [],
                        totalTrips: 0
                    };
                }
                
                continentGroups[continent].countries.add(log.country);
                continentGroups[continent].logs.push(log);
                continentGroups[continent].totalTrips++;
            });
            
            // Set을 배열로 변환
            Object.values(continentGroups).forEach(group => {
                group.countries = Array.from(group.countries);
                group.uniqueCountries = group.countries.length;
            });
            
            return continentGroups;
        } catch (error) {
            console.error('대륙별 그룹화 오류:', error);
            return {};
        }
    }

    /**
     * 로그 배열을 특정 국가로 필터링합니다
     * @param {Array} logs - 로그 배열
     * @param {string} countryCode - 국가 코드
     * @returns {Array} 필터링된 로그 배열
     */
    static filterLogsByCountry(logs, countryCode) {
        try {
            if (!Array.isArray(logs) || !countryCode) {
                return [];
            }
            
            const code = countryCode.trim().toUpperCase();
            return logs.filter(log => log.country && log.country.toUpperCase() === code);
        } catch (error) {
            console.error('국가별 로그 필터링 오류:', error);
            return [];
        }
    }

    /**
     * 로그 배열에서 모든 국가를 추출합니다
     * @param {Array} logs - 로그 배열
     * @returns {Array} 국가 배열 (방문 횟수 순)
     */
    static extractCountriesFromLogs(logs) {
        try {
            if (!Array.isArray(logs)) {
                return [];
            }
            
            const countryCounts = {};
            logs.forEach(log => {
                if (log.country) {
                    const country = log.country.trim().toUpperCase();
                    countryCounts[country] = (countryCounts[country] || 0) + 1;
                }
            });
            
            // 방문 횟수 순으로 정렬
            return Object.entries(countryCounts)
                .sort(([,a], [,b]) => b - a)
                .map(([country, count]) => ({
                    code: country,
                    name: this.getCountryName(country),
                    visitCount: count
                }));
        } catch (error) {
            console.error('국가 추출 오류:', error);
            return [];
        }
    }

    /**
     * 국가명을 정규화합니다 (공백 제거, 대소문자 통일 등)
     * @param {string} countryInput - 입력된 국가명 또는 코드
     * @returns {string|null} 정규화된 국가 코드 또는 null
     */
    static normalizeCountry(countryInput) {
        try {
            if (!countryInput || typeof countryInput !== 'string') {
                return null;
            }
            
            const input = countryInput.trim();
            
            // 이미 유효한 국가 코드인지 확인
            const upperInput = input.toUpperCase();
            if (this.isValidCountryCode(upperInput)) {
                return upperInput;
            }
            
            // 한글 국가명으로 검색
            const code = this.getCountryCode(input);
            if (code) {
                return code;
            }
            
            // 부분 매칭 시도 (한글명 기준)
            const lowerInput = input.toLowerCase();
            for (const [code, name] of Object.entries(this.COUNTRY_NAMES)) {
                if (name.includes(input) || name.toLowerCase().includes(lowerInput)) {
                    return code;
                }
            }
            
            return null;
        } catch (error) {
            console.error('국가 정규화 오류:', error);
            return null;
        }
    }

    /**
     * 모든 국가 목록을 반환합니다
     * @param {string} sortBy - 정렬 기준 ('code', 'name', 'continent')
     * @returns {Array} 국가 목록
     */
    static getAllCountries(sortBy = 'name') {
        try {
            const countries = Object.entries(this.COUNTRY_NAMES).map(([code, name]) => ({
                code: code,
                name: name,
                continent: this.getContinent(code)
            }));
            
            switch (sortBy) {
                case 'code':
                    return countries.sort((a, b) => a.code.localeCompare(b.code));
                case 'continent':
                    return countries.sort((a, b) => {
                        const continentCompare = (a.continent || '').localeCompare(b.continent || '');
                        return continentCompare !== 0 ? continentCompare : a.name.localeCompare(b.name, 'ko-KR');
                    });
                case 'name':
                default:
                    return countries.sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
            }
        } catch (error) {
            console.error('국가 목록 조회 오류:', error);
            return [];
        }
    }

    /**
     * 특정 대륙의 국가 목록을 반환합니다
     * @param {string} continent - 대륙명
     * @returns {Array} 해당 대륙의 국가 목록
     */
    static getCountriesByContinent(continent) {
        try {
            const countries = this.CONTINENT_MAPPING[continent];
            if (!countries) {
                return [];
            }
            
            return countries.map(code => ({
                code: code,
                name: this.getCountryName(code),
                continent: continent
            })).sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
        } catch (error) {
            console.error('대륙별 국가 목록 조회 오류:', error);
            return [];
        }
    }

    /**
     * 국가 검색을 수행합니다
     * @param {string} query - 검색어
     * @returns {Array} 검색 결과
     */
    static searchCountries(query) {
        try {
            if (!query || typeof query !== 'string') {
                return [];
            }
            
            const searchTerm = query.trim().toLowerCase();
            const results = [];
            
            for (const [code, name] of Object.entries(this.COUNTRY_NAMES)) {
                const score = this._calculateSearchScore(searchTerm, code, name);
                if (score > 0) {
                    results.push({
                        code: code,
                        name: name,
                        continent: this.getContinent(code),
                        score: score
                    });
                }
            }
            
            // 점수순으로 정렬
            return results.sort((a, b) => b.score - a.score);
        } catch (error) {
            console.error('국가 검색 오류:', error);
            return [];
        }
    }

    /**
     * 검색 점수를 계산합니다
     * @param {string} query - 검색어
     * @param {string} code - 국가 코드
     * @param {string} name - 국가명
     * @returns {number} 검색 점수
     * @private
     */
    static _calculateSearchScore(query, code, name) {
        const lowerCode = code.toLowerCase();
        const lowerName = name.toLowerCase();
        
        // 완전 일치
        if (lowerName === query || lowerCode === query) {
            return 100;
        }
        
        // 시작 일치
        if (lowerName.startsWith(query) || lowerCode.startsWith(query)) {
            return 80;
        }
        
        // 포함 일치
        if (lowerName.includes(query) || lowerCode.includes(query)) {
            return 60;
        }
        
        return 0;
    }
}

export { CountryUtils };
