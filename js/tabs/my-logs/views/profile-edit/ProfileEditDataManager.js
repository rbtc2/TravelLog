/**
 * ProfileEditDataManager - 프로필 편집 데이터 관리 전용 클래스
 * 
 * 🎯 책임:
 * - 사용자 프로필 데이터 로딩
 * - Supabase API 통신 및 데이터 저장
 * - 로컬 스토리지 관리
 * - 데이터 변환 및 검증
 * - 오류 처리 및 재시도 로직
 * 
 * 🔗 관계:
 * - ProfileEditView에서 사용되는 데이터 관리 전용 모듈
 * - ProfileEditFormManager와 협력하여 데이터 제공
 * - 순수 데이터 로직만 담당, UI 로직은 포함하지 않음
 * 
 * @class ProfileEditDataManager
 * @version 1.0.0
 * @since 2024-12-29
 */

class ProfileEditDataManager {
    constructor() {
        // 데이터 상태
        this.isLoading = false;
        this.lastError = null;
        
        // 캐시 설정
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5분
        
        // API 설정
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1초
        
        // 콜백 함수들 (ProfileEditView에서 설정)
        this.callbacks = {
            onDataLoad: null,
            onDataSave: null,
            onError: null,
            onLoadingChange: null
        };
        
        // 로컬 스토리지 키
        this.storageKey = 'travelLog_profile';
    }

    /**
     * 사용자 프로필 데이터를 로드합니다
     * @returns {Promise<Object>} 프로필 데이터
     */
    async loadUserProfileData() {
        try {
            this.setLoading(true);
            
            // 현재 사용자 정보 로드
            const userData = await this.getCurrentUserData();
            
            // 로컬 저장된 프로필 데이터 로드
            const savedData = this.loadLocalProfileData();
            
            // 사용자 정보와 로컬 데이터 병합 (사용자 정보 우선)
            const mergedData = this.mergeProfileData(userData, savedData);
            
            // 캐시에 저장
            this.cacheData('profile', mergedData);
            
            // 콜백 호출
            if (this.callbacks.onDataLoad) {
                this.callbacks.onDataLoad(mergedData);
            }
            
            return mergedData;
            
        } catch (error) {
            this.handleError('프로필 데이터 로드 실패', error);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * 프로필 데이터를 저장합니다
     * @param {Object} profileData - 저장할 프로필 데이터
     * @returns {Promise<Object>} 저장 결과
     */
    async saveProfileData(profileData) {
        try {
            this.setLoading(true);
            
            // 데이터 검증
            this.validateProfileData(profileData);
            
            // Supabase 사용자 정보 업데이트
            await this.updateSupabaseProfile(profileData);
            
            // 로컬 스토리지에도 저장 (기존 호환성 유지)
            this.saveLocalProfileData(profileData);
            
            // 캐시 업데이트
            this.cacheData('profile', profileData);
            
            // 콜백 호출
            if (this.callbacks.onDataSave) {
                this.callbacks.onDataSave(profileData);
            }
            
            return {
                success: true,
                data: profileData
            };
            
        } catch (error) {
            this.handleError('프로필 데이터 저장 실패', error);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * 현재 사용자 정보를 가져옵니다
     * @returns {Promise<Object>} 사용자 데이터
     */
    async getCurrentUserData() {
        try {
            // 캐시 확인
            const cached = this.getCachedData('user');
            if (cached) {
                return cached;
            }
            
            // Supabase에서 사용자 정보 가져오기
            const { data: { user }, error } = await this.getSupabaseClient().auth.getUser();
            
            if (error) {
                throw new Error(`사용자 정보 조회 실패: ${error.message}`);
            }
            
            if (!user) {
                throw new Error('로그인된 사용자가 없습니다.');
            }
            
            const userData = {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || '',
                residenceCountry: user.user_metadata?.residence_country || '',
                avatar: user.user_metadata?.avatar_url || null,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            };
            
            // 캐시에 저장
            this.cacheData('user', userData);
            
            return userData;
            
        } catch (error) {
            console.error('사용자 정보 조회 실패:', error);
            // 오류 발생 시 빈 객체 반환 (오프라인 모드 지원)
            return {
                id: null,
                email: '',
                name: '',
                residenceCountry: '',
                avatar: null
            };
        }
    }

    /**
     * Supabase 프로필을 업데이트합니다
     * @param {Object} profileData - 업데이트할 프로필 데이터
     * @returns {Promise<Object>} 업데이트 결과
     */
    async updateSupabaseProfile(profileData) {
        const client = this.getSupabaseClient();
        
        // 재시도 로직과 함께 업데이트 실행
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const { data, error } = await client.auth.updateUser({
                    data: {
                        full_name: profileData.name,
                        residence_country: profileData.residenceCountry,
                        avatar_url: profileData.avatar,
                        updated_at: new Date().toISOString()
                    }
                });
                
                if (error) {
                    throw new Error(`Supabase 업데이트 실패: ${error.message}`);
                }
                
                return data;
                
            } catch (error) {
                if (attempt === this.maxRetries) {
                    throw error;
                }
                
                // 지수 백오프로 재시도
                const delay = this.retryDelay * Math.pow(2, attempt - 1);
                console.warn(`Supabase 업데이트 실패 (시도 ${attempt}/${this.maxRetries}), ${delay}ms 후 재시도:`, error);
                
                await this.delay(delay);
            }
        }
    }

    /**
     * 로컬 프로필 데이터를 로드합니다
     * @returns {Object} 로컬 프로필 데이터
     */
    loadLocalProfileData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            return savedData ? JSON.parse(savedData) : {};
        } catch (error) {
            console.error('로컬 프로필 데이터 로드 실패:', error);
            return {};
        }
    }

    /**
     * 로컬 프로필 데이터를 저장합니다
     * @param {Object} profileData - 저장할 프로필 데이터
     */
    saveLocalProfileData(profileData) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(profileData));
        } catch (error) {
            console.error('로컬 프로필 데이터 저장 실패:', error);
            // 로컬 스토리지 오류는 치명적이지 않으므로 예외를 다시 던지지 않음
        }
    }

    /**
     * 사용자 정보와 로컬 데이터를 병합합니다
     * @param {Object} userData - 사용자 정보
     * @param {Object} localData - 로컬 데이터
     * @returns {Object} 병합된 데이터
     */
    mergeProfileData(userData, localData) {
        return {
            name: userData.name || localData.name || '여행자',
            bio: localData.bio || 'I am new to TravelLog.',
            residenceCountry: userData.residenceCountry || localData.residenceCountry || '',
            avatar: localData.avatar || null,
            defaultAvatar: localData.defaultAvatar || '✈️',
            // 메타데이터
            userId: userData.id,
            email: userData.email,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * 프로필 데이터를 검증합니다
     * @param {Object} profileData - 검증할 프로필 데이터
     * @throws {Error} 검증 실패 시
     */
    validateProfileData(profileData) {
        if (!profileData || typeof profileData !== 'object') {
            throw new Error('유효하지 않은 프로필 데이터입니다.');
        }
        
        // 필수 필드 검증
        if (!profileData.name || typeof profileData.name !== 'string') {
            throw new Error('이름은 필수 항목입니다.');
        }
        
        if (profileData.name.trim().length < 2) {
            throw new Error('이름은 최소 2자 이상이어야 합니다.');
        }
        
        if (profileData.name.trim().length > 20) {
            throw new Error('이름은 최대 20자까지 입력할 수 있습니다.');
        }
        
        // 바이오 검증
        if (profileData.bio && profileData.bio.length > 100) {
            throw new Error('바이오는 최대 100자까지 입력할 수 있습니다.');
        }
        
        // 거주국 검증
        if (!profileData.residenceCountry || typeof profileData.residenceCountry !== 'string') {
            throw new Error('거주국은 필수 항목입니다.');
        }
    }

    /**
     * Supabase 클라이언트를 가져옵니다
     * @returns {Object} Supabase 클라이언트
     */
    getSupabaseClient() {
        if (typeof window !== 'undefined' && window.supabase) {
            return window.supabase;
        }
        
        throw new Error('Supabase 클라이언트를 사용할 수 없습니다.');
    }

    /**
     * 데이터를 캐시에 저장합니다
     * @param {string} key - 캐시 키
     * @param {Object} data - 저장할 데이터
     */
    cacheData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * 캐시에서 데이터를 가져옵니다
     * @param {string} key - 캐시 키
     * @returns {Object|null} 캐시된 데이터 또는 null
     */
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        // 캐시 만료 확인
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    /**
     * 로딩 상태를 설정합니다
     * @param {boolean} loading - 로딩 상태
     */
    setLoading(loading) {
        this.isLoading = loading;
        
        if (this.callbacks.onLoadingChange) {
            this.callbacks.onLoadingChange(loading);
        }
    }

    /**
     * 오류를 처리합니다
     * @param {string} message - 오류 메시지
     * @param {Error} error - 오류 객체
     */
    handleError(message, error) {
        this.lastError = {
            message,
            error,
            timestamp: Date.now()
        };
        
        console.error(message, error);
        
        if (this.callbacks.onError) {
            this.callbacks.onError(message, error);
        }
    }

    /**
     * 지연 함수
     * @param {number} ms - 지연 시간 (밀리초)
     * @returns {Promise} 지연된 Promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 콜백 함수를 설정합니다
     * @param {string} eventType - 이벤트 타입
     * @param {Function} callback - 콜백 함수
     */
    setCallback(eventType, callback) {
        if (this.callbacks.hasOwnProperty(eventType)) {
            this.callbacks[eventType] = callback;
        }
    }

    /**
     * 모든 콜백 함수를 설정합니다
     * @param {Object} callbacks - 콜백 함수들
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * 현재 로딩 상태를 가져옵니다
     * @returns {boolean} 로딩 상태
     */
    isLoading() {
        return this.isLoading;
    }

    /**
     * 마지막 오류를 가져옵니다
     * @returns {Object|null} 마지막 오류 또는 null
     */
    getLastError() {
        return this.lastError;
    }

    /**
     * 캐시를 정리합니다
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * DataManager 정리
     */
    cleanup() {
        this.isLoading = false;
        this.lastError = null;
        this.clearCache();
        this.callbacks = {
            onDataLoad: null,
            onDataSave: null,
            onError: null,
            onLoadingChange: null
        };
    }
}

export { ProfileEditDataManager };
