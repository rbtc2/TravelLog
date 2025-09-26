/**
 * 통일된 에러 처리 시스템
 * TravelLog 프로젝트의 모든 에러를 일관되게 처리합니다.
 * 
 * @author TravelLog Team
 * @version 1.0.0
 * @since 2024-12-19
 */

/**
 * 에러 타입 정의
 */
export const ERROR_TYPES = {
    // 네트워크 관련 에러
    NETWORK: 'NETWORK',
    NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
    NETWORK_OFFLINE: 'NETWORK_OFFLINE',
    
    // 인증 관련 에러
    AUTHENTICATION: 'AUTHENTICATION',
    AUTHENTICATION_EXPIRED: 'AUTHENTICATION_EXPIRED',
    AUTHENTICATION_INVALID: 'AUTHENTICATION_INVALID',
    
    // 데이터 관련 에러
    DATA_VALIDATION: 'DATA_VALIDATION',
    DATA_NOT_FOUND: 'DATA_NOT_FOUND',
    DATA_CORRUPTION: 'DATA_CORRUPTION',
    
    // 시스템 관련 에러
    SYSTEM_INITIALIZATION: 'SYSTEM_INITIALIZATION',
    SYSTEM_MEMORY: 'SYSTEM_MEMORY',
    SYSTEM_PERMISSION: 'SYSTEM_PERMISSION',
    
    // 사용자 입력 관련 에러
    USER_INPUT: 'USER_INPUT',
    USER_INPUT_INVALID: 'USER_INPUT_INVALID',
    USER_INPUT_MISSING: 'USER_INPUT_MISSING',
    
    // 비즈니스 로직 관련 에러
    BUSINESS_LOGIC: 'BUSINESS_LOGIC',
    BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
    
    // 알 수 없는 에러
    UNKNOWN: 'UNKNOWN'
};

/**
 * 에러 심각도 정의
 */
export const ERROR_SEVERITY = {
    LOW: 'LOW',           // 정보성 에러 (로깅만)
    MEDIUM: 'MEDIUM',     // 경고성 에러 (사용자에게 알림)
    HIGH: 'HIGH',         // 심각한 에러 (사용자에게 명확한 안내)
    CRITICAL: 'CRITICAL'  // 치명적 에러 (앱 중단 가능성)
};

/**
 * 에러 처리 옵션
 */
export const ERROR_OPTIONS = {
    // 기본 옵션
    DEFAULT: {
        showToast: true,
        logToConsole: true,
        logToStorage: false,
        showUserMessage: true,
        autoRetry: false,
        retryCount: 0,
        retryDelay: 1000
    },
    
    // 네트워크 에러 옵션
    NETWORK: {
        showToast: true,
        logToConsole: true,
        logToStorage: true,
        showUserMessage: true,
        autoRetry: true,
        retryCount: 3,
        retryDelay: 2000
    },
    
    // 인증 에러 옵션
    AUTHENTICATION: {
        showToast: true,
        logToConsole: true,
        logToStorage: true,
        showUserMessage: true,
        autoRetry: false,
        retryCount: 0,
        retryDelay: 0
    },
    
    // 데이터 검증 에러 옵션
    DATA_VALIDATION: {
        showToast: false,
        logToConsole: true,
        logToStorage: false,
        showUserMessage: true,
        autoRetry: false,
        retryCount: 0,
        retryDelay: 0
    },
    
    // 시스템 에러 옵션
    SYSTEM: {
        showToast: true,
        logToConsole: true,
        logToStorage: true,
        showUserMessage: true,
        autoRetry: false,
        retryCount: 0,
        retryDelay: 0
    }
};

/**
 * 통일된 에러 핸들러 클래스
 */
class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.isInitialized = false;
        this.eventListeners = [];
        
        this.init();
    }
    
    /**
     * 에러 핸들러 초기화
     */
    init() {
        try {
            // 전역 에러 핸들러 등록
            this.setupGlobalErrorHandlers();
            
            // 에러 로그 초기화
            this.loadErrorLog();
            
            this.isInitialized = true;
            console.log('ErrorHandler: 초기화 완료');
        } catch (error) {
            console.error('ErrorHandler: 초기화 실패:', error);
        }
    }
    
    /**
     * 전역 에러 핸들러 설정
     */
    setupGlobalErrorHandlers() {
        // JavaScript 에러 핸들러
        window.addEventListener('error', (event) => {
            this.handleError({
                type: ERROR_TYPES.UNKNOWN,
                severity: ERROR_SEVERITY.HIGH,
                message: event.message,
                stack: event.error?.stack,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                source: 'GlobalErrorHandler'
            });
        });
        
        // Promise rejection 핸들러
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: ERROR_TYPES.UNKNOWN,
                severity: ERROR_SEVERITY.HIGH,
                message: event.reason?.message || 'Unhandled Promise Rejection',
                stack: event.reason?.stack,
                source: 'PromiseRejectionHandler'
            });
        });
    }
    
    /**
     * 에러 처리 메인 메서드
     * @param {Object} errorInfo - 에러 정보
     * @param {Object} options - 처리 옵션
     */
    handleError(errorInfo, options = {}) {
        try {
            // 에러 정보 정규화
            const normalizedError = this.normalizeError(errorInfo);
            
            // 처리 옵션 결정
            const processingOptions = this.determineOptions(normalizedError, options);
            
            // 에러 로깅
            this.logError(normalizedError, processingOptions);
            
            // 사용자에게 알림
            this.notifyUser(normalizedError, processingOptions);
            
            // 자동 재시도
            if (processingOptions.autoRetry && processingOptions.retryCount > 0) {
                this.scheduleRetry(normalizedError, processingOptions);
            }
            
            // 에러 로그에 추가
            this.addToErrorLog(normalizedError);
            
        } catch (error) {
            console.error('ErrorHandler: 에러 처리 중 오류 발생:', error);
        }
    }
    
    /**
     * 에러 정보 정규화
     * @param {Object} errorInfo - 원본 에러 정보
     * @returns {Object} 정규화된 에러 정보
     */
    normalizeError(errorInfo) {
        const timestamp = new Date().toISOString();
        const id = this.generateErrorId();
        
        return {
            id,
            timestamp,
            type: errorInfo.type || ERROR_TYPES.UNKNOWN,
            severity: errorInfo.severity || ERROR_SEVERITY.MEDIUM,
            message: errorInfo.message || '알 수 없는 오류가 발생했습니다.',
            stack: errorInfo.stack || null,
            source: errorInfo.source || 'Unknown',
            context: errorInfo.context || {},
            userMessage: errorInfo.userMessage || null,
            filename: errorInfo.filename || null,
            lineno: errorInfo.lineno || null,
            colno: errorInfo.colno || null
        };
    }
    
    /**
     * 처리 옵션 결정
     * @param {Object} error - 정규화된 에러 정보
     * @param {Object} customOptions - 사용자 정의 옵션
     * @returns {Object} 최종 처리 옵션
     */
    determineOptions(error, customOptions = {}) {
        const baseOptions = ERROR_OPTIONS[error.type] || ERROR_OPTIONS.DEFAULT;
        return { ...baseOptions, ...customOptions };
    }
    
    /**
     * 에러 로깅
     * @param {Object} error - 정규화된 에러 정보
     * @param {Object} options - 처리 옵션
     */
    logError(error, options) {
        // 콘솔 로깅
        if (options.logToConsole) {
            this.logToConsole(error);
        }
        
        // 스토리지 로깅
        if (options.logToStorage) {
            this.logToStorage(error);
        }
    }
    
    /**
     * 콘솔에 에러 로깅
     * @param {Object} error - 정규화된 에러 정보
     */
    logToConsole(error) {
        const logMethod = this.getConsoleMethod(error.severity);
        const logMessage = this.formatLogMessage(error);
        
        logMethod(logMessage);
        
        // 스택 트레이스가 있으면 별도로 출력
        if (error.stack) {
            console.group('Stack Trace');
            console.log(error.stack);
            console.groupEnd();
        }
    }
    
    /**
     * 콘솔 메서드 결정
     * @param {string} severity - 에러 심각도
     * @returns {Function} 콘솔 메서드
     */
    getConsoleMethod(severity) {
        switch (severity) {
            case ERROR_SEVERITY.LOW:
                return console.info;
            case ERROR_SEVERITY.MEDIUM:
                return console.warn;
            case ERROR_SEVERITY.HIGH:
            case ERROR_SEVERITY.CRITICAL:
                return console.error;
            default:
                return console.log;
        }
    }
    
    /**
     * 로그 메시지 포맷팅
     * @param {Object} error - 정규화된 에러 정보
     * @returns {string} 포맷된 로그 메시지
     */
    formatLogMessage(error) {
        return `[${error.timestamp}] ${error.type}: ${error.message} (Source: ${error.source})`;
    }
    
    /**
     * 스토리지에 에러 로깅
     * @param {Object} error - 정규화된 에러 정보
     */
    logToStorage(error) {
        try {
            const errorLog = JSON.parse(localStorage.getItem('travelLog_errorLog') || '[]');
            errorLog.push(error);
            
            // 최대 크기 제한
            if (errorLog.length > this.maxLogSize) {
                errorLog.splice(0, errorLog.length - this.maxLogSize);
            }
            
            localStorage.setItem('travelLog_errorLog', JSON.stringify(errorLog));
        } catch (error) {
            console.error('ErrorHandler: 스토리지 로깅 실패:', error);
        }
    }
    
    /**
     * 사용자에게 에러 알림
     * @param {Object} error - 정규화된 에러 정보
     * @param {Object} options - 처리 옵션
     */
    notifyUser(error, options) {
        if (!options.showUserMessage) return;
        
        const userMessage = error.userMessage || this.generateUserMessage(error);
        
        // 토스트 알림
        if (options.showToast) {
            this.showToast(userMessage, error.severity);
        }
        
        // 에러 페이지 표시 (심각한 에러의 경우)
        if (error.severity === ERROR_SEVERITY.CRITICAL) {
            this.showErrorPage(error);
        }
    }
    
    /**
     * 사용자 메시지 생성
     * @param {Object} error - 정규화된 에러 정보
     * @returns {string} 사용자 친화적 메시지
     */
    generateUserMessage(error) {
        const messages = {
            [ERROR_TYPES.NETWORK]: '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.',
            [ERROR_TYPES.NETWORK_TIMEOUT]: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
            [ERROR_TYPES.NETWORK_OFFLINE]: '인터넷 연결이 끊어졌습니다. 연결을 확인해주세요.',
            [ERROR_TYPES.AUTHENTICATION]: '인증에 문제가 있습니다. 다시 로그인해주세요.',
            [ERROR_TYPES.AUTHENTICATION_EXPIRED]: '로그인이 만료되었습니다. 다시 로그인해주세요.',
            [ERROR_TYPES.DATA_VALIDATION]: '입력한 정보를 확인해주세요.',
            [ERROR_TYPES.DATA_NOT_FOUND]: '요청한 데이터를 찾을 수 없습니다.',
            [ERROR_TYPES.SYSTEM_INITIALIZATION]: '시스템 초기화에 문제가 있습니다. 페이지를 새로고침해주세요.',
            [ERROR_TYPES.SYSTEM_MEMORY]: '메모리 부족으로 인한 문제가 발생했습니다.',
            [ERROR_TYPES.USER_INPUT]: '입력한 정보를 다시 확인해주세요.',
            [ERROR_TYPES.BUSINESS_LOGIC]: '처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            [ERROR_TYPES.UNKNOWN]: '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        };
        
        return messages[error.type] || messages[ERROR_TYPES.UNKNOWN];
    }
    
    /**
     * 토스트 메시지 표시
     * @param {string} message - 메시지
     * @param {string} severity - 심각도
     */
    showToast(message, severity) {
        try {
            // ToastManager가 있으면 사용
            if (window.appManager && window.appManager.toastManager) {
                const toastType = this.getToastType(severity);
                window.appManager.toastManager.show(message, toastType);
            } else {
                // 기본 알림
                console.warn('ToastManager를 사용할 수 없습니다. 기본 알림을 표시합니다.');
                alert(message);
            }
        } catch (error) {
            console.error('ErrorHandler: 토스트 표시 실패:', error);
        }
    }
    
    /**
     * 토스트 타입 결정
     * @param {string} severity - 에러 심각도
     * @returns {string} 토스트 타입
     */
    getToastType(severity) {
        switch (severity) {
            case ERROR_SEVERITY.LOW:
                return 'info';
            case ERROR_SEVERITY.MEDIUM:
                return 'warning';
            case ERROR_SEVERITY.HIGH:
                return 'error';
            case ERROR_SEVERITY.CRITICAL:
                return 'error';
            default:
                return 'info';
        }
    }
    
    /**
     * 에러 페이지 표시
     * @param {Object} error - 정규화된 에러 정보
     */
    showErrorPage(error) {
        try {
            const errorPageHTML = `
                <div class="error-page">
                    <div class="error-page-content">
                        <div class="error-page-icon">⚠️</div>
                        <div class="error-page-title">오류 발생</div>
                        <div class="error-page-message">${error.userMessage || this.generateUserMessage(error)}</div>
                        <div class="error-page-actions">
                            <button class="btn btn-primary" onclick="location.reload()">페이지 새로고침</button>
                            <button class="btn btn-secondary" onclick="history.back()">이전 페이지</button>
                        </div>
                    </div>
                </div>
            `;
            
            // 현재 탭 컨텐츠를 에러 페이지로 교체
            const tabContent = document.querySelector('.tab-content');
            if (tabContent) {
                tabContent.innerHTML = errorPageHTML;
            }
        } catch (error) {
            console.error('ErrorHandler: 에러 페이지 표시 실패:', error);
        }
    }
    
    /**
     * 자동 재시도 스케줄링
     * @param {Object} error - 정규화된 에러 정보
     * @param {Object} options - 처리 옵션
     */
    scheduleRetry(error, options) {
        if (options.retryCount <= 0) return;
        
        setTimeout(() => {
            console.log(`ErrorHandler: 자동 재시도 (${options.retryCount}회 남음): ${error.message}`);
            
            // 재시도 로직은 각 모듈에서 구현
            this.dispatchRetryEvent(error, options);
            
            // 재시도 횟수 감소
            options.retryCount--;
            
            // 재시도가 남아있으면 다시 스케줄링
            if (options.retryCount > 0) {
                this.scheduleRetry(error, options);
            }
        }, options.retryDelay);
    }
    
    /**
     * 재시도 이벤트 발생
     * @param {Object} error - 정규화된 에러 정보
     * @param {Object} options - 처리 옵션
     */
    dispatchRetryEvent(error, options) {
        const event = new CustomEvent('errorRetry', {
            detail: {
                error,
                options,
                retryCount: options.retryCount
            }
        });
        
        window.dispatchEvent(event);
    }
    
    /**
     * 에러 로그에 추가
     * @param {Object} error - 정규화된 에러 정보
     */
    addToErrorLog(error) {
        this.errorLog.push(error);
        
        // 최대 크기 제한
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.splice(0, this.errorLog.length - this.maxLogSize);
        }
    }
    
    /**
     * 에러 로그 로드
     */
    loadErrorLog() {
        try {
            const storedLog = localStorage.getItem('travelLog_errorLog');
            if (storedLog) {
                this.errorLog = JSON.parse(storedLog);
            }
        } catch (error) {
            console.error('ErrorHandler: 에러 로그 로드 실패:', error);
            this.errorLog = [];
        }
    }
    
    /**
     * 에러 로그 저장
     */
    saveErrorLog() {
        try {
            localStorage.setItem('travelLog_errorLog', JSON.stringify(this.errorLog));
        } catch (error) {
            console.error('ErrorHandler: 에러 로그 저장 실패:', error);
        }
    }
    
    /**
     * 에러 ID 생성
     * @returns {string} 고유한 에러 ID
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 에러 통계 조회
     * @returns {Object} 에러 통계
     */
    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            byType: {},
            bySeverity: {},
            recent: this.errorLog.slice(-10)
        };
        
        this.errorLog.forEach(error => {
            // 타입별 통계
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            
            // 심각도별 통계
            stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
        });
        
        return stats;
    }
    
    /**
     * 에러 로그 초기화
     */
    clearErrorLog() {
        this.errorLog = [];
        localStorage.removeItem('travelLog_errorLog');
        console.log('ErrorHandler: 에러 로그 초기화 완료');
    }
    
    /**
     * 에러 핸들러 정리
     */
    cleanup() {
        try {
            // 이벤트 리스너 정리
            this.eventListeners.forEach(listener => {
                if (listener.element && listener.event && listener.handler) {
                    listener.element.removeEventListener(listener.event, listener.handler);
                }
            });
            this.eventListeners = [];
            
            // 에러 로그 저장
            this.saveErrorLog();
            
            console.log('ErrorHandler: 정리 완료');
        } catch (error) {
            console.error('ErrorHandler: 정리 중 오류:', error);
        }
    }
}

// 싱글톤 인스턴스 생성
export const errorHandler = new ErrorHandler();

// 편의 함수들
export const handleError = (errorInfo, options) => errorHandler.handleError(errorInfo, options);
export const logError = (errorInfo, options) => errorHandler.handleError(errorInfo, options);
export const showError = (message, type = ERROR_TYPES.UNKNOWN, severity = ERROR_SEVERITY.MEDIUM) => {
    errorHandler.handleError({
        type,
        severity,
        message,
        source: 'ManualError'
    });
};

// 기본 내보내기
export default errorHandler;
