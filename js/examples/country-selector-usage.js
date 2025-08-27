/**
 * 국가 선택기 컴포넌트 사용 예시 및 통합 가이드
 * 기존 코드에 영향을 주지 않고 독립적으로 사용할 수 있는 방법을 보여줍니다.
 * 
 * @author TravelLog System
 * @version 1.0.0
 */

import CountrySelector from '../modules/ui-components/country-selector.js';

/**
 * 국가 선택기 사용 예시
 * 이 파일은 참고용이며, 실제 프로젝트에서는 필요에 따라 수정하여 사용하세요.
 */

// ===== 1. 기본 사용법 =====

/**
 * 단일 국가 선택기 생성
 */
function createSingleCountrySelector() {
    const container = document.getElementById('single-country-container');
    
    const countrySelector = new CountrySelector({
        multiple: false,
        placeholder: '방문한 국가를 선택하세요',
        showFlags: true,
        showCodes: true,
        searchable: true,
        filterable: true,
        onSelectionChange: (selectedCountries, selectedCodes) => {
            console.log('선택된 국가:', selectedCountries);
            console.log('선택된 국가 코드:', selectedCodes);
            
            // 폼 데이터 업데이트
            updateFormData('country', selectedCodes[0] || '');
        }
    });
    
    countrySelector.render(container);
    return countrySelector;
}

/**
 * 다중 국가 선택기 생성
 */
function createMultipleCountrySelector() {
    const container = document.getElementById('multiple-country-container');
    
    const countrySelector = new CountrySelector({
        multiple: true,
        placeholder: '방문한 국가들을 선택하세요 (최대 5개)',
        maxSelections: 5,
        showFlags: true,
        showCodes: false,
        searchable: true,
        filterable: true,
        onSelectionChange: (selectedCountries, selectedCodes) => {
            console.log('선택된 국가들:', selectedCountries);
            console.log('선택된 국가 코드들:', selectedCodes);
            
            // 폼 데이터 업데이트
            updateFormData('countries', selectedCodes);
        }
    });
    
    countrySelector.render(container);
    return countrySelector;
}

// ===== 2. 기존 폼과 통합 =====

/**
 * 기존 폼의 국가 입력 필드를 국가 선택기로 교체
 */
function replaceCountryInputWithSelector() {
    // 기존 국가 입력 필드 찾기
    const oldCountryInput = document.getElementById('country');
    if (!oldCountryInput) return;
    
    // 기존 입력 필드 숨기기
    oldCountryInput.style.display = 'none';
    
    // 국가 선택기 컨테이너 생성
    const selectorContainer = document.createElement('div');
    selectorContainer.id = 'country-selector-container';
    selectorContainer.className = 'form-group';
    
    // 라벨 추가
    const label = document.createElement('label');
    label.htmlFor = 'country-selector';
    label.textContent = '국가';
    selectorContainer.appendChild(label);
    
    // 국가 선택기 생성
    const countrySelector = new CountrySelector({
        multiple: false,
        placeholder: '국가를 선택하세요',
        showFlags: true,
        showCodes: true,
        searchable: true,
        filterable: true,
        onSelectionChange: (selectedCountries, selectedCodes) => {
            // 기존 입력 필드 값 업데이트
            oldCountryInput.value = selectedCodes[0] || '';
            
            // 기존 폼 검증 트리거
            if (oldCountryInput.dispatchEvent) {
                oldCountryInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    });
    
    // 기존 값이 있으면 설정
    if (oldCountryInput.value) {
        countrySelector.setSelectedCountries([oldCountryInput.value]);
    }
    
    // 기존 입력 필드 다음에 삽입
    oldCountryInput.parentNode.insertBefore(selectorContainer, oldCountryInput.nextSibling);
    
    // 국가 선택기 렌더링
    countrySelector.render(selectorContainer);
    
    return countrySelector;
}

// ===== 3. 검색 탭에 통합 =====

/**
 * 검색 탭에 국가 필터 추가
 */
function addCountryFilterToSearch() {
    const filterContainer = document.querySelector('.filter-panel[data-panel="location"]');
    if (!filterContainer) return;
    
    // 국가 필터 섹션 생성
    const countryFilterSection = document.createElement('div');
    countryFilterSection.className = 'filter-group';
    countryFilterSection.innerHTML = `
        <label class="filter-label">🏳️ 국가</label>
        <div id="search-country-selector-container"></div>
    `;
    
    // 기존 대륙 필터 다음에 추가
    const continentFilter = filterContainer.querySelector('.filter-group');
    if (continentFilter) {
        continentFilter.parentNode.insertBefore(countryFilterSection, continentFilter.nextSibling);
    }
    
    // 국가 선택기 생성
    const countrySelector = new CountrySelector({
        multiple: true,
        placeholder: '국가를 선택하세요',
        maxSelections: 10,
        showFlags: true,
        showCodes: false,
        searchable: true,
        filterable: true,
        onSelectionChange: (selectedCountries, selectedCodes) => {
            // 검색 필터 업데이트
            updateSearchFilters('countries', selectedCodes);
        }
    });
    
    countrySelector.render(document.getElementById('search-country-selector-container'));
    return countrySelector;
}

// ===== 4. 데이터 검증 및 변환 =====

/**
 * 국가 코드를 국가 이름으로 변환
 */
async function convertCountryCodeToName(countryCode) {
    // CountryDataManager를 직접 사용
    const { countryDataManager } = await import('../modules/utils/country-data-manager.js');
    
    const country = countryDataManager.getCountryByCode(countryCode);
    return country ? country.nameKo : countryCode;
}

/**
 * 국가 이름을 국가 코드로 변환
 */
async function convertCountryNameToCode(countryName) {
    const { countryDataManager } = await import('../modules/utils/country-data-manager.js');
    
    const country = countryDataManager.getCountryByName(countryName);
    return country ? country.code : countryName;
}

/**
 * 선택된 국가들의 상세 정보 반환
 */
async function getSelectedCountriesInfo(selectedCodes) {
    const { countryDataManager } = await import('../modules/utils/country-data-manager.js');
    
    return selectedCodes.map(code => {
        const country = countryDataManager.getCountryByCode(code);
        return country ? {
            code: country.code,
            nameKo: country.nameKo,
            nameEn: country.nameEn,
            flag: country.flag,
            region: country.region
        } : { code, nameKo: code, nameEn: code, flag: '🏳️', region: 'unknown' };
    });
}

// ===== 5. 폼 데이터 관리 =====

/**
 * 폼 데이터 업데이트
 */
function updateFormData(fieldName, value) {
    // 기존 폼 검증 로직과 통합
    const form = document.querySelector('form');
    if (form) {
        const formData = new FormData(form);
        formData.set(fieldName, value);
        
        // 커스텀 이벤트 발생
        form.dispatchEvent(new CustomEvent('formDataChange', {
            detail: { fieldName, value, formData }
        }));
    }
}

/**
 * 검색 필터 업데이트
 */
function updateSearchFilters(filterName, value) {
    // 검색 탭의 필터 상태 업데이트
    const searchTab = window.searchTab; // 전역 변수로 가정
    if (searchTab && searchTab.filters) {
        searchTab.filters[filterName] = value;
        
        // 검색 결과 업데이트
        if (searchTab.performSearch) {
            searchTab.performSearch();
        }
    }
}

// ===== 6. 기존 데이터 마이그레이션 =====

/**
 * 기존 텍스트 국가 데이터를 국가 코드로 변환
 */
async function migrateExistingCountryData() {
    const { countryDataManager } = await import('../modules/utils/country-data-manager.js');
    
    // 기존 로그 데이터에서 국가 정보 추출
    const existingLogs = JSON.parse(localStorage.getItem('travelLogs') || '[]');
    
    const migratedLogs = existingLogs.map(log => {
        if (log.country && typeof log.country === 'string') {
            // 국가 이름을 코드로 변환 시도
            const country = countryDataManager.getCountryByName(log.country);
            if (country) {
                return {
                    ...log,
                    country: country.code,
                    countryName: country.nameKo, // 기존 호환성을 위해 유지
                    countryFlag: country.flag
                };
            }
        }
        return log;
    });
    
    // 마이그레이션된 데이터 저장
    localStorage.setItem('travelLogs', JSON.stringify(migratedLogs));
    
    console.log(`${migratedLogs.length}개의 로그 데이터 마이그레이션 완료`);
    return migratedLogs;
}

// ===== 7. 통계 및 분석 =====

/**
 * 국가별 방문 통계 생성
 */
async function generateCountryStatistics() {
    const { countryDataManager } = await import('../modules/utils/country-data-manager.js');
    
    const logs = JSON.parse(localStorage.getItem('travelLogs') || '[]');
    const countryStats = new Map();
    
    logs.forEach(log => {
        if (log.country) {
            const country = countryDataManager.getCountryByCode(log.country);
            if (country) {
                const key = country.code;
                if (!countryStats.has(key)) {
                    countryStats.set(key, {
                        code: country.code,
                        nameKo: country.nameKo,
                        nameEn: country.nameEn,
                        flag: country.flag,
                        region: country.region,
                        visitCount: 0,
                        totalDays: 0,
                        averageRating: 0,
                        ratings: []
                    });
                }
                
                const stats = countryStats.get(key);
                stats.visitCount++;
                
                if (log.startDate && log.endDate) {
                    const days = calculateDaysBetween(log.startDate, log.endDate);
                    stats.totalDays += days;
                }
                
                if (log.rating) {
                    stats.ratings.push(parseFloat(log.rating));
                    stats.averageRating = stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length;
                }
            }
        }
    });
    
    return Array.from(countryStats.values());
}

/**
 * 날짜 간 일수 계산
 */
function calculateDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ===== 8. 사용 예시 =====

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. 기존 데이터 마이그레이션
        await migrateExistingCountryData();
        
        // 2. 국가 선택기 생성
        if (document.getElementById('single-country-container')) {
            createSingleCountrySelector();
        }
        
        if (document.getElementById('multiple-country-container')) {
            createMultipleCountrySelector();
        }
        
        // 3. 기존 폼 교체
        if (document.getElementById('country')) {
            replaceCountryInputWithSelector();
        }
        
        // 4. 검색 탭에 국가 필터 추가
        if (document.querySelector('.filter-panel[data-panel="location"]')) {
            addCountryFilterToSearch();
        }
        
        console.log('국가 선택기 초기화 완료');
        
    } catch (error) {
        console.error('국가 선택기 초기화 실패:', error);
    }
});

// ===== 9. 내보내기 =====

// 다른 모듈에서 사용할 수 있도록 함수들 내보내기
export {
    createSingleCountrySelector,
    createMultipleCountrySelector,
    replaceCountryInputWithSelector,
    addCountryFilterToSearch,
    convertCountryCodeToName,
    convertCountryNameToCode,
    getSelectedCountriesInfo,
    migrateExistingCountryData,
    generateCountryStatistics
};
