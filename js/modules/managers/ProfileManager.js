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
        this.lastLoadedName = null; // 마지막으로 로드된 이름을 추적
        this.isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }

    /**
     * 프로필 관련 이벤트를 바인딩합니다
     */
    bindProfileEvents() {
        // 프로필 이름 편집 기능은 ProfileEditView에서만 사용 가능
        // const profileName = document.getElementById('profile-name');
        // if (profileName) {
        //     this.eventManager.add(profileName, 'click', () => {
        //         this.editProfileName();
        //     });
        // }
    }


    /**
     * 프로필 데이터를 저장합니다
     */
    saveProfileData() {
        const profileName = document.getElementById('profile-name');
        const profileBio = document.getElementById('profile-bio');
        
        const profileData = {
            name: profileName?.textContent || '여행자',
            bio: profileBio?.textContent || ''
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
            // 먼저 실제 사용자 정보에서 이름, 이메일, 가입일을 가져옵니다
            this.loadUserProfileName();
            this.loadUserProfileEmail();
            this.loadUserProfileJoinDate();
            
            // 그 다음 로컬 프로필 데이터를 로드합니다
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const profileData = JSON.parse(savedData);
                // 프로필 데이터 로드 (이미지 제외)
                this.applyProfileData(profileData);
            }
            
            // 바이오 정보 로드 (로컬 스토리지에서)
            this.loadUserProfileBio();
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
                    const userName = currentUser.user_metadata.full_name;
                    const profileName = document.getElementById('profile-name');
                    
                    if (profileName) {
                        profileName.textContent = userName;
                        
                        // 중복 로그 방지: 이전에 로드된 이름과 다를 때만 로그 출력
                        if (this.lastLoadedName !== userName && this.isDevelopment) {
                            console.log('사용자 이름 로드됨:', userName);
                            this.lastLoadedName = userName;
                        }
                        return;
                    }
                }
            }
            
            // AuthController가 없거나 사용자 정보가 없는 경우 기본값 사용
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                const defaultName = '여행자';
                profileName.textContent = defaultName;
                
                // 중복 로그 방지: 이전에 로드된 이름과 다를 때만 로그 출력
                if (this.lastLoadedName !== defaultName && this.isDevelopment) {
                    console.log('기본 이름 사용: 여행자');
                    this.lastLoadedName = defaultName;
                }
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
     * 실제 사용자 정보에서 프로필 이메일을 로드합니다
     */
    loadUserProfileEmail() {
        try {
            // AuthController를 통해 현재 사용자 정보 가져오기
            if (window.appManager && window.appManager.authManager && window.appManager.authManager.authController) {
                const currentUser = window.appManager.authManager.authController.getCurrentUser();
                if (currentUser && currentUser.email) {
                    const userEmail = currentUser.email;
                    const profileEmail = document.getElementById('profile-email');
                    
                    if (profileEmail) {
                        profileEmail.textContent = userEmail;
                        
                        if (this.isDevelopment) {
                            console.log('사용자 이메일 로드됨:', userEmail);
                        }
                        return;
                    }
                }
            }
            
            // AuthController가 없거나 사용자 정보가 없는 경우 기본값 사용
            const profileEmail = document.getElementById('profile-email');
            if (profileEmail) {
                const defaultEmail = 'user@example.com';
                profileEmail.textContent = defaultEmail;
                
                if (this.isDevelopment) {
                    console.log('기본 이메일 사용:', defaultEmail);
                }
            }
        } catch (error) {
            console.error('사용자 프로필 이메일 로드 실패:', error);
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
                        
                        if (this.isDevelopment) {
                            console.log('사용자 가입일 로드됨:', formattedDate);
                        }
                        return;
                    }
                }
            }
            
            // AuthController가 없거나 사용자 정보가 없는 경우 기본값 사용
            const profileJoinDate = document.getElementById('profile-join-date');
            if (profileJoinDate) {
                const defaultDate = '2024년 12월 29일';
                profileJoinDate.textContent = `가입일: ${defaultDate}`;
                
                if (this.isDevelopment) {
                    console.log('기본 가입일 사용:', defaultDate);
                }
            }
        } catch (error) {
            console.error('사용자 프로필 가입일 로드 실패:', error);
            // 오류 발생 시 기본값 사용
            const profileJoinDate = document.getElementById('profile-join-date');
            if (profileJoinDate) {
                profileJoinDate.textContent = '가입일: 2024년 12월 29일';
            }
        }
    }

    /**
     * 한국어 날짜 형식으로 포맷합니다
     * @param {Date} date - 포맷할 날짜
     * @returns {string} 한국어 형식의 날짜 문자열
     */
    formatKoreanDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        return `${year}년 ${month}월 ${day}일`;
    }

    /**
     * 사용자 프로필 바이오를 로드합니다
     */
    loadUserProfileBio() {
        try {
            // 로컬 스토리지에서 바이오 정보 가져오기
            const savedData = localStorage.getItem(this.storageKey);
            let bioText = '';
            
            if (savedData) {
                const profileData = JSON.parse(savedData);
                bioText = profileData.bio || '';
            }
            
            const profileBio = document.getElementById('profile-bio');
            if (profileBio) {
                if (bioText && bioText.trim()) {
                    profileBio.textContent = bioText;
                    if (this.isDevelopment) {
                        console.log('사용자 바이오 로드됨:', bioText);
                    }
                } else {
                    // 바이오가 없는 경우 기본값 또는 플레이스홀더 표시
                    const placeholder = profileBio.getAttribute('data-placeholder') || '바이오를 입력하세요...';
                    profileBio.textContent = placeholder;
                    profileBio.classList.add('placeholder');
                    
                    if (this.isDevelopment) {
                        console.log('기본 바이오 플레이스홀더 사용');
                    }
                }
            }
        } catch (error) {
            console.error('사용자 프로필 바이오 로드 실패:', error);
            // 오류 발생 시 기본값 사용
            const profileBio = document.getElementById('profile-bio');
            if (profileBio) {
                profileBio.textContent = 'I am new to TravelLog.';
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
        
        if (profileData.bio) {
            const profileBio = document.getElementById('profile-bio');
            if (profileBio) {
                profileBio.textContent = profileData.bio;
                profileBio.classList.remove('placeholder');
            }
        }
    }

    /**
     * 현재 프로필 데이터를 가져옵니다
     * @returns {Object} 현재 프로필 데이터
     */
    getCurrentProfileData() {
        const profileName = document.getElementById('profile-name');
        const profileBio = document.getElementById('profile-bio');
        
        return {
            name: profileName?.textContent || '여행자',
            bio: profileBio?.textContent || ''
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
     * 프로필 바이오를 설정합니다
     * @param {string} bio - 설정할 바이오
     */
    setProfileBio(bio) {
        const profileBio = document.getElementById('profile-bio');
        if (profileBio) {
            if (bio && bio.trim()) {
                profileBio.textContent = bio.trim();
                profileBio.classList.remove('placeholder');
            } else {
                const placeholder = profileBio.getAttribute('data-placeholder') || '바이오를 입력하세요...';
                profileBio.textContent = placeholder;
                profileBio.classList.add('placeholder');
            }
        }
    }

    /**
     * 프로필 데이터를 초기화합니다
     */
    resetProfileData() {
        try {
            localStorage.removeItem(this.storageKey);
            this.setProfileName('여행자');
            this.setProfileBio('');
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
