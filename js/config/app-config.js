/**
 * 애플리케이션 설정 및 메타데이터
 * 앱 버전, 빌드 번호, 개발사 정보 등
 * @version 1.0.0
 * @since 2024-12-29
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
        copyright: '© 2024 REDIPX. All rights reserved.',
        license: 'MIT',
        lastUpdated: '2024-12-29',
        buildDate: '2025-09-01',
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
    }
};
