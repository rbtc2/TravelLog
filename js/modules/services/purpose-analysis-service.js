/**
 * PurposeAnalysisService - 여행 목적별 분석 로직을 담당
 * 
 * 🎯 책임:
 * - 여행 목적별 비율 분석
 * - 목적별 통계 계산
 * - 목적 코드 변환
 * - 목적 분석 결과 캐싱
 * 
 * @class PurposeAnalysisService
 * @version 1.0.0
 * @since 2024-12-29
 */
import { CacheManager } from './cache-manager.js';

class PurposeAnalysisService {
    constructor(logDataService, cacheManager = null) {
        this.logDataService = logDataService;
        this.cacheManager = cacheManager || new CacheManager();
        this.cacheKey = 'purpose_analysis';
        this.cacheTTL = 5 * 60 * 1000; // 5분

        // 목적 코드 매핑
        this.purposeNames = {
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
    }

    /**
     * 여행 목적별 비율을 분석합니다
     * @returns {Object} 목적별 분석 결과
     */
    getPurposeAnalysis() {
        try {
            // 캐시에서 조회 시도
            const dataHash = this._calculateDataHash();
            const cachedAnalysis = this.cacheManager.get(this.cacheKey, dataHash);
            if (cachedAnalysis) {
                return cachedAnalysis;
            }

            const logs = this.logDataService.getAllLogs();
            
            if (!logs || logs.length === 0) {
                const result = this._getEmptyAnalysis();
                this.cacheManager.set(this.cacheKey, result, dataHash, this.cacheTTL);
                return result;
            }

            const analysis = this._calculatePurposeAnalysis(logs);
            this.cacheManager.set(this.cacheKey, analysis, dataHash, this.cacheTTL);
            
            return analysis;

        } catch (error) {
            console.error('목적 분석 중 오류:', error);
            return this._getEmptyAnalysis();
        }
    }

    /**
     * 목적 코드를 사용자 친화적인 이름으로 변환합니다
     * @param {string} purposeCode - 목적 코드
     * @returns {string} 표시 이름
     */
    getPurposeDisplayName(purposeCode) {
        return this.purposeNames[purposeCode] || '기타';
    }

    /**
     * 모든 목적 코드와 표시명을 반환합니다
     * @returns {Object} 목적 코드 매핑 객체
     */
    getAllPurposeNames() {
        return { ...this.purposeNames };
    }

    /**
     * 목적별 통계를 계산합니다
     * @param {Array} logs - 로그 배열
     * @returns {Object} 목적별 통계
     * @private
     */
    _calculatePurposeAnalysis(logs) {
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
                purposeName: this.getPurposeDisplayName(purpose),
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
            summary = `${topPurposes[0].purposeName} ${topPurposes[0].percentage}%`;
        } else {
            const purposeTexts = topPurposes.map(item => 
                `${item.purposeName} ${item.percentage}%`
            );
            summary = purposeTexts.join(', ');
        }

        return {
            hasData: true,
            totalLogs: logs.length,
            purposeBreakdown: purposeBreakdown,
            topPurposes: topPurposes,
            summary: summary,
            totalPurposes: Object.keys(purposeCounts).length
        };
    }

    /**
     * 빈 분석 결과를 반환합니다
     * @returns {Object} 빈 분석 결과
     * @private
     */
    _getEmptyAnalysis() {
        return {
            hasData: false,
            totalLogs: 0,
            purposeBreakdown: [],
            topPurposes: [],
            summary: '아직 여행 기록이 없습니다',
            totalPurposes: 0
        };
    }

    /**
     * 특정 목적의 상세 통계를 계산합니다
     * @param {string} purpose - 목적 코드
     * @returns {Object} 목적별 상세 통계
     */
    getPurposeDetailStats(purpose) {
        try {
            const cacheKey = `purpose_detail_${purpose}`;
            const dataHash = this._calculateDataHash();
            const cachedStats = this.cacheManager.get(cacheKey, dataHash);
            if (cachedStats) {
                return cachedStats;
            }

            const logs = this.logDataService.getAllLogs();
            const purposeLogs = logs.filter(log => log.purpose === purpose);

            if (purposeLogs.length === 0) {
                const result = this._getEmptyPurposeStats(purpose);
                this.cacheManager.set(cacheKey, result, dataHash, this.cacheTTL);
                return result;
            }

            const stats = this._calculatePurposeDetailStats(purpose, purposeLogs);
            this.cacheManager.set(cacheKey, stats, dataHash, this.cacheTTL);
            
            return stats;

        } catch (error) {
            console.error('목적별 상세 통계 계산 중 오류:', error);
            return this._getEmptyPurposeStats(purpose);
        }
    }

    /**
     * 목적별 상세 통계를 계산합니다
     * @param {string} purpose - 목적 코드
     * @param {Array} purposeLogs - 해당 목적의 로그들
     * @returns {Object} 상세 통계
     * @private
     */
    _calculatePurposeDetailStats(purpose, purposeLogs) {
        const uniqueCountries = new Set();
        const uniqueCities = new Set();
        let totalTravelDays = 0;
        let totalRating = 0;
        let validRatingCount = 0;

        purposeLogs.forEach(log => {
            if (log.country) uniqueCountries.add(log.country);
            if (log.city) uniqueCities.add(log.city);
            
            // 여행 일수 계산
            if (log.startDate && log.endDate) {
                try {
                    const startDate = new Date(log.startDate);
                    const endDate = new Date(log.endDate);
                    
                    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                        const timeDiff = endDate.getTime() - startDate.getTime();
                        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
                        
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
        const averageTravelDays = purposeLogs.length > 0 ? Math.round(totalTravelDays / purposeLogs.length * 10) / 10 : 0;

        return {
            purpose: purpose,
            purposeName: this.getPurposeDisplayName(purpose),
            totalTrips: purposeLogs.length,
            uniqueCountries: uniqueCountries.size,
            uniqueCities: uniqueCities.size,
            totalTravelDays: totalTravelDays,
            averageTravelDays: averageTravelDays,
            averageRating: Math.round(averageRating * 10) / 10,
            hasData: true
        };
    }

    /**
     * 빈 목적별 통계를 반환합니다
     * @param {string} purpose - 목적 코드
     * @returns {Object} 빈 통계
     * @private
     */
    _getEmptyPurposeStats(purpose) {
        return {
            purpose: purpose,
            purposeName: this.getPurposeDisplayName(purpose),
            totalTrips: 0,
            uniqueCountries: 0,
            uniqueCities: 0,
            totalTravelDays: 0,
            averageTravelDays: 0,
            averageRating: 0,
            hasData: false
        };
    }

    /**
     * 데이터 해시를 계산합니다 (캐시 무효화 확인용)
     * @returns {string} 데이터 해시
     * @private
     */
    _calculateDataHash() {
        try {
            const logs = this.logDataService.getAllLogs();
            const dataString = JSON.stringify(logs.map(log => ({
                id: log.id,
                purpose: log.purpose,
                startDate: log.startDate,
                endDate: log.endDate,
                rating: log.rating
            })));
            
            // 간단한 해시 함수
            let hash = 0;
            for (let i = 0; i < dataString.length; i++) {
                const char = dataString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // 32비트 정수로 변환
            }
            return hash.toString();
        } catch (error) {
            console.error('데이터 해시 계산 중 오류:', error);
            return Date.now().toString();
        }
    }

    /**
     * 캐시를 무효화합니다
     */
    invalidateCache() {
        this.cacheManager.invalidatePattern('purpose_analysis|purpose_detail_');
    }

    /**
     * 서비스 정리
     */
    cleanup() {
        this.invalidateCache();
    }
}

export { PurposeAnalysisService };
