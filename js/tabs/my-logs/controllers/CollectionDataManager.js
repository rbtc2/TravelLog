/**
 * CollectionDataManager - 컬렉션 데이터 관리 전용 매니저
 * 
 * 🎯 책임:
 * - 컬렉션 데이터의 변환 및 필터링
 * - 데이터 정렬 및 검색 기능
 * - 성능 최적화된 데이터 처리
 * - 데이터 유효성 검증
 * 
 * @class CollectionDataManager
 * @version 1.0.0
 * @since 2024-12-29
 */

import { countriesManager } from '../../../data/countries-manager.js';

class CollectionDataManager {
    constructor() {
        this.countriesManager = countriesManager;
        this.dataCache = new Map();
        this.cacheTTL = 10 * 60 * 1000; // 10분 캐시
    }

    /**
     * 국가 데이터를 컬렉션용으로 변환합니다
     * @param {Object} visitedCountries - 방문한 국가 데이터
     * @param {Object} options - 변환 옵션
     * @returns {Array} 변환된 국가 배열
     */
    transformCountriesForCollection(visitedCountries, options = {}) {
        try {
            const {
                sortBy = 'visitCount',
                sortOrder = 'desc',
                filterContinent = 'all',
                searchQuery = ''
            } = options;

            let countries = Object.values(visitedCountries.countries || {});

            // 대륙 필터링
            if (filterContinent !== 'all') {
                countries = countries.filter(country => country.continent === filterContinent);
            }

            // 검색 쿼리 필터링
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                countries = countries.filter(country => 
                    country.name.toLowerCase().includes(query) ||
                    country.nameKo.toLowerCase().includes(query) ||
                    country.code.toLowerCase().includes(query)
                );
            }

            // 정렬
            countries = this._sortCountries(countries, sortBy, sortOrder);

            return countries;
        } catch (error) {
            console.error('CollectionDataManager: transformCountriesForCollection 실패:', error);
            return [];
        }
    }

    /**
     * 대륙별 통계를 컬렉션용으로 변환합니다
     * @param {Array} continentStats - 대륙별 통계
     * @returns {Array} 변환된 대륙 통계
     */
    transformContinentStatsForCollection(continentStats) {
        try {
            return continentStats.map(stat => ({
                ...stat,
                progressBar: this._calculateProgressBar(stat.percentage),
                status: this._getContinentStatus(stat.percentage)
            }));
        } catch (error) {
            console.error('CollectionDataManager: transformContinentStatsForCollection 실패:', error);
            return [];
        }
    }

    /**
     * 컬렉션 통계를 계산합니다
     * @param {Object} collectionStats - 기본 컬렉션 통계
     * @returns {Object} 확장된 컬렉션 통계
     */
    calculateExtendedCollectionStats(collectionStats) {
        try {
            const { visited, total, continents } = collectionStats;
            
            // 대륙별 진행률 계산
            const continentProgress = continents.map(continent => ({
                ...continent,
                progressBar: this._calculateProgressBar(continent.percentage),
                status: this._getContinentStatus(continent.percentage)
            }));

            // 전체 진행률 계산
            const overallProgress = this._calculateProgressBar(collectionStats.percentage);
            const overallStatus = this._getOverallStatus(collectionStats.percentage);

            // 다음 목표 계산
            const nextMilestone = this._calculateNextMilestone(visited);

            return {
                ...collectionStats,
                continentProgress,
                overallProgress,
                overallStatus,
                nextMilestone,
                achievements: this._calculateAchievements(visited, continents)
            };
        } catch (error) {
            console.error('CollectionDataManager: calculateExtendedCollectionStats 실패:', error);
            return collectionStats;
        }
    }

    /**
     * 국가 데이터를 정렬합니다
     * @param {Array} countries - 국가 배열
     * @param {string} sortBy - 정렬 기준
     * @param {string} sortOrder - 정렬 순서
     * @returns {Array} 정렬된 국가 배열
     * @private
     */
    _sortCountries(countries, sortBy, sortOrder) {
        const order = sortOrder === 'desc' ? -1 : 1;
        
        return countries.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'visitCount':
                    aValue = a.visitCount || 0;
                    bValue = b.visitCount || 0;
                    break;
                case 'lastVisit':
                    aValue = new Date(a.lastVisit || 0);
                    bValue = new Date(b.lastVisit || 0);
                    break;
                case 'totalDays':
                    aValue = a.totalDays || 0;
                    bValue = b.totalDays || 0;
                    break;
                case 'averageRating':
                    aValue = a.averageRating || 0;
                    bValue = b.averageRating || 0;
                    break;
                case 'name':
                    aValue = a.nameKo || a.name || '';
                    bValue = b.nameKo || b.name || '';
                    break;
                default:
                    aValue = a.visitCount || 0;
                    bValue = b.visitCount || 0;
            }
            
            if (aValue < bValue) return -1 * order;
            if (aValue > bValue) return 1 * order;
            return 0;
        });
    }

    /**
     * 진행률 바 계산
     * @param {number} percentage - 퍼센트
     * @returns {Object} 진행률 바 정보
     * @private
     */
    _calculateProgressBar(percentage) {
        const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
        const width = Math.round(clampedPercentage);
        
        return {
            width: width,
            percentage: clampedPercentage,
            color: this._getProgressColor(clampedPercentage)
        };
    }

    /**
     * 진행률에 따른 색상 결정
     * @param {number} percentage - 퍼센트
     * @returns {string} 색상 클래스
     * @private
     */
    _getProgressColor(percentage) {
        if (percentage >= 80) return 'progress-high';
        if (percentage >= 60) return 'progress-medium-high';
        if (percentage >= 40) return 'progress-medium';
        if (percentage >= 20) return 'progress-low';
        return 'progress-very-low';
    }

    /**
     * 대륙 상태 결정
     * @param {number} percentage - 퍼센트
     * @returns {string} 상태
     * @private
     */
    _getContinentStatus(percentage) {
        if (percentage >= 80) return 'excellent';
        if (percentage >= 60) return 'good';
        if (percentage >= 40) return 'fair';
        if (percentage >= 20) return 'poor';
        return 'very-poor';
    }

    /**
     * 전체 상태 결정
     * @param {number} percentage - 퍼센트
     * @returns {string} 상태
     * @private
     */
    _getOverallStatus(percentage) {
        if (percentage >= 50) return 'excellent';
        if (percentage >= 30) return 'good';
        if (percentage >= 15) return 'fair';
        if (percentage >= 5) return 'poor';
        return 'very-poor';
    }

    /**
     * 다음 마일스톤 계산
     * @param {number} visited - 방문한 국가 수
     * @returns {Object} 다음 마일스톤 정보
     * @private
     */
    _calculateNextMilestone(visited) {
        const milestones = [5, 10, 20, 30, 50, 75, 100, 150, 195];
        const next = milestones.find(milestone => visited < milestone);
        
        if (next) {
            return {
                target: next,
                remaining: next - visited,
                percentage: Math.round((visited / next) * 100)
            };
        }
        
        return {
            target: 195,
            remaining: 0,
            percentage: 100
        };
    }

    /**
     * 업적 계산
     * @param {number} visited - 방문한 국가 수
     * @param {Array} continents - 대륙별 통계
     * @returns {Array} 업적 목록
     * @private
     */
    _calculateAchievements(visited, continents) {
        const achievements = [];
        
        // 국가 수 업적
        if (visited >= 1) achievements.push({ id: 'first_country', name: '첫 여행', description: '첫 번째 국가 방문' });
        if (visited >= 5) achievements.push({ id: 'explorer', name: '탐험가', description: '5개국 방문' });
        if (visited >= 10) achievements.push({ id: 'traveler', name: '여행자', description: '10개국 방문' });
        if (visited >= 20) achievements.push({ id: 'globetrotter', name: '글로벌 트로터', description: '20개국 방문' });
        if (visited >= 50) achievements.push({ id: 'world_traveler', name: '세계 여행자', description: '50개국 방문' });
        if (visited >= 100) achievements.push({ id: 'master_traveler', name: '마스터 여행자', description: '100개국 방문' });
        if (visited >= 195) achievements.push({ id: 'world_complete', name: '세계 완주', description: '모든 국가 방문' });
        
        // 대륙별 업적
        continents.forEach(continent => {
            if (continent.percentage >= 100) {
                achievements.push({
                    id: `continent_${continent.continent.toLowerCase()}`,
                    name: `${continent.nameKo} 완주`,
                    description: `${continent.nameKo} 모든 국가 방문`
                });
            }
        });
        
        return achievements;
    }

    /**
     * 데이터 캐시를 무효화합니다
     */
    invalidateCache() {
        this.dataCache.clear();
    }

    /**
     * 매니저 정리
     */
    cleanup() {
        this.invalidateCache();
    }
}

export { CollectionDataManager };
