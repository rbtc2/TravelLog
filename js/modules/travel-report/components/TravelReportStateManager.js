/**
 * TravelReportStateManager - 트래블 레포트 상태 관리 전담
 * 
 * 🎯 책임:
 * - 트래블 레포트 상태 관리
 * - 의존성 검증
 * - 기능 활성화 상태 관리
 * - 상태 변경 이벤트 발생
 * 
 * @class TravelReportStateManager
 * @version 1.0.0
 * @since 2024-12-29
 */
import { QuickValidator } from '../../utils/dependency-validator.js';
import { FeatureManager } from '../../../config/app-config.js';

export class TravelReportStateManager {
    constructor() {
        this.state = {
            isInitialized: false,
            isLoading: false,
            error: null,
            activeFeatures: new Set()
        };
        
        this.listeners = [];
        // HTML 요소 검증은 렌더링 후에 실행되도록 변경
    }

    /**
     * 의존성을 검증합니다
     * @returns {boolean} 검증 성공 여부
     */
    validateDependencies() {
        // 1. 기능 활성화 상태 검증
        const requiredFeatures = ['travelDNA', 'yearlyStats', 'basicStats', 'heatmap', 'insights'];
        const inactiveFeatures = requiredFeatures.filter(feature => 
            !FeatureManager.isFeatureActive(feature)
        );
        
        if (inactiveFeatures.length > 0) {
            console.warn('비활성화된 기능들:', inactiveFeatures);
        }
        
        // 2. HTML 요소 존재 여부 검증
        const requiredElements = [
            '.travel-dna-section',
            '.yearly-stats-section', 
            '.basic-stats-section',
            '.heatmap-section',
            '.insights-section'
        ];
        
        const elementValidation = QuickValidator.checkMultipleElements(requiredElements);
        
        if (!elementValidation.success) {
            console.warn('⚠️ 일부 HTML 요소가 아직 렌더링되지 않았습니다:', elementValidation.missing);
        }
        
        // 3. 전체 검증 결과 요약 (HTML 요소는 선택적)
        const allValid = inactiveFeatures.length === 0;
        
        if (inactiveFeatures.length > 0) {
            console.warn('⚠️ 일부 기능이 비활성화되어 있습니다:', inactiveFeatures);
        }
        
        return allValid;
    }

    /**
     * 현재 상태를 가져옵니다
     * @returns {Object} 현재 상태
     */
    getState() {
        return { ...this.state };
    }

    /**
     * 상태를 업데이트합니다
     * @param {Object} newState - 새로운 상태
     */
    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        this.notifyListeners(prevState, this.state);
    }

    /**
     * 특정 상태를 업데이트합니다
     * @param {string} key - 상태 키
     * @param {*} value - 상태 값
     */
    setStateValue(key, value) {
        this.setState({ [key]: value });
    }

    /**
     * 초기화 상태를 설정합니다
     * @param {boolean} isInitialized - 초기화 여부
     */
    setInitialized(isInitialized) {
        this.setStateValue('isInitialized', isInitialized);
    }

    /**
     * 로딩 상태를 설정합니다
     * @param {boolean} isLoading - 로딩 여부
     */
    setLoading(isLoading) {
        this.setStateValue('isLoading', isLoading);
    }

    /**
     * 에러 상태를 설정합니다
     * @param {Error|null} error - 에러 객체
     */
    setError(error) {
        this.setStateValue('error', error);
    }


    /**
     * 기능 활성화 상태를 설정합니다
     * @param {string} feature - 기능 이름
     * @param {boolean} isActive - 활성화 여부
     */
    setFeatureActive(feature, isActive) {
        if (isActive) {
            this.state.activeFeatures.add(feature);
        } else {
            this.state.activeFeatures.delete(feature);
        }
        this.notifyListeners(this.state, this.state);
    }

    /**
     * 기능이 활성화되어 있는지 확인합니다
     * @param {string} feature - 기능 이름
     * @returns {boolean} 활성화 여부
     */
    isFeatureActive(feature) {
        return this.state.activeFeatures.has(feature);
    }

    /**
     * 상태 변경 리스너를 등록합니다
     * @param {Function} listener - 리스너 함수
     * @returns {Function} 리스너 제거 함수
     */
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * 리스너들에게 상태 변경을 알립니다
     * @param {Object} prevState - 이전 상태
     * @param {Object} currentState - 현재 상태
     */
    notifyListeners(prevState, currentState) {
        this.listeners.forEach(listener => {
            try {
                listener(prevState, currentState);
            } catch (error) {
                console.error('상태 변경 리스너 오류:', error);
            }
        });
    }

    /**
     * 상태를 초기화합니다
     */
    reset() {
        this.state = {
            isInitialized: false,
            currentChartTab: 'country-ranking',
            isLoading: false,
            error: null,
            activeFeatures: new Set()
        };
        this.notifyListeners({}, this.state);
    }

    /**
     * 리소스를 정리합니다
     */
    cleanup() {
        this.listeners = [];
        this.state = null;
    }
}
