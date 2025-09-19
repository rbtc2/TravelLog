/**
 * SettingsView - 설정 화면 렌더링 및 이벤트 처리
 * 
 * 🎯 책임:
 * - 설정 화면 UI 렌더링
 * - 설정 화면 이벤트 바인딩
 * - 앱 설정 및 계정 설정 관리
 * 
 * @class SettingsView
 */
import { EventManager } from '../../../modules/utils/event-manager.js';
import { themeManager } from '../../../modules/utils/theme-manager.js';

class SettingsView {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
    }

    /**
     * 설정 화면을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    render(container) {
        this.container = container;
        // 설정 뷰 CSS 네임스페이스 클래스 추가
        this.container.classList.add('settings-view');
        this.container.innerHTML = this.getSettingsHTML();
        this.bindEvents();
    }

    /**
     * 설정 화면 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getSettingsHTML() {
        return `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <div class="header-with-back">
                        <button class="back-btn" id="back-to-hub-from-settings">◀ 뒤로</button>
                        <div class="header-content">
                            <h1 class="my-logs-title">⚙️ 설정</h1>
                            <p class="my-logs-subtitle">앱 설정을 관리하세요</p>
                        </div>
                    </div>
                </div>
                
                <!-- 앱 설정 섹션 -->
                <div class="hub-section app-settings-section">
                    <div class="section-header">
                        <h2 class="section-title">📱 앱 설정</h2>
                    </div>
                    <div class="settings-content">
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">🌙</div>
                                <div class="setting-details">
                                    <div class="setting-title">다크 모드</div>
                                    <div class="setting-description">어두운 테마로 앱을 사용하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="dark-mode-toggle" autocomplete="off">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">🔔</div>
                                <div class="setting-details">
                                    <div class="setting-title">알림</div>
                                    <div class="setting-description">여행 관련 알림을 받으세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" autocomplete="off" disabled>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">🌍</div>
                                <div class="setting-details">
                                    <div class="setting-title">언어</div>
                                    <div class="setting-description">앱 언어를 선택하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <select class="setting-select" disabled>
                                    <option>한국어</option>
                                    <option>English</option>
                                    <option>日本語</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">💾</div>
                                <div class="setting-details">
                                    <div class="setting-title">자동 저장</div>
                                    <div class="setting-description">작성 중인 내용을 자동으로 저장합니다</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" autocomplete="off" disabled checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 설정 화면의 이벤트를 바인딩합니다
     */
    bindEvents() {
        // 뒤로 가기 버튼
        const backBtn = document.getElementById('back-to-hub-from-settings');
        if (backBtn) {
            this.eventManager.add(backBtn, 'click', () => {
                this.onNavigateBack();
            });
        }

        // 다크모드 토글
        this.bindDarkModeToggle();
        
        // 테마 변경 리스너 등록
        this.bindThemeChangeListener();
    }

    /**
     * 다크모드 토글 이벤트를 바인딩합니다
     */
    bindDarkModeToggle() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            // 현재 테마 상태로 토글 초기화
            this.updateDarkModeToggle();
            
            // 토글 이벤트 바인딩
            this.eventManager.add(darkModeToggle, 'change', (event) => {
                this.onDarkModeToggle(event.target.checked);
            });
        }
    }

    /**
     * 테마 변경 리스너를 등록합니다
     */
    bindThemeChangeListener() {
        // 테마 변경 시 토글 상태 업데이트
        this.themeChangeListener = (event) => {
            this.updateDarkModeToggle();
        };
        themeManager.addThemeChangeListener(this.themeChangeListener);
    }

    /**
     * 다크모드 토글 상태를 업데이트합니다
     */
    updateDarkModeToggle() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = themeManager.isDarkMode();
        }
    }

    /**
     * 다크모드 토글 이벤트 핸들러
     * @param {boolean} isDarkMode - 다크모드 활성화 여부
     */
    onDarkModeToggle(isDarkMode) {
        try {
            if (isDarkMode) {
                themeManager.setTheme('dark');
                console.log('다크모드가 활성화되었습니다.');
            } else {
                themeManager.setTheme('light');
                console.log('라이트모드가 활성화되었습니다.');
            }
        } catch (error) {
            console.error('테마 변경 중 오류가 발생했습니다:', error);
            // 오류 발생 시 토글 상태 복원
            this.updateDarkModeToggle();
        }
    }

    /**
     * 뒤로 가기
     */
    onNavigateBack() {
        this.dispatchEvent('navigate', { view: 'hub' });
    }

    /**
     * 커스텀 이벤트를 발생시킵니다
     * @param {string} eventName - 이벤트 이름
     * @param {Object} detail - 이벤트 상세 정보
     */
    dispatchEvent(eventName, detail) {
        if (this.container) {
            const event = new CustomEvent(`settingsView:${eventName}`, { detail });
            this.container.dispatchEvent(event);
        }
    }

    /**
     * View 정리
     */
    cleanup() {
        if (this.eventManager) {
            this.eventManager.cleanup();
        }
        
        // 테마 변경 리스너 정리
        if (this.themeChangeListener) {
            themeManager.removeThemeChangeListener(this.themeChangeListener);
            this.themeChangeListener = null;
        }
        
        this.container = null;
    }
}

export { SettingsView };
