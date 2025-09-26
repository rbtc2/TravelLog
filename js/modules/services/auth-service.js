/**
 * TravelLog 인증 서비스
 * Supabase를 이용한 이메일/비밀번호 인증 관리
 */

import { initializeSupabase, getSupabaseClient } from '../../config/supabase-config.js';
import { toastManager } from '../ui-components/toast-manager.js';

class AuthService {
    constructor() {
        this.client = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.isRedirecting = false;
        this.authStateListeners = [];
    }

    /**
     * 인증 서비스를 초기화합니다
     */
    async initialize() {
        try {
            this.client = await initializeSupabase();
            this.isInitialized = true;
            
            // 현재 세션 확인
            await this.checkCurrentSession();
            
            // 인증 상태 변경 리스너 등록
            this.setupAuthStateListener();
            
            console.log('인증 서비스가 초기화되었습니다.');
        } catch (error) {
            console.error('인증 서비스 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 현재 세션을 확인합니다
     */
    async checkCurrentSession() {
        if (!this.client) return;

        try {
            const { data: { session }, error } = await this.client.auth.getSession();
            
            if (error) {
                console.error('세션 확인 실패:', error);
                return;
            }

            if (session) {
                this.currentUser = session.user;
                console.log('현재 사용자:', this.currentUser.email);
            }
        } catch (error) {
            console.error('세션 확인 중 오류:', error);
        }
    }

    /**
     * 인증 상태 변경 리스너를 설정합니다
     */
    setupAuthStateListener() {
        if (!this.client) return;

        this.client.auth.onAuthStateChange((event, session) => {
            this.currentUser = session?.user || null;
            
            // 등록된 리스너들에게 알림
            this.authStateListeners.forEach(listener => {
                try {
                    listener(event, session);
                } catch (error) {
                    console.error('인증 상태 리스너 오류:', error);
                }
            });
        });
    }

    /**
     * 인증 상태 변경 리스너를 등록합니다
     * @param {Function} listener - 리스너 함수
     */
    onAuthStateChange(listener) {
        this.authStateListeners.push(listener);
    }

    /**
     * 이메일과 비밀번호로 회원가입합니다
     * @param {string} email - 이메일
     * @param {string} password - 비밀번호
     * @param {Object} userData - 추가 사용자 데이터
     * @returns {Promise<Object>} 회원가입 결과
     */
    async signUp(email, password, userData = {}) {
        if (!this.isInitialized) {
            throw new Error('인증 서비스가 초기화되지 않았습니다.');
        }

        try {
            const { data, error } = await this.client.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: userData.fullName || '',
                        residence_country: userData.residenceCountry || '',
                        avatar_url: userData.avatarUrl || '',
                        created_at: new Date().toISOString()
                    }
                }
            });

            if (error) {
                console.error('Supabase signUp 오류 상세:', error);
                console.error('오류 코드:', error.code);
                console.error('오류 메시지:', error.message);
                console.error('오류 세부사항:', error.details);
                throw new Error(this.getErrorMessage(error));
            }

            // 이메일 확인이 필요한 경우
            if (data.user && !data.session) {
                toastManager.show('이메일 확인 링크를 발송했습니다. 이메일을 확인해주세요.', 'info');
                return {
                    success: true,
                    needsEmailConfirmation: true,
                    user: data.user
                };
            }

            // 즉시 로그인된 경우
            if (data.session) {
                this.currentUser = data.user;
                toastManager.show('회원가입이 완료되었습니다!', 'success');
                return {
                    success: true,
                    needsEmailConfirmation: false,
                    user: data.user,
                    session: data.session
                };
            }

        } catch (error) {
            console.error('회원가입 실패:', error);
            toastManager.show(error.message, 'error');
            throw error;
        }
    }

    /**
     * 이메일과 비밀번호로 로그인합니다
     * @param {string} email - 이메일
     * @param {string} password - 비밀번호
     * @param {boolean} remember - 로그인 상태 유지 여부
     * @returns {Promise<Object>} 로그인 결과
     */
    async signIn(email, password, remember = false) {
        if (!this.isInitialized) {
            throw new Error('인증 서비스가 초기화되지 않았습니다.');
        }

        if (!this.client) {
            throw new Error('Supabase 클라이언트가 없습니다.');
        }

        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw new Error(this.getErrorMessage(error));
            }

            this.currentUser = data.user;

            toastManager.show('로그인되었습니다!', 'success');
            return {
                success: true,
                user: data.user,
                session: data.session
            };

        } catch (error) {
            console.error('로그인 실패:', error);
            toastManager.show(error.message, 'error');
            throw error;
        }
    }

    /**
     * 로그아웃합니다
     * @returns {Promise<Object>} 로그아웃 결과
     */
    async signOut() {
        if (!this.isInitialized) {
            throw new Error('인증 서비스가 초기화되지 않았습니다.');
        }

        try {
            const { error } = await this.client.auth.signOut();

            if (error) {
                throw new Error(this.getErrorMessage(error));
            }

            this.currentUser = null;
            
            // 로그아웃 후 로그인 화면으로 리다이렉트
            setTimeout(() => {
                this.redirectToLogin();
            }, 1000);
            
            return {
                success: true
            };

        } catch (error) {
            console.error('로그아웃 실패:', error);
            toastManager.show(error.message, 'error');
            throw error;
        }
    }

    /**
     * 로그인 화면으로 리다이렉트합니다
     */
    redirectToLogin() {
        // 중복 리다이렉트 방지
        if (this.isRedirecting) {
            return;
        }
        this.isRedirecting = true;

        // 메인 앱 숨기기
        const mainApp = document.getElementById('main-app');
        if (mainApp) {
            mainApp.classList.add('hidden');
        }

        // 로그인 화면 표시
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.style.display = 'flex';
        }

        // URL을 로그인 페이지로 변경 (선택사항)
        if (window.history && window.history.replaceState) {
            window.history.replaceState({}, '', window.location.pathname);
        }

        // 앱 매니저에 로그아웃 알림
        if (window.appManager && typeof window.appManager.logoutSuccess === 'function') {
            window.appManager.logoutSuccess();
        }

        // 리다이렉트 상태 리셋
        setTimeout(() => {
            this.isRedirecting = false;
        }, 2000);
    }

    /**
     * 현재 사용자 정보를 반환합니다
     * @returns {Object|null} 사용자 정보
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * 로그인 상태를 확인합니다
     * @returns {boolean} 로그인 상태
     */
    isLoggedIn() {
        return !!this.currentUser;
    }

    /**
     * 사용자 프로필을 가져옵니다
     * @returns {Promise<Object>} 프로필 정보
     */
    async getProfile() {
        if (!this.isInitialized || !this.currentUser) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            const { data, error } = await this.client
                .from('user_profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error) {
                throw new Error(this.getErrorMessage(error));
            }

            return data;

        } catch (error) {
            console.error('프로필 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 사용자 프로필을 업데이트합니다
     * @param {Object} updates - 업데이트할 데이터
     * @returns {Promise<Object>} 업데이트 결과
     */
    async updateProfile(updates) {
        if (!this.isInitialized || !this.currentUser) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            // Supabase auth 사용자 정보 업데이트
            const authUpdates = {};
            if (updates.full_name) authUpdates.data = { full_name: updates.full_name };
            if (updates.avatar_url) authUpdates.data = { ...authUpdates.data, avatar_url: updates.avatar_url };

            if (Object.keys(authUpdates).length > 0) {
                const { error: authError } = await this.client.auth.updateUser(authUpdates);
                if (authError) {
                    throw new Error(this.getErrorMessage(authError));
                }
            }

            // 프로필 테이블 업데이트
            const { data, error } = await this.client
                .from('user_profiles')
                .update(updates)
                .eq('id', this.currentUser.id)
                .select()
                .single();

            if (error) {
                throw new Error(this.getErrorMessage(error));
            }

            toastManager.show('프로필이 업데이트되었습니다.', 'success');
            
            return {
                success: true,
                profile: data
            };

        } catch (error) {
            console.error('프로필 업데이트 실패:', error);
            toastManager.show(error.message, 'error');
            throw error;
        }
    }

    /**
     * 비밀번호를 재설정합니다
     * @param {string} email - 이메일
     * @returns {Promise<Object>} 재설정 결과
     */
    async resetPassword(email) {
        if (!this.isInitialized) {
            throw new Error('인증 서비스가 초기화되지 않았습니다.');
        }

        try {
            // 현재 도메인을 사용하여 리다이렉트 URL 설정
            const redirectTo = `${window.location.origin}`;
            
            const { error } = await this.client.auth.resetPasswordForEmail(email, {
                redirectTo: redirectTo
            });

            if (error) {
                throw new Error(this.getErrorMessage(error));
            }

            toastManager.show('비밀번호 재설정 링크를 이메일로 발송했습니다.', 'info');
            
            return {
                success: true
            };

        } catch (error) {
            console.error('비밀번호 재설정 실패:', error);
            toastManager.show(error.message, 'error');
            throw error;
        }
    }

    /**
     * Supabase 오류 메시지를 한국어로 변환합니다
     * @param {Object} error - Supabase 오류 객체
     * @returns {string} 한국어 오류 메시지
     */
    getErrorMessage(error) {
        const errorMessages = {
            'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
            'Email not confirmed': '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
            'User already registered': '이미 등록된 이메일입니다.',
            'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
            'Invalid email': '올바른 이메일 형식이 아닙니다.',
            'Signup requires a valid password': '유효한 비밀번호가 필요합니다.',
            'User not found': '사용자를 찾을 수 없습니다.',
            'Too many requests': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
            'Network request failed': '네트워크 연결을 확인해주세요.',
            'Invalid API key': 'API 키가 유효하지 않습니다.',
            'Service unavailable': '서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
            'Database error saving new user': '사용자 정보 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            'Database error': '데이터베이스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        };

        return errorMessages[error.message] || error.message || '알 수 없는 오류가 발생했습니다.';
    }

    /**
     * 인증 서비스를 정리합니다
     */
    cleanup() {
        this.authStateListeners = [];
        this.currentUser = null;
        this.isInitialized = false;
    }
}

// 싱글톤 인스턴스 생성
export const authService = new AuthService();
