/**
 * HubView - 허브 화면 (프로필, 요약, 보관함) 렌더링 및 이벤트 처리
 * 
 * 🎯 책임:
 * - 허브 화면 UI 렌더링
 * - 허브 화면 이벤트 바인딩
 * - 프로필, 요약, 보관함 섹션 관리
 * 
 * @class HubView
 */
import { EventManager } from '../../../modules/utils/event-manager.js';

class HubView {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
    }

    /**
     * 허브 화면을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    render(container) {
        this.container = container;
        this.container.innerHTML = this.getHubHTML();
        this.bindEvents();
        this.loadProfileData();
    }

    /**
     * 허브 화면 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getHubHTML() {
        const totalLogs = this.controller.getAllLogs().length;
        const stats = this.controller.getBasicStats();
        
        return `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <div class="header-with-settings">
                        <div class="header-content">
                            <h1 class="my-logs-title">📝 나의 로그</h1>
                            <p class="my-logs-subtitle">여행 기록과 계획을 한 곳에서 관리하세요</p>
                        </div>
                        <button class="settings-btn" id="settings-btn" title="설정">
                            ⚙️
                        </button>
                    </div>
                </div>
                
                <!-- 프로필 섹션 (Simple Style) -->
                <div class="hub-section profile-section">
                    <div class="profile-content">
                        <div class="profile-avatar-container">
                            <div class="profile-avatar" id="profile-avatar">
                                <img src="" alt="프로필 이미지" class="profile-image" style="display: none;">
                                <div class="profile-avatar-placeholder">✈️</div>
                            </div>
                            <button class="profile-avatar-edit" id="profile-avatar-edit" title="프로필 이미지 변경">
                                <span class="camera-icon">📷</span>
                            </button>
                            <input type="file" id="profile-image-input" accept="image/*" style="display: none;">
                        </div>
                        <div class="profile-info">
                            <div class="profile-name" id="profile-name">여행자</div>
                            <div class="profile-bio" id="profile-bio" contenteditable="true" data-placeholder="한마디 메시지를 입력하세요...">I am new to TravelLog.</div>
                        </div>
                    </div>
                    
                    <!-- 통계 섹션 -->
                    <div class="profile-stats">
                        <div class="stat-item">
                            <div class="stat-value" id="stat-trips">${totalLogs}</div>
                            <div class="stat-label">일지 수</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" id="stat-countries">${stats.visitedCountries}</div>
                            <div class="stat-label">나라 수</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" id="stat-cities">${stats.visitedCities}</div>
                            <div class="stat-label">도시 수</div>
                        </div>
                    </div>
                </div>
                
                <!-- 보관함 섹션 -->
                <div class="hub-section archive-section">
                    <div class="section-header">
                        <h2 class="section-title">📁 보관함</h2>
                    </div>
                    <div class="archive-content">
                        <div class="archive-item" id="my-schedules-btn">
                            <div class="archive-icon">📅</div>
                            <div class="archive-details">
                                <div class="archive-title">나의 일정</div>
                                <div class="archive-description">등록된 여행 일지를 확인하고 관리하세요</div>
                            </div>
                            <div class="archive-arrow">▶</div>
                        </div>
                        
                        <div class="archive-item disabled" id="bucket-list-btn">
                            <div class="archive-icon">🎯</div>
                            <div class="archive-details">
                                <div class="archive-title">버킷리스트</div>
                                <div class="archive-description">가고 싶은 곳들을 미리 계획해보세요</div>
                            </div>
                            <div class="archive-status">준비 중</div>
                        </div>
                    </div>
                </div>
                
                <!-- 트래블 레포트 섹션 -->
                <div class="hub-section travel-report-section">
                    <div class="section-header">
                        <h2 class="section-title">📊 트래블 레포트</h2>
                    </div>
                    <div class="travel-report-content">
                        <div class="report-action">
                            <button class="view-report-btn" id="view-report-btn">레포트 보기</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 허브 화면의 이벤트를 바인딩합니다
     */
    bindEvents() {
        // 나의 일정 버튼
        const mySchedulesBtn = document.getElementById('my-schedules-btn');
        if (mySchedulesBtn) {
            this.eventManager.add(mySchedulesBtn, 'click', () => {
                this.onNavigateToLogs();
            });
        }
        
        // 버킷리스트 버튼 (미구현)
        const bucketListBtn = document.getElementById('bucket-list-btn');
        if (bucketListBtn) {
            this.eventManager.add(bucketListBtn, 'click', () => {
                this.onBucketListClick();
            });
        }
        
        // 트래블 레포트 버튼
        const viewReportBtn = document.getElementById('view-report-btn');
        if (viewReportBtn) {
            console.log('HubView: 트래블 레포트 버튼 이벤트 바인딩 완료');
            this.eventManager.add(viewReportBtn, 'click', () => {
                console.log('HubView: 트래블 레포트 버튼 클릭됨');
                this.onNavigateToTravelReport();
            });
        } else {
            console.error('HubView: 트래블 레포트 버튼을 찾을 수 없습니다');
        }

        // 설정 버튼
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            this.eventManager.add(settingsBtn, 'click', () => {
                this.onNavigateToSettings();
            });
        }

        // 프로필 이미지 업로드 이벤트
        this.bindProfileEvents();
    }

    /**
     * 로그 목록으로 이동
     */
    onNavigateToLogs() {
        this.dispatchEvent('navigate', { view: 'logs' });
    }

    /**
     * 트래블 레포트로 이동
     */
    onNavigateToTravelReport() {
        console.log('HubView: onNavigateToTravelReport 호출됨');
        this.dispatchEvent('navigate', { view: 'travelReport' });
    }

    /**
     * 설정으로 이동
     */
    onNavigateToSettings() {
        this.dispatchEvent('navigate', { view: 'settings' });
    }

    /**
     * 버킷리스트 클릭 (미구현)
     */
    onBucketListClick() {
        this.dispatchEvent('showMessage', { 
            type: 'info', 
            message: '버킷리스트 기능은 추후 구현 예정입니다.' 
        });
    }

    /**
     * 프로필 관련 이벤트를 바인딩합니다
     */
    bindProfileEvents() {
        // 프로필 이미지 업로드 버튼
        const avatarEditBtn = document.getElementById('profile-avatar-edit');
        const imageInput = document.getElementById('profile-image-input');
        
        if (avatarEditBtn && imageInput) {
            this.eventManager.add(avatarEditBtn, 'click', () => {
                imageInput.click();
            });
            
            this.eventManager.add(imageInput, 'change', (e) => {
                this.handleImageUpload(e);
            });
        }

        // 프로필 이름 편집
        const profileName = document.getElementById('profile-name');
        if (profileName) {
            this.eventManager.add(profileName, 'click', () => {
                this.editProfileName();
            });
        }

        // 프로필 한마디 편집
        const profileBio = document.getElementById('profile-bio');
        if (profileBio) {
            this.eventManager.add(profileBio, 'blur', () => {
                this.saveProfileBio();
            });
            
            this.eventManager.add(profileBio, 'keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    profileBio.blur();
                }
            });
        }
    }

    /**
     * 이미지 업로드를 처리합니다
     * @param {Event} event - 파일 입력 이벤트
     */
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 파일 크기 검증 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            this.dispatchEvent('showMessage', {
                type: 'error',
                message: '이미지 크기는 5MB 이하여야 합니다.'
            });
            return;
        }

        // 이미지 타입 검증
        if (!file.type.startsWith('image/')) {
            this.dispatchEvent('showMessage', {
                type: 'error',
                message: '이미지 파일만 업로드할 수 있습니다.'
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.updateProfileImage(e.target.result);
            this.saveProfileData();
        };
        reader.readAsDataURL(file);
    }

    /**
     * 프로필 이미지를 업데이트합니다
     * @param {string} imageData - 이미지 데이터 URL
     */
    updateProfileImage(imageData) {
        const profileImage = document.querySelector('.profile-image');
        const placeholder = document.querySelector('.profile-avatar-placeholder');
        
        if (profileImage && placeholder) {
            profileImage.src = imageData;
            profileImage.style.display = 'block';
            placeholder.style.display = 'none';
        }
    }

    /**
     * 프로필 이름을 편집합니다
     */
    editProfileName() {
        const profileName = document.getElementById('profile-name');
        if (!profileName) return;

        const currentName = profileName.textContent;
        const newName = prompt('이름을 입력하세요:', currentName);
        
        if (newName && newName.trim() && newName !== currentName) {
            profileName.textContent = newName.trim();
            this.saveProfileData();
        }
    }

    /**
     * 프로필 한마디를 저장합니다
     */
    saveProfileBio() {
        const profileBio = document.getElementById('profile-bio');
        if (!profileBio) return;

        const bio = profileBio.textContent.trim();
        this.saveProfileData();
    }

    /**
     * 프로필 데이터를 저장합니다
     */
    saveProfileData() {
        const profileData = {
            name: document.getElementById('profile-name')?.textContent || '여행자',
            bio: document.getElementById('profile-bio')?.textContent || 'I am new to TravelLog.',
            image: document.querySelector('.profile-image')?.src || null
        };

        try {
            localStorage.setItem('travelLog_profile', JSON.stringify(profileData));
            this.dispatchEvent('showMessage', {
                type: 'success',
                message: '프로필이 저장되었습니다.'
            });
        } catch (error) {
            console.error('프로필 저장 실패:', error);
            this.dispatchEvent('showMessage', {
                type: 'error',
                message: '프로필 저장에 실패했습니다.'
            });
        }
    }

    /**
     * 저장된 프로필 데이터를 로드합니다
     */
    loadProfileData() {
        try {
            const savedData = localStorage.getItem('travelLog_profile');
            if (savedData) {
                const profileData = JSON.parse(savedData);
                
                const profileName = document.getElementById('profile-name');
                const profileBio = document.getElementById('profile-bio');
                
                if (profileName && profileData.name) {
                    profileName.textContent = profileData.name;
                }
                
                if (profileBio && profileData.bio) {
                    profileBio.textContent = profileData.bio;
                }
                
                if (profileData.image) {
                    this.updateProfileImage(profileData.image);
                }
            }
        } catch (error) {
            console.error('프로필 데이터 로드 실패:', error);
        }
    }

    /**
     * 커스텀 이벤트를 발생시킵니다
     * @param {string} eventName - 이벤트 이름
     * @param {Object} detail - 이벤트 상세 정보
     */
    dispatchEvent(eventName, detail) {
        if (this.container) {
            const event = new CustomEvent(`hubView:${eventName}`, { detail });
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

export { HubView };
