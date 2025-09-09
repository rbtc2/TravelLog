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
                                    <input type="checkbox" autocomplete="off" disabled>
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
        this.container = null;
    }
}

export { SettingsView };
