/**
 * DataMigrationService - 데이터 마이그레이션 로직을 담당
 * 
 * 🎯 책임:
 * - 데이터 스키마 마이그레이션
 * - 데이터 형식 변환
 * - 하위 호환성 유지
 * - 마이그레이션 버전 관리
 * 
 * @class DataMigrationService
 * @version 1.0.0
 * @since 2024-12-29
 */
import { StorageManager } from '../utils/storage-manager.js';

class DataMigrationService {
    constructor() {
        this.storageManager = new StorageManager();
        this.currentVersion = '1.0.0';
        this.migrations = new Map();
        this.initializeMigrations();
    }

    /**
     * 마이그레이션 함수들을 초기화합니다
     * @private
     */
    initializeMigrations() {
        // 버전 1.0.0: relocation -> immigration 마이그레이션
        this.migrations.set('1.0.0', {
            version: '1.0.0',
            description: '목적 데이터 마이그레이션: relocation -> immigration',
            migrate: this.migratePurposeData.bind(this)
        });

        // 향후 추가될 마이그레이션들을 여기에 등록
        // this.migrations.set('1.1.0', {
        //     version: '1.1.0',
        //     description: '새로운 필드 추가',
        //     migrate: this.migrateNewFields.bind(this)
        // });
    }

    /**
     * 모든 마이그레이션을 실행합니다
     * @param {Array} logs - 마이그레이션할 로그 데이터
     * @returns {Object} 마이그레이션 결과
     */
    async migrateAll(logs) {
        try {
            const result = {
                success: true,
                migratedLogs: logs,
                appliedMigrations: [],
                errors: []
            };

            // 현재 저장된 마이그레이션 버전 확인
            const lastMigrationVersion = this.storageManager.load('migration_version', '0.0.0');
            
            // 적용해야 할 마이그레이션들 찾기
            const migrationsToApply = this.getMigrationsToApply(lastMigrationVersion);
            
            let currentLogs = [...logs];
            
            // 각 마이그레이션 순차적으로 실행
            for (const migration of migrationsToApply) {
                try {
                    console.log(`마이그레이션 실행 중: ${migration.version} - ${migration.description}`);
                    
                    const migrationResult = await migration.migrate(currentLogs);
                    currentLogs = migrationResult.migratedLogs;
                    
                    result.appliedMigrations.push({
                        version: migration.version,
                        description: migration.description,
                        success: true,
                        changesCount: migrationResult.changesCount || 0
                    });
                    
                    // 마이그레이션 버전 저장
                    this.storageManager.save('migration_version', migration.version);
                    
                } catch (error) {
                    console.error(`마이그레이션 실패: ${migration.version}`, error);
                    result.errors.push({
                        version: migration.version,
                        error: error.message
                    });
                }
            }
            
            result.migratedLogs = currentLogs;
            result.success = result.errors.length === 0;
            
            return result;
            
        } catch (error) {
            console.error('마이그레이션 실행 실패:', error);
            return {
                success: false,
                migratedLogs: logs,
                appliedMigrations: [],
                errors: [{
                    version: 'unknown',
                    error: error.message
                }]
            };
        }
    }

    /**
     * 적용해야 할 마이그레이션들을 반환합니다
     * @param {string} lastVersion - 마지막으로 적용된 마이그레이션 버전
     * @returns {Array} 적용할 마이그레이션 배열
     * @private
     */
    getMigrationsToApply(lastVersion) {
        const migrations = [];
        
        for (const [version, migration] of this.migrations) {
            if (this.isVersionNewer(version, lastVersion)) {
                migrations.push(migration);
            }
        }
        
        // 버전 순으로 정렬
        return migrations.sort((a, b) => this.compareVersions(a.version, b.version));
    }

    /**
     * 버전 비교 (v1이 v2보다 새로운지 확인)
     * @param {string} v1 - 버전 1
     * @param {string} v2 - 버전 2
     * @returns {boolean} v1이 v2보다 새로운지 여부
     * @private
     */
    isVersionNewer(v1, v2) {
        return this.compareVersions(v1, v2) > 0;
    }

    /**
     * 버전 비교 함수
     * @param {string} v1 - 버전 1
     * @param {string} v2 - 버전 2
     * @returns {number} 비교 결과 (-1, 0, 1)
     * @private
     */
    compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        
        const maxLength = Math.max(parts1.length, parts2.length);
        
        for (let i = 0; i < maxLength; i++) {
            const part1 = parts1[i] || 0;
            const part2 = parts2[i] || 0;
            
            if (part1 > part2) return 1;
            if (part1 < part2) return -1;
        }
        
        return 0;
    }

    /**
     * 목적 데이터 마이그레이션 (relocation -> immigration)
     * @param {Array} logs - 마이그레이션할 로그 배열
     * @returns {Object} 마이그레이션 결과
     * @private
     */
    migratePurposeData(logs) {
        try {
            let changesCount = 0;
            const migratedLogs = logs.map(log => {
                if (log.purpose === 'relocation') {
                    changesCount++;
                    return {
                        ...log,
                        purpose: 'immigration',
                        updatedAt: new Date().toISOString()
                    };
                }
                return log;
            });
            
            if (changesCount > 0) {
                console.log(`목적 데이터 마이그레이션 완료: ${changesCount}개 항목 변경`);
            }
            
            return {
                migratedLogs,
                changesCount,
                success: true
            };
            
        } catch (error) {
            console.error('목적 데이터 마이그레이션 실패:', error);
            return {
                migratedLogs: logs,
                changesCount: 0,
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 특정 버전의 마이그레이션을 실행합니다
     * @param {string} version - 마이그레이션 버전
     * @param {Array} logs - 마이그레이션할 로그 배열
     * @returns {Object} 마이그레이션 결과
     */
    async migrateToVersion(version, logs) {
        try {
            const migration = this.migrations.get(version);
            if (!migration) {
                throw new Error(`마이그레이션 버전을 찾을 수 없습니다: ${version}`);
            }
            
            console.log(`마이그레이션 실행: ${version} - ${migration.description}`);
            
            const result = await migration.migrate(logs);
            result.version = version;
            result.description = migration.description;
            
            return result;
            
        } catch (error) {
            console.error(`마이그레이션 실행 실패: ${version}`, error);
            return {
                version,
                migratedLogs: logs,
                changesCount: 0,
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 마이그레이션 히스토리를 조회합니다
     * @returns {Array} 마이그레이션 히스토리
     */
    getMigrationHistory() {
        try {
            const history = this.storageManager.load('migration_history', []);
            return history;
        } catch (error) {
            console.error('마이그레이션 히스토리 조회 실패:', error);
            return [];
        }
    }

    /**
     * 마이그레이션 히스토리에 기록을 추가합니다
     * @param {Object} migrationResult - 마이그레이션 결과
     * @private
     */
    addToHistory(migrationResult) {
        try {
            const history = this.getMigrationHistory();
            history.push({
                timestamp: new Date().toISOString(),
                version: migrationResult.version,
                description: migrationResult.description,
                success: migrationResult.success,
                changesCount: migrationResult.changesCount || 0
            });
            
            this.storageManager.save('migration_history', history);
        } catch (error) {
            console.error('마이그레이션 히스토리 저장 실패:', error);
        }
    }

    /**
     * 사용 가능한 마이그레이션 목록을 반환합니다
     * @returns {Array} 마이그레이션 목록
     */
    getAvailableMigrations() {
        return Array.from(this.migrations.values()).map(migration => ({
            version: migration.version,
            description: migration.description
        }));
    }

    /**
     * 현재 데이터 버전을 반환합니다
     * @returns {string} 현재 데이터 버전
     */
    getCurrentDataVersion() {
        return this.storageManager.load('migration_version', '0.0.0');
    }

    /**
     * 마이그레이션이 필요한지 확인합니다
     * @returns {boolean} 마이그레이션 필요 여부
     */
    needsMigration() {
        const currentVersion = this.getCurrentDataVersion();
        return this.isVersionNewer(this.currentVersion, currentVersion);
    }

    /**
     * 마이그레이션 서비스 정리
     */
    cleanup() {
        // 필요시 정리 작업 수행
    }
}

export { DataMigrationService };
