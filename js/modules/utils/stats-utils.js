/**
 * StatsUtils - 통계 계산 관련 유틸리티 함수들을 제공
 * 
 * 🎯 책임:
 * - 기본 통계 계산 (평균, 합계, 최대/최소 등)
 * - 데이터 그룹화 및 집계
 * - 비율 및 백분율 계산
 * - 트렌드 분석
 * 
 * @class StatsUtils
 * @version 1.0.0
 * @since 2024-12-29
 */
class StatsUtils {
    /**
     * 배열의 합계를 계산합니다
     * @param {Array} values - 숫자 배열
     * @returns {number} 합계
     */
    static sum(values) {
        try {
            if (!Array.isArray(values) || values.length === 0) {
                return 0;
            }
            
            return values
                .filter(val => typeof val === 'number' && !isNaN(val))
                .reduce((sum, val) => sum + val, 0);
        } catch (error) {
            console.error('합계 계산 오류:', error);
            return 0;
        }
    }

    /**
     * 배열의 평균을 계산합니다
     * @param {Array} values - 숫자 배열
     * @param {number} precision - 소수점 자릿수 (기본값: 1)
     * @returns {number} 평균
     */
    static average(values, precision = 1) {
        try {
            if (!Array.isArray(values) || values.length === 0) {
                return 0;
            }
            
            const validValues = values.filter(val => typeof val === 'number' && !isNaN(val));
            if (validValues.length === 0) {
                return 0;
            }
            
            const avg = this.sum(validValues) / validValues.length;
            return Math.round(avg * Math.pow(10, precision)) / Math.pow(10, precision);
        } catch (error) {
            console.error('평균 계산 오류:', error);
            return 0;
        }
    }

    /**
     * 배열의 최대값을 찾습니다
     * @param {Array} values - 숫자 배열
     * @returns {number} 최대값
     */
    static max(values) {
        try {
            if (!Array.isArray(values) || values.length === 0) {
                return 0;
            }
            
            const validValues = values.filter(val => typeof val === 'number' && !isNaN(val));
            return validValues.length > 0 ? Math.max(...validValues) : 0;
        } catch (error) {
            console.error('최대값 계산 오류:', error);
            return 0;
        }
    }

    /**
     * 배열의 최소값을 찾습니다
     * @param {Array} values - 숫자 배열
     * @returns {number} 최소값
     */
    static min(values) {
        try {
            if (!Array.isArray(values) || values.length === 0) {
                return 0;
            }
            
            const validValues = values.filter(val => typeof val === 'number' && !isNaN(val));
            return validValues.length > 0 ? Math.min(...validValues) : 0;
        } catch (error) {
            console.error('최소값 계산 오류:', error);
            return 0;
        }
    }

    /**
     * 중앙값을 계산합니다
     * @param {Array} values - 숫자 배열
     * @returns {number} 중앙값
     */
    static median(values) {
        try {
            if (!Array.isArray(values) || values.length === 0) {
                return 0;
            }
            
            const validValues = values
                .filter(val => typeof val === 'number' && !isNaN(val))
                .sort((a, b) => a - b);
            
            if (validValues.length === 0) {
                return 0;
            }
            
            const mid = Math.floor(validValues.length / 2);
            
            if (validValues.length % 2 === 0) {
                return (validValues[mid - 1] + validValues[mid]) / 2;
            } else {
                return validValues[mid];
            }
        } catch (error) {
            console.error('중앙값 계산 오류:', error);
            return 0;
        }
    }

    /**
     * 백분율을 계산합니다
     * @param {number} value - 값
     * @param {number} total - 전체
     * @param {number} precision - 소수점 자릿수 (기본값: 0)
     * @returns {number} 백분율
     */
    static percentage(value, total, precision = 0) {
        try {
            if (typeof value !== 'number' || typeof total !== 'number' || total === 0) {
                return 0;
            }
            
            const percent = (value / total) * 100;
            return Math.round(percent * Math.pow(10, precision)) / Math.pow(10, precision);
        } catch (error) {
            console.error('백분율 계산 오류:', error);
            return 0;
        }
    }

    /**
     * 증감률을 계산합니다
     * @param {number} currentValue - 현재 값
     * @param {number} previousValue - 이전 값
     * @param {number} precision - 소수점 자릿수 (기본값: 1)
     * @returns {Object} 증감률 정보
     */
    static changeRate(currentValue, previousValue, precision = 1) {
        try {
            if (typeof currentValue !== 'number' || typeof previousValue !== 'number') {
                return {
                    value: 0,
                    rate: 0,
                    type: 'invalid',
                    display: '계산 불가'
                };
            }
            
            if (previousValue === 0) {
                return {
                    value: currentValue,
                    rate: 0,
                    type: currentValue > 0 ? 'new' : 'none',
                    display: currentValue > 0 ? '신규' : '없음'
                };
            }
            
            const changeValue = currentValue - previousValue;
            const changePercent = (changeValue / previousValue) * 100;
            const roundedPercent = Math.round(changePercent * Math.pow(10, precision)) / Math.pow(10, precision);
            
            let type = 'neutral';
            let display = '';
            
            if (changeValue > 0) {
                type = 'increase';
                display = `+${roundedPercent}%`;
            } else if (changeValue < 0) {
                type = 'decrease';
                display = `${roundedPercent}%`;
            } else {
                type = 'neutral';
                display = '0%';
            }
            
            return {
                value: changeValue,
                rate: roundedPercent,
                type: type,
                display: display
            };
        } catch (error) {
            console.error('증감률 계산 오류:', error);
            return {
                value: 0,
                rate: 0,
                type: 'error',
                display: '계산 오류'
            };
        }
    }

    /**
     * 데이터를 특정 필드로 그룹화합니다
     * @param {Array} data - 데이터 배열
     * @param {string} groupByField - 그룹화할 필드명
     * @returns {Object} 그룹화된 데이터
     */
    static groupBy(data, groupByField) {
        try {
            if (!Array.isArray(data) || !groupByField) {
                return {};
            }
            
            const groups = {};
            
            data.forEach(item => {
                if (item && typeof item === 'object') {
                    const key = item[groupByField];
                    if (key !== undefined && key !== null) {
                        const groupKey = String(key);
                        if (!groups[groupKey]) {
                            groups[groupKey] = [];
                        }
                        groups[groupKey].push(item);
                    }
                }
            });
            
            return groups;
        } catch (error) {
            console.error('그룹화 오류:', error);
            return {};
        }
    }

    /**
     * 그룹별 통계를 계산합니다
     * @param {Object} groups - 그룹화된 데이터
     * @param {string} valueField - 값 필드명
     * @returns {Object} 그룹별 통계
     */
    static groupStats(groups, valueField) {
        try {
            if (!groups || typeof groups !== 'object') {
                return {};
            }
            
            const stats = {};
            
            for (const [groupKey, groupData] of Object.entries(groups)) {
                if (Array.isArray(groupData)) {
                    const values = groupData
                        .map(item => item[valueField])
                        .filter(val => typeof val === 'number' && !isNaN(val));
                    
                    stats[groupKey] = {
                        count: groupData.length,
                        sum: this.sum(values),
                        average: this.average(values),
                        min: this.min(values),
                        max: this.max(values),
                        median: this.median(values)
                    };
                }
            }
            
            return stats;
        } catch (error) {
            console.error('그룹별 통계 계산 오류:', error);
            return {};
        }
    }

    /**
     * 상위 N개 항목을 반환합니다
     * @param {Array} data - 데이터 배열
     * @param {string} sortField - 정렬 필드명
     * @param {number} limit - 제한 개수
     * @param {string} order - 정렬 순서 ('desc' 또는 'asc')
     * @returns {Array} 상위 N개 항목
     */
    static topN(data, sortField, limit = 5, order = 'desc') {
        try {
            if (!Array.isArray(data) || !sortField) {
                return [];
            }
            
            const validData = data.filter(item => 
                item && 
                typeof item === 'object' && 
                item[sortField] !== undefined && 
                item[sortField] !== null
            );
            
            const sorted = validData.sort((a, b) => {
                const aVal = a[sortField];
                const bVal = b[sortField];
                
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return order === 'desc' ? bVal - aVal : aVal - bVal;
                } else {
                    const aStr = String(aVal);
                    const bStr = String(bVal);
                    return order === 'desc' ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
                }
            });
            
            return sorted.slice(0, Math.max(0, limit));
        } catch (error) {
            console.error('상위 N개 추출 오류:', error);
            return [];
        }
    }

    /**
     * 빈도 분석을 수행합니다
     * @param {Array} data - 데이터 배열
     * @param {string} field - 분석할 필드명
     * @returns {Array} 빈도 분석 결과
     */
    static frequency(data, field) {
        try {
            if (!Array.isArray(data) || !field) {
                return [];
            }
            
            const counts = {};
            let total = 0;
            
            data.forEach(item => {
                if (item && typeof item === 'object' && item[field] !== undefined) {
                    const value = String(item[field]);
                    counts[value] = (counts[value] || 0) + 1;
                    total++;
                }
            });
            
            return Object.entries(counts)
                .map(([value, count]) => ({
                    value: value,
                    count: count,
                    percentage: this.percentage(count, total, 1)
                }))
                .sort((a, b) => b.count - a.count);
        } catch (error) {
            console.error('빈도 분석 오류:', error);
            return [];
        }
    }

    /**
     * 선형 회귀를 사용한 트렌드 분석을 수행합니다
     * @param {Array} values - 값 배열
     * @returns {Object} 트렌드 분석 결과
     */
    static trendAnalysis(values) {
        try {
            if (!Array.isArray(values) || values.length < 2) {
                return {
                    direction: 'insufficient_data',
                    strength: 0,
                    slope: 0,
                    description: '데이터 부족'
                };
            }
            
            const validValues = values.filter(val => typeof val === 'number' && !isNaN(val));
            
            if (validValues.length < 2) {
                return {
                    direction: 'insufficient_data',
                    strength: 0,
                    slope: 0,
                    description: '유효한 데이터 부족'
                };
            }
            
            // 선형 회귀 계산
            const n = validValues.length;
            const x = Array.from({ length: n }, (_, i) => i);
            const y = validValues;
            
            const sumX = this.sum(x);
            const sumY = this.sum(y);
            const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
            const sumXX = this.sum(x.map(xi => xi * xi));
            
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const avgY = this.average(y);
            
            let direction = 'stable';
            let strength = Math.abs(slope) / avgY;
            
            if (slope > 0) {
                direction = 'increasing';
            } else if (slope < 0) {
                direction = 'decreasing';
            }
            
            let description = '';
            if (strength < 0.1) {
                description = '안정적';
            } else if (strength < 0.3) {
                description = direction === 'increasing' ? '점진적 증가' : '점진적 감소';
            } else {
                description = direction === 'increasing' ? '급격한 증가' : '급격한 감소';
            }
            
            return {
                direction: direction,
                strength: Math.round(strength * 100) / 100,
                slope: Math.round(slope * 100) / 100,
                description: description
            };
        } catch (error) {
            console.error('트렌드 분석 오류:', error);
            return {
                direction: 'error',
                strength: 0,
                slope: 0,
                description: '분석 오류'
            };
        }
    }

    /**
     * 기본 통계 요약을 생성합니다
     * @param {Array} values - 숫자 배열
     * @returns {Object} 통계 요약
     */
    static summary(values) {
        try {
            if (!Array.isArray(values)) {
                return this._getEmptySummary();
            }
            
            const validValues = values.filter(val => typeof val === 'number' && !isNaN(val));
            
            if (validValues.length === 0) {
                return this._getEmptySummary();
            }
            
            return {
                count: validValues.length,
                sum: this.sum(validValues),
                average: this.average(validValues),
                min: this.min(validValues),
                max: this.max(validValues),
                median: this.median(validValues),
                range: this.max(validValues) - this.min(validValues)
            };
        } catch (error) {
            console.error('통계 요약 생성 오류:', error);
            return this._getEmptySummary();
        }
    }

    /**
     * 빈 통계 요약을 반환합니다
     * @returns {Object} 빈 통계 요약
     * @private
     */
    static _getEmptySummary() {
        return {
            count: 0,
            sum: 0,
            average: 0,
            min: 0,
            max: 0,
            median: 0,
            range: 0
        };
    }

    /**
     * 데이터를 정규화합니다 (0-1 범위)
     * @param {Array} values - 숫자 배열
     * @returns {Array} 정규화된 값 배열
     */
    static normalize(values) {
        try {
            if (!Array.isArray(values) || values.length === 0) {
                return [];
            }
            
            const validValues = values.filter(val => typeof val === 'number' && !isNaN(val));
            
            if (validValues.length === 0) {
                return [];
            }
            
            const min = this.min(validValues);
            const max = this.max(validValues);
            const range = max - min;
            
            if (range === 0) {
                return validValues.map(() => 0);
            }
            
            return validValues.map(val => (val - min) / range);
        } catch (error) {
            console.error('데이터 정규화 오류:', error);
            return [];
        }
    }

    /**
     * 상관관계를 계산합니다
     * @param {Array} x - X 값 배열
     * @param {Array} y - Y 값 배열
     * @returns {number} 상관계수 (-1 ~ 1)
     */
    static correlation(x, y) {
        try {
            if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length < 2) {
                return 0;
            }
            
            const validPairs = [];
            for (let i = 0; i < x.length; i++) {
                if (typeof x[i] === 'number' && typeof y[i] === 'number' && 
                    !isNaN(x[i]) && !isNaN(y[i])) {
                    validPairs.push([x[i], y[i]]);
                }
            }
            
            if (validPairs.length < 2) {
                return 0;
            }
            
            const xValues = validPairs.map(pair => pair[0]);
            const yValues = validPairs.map(pair => pair[1]);
            
            const n = validPairs.length;
            const sumX = this.sum(xValues);
            const sumY = this.sum(yValues);
            const sumXY = validPairs.reduce((sum, [xi, yi]) => sum + xi * yi, 0);
            const sumXX = this.sum(xValues.map(xi => xi * xi));
            const sumYY = this.sum(yValues.map(yi => yi * yi));
            
            const numerator = n * sumXY - sumX * sumY;
            const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
            
            if (denominator === 0) {
                return 0;
            }
            
            const correlation = numerator / denominator;
            return Math.round(correlation * 1000) / 1000; // 소수점 3자리까지
        } catch (error) {
            console.error('상관관계 계산 오류:', error);
            return 0;
        }
    }
}

export { StatsUtils };
