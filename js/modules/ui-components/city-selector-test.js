/**
 * CitySelector API 테스트
 * 실제 API 호출을 통한 기능 검증
 * 
 * @version 1.0.0
 * @since 2024-12-29
 * @author REDIPX
 */

import { CitySelector } from './city-selector.js';

/**
 * API 테스트 클래스
 */
class CitySelectorAPITest {
    constructor() {
        this.testResults = [];
        this.testContainer = null;
    }
    
    /**
     * 테스트 실행
     */
    async runTests() {
        console.log('🚀 CitySelector API 테스트 시작');
        
        try {
            // 테스트 환경 설정
            await this.setupTestEnvironment();
            
            // API 연결 테스트
            await this.testAPIConnection();
            
            // 도시 데이터 로드 테스트
            await this.testCityDataLoading();
            
            // 검색 기능 테스트
            await this.testSearchFunctionality();
            
            // 에러 처리 테스트
            await this.testErrorHandling();
            
            // 테스트 결과 출력
            this.printTestResults();
            
        } catch (error) {
            console.error('테스트 실행 실패:', error);
        } finally {
            this.cleanup();
        }
    }
    
    /**
     * 테스트 환경 설정
     */
    async setupTestEnvironment() {
        // 테스트용 컨테이너 생성
        this.testContainer = document.createElement('div');
        this.testContainer.id = 'city-selector-test-container';
        this.testContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: white;
            border: 1px solid #ccc;
            padding: 20px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(this.testContainer);
        
        console.log('✅ 테스트 환경 설정 완료');
    }
    
    /**
     * API 연결 테스트
     */
    async testAPIConnection() {
        console.log('🔍 API 연결 테스트 시작...');
        
        try {
            const testCountries = ['South Korea', 'Japan', 'United States'];
            const results = [];
            
            for (const country of testCountries) {
                const startTime = performance.now();
                
                const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ country }),
                    signal: AbortSignal.timeout(10000)
                });
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                if (response.ok) {
                    const data = await response.json();
                    results.push({
                        country,
                        success: true,
                        cityCount: data.data ? data.data.length : 0,
                        duration: Math.round(duration),
                        status: response.status
                    });
                } else {
                    results.push({
                        country,
                        success: false,
                        error: `HTTP ${response.status}`,
                        duration: Math.round(duration)
                    });
                }
            }
            
            this.testResults.push({
                test: 'API 연결 테스트',
                success: results.every(r => r.success),
                details: results
            });
            
            console.log('✅ API 연결 테스트 완료:', results);
            
        } catch (error) {
            this.testResults.push({
                test: 'API 연결 테스트',
                success: false,
                error: error.message
            });
            console.error('❌ API 연결 테스트 실패:', error);
        }
    }
    
    /**
     * 도시 데이터 로드 테스트
     */
    async testCityDataLoading() {
        console.log('🔍 도시 데이터 로드 테스트 시작...');
        
        try {
            // CitySelector 인스턴스 생성
            const citySelector = new CitySelector(this.testContainer, {
                placeholder: '도시를 검색하세요...'
            });
            
            // 테스트용 국가 데이터
            const testCountry = {
                nameEn: 'South Korea',
                nameKo: '대한민국',
                code: 'KR'
            };
            
            // 도시 데이터 로드
            await citySelector.setCountry(testCountry);
            
            // 결과 검증
            const hasCities = citySelector.filteredCities && citySelector.filteredCities.length > 0;
            const hasSeoul = citySelector.filteredCities.some(city => 
                city.nameEn.toLowerCase().includes('seoul') || 
                city.name.toLowerCase().includes('서울')
            );
            
            this.testResults.push({
                test: '도시 데이터 로드 테스트',
                success: hasCities && hasSeoul,
                details: {
                    cityCount: citySelector.filteredCities.length,
                    hasSeoul,
                    cities: citySelector.filteredCities.slice(0, 5) // 처음 5개만
                }
            });
            
            console.log('✅ 도시 데이터 로드 테스트 완료');
            
            // 정리
            citySelector.cleanup();
            
        } catch (error) {
            this.testResults.push({
                test: '도시 데이터 로드 테스트',
                success: false,
                error: error.message
            });
            console.error('❌ 도시 데이터 로드 테스트 실패:', error);
        }
    }
    
    /**
     * 검색 기능 테스트
     */
    async testSearchFunctionality() {
        console.log('🔍 검색 기능 테스트 시작...');
        
        try {
            const citySelector = new CitySelector(this.testContainer, {
                placeholder: '도시를 검색하세요...'
            });
            
            // 테스트용 국가 설정
            await citySelector.setCountry({
                nameEn: 'Japan',
                nameKo: '일본',
                code: 'JP'
            });
            
            // 검색 테스트
            const searchTests = [
                { query: 'tokyo', expected: true },
                { query: '도쿄', expected: true },
                { query: 'osaka', expected: true },
                { query: 'nonexistent', expected: false }
            ];
            
            const searchResults = [];
            
            for (const test of searchTests) {
                citySelector.search(test.query);
                const hasResults = citySelector.filteredCities.length > 0;
                searchResults.push({
                    query: test.query,
                    expected: test.expected,
                    actual: hasResults,
                    success: hasResults === test.expected,
                    resultCount: citySelector.filteredCities.length
                });
            }
            
            const allSearchTestsPassed = searchResults.every(r => r.success);
            
            this.testResults.push({
                test: '검색 기능 테스트',
                success: allSearchTestsPassed,
                details: searchResults
            });
            
            console.log('✅ 검색 기능 테스트 완료:', searchResults);
            
            // 정리
            citySelector.cleanup();
            
        } catch (error) {
            this.testResults.push({
                test: '검색 기능 테스트',
                success: false,
                error: error.message
            });
            console.error('❌ 검색 기능 테스트 실패:', error);
        }
    }
    
    /**
     * 에러 처리 테스트
     */
    async testErrorHandling() {
        console.log('🔍 에러 처리 테스트 시작...');
        
        try {
            const citySelector = new CitySelector(this.testContainer, {
                placeholder: '도시를 검색하세요...'
            });
            
            // 잘못된 국가명으로 테스트
            await citySelector.setCountry({
                nameEn: 'InvalidCountryName123',
                nameKo: '존재하지 않는 국가',
                code: 'XX'
            });
            
            // 폴백 데이터 확인
            const hasFallbackData = citySelector.filteredCities && citySelector.filteredCities.length > 0;
            
            // 비활성화 상태 테스트
            citySelector.disable();
            const isDisabled = citySelector.options.disabled && citySelector.input.disabled;
            
            this.testResults.push({
                test: '에러 처리 테스트',
                success: hasFallbackData && isDisabled,
                details: {
                    hasFallbackData,
                    isDisabled,
                    fallbackCityCount: citySelector.filteredCities.length
                }
            });
            
            console.log('✅ 에러 처리 테스트 완료');
            
            // 정리
            citySelector.cleanup();
            
        } catch (error) {
            this.testResults.push({
                test: '에러 처리 테스트',
                success: false,
                error: error.message
            });
            console.error('❌ 에러 처리 테스트 실패:', error);
        }
    }
    
    /**
     * 테스트 결과 출력
     */
    printTestResults() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;
        
        console.log('\n📊 테스트 결과 요약:');
        console.log(`총 테스트: ${totalTests}`);
        console.log(`성공: ${passedTests}`);
        console.log(`실패: ${failedTests}`);
        console.log(`성공률: ${Math.round((passedTests / totalTests) * 100)}%`);
        
        console.log('\n📋 상세 결과:');
        this.testResults.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${result.test}`);
            if (result.details) {
                console.log('   상세:', result.details);
            }
            if (result.error) {
                console.log('   에러:', result.error);
            }
        });
        
        // 테스트 컨테이너에 결과 표시
        this.testContainer.innerHTML = `
            <h3>🧪 CitySelector API 테스트 결과</h3>
            <div style="margin: 10px 0;">
                <strong>총 테스트:</strong> ${totalTests}<br>
                <strong>성공:</strong> ${passedTests}<br>
                <strong>실패:</strong> ${failedTests}<br>
                <strong>성공률:</strong> ${Math.round((passedTests / totalTests) * 100)}%
            </div>
            <div style="max-height: 200px; overflow-y: auto;">
                ${this.testResults.map((result, index) => `
                    <div style="margin: 5px 0; padding: 5px; border-left: 3px solid ${result.success ? 'green' : 'red'};">
                        <strong>${index + 1}. ${result.success ? '✅' : '❌'} ${result.test}</strong>
                        ${result.details ? `<br><small>${JSON.stringify(result.details, null, 2)}</small>` : ''}
                        ${result.error ? `<br><small style="color: red;">에러: ${result.error}</small>` : ''}
                    </div>
                `).join('')}
            </div>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px;">닫기</button>
        `;
    }
    
    /**
     * 정리
     */
    cleanup() {
        if (this.testContainer && this.testContainer.parentNode) {
            // 5초 후 자동 제거
            setTimeout(() => {
                if (this.testContainer && this.testContainer.parentNode) {
                    this.testContainer.parentNode.removeChild(this.testContainer);
                }
            }, 5000);
        }
    }
}

/**
 * 테스트 실행 함수
 */
export function runCitySelectorAPITest() {
    const tester = new CitySelectorAPITest();
    return tester.runTests();
}

// 자동 실행 (개발 환경에서만)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 개발 환경 감지 - CitySelector API 테스트 준비됨');
    console.log('테스트 실행: runCitySelectorAPITest()');
    
    // 전역 함수로 등록
    window.runCitySelectorAPITest = runCitySelectorAPITest;
}
