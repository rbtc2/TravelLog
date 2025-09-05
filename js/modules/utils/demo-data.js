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
                id: 'log-2024-12-01',
                country: 'KR',
                city: '서울',
                startDate: '2024-11-15',
                endDate: '2024-11-20',
                purpose: 'tourism',
                rating: '5',
                travelStyle: 'family',
                memo: '가족과 함께한 서울 여행. 경복궁과 한강공원에서 가을의 아름다움을 만끽했습니다. 전통 시장에서 맛본 김치찌개와 불고기가 정말 맛있었어요.',
                createdAt: '2024-11-21T09:30:00.000Z'
            },
            {
                id: 'log-2024-12-02',
                country: 'US',
                city: '뉴욕',
                startDate: '2024-10-10',
                endDate: '2024-10-17',
                purpose: 'business',
                rating: '4',
                travelStyle: 'alone',
                memo: '업무 출장으로 뉴욕을 방문했습니다. 맨해튼의 스카이라인과 브로드웨이 뮤지컬이 인상적이었어요. 타임스퀘어의 활기찬 분위기도 잊을 수 없습니다.',
                createdAt: '2024-10-18T14:20:00.000Z'
            },
            {
                id: 'log-2024-12-03',
                country: 'IT',
                city: '로마',
                startDate: '2024-09-05',
                endDate: '2024-09-12',
                purpose: 'tourism',
                rating: '5',
                travelStyle: 'couple',
                memo: '연인과 함께한 로마 여행. 콜로세움의 웅장함과 바티칸의 예술 작품들이 감동적이었습니다. 이탈리아 파스타와 피자의 맛도 정말 환상적이었어요.',
                createdAt: '2024-09-13T11:45:00.000Z'
            },
            {
                id: 'log-2024-12-04',
                country: 'JP',
                city: '오사카',
                startDate: '2024-08-20',
                endDate: '2024-08-25',
                purpose: 'tourism',
                rating: '4',
                travelStyle: 'friends',
                memo: '친구들과 함께한 오사카 여행. 도톤보리의 야경과 유니버설 스튜디오 재팬이 정말 재미있었어요. 타코야키와 오코노미야키도 맛있게 먹었습니다.',
                createdAt: '2024-08-26T16:10:00.000Z'
            },
            {
                id: 'log-2024-12-05',
                country: 'AU',
                city: '시드니',
                startDate: '2024-07-12',
                endDate: '2024-07-18',
                purpose: 'study',
                rating: '5',
                travelStyle: 'alone',
                memo: '어학 연수로 시드니에 체류했습니다. 오페라 하우스의 아름다운 건축과 하버 브리지의 야경이 잊을 수 없어요. 호주의 자연 환경과 친절한 사람들도 인상적이었습니다.',
                createdAt: '2024-07-19T08:15:00.000Z'
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
                id: 'log-2024-12-06',
                country: 'FR',
                city: '파리',
                startDate: '2024-06-08',
                endDate: '2024-06-15',
                purpose: 'tourism',
                rating: '5',
                travelStyle: 'couple',
                memo: '연인과 함께한 파리 여행. 에펠탑의 야경과 루브르 박물관의 모나리자가 정말 아름다웠어요. 프랑스 와인과 크루아상의 맛도 잊을 수 없습니다.',
                createdAt: '2024-06-16T13:25:00.000Z'
            },
            {
                id: 'log-2024-12-07',
                country: 'TH',
                city: '방콕',
                startDate: '2024-05-03',
                endDate: '2024-05-08',
                purpose: 'tourism',
                rating: '4',
                travelStyle: 'friends',
                memo: '친구들과 함께한 방콕 여행. 왓 포와 대궁전의 웅장함이 인상적이었어요. 태국 마사지와 톰얌꿍의 매운 맛도 정말 좋았습니다.',
                createdAt: '2024-05-09T10:40:00.000Z'
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
