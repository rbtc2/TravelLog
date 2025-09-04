/**
 * 데모 데이터 관리 모듈
 * 애플리케이션 초기 실행 시 사용할 샘플 데이터
 */

export class DemoData {
    /**
     * 기본 데모 로그 데이터를 반환합니다
     * @returns {Array} 데모 로그 배열
     */
    static getDefaultLogs() {
        return [
            {
                id: 'demo1',
                country: 'JP',
                city: '도쿄',
                startDate: '2024-03-15',
                endDate: '2024-03-20',
                purpose: 'tourism',
                rating: '5',
                travelStyle: 'couple',
                memo: '도쿄의 봄을 만끽한 환상적인 여행이었습니다. 벚꽃 축제와 맛집 탐방이 특히 인상적이었어요.',
                createdAt: '2024-03-21T10:00:00.000Z'
            },
            {
                id: 'demo2',
                country: 'FR',
                city: '파리',
                startDate: '2024-02-10',
                endDate: '2024-02-15',
                purpose: 'tourism',
                rating: '4',
                travelStyle: 'solo',
                memo: '루브르 박물관과 에펠탑을 방문했습니다. 예술의 도시 파리의 매력에 흠뻑 빠졌어요.',
                createdAt: '2024-02-16T14:30:00.000Z'
            },
            {
                id: 'demo3',
                country: 'TH',
                city: '방콕',
                startDate: '2024-01-05',
                endDate: '2024-01-10',
                purpose: 'tourism',
                rating: '4',
                travelStyle: 'family',
                memo: '가족과 함께한 태국 여행. 따뜻한 날씨와 맛있는 태국 음식이 기억에 남습니다.',
                createdAt: '2024-01-11T09:15:00.000Z'
            },
            {
                id: 'demo4',
                country: 'CN',
                city: '북경',
                startDate: '2025-09-17',
                endDate: '2025-09-19',
                purpose: 'business',
                rating: '1',
                travelStyle: 'solo',
                memo: '',
                createdAt: '2025-09-04T10:00:00.000Z'
            },
            {
                id: 'demo5',
                country: 'CN',
                city: '북경',
                startDate: '2025-09-05',
                endDate: '2025-09-06',
                purpose: 'relocation',
                rating: '3',
                travelStyle: 'couple',
                memo: '북경 오리를 먹었습니다.',
                createdAt: '2025-09-04T10:00:00.000Z',
                updatedAt: '2025-09-04T10:00:00.000Z'
            }
        ];
    }
    
    /**
     * 확장된 데모 로그 데이터를 반환합니다
     * @returns {Array} 확장된 데모 로그 배열
     */
    static getExtendedLogs() {
        return [
            ...this.getDefaultLogs(),
            {
                id: 'demo6',
                country: 'IT',
                city: '로마',
                startDate: '2023-12-20',
                endDate: '2023-12-25',
                purpose: 'tourism',
                rating: '5',
                travelStyle: 'couple',
                memo: '크리스마스 시즌의 로마는 정말 환상적이었습니다. 바티칸과 콜로세움을 방문했어요.',
                createdAt: '2023-12-26T08:00:00.000Z'
            },
            {
                id: 'demo7',
                country: 'ES',
                city: '바르셀로나',
                startDate: '2023-11-10',
                endDate: '2023-11-15',
                purpose: 'business',
                rating: '4',
                travelStyle: 'solo',
                memo: '업무 출장으로 방문했지만, 가우디 건축물과 태파스는 꼭 봐야 할 명소였습니다.',
                createdAt: '2023-11-16T12:30:00.000Z'
            }
        ];
    }
    
    /**
     * 특정 국가의 데모 데이터를 반환합니다
     * @param {string} country - 국가 코드 또는 국가명
     * @returns {Array} 해당 국가의 데모 로그 배열
     */
    static getLogsByCountry(country) {
        return this.getDefaultLogs().filter(log => 
            log.country.toLowerCase() === country.toLowerCase()
        );
    }
    
    /**
     * 특정 목적의 데모 데이터를 반환합니다
     * @param {string} purpose - 여행 목적
     * @returns {Array} 해당 목적의 데모 로그 배열
     */
    static getLogsByPurpose(purpose) {
        return this.getDefaultLogs().filter(log => log.purpose === purpose);
    }
    
    /**
     * 데모 데이터가 유효한지 확인합니다
     * @param {Array} logs - 확인할 로그 배열
     * @returns {boolean} 유효성 여부
     */
    static validateLogs(logs) {
        if (!Array.isArray(logs)) return false;
        
        return logs.every(log => {
            return log.id && 
                   log.country && 
                   log.city && 
                   log.startDate && 
                   log.endDate && 
                   log.purpose && 
                   log.rating;
        });
    }
    
    /**
     * 데모 데이터를 초기화합니다 (ID 재생성)
     * @returns {Array} 초기화된 데모 로그 배열
     */
    static initializeLogs() {
        const logs = this.getDefaultLogs();
        const now = new Date();
        
        return logs.map((log, index) => ({
            ...log,
            id: `demo-${Date.now()}-${index}`,
            createdAt: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)).toISOString()
        }));
    }
}
