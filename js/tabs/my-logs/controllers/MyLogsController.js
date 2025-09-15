/**
 * MyLogsController - 나의 로그 탭의 비즈니스 로직을 담당하는 컨트롤러
 * 
 * 🎯 책임:
 * - 로그 데이터 CRUD 작업
 * - 데이터 마이그레이션
 * - 상태 관리
 * - 이벤트 처리
 * 
 * @class MyLogsController
 */
import { LogService } from '../../../modules/services/log-service.js';
import { StorageManager } from '../../../modules/utils/storage-manager.js';
import { DemoData } from '../../../modules/utils/demo-data.js';
import { countriesManager } from '../../../data/countries-manager.js';

class MyLogsController {
    constructor() {
        this.logService = new LogService();
        this.storageManager = new StorageManager();
        this.isInitialized = false;
        
        // 캐싱을 위한 속성들
        this._purposeAnalysisCache = null;
        this._basicStatsCache = null;
        this._lastDataHash = null;
    }

    /**
     * 컨트롤러 초기화
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // CountriesManager 초기화
            if (!countriesManager.isInitialized) {
                await countriesManager.initialize();
            }
            
            // 데이터 로드
            await this.loadLogs();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('MyLogsController 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 로그 데이터를 로드합니다
     */
    async loadLogs() {
        try {
            // 데이터 마이그레이션 실행
            this.migratePurposeData();
            
            // StorageManager를 사용하여 데이터 로드
            const storedLogs = this.storageManager.loadLogs();
            
            // LogService에 데이터 설정
            this.logService.setLogs(storedLogs);
            
            // 데모 데이터가 없으면 샘플 데이터 추가
            if (this.logService.getAllLogs().length === 0) {
                this.addDemoData();
            }
            
            // 날짜 순으로 정렬 (최신이 맨 위)
            this.logService.sortLogsByDate('desc');
        } catch (error) {
            console.error('일지 데이터 로드 실패:', error);
            this.logService.setLogs([]);
            throw error;
        }
    }

    /**
     * 목적 데이터 마이그레이션 (relocation -> immigration)
     */
    migratePurposeData() {
        try {
            const storedLogs = this.storageManager.loadLogs();
            let hasChanges = false;
            
            const migratedLogs = storedLogs.map(log => {
                if (log.purpose === 'relocation') {
                    hasChanges = true;
                    return {
                        ...log,
                        purpose: 'immigration',
                        updatedAt: new Date().toISOString()
                    };
                }
                return log;
            });
            
            if (hasChanges) {
                this.storageManager.saveLogs(migratedLogs);
                console.log('목적 데이터 마이그레이션 완료: relocation -> immigration');
            }
        } catch (error) {
            console.error('목적 데이터 마이그레이션 실패:', error);
        }
    }

    /**
     * 데모 데이터를 추가합니다
     */
    addDemoData() {
        const demoLogs = DemoData.getDefaultLogs();
        this.logService.setLogs(demoLogs);
        this.storageManager.saveLogs(demoLogs);
    }

    /**
     * 새로운 로그를 추가합니다
     * @param {Object} logData - 로그 데이터
     * @returns {Object} 생성된 로그
     */
    addLog(logData) {
        const newLog = this.logService.createLog(logData);
        this.storageManager.saveLogs(this.logService.getAllLogs());
        this.invalidateCache(); // 캐시 무효화
        return newLog;
    }

    /**
     * 로그를 삭제합니다
     * @param {string} logId - 삭제할 로그 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteLog(logId) {
        const deleted = this.logService.deleteLog(logId);
        
        if (deleted) {
            this.storageManager.saveLogs(this.logService.getAllLogs());
            this.invalidateCache(); // 캐시 무효화
            
            // 현재 페이지가 비어있고 이전 페이지가 있으면 이전 페이지로 이동
            const totalPages = Math.ceil(this.logService.getAllLogs().length / this.logService.logsPerPage);
            if (this.logService.currentPage > totalPages && totalPages > 0) {
                this.logService.setCurrentPage(totalPages);
            }
        }
        
        return deleted;
    }

    /**
     * 로그를 업데이트합니다
     * @param {string} logId - 업데이트할 로그 ID
     * @param {Object} updatedData - 업데이트할 데이터
     * @returns {Object|null} 업데이트된 로그 또는 null
     */
    updateLog(logId, updatedData) {
        const updatedLog = this.logService.updateLog(logId, updatedData);
        
        if (updatedLog) {
            this.storageManager.saveLogs(this.logService.getAllLogs());
            this.invalidateCache(); // 캐시 무효화
        }
        
        return updatedLog;
    }

    /**
     * ID로 로그를 조회합니다
     * @param {string} logId - 로그 ID
     * @returns {Object|null} 로그 객체 또는 null
     */
    getLogById(logId) {
        return this.logService.getLogById(logId);
    }

    /**
     * 모든 로그를 조회합니다
     * @returns {Array} 로그 배열
     */
    getAllLogs() {
        return this.logService.getAllLogs();
    }

    /**
     * 페이지별 로그를 조회합니다
     * @param {number} page - 페이지 번호
     * @param {number} perPage - 페이지당 항목 수
     * @returns {Object} 페이지 데이터
     */
    getLogsByPage(page, perPage) {
        return this.logService.getLogsByPage(page, perPage);
    }

    /**
     * 현재 페이지를 설정합니다
     * @param {number} page - 페이지 번호
     */
    setCurrentPage(page) {
        this.logService.setCurrentPage(page);
    }

    /**
     * 로그를 정렬합니다
     * @param {string} order - 정렬 순서 ('asc' 또는 'desc')
     */
    sortLogsByDate(order) {
        this.logService.sortLogsByDate(order);
    }

    /**
     * 국가 코드로 국가 정보를 조회합니다
     * @param {string} countryCode - 국가 코드
     * @returns {Object|null} 국가 정보 또는 null
     */
    getCountryByCode(countryCode) {
        try {
            if (!countriesManager.isInitialized) {
                console.warn('CountriesManager가 초기화되지 않았습니다.');
                return null;
            }
            return countriesManager.getCountryByCode(countryCode);
        } catch (error) {
            console.error('국가 정보 조회 중 오류:', error);
            return null;
        }
    }

    /**
     * 기본 통계를 계산합니다
     * @returns {Object} 기본 통계 정보
     */
    getBasicStats() {
        try {
            const logs = this.getAllLogs();
            
            if (!logs || logs.length === 0) {
                return {
                    visitedCountries: 0,
                    visitedCities: 0,
                    totalTravelDays: 0,
                    averageRating: 0,
                    hasData: false
                };
            }

            // 방문 국가 수 계산
            const uniqueCountries = new Set();
            const uniqueCities = new Set();
            let totalTravelDays = 0;
            let totalRating = 0;
            let validRatingCount = 0;

            logs.forEach(log => {
                // 국가와 도시 수집
                if (log.country) {
                    uniqueCountries.add(log.country.trim());
                }
                if (log.city) {
                    uniqueCities.add(log.city.trim());
                }

                // 여행 일수 계산
                if (log.startDate && log.endDate) {
                    try {
                        const startDate = new Date(log.startDate);
                        const endDate = new Date(log.endDate);
                        
                        // 유효한 날짜인지 확인
                        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                            const timeDiff = endDate.getTime() - startDate.getTime();
                            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
                            
                            // 음수가 아닌 유효한 일수만 추가
                            if (daysDiff > 0) {
                                totalTravelDays += daysDiff;
                            }
                        }
                    } catch (dateError) {
                        console.warn('날짜 계산 오류:', dateError, log);
                    }
                }

                // 평점 계산
                if (log.rating && !isNaN(parseFloat(log.rating))) {
                    const rating = parseFloat(log.rating);
                    if (rating >= 0 && rating <= 5) {
                        totalRating += rating;
                        validRatingCount++;
                    }
                }
            });

            const averageRating = validRatingCount > 0 ? totalRating / validRatingCount : 0;

            return {
                visitedCountries: uniqueCountries.size,
                visitedCities: uniqueCities.size,
                totalTravelDays: totalTravelDays,
                averageRating: Math.round(averageRating * 10) / 10,
                hasData: true
            };

        } catch (error) {
            console.error('기본 통계 계산 중 오류:', error);
            return {
                visitedCountries: 0,
                visitedCities: 0,
                totalTravelDays: 0,
                averageRating: 0,
                hasData: false
            };
        }
    }

    /**
     * 특정 연도의 여행 데이터를 가져옵니다
     * @param {string} year - 연도
     * @returns {Object} 해당 연도의 여행 데이터
     */
    getTravelDataByYear(year) {
        try {
            const allLogs = this.getAllLogs();
            const yearInt = parseInt(year);
            
            // 해당 연도의 로그만 필터링
            const yearLogs = allLogs.filter(log => {
                const logDate = new Date(log.startDate);
                return logDate.getFullYear() === yearInt;
            });
            
            return {
                year: year,
                logs: yearLogs,
                totalLogs: yearLogs.length,
                hasData: yearLogs.length > 0
            };
        } catch (error) {
            console.error('연도별 여행 데이터 조회 중 오류:', error);
            return {
                year: year,
                logs: [],
                totalLogs: 0,
                hasData: false
            };
        }
    }

    /**
     * 여행 목적별 비율을 분석합니다 (캐싱 적용)
     * @returns {Object} 목적별 분석 결과
     */
    getPurposeAnalysis() {
        try {
            // 데이터 해시 계산 (캐시 무효화 확인용)
            const currentDataHash = this._calculateDataHash();
            
            // 캐시가 유효한 경우 캐시된 결과 반환
            if (this._purposeAnalysisCache && this._lastDataHash === currentDataHash) {
                return this._purposeAnalysisCache;
            }

            const logs = this.getAllLogs();
            
            if (!logs || logs.length === 0) {
                const result = {
                    hasData: false,
                    totalLogs: 0,
                    purposeBreakdown: [],
                    topPurposes: [],
                    summary: '아직 여행 기록이 없습니다'
                };
                
                // 캐시에 저장
                this._purposeAnalysisCache = result;
                this._lastDataHash = currentDataHash;
                return result;
            }

            // 목적별 카운트 계산
            const purposeCounts = {};
            logs.forEach(log => {
                if (log.purpose) {
                    purposeCounts[log.purpose] = (purposeCounts[log.purpose] || 0) + 1;
                }
            });

            // 비율 계산 및 정렬
            const purposeBreakdown = Object.entries(purposeCounts)
                .map(([purpose, count]) => ({
                    purpose: purpose,
                    count: count,
                    percentage: Math.round((count / logs.length) * 100)
                }))
                .sort((a, b) => b.count - a.count);

            // 상위 목적들 (5% 이상인 것들만)
            const topPurposes = purposeBreakdown
                .filter(item => item.percentage >= 5)
                .slice(0, 3); // 최대 3개

            // 요약 텍스트 생성
            let summary = '';
            if (topPurposes.length === 0) {
                summary = '여행 목적이 다양합니다';
            } else if (topPurposes.length === 1) {
                const purpose = this.getPurposeDisplayName(topPurposes[0].purpose);
                summary = `${purpose} ${topPurposes[0].percentage}%`;
            } else {
                const purposeTexts = topPurposes.map(item => 
                    `${this.getPurposeDisplayName(item.purpose)} ${item.percentage}%`
                );
                summary = purposeTexts.join(', ');
            }

            const result = {
                hasData: true,
                totalLogs: logs.length,
                purposeBreakdown: purposeBreakdown,
                topPurposes: topPurposes,
                summary: summary
            };

            // 캐시에 저장
            this._purposeAnalysisCache = result;
            this._lastDataHash = currentDataHash;
            
            return result;

        } catch (error) {
            console.error('목적 분석 중 오류:', error);
            return {
                hasData: false,
                totalLogs: 0,
                purposeBreakdown: [],
                topPurposes: [],
                summary: '데이터 분석 중 오류가 발생했습니다'
            };
        }
    }

    /**
     * 데이터 해시를 계산합니다 (캐시 무효화 확인용)
     * @returns {string} 데이터 해시
     */
    _calculateDataHash() {
        try {
            const logs = this.getAllLogs();
            const dataString = JSON.stringify(logs.map(log => ({
                id: log.id,
                purpose: log.purpose,
                startDate: log.startDate,
                endDate: log.endDate
            })));
            
            // 간단한 해시 함수 (실제 프로덕션에서는 더 정교한 해시 함수 사용)
            let hash = 0;
            for (let i = 0; i < dataString.length; i++) {
                const char = dataString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // 32비트 정수로 변환
            }
            return hash.toString();
        } catch (error) {
            console.error('데이터 해시 계산 중 오류:', error);
            return Date.now().toString(); // 폴백으로 현재 시간 사용
        }
    }

    /**
     * 목적 코드를 사용자 친화적인 이름으로 변환합니다
     * @param {string} purposeCode - 목적 코드
     * @returns {string} 표시 이름
     */
    getPurposeDisplayName(purposeCode) {
        const purposeNames = {
            'tourism': '관광/여행',
            'business': '업무/출장',
            'family': '가족/지인 방문',
            'study': '학업',
            'work': '취업/근로',
            'training': '파견/연수',
            'event': '행사/컨퍼런스',
            'volunteer': '봉사활동',
            'medical': '의료',
            'transit': '경유/환승',
            'research': '연구/학술',
            'immigration': '이주/정착',
            'other': '기타'
        };
        return purposeNames[purposeCode] || '기타';
    }

    /**
     * 캐시를 무효화합니다
     */
    invalidateCache() {
        this._purposeAnalysisCache = null;
        this._basicStatsCache = null;
        this._favoriteCountryCache = null;
        this._lastDataHash = null;
    }

    /**
     * 최애 국가 분석을 수행합니다
     * @returns {Object} 최애 국가 분석 결과
     */
    getFavoriteCountryAnalysis() {
        try {
            const currentDataHash = this._calculateDataHash();
            if (this._favoriteCountryCache && this._lastDataHash === currentDataHash) {
                return this._favoriteCountryCache;
            }

            const logs = this.getAllLogs();
            if (!logs || logs.length === 0) {
                const result = {
                    hasData: false,
                    totalLogs: 0,
                    countryStats: [],
                    favoriteCountry: null,
                    summary: '아직 여행 기록이 없습니다'
                };
                this._favoriteCountryCache = result;
                this._lastDataHash = currentDataHash;
                return result;
            }

            // 국가별 통계 계산
            const countryStats = this._calculateCountryStats(logs);
            
            // 5단계 우선순위로 정렬
            const sortedCountries = this._sortCountriesByPriority(countryStats);
            
            const favoriteCountry = sortedCountries.length > 0 ? sortedCountries[0] : null;
            
            let summary = '';
            if (favoriteCountry) {
                // TOP 3 랭킹 생성 (평균 별점 포함)
                const top3Countries = sortedCountries.slice(0, 3);
                const rankingItems = top3Countries.map((country, index) => {
                    const countryName = this._getCountryDisplayName(country.country);
                    const rank = index + 1;
                    const avgRating = country.averageRating > 0 ? country.averageRating.toFixed(1) : 'N/A';
                    return `${rank}위 ${countryName} (${country.visitCount}회 방문, 총 ${country.totalStayDays}일, ⭐${avgRating})`;
                });
                
                summary = rankingItems.join('\n');
            } else {
                summary = '아직 여행 기록이 없습니다';
            }

            const result = {
                hasData: true,
                totalLogs: logs.length,
                countryStats: countryStats,
                sortedCountries: sortedCountries,
                favoriteCountry: favoriteCountry,
                top3Countries: sortedCountries.slice(0, 3),
                summary: summary
            };

            this._favoriteCountryCache = result;
            this._lastDataHash = currentDataHash;
            return result;

        } catch (error) {
            console.error('최애 국가 분석 중 오류:', error);
            return {
                hasData: false,
                totalLogs: 0,
                countryStats: [],
                favoriteCountry: null,
                summary: '데이터 분석 중 오류가 발생했습니다'
            };
        }
    }

    /**
     * 국가별 통계를 계산합니다
     * @param {Array} logs - 여행 로그 배열
     * @returns {Array} 국가별 통계 배열
     */
    _calculateCountryStats(logs) {
        const countryMap = new Map();

        logs.forEach(log => {
            if (!log.country) return;

            const country = log.country;
            const startDate = new Date(log.startDate);
            const endDate = new Date(log.endDate);
            const rating = parseFloat(log.rating) || 0;

            // 유효한 날짜인지 확인
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;

            // 체류 일수 계산 (시작일과 종료일 포함)
            const stayDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

            if (!countryMap.has(country)) {
                countryMap.set(country, {
                    country: country,
                    visitCount: 0,
                    totalStayDays: 0,
                    totalRating: 0,
                    ratingCount: 0,
                    averageRating: 0,
                    lastVisitDate: null,
                    visits: []
                });
            }

            const stats = countryMap.get(country);
            stats.visitCount += 1;
            stats.totalStayDays += stayDays;
            stats.totalRating += rating;
            stats.ratingCount += 1;
            stats.averageRating = stats.totalRating / stats.ratingCount;
            
            // 최근 방문일 업데이트
            if (!stats.lastVisitDate || startDate > stats.lastVisitDate) {
                stats.lastVisitDate = startDate;
            }

            stats.visits.push({
                startDate: startDate,
                endDate: endDate,
                stayDays: stayDays,
                rating: rating
            });
        });

        return Array.from(countryMap.values());
    }

    /**
     * 5단계 우선순위로 국가를 정렬합니다
     * @param {Array} countryStats - 국가별 통계 배열
     * @returns {Array} 정렬된 국가 배열
     */
    _sortCountriesByPriority(countryStats) {
        return countryStats.sort((a, b) => {
            // 1단계: 방문 횟수 (내림차순)
            if (a.visitCount !== b.visitCount) {
                return b.visitCount - a.visitCount;
            }

            // 2단계: 총 체류 일수 (내림차순)
            if (a.totalStayDays !== b.totalStayDays) {
                return b.totalStayDays - a.totalStayDays;
            }

            // 3단계: 평균 별점 (내림차순)
            if (a.averageRating !== b.averageRating) {
                return b.averageRating - a.averageRating;
            }

            // 4단계: 최근 방문일 (내림차순)
            if (a.lastVisitDate && b.lastVisitDate) {
                if (a.lastVisitDate.getTime() !== b.lastVisitDate.getTime()) {
                    return b.lastVisitDate - a.lastVisitDate;
                }
            } else if (a.lastVisitDate && !b.lastVisitDate) {
                return -1;
            } else if (!a.lastVisitDate && b.lastVisitDate) {
                return 1;
            }

            // 5단계: 국가명 가나다순 (오름차순)
            return a.country.localeCompare(b.country, 'ko-KR');
        });
    }

    /**
     * 국가 코드를 표시명으로 변환합니다
     * @param {string} countryCode - 국가 코드
     * @returns {string} 국가 표시명
     */
    _getCountryDisplayName(countryCode) {
        // 국가 코드 매핑 (필요에 따라 확장)
        const countryNames = {
            'JP': '일본',
            'KR': '한국',
            'US': '미국',
            'GB': '영국',
            'FR': '프랑스',
            'DE': '독일',
            'IT': '이탈리아',
            'ES': '스페인',
            'CN': '중국',
            'TH': '태국',
            'SG': '싱가포르',
            'AU': '호주',
            'CA': '캐나다',
            'BR': '브라질',
            'IN': '인도',
            'RU': '러시아',
            'MX': '멕시코',
            'ID': '인도네시아',
            'TR': '터키',
            'EG': '이집트'
        };

        return countryNames[countryCode] || countryCode;
    }

    /**
     * 연도별 통계 분석을 수행합니다
     * @param {string} year - 분석할 연도
     * @returns {Object} 연도별 통계 분석 결과
     */
    getYearlyStatsAnalysis(year) {
        try {
            const currentYear = parseInt(year);
            const previousYear = currentYear - 1;
            
            // 현재 연도 데이터
            const currentYearData = this.getTravelDataByYear(currentYear.toString());
            const previousYearData = this.getTravelDataByYear(previousYear.toString());
            
            // 현재 연도 통계 계산
            const currentStats = this._calculateYearlyStats(currentYearData);
            
            // 전년도 통계 계산
            const previousStats = this._calculateYearlyStats(previousYearData);
            
            // 증감률 계산
            const changes = this._calculateYearlyChanges(currentStats, previousStats);
            
            const result = {
                year: currentYear,
                hasData: currentStats.totalTrips > 0,
                currentStats: currentStats,
                previousStats: previousStats,
                changes: changes,
                isFirstYear: previousStats.totalTrips === 0
            };

            return result;

        } catch (error) {
            console.error('연도별 통계 분석 중 오류:', error);
            return {
                year: parseInt(year),
                hasData: false,
                currentStats: this._getEmptyYearlyStats(),
                previousStats: this._getEmptyYearlyStats(),
                changes: this._getEmptyChanges(),
                isFirstYear: true
            };
        }
    }

    /**
     * 연도별 통계를 계산합니다
     * @param {Object} yearData - 연도별 데이터
     * @returns {Object} 연도별 통계
     */
    _calculateYearlyStats(yearData) {
        if (!yearData || !yearData.logs || yearData.logs.length === 0) {
            return this._getEmptyYearlyStats();
        }

        const logs = yearData.logs;
        
        // 고유 국가 및 도시 계산
        const uniqueCountries = new Set();
        const uniqueCities = new Set();
        
        let totalTravelDays = 0;
        let totalRating = 0;
        let validRatingCount = 0;

        logs.forEach(log => {
            if (log.country) uniqueCountries.add(log.country);
            if (log.city) uniqueCities.add(log.city);
            
            // 체류 일수 계산
            const startDate = new Date(log.startDate);
            const endDate = new Date(log.endDate);
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                const stayDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                totalTravelDays += stayDays;
            }
            
            // 별점 계산
            const rating = parseFloat(log.rating);
            if (rating > 0) {
                totalRating += rating;
                validRatingCount++;
            }
        });

        const averageTravelDays = logs.length > 0 ? Math.round(totalTravelDays / logs.length * 10) / 10 : 0;
        const averageRating = validRatingCount > 0 ? Math.round(totalRating / validRatingCount * 10) / 10 : 0;

        return {
            totalTrips: logs.length,
            uniqueCountries: uniqueCountries.size,
            uniqueCities: uniqueCities.size,
            totalTravelDays: totalTravelDays,
            averageTravelDays: averageTravelDays,
            averageRating: averageRating
        };
    }

    /**
     * 연도별 증감률을 계산합니다
     * @param {Object} currentStats - 현재 연도 통계
     * @param {Object} previousStats - 전년도 통계
     * @returns {Object} 증감률 정보
     */
    _calculateYearlyChanges(currentStats, previousStats) {
        const changes = {};
        
        // 각 지표별 증감률 계산
        const metrics = [
            'totalTrips', 'uniqueCountries', 'uniqueCities', 
            'totalTravelDays', 'averageTravelDays', 'averageRating'
        ];
        
        metrics.forEach(metric => {
            const current = currentStats[metric];
            const previous = previousStats[metric];
            
            if (previous === 0) {
                changes[metric] = {
                    type: 'first',
                    value: 0,
                    display: '첫 해 기록',
                    color: 'blue'
                };
            } else {
                const changeValue = current - previous;
                const changePercent = Math.round((changeValue / previous) * 100);
                
                // 평균 별점은 소수점 한 자리까지만 표시
                const formatChangeValue = (value) => {
                    if (metric === 'averageRating') {
                        return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
                    } else {
                        return value > 0 ? `+${value}개` : `${value}개`;
                    }
                };
                
                if (changeValue > 0) {
                    changes[metric] = {
                        type: 'positive',
                        value: changeValue,
                        percent: changePercent,
                        display: formatChangeValue(changeValue),
                        displayPercent: `+${changePercent}%`,
                        color: 'green'
                    };
                } else if (changeValue < 0) {
                    changes[metric] = {
                        type: 'negative',
                        value: changeValue,
                        percent: changePercent,
                        display: formatChangeValue(changeValue),
                        displayPercent: `${changePercent}%`,
                        color: 'red'
                    };
                } else {
                    changes[metric] = {
                        type: 'neutral',
                        value: 0,
                        percent: 0,
                        display: metric === 'averageRating' ? '0.0' : '0개',
                        displayPercent: '0%',
                        color: 'gray'
                    };
                }
            }
        });
        
        return changes;
    }

    /**
     * 빈 연도별 통계를 반환합니다
     * @returns {Object} 빈 통계 객체
     */
    _getEmptyYearlyStats() {
        return {
            totalTrips: 0,
            uniqueCountries: 0,
            uniqueCities: 0,
            totalTravelDays: 0,
            averageTravelDays: 0,
            averageRating: 0
        };
    }

    /**
     * 빈 증감률 정보를 반환합니다
     * @returns {Object} 빈 증감률 객체
     */
    _getEmptyChanges() {
        const changes = {};
        const metrics = [
            'totalTrips', 'uniqueCountries', 'uniqueCities', 
            'totalTravelDays', 'averageTravelDays', 'averageRating'
        ];
        
        metrics.forEach(metric => {
            changes[metric] = {
                type: 'first',
                value: 0,
                display: '첫 해 기록',
                color: 'blue'
            };
        });
        
        return changes;
    }

    /**
     * 사용 가능한 연도 목록을 반환합니다
     * @returns {Array} 연도 목록 (최신순)
     */
    getAvailableYears() {
        try {
            const logs = this.getAllLogs();
            if (!logs || logs.length === 0) {
                // 데이터가 없으면 현재 연도만 반환
                const currentYear = new Date().getFullYear();
                return [currentYear.toString()];
            }

            // 로그에서 연도 추출 (문자열로 저장)
            const years = new Set();
            logs.forEach(log => {
                if (log.startDate) {
                    const year = new Date(log.startDate).getFullYear();
                    if (!isNaN(year)) {
                        years.add(year.toString()); // 문자열로 저장
                    }
                }
            });

            // 연도 배열로 변환하고 최신순 정렬
            const yearArray = Array.from(years)
                .map(year => parseInt(year)) // 숫자로 변환하여 정렬
                .sort((a, b) => b - a) // 내림차순 정렬
                .map(year => year.toString()); // 다시 문자열로 변환
            
            // 현재 연도 확인
            const currentYear = new Date().getFullYear();
            const currentYearStr = currentYear.toString();
            
            // 현재 연도가 없으면 추가 (실제로 없는 경우만)
            if (!yearArray.includes(currentYearStr)) {
                yearArray.unshift(currentYearStr);
            }

            // 중복 제거 후 반환
            return [...new Set(yearArray)];

        } catch (error) {
            console.error('사용 가능한 연도 목록 조회 중 오류:', error);
            const currentYear = new Date().getFullYear();
            return [currentYear.toString()];
        }
    }

    /**
     * 컨트롤러 정리
     */
    cleanup() {
        this.isInitialized = false;
        this.logService.setLogs([]);
        this.logService.setCurrentPage(1);
        this.invalidateCache();
    }
}

export { MyLogsController };
