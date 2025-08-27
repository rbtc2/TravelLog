/**
 * 국가 데이터 관리 모듈
 * 완전히 독립적인 모듈로 기존 코드에 영향을 주지 않음
 * 온라인/오프라인 하이브리드 시스템으로 동작
 * 빠른 검색, 캐싱, 메모리 효율성 보장
 * 
 * @author TravelLog System
 * @version 1.0.0
 */

export class CountryDataManager {
    constructor() {
        // 싱글톤 패턴으로 인스턴스 관리
        if (CountryDataManager.instance) {
            return CountryDataManager.instance;
        }
        CountryDataManager.instance = this;

        // 초기화 상태
        this.isInitialized = false;
        this.isOnline = navigator.onLine;
        
        // 캐시 설정
        this.cacheKey = 'country_data_cache';
        this.cacheVersion = '1.0.0';
        this.cacheExpiry = 30 * 24 * 60 * 60 * 1000; // 30일
        
        // 메모리 내 데이터
        this.countries = new Map();
        this.countriesByName = new Map();
        this.countriesByCode = new Map();
        this.countriesByRegion = new Map();
        
        // 검색 인덱스
        this.searchIndex = new Map();
        
        // 이벤트 리스너
        this.onlineStatusListeners = [];
        
        // 초기화
        this.initialize();
    }

    /**
     * 모듈 초기화
     */
    async initialize() {
        try {
            // 온라인 상태 모니터링
            this.setupOnlineStatusMonitoring();
            
            // 데이터 로드 (캐시 우선, API 폴백)
            await this.loadCountryData();
            
            // 검색 인덱스 구축
            this.buildSearchIndex();
            
            this.isInitialized = true;
            console.log('CountryDataManager 초기화 완료');
            
        } catch (error) {
            console.error('CountryDataManager 초기화 실패:', error);
            // 폴백: 기본 데이터 사용
            this.loadFallbackData();
        }
    }

    /**
     * 온라인 상태 모니터링 설정
     */
    setupOnlineStatusMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifyOnlineStatusChange(true);
            this.tryUpdateFromAPI();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyOnlineStatusChange(false);
        });

        // 초기 상태 설정
        this.isOnline = navigator.onLine;
    }

    /**
     * 온라인 상태 변경 알림
     */
    notifyOnlineStatusChange(isOnline) {
        this.onlineStatusListeners.forEach(listener => {
            try {
                listener(isOnline);
            } catch (error) {
                console.error('온라인 상태 변경 알림 오류:', error);
            }
        });
    }

    /**
     * 온라인 상태 변경 리스너 등록
     */
    addOnlineStatusListener(listener) {
        this.onlineStatusListeners.push(listener);
    }

    /**
     * 온라인 상태 변경 리스너 제거
     */
    removeOnlineStatusListener(listener) {
        const index = this.onlineStatusListeners.indexOf(listener);
        if (index > -1) {
            this.onlineStatusListeners.splice(index, 1);
        }
    }

    /**
     * 국가 데이터 로드 (캐시 우선, API 폴백)
     */
    async loadCountryData() {
        try {
            // 1. 메모리 캐시 확인
            if (this.countries.size > 0) {
                return;
            }

            // 2. 로컬 스토리지 캐시 확인
            const cachedData = this.loadFromCache();
            if (cachedData && this.isCacheValid(cachedData)) {
                this.loadCountriesToMemory(cachedData.countries);
                return;
            }

            // 3. API에서 데이터 로드 (온라인인 경우)
            if (this.isOnline) {
                const apiData = await this.loadFromAPI();
                if (apiData) {
                    this.loadCountriesToMemory(apiData);
                    this.saveToCache(apiData);
                    return;
                }
            }

            // 4. 폴백: 내장 기본 데이터
            this.loadFallbackData();

        } catch (error) {
            console.error('국가 데이터 로드 실패:', error);
            this.loadFallbackData();
        }
    }

    /**
     * 로컬 스토리지 캐시에서 데이터 로드
     */
    loadFromCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;

            const data = JSON.parse(cached);
            return data;
        } catch (error) {
            console.error('캐시 로드 실패:', error);
            return null;
        }
    }

    /**
     * 캐시 유효성 검사
     */
    isCacheValid(cachedData) {
        if (!cachedData || !cachedData.timestamp || !cachedData.version) {
            return false;
        }

        const now = Date.now();
        const isExpired = (now - cachedData.timestamp) > this.cacheExpiry;
        const isVersionMatch = cachedData.version === this.cacheVersion;

        return !isExpired && isVersionMatch;
    }

    /**
     * API에서 국가 데이터 로드
     */
    async loadFromAPI() {
        try {
            // REST Countries API 사용 (무료, 안정적)
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flags,region,subregion');
            
            if (!response.ok) {
                throw new Error(`API 응답 오류: ${response.status}`);
            }

            const apiCountries = await response.json();
            return this.transformAPIData(apiCountries);

        } catch (error) {
            console.error('API 데이터 로드 실패:', error);
            return null;
        }
    }

    /**
     * API 데이터를 내부 형식으로 변환
     */
    transformAPIData(apiCountries) {
        const transformed = [];

        apiCountries.forEach(country => {
            const transformedCountry = {
                code: country.cca2 || country.cca3,
                code3: country.cca3,
                nameKo: this.getKoreanName(country.name.common),
                nameEn: country.name.common,
                nameOfficial: country.name.official,
                flag: country.flags?.emoji || '🏳️',
                region: this.normalizeRegion(country.region),
                subregion: country.subregion || '',
                searchable: [
                    country.name.common.toLowerCase(),
                    country.name.official.toLowerCase(),
                    this.getKoreanName(country.name.common).toLowerCase(),
                    country.cca2?.toLowerCase(),
                    country.cca3?.toLowerCase()
                ].filter(Boolean)
            };

            transformed.push(transformedCountry);
        });

        return transformed;
    }

    /**
     * 영어 국가명을 한국어로 변환 (주요 국가만)
     */
    getKoreanName(englishName) {
        const koreanNames = {
            'South Korea': '대한민국',
            'Japan': '일본',
            'China': '중국',
            'United States': '미국',
            'United Kingdom': '영국',
            'France': '프랑스',
            'Germany': '독일',
            'Italy': '이탈리아',
            'Spain': '스페인',
            'Canada': '캐나다',
            'Australia': '호주',
            'Brazil': '브라질',
            'Mexico': '멕시코',
            'India': '인도',
            'Russia': '러시아',
            'Netherlands': '네덜란드',
            'Switzerland': '스위스',
            'Sweden': '스웨덴',
            'Norway': '노르웨이',
            'Denmark': '덴마크',
            'Finland': '핀란드',
            'Poland': '폴란드',
            'Czech Republic': '체코',
            'Austria': '오스트리아',
            'Belgium': '벨기에',
            'Portugal': '포르투갈',
            'Greece': '그리스',
            'Turkey': '터키',
            'Thailand': '태국',
            'Vietnam': '베트남',
            'Singapore': '싱가포르',
            'Malaysia': '말레이시아',
            'Indonesia': '인도네시아',
            'Philippines': '필리핀',
            'New Zealand': '뉴질랜드',
            'South Africa': '남아프리카공화국',
            'Egypt': '이집트',
            'Morocco': '모로코',
            'Argentina': '아르헨티나',
            'Chile': '칠레',
            'Peru': '페루',
            'Colombia': '콜롬비아',
            'Venezuela': '베네수엘라',
            'Uruguay': '우루과이',
            'Paraguay': '파라과이',
            'Ecuador': '에콰도르',
            'Bolivia': '볼리비아',
            'Guyana': '가이아나',
            'Suriname': '수리남',
            'French Guiana': '프랑스령 기아나'
        };

        return koreanNames[englishName] || englishName;
    }

    /**
     * 대륙명 정규화
     */
    normalizeRegion(region) {
        const regionMap = {
            'Asia': 'asia',
            'Europe': 'europe',
            'Americas': 'americas',
            'Africa': 'africa',
            'Oceania': 'oceania'
        };

        return regionMap[region] || region.toLowerCase();
    }

    /**
     * 폴백 기본 데이터 로드
     */
    loadFallbackData() {
        const fallbackCountries = [
            {
                code: 'KR',
                code3: 'KOR',
                nameKo: '대한민국',
                nameEn: 'South Korea',
                nameOfficial: 'Republic of Korea',
                flag: '🇰🇷',
                region: 'asia',
                subregion: 'Eastern Asia',
                searchable: ['대한민국', 'south korea', 'korea', 'kr', 'kor']
            },
            {
                code: 'JP',
                code3: 'JPN',
                nameKo: '일본',
                nameEn: 'Japan',
                nameOfficial: 'Japan',
                flag: '🇯🇵',
                region: 'asia',
                subregion: 'Eastern Asia',
                searchable: ['일본', 'japan', 'jp', 'jpn']
            },
            {
                code: 'US',
                code3: 'USA',
                nameKo: '미국',
                nameEn: 'United States',
                nameOfficial: 'United States of America',
                flag: '🇺🇸',
                region: 'americas',
                subregion: 'North America',
                searchable: ['미국', 'united states', 'usa', 'us', 'america']
            },
            {
                code: 'GB',
                code3: 'GBR',
                nameKo: '영국',
                nameEn: 'United Kingdom',
                nameOfficial: 'United Kingdom of Great Britain and Northern Ireland',
                flag: '🇬🇧',
                region: 'europe',
                subregion: 'Northern Europe',
                searchable: ['영국', 'united kingdom', 'uk', 'gb', 'gbr', 'england']
            },
            {
                code: 'CN',
                code3: 'CHN',
                nameKo: '중국',
                nameEn: 'China',
                nameOfficial: "People's Republic of China",
                flag: '🇨🇳',
                region: 'asia',
                subregion: 'Eastern Asia',
                searchable: ['중국', 'china', 'cn', 'chn']
            },
            {
                code: 'FR',
                code3: 'FRA',
                nameKo: '프랑스',
                nameEn: 'France',
                nameOfficial: 'French Republic',
                flag: '🇫🇷',
                region: 'europe',
                subregion: 'Western Europe',
                searchable: ['프랑스', 'france', 'fr', 'fra']
            },
            {
                code: 'DE',
                code3: 'DEU',
                nameKo: '독일',
                nameEn: 'Germany',
                nameOfficial: 'Federal Republic of Germany',
                flag: '🇩🇪',
                region: 'europe',
                subregion: 'Western Europe',
                searchable: ['독일', 'germany', 'de', 'deu']
            },
            {
                code: 'IT',
                code3: 'ITA',
                nameKo: '이탈리아',
                nameEn: 'Italy',
                nameOfficial: 'Italian Republic',
                flag: '🇮🇹',
                region: 'europe',
                subregion: 'Southern Europe',
                searchable: ['이탈리아', 'italy', 'it', 'ita']
            },
            {
                code: 'ES',
                code3: 'ESP',
                nameKo: '스페인',
                nameEn: 'Spain',
                nameOfficial: 'Kingdom of Spain',
                flag: '🇪🇸',
                region: 'europe',
                subregion: 'Southern Europe',
                searchable: ['스페인', 'spain', 'es', 'esp']
            },
            {
                code: 'CA',
                code3: 'CAN',
                nameKo: '캐나다',
                nameEn: 'Canada',
                nameOfficial: 'Canada',
                flag: '🇨🇦',
                region: 'americas',
                subregion: 'North America',
                searchable: ['캐나다', 'canada', 'ca', 'can']
            },
            {
                code: 'AU',
                code3: 'AUS',
                nameKo: '호주',
                nameEn: 'Australia',
                nameOfficial: 'Commonwealth of Australia',
                flag: '🇦🇺',
                region: 'oceania',
                subregion: 'Australia and New Zealand',
                searchable: ['호주', 'australia', 'au', 'aus']
            },
            {
                code: 'BR',
                code3: 'BRA',
                nameKo: '브라질',
                nameEn: 'Brazil',
                nameOfficial: 'Federative Republic of Brazil',
                flag: '🇧🇷',
                region: 'americas',
                subregion: 'South America',
                searchable: ['브라질', 'brazil', 'br', 'bra']
            }
        ];

        this.loadCountriesToMemory(fallbackCountries);
    }

    /**
     * 메모리에 국가 데이터 로드
     */
    loadCountriesToMemory(countries) {
        // 기존 데이터 클리어
        this.countries.clear();
        this.countriesByName.clear();
        this.countriesByCode.clear();
        this.countriesByRegion.clear();

        countries.forEach(country => {
            // 메인 맵에 추가
            this.countries.set(country.code, country);

            // 코드별 인덱스
            this.countriesByCode.set(country.code, country);
            if (country.code3) {
                this.countriesByCode.set(country.code3, country);
            }

            // 이름별 인덱스 (한국어, 영어)
            this.countriesByName.set(country.nameKo, country);
            this.countriesByName.set(country.nameEn, country);

            // 대륙별 인덱스
            if (!this.countriesByRegion.has(country.region)) {
                this.countriesByRegion.set(country.region, []);
            }
            this.countriesByRegion.get(country.region).push(country);
        });
    }

    /**
     * 검색 인덱스 구축
     */
    buildSearchIndex() {
        this.searchIndex.clear();

        this.countries.forEach(country => {
            // 검색 가능한 모든 텍스트를 인덱싱
            country.searchable.forEach(searchTerm => {
                if (!this.searchIndex.has(searchTerm)) {
                    this.searchIndex.set(searchTerm, []);
                }
                this.searchIndex.get(searchTerm).push(country);
            });

            // 부분 검색을 위한 n-gram 인덱싱
            this.buildNGramIndex(country);
        });
    }

    /**
     * N-gram 검색 인덱스 구축
     */
    buildNGramIndex(country) {
        const searchableTexts = [
            country.nameKo,
            country.nameEn,
            country.code,
            country.code3
        ].filter(Boolean);

        searchableTexts.forEach(text => {
            const lowerText = text.toLowerCase();
            
            // 2-gram과 3-gram 생성
            for (let i = 0; i <= lowerText.length - 2; i++) {
                const bigram = lowerText.substr(i, 2);
                if (!this.searchIndex.has(bigram)) {
                    this.searchIndex.set(bigram, []);
                }
                if (!this.searchIndex.get(bigram).includes(country)) {
                    this.searchIndex.get(bigram).push(country);
                }
            }

            for (let i = 0; i <= lowerText.length - 3; i++) {
                const trigram = lowerText.substr(i, 3);
                if (!this.searchIndex.has(trigram)) {
                    this.searchIndex.set(trigram, []);
                }
                if (!this.searchIndex.get(trigram).includes(country)) {
                    this.searchIndex.get(trigram).push(country);
                }
            }
        });
    }

    /**
     * 캐시에 데이터 저장
     */
    saveToCache(countries) {
        try {
            const cacheData = {
                countries,
                timestamp: Date.now(),
                version: this.cacheVersion
            };

            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.error('캐시 저장 실패:', error);
        }
    }

    /**
     * API에서 데이터 업데이트 시도
     */
    async tryUpdateFromAPI() {
        if (!this.isOnline) return;

        try {
            const apiData = await this.loadFromAPI();
            if (apiData) {
                this.loadCountriesToMemory(apiData);
                this.buildSearchIndex();
                this.saveToCache(apiData);
                console.log('국가 데이터가 API에서 업데이트되었습니다.');
            }
        } catch (error) {
            console.error('API 업데이트 실패:', error);
        }
    }

    /**
     * 모든 국가 데이터 반환
     */
    getAllCountries() {
        return Array.from(this.countries.values());
    }

    /**
     * 코드로 국가 검색
     */
    getCountryByCode(code) {
        return this.countriesByCode.get(code) || null;
    }

    /**
     * 이름으로 국가 검색
     */
    getCountryByName(name) {
        return this.countriesByName.get(name) || null;
    }

    /**
     * 대륙별 국가 목록 반환
     */
    getCountriesByRegion(region) {
        return this.countriesByRegion.get(region) || [];
    }

    /**
     * 검색어로 국가 검색 (퍼지 검색)
     */
    searchCountries(query, limit = 20) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const searchTerm = query.trim().toLowerCase();
        const results = new Map(); // 중복 제거를 위한 Map

        // 정확한 매치 우선
        if (this.searchIndex.has(searchTerm)) {
            this.searchIndex.get(searchTerm).forEach(country => {
                results.set(country.code, { country, score: 100 });
            });
        }

        // 부분 매치
        this.searchIndex.forEach((countries, index) => {
            if (index.includes(searchTerm) || searchTerm.includes(index)) {
                countries.forEach(country => {
                    if (!results.has(country.code)) {
                        const score = this.calculateSearchScore(searchTerm, index, country);
                        results.set(country.code, { country, score });
                    }
                });
            }
        });

        // 점수순 정렬 및 제한
        return Array.from(results.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.country);
    }

    /**
     * 검색 점수 계산
     */
    calculateSearchScore(query, matchedTerm, country) {
        let score = 0;

        // 정확한 매치
        if (query === matchedTerm) {
            score += 50;
        }

        // 시작 부분 매치
        if (matchedTerm.startsWith(query)) {
            score += 30;
        }

        // 포함 매치
        if (matchedTerm.includes(query)) {
            score += 20;
        }

        // 국가 코드 매치 (높은 우선순위)
        if (country.code.toLowerCase() === query || country.code3?.toLowerCase() === query) {
            score += 40;
        }

        // 한국어 이름 매치 (높은 우선순위)
        if (country.nameKo.toLowerCase().includes(query)) {
            score += 35;
        }

        return score;
    }

    /**
     * 대륙 목록 반환
     */
    getRegions() {
        return Array.from(this.countriesByRegion.keys());
    }

    /**
     * 모듈 상태 정보 반환
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isOnline: this.isOnline,
            totalCountries: this.countries.size,
            cacheVersion: this.cacheVersion,
            lastUpdate: this.getLastUpdateTime()
        };
    }

    /**
     * 마지막 업데이트 시간 반환
     */
    getLastUpdateTime() {
        try {
            const cached = this.loadFromCache();
            return cached ? new Date(cached.timestamp) : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * 메모리 정리
     */
    cleanup() {
        this.countries.clear();
        this.countriesByName.clear();
        this.countriesByCode.clear();
        this.countriesByRegion.clear();
        this.searchIndex.clear();
        this.onlineStatusListeners = [];
        this.isInitialized = false;
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const countryDataManager = new CountryDataManager();
