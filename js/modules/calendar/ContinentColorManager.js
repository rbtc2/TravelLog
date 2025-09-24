/**
 * 대륙별 색상 관리 모듈
 * 바 형태 일정 표시를 위한 대륙별 색상 시스템
 */

export class ContinentColorManager {
    constructor() {
        // 대륙별 색상 정의 (라이트/다크 모드 지원)
        this.continentColors = {
            '아시아': {
                light: '#ff6b6b',    // 빨간색 계열
                dark: '#ff8a80',
                name: '아시아'
            },
            '유럽': {
                light: '#4ecdc4',    // 청록색 계열
                dark: '#80cbc4',
                name: '유럽'
            },
            '북아메리카': {
                light: '#45b7d1',    // 파란색 계열
                dark: '#81d4fa',
                name: '북아메리카'
            },
            '남아메리카': {
                light: '#96ceb4',    // 연두색 계열
                dark: '#a5d6a7',
                name: '남아메리카'
            },
            '아프리카': {
                light: '#feca57',    // 노란색 계열
                dark: '#fff176',
                name: '아프리카'
            },
            '오세아니아': {
                light: '#ff9ff3',    // 분홍색 계열
                dark: '#f8bbd9',
                name: '오세아니아'
            },
            '기타': {
                light: '#a4b0be',    // 회색 계열
                dark: '#b0bec5',
                name: '기타'
            }
        };

        // 국가별 대륙 매핑 (주요 국가들)
        this.countryToContinent = {
            // 아시아
            'KR': '아시아', '한국': '아시아', '대한민국': '아시아',
            'JP': '아시아', '일본': '아시아',
            'CN': '아시아', '중국': '아시아',
            'TH': '아시아', '태국': '아시아',
            'VN': '아시아', '베트남': '아시아',
            'SG': '아시아', '싱가포르': '아시아',
            'MY': '아시아', '말레이시아': '아시아',
            'ID': '아시아', '인도네시아': '아시아',
            'PH': '아시아', '필리핀': '아시아',
            'IN': '아시아', '인도': '아시아',
            'TW': '아시아', '대만': '아시아',
            'HK': '아시아', '홍콩': '아시아',
            'MO': '아시아', '마카오': '아시아',
            'MN': '아시아', '몽골': '아시아',
            'LA': '아시아', '라오스': '아시아',
            'KH': '아시아', '캄보디아': '아시아',
            'MM': '아시아', '미얀마': '아시아',
            'BD': '아시아', '방글라데시': '아시아',
            'LK': '아시아', '스리랑카': '아시아',
            'NP': '아시아', '네팔': '아시아',
            'BT': '아시아', '부탄': '아시아',
            'MV': '아시아', '몰디브': '아시아',
            'PK': '아시아', '파키스탄': '아시아',
            'AF': '아시아', '아프가니스탄': '아시아',
            'IR': '아시아', '이란': '아시아',
            'IQ': '아시아', '이라크': '아시아',
            'SY': '아시아', '시리아': '아시아',
            'LB': '아시아', '레바논': '아시아',
            'JO': '아시아', '요르단': '아시아',
            'IL': '아시아', '이스라엘': '아시아',
            'PS': '아시아', '팔레스타인': '아시아',
            'SA': '아시아', '사우디아라비아': '아시아',
            'AE': '아시아', '아랍에미리트': '아시아',
            'QA': '아시아', '카타르': '아시아',
            'BH': '아시아', '바레인': '아시아',
            'KW': '아시아', '쿠웨이트': '아시아',
            'OM': '아시아', '오만': '아시아',
            'YE': '아시아', '예멘': '아시아',
            'TR': '아시아', '튀르키예': '아시아',
            'CY': '아시아', '키프로스': '아시아',
            'GE': '아시아', '조지아': '아시아',
            'AM': '아시아', '아르메니아': '아시아',
            'AZ': '아시아', '아제르바이잔': '아시아',
            'KZ': '아시아', '카자흐스탄': '아시아',
            'UZ': '아시아', '우즈베키스탄': '아시아',
            'TM': '아시아', '투르크메니스탄': '아시아',
            'TJ': '아시아', '타지키스탄': '아시아',
            'KG': '아시아', '키르기스스탄': '아시아',

            // 유럽
            'GB': '유럽', '영국': '유럽', 'United Kingdom': '유럽', 'UK': '유럽',
            'FR': '유럽', '프랑스': '유럽', 'France': '유럽',
            'DE': '유럽', '독일': '유럽', 'Germany': '유럽',
            'IT': '유럽', '이탈리아': '유럽', 'Italy': '유럽',
            'ES': '유럽', '스페인': '유럽', 'Spain': '유럽',
            'NL': '유럽', '네덜란드': '유럽', 'Netherlands': '유럽',
            'BE': '유럽', '벨기에': '유럽', 'Belgium': '유럽',
            'CH': '유럽', '스위스': '유럽', 'Switzerland': '유럽',
            'AT': '유럽', '오스트리아': '유럽', 'Austria': '유럽',
            'SE': '유럽', '스웨덴': '유럽', 'Sweden': '유럽',
            'NO': '유럽', '노르웨이': '유럽', 'Norway': '유럽',
            'DK': '유럽', '덴마크': '유럽', 'Denmark': '유럽',
            'FI': '유럽', '핀란드': '유럽', 'Finland': '유럽',
            'IS': '유럽', '아이슬란드': '유럽', 'Iceland': '유럽',
            'IE': '유럽', '아일랜드': '유럽', 'Ireland': '유럽',
            'PT': '유럽', '포르투갈': '유럽', 'Portugal': '유럽',
            'GR': '유럽', '그리스': '유럽', 'Greece': '유럽',
            'PL': '유럽', '폴란드': '유럽', 'Poland': '유럽',
            'CZ': '유럽', '체코': '유럽', 'Czech Republic': '유럽',
            'SK': '유럽', '슬로바키아': '유럽', 'Slovakia': '유럽',
            'HU': '유럽', '헝가리': '유럽', 'Hungary': '유럽',
            'RO': '유럽', '루마니아': '유럽', 'Romania': '유럽',
            'BG': '유럽', '불가리아': '유럽', 'Bulgaria': '유럽',
            'HR': '유럽', '크로아티아': '유럽', 'Croatia': '유럽',
            'SI': '유럽', '슬로베니아': '유럽', 'Slovenia': '유럽',
            'RS': '유럽', '세르비아': '유럽', 'Serbia': '유럽',
            'ME': '유럽', '몬테네그로': '유럽', 'Montenegro': '유럽',
            'BA': '유럽', '보스니아헤르체고비나': '유럽', 'Bosnia and Herzegovina': '유럽',
            'MK': '유럽', '북마케도니아': '유럽', 'North Macedonia': '유럽',
            'AL': '유럽', '알바니아': '유럽', 'Albania': '유럽',
            'XK': '유럽', '코소보': '유럽', 'Kosovo': '유럽',
            'LT': '유럽', '리투아니아': '유럽', 'Lithuania': '유럽',
            'LV': '유럽', '라트비아': '유럽', 'Latvia': '유럽',
            'EE': '유럽', '에스토니아': '유럽', 'Estonia': '유럽',
            'BY': '유럽', '벨라루스': '유럽', 'Belarus': '유럽',
            'UA': '유럽', '우크라이나': '유럽', 'Ukraine': '유럽',
            'MD': '유럽', '몰도바': '유럽', 'Moldova': '유럽',
            'RU': '유럽', '러시아': '유럽', 'Russia': '유럽',
            'LU': '유럽', '룩셈부르크': '유럽', 'Luxembourg': '유럽',
            'LI': '유럽', '리히텐슈타인': '유럽', 'Liechtenstein': '유럽',
            'MC': '유럽', '모나코': '유럽', 'Monaco': '유럽',
            'SM': '유럽', '산마리노': '유럽', 'San Marino': '유럽',
            'VA': '유럽', '바티칸': '유럽', 'Vatican': '유럽',
            'AD': '유럽', '안도라': '유럽', 'Andorra': '유럽',
            'MT': '유럽', '몰타': '유럽', 'Malta': '유럽',

            // 북아메리카
            'US': '북아메리카', '미국': '북아메리카', 'United States': '북아메리카', 'USA': '북아메리카',
            'CA': '북아메리카', '캐나다': '북아메리카', 'Canada': '북아메리카',
            'MX': '북아메리카', '멕시코': '북아메리카', 'Mexico': '북아메리카',
            'GT': '북아메리카', '과테말라': '북아메리카', 'Guatemala': '북아메리카',
            'BZ': '북아메리카', '벨리즈': '북아메리카', 'Belize': '북아메리카',
            'SV': '북아메리카', '엘살바도르': '북아메리카', 'El Salvador': '북아메리카',
            'HN': '북아메리카', '온두라스': '북아메리카', 'Honduras': '북아메리카',
            'NI': '북아메리카', '니카라과': '북아메리카', 'Nicaragua': '북아메리카',
            'CR': '북아메리카', '코스타리카': '북아메리카', 'Costa Rica': '북아메리카',
            'PA': '북아메리카', '파나마': '북아메리카', 'Panama': '북아메리카',
            'CU': '북아메리카', '쿠바': '북아메리카', 'Cuba': '북아메리카',
            'JM': '북아메리카', '자메이카': '북아메리카', 'Jamaica': '북아메리카',
            'HT': '북아메리카', '아이티': '북아메리카', 'Haiti': '북아메리카',
            'DO': '북아메리카', '도미니카공화국': '북아메리카', 'Dominican Republic': '북아메리카',
            'PR': '북아메리카', '푸에르토리코': '북아메리카', 'Puerto Rico': '북아메리카',

            // 남아메리카
            'BR': '남아메리카', '브라질': '남아메리카', 'Brazil': '남아메리카',
            'AR': '남아메리카', '아르헨티나': '남아메리카', 'Argentina': '남아메리카',
            'CL': '남아메리카', '칠레': '남아메리카', 'Chile': '남아메리카',
            'CO': '남아메리카', '콜롬비아': '남아메리카', 'Colombia': '남아메리카',
            'PE': '남아메리카', '페루': '남아메리카', 'Peru': '남아메리카',
            'VE': '남아메리카', '베네수엘라': '남아메리카', 'Venezuela': '남아메리카',
            'EC': '남아메리카', '에콰도르': '남아메리카', 'Ecuador': '남아메리카',
            'BO': '남아메리카', '볼리비아': '남아메리카', 'Bolivia': '남아메리카',
            'PY': '남아메리카', '파라과이': '남아메리카', 'Paraguay': '남아메리카',
            'UY': '남아메리카', '우루과이': '남아메리카', 'Uruguay': '남아메리카',
            'GY': '남아메리카', '가이아나': '남아메리카', 'Guyana': '남아메리카',
            'SR': '남아메리카', '수리남': '남아메리카', 'Suriname': '남아메리카',
            'GF': '남아메리카', '프랑스령 기아나': '남아메리카', 'French Guiana': '남아메리카',

            // 아프리카
            'EG': '아프리카', '이집트': '아프리카', 'Egypt': '아프리카',
            'LY': '아프리카', '리비아': '아프리카', 'Libya': '아프리카',
            'TN': '아프리카', '튀니지': '아프리카', 'Tunisia': '아프리카',
            'DZ': '아프리카', '알제리': '아프리카', 'Algeria': '아프리카',
            'MA': '아프리카', '모로코': '아프리카', 'Morocco': '아프리카',
            'SD': '아프리카', '수단': '아프리카', 'Sudan': '아프리카',
            'SS': '아프리카', '남수단': '아프리카', 'South Sudan': '아프리카',
            'ET': '아프리카', '에티오피아': '아프리카', 'Ethiopia': '아프리카',
            'ER': '아프리카', '에리트레아': '아프리카', 'Eritrea': '아프리카',
            'DJ': '아프리카', '지부티': '아프리카', 'Djibouti': '아프리카',
            'SO': '아프리카', '소말리아': '아프리카', 'Somalia': '아프리카',
            'KE': '아프리카', '케냐': '아프리카', 'Kenya': '아프리카',
            'UG': '아프리카', '우간다': '아프리카', 'Uganda': '아프리카',
            'TZ': '아프리카', '탄자니아': '아프리카', 'Tanzania': '아프리카',
            'RW': '아프리카', '르완다': '아프리카', 'Rwanda': '아프리카',
            'BI': '아프리카', '부룬디': '아프리카', 'Burundi': '아프리카',
            'MW': '아프리카', '말라위': '아프리카', 'Malawi': '아프리카',
            'ZM': '아프리카', '잠비아': '아프리카', 'Zambia': '아프리카',
            'ZW': '아프리카', '짐바브웨': '아프리카', 'Zimbabwe': '아프리카',
            'BW': '아프리카', '보츠와나': '아프리카', 'Botswana': '아프리카',
            'NA': '아프리카', '나미비아': '아프리카', 'Namibia': '아프리카',
            'ZA': '아프리카', '남아프리카공화국': '아프리카', 'South Africa': '아프리카',
            'LS': '아프리카', '레소토': '아프리카', 'Lesotho': '아프리카',
            'SZ': '아프리카', '에스와티니': '아프리카', 'Eswatini': '아프리카',
            'MZ': '아프리카', '모잠비크': '아프리카', 'Mozambique': '아프리카',
            'MG': '아프리카', '마다가스카르': '아프리카', 'Madagascar': '아프리카',
            'MU': '아프리카', '모리셔스': '아프리카', 'Mauritius': '아프리카',
            'SC': '아프리카', '세이셸': '아프리카', 'Seychelles': '아프리카',
            'KM': '아프리카', '코모로': '아프리카', 'Comoros': '아프리카',
            'YT': '아프리카', '마요트': '아프리카', 'Mayotte': '아프리카',
            'RE': '아프리카', '레위니옹': '아프리카', 'Réunion': '아프리카',
            'GH': '아프리카', '가나': '아프리카', 'Ghana': '아프리카',
            'TG': '아프리카', '토고': '아프리카', 'Togo': '아프리카',
            'BJ': '아프리카', '베냉': '아프리카', 'Benin': '아프리카',
            'NG': '아프리카', '나이지리아': '아프리카', 'Nigeria': '아프리카',
            'NE': '아프리카', '니제르': '아프리카', 'Niger': '아프리카',
            'BF': '아프리카', '부르키나파소': '아프리카', 'Burkina Faso': '아프리카',
            'ML': '아프리카', '말리': '아프리카', 'Mali': '아프리카',
            'SN': '아프리카', '세네갈': '아프리카', 'Senegal': '아프리카',
            'GM': '아프리카', '감비아': '아프리카', 'Gambia': '아프리카',
            'GN': '아프리카', '기니': '아프리카', 'Guinea': '아프리카',
            'GW': '아프리카', '기니비사우': '아프리카', 'Guinea-Bissau': '아프리카',
            'SL': '아프리카', '시에라리온': '아프리카', 'Sierra Leone': '아프리카',
            'LR': '아프리카', '라이베리아': '아프리카', 'Liberia': '아프리카',
            'CI': '아프리카', '코트디부아르': '아프리카', 'Côte d\'Ivoire': '아프리카',
            'CM': '아프리카', '카메룬': '아프리카', 'Cameroon': '아프리카',
            'CF': '아프리카', '중앙아프리카공화국': '아프리카', 'Central African Republic': '아프리카',
            'TD': '아프리카', '차드': '아프리카', 'Chad': '아프리카',
            'GQ': '아프리카', '적도기니': '아프리카', 'Equatorial Guinea': '아프리카',
            'GA': '아프리카', '가봉': '아프리카', 'Gabon': '아프리카',
            'CG': '아프리카', '콩고공화국': '아프리카', 'Republic of the Congo': '아프리카',
            'CD': '아프리카', '콩고민주공화국': '아프리카', 'Democratic Republic of the Congo': '아프리카',
            'AO': '아프리카', '앙골라': '아프리카', 'Angola': '아프리카',
            'ST': '아프리카', '상투메프린시페': '아프리카', 'São Tomé and Príncipe': '아프리카',

            // 오세아니아
            'AU': '오세아니아', '호주': '오세아니아', 'Australia': '오세아니아',
            'NZ': '오세아니아', '뉴질랜드': '오세아니아', 'New Zealand': '오세아니아',
            'PG': '오세아니아', '파푸아뉴기니': '오세아니아', 'Papua New Guinea': '오세아니아',
            'FJ': '오세아니아', '피지': '오세아니아', 'Fiji': '오세아니아',
            'SB': '오세아니아', '솔로몬제도': '오세아니아', 'Solomon Islands': '오세아니아',
            'VU': '오세아니아', '바누아투': '오세아니아', 'Vanuatu': '오세아니아',
            'NC': '오세아니아', '뉴칼레도니아': '오세아니아', 'New Caledonia': '오세아니아',
            'PF': '오세아니아', '프랑스령 폴리네시아': '오세아니아', 'French Polynesia': '오세아니아',
            'WS': '오세아니아', '사모아': '오세아니아', 'Samoa': '오세아니아',
            'TO': '오세아니아', '통가': '오세아니아', 'Tonga': '오세아니아',
            'KI': '오세아니아', '키리바시': '오세아니아', 'Kiribati': '오세아니아',
            'TV': '오세아니아', '투발루': '오세아니아', 'Tuvalu': '오세아니아',
            'NR': '오세아니아', '나우루': '오세아니아', 'Nauru': '오세아니아',
            'PW': '오세아니아', '팔라우': '오세아니아', 'Palau': '오세아니아',
            'FM': '오세아니아', '미크로네시아': '오세아니아', 'Micronesia': '오세아니아',
            'MH': '오세아니아', '마셜제도': '오세아니아', 'Marshall Islands': '오세아니아',
            'AS': '오세아니아', '미국령 사모아': '오세아니아', 'American Samoa': '오세아니아',
            'GU': '오세아니아', '괌': '오세아니아', 'Guam': '오세아니아',
            'MP': '오세아니아', '북마리아나제도': '오세아니아', 'Northern Mariana Islands': '오세아니아',
            'CK': '오세아니아', '쿡제도': '오세아니아', 'Cook Islands': '오세아니아',
            'NU': '오세아니아', '니우에': '오세아니아', 'Niue': '오세아니아',
            'TK': '오세아니아', '토켈라우': '오세아니아', 'Tokelau': '오세아니아',
            'WF': '오세아니아', '왈리스푸투나': '오세아니아', 'Wallis and Futuna': '오세아니아'
        };
    }

    /**
     * 국가 코드나 이름으로 대륙을 가져옵니다
     * @param {string} country - 국가 코드 또는 국가명
     * @returns {string} 대륙명
     */
    getContinent(country) {
        if (!country) return '기타';
        
        // 정확한 매칭 시도
        let continent = this.countryToContinent[country];
        if (continent) return continent;

        // 대소문자 무시하고 검색
        const lowerCountry = country.toLowerCase();
        for (const [key, value] of Object.entries(this.countryToContinent)) {
            if (key.toLowerCase() === lowerCountry) {
                return value;
            }
        }

        return '기타';
    }

    /**
     * 대륙의 색상을 가져옵니다 (다크모드 고려)
     * @param {string} continent - 대륙명
     * @param {boolean} isDarkMode - 다크모드 여부
     * @returns {string} 색상 코드
     */
    getContinentColor(continent, isDarkMode = false) {
        const continentData = this.continentColors[continent] || this.continentColors['기타'];
        return isDarkMode ? continentData.dark : continentData.light;
    }

    /**
     * 국가의 색상을 가져옵니다 (다크모드 고려)
     * @param {string} country - 국가 코드 또는 국가명
     * @param {boolean} isDarkMode - 다크모드 여부
     * @returns {string} 색상 코드
     */
    getCountryColor(country, isDarkMode = false) {
        const continent = this.getContinent(country);
        return this.getContinentColor(continent, isDarkMode);
    }

    /**
     * 모든 대륙 색상을 가져옵니다
     * @param {boolean} isDarkMode - 다크모드 여부
     * @returns {Object} 대륙별 색상 객체
     */
    getAllContinentColors(isDarkMode = false) {
        const colors = {};
        for (const [continent, data] of Object.entries(this.continentColors)) {
            colors[continent] = isDarkMode ? data.dark : data.light;
        }
        return colors;
    }

    /**
     * 대륙별 색상 정보를 가져옵니다 (이름 포함)
     * @param {boolean} isDarkMode - 다크모드 여부
     * @returns {Object} 대륙별 색상 정보 객체
     */
    getContinentColorInfo(isDarkMode = false) {
        const info = {};
        for (const [continent, data] of Object.entries(this.continentColors)) {
            info[continent] = {
                name: data.name,
                color: isDarkMode ? data.dark : data.light
            };
        }
        return info;
    }
}

// 싱글톤 인스턴스 생성
export const continentColorManager = new ContinentColorManager();
