/**
 * 인증 에러 관리자
 * 에러 분류, 복구 전략, 사용자 경험 개선을 담당
 * @class AuthErrorManager
 * @version 1.0.0
 * @since 2024-12-29
 */
export class AuthErrorManager {
    constructor(options = {}) {
        this.options = {
            // 에러 분류 설정
            enableErrorClassification: true,
            enableErrorRecovery: true,
            enableUserFriendlyMessages: true,
            
            // 재시도 설정
            maxRetries: 3,
            retryDelay: 1000, // ms
            exponentialBackoff: true,
            
            // 에러 보고 설정
            enableErrorReporting: true,
            reportEndpoint: null,
            reportBatchSize: 10,
            reportInterval: 30000, // 30초
            
            // 에러 저장 설정
            enableErrorStorage: true,
            maxStoredErrors: 100,
            storageKey: 'auth_errors',
            
            ...options
        };
        
        // 에러 분류 매핑
        this.errorClassifications = {
            // 네트워크 에러
            NETWORK_ERROR: {
                patterns: [/network/i, /fetch/i, /timeout/i, /connection/i],
                severity: 'high',
                recoverable: true,
                userMessage: '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
                recoveryStrategy: 'retry'
            },
            
            // 인증 에러
            AUTH_ERROR: {
                patterns: [/unauthorized/i, /forbidden/i, /invalid.*token/i, /expired/i],
                severity: 'high',
                recoverable: true,
                userMessage: '인증에 실패했습니다. 다시 로그인해주세요.',
                recoveryStrategy: 'reauthenticate'
            },
            
            // 유효성 검사 에러
            VALIDATION_ERROR: {
                patterns: [/validation/i, /invalid.*input/i, /required.*field/i],
                severity: 'medium',
                recoverable: true,
                userMessage: '입력한 정보를 확인해주세요.',
                recoveryStrategy: 'showFieldErrors'
            },
            
            // 서버 에러
            SERVER_ERROR: {
                patterns: [/server.*error/i, /internal.*error/i, /5\d{2}/],
                severity: 'high',
                recoverable: true,
                userMessage: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
                recoveryStrategy: 'retry'
            },
            
            // 클라이언트 에러
            CLIENT_ERROR: {
                patterns: [/4\d{2}/, /bad.*request/i, /not.*found/i],
                severity: 'medium',
                recoverable: false,
                userMessage: '요청을 처리할 수 없습니다.',
                recoveryStrategy: 'none'
            },
            
            // 알 수 없는 에러
            UNKNOWN_ERROR: {
                patterns: [/.*/],
                severity: 'medium',
                recoverable: true,
                userMessage: '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                recoveryStrategy: 'retry'
            }
        };
        
        // 에러 복구 전략
        this.recoveryStrategies = {
            retry: this.retryStrategy.bind(this),
            reauthenticate: this.reauthenticateStrategy.bind(this),
            showFieldErrors: this.showFieldErrorsStrategy.bind(this),
            none: () => Promise.resolve(false)
        };
        
        // 에러 저장소
        this.storedErrors = [];
        this.loadStoredErrors();
        
        // 에러 보고 큐
        this.errorReportQueue = [];
        this.startErrorReporting();
        
        // 재시도 상태
        this.retryStates = new Map();
    }

    /**
     * 에러를 처리합니다
     * @param {Error|string} error - 에러 객체 또는 메시지
     * @param {Object} context - 에러 컨텍스트
     * @returns {Promise<Object>} 처리 결과
     */
    async handleError(error, context = {}) {
        const errorInfo = this.classifyError(error, context);
        const processedError = this.processError(errorInfo);
        
        // 에러 저장
        if (this.options.enableErrorStorage) {
            this.storeError(processedError);
        }
        
        // 에러 보고
        if (this.options.enableErrorReporting) {
            this.queueErrorReport(processedError);
        }
        
        // 복구 시도
        if (this.options.enableErrorRecovery && errorInfo.recoverable) {
            const recoveryResult = await this.attemptRecovery(errorInfo, context);
            if (recoveryResult.success) {
                return {
                    success: true,
                    recovered: true,
                    error: processedError,
                    recovery: recoveryResult
                };
            }
        }
        
        return {
            success: false,
            recovered: false,
            error: processedError,
            userMessage: this.getUserFriendlyMessage(errorInfo)
        };
    }

    /**
     * 에러를 분류합니다
     * @param {Error|string} error - 에러 객체 또는 메시지
     * @param {Object} context - 에러 컨텍스트
     * @returns {Object} 분류된 에러 정보
     */
    classifyError(error, context = {}) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : null;
        
        // 에러 분류 찾기
        let classification = this.errorClassifications.UNKNOWN_ERROR;
        
        for (const [type, config] of Object.entries(this.errorClassifications)) {
            if (type === 'UNKNOWN_ERROR') continue;
            
            const matches = config.patterns.some(pattern => 
                pattern.test(errorMessage) || 
                (errorStack && pattern.test(errorStack))
            );
            
            if (matches) {
                classification = config;
                break;
            }
        }
        
        return {
            originalError: error,
            message: errorMessage,
            stack: errorStack,
            type: this.getErrorType(classification),
            severity: classification.severity,
            recoverable: classification.recoverable,
            userMessage: classification.userMessage,
            recoveryStrategy: classification.recoveryStrategy,
            context: {
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                ...context
            }
        };
    }

    /**
     * 에러를 처리합니다
     * @param {Object} errorInfo - 분류된 에러 정보
     * @returns {Object} 처리된 에러
     */
    processError(errorInfo) {
        const processedError = {
            id: this.generateErrorId(),
            ...errorInfo,
            processedAt: Date.now(),
            retryCount: 0,
            resolved: false
        };
        
        // 에러 메시지 정리
        if (this.options.enableUserFriendlyMessages) {
            processedError.displayMessage = this.getUserFriendlyMessage(errorInfo);
        }
        
        return processedError;
    }

    /**
     * 에러 복구를 시도합니다
     * @param {Object} errorInfo - 에러 정보
     * @param {Object} context - 컨텍스트
     * @returns {Promise<Object>} 복구 결과
     */
    async attemptRecovery(errorInfo, context) {
        const strategy = errorInfo.recoveryStrategy;
        const recoveryFn = this.recoveryStrategies[strategy];
        
        if (!recoveryFn) {
            return { success: false, reason: 'No recovery strategy available' };
        }
        
        try {
            const result = await recoveryFn(errorInfo, context);
            return { success: true, strategy, result };
        } catch (recoveryError) {
            return { 
                success: false, 
                reason: 'Recovery failed', 
                error: recoveryError.message 
            };
        }
    }

    /**
     * 재시도 전략을 실행합니다
     * @param {Object} errorInfo - 에러 정보
     * @param {Object} context - 컨텍스트
     * @returns {Promise<any>} 재시도 결과
     */
    async retryStrategy(errorInfo, context) {
        const retryKey = `${errorInfo.type}_${context.operation || 'unknown'}`;
        const retryState = this.retryStates.get(retryKey) || { count: 0, lastRetry: 0 };
        
        if (retryState.count >= this.options.maxRetries) {
            throw new Error('Maximum retries exceeded');
        }
        
        // 지수 백오프 계산
        const delay = this.calculateRetryDelay(retryState.count);
        await this.sleep(delay);
        
        // 재시도 카운트 증가
        retryState.count++;
        retryState.lastRetry = Date.now();
        this.retryStates.set(retryKey, retryState);
        
        // 원래 작업 재시도
        if (context.retryFn && typeof context.retryFn === 'function') {
            return await context.retryFn();
        }
        
        return true;
    }

    /**
     * 재인증 전략을 실행합니다
     * @param {Object} errorInfo - 에러 정보
     * @param {Object} context - 컨텍스트
     * @returns {Promise<any>} 재인증 결과
     */
    async reauthenticateStrategy(errorInfo, context) {
        // 토큰 갱신 시도
        if (context.refreshTokenFn && typeof context.refreshTokenFn === 'function') {
            try {
                const newToken = await context.refreshTokenFn();
                return { success: true, newToken };
            } catch (refreshError) {
                // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
                if (context.redirectToLogin && typeof context.redirectToLogin === 'function') {
                    context.redirectToLogin();
                }
                throw refreshError;
            }
        }
        
        // 로그인 페이지로 리다이렉트
        if (context.redirectToLogin && typeof context.redirectToLogin === 'function') {
            context.redirectToLogin();
        }
        
        return { success: true, redirected: true };
    }

    /**
     * 필드 에러 표시 전략을 실행합니다
     * @param {Object} errorInfo - 에러 정보
     * @param {Object} context - 컨텍스트
     * @returns {Promise<any>} 필드 에러 표시 결과
     */
    async showFieldErrorsStrategy(errorInfo, context) {
        if (context.showFieldErrors && typeof context.showFieldErrors === 'function') {
            const fieldErrors = this.extractFieldErrors(errorInfo);
            context.showFieldErrors(fieldErrors);
        }
        
        return { success: true, fieldErrors: this.extractFieldErrors(errorInfo) };
    }

    /**
     * 사용자 친화적 메시지를 가져옵니다
     * @param {Object} errorInfo - 에러 정보
     * @returns {string} 사용자 친화적 메시지
     */
    getUserFriendlyMessage(errorInfo) {
        if (errorInfo.userMessage) {
            return errorInfo.userMessage;
        }
        
        // 기본 메시지
        const defaultMessages = {
            NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
            AUTH_ERROR: '로그인이 필요합니다.',
            VALIDATION_ERROR: '입력한 정보를 확인해주세요.',
            SERVER_ERROR: '서버에 문제가 발생했습니다.',
            CLIENT_ERROR: '요청을 처리할 수 없습니다.',
            UNKNOWN_ERROR: '예상치 못한 오류가 발생했습니다.'
        };
        
        return defaultMessages[errorInfo.type] || '오류가 발생했습니다.';
    }

    /**
     * 필드 에러를 추출합니다
     * @param {Object} errorInfo - 에러 정보
     * @returns {Object} 필드 에러 객체
     */
    extractFieldErrors(errorInfo) {
        const fieldErrors = {};
        
        // 에러 메시지에서 필드 정보 추출
        const message = errorInfo.message;
        
        // 일반적인 필드 에러 패턴들
        const fieldPatterns = [
            /email.*invalid/i,
            /password.*weak/i,
            /name.*required/i,
            /phone.*invalid/i
        ];
        
        fieldPatterns.forEach(pattern => {
            if (pattern.test(message)) {
                const field = this.extractFieldName(pattern, message);
                if (field) {
                    fieldErrors[field] = this.getFieldErrorMessage(field, message);
                }
            }
        });
        
        return fieldErrors;
    }

    /**
     * 필드 이름을 추출합니다
     * @param {RegExp} pattern - 패턴
     * @param {string} message - 메시지
     * @returns {string} 필드 이름
     */
    extractFieldName(pattern, message) {
        const fieldMap = {
            email: 'email',
            password: 'password',
            name: 'name',
            phone: 'phone'
        };
        
        for (const [key, field] of Object.entries(fieldMap)) {
            if (pattern.source.includes(key)) {
                return field;
            }
        }
        
        return null;
    }

    /**
     * 필드 에러 메시지를 가져옵니다
     * @param {string} field - 필드 이름
     * @param {string} message - 원본 메시지
     * @returns {string} 필드 에러 메시지
     */
    getFieldErrorMessage(field, message) {
        const fieldMessages = {
            email: '유효한 이메일 주소를 입력해주세요.',
            password: '비밀번호를 확인해주세요.',
            name: '이름을 입력해주세요.',
            phone: '유효한 전화번호를 입력해주세요.'
        };
        
        return fieldMessages[field] || message;
    }

    /**
     * 에러 타입을 가져옵니다
     * @param {Object} classification - 분류 정보
     * @returns {string} 에러 타입
     */
    getErrorType(classification) {
        for (const [type, config] of Object.entries(this.errorClassifications)) {
            if (config === classification) {
                return type;
            }
        }
        return 'UNKNOWN_ERROR';
    }

    /**
     * 재시도 지연 시간을 계산합니다
     * @param {number} retryCount - 재시도 횟수
     * @returns {number} 지연 시간 (ms)
     */
    calculateRetryDelay(retryCount) {
        if (!this.options.exponentialBackoff) {
            return this.options.retryDelay;
        }
        
        return Math.min(
            this.options.retryDelay * Math.pow(2, retryCount),
            30000 // 최대 30초
        );
    }

    /**
     * 지정된 시간만큼 대기합니다
     * @param {number} ms - 대기 시간 (ms)
     * @returns {Promise} 대기 Promise
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 에러를 저장합니다
     * @param {Object} error - 에러 객체
     */
    storeError(error) {
        this.storedErrors.push(error);
        
        // 저장된 에러 수 제한
        if (this.storedErrors.length > this.options.maxStoredErrors) {
            this.storedErrors = this.storedErrors.slice(-this.options.maxStoredErrors);
        }
        
        // 로컬 스토리지에 저장
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.storedErrors));
        } catch (e) {
            console.warn('Failed to store error:', e);
        }
    }

    /**
     * 저장된 에러를 로드합니다
     */
    loadStoredErrors() {
        try {
            const stored = localStorage.getItem(this.options.storageKey);
            if (stored) {
                this.storedErrors = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to load stored errors:', e);
            this.storedErrors = [];
        }
    }

    /**
     * 에러 보고를 큐에 추가합니다
     * @param {Object} error - 에러 객체
     */
    queueErrorReport(error) {
        this.errorReportQueue.push(error);
        
        // 배치 크기 확인
        if (this.errorReportQueue.length >= this.options.reportBatchSize) {
            this.flushErrorReports();
        }
    }

    /**
     * 에러 보고를 시작합니다
     */
    startErrorReporting() {
        if (!this.options.enableErrorReporting || !this.options.reportEndpoint) {
            return;
        }
        
        setInterval(() => {
            this.flushErrorReports();
        }, this.options.reportInterval);
    }

    /**
     * 에러 보고를 전송합니다
     */
    async flushErrorReports() {
        if (this.errorReportQueue.length === 0) {
            return;
        }
        
        const reports = [...this.errorReportQueue];
        this.errorReportQueue = [];
        
        try {
            await fetch(this.options.reportEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    errors: reports,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                })
            });
        } catch (e) {
            console.warn('Failed to send error reports:', e);
            // 실패한 보고를 다시 큐에 추가
            this.errorReportQueue.unshift(...reports);
        }
    }

    /**
     * 에러 ID를 생성합니다
     * @returns {string} 에러 ID
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 에러 통계를 가져옵니다
     * @returns {Object} 에러 통계
     */
    getErrorStats() {
        const stats = {
            total: this.storedErrors.length,
            byType: {},
            bySeverity: {},
            recent: this.storedErrors.filter(e => 
                Date.now() - e.processedAt < 24 * 60 * 60 * 1000 // 24시간
            ).length
        };
        
        this.storedErrors.forEach(error => {
            // 타입별 통계
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            
            // 심각도별 통계
            stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
        });
        
        return stats;
    }

    /**
     * 에러를 해결된 것으로 표시합니다
     * @param {string} errorId - 에러 ID
     */
    resolveError(errorId) {
        const error = this.storedErrors.find(e => e.id === errorId);
        if (error) {
            error.resolved = true;
            error.resolvedAt = Date.now();
        }
    }

    /**
     * 리소스를 정리합니다
     */
    cleanup() {
        this.storedErrors = [];
        this.errorReportQueue = [];
        this.retryStates.clear();
        
        try {
            localStorage.removeItem(this.options.storageKey);
        } catch (e) {
            console.warn('Failed to clear stored errors:', e);
        }
    }
}
