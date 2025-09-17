/**
 * LogDataManager - 로그 데이터 관리 전용 매니저
 * 
 * 🎯 책임:
 * - 로그 데이터 변환 및 정규화
 * - 로그 검색 및 필터링 알고리즘
 * - 로그 정렬 및 그룹화
 * - 로그 통계 계산
 * 
 * @class LogDataManager
 * @version 1.0.0
 * @since 2024-12-29
 */

class LogDataManager {
    constructor() {
        this.isInitialized = false;
        this.sortOptions = {
            startDate: (a, b) => new Date(a.startDate) - new Date(b.startDate),
            endDate: (a, b) => new Date(a.endDate) - new Date(b.endDate),
            country: (a, b) => (a.country || '').localeCompare(b.country || ''),
            city: (a, b) => (a.city || '').localeCompare(b.city || ''),
            purpose: (a, b) => (a.purpose || '').localeCompare(b.purpose || ''),
            rating: (a, b) => (b.rating || 0) - (a.rating || 0),
            createdAt: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        };
    }

    /**
     * 데이터 매니저 초기화
     */
    async initialize() {
        try {
            console.log('LogDataManager: 초기화 시작');
            this.isInitialized = true;
            console.log('LogDataManager: 초기화 완료');
        } catch (error) {
            console.error('LogDataManager: 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 로그 데이터를 정규화합니다
     * @param {Object} logData - 원본 로그 데이터
     * @returns {Object} 정규화된 로그 데이터
     */
    normalizeLogData(logData) {
        try {
            const normalized = { ...logData };

            // ID 생성 (없는 경우)
            if (!normalized.id) {
                normalized.id = this._generateLogId();
            }

            // 생성일 설정 (없는 경우)
            if (!normalized.createdAt) {
                normalized.createdAt = new Date().toISOString();
            }

            // 수정일 설정
            normalized.updatedAt = new Date().toISOString();

            // 국가 코드 정규화 (대문자로 변환)
            if (normalized.country) {
                normalized.country = normalized.country.toUpperCase();
            }

            // 도시명 정규화 (첫 글자 대문자)
            if (normalized.city) {
                normalized.city = this._normalizeCityName(normalized.city);
            }

            // 목적 정규화
            if (normalized.purpose) {
                normalized.purpose = this._normalizePurpose(normalized.purpose);
            }

            // 별점 정규화 (소수점 1자리로 반올림)
            if (normalized.rating !== undefined && normalized.rating !== null) {
                normalized.rating = Math.round(normalized.rating * 2) / 2;
            }

            // 메모 정규화 (앞뒤 공백 제거)
            if (normalized.notes) {
                normalized.notes = normalized.notes.trim();
            }

            // 사진 배열 정규화
            if (normalized.photos) {
                normalized.photos = Array.isArray(normalized.photos) ? normalized.photos : [];
            }

            // 여행 일수 계산
            if (normalized.startDate && normalized.endDate) {
                normalized.duration = this._calculateDuration(normalized.startDate, normalized.endDate);
            }

            return normalized;
        } catch (error) {
            console.error('LogDataManager: normalizeLogData 실패:', error);
            return logData;
        }
    }

    /**
     * 로그 배열을 처리합니다 (정렬, 필터링, 제한)
     * @param {Array} logs - 로그 배열
     * @param {Object} options - 처리 옵션
     * @returns {Array} 처리된 로그 배열
     */
    processLogs(logs, options = {}) {
        try {
            let processedLogs = [...logs];

            // 필터링
            if (options.filters) {
                processedLogs = this.filterLogs(processedLogs, options.filters);
            }

            // 정렬
            if (options.sortBy) {
                processedLogs = this.sortLogs(processedLogs, options.sortBy, options.sortOrder);
            }

            // 제한
            if (options.limit && options.limit > 0) {
                processedLogs = processedLogs.slice(0, options.limit);
            }

            return processedLogs;
        } catch (error) {
            console.error('LogDataManager: processLogs 실패:', error);
            return logs;
        }
    }

    /**
     * 로그를 필터링합니다
     * @param {Array} logs - 로그 배열
     * @param {Object} criteria - 필터 조건
     * @returns {Array} 필터링된 로그 배열
     */
    filterLogs(logs, criteria) {
        try {
            return logs.filter(log => {
                // 검색어 필터
                if (criteria.query) {
                    const query = criteria.query.toLowerCase();
                    const searchableText = [
                        log.country,
                        log.city,
                        log.purpose,
                        log.notes
                    ].join(' ').toLowerCase();
                    
                    if (!searchableText.includes(query)) {
                        return false;
                    }
                }

                // 국가 필터
                if (criteria.country && log.country !== criteria.country) {
                    return false;
                }

                // 연도 필터
                if (criteria.year) {
                    const logYear = new Date(log.startDate).getFullYear();
                    if (logYear !== criteria.year) {
                        return false;
                    }
                }

                // 목적 필터
                if (criteria.purpose && log.purpose !== criteria.purpose) {
                    return false;
                }

                // 별점 필터
                if (criteria.rating) {
                    if (criteria.rating.min && (log.rating || 0) < criteria.rating.min) {
                        return false;
                    }
                    if (criteria.rating.max && (log.rating || 0) > criteria.rating.max) {
                        return false;
                    }
                }

                // 날짜 범위 필터
                if (criteria.dateRange) {
                    const logDate = new Date(log.startDate);
                    
                    if (criteria.dateRange.start && logDate < new Date(criteria.dateRange.start)) {
                        return false;
                    }
                    if (criteria.dateRange.end && logDate > new Date(criteria.dateRange.end)) {
                        return false;
                    }
                }

                // 여행 기간 필터
                if (criteria.duration) {
                    const duration = log.duration || this._calculateDuration(log.startDate, log.endDate);
                    
                    if (criteria.duration.min && duration < criteria.duration.min) {
                        return false;
                    }
                    if (criteria.duration.max && duration > criteria.duration.max) {
                        return false;
                    }
                }

                return true;
            });
        } catch (error) {
            console.error('LogDataManager: filterLogs 실패:', error);
            return logs;
        }
    }

    /**
     * 로그를 정렬합니다
     * @param {Array} logs - 로그 배열
     * @param {string} sortBy - 정렬 기준
     * @param {string} sortOrder - 정렬 순서 ('asc' 또는 'desc')
     * @returns {Array} 정렬된 로그 배열
     */
    sortLogs(logs, sortBy, sortOrder = 'asc') {
        try {
            const sortFunction = this.sortOptions[sortBy];
            if (!sortFunction) {
                console.warn(`LogDataManager: 알 수 없는 정렬 기준: ${sortBy}`);
                return logs;
            }

            const sortedLogs = [...logs].sort(sortFunction);
            
            return sortOrder === 'desc' ? sortedLogs.reverse() : sortedLogs;
        } catch (error) {
            console.error('LogDataManager: sortLogs 실패:', error);
            return logs;
        }
    }

    /**
     * 로그를 그룹화합니다
     * @param {Array} logs - 로그 배열
     * @param {string} groupBy - 그룹화 기준
     * @returns {Object} 그룹화된 로그 객체
     */
    groupLogs(logs, groupBy) {
        try {
            const groups = {};

            logs.forEach(log => {
                let groupKey;

                switch (groupBy) {
                    case 'year':
                        groupKey = new Date(log.startDate).getFullYear();
                        break;
                    case 'month':
                        const date = new Date(log.startDate);
                        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        break;
                    case 'country':
                        groupKey = log.country;
                        break;
                    case 'purpose':
                        groupKey = log.purpose || '기타';
                        break;
                    case 'rating':
                        groupKey = Math.floor(log.rating || 0);
                        break;
                    default:
                        groupKey = 'all';
                }

                if (!groups[groupKey]) {
                    groups[groupKey] = [];
                }
                groups[groupKey].push(log);
            });

            return groups;
        } catch (error) {
            console.error('LogDataManager: groupLogs 실패:', error);
            return { all: logs };
        }
    }

    /**
     * 로그 통계를 계산합니다
     * @param {Array} logs - 로그 배열
     * @param {string} groupBy - 그룹화 기준
     * @returns {Object} 로그 통계
     */
    calculateLogStatistics(logs, groupBy = 'year') {
        try {
            const stats = {
                total: logs.length,
                groups: {},
                summary: {
                    totalDays: 0,
                    averageRating: 0,
                    countries: new Set(),
                    purposes: new Set()
                }
            };

            // 그룹별 통계 계산
            const groupedLogs = this.groupLogs(logs, groupBy);
            
            Object.entries(groupedLogs).forEach(([groupKey, groupLogs]) => {
                const groupStats = this._calculateGroupStatistics(groupLogs);
                stats.groups[groupKey] = groupStats;
                
                // 전체 요약에 추가
                stats.summary.totalDays += groupStats.totalDays;
                stats.summary.countries.add(...groupStats.countries);
                groupStats.purposes.forEach(p => stats.summary.purposes.add(p));
            });

            // 전체 평균 별점 계산
            const totalRating = logs.reduce((sum, log) => sum + (log.rating || 0), 0);
            stats.summary.averageRating = logs.length > 0 ? totalRating / logs.length : 0;

            // Set을 Array로 변환
            stats.summary.countries = Array.from(stats.summary.countries);
            stats.summary.purposes = Array.from(stats.summary.purposes);

            return stats;
        } catch (error) {
            console.error('LogDataManager: calculateLogStatistics 실패:', error);
            return { total: 0, groups: {}, summary: { totalDays: 0, averageRating: 0, countries: [], purposes: [] } };
        }
    }

    /**
     * 그룹별 통계를 계산합니다
     * @param {Array} logs - 로그 배열
     * @returns {Object} 그룹 통계
     * @private
     */
    _calculateGroupStatistics(logs) {
        const stats = {
            count: logs.length,
            totalDays: 0,
            averageRating: 0,
            countries: new Set(),
            purposes: new Set(),
            totalRating: 0
        };

        logs.forEach(log => {
            // 총 여행 일수
            if (log.duration) {
                stats.totalDays += log.duration;
            } else if (log.startDate && log.endDate) {
                stats.totalDays += this._calculateDuration(log.startDate, log.endDate);
            }

            // 별점
            if (log.rating) {
                stats.totalRating += log.rating;
            }

            // 국가
            if (log.country) {
                stats.countries.add(log.country);
            }

            // 목적
            if (log.purpose) {
                stats.purposes.add(log.purpose);
            }
        });

        // 평균 별점 계산
        stats.averageRating = logs.length > 0 ? stats.totalRating / logs.length : 0;

        // Set을 Array로 변환
        stats.countries = Array.from(stats.countries);
        stats.purposes = Array.from(stats.purposes);

        return stats;
    }

    /**
     * 여행 일수를 계산합니다
     * @param {string} startDate - 시작일
     * @param {string} endDate - 종료일
     * @returns {number} 여행 일수
     * @private
     */
    _calculateDuration(startDate, endDate) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        } catch (error) {
            console.error('LogDataManager: _calculateDuration 실패:', error);
            return 1;
        }
    }

    /**
     * 로그 ID를 생성합니다
     * @returns {string} 로그 ID
     * @private
     */
    _generateLogId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 도시명을 정규화합니다
     * @param {string} cityName - 도시명
     * @returns {string} 정규화된 도시명
     * @private
     */
    _normalizeCityName(cityName) {
        if (!cityName) return cityName;
        
        return cityName
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * 목적을 정규화합니다
     * @param {string} purpose - 목적
     * @returns {string} 정규화된 목적
     * @private
     */
    _normalizePurpose(purpose) {
        if (!purpose) return purpose;
        
        const purposeMap = {
            '관광': '관광',
            '관광여행': '관광',
            'tourism': '관광',
            '비즈니스': '비즈니스',
            'business': '비즈니스',
            '출장': '비즈니스',
            '방문': '방문',
            'visit': '방문',
            '학습': '학습',
            'study': '학습',
            '유학': '학습',
            '휴양': '휴양',
            'vacation': '휴양',
            '휴가': '휴양',
            '의료': '의료',
            'medical': '의료',
            '치료': '의료',
            '기타': '기타',
            'other': '기타'
        };

        return purposeMap[purpose] || purpose;
    }

    /**
     * 데이터 매니저 정리
     */
    cleanup() {
        this.isInitialized = false;
    }
}

export { LogDataManager };
