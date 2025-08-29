/**
 * 검색 유틸리티 모듈
 * 가중치 기반 검색, 하이라이팅, 정렬 등의 기능 제공
 */

export class SearchUtility {
    constructor() {
        // 검색 대상 필드 및 가중치 정의
        this.searchFields = {
            country: { weight: 3, type: 'exact_partial' },    // 국가명 (한글/영어)
            city: { weight: 3, type: 'exact_partial' },       // 도시명
            memo: { weight: 2, type: 'partial' },             // 메모 내용
            purpose: { weight: 1.5, type: 'exact' },          // 체류목적 (중복허용)
            travelStyle: { weight: 1, type: 'exact' }         // 동행유형 (중복허용)
        };

        // 검색 결과 캐시
        this.searchCache = new Map();
        this.maxCacheSize = 100;
        this.maxResults = 50;
    }

    /**
     * 검색어를 전처리합니다
     * @param {string} query - 원본 검색어
     * @returns {string} 전처리된 검색어
     */
    preprocessQuery(query) {
        if (!query || typeof query !== 'string') return '';
        
        return query
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ') // 연속된 공백을 단일 공백으로
            .replace(/[^\w\s가-힣]/g, ''); // 특수문자 제거 (한글, 영문, 숫자, 공백만 허용)
    }

    /**
     * 텍스트에서 검색어를 찾아 관련성 점수를 계산합니다
     * @param {string} text - 검색할 텍스트
     * @param {string} query - 검색어
     * @param {number} weight - 필드 가중치
     * @param {string} type - 검색 타입
     * @returns {number} 관련성 점수
     */
    calculateRelevanceScore(text, query, weight, type) {
        if (!text || !query) return 0;

        const normalizedText = text.toString().toLowerCase();
        const normalizedQuery = query.toLowerCase();
        
        let score = 0;

        switch (type) {
            case 'exact':
                // 정확한 일치 (가장 높은 점수)
                if (normalizedText === normalizedQuery) {
                    score = weight * 10;
                }
                break;

            case 'exact_partial':
                // 정확한 일치 + 부분 일치
                if (normalizedText === normalizedQuery) {
                    score = weight * 10;
                } else if (normalizedText.includes(normalizedQuery)) {
                    score = weight * 5;
                }
                break;

            case 'partial':
                // 부분 일치 (가장 낮은 점수)
                if (normalizedText.includes(normalizedQuery)) {
                    score = weight * 2;
                }
                break;
        }

        // 검색어 길이에 따른 보너스 점수
        if (score > 0) {
            score += Math.min(query.length * 0.1, 2);
        }

        return score;
    }

    /**
     * 로그 항목에 대해 검색을 수행합니다
     * @param {Object} log - 검색할 로그 항목
     * @param {string} query - 검색어
     * @returns {Object} 검색 결과 (점수, 매칭된 필드)
     */
    searchLogItem(log, query) {
        if (!log || !query) return { score: 0, matchedFields: [] };

        const processedQuery = this.preprocessQuery(query);
        if (!processedQuery) return { score: 0, matchedFields: [] };

        let totalScore = 0;
        const matchedFields = [];

        // 각 검색 필드에 대해 점수 계산
        for (const [fieldName, fieldConfig] of Object.entries(this.searchFields)) {
            const fieldValue = log[fieldName];
            
            if (fieldValue) {
                const score = this.calculateRelevanceScore(
                    fieldValue, 
                    processedQuery, 
                    fieldConfig.weight, 
                    fieldConfig.type
                );

                if (score > 0) {
                    totalScore += score;
                    matchedFields.push({
                        field: fieldName,
                        value: fieldValue,
                        score: score,
                        weight: fieldConfig.weight
                    });
                }
            }
        }

        return {
            score: totalScore,
            matchedFields: matchedFields.sort((a, b) => b.score - a.score)
        };
    }

    /**
     * 로그 배열에서 검색을 수행합니다
     * @param {Array} logs - 검색할 로그 배열
     * @param {string} query - 검색어
     * @returns {Array} 검색 결과 배열 (점수순 정렬)
     */
    performSearch(logs, query) {
        if (!Array.isArray(logs) || !query) return [];

        const processedQuery = this.preprocessQuery(query);
        if (!processedQuery) return [];

        // 캐시 확인
        const cacheKey = `${processedQuery}_${logs.length}`;
        if (this.searchCache.has(cacheKey)) {
            return this.searchCache.get(cacheKey);
        }

        // 검색 수행
        const searchResults = logs
            .map(log => {
                const searchResult = this.searchLogItem(log, processedQuery);
                return {
                    log: log,
                    score: searchResult.score,
                    matchedFields: searchResult.matchedFields
                };
            })
            .filter(result => result.score > 0) // 점수가 0보다 큰 결과만
            .sort((a, b) => b.score - a.score) // 점수순 정렬
            .slice(0, this.maxResults); // 최대 결과 수 제한

        // 캐시에 저장
        this.updateCache(cacheKey, searchResults);

        return searchResults;
    }

    /**
     * 검색 결과를 하이라이팅합니다
     * @param {string} text - 원본 텍스트
     * @param {string} query - 검색어
     * @returns {string} 하이라이팅된 HTML
     */
    highlightText(text, query) {
        if (!text || !query) return text;

        const processedQuery = this.preprocessQuery(query);
        if (!processedQuery) return text;

        // 정규식을 사용하여 대소문자 무시 검색
        const regex = new RegExp(`(${this.escapeRegex(processedQuery)})`, 'gi');
        
        return text.toString().replace(regex, '<span class="search-highlight">$1</span>');
    }

    /**
     * 정규식 특수문자를 이스케이프합니다
     * @param {string} string - 이스케이프할 문자열
     * @returns {string} 이스케이프된 문자열
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * 검색 캐시를 업데이트합니다
     * @param {string} key - 캐시 키
     * @param {any} value - 캐시 값
     */
    updateCache(key, value) {
        // 캐시 크기 제한 확인
        if (this.searchCache.size >= this.maxCacheSize) {
            // 가장 오래된 항목 제거
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }

        this.searchCache.set(key, value);
    }

    /**
     * 검색 캐시를 정리합니다
     */
    clearCache() {
        this.searchCache.clear();
    }

    /**
     * 검색어 유효성을 검사합니다
     * @param {string} query - 검색어
     * @returns {Object} 검증 결과
     */
    validateQuery(query) {
        if (!query || typeof query !== 'string') {
            return { isValid: false, error: '검색어를 입력해주세요.' };
        }

        const trimmed = query.trim();
        if (trimmed.length === 0) {
            return { isValid: false, error: '검색어를 입력해주세요.' };
        }

        if (trimmed.length < 2) {
            return { isValid: false, error: '검색어는 2글자 이상 입력해주세요.' };
        }

        // 특수문자만으로 구성된 경우
        if (/^[^\w가-힣]+$/.test(trimmed)) {
            return { isValid: false, error: '검색어에 의미있는 문자를 포함해주세요.' };
        }

        return { isValid: true, error: null };
    }

    /**
     * 검색 통계를 계산합니다
     * @param {Array} searchResults - 검색 결과
     * @param {string} query - 검색어
     * @returns {Object} 검색 통계
     */
    calculateSearchStats(searchResults, query) {
        const totalResults = searchResults.length;
        let totalScore = 0;
        const fieldStats = {};

        searchResults.forEach(result => {
            totalScore += result.score;
            
            result.matchedFields.forEach(field => {
                if (!fieldStats[field.field]) {
                    fieldStats[field.field] = { count: 0, totalScore: 0 };
                }
                fieldStats[field.field].count++;
                fieldStats[field.field].totalScore += field.score;
            });
        });

        return {
            totalResults,
            averageScore: totalResults > 0 ? totalScore / totalResults : 0,
            fieldStats,
            query: query
        };
    }
}

// 싱글톤 인스턴스 생성
export default new SearchUtility();
