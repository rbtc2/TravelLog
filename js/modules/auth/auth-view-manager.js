/**
 * TravelLog 인증 뷰 관리자 (리팩토링됨)
 * 인증 관련 UI 뷰 관리 및 전환을 담당
 * 
 * @version 2.0.0
 * @since 2024-12-29
 */

import { 
    LoginView, 
    SignupView, 
    ForgotPasswordView, 
    EmailConfirmationView, 
    EmailSentView 
} from './views/index.js';

/**
 * 인증 뷰 관리자 클래스
 * 인증 관련 UI 뷰의 렌더링과 전환을 담당
 */
class AuthViewManager {
    constructor() {
        this.loginScreen = null;
        this.currentView = 'login'; // 'login' | 'signup' | 'forgot-password' | 'email-confirmation' | 'email-sent'
        
        // 뷰 인스턴스들
        this.views = new Map();
        this.currentViewInstance = null;
        
        // 콜백 함수들 (외부에서 주입받을 수 있도록)
        this.onViewChange = null;
        this.onSubmit = null;
        this.onError = null;
    }

    /**
     * 뷰 관리자를 초기화합니다
     * @param {Object} callbacks - 콜백 함수들
     * @param {Function} callbacks.onViewChange - 뷰 변경 콜백
     * @param {Function} callbacks.onSubmit - 폼 제출 콜백
     * @param {Function} callbacks.onError - 에러 콜백
     */
    initialize(callbacks = {}) {
        this.onViewChange = callbacks.onViewChange || (() => {});
        this.onSubmit = callbacks.onSubmit || (() => {});
        this.onError = callbacks.onError || (() => {});

        // DOM 요소 가져오기
        this.loginScreen = document.getElementById('login-screen');
        
        if (!this.loginScreen) {
            console.error('AuthViewManager: login-screen 요소를 찾을 수 없습니다.');
            return;
        }

        // 뷰 인스턴스들 초기화
        this.initializeViews();
    }

    /**
     * 뷰 인스턴스들을 초기화합니다
     */
    initializeViews() {
        const viewConfigs = {
            'login': { viewClass: LoginView, config: {} },
            'signup': { viewClass: SignupView, config: {} },
            'forgot-password': { viewClass: ForgotPasswordView, config: {} },
            'email-confirmation': { viewClass: EmailConfirmationView, config: {} },
            'email-sent': { viewClass: EmailSentView, config: {} }
        };

        Object.entries(viewConfigs).forEach(([viewName, { viewClass, config }]) => {
            try {
                // 뷰 인스턴스 생성 (컨테이너는 나중에 설정)
                const viewInstance = new viewClass(null, config);
                
                // 콜백 함수들을 바인딩하여 컨텍스트 유지
                const callbacks = {
                    onViewChange: (newViewName) => {
                        this.handleViewChange(newViewName);
                    },
                    onSubmit: (data) => {
                        this.handleSubmit(data);
                    },
                    onError: (message) => {
                        this.handleError(message);
                    }
                };
                
                viewInstance.initialize(callbacks);
                this.views.set(viewName, viewInstance);
                
                // 뷰 초기화 완료 (조용히)
            } catch (error) {
                console.error(`AuthViewManager: ${viewName} 뷰 초기화 실패:`, error);
            }
        });
    }

    /**
     * 로그인 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showLoginView(skipCallback = false) {
        this.showView('login', skipCallback);
    }

    /**
     * 회원가입 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showSignupView(skipCallback = false) {
        this.showView('signup', skipCallback);
    }

    /**
     * 비밀번호 찾기 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showForgotPasswordView(skipCallback = false) {
        this.showView('forgot-password', skipCallback);
    }

    /**
     * 이메일 확인 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showEmailConfirmationView(skipCallback = false) {
        this.showView('email-confirmation', skipCallback);
    }

    /**
     * 이메일 발송 완료 뷰를 표시합니다
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showEmailSentView(skipCallback = false) {
        this.showView('email-sent', skipCallback);
    }

    /**
     * 지정된 뷰를 표시합니다
     * @param {string} viewName - 뷰 이름
     * @param {boolean} skipCallback - 콜백 호출을 건너뛸지 여부
     */
    showView(viewName, skipCallback = false) {
        const viewInstance = this.views.get(viewName);
        if (!viewInstance) {
            console.error(`AuthViewManager: ${viewName} 뷰를 찾을 수 없습니다.`);
            return;
        }

        // 이전 뷰 정리
        if (this.currentViewInstance && this.currentViewInstance !== viewInstance) {
            this.currentViewInstance.cleanup();
        }

        // 새 뷰 렌더링
        this.currentView = viewName;
        this.currentViewInstance = viewInstance;
        
        // 컨테이너를 다시 설정 (중요!)
        viewInstance.container = this.loginScreen;
        
        try {
            viewInstance.render(skipCallback);
        } catch (error) {
            console.error(`AuthViewManager: ${viewName} 뷰 렌더링 실패:`, error);
        }
    }

    /**
     * 뷰 변경을 처리합니다
     * @param {string} viewName - 뷰 이름
     */
    handleViewChange(viewName) {
        this.onViewChange(viewName);
    }

    /**
     * 폼 제출을 처리합니다
     * @param {Object} data - 제출 데이터
     */
    handleSubmit(data) {
        this.onSubmit(data);
    }

    /**
     * 에러를 처리합니다
     * @param {string} message - 에러 메시지
     */
    handleError(message) {
        this.onError(message);
    }

    /**
     * 로딩 상태를 설정합니다
     * @param {boolean} isLoading - 로딩 상태
     */
    setLoadingState(isLoading) {
        if (this.currentViewInstance && this.currentViewInstance.setLoadingState) {
            this.currentViewInstance.setLoadingState(isLoading);
        }
    }

    /**
     * 뷰를 정리합니다
     */
    cleanup() {
        if (this.currentViewInstance) {
            this.currentViewInstance.cleanup();
        }
        
        this.views.forEach(view => view.cleanup());
        this.views.clear();
        
        this.loginScreen = null;
        this.currentView = 'login';
        this.currentViewInstance = null;
        this.onViewChange = null;
        this.onSubmit = null;
        this.onError = null;
    }
}

export { AuthViewManager };