/**
 * 오프라인 모드 관리자
 * 네트워크 연결 상태를 모니터링하고 오프라인 모드에서도 앱이 작동하도록 지원
 */

export class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.offlineQueue = [];
        this.listeners = [];
        this.retryAttempts = 3;
        this.retryDelay = 5000; // 5초
        
        this.init();
    }

    /**
     * 오프라인 매니저 초기화
     */
    init() {
        // 네트워크 상태 이벤트 리스너 등록
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // 주기적으로 연결 상태 확인
        setInterval(() => {
            this.checkConnection();
        }, 30000); // 30초마다 확인
    }

    /**
     * 온라인 상태 처리
     */
    handleOnline() {
        console.log('네트워크 연결이 복구되었습니다.');
        this.isOnline = true;
        this.notifyListeners('online');
        this.processOfflineQueue();
    }

    /**
     * 오프라인 상태 처리
     */
    handleOffline() {
        console.log('네트워크 연결이 끊어졌습니다. 오프라인 모드로 전환합니다.');
        this.isOnline = false;
        this.notifyListeners('offline');
    }

    /**
     * 연결 상태 확인
     */
    async checkConnection() {
        try {
            // 간단한 ping 테스트
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            
            if (!this.isOnline) {
                this.handleOnline();
            }
        } catch (error) {
            if (this.isOnline) {
                this.handleOffline();
            }
        }
    }

    /**
     * 오프라인 큐 처리
     */
    async processOfflineQueue() {
        if (this.offlineQueue.length === 0) return;

        console.log(`오프라인 큐에서 ${this.offlineQueue.length}개의 작업을 처리합니다.`);

        const queue = [...this.offlineQueue];
        this.offlineQueue = [];

        for (const task of queue) {
            try {
                await this.executeTask(task);
            } catch (error) {
                console.error('오프라인 큐 작업 실행 실패:', error);
                // 실패한 작업을 다시 큐에 추가
                this.offlineQueue.push(task);
            }
        }
    }

    /**
     * 작업 실행
     */
    async executeTask(task) {
        const { action, data, retryCount = 0 } = task;

        try {
            switch (action) {
                case 'save_travel_log':
                    await this.saveTravelLog(data);
                    break;
                case 'update_travel_log':
                    await this.updateTravelLog(data);
                    break;
                case 'delete_travel_log':
                    await this.deleteTravelLog(data);
                    break;
                default:
                    console.warn('알 수 없는 작업:', action);
            }
        } catch (error) {
            if (retryCount < this.retryAttempts) {
                // 재시도
                setTimeout(() => {
                    this.offlineQueue.push({
                        ...task,
                        retryCount: retryCount + 1
                    });
                }, this.retryDelay);
            } else {
                console.error('작업 재시도 횟수 초과:', action);
            }
            throw error;
        }
    }

    /**
     * 여행 로그 저장
     */
    async saveTravelLog(data) {
        // 실제 저장 로직 구현
        console.log('여행 로그 저장:', data);
    }

    /**
     * 여행 로그 업데이트
     */
    async updateTravelLog(data) {
        // 실제 업데이트 로직 구현
        console.log('여행 로그 업데이트:', data);
    }

    /**
     * 여행 로그 삭제
     */
    async deleteTravelLog(data) {
        // 실제 삭제 로직 구현
        console.log('여행 로그 삭제:', data);
    }

    /**
     * 오프라인 큐에 작업 추가
     */
    addToOfflineQueue(action, data) {
        this.offlineQueue.push({
            action,
            data,
            timestamp: Date.now()
        });
        
        console.log(`작업이 오프라인 큐에 추가되었습니다: ${action}`);
    }

    /**
     * 상태 변경 리스너 등록
     */
    onStatusChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * 리스너에게 상태 변경 알림
     */
    notifyListeners(status) {
        this.listeners.forEach(callback => {
            try {
                callback(status, this.isOnline);
            } catch (error) {
                console.error('상태 변경 리스너 오류:', error);
            }
        });
    }

    /**
     * 현재 온라인 상태 반환
     */
    getOnlineStatus() {
        return this.isOnline;
    }

    /**
     * 오프라인 큐 상태 반환
     */
    getOfflineQueueStatus() {
        return {
            count: this.offlineQueue.length,
            items: this.offlineQueue.map(item => ({
                action: item.action,
                timestamp: item.timestamp
            }))
        };
    }

    /**
     * 오프라인 큐 초기화
     */
    clearOfflineQueue() {
        this.offlineQueue = [];
        console.log('오프라인 큐가 초기화되었습니다.');
    }

    /**
     * 정리
     */
    cleanup() {
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
        this.listeners = [];
        this.offlineQueue = [];
    }
}

// 싱글톤 인스턴스
export const offlineManager = new OfflineManager();
