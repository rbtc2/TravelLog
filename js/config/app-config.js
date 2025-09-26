/**
 * 애플리케이션 설정 및 메타데이터
 * 앱 버전, 빌드 번호, 개발사 정보 등
 * @version 1.0.0
 * @since 2025-09-26
 */

export const APP_CONFIG = {
    // 앱 기본 정보
    app: {
        name: 'TravelLog',
        title: 'TravelLog - 여행 일지',
        description: '여행의 모든 순간을 기록하세요',
        version: 'DEMO',
        buildNumber: '20250901',
        developer: 'REDIPX',
        website: 'https://redipx.com',
        supportEmail: 'support@redipx.com'
    },
    
    // 앱 메타데이터
    metadata: {
        author: 'REDIPX',
        copyright: '© 2025 REDIPX. All rights reserved.',
        license: 'MIT',
        lastUpdated: '2025-09-26',
        buildDate: '2025-09-26',
        environment: 'production'
    },
    
    // 앱 기능 정보
    features: {
        maxLogs: 1000,
        maxFileSize: '10MB',
        supportedFormats: ['JSON', 'CSV'],
        supportedLanguages: ['ko', 'en'],
        defaultLanguage: 'ko'
    },
    
    // 기능 상태 관리 (Phase 1: 즉시 적용)
    featureStatus: {
        // TravelReport 관련 기능들
        travelDNA: 'active',
        yearlyStats: 'active',
        basicStats: 'active',
        heatmap: 'active',
        charts: 'active',
        insights: 'active',
        
        // 기타 기능들
        search: 'active',
        calendar: 'active',
        addLog: 'active',
        myLogs: 'active',
        travelCollection: 'active',
        
        // 개발 중인 기능들
        bucketList: 'development', // 버킷리스트 기능
        socialSharing: 'planned',  // 소셜 공유 기능
        exportData: 'planned'      // 데이터 내보내기 기능
    },
    
    // 앱 성능 설정
    performance: {
        maxMemoryUsage: '50MB',
        maxResponseTime: '2s',
        cacheTimeout: '24h',
        debounceDelay: '300ms'
    },
    
    // 앱 보안 설정
    security: {
        maxLoginAttempts: 5,
        sessionTimeout: '24h',
        passwordMinLength: 8,
        enableEncryption: true
    }
};

/**
 * 앱 정보를 가져오는 유틸리티 함수들
 */
export const AppInfo = {
    /**
     * 앱 버전 정보를 반환합니다
     * @returns {Object} 버전 정보
     */
    getVersionInfo: () => ({
        version: APP_CONFIG.app.version,
        buildNumber: APP_CONFIG.app.buildNumber,
        buildDate: APP_CONFIG.metadata.buildDate,
        developer: APP_CONFIG.app.developer
    }),
    
    /**
     * 앱 기본 정보를 반환합니다
     * @returns {Object} 앱 기본 정보
     */
    getAppInfo: () => ({
        name: APP_CONFIG.app.name,
        title: APP_CONFIG.app.title,
        description: APP_CONFIG.app.description,
        developer: APP_CONFIG.app.developer,
        website: APP_CONFIG.app.website
    }),
    
    /**
     * 앱 메타데이터를 반환합니다
     * @returns {Object} 메타데이터
     */
    getMetadata: () => ({
        author: APP_CONFIG.metadata.author,
        copyright: APP_CONFIG.metadata.copyright,
        license: APP_CONFIG.metadata.license,
        lastUpdated: APP_CONFIG.metadata.lastUpdated
    }),
    
    /**
     * 앱 정보를 문자열로 반환합니다
     * @returns {string} 앱 정보 문자열
     */
    getAppInfoString: () => {
        const versionInfo = AppInfo.getVersionInfo();
        return `${APP_CONFIG.app.name} v${versionInfo.version} (Build ${versionInfo.buildNumber}) by ${versionInfo.developer}`;
    },
    
    /**
     * 앱 정보를 HTML 메타 태그로 반환합니다
     * @returns {string} HTML 메타 태그 문자열
     */
    getMetaTags: () => {
        const appInfo = AppInfo.getAppInfo();
        const versionInfo = AppInfo.getVersionInfo();
        
        return `
            <meta name="application-name" content="${appInfo.name}">
            <meta name="description" content="${appInfo.description}">
            <meta name="author" content="${versionInfo.developer}">
            <meta name="version" content="${versionInfo.version}">
            <meta name="build-number" content="${versionInfo.buildNumber}">
            <meta name="build-date" content="${versionInfo.buildDate}">
        `.trim();
    }
};

/**
 * 기능 상태 관리 시스템 (Phase 1)
 */
export const FeatureManager = {
    /**
     * 기능 상태 상수
     */
    STATUS: {
        ACTIVE: 'active',
        DEVELOPMENT: 'development', 
        PLANNED: 'planned',
        DISABLED: 'disabled',
        DEPRECATED: 'deprecated'
    },
    
    /**
     * 특정 기능의 상태를 확인합니다
     * @param {string} featureName - 기능 이름
     * @returns {string} 기능 상태
     */
    getFeatureStatus: (featureName) => {
        return APP_CONFIG.featureStatus[featureName] || 'unknown';
    },
    
    /**
     * 기능이 활성화되어 있는지 확인합니다
     * @param {string} featureName - 기능 이름
     * @returns {boolean} 활성화 여부
     */
    isFeatureActive: (featureName) => {
        return APP_CONFIG.featureStatus[featureName] === FeatureManager.STATUS.ACTIVE;
    },
    
    /**
     * 기능이 개발 중인지 확인합니다
     * @param {string} featureName - 기능 이름
     * @returns {boolean} 개발 중 여부
     */
    isFeatureInDevelopment: (featureName) => {
        return APP_CONFIG.featureStatus[featureName] === FeatureManager.STATUS.DEVELOPMENT;
    },
    
    /**
     * 모든 활성화된 기능 목록을 반환합니다
     * @returns {Array} 활성화된 기능 목록
     */
    getActiveFeatures: () => {
        return Object.keys(APP_CONFIG.featureStatus)
            .filter(feature => APP_CONFIG.featureStatus[feature] === FeatureManager.STATUS.ACTIVE);
    },
    
    /**
     * 기능 상태를 업데이트합니다
     * @param {string} featureName - 기능 이름
     * @param {string} status - 새로운 상태
     */
    updateFeatureStatus: (featureName, status) => {
        if (Object.values(FeatureManager.STATUS).includes(status)) {
            APP_CONFIG.featureStatus[featureName] = status;
            console.log(`기능 상태 업데이트: ${featureName} -> ${status}`);
        } else {
            console.error(`유효하지 않은 기능 상태: ${status}`);
        }
    },
    
    /**
     * 기능 상태 리포트를 생성합니다
     * @returns {Object} 기능 상태 리포트
     */
    generateFeatureReport: () => {
        const report = {};
        Object.keys(FeatureManager.STATUS).forEach(status => {
            report[status] = Object.keys(APP_CONFIG.featureStatus)
                .filter(feature => APP_CONFIG.featureStatus[feature] === FeatureManager.STATUS[status]);
        });
        return report;
    }
};

/**
 * 현재 날짜를 가져오는 유틸리티 함수들
 */
export const DateUtils = {
    /**
     * 현재 날짜를 YYYY-MM-DD 형식으로 반환합니다
     * @returns {string} 현재 날짜
     */
    getCurrentDate: () => {
        return new Date().toISOString().split('T')[0];
    },
    
    /**
     * 현재 날짜를 한국어 형식으로 반환합니다
     * @returns {string} 한국어 형식의 현재 날짜
     */
    getCurrentDateKorean: () => {
        return new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    },
    
    /**
     * 현재 시간을 HH:MM:SS 형식으로 반환합니다
     * @returns {string} 현재 시간
     */
    getCurrentTime: () => {
        return new Date().toLocaleTimeString('ko-KR', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },
    
    /**
     * 현재 날짜와 시간을 모두 반환합니다
     * @returns {Object} 날짜와 시간 정보
     */
    getCurrentDateTime: () => {
        const now = new Date();
        return {
            date: DateUtils.getCurrentDate(),
            dateKorean: DateUtils.getCurrentDateKorean(),
            time: DateUtils.getCurrentTime(),
            timestamp: now.getTime(),
            iso: now.toISOString()
        };
    }
};

/**
 * 앱 설정을 업데이트하는 함수들
 */
export const AppConfigUpdater = {
    /**
     * 앱 버전을 업데이트합니다
     * @param {string} version - 새로운 버전
     */
    updateVersion: (version) => {
        APP_CONFIG.app.version = version;
        console.log(`앱 버전이 ${version}으로 업데이트되었습니다.`);
    },
    
    /**
     * 빌드 번호를 업데이트합니다
     * @param {string} buildNumber - 새로운 빌드 번호
     */
    updateBuildNumber: (buildNumber) => {
        APP_CONFIG.app.buildNumber = buildNumber;
        console.log(`빌드 번호가 ${buildNumber}으로 업데이트되었습니다.`);
    },
    
    /**
     * 개발사 정보를 업데이트합니다
     * @param {string} developer - 새로운 개발사명
     */
    updateDeveloper: (developer) => {
        APP_CONFIG.app.developer = developer;
        APP_CONFIG.metadata.author = developer;
        console.log(`개발사가 ${developer}으로 업데이트되었습니다.`);
    },
    
    /**
     * 현재 날짜로 메타데이터를 업데이트합니다
     */
    updateToCurrentDate: () => {
        const currentDate = DateUtils.getCurrentDate();
        APP_CONFIG.metadata.lastUpdated = currentDate;
        APP_CONFIG.metadata.buildDate = currentDate;
        console.log(`메타데이터가 현재 날짜(${currentDate})로 업데이트되었습니다.`);
    },
    
    /**
     * 앱 정보를 현재 날짜로 완전히 업데이트합니다
     */
    updateAppInfo: () => {
        const currentDate = DateUtils.getCurrentDate();
        const currentYear = new Date().getFullYear();
        
        APP_CONFIG.metadata.lastUpdated = currentDate;
        APP_CONFIG.metadata.buildDate = currentDate;
        APP_CONFIG.metadata.copyright = `© ${currentYear} REDIPX. All rights reserved.`;
        
        console.log(`앱 정보가 현재 날짜(${currentDate})로 업데이트되었습니다.`);
    }
};
