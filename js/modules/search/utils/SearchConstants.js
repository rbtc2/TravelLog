/**
 * 검색 관련 상수 정의
 */

export const SEARCH_STATES = {
    INITIAL: 'initial',
    SEARCHING: 'searching',
    HAS_RESULTS: 'hasResults',
    NO_RESULTS: 'noResults',
    DETAIL: 'detail'
};

export const SORT_TYPES = {
    RELEVANCE: 'relevance',
    DATE_DESC: 'date-desc',
    DATE_ASC: 'date-asc',
    RATING_DESC: 'rating-desc',
    PURPOSE_ASC: 'purpose-asc'
};

export const SORT_DISPLAY_NAMES = {
    [SORT_TYPES.RELEVANCE]: '관련성',
    [SORT_TYPES.DATE_DESC]: '최신순',
    [SORT_TYPES.DATE_ASC]: '오래된순',
    [SORT_TYPES.RATING_DESC]: '별점순',
    [SORT_TYPES.PURPOSE_ASC]: '목적순'
};

export const PURPOSE_DISPLAY_NAMES = {
    'tourism': '🏖️ 관광/여행',
    'business': '💼 업무/출장',
    'family': '👨‍👩‍👧‍👦 가족/지인 방문',
    'study': '📚 학업',
    'work': '💻 취업/근로',
    'training': '🎯 연수/교육',
    'event': '🎪 행사/컨퍼런스',
    'volunteer': '🤝 봉사활동',
    'medical': '🏥 의료',
    'transit': '✈️ 경유/환승',
    'research': '🔬 연구/학술',
    'immigration': '🏠 이주/정착',
    'other': '❓ 기타'
};

export const TRAVEL_STYLE_DISPLAY_NAMES = {
    'solo': '👤 혼자',
    'family': '👨‍👩‍👧‍👦 가족과',
    'couple': '💑 연인과',
    'friends': '👥 친구와',
    'group': '👥 단체',
    'alone': '👤 혼자', // 기존 데이터 호환성
    'colleagues': '👔 동료와' // 기존 데이터 호환성
};

export const FIELD_DISPLAY_NAMES = {
    country: '국가',
    city: '도시',
    memo: '메모',
    purpose: '목적',
    travelStyle: '동행유형'
};

export const CONTINENTS = [
    { value: 'asia', label: '아시아' },
    { value: 'europe', label: '유럽' },
    { value: 'north-america', label: '북아메리카' },
    { value: 'south-america', label: '남아메리카' },
    { value: 'africa', label: '아프리카' },
    { value: 'oceania', label: '오세아니아' }
];

export const PURPOSES = [
    { value: 'tourism', label: '🏖️ 관광/여행' },
    { value: 'business', label: '💼 업무/출장' },
    { value: 'family', label: '👨‍👩‍👧‍👦 가족/지인 방문' },
    { value: 'study', label: '📚 학업' },
    { value: 'work', label: '💻 취업/근로' },
    { value: 'training', label: '🎯 파견/연수' },
    { value: 'event', label: '🎪 행사/컨퍼런스' },
    { value: 'volunteer', label: '🤝 봉사활동' },
    { value: 'medical', label: '🏥 의료' },
    { value: 'transit', label: '✈️ 경유/환승' },
    { value: 'research', label: '🔬 연구/학술' },
    { value: 'immigration', label: '🏠 이주/정착' },
    { value: 'other', label: '❓ 기타' }
];

export const TRAVEL_STYLES = [
    { value: 'alone', label: '👤 혼자' },
    { value: 'family', label: '👨‍👩‍👧‍👦 가족과' },
    { value: 'couple', label: '💑 연인과' },
    { value: 'friends', label: '👥 친구와' },
    { value: 'colleagues', label: '👔 동료와' }
];

export const DEFAULT_FILTERS = {
    continent: [],
    purpose: '',
    memo: '',
    travelStyle: '',
    rating: '',
    dateRange: {
        start: '',
        end: ''
    }
};
