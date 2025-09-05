/**
 * 테스트용 my-logs 모듈
 */

console.log('my-logs-test.js 로드됨');

class MyLogsTabTest {
    constructor() {
        console.log('MyLogsTabTest 생성자 호출됨');
    }
    
    render(container) {
        console.log('MyLogsTabTest render 호출됨');
        container.innerHTML = '<div>테스트 성공!</div>';
    }
}

export default new MyLogsTabTest();
