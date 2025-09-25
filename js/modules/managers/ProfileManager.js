/**
 * ProfileManager - 프로필 데이터 관리자
 * 
 * 🎯 책임:
 * - 프로필 데이터 로드 및 저장
 * - 프로필 이름 편집
 * - 사용자 인증 정보 연동
 * - 프로필 이벤트 관리
 * 
 * @class ProfileManager
 * @version 1.0.0
 * @since 2024-12-29
 */
class ProfileManager {
    constructor(eventManager, dispatchEvent) {
        this.eventManager = eventManager;
        this.dispatchEvent = dispatchEvent;
        this.storageKey = 'travelLog_profile';
    }

    /**
     * 프로필 관련 이벤트를 바인딩합니다
     */
    bindProfileEvents() {
        // 프로필 이름 편집
        const profileName = document.getElementById('profile-name');
        if (profileName) {
            this.eventManager.add(profileName, 'click', () => {
                this.editProfileName();
            });
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
     * 프로필 데이터를 저장합니다
     */
    saveProfileData() {
        const profileData = {
            name: document.getElementById('profile-name')?.textContent || '여행자'
        };

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(profileData));
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
            // 먼저 실제 사용자 정보에서 이름을 가져옵니다
            this.loadUserProfileName();
            
            // 그 다음 로컬 프로필 데이터를 로드합니다
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const profileData = JSON.parse(savedData);
                // 프로필 데이터 로드 (이미지 제외)
                this.applyProfileData(profileData);
            }
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
                        console.log('사용자 이름 로드됨:', currentUser.user_metadata.full_name);
                        return;
                    }
                }
            }
            
            // AuthController가 없거나 사용자 정보가 없는 경우 기본값 사용
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.textContent = '여행자';
                console.log('기본 이름 사용: 여행자');
            }
        } catch (error) {
            console.error('사용자 프로필 이름 로드 실패:', error);
            // 오류 발생 시 기본값 사용
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.textContent = '여행자';
            }
        }
    }

    /**
     * 프로필 데이터를 UI에 적용합니다
     * @param {Object} profileData - 적용할 프로필 데이터
     */
    applyProfileData(profileData) {
        if (profileData.name) {
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.textContent = profileData.name;
            }
        }
    }

    /**
     * 현재 프로필 데이터를 가져옵니다
     * @returns {Object} 현재 프로필 데이터
     */
    getCurrentProfileData() {
        const profileName = document.getElementById('profile-name');
        return {
            name: profileName?.textContent || '여행자'
        };
    }

    /**
     * 프로필 이름을 설정합니다
     * @param {string} name - 설정할 이름
     */
    setProfileName(name) {
        const profileName = document.getElementById('profile-name');
        if (profileName && name) {
            profileName.textContent = name.trim();
        }
    }

    /**
     * 프로필 데이터를 초기화합니다
     */
    resetProfileData() {
        try {
            localStorage.removeItem(this.storageKey);
            this.setProfileName('여행자');
            console.log('프로필 데이터 초기화됨');
        } catch (error) {
            console.error('프로필 데이터 초기화 실패:', error);
        }
    }

    /**
     * 프로필 데이터가 저장되어 있는지 확인합니다
     * @returns {boolean} 프로필 데이터 저장 여부
     */
    hasStoredProfileData() {
        return localStorage.getItem(this.storageKey) !== null;
    }

    /**
     * ProfileManager를 정리합니다
     */
    cleanup() {
        // 프로필 관련 이벤트는 EventManager가 정리하므로 별도 정리 불필요
        console.log('ProfileManager 정리 완료');
    }
}

export { ProfileManager };
