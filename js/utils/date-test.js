/**
 * 현재 날짜 테스트 유틸리티
 * 개발 중 현재 날짜를 확인하기 위한 간단한 도구
 * @version 1.0.0
 * @since 2025-09-26
 */

import { DateUtils, AppConfigUpdater } from '../config/app-config.js';

/**
 * 현재 날짜 정보를 콘솔에 출력합니다
 */
export function showCurrentDate() {
    console.log('=== 현재 날짜 정보 ===');
    console.log('📅 현재 날짜:', DateUtils.getCurrentDate());
    console.log('🇰🇷 한국어 형식:', DateUtils.getCurrentDateKorean());
    console.log('🕐 현재 시간:', DateUtils.getCurrentTime());
    console.log('📊 전체 정보:', DateUtils.getCurrentDateTime());
    console.log('========================');
}

/**
 * 앱 설정의 날짜 정보를 현재 날짜로 업데이트합니다
 */
export function updateAppDateToCurrent() {
    console.log('=== 앱 설정 날짜 업데이트 ===');
    AppConfigUpdater.updateAppInfo();
    console.log('✅ 앱 설정이 현재 날짜로 업데이트되었습니다.');
    console.log('============================');
}

/**
 * 날짜 관련 모든 정보를 표시합니다
 */
export function showAllDateInfo() {
    showCurrentDate();
    updateAppDateToCurrent();
}

// 개발 모드에서 자동으로 실행
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🔧 개발 모드: 날짜 테스트 유틸리티가 로드되었습니다.');
    console.log('사용법: showCurrentDate(), updateAppDateToCurrent(), showAllDateInfo()');
}

// 전역 함수로 등록 (개발 편의를 위해)
if (typeof window !== 'undefined') {
    window.showCurrentDate = showCurrentDate;
    window.updateAppDateToCurrent = updateAppDateToCurrent;
    window.showAllDateInfo = showAllDateInfo;
}
