/**
 * Cleanup 검증 및 로깅 시스템
 * 모듈의 cleanup 메서드 호출을 추적하고 검증하는 시스템
 * 
 * @version 1.0.0
 * @since 2024-12-29
 * @author REDIPX
 */

import { memoryMonitor } from './memory-monitor.js';

export class CleanupVerifier {
    constructor(options = {}) {
        this.options = {
            // 검증 설정
            enableVerification: true,
            enableLogging: true,
            enablePerformanceTracking: true,
            
            // 임계값 설정
            cleanupTimeout: 5000, // 5초
            memoryThreshold: 10 * 1024 * 1024, // 10MB
            
            // 로깅 설정
            logLevel: 'info', // 'info', 'warn', 'error'
            detailedLogging: false,
            
            ...options
        };
        
        // 추적 데이터
        this.cleanupHistory = [];
        this.activeCleanups = new Map();
        this.moduleRegistry = new Map();
        this.cleanupCallbacks = new Map();
        
        // 성능 메트릭
        this.performanceMetrics = {
            totalCleanups: 0,
            successfulCleanups: 0,
            failedCleanups: 0,
            averageCleanupTime: 0,
            longestCleanupTime: 0
        };
        
        this.init();
    }
    
    /**
     * CleanupVerifier 초기화
     */
    init() {
        if (!this.options.enableVerification) {
            return;
        }
        
        // 메모리 모니터와 연동
        if (memoryMonitor) {
            this.setupMemoryIntegration();
        }
        
        // 페이지 언로드 시 최종 검증
        this.setupFinalVerification();
        
        console.log('CleanupVerifier: 초기화 완료');
    }
    
    /**
     * 모듈 등록
     * @param {string} moduleId - 모듈 ID
     * @param {Object} module - 모듈 객체
     * @param {Object} options - 등록 옵션
     */
    registerModule(moduleId, module, options = {}) {
        const moduleInfo = {
            id: moduleId,
            module,
            options: {
                requireCleanup: options.requireCleanup !== false,
                cleanupMethod: options.cleanupMethod || 'cleanup',
                timeout: options.timeout || this.options.cleanupTimeout,
                critical: options.critical || false,
                ...options
            },
            registeredAt: Date.now(),
            cleanupCount: 0,
            lastCleanupAt: null,
            status: 'active'
        };
        
        this.moduleRegistry.set(moduleId, moduleInfo);
        
        if (this.options.enableLogging) {
            this.log('info', `모듈 등록: ${moduleId}`, moduleInfo);
        }
        
        return moduleInfo;
    }
    
    /**
     * 모듈 등록 해제
     * @param {string} moduleId - 모듈 ID
     */
    unregisterModule(moduleId) {
        const moduleInfo = this.moduleRegistry.get(moduleId);
        if (moduleInfo) {
            moduleInfo.status = 'unregistered';
            moduleInfo.unregisteredAt = Date.now();
            
            if (this.options.enableLogging) {
                this.log('info', `모듈 등록 해제: ${moduleId}`, moduleInfo);
            }
        }
    }
    
    /**
     * Cleanup 시작 추적
     * @param {string} moduleId - 모듈 ID
     * @param {Object} context - 컨텍스트 정보
     * @returns {string} 추적 ID
     */
    startCleanup(moduleId, context = {}) {
        const moduleInfo = this.moduleRegistry.get(moduleId);
        if (!moduleInfo) {
            console.warn(`CleanupVerifier: 등록되지 않은 모듈 ${moduleId}`);
            return null;
        }
        
        const cleanupId = this.generateCleanupId();
        const startTime = Date.now();
        
        const cleanupInfo = {
            id: cleanupId,
            moduleId,
            startTime,
            context,
            status: 'running',
            memoryBefore: this.getMemorySnapshot(),
            timeout: null
        };
        
        this.activeCleanups.set(cleanupId, cleanupInfo);
        
        // 타임아웃 설정
        cleanupInfo.timeout = setTimeout(() => {
            this.handleCleanupTimeout(cleanupId);
        }, moduleInfo.options.timeout);
        
        if (this.options.enableLogging) {
            this.log('info', `Cleanup 시작: ${moduleId}`, cleanupInfo);
        }
        
        return cleanupId;
    }
    
    /**
     * Cleanup 완료 추적
     * @param {string} cleanupId - 추적 ID
     * @param {Object} result - 결과 정보
     */
    finishCleanup(cleanupId, result = {}) {
        const cleanupInfo = this.activeCleanups.get(cleanupId);
        if (!cleanupInfo) {
            console.warn(`CleanupVerifier: 알 수 없는 cleanup ID ${cleanupId}`);
            return;
        }
        
        const endTime = Date.now();
        const duration = endTime - cleanupInfo.startTime;
        
        // 타임아웃 클리어
        if (cleanupInfo.timeout) {
            clearTimeout(cleanupInfo.timeout);
        }
        
        // 완료 정보 업데이트
        cleanupInfo.endTime = endTime;
        cleanupInfo.duration = duration;
        cleanupInfo.status = 'completed';
        cleanupInfo.result = result;
        cleanupInfo.memoryAfter = this.getMemorySnapshot();
        cleanupInfo.memoryDifference = this.calculateMemoryDifference(
            cleanupInfo.memoryBefore, 
            cleanupInfo.memoryAfter
        );
        
        // 히스토리에 추가
        this.cleanupHistory.push({ ...cleanupInfo });
        
        // 모듈 정보 업데이트
        const moduleInfo = this.moduleRegistry.get(cleanupInfo.moduleId);
        if (moduleInfo) {
            moduleInfo.cleanupCount++;
            moduleInfo.lastCleanupAt = endTime;
        }
        
        // 성능 메트릭 업데이트
        this.updatePerformanceMetrics(cleanupInfo);
        
        // 활성 cleanup에서 제거
        this.activeCleanups.delete(cleanupId);
        
        // 검증 수행
        this.validateCleanup(cleanupInfo);
        
        if (this.options.enableLogging) {
            this.log('info', `Cleanup 완료: ${cleanupInfo.moduleId}`, cleanupInfo);
        }
    }
    
    /**
     * Cleanup 실패 추적
     * @param {string} cleanupId - 추적 ID
     * @param {Error} error - 오류 정보
     */
    failCleanup(cleanupId, error) {
        const cleanupInfo = this.activeCleanups.get(cleanupId);
        if (!cleanupInfo) {
            console.warn(`CleanupVerifier: 알 수 없는 cleanup ID ${cleanupId}`);
            return;
        }
        
        const endTime = Date.now();
        const duration = endTime - cleanupInfo.startTime;
        
        // 타임아웃 클리어
        if (cleanupInfo.timeout) {
            clearTimeout(cleanupInfo.timeout);
        }
        
        // 실패 정보 업데이트
        cleanupInfo.endTime = endTime;
        cleanupInfo.duration = duration;
        cleanupInfo.status = 'failed';
        cleanupInfo.error = error;
        cleanupInfo.memoryAfter = this.getMemorySnapshot();
        
        // 히스토리에 추가
        this.cleanupHistory.push({ ...cleanupInfo });
        
        // 성능 메트릭 업데이트
        this.performanceMetrics.failedCleanups++;
        
        // 활성 cleanup에서 제거
        this.activeCleanups.delete(cleanupId);
        
        if (this.options.enableLogging) {
            this.log('error', `Cleanup 실패: ${cleanupInfo.moduleId}`, cleanupInfo);
        }
    }
    
    /**
     * Cleanup 래퍼 생성
     * @param {string} moduleId - 모듈 ID
     * @param {Function} cleanupMethod - 원본 cleanup 메서드
     * @returns {Function} 래핑된 cleanup 메서드
     */
    wrapCleanupMethod(moduleId, cleanupMethod) {
        return async (...args) => {
            const cleanupId = this.startCleanup(moduleId, { args });
            if (!cleanupId) {
                return cleanupMethod.apply(this, args);
            }
            
            try {
                const result = await cleanupMethod.apply(this, args);
                this.finishCleanup(cleanupId, { result });
                return result;
            } catch (error) {
                this.failCleanup(cleanupId, error);
                throw error;
            }
        };
    }
    
    /**
     * Cleanup 타임아웃 처리
     * @param {string} cleanupId - 추적 ID
     */
    handleCleanupTimeout(cleanupId) {
        const cleanupInfo = this.activeCleanups.get(cleanupId);
        if (!cleanupInfo) {
            return;
        }
        
        cleanupInfo.status = 'timeout';
        cleanupInfo.endTime = Date.now();
        cleanupInfo.duration = cleanupInfo.endTime - cleanupInfo.startTime;
        
        // 히스토리에 추가
        this.cleanupHistory.push({ ...cleanupInfo });
        
        // 활성 cleanup에서 제거
        this.activeCleanups.delete(cleanupId);
        
        this.log('warn', `Cleanup 타임아웃: ${cleanupInfo.moduleId}`, cleanupInfo);
        
        // 타임아웃 이벤트 발생
        this.dispatchCleanupEvent('timeout', cleanupInfo);
    }
    
    /**
     * Cleanup 검증
     * @param {Object} cleanupInfo - Cleanup 정보
     */
    validateCleanup(cleanupInfo) {
        const issues = [];
        
        // 메모리 검증
        if (cleanupInfo.memoryDifference > this.options.memoryThreshold) {
            issues.push({
                type: 'memory_leak',
                description: `메모리 증가: ${this.formatBytes(cleanupInfo.memoryDifference)}`,
                severity: 'high'
            });
        }
        
        // 성능 검증
        if (cleanupInfo.duration > cleanupInfo.context.timeout) {
            issues.push({
                type: 'performance',
                description: `Cleanup 시간 초과: ${cleanupInfo.duration}ms`,
                severity: 'medium'
            });
        }
        
        // 이슈가 있으면 보고
        if (issues.length > 0) {
            this.reportCleanupIssues(cleanupInfo, issues);
        }
    }
    
    /**
     * Cleanup 이슈 보고
     * @param {Object} cleanupInfo - Cleanup 정보
     * @param {Array} issues - 이슈 목록
     */
    reportCleanupIssues(cleanupInfo, issues) {
        const report = {
            moduleId: cleanupInfo.moduleId,
            cleanupId: cleanupInfo.id,
            issues,
            timestamp: Date.now()
        };
        
        this.log('warn', `Cleanup 이슈 발견: ${cleanupInfo.moduleId}`, report);
        
        // 이벤트 발생
        this.dispatchCleanupEvent('issues', report);
    }
    
    /**
     * 메모리 스냅샷 가져오기
     * @returns {Object} 메모리 정보
     */
    getMemorySnapshot() {
        if (memoryMonitor) {
            return memoryMonitor.getMemoryInfo();
        }
        
        return {
            used: performance.memory?.usedJSHeapSize || 0,
            total: performance.memory?.totalJSHeapSize || 0,
            limit: performance.memory?.jsHeapSizeLimit || 0
        };
    }
    
    /**
     * 메모리 차이 계산
     * @param {Object} before - 이전 메모리 정보
     * @param {Object} after - 이후 메모리 정보
     * @returns {number} 메모리 차이
     */
    calculateMemoryDifference(before, after) {
        if (before.used === 'N/A' || after.used === 'N/A') {
            return 0;
        }
        
        return after.used - before.used;
    }
    
    /**
     * 성능 메트릭 업데이트
     * @param {Object} cleanupInfo - Cleanup 정보
     */
    updatePerformanceMetrics(cleanupInfo) {
        this.performanceMetrics.totalCleanups++;
        this.performanceMetrics.successfulCleanups++;
        
        // 평균 시간 업데이트
        const totalTime = this.performanceMetrics.averageCleanupTime * 
                         (this.performanceMetrics.totalCleanups - 1) + 
                         cleanupInfo.duration;
        this.performanceMetrics.averageCleanupTime = 
            totalTime / this.performanceMetrics.totalCleanups;
        
        // 최대 시간 업데이트
        if (cleanupInfo.duration > this.performanceMetrics.longestCleanupTime) {
            this.performanceMetrics.longestCleanupTime = cleanupInfo.duration;
        }
    }
    
    /**
     * 메모리 통합 설정
     */
    setupMemoryIntegration() {
        if (!memoryMonitor) return;
        
        // 메모리 누수 이벤트 리스너
        window.addEventListener('memoryLeak', (event) => {
            this.log('warn', '메모리 누수 감지됨', event.detail);
        });
        
        // 메모리 경고 이벤트 리스너
        window.addEventListener('memoryWarning', (event) => {
            this.log('warn', '메모리 경고', event.detail);
        });
    }
    
    /**
     * 최종 검증 설정
     */
    setupFinalVerification() {
        window.addEventListener('beforeunload', () => {
            this.performFinalVerification();
        });
    }
    
    /**
     * 최종 검증 수행
     */
    performFinalVerification() {
        const report = this.generateFinalReport();
        
        if (report.issues.length > 0) {
            console.warn('CleanupVerifier: 최종 검증에서 이슈 발견', report);
        }
        
        // 이벤트 발생
        this.dispatchCleanupEvent('final', report);
    }
    
    /**
     * 최종 보고서 생성
     * @returns {Object} 최종 보고서
     */
    generateFinalReport() {
        const report = {
            timestamp: Date.now(),
            modules: Array.from(this.moduleRegistry.values()),
            activeCleanups: Array.from(this.activeCleanups.values()),
            performanceMetrics: { ...this.performanceMetrics },
            issues: []
        };
        
        // 정리되지 않은 모듈 체크
        report.modules.forEach(module => {
            if (module.options.requireCleanup && module.cleanupCount === 0) {
                report.issues.push({
                    type: 'uncleaned_module',
                    moduleId: module.id,
                    description: '정리되지 않은 모듈'
                });
            }
        });
        
        // 활성 cleanup 체크
        if (report.activeCleanups.length > 0) {
            report.issues.push({
                type: 'active_cleanups',
                count: report.activeCleanups.length,
                description: '완료되지 않은 cleanup'
            });
        }
        
        return report;
    }
    
    /**
     * Cleanup 이벤트 발생
     * @param {string} type - 이벤트 타입
     * @param {Object} data - 이벤트 데이터
     */
    dispatchCleanupEvent(type, data) {
        const event = new CustomEvent(`cleanupVerifier:${type}`, { detail: data });
        window.dispatchEvent(event);
    }
    
    /**
     * 로깅
     * @param {string} level - 로그 레벨
     * @param {string} message - 메시지
     * @param {Object} data - 데이터
     */
    log(level, message, data = null) {
        if (!this.options.enableLogging) return;
        
        const logLevel = this.options.logLevel;
        const shouldLog = this.shouldLog(level, logLevel);
        
        if (!shouldLog) return;
        
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] CleanupVerifier: ${message}`;
        
        switch (level) {
            case 'info':
                console.info(logMessage, data);
                break;
            case 'warn':
                console.warn(logMessage, data);
                break;
            case 'error':
                console.error(logMessage, data);
                break;
        }
    }
    
    /**
     * 로그 출력 여부 결정
     * @param {string} messageLevel - 메시지 레벨
     * @param {string} configLevel - 설정 레벨
     * @returns {boolean} 출력 여부
     */
    shouldLog(messageLevel, configLevel) {
        const levels = { error: 0, warn: 1, info: 2 };
        return levels[messageLevel] <= levels[configLevel];
    }
    
    /**
     * Cleanup ID 생성
     * @returns {string} 고유 ID
     */
    generateCleanupId() {
        return `cleanup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 바이트를 읽기 쉬운 형식으로 변환
     * @param {number} bytes - 바이트 수
     * @returns {string} 포맷된 문자열
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * 통계 정보 가져오기
     * @returns {Object} 통계 정보
     */
    getStats() {
        return {
            registeredModules: this.moduleRegistry.size,
            activeCleanups: this.activeCleanups.size,
            totalCleanups: this.cleanupHistory.length,
            performanceMetrics: { ...this.performanceMetrics },
            recentCleanups: this.cleanupHistory.slice(-10)
        };
    }
    
    /**
     * CleanupVerifier 정리
     */
    cleanup() {
        // 활성 cleanup들 강제 완료
        this.activeCleanups.forEach((cleanupInfo, cleanupId) => {
            this.failCleanup(cleanupId, new Error('CleanupVerifier 정리 중 강제 종료'));
        });
        
        // 상태 초기화
        this.cleanupHistory = [];
        this.activeCleanups.clear();
        this.moduleRegistry.clear();
        this.cleanupCallbacks.clear();
        
        console.log('CleanupVerifier: 정리 완료');
    }
}

// 싱글톤 인스턴스 생성
export const cleanupVerifier = new CleanupVerifier({
    enableVerification: true,
    enableLogging: true,
    enablePerformanceTracking: true,
    logLevel: 'info',
    detailedLogging: false
});
