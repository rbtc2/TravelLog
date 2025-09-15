/**
 * 캘린더 바 형태 시스템 사용 예제
 * 새로운 바 형태 멀티 라인 시스템의 사용법을 보여줍니다.
 */

import { CalendarRenderer } from '../modules/calendar/CalendarRenderer.js';
import { CalendarDataManager } from '../modules/calendar/CalendarDataManager.js';
import { continentColorManager } from '../modules/calendar/ContinentColorManager.js';

/**
 * 바 형태 시스템 사용 예제
 */
class CalendarBarSystemExample {
    constructor() {
        this.dataManager = new CalendarDataManager();
        this.renderer = null;
        this.container = null;
    }

    /**
     * 예제 초기화
     * @param {HTMLElement} container - 캘린더 컨테이너
     */
    async initialize(container) {
        this.container = container;
        
        // 데이터 매니저 초기화
        await this.dataManager.initializeCountriesManager();
        await this.dataManager.loadTravelLogs();
        
        // 렌더러 초기화 (바 형태 시스템 사용)
        this.renderer = new CalendarRenderer(container, this.dataManager);
        this.renderer.setBarSystem(true); // 바 형태 시스템 활성화
        
        // 캘린더 렌더링
        this.renderer.renderContent(new Date(), 'month');
        
        console.log('바 형태 시스템이 활성화되었습니다.');
        console.log('현재 시스템:', this.renderer.getCurrentSystem());
    }

    /**
     * 레거시 시스템으로 전환
     */
    switchToLegacySystem() {
        if (this.renderer) {
            this.renderer.setBarSystem(false);
            this.renderer.renderContent(new Date(), 'month');
            console.log('레거시 시스템으로 전환되었습니다.');
        }
    }

    /**
     * 바 형태 시스템으로 전환
     */
    switchToBarSystem() {
        if (this.renderer) {
            this.renderer.setBarSystem(true);
            this.renderer.renderContent(new Date(), 'month');
            console.log('바 형태 시스템으로 전환되었습니다.');
        }
    }

    /**
     * 대륙별 색상 정보 출력
     */
    showContinentColors() {
        const colors = continentColorManager.getAllContinentColors(false); // 라이트 모드
        const darkColors = continentColorManager.getAllContinentColors(true); // 다크 모드
        
        console.log('대륙별 색상 정보:');
        console.table(colors);
        
        console.log('다크모드 대륙별 색상 정보:');
        console.table(darkColors);
    }

    /**
     * 특정 국가의 대륙과 색상 정보 조회
     * @param {string} country - 국가 코드 또는 국가명
     */
    getCountryInfo(country) {
        const continent = continentColorManager.getContinent(country);
        const lightColor = continentColorManager.getCountryColor(country, false);
        const darkColor = continentColorManager.getCountryColor(country, true);
        
        console.log(`${country} 정보:`);
        console.log(`- 대륙: ${continent}`);
        console.log(`- 라이트 모드 색상: ${lightColor}`);
        console.log(`- 다크 모드 색상: ${darkColor}`);
        
        return {
            country,
            continent,
            lightColor,
            darkColor
        };
    }

    /**
     * 성능 테스트
     */
    async performanceTest() {
        console.log('성능 테스트 시작...');
        
        const startTime = performance.now();
        
        // 100번 렌더링 테스트
        for (let i = 0; i < 100; i++) {
            this.renderer.renderContent(new Date(), 'month');
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`100번 렌더링 완료: ${duration.toFixed(2)}ms`);
        console.log(`평균 렌더링 시간: ${(duration / 100).toFixed(2)}ms`);
        
        return duration;
    }

    /**
     * 시스템 비교 테스트
     */
    async compareSystems() {
        console.log('시스템 비교 테스트 시작...');
        
        // 바 형태 시스템 테스트
        this.renderer.setBarSystem(true);
        const barSystemTime = await this.performanceTest();
        
        // 레거시 시스템 테스트
        this.renderer.setBarSystem(false);
        const legacySystemTime = await this.performanceTest();
        
        console.log('=== 시스템 비교 결과 ===');
        console.log(`바 형태 시스템: ${barSystemTime.toFixed(2)}ms`);
        console.log(`레거시 시스템: ${legacySystemTime.toFixed(2)}ms`);
        console.log(`성능 차이: ${(barSystemTime - legacySystemTime).toFixed(2)}ms`);
        
        return {
            barSystem: barSystemTime,
            legacySystem: legacySystemTime,
            difference: barSystemTime - legacySystemTime
        };
    }

    /**
     * 반응형 테스트
     */
    testResponsive() {
        console.log('반응형 테스트 시작...');
        
        const breakpoints = [
            { width: 1920, name: '대형 데스크톱' },
            { width: 1024, name: '데스크톱' },
            { width: 768, name: '태블릿' },
            { width: 480, name: '모바일' },
            { width: 360, name: '소형 모바일' }
        ];
        
        breakpoints.forEach(breakpoint => {
            // 가상으로 화면 크기 변경
            const originalWidth = window.innerWidth;
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: breakpoint.width
            });
            
            // 렌더링 테스트
            this.renderer.renderContent(new Date(), 'month');
            
            console.log(`${breakpoint.name} (${breakpoint.width}px): 렌더링 완료`);
            
            // 원래 크기로 복원
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: originalWidth
            });
        });
    }

    /**
     * 다크모드 테스트
     */
    testDarkMode() {
        console.log('다크모드 테스트 시작...');
        
        // 라이트 모드 테스트
        document.documentElement.classList.remove('dark');
        this.renderer.renderContent(new Date(), 'month');
        console.log('라이트 모드 렌더링 완료');
        
        // 다크 모드 테스트
        document.documentElement.classList.add('dark');
        this.renderer.renderContent(new Date(), 'month');
        console.log('다크 모드 렌더링 완료');
        
        // 원래 상태로 복원
        document.documentElement.classList.remove('dark');
    }

    /**
     * 정리
     */
    cleanup() {
        if (this.renderer) {
            this.renderer.clearCache();
        }
        if (this.dataManager) {
            this.dataManager.clear();
        }
        console.log('예제 정리 완료');
    }
}

// 전역에서 사용할 수 있도록 export
export default CalendarBarSystemExample;

// 사용 예제
/*
// HTML에서 사용하는 방법:
const example = new CalendarBarSystemExample();
await example.initialize(document.getElementById('calendar-container'));

// 시스템 전환
example.switchToBarSystem();     // 바 형태 시스템으로 전환
example.switchToLegacySystem();  // 레거시 시스템으로 전환

// 대륙별 색상 정보 확인
example.showContinentColors();
example.getCountryInfo('KR');    // 한국 정보
example.getCountryInfo('JP');    // 일본 정보

// 성능 테스트
await example.performanceTest();
await example.compareSystems();

// 반응형 테스트
example.testResponsive();

// 다크모드 테스트
example.testDarkMode();

// 정리
example.cleanup();
*/
