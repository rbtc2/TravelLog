/**
 * 캘린더 데이터 관리 모듈
 * 여행 로그 데이터 로딩, 변환, 캐싱을 담당
 */

import { parseLocalDate, formatDateString } from './CalendarUtils.js';

export class CalendarDataManager {
    constructor() {
        this.travelLogs = new Map(); // 날짜별 여행 로그 데이터
        this.countries = new Map(); // 국가별 정보 캐시
        this.countriesManager = null; // CountriesManager 인스턴스
    }

    /**
     * CountriesManager 초기화
     */
    async initializeCountriesManager() {
        try {
            // CountriesManager 동적 import
            const { countriesManager } = await import('../../data/countries-manager.js');
            this.countriesManager = countriesManager;
            
            // 초기화
            if (!this.countriesManager.isInitialized) {
                await this.countriesManager.initialize();
            }
            
            console.log('CountriesManager 초기화 완료');
            return true;
        } catch (error) {
            console.warn('CountriesManager 초기화 실패, 폴백 모드로 동작:', error);
            return false;
        }
    }

    /**
     * 여행 로그 데이터 로드
     */
    async loadTravelLogs() {
        try {
            // StorageManager와 LogService 동적 import
            const { StorageManager } = await import('../utils/storage-manager.js');
            const { LogService } = await import('../services/log-service.js');
            
            const storageManager = new StorageManager();
            const logService = new LogService();
            
            // 저장된 로그 데이터 로드
            const savedLogs = storageManager.loadLogs();
            logService.setLogs(savedLogs);
            
            // 캘린더용 데이터 구조로 변환
            this.processTravelLogsForCalendar(logService.getAllLogs());
            
            console.log(`여행 로그 데이터 로드 완료: ${savedLogs.length}개`);
            return true;
        } catch (error) {
            console.warn('여행 로그 데이터 로드 실패:', error);
            return false;
        }
    }

    /**
     * 여행 로그를 캘린더용 데이터 구조로 변환
     * @param {Array} logs - 여행 로그 배열
     */
    processTravelLogsForCalendar(logs) {
        this.travelLogs.clear();
        
        logs.forEach(log => {
            // 날짜 문자열을 로컬 시간대로 정확히 파싱
            const startDate = parseLocalDate(log.startDate);
            const endDate = parseLocalDate(log.endDate);
            
            // 시작일부터 종료일까지 모든 날짜에 로그 추가
            for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                const dateString = formatDateString(date);
                
                if (!this.travelLogs.has(dateString)) {
                    this.travelLogs.set(dateString, []);
                }
                
                this.travelLogs.get(dateString).push(log);
            }
        });
    }

    /**
     * 특정 날짜에 여행 로그가 있는지 확인
     * @param {Date} date - 확인할 날짜
     * @returns {boolean} 여행 로그 존재 여부
     */
    hasTravelLogForDate(date) {
        const dateString = formatDateString(date);
        return this.travelLogs.has(dateString) && this.travelLogs.get(dateString).length > 0;
    }

    /**
     * 특정 날짜의 여행 로그를 가져옵니다
     * @param {Date} date - 조회할 날짜
     * @returns {Array} 해당 날짜의 여행 로그 배열
     */
    getTravelLogsForDate(date) {
        const dateString = formatDateString(date);
        const logs = this.travelLogs.get(dateString) || [];
        
        // 여행 기간 계산 및 정렬
        return logs.map(log => {
            const startDate = parseLocalDate(log.startDate);
            const endDate = parseLocalDate(log.endDate);
            const currentDate = new Date(date);
            
            // 여행 기간 내에서의 일차 계산 (로컬 시간 기준)
            const dayOfTrip = Math.ceil((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            
            return {
                ...log,
                dayOfTrip: Math.max(1, dayOfTrip),
                totalDays: Math.max(1, totalDays),
                isStartDay: formatDateString(currentDate) === formatDateString(startDate),
                isEndDay: formatDateString(currentDate) === formatDateString(endDate),
                isMiddleDay: currentDate > startDate && currentDate < endDate
            };
        }).sort((a, b) => {
            // 우선순위: 시작일 > 중간일 > 종료일
            if (a.isStartDay && !b.isStartDay) return -1;
            if (!a.isStartDay && b.isStartDay) return 1;
            if (a.isEndDay && !b.isEndDay) return 1;
            if (!a.isEndDay && b.isEndDay) return -1;
            return 0;
        });
    }

    /**
     * 여행 로그 데이터 업데이트 (향후 API 연동)
     * @param {Array} logs - 여행 로그 배열
     */
    updateTravelLogs(logs) {
        this.travelLogs.clear();
        
        logs.forEach(log => {
            const startDate = new Date(log.startDate);
            const endDate = new Date(log.endDate);
            
            // 시작일부터 종료일까지 모든 날짜에 로그 추가
            for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                const dateString = date.toISOString().split('T')[0];
                
                if (!this.travelLogs.has(dateString)) {
                    this.travelLogs.set(dateString, []);
                }
                
                this.travelLogs.get(dateString).push(log);
            }
        });
    }

    /**
     * 모든 여행 로그 데이터 반환
     * @returns {Map} 날짜별 여행 로그 Map
     */
    getAllTravelLogs() {
        return this.travelLogs;
    }

    /**
     * 특정 날짜 범위의 여행 로그 반환
     * @param {Date} startDate - 시작 날짜
     * @param {Date} endDate - 종료 날짜
     * @returns {Array} 해당 기간의 여행 로그 배열
     */
    getTravelLogsInRange(startDate, endDate) {
        const logs = [];
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateString = formatDateString(date);
            const dayLogs = this.travelLogs.get(dateString) || [];
            logs.push(...dayLogs);
        }
        return logs;
    }

    /**
     * 데이터 정리
     */
    clear() {
        this.travelLogs.clear();
        this.countries.clear();
        this.countriesManager = null;
    }

    /**
     * CountriesManager 인스턴스 반환
     * @returns {Object|null} CountriesManager 인스턴스
     */
    getCountriesManager() {
        return this.countriesManager;
    }
}
