/**
 * 캘린더 유틸리티 함수 모듈
 * 순수 함수들로 구성된 재사용 가능한 유틸리티
 */

/**
 * 날짜 문자열을 로컬 시간대로 정확히 파싱
 * @param {string} dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @returns {Date} 로컬 시간대의 Date 객체
 */
export function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month는 0부터 시작하므로 -1
}

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 * @param {Date} date - Date 객체
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
export function formatDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Date 객체를 한국어 형식으로 포맷팅
 * @param {Date} date - Date 객체
 * @returns {string} "YYYY년 M월 D일" 형식의 문자열
 */
export function formatDate(date) {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/**
 * 현재 월의 한국어 텍스트 반환
 * @param {Date} date - Date 객체
 * @returns {string} "1월", "2월" 등의 한국어 월 텍스트
 */
export function getCurrentMonthText(date) {
    const months = [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    return months[date.getMonth()];
}

/**
 * 국가 코드로 국기 이모지를 가져옵니다
 * @param {string} country - 국가 코드 (예: 'CN', 'FR') 또는 국가명
 * @param {Object} countriesManager - CountriesManager 인스턴스 (선택사항)
 * @returns {string} 국기 이모지
 */
export function getCountryFlag(country, countriesManager = null) {
    if (!country) return '🌍';
    
    // CountriesManager가 제공된 경우 우선 사용
    if (countriesManager && countriesManager.isInitialized) {
        // 먼저 국가 코드로 검색 시도
        let countryData = countriesManager.getCountryByCode(country);
        
        // 국가 코드로 찾지 못했으면 국가명으로 검색
        if (!countryData) {
            countryData = countriesManager.getCountryByName(country);
        }
        
        if (countryData) {
            return countryData.flag;
        }
    }
    
    // 폴백: 기본 매핑 (국가 코드와 국가명 모두 포함)
    const fallbackMap = {
        // 국가 코드
        'KR': '🇰🇷', 'JP': '🇯🇵', 'CN': '🇨🇳', 'US': '🇺🇸', 'GB': '🇬🇧',
        'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹', 'ES': '🇪🇸', 'TH': '🇹🇭',
        'VN': '🇻🇳', 'SG': '🇸🇬', 'AU': '🇦🇺', 'CA': '🇨🇦',
        // 국가명 (한글)
        '한국': '🇰🇷', '대한민국': '🇰🇷', '일본': '🇯🇵', '중국': '🇨🇳', '미국': '🇺🇸',
        '영국': '🇬🇧', '프랑스': '🇫🇷', '독일': '🇩🇪', '이탈리아': '🇮🇹', '스페인': '🇪🇸',
        '태국': '🇹🇭', '베트남': '🇻🇳', '싱가포르': '🇸🇬', '호주': '🇦🇺', '캐나다': '🇨🇦',
        // 국가명 (영문)
        'Korea': '🇰🇷', 'South Korea': '🇰🇷', 'Japan': '🇯🇵', 'China': '🇨🇳',
        'United States': '🇺🇸', 'USA': '🇺🇸', 'United Kingdom': '🇬🇧', 'UK': '🇬🇧',
        'France': '🇫🇷', 'Germany': '🇩🇪', 'Italy': '🇮🇹', 'Spain': '🇪🇸',
        'Thailand': '🇹🇭', 'Vietnam': '🇻🇳', 'Singapore': '🇸🇬', 'Australia': '🇦🇺', 'Canada': '🇨🇦'
    };
    
    return fallbackMap[country] || '🌍';
}

/**
 * 국가 정보를 가져옵니다 (국기, 한글명, 영문명 포함)
 * @param {string} country - 국가 코드 또는 국가명
 * @param {Object} countriesManager - CountriesManager 인스턴스 (선택사항)
 * @returns {Object|null} 국가 정보 객체 또는 null
 */
export function getCountryInfo(country, countriesManager = null) {
    if (!country) return null;
    
    if (countriesManager && countriesManager.isInitialized) {
        // 먼저 국가 코드로 검색 시도
        let countryData = countriesManager.getCountryByCode(country);
        
        // 국가 코드로 찾지 못했으면 국가명으로 검색
        if (!countryData) {
            countryData = countriesManager.getCountryByName(country);
        }
        
        if (countryData) {
            return {
                code: countryData.code,
                nameKo: countryData.nameKo,
                nameEn: countryData.nameEn,
                flag: countryData.flag,
                continent: countryData.continentKo
            };
        }
    }
    
    return null;
}

/**
 * 이벤트 리스너를 안전하게 추가하고 추적
 * @param {HTMLElement} element - 이벤트를 바인딩할 요소
 * @param {string} event - 이벤트 타입
 * @param {Function} handler - 이벤트 핸들러
 * @param {Object} options - 이벤트 옵션
 * @param {Array} eventListeners - 이벤트 리스너 추적 배열
 */
export function addEventListener(element, event, handler, options = {}, eventListeners = []) {
    element.addEventListener(event, handler, options);
    eventListeners.push({ element, event, handler, options });
}

/**
 * 모든 이벤트 리스너를 안전하게 제거
 * @param {Array} eventListeners - 이벤트 리스너 추적 배열
 */
export function removeAllEventListeners(eventListeners) {
    eventListeners.forEach(listener => {
        if (listener.element && listener.event && listener.handler) {
            listener.element.removeEventListener(listener.event, listener.handler, listener.options);
        }
    });
    eventListeners.length = 0; // 배열 초기화
}

/**
 * 툴팁 텍스트 생성
 * @param {Object} log - 여행 로그 객체
 * @param {string} countryName - 국가명
 * @returns {string} 툴팁 텍스트
 */
export function generateTooltipText(log, countryName) {
    const flag = getCountryFlag(log.country);
    const dayInfo = log.isStartDay ? '출발' : 
                   log.isEndDay ? '귀국' : 
                   `${log.dayOfTrip}일차`;
    
    return `${flag} ${countryName} ${dayInfo}`;
}

/**
 * 성능 측정을 위한 유틸리티
 * @param {string} label - 측정 라벨
 * @returns {Function} 측정 종료 함수
 */
export function startPerformanceMeasurement(label) {
    const startTime = performance.now();
    return () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.log(`${label}: ${duration.toFixed(2)}ms`);
        return duration;
    };
}

/**
 * 디바운싱 함수 생성
 * @param {Function} func - 디바운싱할 함수
 * @param {number} delay - 지연 시간 (ms)
 * @returns {Function} 디바운싱된 함수
 */
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * 스로틀링 함수 생성
 * @param {Function} func - 스로틀링할 함수
 * @param {number} delay - 지연 시간 (ms)
 * @returns {Function} 스로틀링된 함수
 */
export function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}
