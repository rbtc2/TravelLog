/**
 * ProfileView - 프로필 설정 화면 렌더링 및 이벤트 처리
 * 
 * 🎯 책임:
 * - 프로필 설정 화면 UI 렌더링
 * - 프로필 설정 화면 이벤트 바인딩
 * - 계정 관련 설정 관리 (프로필 편집, 비밀번호, 이메일, 계정 연동)
 * 
 * 🔗 관계:
 * - 하위 뷰: ProfileEditView (profile.edit로 접근)
 * - 접근 경로: HubView → 햄버거 메뉴 → ProfileView
 * - ProfileEditView의 상위 뷰 역할
 * 
 * @class ProfileView
 */
import { EventManager } from '../../../modules/utils/event-manager.js';

class ProfileView {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
    }

    /**
     * 프로필 설정 화면을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    render(container) {
        this.container = container;
        // 프로필 뷰 CSS 네임스페이스 클래스 추가
        this.container.classList.add('profile-view');
        this.container.innerHTML = this.getProfileHTML();
        this.bindEvents();
        this.loadProfileData();
    }

    /**
     * 프로필 설정 화면 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getProfileHTML() {
        return `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <div class="header-with-back">
                        <button class="back-btn" id="back-to-hub-from-profile">◀ 뒤로</button>
                        <div class="header-content">
                            <h1 class="my-logs-title">👤 프로필</h1>
                            <p class="my-logs-subtitle">계정 정보와 프로필을 관리하세요</p>
                        </div>
                    </div>
                </div>
                
                <!-- 프로필 정보 섹션 -->
                <div class="hub-section profile-info-section">
                    <div class="section-header">
                        <h2 class="section-title">📋 프로필 정보</h2>
                    </div>
                    <div class="profile-info-content">
                        <div class="profile-avatar-container">
                            <div class="profile-avatar" id="profile-avatar">
                                <img src="" alt="프로필 이미지" class="profile-image" style="display: none;">
                                <div class="profile-avatar-placeholder">✈️</div>
                            </div>
                        </div>
                        <div class="profile-details">
                            <div class="profile-name" id="profile-name">여행자</div>
                            <div class="profile-email" id="profile-email">user@example.com</div>
                            <div class="profile-join-date" id="profile-join-date">가입일: 2024년 12월 29일</div>
                        </div>
                    </div>
                </div>
                
                <!-- 계정 설정 섹션 -->
                <div class="hub-section account-settings-section">
                    <div class="section-header">
                        <h2 class="section-title">⚙️ 계정 설정</h2>
                    </div>
                    <div class="settings-content">
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">✏️</div>
                                <div class="setting-details">
                                    <div class="setting-title">프로필 편집</div>
                                    <div class="setting-description">사용자 프로필 정보를 수정하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <button class="setting-btn-primary" id="edit-profile-btn">편집</button>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">🔒</div>
                                <div class="setting-details">
                                    <div class="setting-title">비밀번호 변경</div>
                                    <div class="setting-description">계정 보안을 위해 비밀번호를 변경하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <button class="setting-btn-secondary" id="change-password-btn" disabled>변경</button>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">📧</div>
                                <div class="setting-details">
                                    <div class="setting-title">이메일 설정</div>
                                    <div class="setting-description">알림 및 마케팅 이메일 수신 설정</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="email-notifications" autocomplete="off" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">📱</div>
                                <div class="setting-details">
                                    <div class="setting-title">계정 연동</div>
                                    <div class="setting-description">소셜 미디어 계정과 연동하세요</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <button class="setting-btn-secondary" id="link-account-btn" disabled>연동</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 개인정보 섹션 -->
                <div class="hub-section privacy-section">
                    <div class="section-header">
                        <h2 class="section-title">🔐 개인정보</h2>
                    </div>
                    <div class="settings-content">
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">📊</div>
                                <div class="setting-details">
                                    <div class="setting-title">데이터 내보내기</div>
                                    <div class="setting-description">여행 데이터를 백업하거나 다른 서비스로 이동</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <button class="setting-btn-secondary" id="export-data-btn" disabled>내보내기</button>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-icon">🗑️</div>
                                <div class="setting-details">
                                    <div class="setting-title">계정 삭제</div>
                                    <div class="setting-description">모든 데이터와 함께 계정을 영구적으로 삭제</div>
                                </div>
                            </div>
                            <div class="setting-control">
                                <button class="setting-btn-danger" id="delete-account-btn" disabled>삭제</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 하단 정보 섹션 -->
                <div class="hub-section info-section">
                    <div class="info-content">
                        <div class="info-item">
                            <span class="info-label">계정 ID:</span>
                            <span class="info-value">user_12345</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">마지막 로그인:</span>
                            <span class="info-value">2024년 12월 29일 14:30</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">데이터 사용량:</span>
                            <span class="info-value">2.3 MB</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 프로필 설정 화면의 이벤트를 바인딩합니다
     */
    bindEvents() {
        // 뒤로 가기 버튼
        const backBtn = document.getElementById('back-to-hub-from-profile');
        if (backBtn) {
            this.eventManager.add(backBtn, 'click', () => {
                this.onNavigateBack();
            });
        }


        // 설정 버튼들
        this.bindSettingEvents();

        // 프로필 편집 뷰에서 오는 이벤트들
        this.bindProfileEditEvents();
    }


    /**
     * 설정 관련 이벤트를 바인딩합니다
     */
    bindSettingEvents() {
        // 프로필 편집 버튼
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            this.eventManager.add(editProfileBtn, 'click', () => {
                this.onEditProfile();
            });
        }

        // 이메일 알림 토글
        const emailNotifications = document.getElementById('email-notifications');
        if (emailNotifications) {
            this.eventManager.add(emailNotifications, 'change', (e) => {
                this.onEmailNotificationChange(e.target.checked);
            });
        }

        // 기타 버튼들 (현재 비활성화)
        const changePasswordBtn = document.getElementById('change-password-btn');
        const linkAccountBtn = document.getElementById('link-account-btn');
        const exportDataBtn = document.getElementById('export-data-btn');
        const deleteAccountBtn = document.getElementById('delete-account-btn');

        if (changePasswordBtn) {
            this.eventManager.add(changePasswordBtn, 'click', () => {
                this.onChangePassword();
            });
        }

        if (linkAccountBtn) {
            this.eventManager.add(linkAccountBtn, 'click', () => {
                this.onLinkAccount();
            });
        }

        if (exportDataBtn) {
            this.eventManager.add(exportDataBtn, 'click', () => {
                this.onExportData();
            });
        }

        if (deleteAccountBtn) {
            this.eventManager.add(deleteAccountBtn, 'click', () => {
                this.onDeleteAccount();
            });
        }
    }

    /**
     * 프로필 편집 뷰에서 오는 이벤트들을 바인딩합니다
     */
    bindProfileEditEvents() {
        // 프로필 편집 뷰에서 사용자 정보 새로고침 이벤트 처리
        if (this.container) {
            this.eventManager.add(this.container, 'profileEditView:refreshUserData', () => {
                this.refreshUserData();
            });
        }
    }

    /**
     * 사용자 정보를 새로고침합니다
     * 프로필 편집 후 업데이트된 정보를 반영
     */
    refreshUserData() {
        try {
            console.log('ProfileView - 사용자 정보 새로고침 시작');
            
            // 프로필 데이터 다시 로드 (이름, 이메일, 가입일 모두)
            this.loadUserProfileName();
            this.loadUserProfileEmail();
            this.loadUserProfileJoinDate();
            this.loadUserProfileBio();
            this.updateUserInfo();
            
            console.log('ProfileView - 사용자 정보 새로고침 완료');
        } catch (error) {
            console.error('ProfileView - 사용자 정보 새로고침 실패:', error);
        }
    }


    /**
     * 프로필 편집
     * ProfileEditView로 네비게이션 (하위 뷰)
     */
    onEditProfile() {
        this.dispatchEvent('navigate', { view: 'profile.edit' });
    }

    /**
     * 비밀번호 변경
     */
    onChangePassword() {
        this.dispatchEvent('showMessage', {
            type: 'info',
            message: '비밀번호 변경 기능은 추후 구현 예정입니다.'
        });
    }

    /**
     * 이메일 알림 설정 변경
     * @param {boolean} enabled - 알림 활성화 여부
     */
    onEmailNotificationChange(enabled) {
        this.dispatchEvent('showMessage', {
            type: 'success',
            message: `이메일 알림이 ${enabled ? '활성화' : '비활성화'}되었습니다.`
        });
    }

    /**
     * 계정 연동
     */
    onLinkAccount() {
        this.dispatchEvent('showMessage', {
            type: 'info',
            message: '계정 연동 기능은 추후 구현 예정입니다.'
        });
    }

    /**
     * 데이터 내보내기
     */
    onExportData() {
        this.dispatchEvent('showMessage', {
            type: 'info',
            message: '데이터 내보내기 기능은 추후 구현 예정입니다.'
        });
    }

    /**
     * 계정 삭제
     */
    onDeleteAccount() {
        this.dispatchEvent('showMessage', {
            type: 'error',
            message: '계정 삭제 기능은 추후 구현 예정입니다.'
        });
    }

    /**
     * 프로필 데이터를 로드합니다
     */
    loadProfileData() {
        try {
            // 먼저 실제 사용자 정보에서 이름, 이메일, 가입일을 가져옵니다
            this.loadUserProfileName();
            this.loadUserProfileEmail();
            this.loadUserProfileJoinDate();
            
            // 그 다음 로컬 프로필 데이터를 로드합니다
            const savedData = localStorage.getItem('travelLog_profile');
            if (savedData) {
                const profileData = JSON.parse(savedData);
                
                // 프로필 이미지는 ProfileEditView에서만 편집 가능
                // if (profileData.image) {
                //     this.updateProfileImage(profileData.image);
                // }
            }
            
            // 바이오 정보 로드 (로컬 스토리지에서)
            this.loadUserProfileBio();
            
            // 실제 사용자 정보 업데이트
            this.updateUserInfo();
        } catch (error) {
            console.error('프로필 데이터 로드 실패:', error);
        }
    }

    /**
     * 실제 사용자 정보에서 프로필 이름을 로드합니다
     */
    loadUserProfileName() {
        try {
            // AuthController를 통해 현재 사용자 정보 가져오기
            if (window.appManager && window.appManager.authManager && window.appManager.authManager.authController) {
                const currentUser = window.appManager.authManager.authController.getCurrentUser();
                if (currentUser && currentUser.user_metadata && currentUser.user_metadata.full_name) {
                    const profileName = document.getElementById('profile-name');
                    if (profileName) {
                        profileName.textContent = currentUser.user_metadata.full_name;
                        console.log('ProfileView - 사용자 이름 로드됨:', currentUser.user_metadata.full_name);
                        return;
                    }
                }
            }
            
            // AuthController가 없거나 사용자 정보가 없는 경우 기본값 사용
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.textContent = '여행자';
                console.log('ProfileView - 기본 이름 사용: 여행자');
            }
        } catch (error) {
            console.error('ProfileView - 사용자 프로필 이름 로드 실패:', error);
            // 오류 발생 시 기본값 사용
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.textContent = '여행자';
            }
        }
    }

    /**
     * 실제 사용자 정보에서 프로필 이메일을 로드합니다
     */
    loadUserProfileEmail() {
        try {
            // AuthController를 통해 현재 사용자 정보 가져오기
            if (window.appManager && window.appManager.authManager && window.appManager.authManager.authController) {
                const currentUser = window.appManager.authManager.authController.getCurrentUser();
                if (currentUser && currentUser.email) {
                    const profileEmail = document.getElementById('profile-email');
                    if (profileEmail) {
                        profileEmail.textContent = currentUser.email;
                        console.log('ProfileView - 사용자 이메일 로드됨:', currentUser.email);
                        return;
                    }
                }
            }
            
            // AuthController가 없거나 사용자 정보가 없는 경우 기본값 사용
            const profileEmail = document.getElementById('profile-email');
            if (profileEmail) {
                profileEmail.textContent = 'user@example.com';
                console.log('ProfileView - 기본 이메일 사용: user@example.com');
            }
        } catch (error) {
            console.error('ProfileView - 사용자 프로필 이메일 로드 실패:', error);
            // 오류 발생 시 기본값 사용
            const profileEmail = document.getElementById('profile-email');
            if (profileEmail) {
                profileEmail.textContent = 'user@example.com';
            }
        }
    }

    /**
     * 실제 사용자 정보에서 프로필 가입일을 로드합니다
     */
    loadUserProfileJoinDate() {
        try {
            // AuthController를 통해 현재 사용자 정보 가져오기
            if (window.appManager && window.appManager.authManager && window.appManager.authManager.authController) {
                const currentUser = window.appManager.authManager.authController.getCurrentUser();
                if (currentUser && currentUser.created_at) {
                    const profileJoinDate = document.getElementById('profile-join-date');
                    if (profileJoinDate) {
                        const joinDate = new Date(currentUser.created_at);
                        const formattedDate = this.formatKoreanDate(joinDate);
                        profileJoinDate.textContent = `가입일: ${formattedDate}`;
                        console.log('ProfileView - 사용자 가입일 로드됨:', formattedDate);
                        return;
                    }
                }
            }
            
            // AuthController가 없거나 사용자 정보가 없는 경우 기본값 사용
            const profileJoinDate = document.getElementById('profile-join-date');
            if (profileJoinDate) {
                const defaultDate = '2024년 12월 29일';
                profileJoinDate.textContent = `가입일: ${defaultDate}`;
                console.log('ProfileView - 기본 가입일 사용:', defaultDate);
            }
        } catch (error) {
            console.error('ProfileView - 사용자 프로필 가입일 로드 실패:', error);
            // 오류 발생 시 기본값 사용
            const profileJoinDate = document.getElementById('profile-join-date');
            if (profileJoinDate) {
                profileJoinDate.textContent = '가입일: 2024년 12월 29일';
            }
        }
    }

    /**
     * 사용자 프로필 바이오를 로드합니다
     */
    loadUserProfileBio() {
        try {
            // 로컬 스토리지에서 바이오 정보 가져오기
            const savedData = localStorage.getItem('travelLog_profile');
            let bioText = '';
            
            if (savedData) {
                const profileData = JSON.parse(savedData);
                bioText = profileData.bio || '';
            }
            
            const profileBio = document.getElementById('profile-bio');
            if (profileBio) {
                if (bioText && bioText.trim()) {
                    profileBio.textContent = bioText;
                    profileBio.classList.remove('placeholder');
                    console.log('ProfileView - 사용자 바이오 로드됨:', bioText);
                } else {
                    // 바이오가 없는 경우 기본값 또는 플레이스홀더 표시
                    const placeholder = profileBio.getAttribute('data-placeholder') || '바이오를 입력하세요...';
                    profileBio.textContent = placeholder;
                    profileBio.classList.add('placeholder');
                    console.log('ProfileView - 기본 바이오 플레이스홀더 사용');
                }
            }
        } catch (error) {
            console.error('ProfileView - 사용자 프로필 바이오 로드 실패:', error);
            // 오류 발생 시 기본값 사용
            const profileBio = document.getElementById('profile-bio');
            if (profileBio) {
                profileBio.textContent = 'I am new to TravelLog.';
            }
        }
    }

    /**
     * 실제 사용자 정보를 업데이트합니다
     */
    updateUserInfo() {
        try {
            // 현재 사용자 정보 가져오기
            const currentUser = this.getCurrentUser();
            
            // 계정 ID 업데이트
            const accountIdElement = document.querySelector('.info-item:nth-child(1) .info-value');
            if (accountIdElement) {
                accountIdElement.textContent = currentUser.id || 'user_unknown';
            }
            
            // 마지막 로그인 시간 업데이트
            const lastLoginElement = document.querySelector('.info-item:nth-child(2) .info-value');
            if (lastLoginElement) {
                const lastLogin = currentUser.lastLogin || new Date().toISOString();
                const loginDate = new Date(lastLogin);
                const formattedDate = this.formatKoreanDate(loginDate);
                lastLoginElement.textContent = formattedDate;
            }
            
            // 데이터 사용량 계산 (실제 로그 데이터 기반)
            const dataUsageElement = document.querySelector('.info-item:nth-child(3) .info-value');
            if (dataUsageElement) {
                const dataUsage = this.calculateDataUsage();
                dataUsageElement.textContent = dataUsage;
            }
            
        } catch (error) {
            console.error('사용자 정보 업데이트 실패:', error);
        }
    }

    /**
     * 현재 사용자 정보를 가져옵니다
     */
    getCurrentUser() {
        // 로컬 스토리지에서 사용자 정보 가져오기
        const userData = localStorage.getItem('travelLog_user');
        if (userData) {
            return JSON.parse(userData);
        }
        
        // 기본 사용자 정보 반환
        return {
            id: 'user_' + Date.now(),
            lastLogin: new Date().toISOString(),
            email: 'user@example.com'
        };
    }

    /**
     * 한국어 날짜 형식으로 포맷합니다
     */
    formatKoreanDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    }

    /**
     * 데이터 사용량을 계산합니다
     */
    calculateDataUsage() {
        try {
            const logs = this.controller.getAllLogs();
            let totalSize = 0;
            
            // 각 로그의 크기 추정 (JSON 문자열 길이 기반)
            logs.forEach(log => {
                const logSize = JSON.stringify(log).length;
                totalSize += logSize;
            });
            
            // 바이트를 MB로 변환
            const sizeInMB = (totalSize / (1024 * 1024)).toFixed(1);
            return `${sizeInMB} MB`;
            
        } catch (error) {
            console.error('데이터 사용량 계산 실패:', error);
            return '0.0 MB';
        }
    }

    /**
     * 프로필 데이터를 저장합니다
     */
    saveProfileData() {
        const profileData = {
            name: document.getElementById('profile-name')?.textContent || '여행자',
            email: document.getElementById('profile-email')?.textContent || 'user@example.com'
            // 프로필 이미지는 ProfileEditView에서만 편집 가능
            // image: document.querySelector('.profile-image')?.src || null
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
            const event = new CustomEvent(`profileView:${eventName}`, { detail });
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

export { ProfileView };
