/**
 * 인증 상태 관리자
 * 중앙화된 상태 관리와 상태 변경 추적을 담당
 * @class AuthStateManager
 * @version 1.0.0
 * @since 2024-12-29
 */
export class AuthStateManager {
    constructor() {
        // 상태 저장소
        this.state = {
            // 인증 상태
            isAuthenticated: false,
            user: null,
            session: null,
            
            // UI 상태
            currentView: 'login',
            isLoading: false,
            error: null,
            
            // 폼 상태
            formData: new Map(),
            formErrors: new Map(),
            formTouched: new Map(),
            
            // 설정
            settings: {
                rememberMe: false,
                autoLogin: false,
                theme: 'light',
                language: 'ko'
            },
            
            // 메타데이터
            lastActivity: Date.now(),
            version: '1.0.0',
            initialized: false
        };
        
        // 상태 변경 리스너들
        this.listeners = new Map();
        this.middleware = [];
        
        // 상태 히스토리 (디버깅용)
        this.history = [];
        this.maxHistorySize = 50;
        
        // 상태 변경 디바운싱
        this.debounceTimeout = null;
        this.debounceDelay = 100;
    }

    /**
     * 상태를 가져옵니다
     * @param {string} path - 상태 경로 (점 표기법)
     * @returns {any} 상태 값
     */
    getState(path = null) {
        if (!path) {
            return this.deepClone(this.state);
        }
        
        return this.getNestedValue(this.state, path);
    }

    /**
     * 상태를 설정합니다
     * @param {string} path - 상태 경로
     * @param {any} value - 설정할 값
     * @param {boolean} silent - 리스너 호출 여부
     */
    setState(path, value, silent = false) {
        const oldState = this.deepClone(this.state);
        const newState = this.setNestedValue(this.state, path, value);
        
        // 히스토리에 추가
        this.addToHistory({
            timestamp: Date.now(),
            path,
            oldValue: this.getNestedValue(oldState, path),
            newValue: value,
            action: 'setState'
        });
        
        // 미들웨어 실행
        const processedState = this.runMiddleware(newState, oldState, path, value);
        
        // 상태 업데이트
        this.state = processedState;
        
        // 리스너 호출
        if (!silent) {
            this.notifyListeners(path, value, oldState, this.state);
        }
    }

    /**
     * 상태를 업데이트합니다 (여러 필드 동시)
     * @param {Object} updates - 업데이트할 상태들
     * @param {boolean} silent - 리스너 호출 여부
     */
    updateState(updates, silent = false) {
        const oldState = this.deepClone(this.state);
        
        Object.entries(updates).forEach(([path, value]) => {
            this.setNestedValue(this.state, path, value);
        });
        
        // 히스토리에 추가
        this.addToHistory({
            timestamp: Date.now(),
            path: 'multiple',
            oldValue: oldState,
            newValue: this.state,
            action: 'updateState'
        });
        
        // 미들웨어 실행
        const processedState = this.runMiddleware(this.state, oldState, 'multiple', updates);
        this.state = processedState;
        
        // 리스너 호출
        if (!silent) {
            this.notifyListeners('multiple', updates, oldState, this.state);
        }
    }

    /**
     * 상태 변경 리스너를 등록합니다
     * @param {string} path - 감시할 상태 경로
     * @param {Function} callback - 콜백 함수
     * @param {Object} options - 옵션
     * @returns {Function} 구독 해제 함수
     */
    subscribe(path, callback, options = {}) {
        const id = this.generateId();
        const listener = {
            id,
            path,
            callback,
            options: {
                immediate: false,
                deep: false,
                ...options
            }
        };
        
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Map());
        }
        
        this.listeners.get(path).set(id, listener);
        
        // 즉시 실행 옵션
        if (options.immediate) {
            const currentValue = this.getState(path);
            callback(currentValue, currentValue, path);
        }
        
        // 구독 해제 함수 반환
        return () => this.unsubscribe(path, id);
    }

    /**
     * 상태 변경 리스너를 해제합니다
     * @param {string} path - 상태 경로
     * @param {string} id - 리스너 ID
     */
    unsubscribe(path, id) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).delete(id);
        }
    }

    /**
     * 미들웨어를 등록합니다
     * @param {Function} middleware - 미들웨어 함수
     */
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }

    /**
     * 폼 데이터를 관리합니다
     * @param {string} formName - 폼 이름
     * @param {Object} data - 폼 데이터
     */
    setFormData(formName, data) {
        this.state.formData.set(formName, data);
        this.setState(`formData.${formName}`, data);
    }

    /**
     * 폼 에러를 설정합니다
     * @param {string} formName - 폼 이름
     * @param {Object} errors - 에러 객체
     */
    setFormErrors(formName, errors) {
        this.state.formErrors.set(formName, errors);
        this.setState(`formErrors.${formName}`, errors);
    }

    /**
     * 폼 필드 터치 상태를 설정합니다
     * @param {string} formName - 폼 이름
     * @param {string} fieldName - 필드 이름
     * @param {boolean} touched - 터치 여부
     */
    setFieldTouched(formName, fieldName, touched = true) {
        if (!this.state.formTouched.has(formName)) {
            this.state.formTouched.set(formName, new Map());
        }
        
        this.state.formTouched.get(formName).set(fieldName, touched);
        this.setState(`formTouched.${formName}.${fieldName}`, touched);
    }

    /**
     * 인증 상태를 설정합니다
     * @param {boolean} isAuthenticated - 인증 여부
     * @param {Object} user - 사용자 정보
     * @param {Object} session - 세션 정보
     */
    setAuthState(isAuthenticated, user = null, session = null) {
        this.updateState({
            'isAuthenticated': isAuthenticated,
            'user': user,
            'session': session,
            'lastActivity': Date.now()
        });
    }

    /**
     * 로딩 상태를 설정합니다
     * @param {boolean} isLoading - 로딩 여부
     * @param {string} message - 로딩 메시지
     */
    setLoadingState(isLoading, message = null) {
        this.updateState({
            'isLoading': isLoading,
            'loadingMessage': message
        });
    }

    /**
     * 에러 상태를 설정합니다
     * @param {Error|string|null} error - 에러 객체 또는 메시지
     * @param {string} context - 에러 컨텍스트
     */
    setError(error, context = null) {
        const errorObj = error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
        } : {
            message: error,
            stack: null,
            name: 'CustomError'
        };
        
        this.updateState({
            'error': error ? { ...errorObj, context, timestamp: Date.now() } : null
        });
    }

    /**
     * 현재 뷰를 설정합니다
     * @param {string} viewName - 뷰 이름
     */
    setCurrentView(viewName) {
        this.setState('currentView', viewName);
    }

    /**
     * 상태를 리셋합니다
     * @param {string} path - 리셋할 경로 (전체 리셋 시 null)
     */
    resetState(path = null) {
        if (path) {
            this.setState(path, this.getDefaultValue(path));
        } else {
            this.state = this.getInitialState();
            this.notifyListeners('*', null, null, this.state);
        }
    }

    /**
     * 상태 히스토리를 가져옵니다
     * @param {number} limit - 가져올 히스토리 수
     * @returns {Array} 히스토리 배열
     */
    getHistory(limit = 10) {
        return this.history.slice(-limit);
    }

    /**
     * 상태를 내보냅니다 (디버깅용)
     * @returns {Object} 상태 스냅샷
     */
    exportState() {
        return {
            state: this.deepClone(this.state),
            history: this.getHistory(),
            listeners: Array.from(this.listeners.keys()),
            timestamp: Date.now()
        };
    }

    /**
     * 상태를 가져옵니다 (가져오기용)
     * @param {Object} snapshot - 상태 스냅샷
     */
    importState(snapshot) {
        if (snapshot && snapshot.state) {
            this.state = this.deepClone(snapshot.state);
            this.notifyListeners('*', null, null, this.state);
        }
    }

    // Private methods

    /**
     * 중첩된 값을 가져옵니다
     * @param {Object} obj - 객체
     * @param {string} path - 경로
     * @returns {any} 값
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * 중첩된 값을 설정합니다
     * @param {Object} obj - 객체
     * @param {string} path - 경로
     * @param {any} value - 값
     * @returns {Object} 새로운 객체
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const newObj = this.deepClone(obj);
        
        let current = newObj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
        return newObj;
    }

    /**
     * 깊은 복사를 수행합니다
     * @param {any} obj - 복사할 객체
     * @returns {any} 복사된 객체
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Map) {
            return new Map(obj);
        }
        
        if (obj instanceof Set) {
            return new Set(obj);
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }
        
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = this.deepClone(obj[key]);
        });
        
        return cloned;
    }

    /**
     * 미들웨어를 실행합니다
     * @param {Object} newState - 새 상태
     * @param {Object} oldState - 이전 상태
     * @param {string} path - 변경된 경로
     * @param {any} value - 새 값
     * @returns {Object} 처리된 상태
     */
    runMiddleware(newState, oldState, path, value) {
        let processedState = newState;
        
        for (const middleware of this.middleware) {
            try {
                processedState = middleware(processedState, oldState, path, value);
            } catch (error) {
                console.error('Middleware error:', error);
            }
        }
        
        return processedState;
    }

    /**
     * 리스너들에게 알림을 보냅니다
     * @param {string} path - 변경된 경로
     * @param {any} newValue - 새 값
     * @param {Object} oldState - 이전 상태
     * @param {Object} newState - 새 상태
     */
    notifyListeners(path, newValue, oldState, newState) {
        // 디바운싱 적용
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        this.debounceTimeout = setTimeout(() => {
            // 특정 경로 리스너들
            if (this.listeners.has(path)) {
                this.listeners.get(path).forEach(listener => {
                    try {
                        listener.callback(newValue, this.getNestedValue(oldState, path), path);
                    } catch (error) {
                        console.error('Listener error:', error);
                    }
                });
            }
            
            // 전체 상태 리스너들
            if (this.listeners.has('*')) {
                this.listeners.get('*').forEach(listener => {
                    try {
                        listener.callback(newState, oldState, '*');
                    } catch (error) {
                        console.error('Listener error:', error);
                    }
                });
            }
        }, this.debounceDelay);
    }

    /**
     * 히스토리에 추가합니다
     * @param {Object} entry - 히스토리 엔트리
     */
    addToHistory(entry) {
        this.history.push(entry);
        
        // 히스토리 크기 제한
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * 고유 ID를 생성합니다
     * @returns {string} 고유 ID
     */
    generateId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 초기 상태를 반환합니다
     * @returns {Object} 초기 상태
     */
    getInitialState() {
        return {
            isAuthenticated: false,
            user: null,
            session: null,
            currentView: 'login',
            isLoading: false,
            error: null,
            formData: new Map(),
            formErrors: new Map(),
            formTouched: new Map(),
            settings: {
                rememberMe: false,
                autoLogin: false,
                theme: 'light',
                language: 'ko'
            },
            lastActivity: Date.now(),
            version: '1.0.0',
            initialized: false
        };
    }

    /**
     * 기본값을 반환합니다
     * @param {string} path - 경로
     * @returns {any} 기본값
     */
    getDefaultValue(path) {
        const defaults = {
            'isAuthenticated': false,
            'user': null,
            'session': null,
            'currentView': 'login',
            'isLoading': false,
            'error': null,
            'formData': new Map(),
            'formErrors': new Map(),
            'formTouched': new Map()
        };
        
        return defaults[path] || null;
    }

    /**
     * 리소스를 정리합니다
     */
    cleanup() {
        this.listeners.clear();
        this.middleware = [];
        this.history = [];
        
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
    }
}
