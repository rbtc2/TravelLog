/**
 * 의존성 검증 시스템 (Phase 1)
 * 
 * 🎯 책임:
 * - HTML 요소와 JavaScript 선택자 일치성 검증
 * - 렌더링 순서 검증
 * - 기능 활성화 상태 검증
 * - 런타임 의존성 검증
 * 
 * @class DependencyValidator
 * @version 1.0.0
 * @since 2024-12-29
 */

import { FeatureManager } from '../../config/app-config.js';

export class DependencyValidator {
    constructor() {
        this.validationResults = [];
        this.requiredElements = new Map();
        this.renderOrder = [];
    }

    /**
     * 필수 HTML 요소들을 등록합니다
     * @param {string} feature - 기능 이름
     * @param {Array} selectors - 필수 선택자 배열
     */
    registerRequiredElements(feature, selectors) {
        this.requiredElements.set(feature, selectors);
    }

    /**
     * 렌더링 순서를 등록합니다
     * @param {Array} order - 렌더링 순서 배열
     */
    registerRenderOrder(order) {
        this.renderOrder = order;
    }

    /**
     * 특정 기능의 HTML 요소 존재 여부를 검증합니다
     * @param {string} feature - 기능 이름
     * @returns {Object} 검증 결과
     */
    validateFeatureElements(feature) {
        const selectors = this.requiredElements.get(feature);
        if (!selectors) {
            return {
                success: true,
                message: `${feature}: 검증할 선택자가 없습니다.`,
                missingElements: []
            };
        }

        const missingElements = selectors.filter(selector => 
            !document.querySelector(selector)
        );

        const result = {
            success: missingElements.length === 0,
            feature: feature,
            missingElements: missingElements,
            message: missingElements.length === 0 
                ? `${feature}: 모든 필수 요소가 존재합니다.`
                : `${feature}: 누락된 요소 ${missingElements.length}개 발견`
        };

        this.validationResults.push(result);
        return result;
    }

    /**
     * 모든 등록된 기능의 요소들을 검증합니다
     * @returns {Object} 전체 검증 결과
     */
    validateAllElements() {
        const results = [];
        let totalMissing = 0;

        for (const [feature, selectors] of this.requiredElements) {
            const result = this.validateFeatureElements(feature);
            results.push(result);
            totalMissing += result.missingElements.length;
        }

        return {
            success: totalMissing === 0,
            totalFeatures: results.length,
            totalMissing: totalMissing,
            results: results,
            message: totalMissing === 0 
                ? '모든 기능의 필수 요소가 존재합니다.'
                : `${totalMissing}개의 누락된 요소가 발견되었습니다.`
        };
    }

    /**
     * 기능 활성화 상태를 검증합니다
     * @param {string} feature - 기능 이름
     * @returns {Object} 검증 결과
     */
    validateFeatureStatus(feature) {
        const status = FeatureManager.getFeatureStatus(feature);
        const isActive = FeatureManager.isFeatureActive(feature);

        const result = {
            success: isActive,
            feature: feature,
            status: status,
            message: isActive 
                ? `${feature}: 활성화된 상태입니다.`
                : `${feature}: 비활성화된 상태입니다. (${status})`
        };

        this.validationResults.push(result);
        return result;
    }

    /**
     * 렌더링 순서를 검증합니다
     * @param {Array} actualOrder - 실제 렌더링 순서
     * @returns {Object} 검증 결과
     */
    validateRenderOrder(actualOrder) {
        const expectedOrder = this.renderOrder;
        const isCorrect = JSON.stringify(actualOrder) === JSON.stringify(expectedOrder);

        const result = {
            success: isCorrect,
            expectedOrder: expectedOrder,
            actualOrder: actualOrder,
            message: isCorrect 
                ? '렌더링 순서가 올바릅니다.'
                : '렌더링 순서가 예상과 다릅니다.'
        };

        this.validationResults.push(result);
        return result;
    }

    /**
     * TravelReport 관련 의존성을 검증합니다
     * @returns {Object} 검증 결과
     */
    validateTravelReportDependencies() {
        // TravelReport 필수 요소들 등록
        this.registerRequiredElements('travelReport', [
            '.travel-dna-section',
            '.yearly-stats-section',
            '.basic-stats-section',
            '.heatmap-section',
            '.charts-section',
            '.insights-section',
            '.dna-content',
            '.yearly-stats-content',
            '.dna-item'
        ]);

        // 렌더링 순서 등록
        this.registerRenderOrder([
            'renderWorldExploration',
            'renderBasicStats',
            'renderTravelDNA',
            'renderYearlyStats',
            'renderInitialHeatmap',
            'renderCharts',
            'renderInsights'
        ]);

        // 요소 검증
        const elementValidation = this.validateAllElements();

        // 기능 상태 검증
        const featureValidations = [
            'travelDNA',
            'yearlyStats',
            'basicStats',
            'heatmap',
            'charts',
            'insights'
        ].map(feature => this.validateFeatureStatus(feature));

        const allFeaturesActive = featureValidations.every(v => v.success);

        return {
            success: elementValidation.success && allFeaturesActive,
            elementValidation: elementValidation,
            featureValidations: featureValidations,
            message: elementValidation.success && allFeaturesActive
                ? 'TravelReport 의존성이 모두 올바릅니다.'
                : 'TravelReport 의존성에 문제가 있습니다.'
        };
    }

    /**
     * 검증 결과를 콘솔에 출력합니다
     * @param {Object} result - 검증 결과
     */
    logValidationResult(result) {
        if (result.success) {
            console.log(`✅ ${result.message}`);
        } else {
            console.error(`❌ ${result.message}`);
            
            if (result.results) {
                result.results.forEach(r => {
                    if (!r.success) {
                        console.error(`  - ${r.message}`);
                        if (r.missingElements && r.missingElements.length > 0) {
                            console.error(`    누락된 요소: ${r.missingElements.join(', ')}`);
                        }
                    }
                });
            }
        }
    }

    /**
     * 검증 결과를 HTML로 반환합니다
     * @param {Object} result - 검증 결과
     * @returns {string} HTML 문자열
     */
    generateValidationReport(result) {
        const statusIcon = result.success ? '✅' : '❌';
        const statusClass = result.success ? 'success' : 'error';

        let reportHTML = `
            <div class="validation-report ${statusClass}">
                <h3>${statusIcon} 의존성 검증 결과</h3>
                <p>${result.message}</p>
        `;

        if (result.results) {
            reportHTML += '<ul>';
            result.results.forEach(r => {
                const icon = r.success ? '✅' : '❌';
                reportHTML += `<li>${icon} ${r.message}</li>`;
            });
            reportHTML += '</ul>';
        }

        reportHTML += '</div>';
        return reportHTML;
    }

    /**
     * 검증 결과를 초기화합니다
     */
    clearResults() {
        this.validationResults = [];
    }
}

/**
 * 전역 의존성 검증 인스턴스
 */
export const dependencyValidator = new DependencyValidator();

/**
 * 빠른 검증을 위한 유틸리티 함수들
 */
export const QuickValidator = {
    /**
     * TravelReport 의존성을 빠르게 검증합니다
     * @returns {boolean} 검증 성공 여부
     */
    validateTravelReport: () => {
        const result = dependencyValidator.validateTravelReportDependencies();
        dependencyValidator.logValidationResult(result);
        return result.success;
    },

    /**
     * 특정 요소의 존재 여부를 빠르게 확인합니다
     * @param {string} selector - CSS 선택자
     * @returns {boolean} 존재 여부
     */
    checkElement: (selector) => {
        const exists = !!document.querySelector(selector);
        console.log(`${exists ? '✅' : '❌'} ${selector}: ${exists ? '존재' : '누락'}`);
        return exists;
    },

    /**
     * 여러 요소를 한 번에 확인합니다
     * @param {Array} selectors - CSS 선택자 배열
     * @returns {Object} 검증 결과
     */
    checkMultipleElements: (selectors) => {
        const results = selectors.map(selector => ({
            selector,
            exists: !!document.querySelector(selector)
        }));

        const allExist = results.every(r => r.exists);
        const missing = results.filter(r => !r.exists);

        console.log(`${allExist ? '✅' : '❌'} 요소 검증: ${allExist ? '모두 존재' : `${missing.length}개 누락`}`);
        
        if (missing.length > 0) {
            console.log('누락된 요소들:', missing.map(m => m.selector));
        }

        return {
            success: allExist,
            results: results,
            missing: missing
        };
    }
};
