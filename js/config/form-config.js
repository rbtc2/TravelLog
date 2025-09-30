/**
 * 폼 관련 공통 설정 및 상수
 * 모든 폼 컴포넌트에서 재사용 가능한 설정값들을 중앙화
 * @version 2.0.0
 * @since 2024-01-01
 */

export const FORM_CONFIG = {
    // 국가 입력 필드 설정
    country: {
        maxLength: 56,
        minLength: 2,
        placeholder: "국가를 검색하세요",
        hint: "",
        searchable: true,
        showFlag: true,
        showEnglishName: true,
        mobileFullscreen: true
    },
    
    // 도시 입력 필드 설정
    city: {
        maxLength: 85,
        minLength: 1,
        placeholder: "도시명을 입력하세요"
    },
    
    // 메모 입력 필드 설정
    memo: {
        maxLength: 300,
        rows: 4,
        placeholder: "여행에 대한 메모를 작성하세요 (최대 300자)"
    },
    
    // 별점 설정
    rating: {
        minValue: 1,
        maxValue: 5,
        defaultValue: 0
    },
    
    // 체류 목적 옵션 (순서 고정)
    purposeOptions: [
        { value: 'tourism', label: '관광/여행', icon: '🏖️' },
        { value: 'business', label: '업무/출장', icon: '💼' },
        { value: 'family', label: '가족/지인 방문', icon: '👨‍👩‍👧‍👦' },
        { value: 'study', label: '학업', icon: '📚' },
        { value: 'work', label: '취업/근로', icon: '💻' },
        { value: 'training', label: '파견/연수', icon: '🎯' },
        { value: 'event', label: '행사/컨퍼런스', icon: '🎪' },
        { value: 'volunteer', label: '봉사활동', icon: '🤝' },
        { value: 'medical', label: '의료', icon: '🏥' },
        { value: 'transit', label: '경유/환승', icon: '✈️' },
        { value: 'research', label: '연구/학술', icon: '🔬' },
        { value: 'immigration', label: '이주/정착', icon: '🏠' },
        { value: 'other', label: '기타', icon: '❓' }
    ],
    
    // 여행 스타일 옵션
    travelStyleOptions: [
        { value: 'alone', label: '혼자', icon: '👤' },
        { value: 'family', label: '가족과', icon: '👨‍👩‍👧‍👦' },
        { value: 'couple', label: '연인과', icon: '💑' },
        { value: 'friends', label: '친구와', icon: '👥' },
        { value: 'colleagues', label: '동료와', icon: '👔' }
    ],
    
    // 에러 메시지
    errorMessages: {
        country: {
            required: '국가를 입력해주세요',
            minLength: '국가는 2자 이상 입력해주세요',
            maxLength: '국가는 56자 이하로 입력해주세요'
        },
        city: {
            required: '도시를 입력해주세요',
            minLength: '도시는 1자 이상 입력해주세요',
            maxLength: '도시는 85자 이하로 입력해주세요'
        },
        startDate: {
            required: '시작일을 선택해주세요'
        },
        endDate: {
            required: '종료일을 선택해주세요',
            invalidRange: '종료일은 시작일 이후여야 합니다'
        },
        purpose: {
            required: '체류 목적을 선택해주세요'
        },
        rating: {
            required: '별점을 선택해주세요'
        }
    },
    
    // 성공/실패 메시지
    messages: {
        success: '일지가 성공적으로 저장되었습니다!',
        error: '일지 저장에 실패했습니다. 다시 시도해주세요.',
        saving: '저장 중...',
        submit: '📝 일지 저장하기'
    },
    
    // UI 설정
    ui: {
        successMessageDuration: 3000, // 3초
        errorMessageDuration: 5000,   // 5초
        loadingDelay: 1000,           // 1초
        touchMinSize: 44,             // 최소 터치 영역 (px)
        starSize: {
            desktop: 32,
            mobile: 28
        }
    },
    
    // CountrySelector 성능 설정
    countrySelector: {
        // 성능 목표
        performance: {
            initTimeout: 50,           // 초기화 타임아웃 (ms)
            searchTimeout: 30,         // 검색 응답 타임아웃 (ms)
            animationDuration: 200,    // 애니메이션 지속 시간 (ms)
            debounceDelay: 150         // 검색 디바운스 지연 (ms)
        },
        // 접근성 설정
        accessibility: {
            keyboardNavigation: true,  // 키보드 네비게이션 활성화
            screenReaderSupport: true, // 스크린 리더 지원
            focusManagement: true,     // 포커스 관리
            ariaLabels: true           // ARIA 라벨 사용
        },
        // 모바일 최적화
        mobile: {
            fullscreen: true,          // 전체화면 모드
            touchTargetSize: 44,       // 최소 터치 타겟 크기 (px)
            swipeSupport: true,        // 스와이프 제스처 지원
            viewportOptimization: true // 뷰포트 최적화
        }
    }
};

/**
 * 성능 테스트 유틸리티
 */
export const PERFORMANCE_UTILS = {
    /**
     * 성능 측정 시작
     * @param {string} label - 측정 라벨
     * @returns {Function} 측정 종료 함수
     */
    startMeasure: (label) => {
        const startTime = performance.now();
        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
            
            // 성능 기준 확인
            if (label.includes('초기화') && duration > FORM_CONFIG.countrySelector.performance.initTimeout) {
                console.warn(`⚠️ ${label}이 목표 시간(${FORM_CONFIG.countrySelector.performance.initTimeout}ms)을 초과했습니다.`);
            }
            if (label.includes('검색') && duration > FORM_CONFIG.countrySelector.performance.searchTimeout) {
                console.warn(`⚠️ ${label}이 목표 시간(${FORM_CONFIG.countrySelector.performance.searchTimeout}ms)을 초과했습니다.`);
            }
            
            return duration;
        };
    },
    
    /**
     * 메모리 사용량 확인
     * @returns {Object} 메모리 정보
     */
    getMemoryInfo: () => {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576 * 100) / 100,
                total: Math.round(performance.memory.totalJSHeapSize / 1048576 * 100) / 100,
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576 * 100) / 100
            };
        }
        return { used: 'N/A', total: 'N/A', limit: 'N/A' };
    }
};

/**
 * 폼 검증 규칙
 */
export const VALIDATION_RULES = {
    /**
     * 국가명 검증
     * @param {string} value - 검증할 국가명
     * @returns {Object} 검증 결과 { isValid: boolean, message: string }
     */
    validateCountry: (value) => {
        if (!value || !value.trim()) {
            return { isValid: false, message: FORM_CONFIG.errorMessages.country.required };
        }
        
        const trimmedValue = value.trim();
        if (trimmedValue.length < FORM_CONFIG.country.minLength) {
            return { isValid: false, message: FORM_CONFIG.errorMessages.country.minLength };
        }
        
        if (trimmedValue.length > FORM_CONFIG.country.maxLength) {
            return { isValid: false, message: FORM_CONFIG.errorMessages.country.maxLength };
        }
        
        return { isValid: true, message: '' };
    },
    
    /**
     * 도시명 검증
     * @param {string} value - 검증할 도시명
     * @returns {Object} 검증 결과 { isValid: boolean, message: string }
     */
    validateCity: (value) => {
        if (!value || !value.trim()) {
            return { isValid: false, message: FORM_CONFIG.errorMessages.city.required };
        }
        
        const trimmedValue = value.trim();
        if (trimmedValue.length < FORM_CONFIG.city.minLength) {
            return { isValid: false, message: FORM_CONFIG.errorMessages.city.minLength };
        }
        
        if (trimmedValue.length > FORM_CONFIG.city.maxLength) {
            return { isValid: false, message: FORM_CONFIG.errorMessages.city.maxLength };
        }
        
        return { isValid: true, message: '' };
    },
    
    /**
     * 날짜 범위 검증
     * @param {string} startDate - 시작일
     * @param {string} endDate - 종료일
     * @returns {Object} 검증 결과 { isValid: boolean, message: string }
     */
    validateDateRange: (startDate, endDate) => {
        if (!startDate || !endDate) {
            return { isValid: false, message: '' };
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (end < start) {
            return { isValid: false, message: FORM_CONFIG.errorMessages.endDate.invalidRange };
        }
        
        return { isValid: true, message: '' };
    }
};
