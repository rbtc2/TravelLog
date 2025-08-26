/**
 * 로그 데이터 서비스 모듈
 * 로그의 CRUD 작업을 담당하는 비즈니스 로직
 */

export class LogService {
    constructor() {
        this.logs = [];
        this.currentPage = 1;
        this.logsPerPage = 10;
    }
    
    /**
     * 모든 로그를 가져옵니다
     * @returns {Array} 로그 배열
     */
    getAllLogs() {
        return this.logs;
    }
    
    /**
     * 페이지네이션된 로그를 가져옵니다
     * @param {number} page - 페이지 번호
     * @param {number} perPage - 페이지당 로그 수
     * @returns {Object} 페이지네이션 정보와 로그 배열
     */
    getLogsByPage(page = 1, perPage = 10) {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const currentLogs = this.logs.slice(startIndex, endIndex);
        const totalPages = Math.ceil(this.logs.length / perPage);
        
        return {
            logs: currentLogs,
            currentPage: page,
            totalPages,
            totalLogs: this.logs.length,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
    }
    
    /**
     * 특정 ID의 로그를 가져옵니다
     * @param {string} logId - 로그 ID
     * @returns {Object|null} 로그 객체 또는 null
     */
    getLogById(logId) {
        return this.logs.find(log => log.id === logId) || null;
    }
    
    /**
     * 새로운 로그를 추가합니다
     * @param {Object} logData - 로그 데이터
     * @returns {Object} 생성된 로그 객체
     */
    createLog(logData) {
        const newLog = {
            id: Date.now().toString(),
            ...logData,
            createdAt: new Date().toISOString(),
            updatedAt: null
        };
        
        this.logs.unshift(newLog); // 맨 앞에 추가
        return newLog;
    }
    
    /**
     * 로그를 업데이트합니다
     * @param {string} logId - 업데이트할 로그 ID
     * @param {Object} updateData - 업데이트할 데이터
     * @returns {Object|null} 업데이트된 로그 객체 또는 null
     */
    updateLog(logId, updateData) {
        console.log('LogService: updateLog 호출됨', { logId, updateData });
        
        const existingLog = this.logs.find(log => log.id === logId);
        if (!existingLog) {
            console.error('LogService: 기존 로그를 찾을 수 없음', logId);
            return null;
        }
        
        const updatedLog = {
            ...existingLog,
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        
        const index = this.logs.findIndex(log => log.id === logId);
        this.logs[index] = updatedLog;
        
        console.log('LogService: 로그 업데이트 완료', updatedLog);
        return updatedLog;
    }
    
    /**
     * 로그를 삭제합니다
     * @param {string} logId - 삭제할 로그 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteLog(logId) {
        const initialLength = this.logs.length;
        this.logs = this.logs.filter(log => log.id !== logId);
        return this.logs.length < initialLength;
    }
    
    /**
     * 로그를 날짜순으로 정렬합니다
     * @param {string} order - 정렬 순서 ('asc' 또는 'desc')
     */
    sortLogsByDate(order = 'desc') {
        this.logs.sort((a, b) => {
            const dateA = new Date(a.startDate);
            const dateB = new Date(b.startDate);
            return order === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }
    
    /**
     * 로그를 평점순으로 정렬합니다
     * @param {string} order - 정렬 순서 ('asc' 또는 'desc')
     */
    sortLogsByRating(order = 'desc') {
        this.logs.sort((a, b) => {
            const ratingA = parseInt(a.rating) || 0;
            const ratingB = parseInt(b.rating) || 0;
            return order === 'asc' ? ratingA - ratingB : ratingB - ratingA;
        });
    }
    
    /**
     * 특정 국가의 로그를 필터링합니다
     * @param {string} country - 국가명
     * @returns {Array} 필터링된 로그 배열
     */
    filterLogsByCountry(country) {
        return this.logs.filter(log => 
            log.country.toLowerCase().includes(country.toLowerCase())
        );
    }
    
    /**
     * 특정 도시의 로그를 필터링합니다
     * @param {string} city - 도시명
     * @returns {Array} 필터링된 로그 배열
     */
    filterLogsByCity(city) {
        return this.logs.filter(log => 
            log.city.toLowerCase().includes(city.toLowerCase())
        );
    }
    
    /**
     * 특정 목적의 로그를 필터링합니다
     * @param {string} purpose - 여행 목적
     * @returns {Array} 필터링된 로그 배열
     */
    filterLogsByPurpose(purpose) {
        return this.logs.filter(log => log.purpose === purpose);
    }
    
    /**
     * 로그 통계를 계산합니다
     * @returns {Object} 통계 정보
     */
    getLogStats() {
        if (this.logs.length === 0) {
            return {
                totalLogs: 0,
                totalCountries: 0,
                totalCities: 0,
                averageRating: 0,
                averageDuration: 0
            };
        }
        
        const countries = new Set(this.logs.map(log => log.country));
        const cities = new Set(this.logs.map(log => log.city));
        
        const totalRating = this.logs.reduce((sum, log) => sum + (parseInt(log.rating) || 0), 0);
        const averageRating = totalRating / this.logs.length;
        
        const totalDuration = this.logs.reduce((sum, log) => {
            const start = new Date(log.startDate);
            const end = new Date(log.endDate);
            const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return sum + duration;
        }, 0);
        const averageDuration = totalDuration / this.logs.length;
        
        return {
            totalLogs: this.logs.length,
            totalCountries: countries.size,
            totalCities: cities.size,
            averageRating: Math.round(averageRating * 10) / 10,
            averageDuration: Math.round(averageDuration * 10) / 10
        };
    }
    
    /**
     * 로그 데이터를 설정합니다 (외부에서 로드된 데이터)
     * @param {Array} logs - 로그 배열
     */
    setLogs(logs) {
        this.logs = logs || [];
    }
    
    /**
     * 현재 페이지를 설정합니다
     * @param {number} page - 페이지 번호
     */
    setCurrentPage(page) {
        this.currentPage = Math.max(1, page);
    }
    
    /**
     * 페이지당 로그 수를 설정합니다
     * @param {number} perPage - 페이지당 로그 수
     */
    setLogsPerPage(perPage) {
        this.logsPerPage = Math.max(1, perPage);
    }
}
