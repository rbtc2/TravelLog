/**
 * DateUtils - 날짜 관련 유틸리티 함수들을 제공
 * 
 * 🎯 책임:
 * - 날짜 검증 및 변환
 * - 날짜 계산 (여행 일수, 기간 등)
 * - 날짜 포맷팅
 * - 연도별 데이터 필터링
 * 
 * @class DateUtils
 * @version 1.0.0
 * @since 2024-12-29
 */
class DateUtils {
    /**
     * 날짜가 유효한지 확인합니다
     * @param {string|Date} date - 확인할 날짜
     * @returns {boolean} 유효한 날짜인지 여부
     */
    static isValidDate(date) {
        try {
            const dateObj = new Date(date);
            return !isNaN(dateObj.getTime()) && dateObj.getTime() > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * 두 날짜 사이의 일수를 계산합니다 (시작일과 종료일 포함)
     * @param {string|Date} startDate - 시작 날짜
     * @param {string|Date} endDate - 종료 날짜
     * @returns {number} 일수 (오류 시 0 반환)
     */
    static calculateDaysBetween(startDate, endDate) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (!this.isValidDate(start) || !this.isValidDate(end)) {
                return 0;
            }
            
            // 시작일과 종료일 포함하여 계산
            const timeDiff = end.getTime() - start.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
            
            // 음수가 아닌 유효한 일수만 반환
            return daysDiff > 0 ? daysDiff : 0;
        } catch (error) {
            console.warn('날짜 계산 오류:', error);
            return 0;
        }
    }

    /**
     * 여행 기간을 계산합니다 (더 정확한 계산)
     * @param {string|Date} startDate - 시작 날짜
     * @param {string|Date} endDate - 종료 날짜
     * @returns {Object} 여행 기간 정보
     */
    static calculateTravelDuration(startDate, endDate) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (!this.isValidDate(start) || !this.isValidDate(end)) {
                return {
                    days: 0,
                    nights: 0,
                    isValid: false,
                    error: '유효하지 않은 날짜입니다'
                };
            }
            
            if (end < start) {
                return {
                    days: 0,
                    nights: 0,
                    isValid: false,
                    error: '종료일이 시작일보다 이릅니다'
                };
            }
            
            const days = this.calculateDaysBetween(start, end);
            const nights = Math.max(0, days - 1);
            
            return {
                days: days,
                nights: nights,
                isValid: true,
                error: null
            };
        } catch (error) {
            return {
                days: 0,
                nights: 0,
                isValid: false,
                error: error.message
            };
        }
    }

    /**
     * 날짜를 특정 포맷으로 변환합니다
     * @param {string|Date} date - 변환할 날짜
     * @param {string} format - 포맷 ('YYYY-MM-DD', 'YYYY/MM/DD', 'korean' 등)
     * @returns {string} 포맷된 날짜 문자열
     */
    static formatDate(date, format = 'YYYY-MM-DD') {
        try {
            const dateObj = new Date(date);
            
            if (!this.isValidDate(dateObj)) {
                return '유효하지 않은 날짜';
            }
            
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            
            switch (format.toLowerCase()) {
                case 'yyyy-mm-dd':
                    return `${year}-${month}-${day}`;
                case 'yyyy/mm/dd':
                    return `${year}/${month}/${day}`;
                case 'korean':
                    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
                case 'short':
                    return `${month}/${day}`;
                case 'iso':
                    return dateObj.toISOString().split('T')[0];
                default:
                    return `${year}-${month}-${day}`;
            }
        } catch (error) {
            console.warn('날짜 포맷팅 오류:', error);
            return '포맷팅 오류';
        }
    }

    /**
     * 날짜에서 연도를 추출합니다
     * @param {string|Date} date - 날짜
     * @returns {number|null} 연도 (오류 시 null)
     */
    static getYear(date) {
        try {
            const dateObj = new Date(date);
            return this.isValidDate(dateObj) ? dateObj.getFullYear() : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * 로그 배열을 특정 연도로 필터링합니다
     * @param {Array} logs - 로그 배열
     * @param {number|string} year - 연도
     * @returns {Array} 필터링된 로그 배열
     */
    static filterLogsByYear(logs, year) {
        try {
            const targetYear = parseInt(year);
            if (isNaN(targetYear) || !Array.isArray(logs)) {
                return [];
            }
            
            return logs.filter(log => {
                if (!log.startDate) return false;
                const logYear = this.getYear(log.startDate);
                return logYear === targetYear;
            });
        } catch (error) {
            console.error('연도별 로그 필터링 오류:', error);
            return [];
        }
    }

    /**
     * 로그 배열에서 모든 연도를 추출합니다
     * @param {Array} logs - 로그 배열
     * @returns {Array} 연도 배열 (최신순 정렬)
     */
    static extractYearsFromLogs(logs) {
        try {
            if (!Array.isArray(logs)) {
                return [];
            }
            
            const years = new Set();
            logs.forEach(log => {
                if (log.startDate) {
                    const year = this.getYear(log.startDate);
                    if (year) {
                        years.add(year);
                    }
                }
            });
            
            // 연도 배열로 변환하고 최신순 정렬
            return Array.from(years)
                .sort((a, b) => b - a)
                .map(year => year.toString());
        } catch (error) {
            console.error('연도 추출 오류:', error);
            return [];
        }
    }

    /**
     * 현재 연도를 반환합니다
     * @returns {string} 현재 연도 (문자열)
     */
    static getCurrentYear() {
        return new Date().getFullYear().toString();
    }

    /**
     * 날짜 범위를 검증합니다
     * @param {string|Date} startDate - 시작 날짜
     * @param {string|Date} endDate - 종료 날짜
     * @returns {Object} 검증 결과
     */
    static validateDateRange(startDate, endDate) {
        const result = {
            isValid: false,
            errors: [],
            warnings: []
        };
        
        try {
            // 날짜 유효성 검사
            if (!this.isValidDate(startDate)) {
                result.errors.push('시작 날짜가 유효하지 않습니다');
            }
            
            if (!this.isValidDate(endDate)) {
                result.errors.push('종료 날짜가 유효하지 않습니다');
            }
            
            if (result.errors.length > 0) {
                return result;
            }
            
            const start = new Date(startDate);
            const end = new Date(endDate);
            const now = new Date();
            
            // 날짜 순서 검사
            if (end < start) {
                result.errors.push('종료 날짜가 시작 날짜보다 이릅니다');
            }
            
            // 미래 날짜 경고
            if (start > now) {
                result.warnings.push('시작 날짜가 미래입니다');
            }
            
            if (end > now) {
                result.warnings.push('종료 날짜가 미래입니다');
            }
            
            // 너무 긴 여행 기간 경고 (1년 이상)
            const duration = this.calculateDaysBetween(start, end);
            if (duration > 365) {
                result.warnings.push('여행 기간이 1년을 초과합니다');
            }
            
            result.isValid = result.errors.length === 0;
            return result;
            
        } catch (error) {
            result.errors.push(`날짜 검증 중 오류: ${error.message}`);
            return result;
        }
    }

    /**
     * 상대적 날짜 표현을 반환합니다 (예: "3일 전", "1개월 후")
     * @param {string|Date} date - 기준 날짜
     * @param {string|Date} baseDate - 비교 기준 날짜 (기본값: 현재 날짜)
     * @returns {string} 상대적 날짜 표현
     */
    static getRelativeDate(date, baseDate = new Date()) {
        try {
            const targetDate = new Date(date);
            const base = new Date(baseDate);
            
            if (!this.isValidDate(targetDate) || !this.isValidDate(base)) {
                return '유효하지 않은 날짜';
            }
            
            const diffMs = targetDate.getTime() - base.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffMonths = Math.floor(diffDays / 30);
            const diffYears = Math.floor(diffDays / 365);
            
            if (Math.abs(diffDays) === 0) {
                return '오늘';
            } else if (diffDays === 1) {
                return '내일';
            } else if (diffDays === -1) {
                return '어제';
            } else if (Math.abs(diffDays) < 30) {
                return diffDays > 0 ? `${diffDays}일 후` : `${Math.abs(diffDays)}일 전`;
            } else if (Math.abs(diffMonths) < 12) {
                return diffMonths > 0 ? `${diffMonths}개월 후` : `${Math.abs(diffMonths)}개월 전`;
            } else {
                return diffYears > 0 ? `${diffYears}년 후` : `${Math.abs(diffYears)}년 전`;
            }
        } catch (error) {
            console.warn('상대적 날짜 계산 오류:', error);
            return '계산 오류';
        }
    }

    /**
     * 날짜를 안전하게 파싱합니다
     * @param {string|Date} date - 파싱할 날짜
     * @returns {Date|null} 파싱된 Date 객체 또는 null
     */
    static parseDate(date) {
        try {
            if (date instanceof Date) {
                return this.isValidDate(date) ? date : null;
            }
            
            if (typeof date === 'string') {
                const parsed = new Date(date);
                return this.isValidDate(parsed) ? parsed : null;
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }
}

export { DateUtils };
