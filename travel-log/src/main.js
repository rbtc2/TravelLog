// TravelLog - 여행 기록 웹앱
// 메인 진입점

console.log('TravelLog 앱이 시작되었습니다.');

// 앱 초기화
function initApp() {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = '<div class="p-8 text-center"><h1 class="text-3xl font-bold text-blue-600">TravelLog</h1><p class="mt-2 text-gray-600">여행 기록 웹앱</p></div>';
    }
}

// DOM 로드 완료 후 앱 시작
document.addEventListener('DOMContentLoaded', initApp);
