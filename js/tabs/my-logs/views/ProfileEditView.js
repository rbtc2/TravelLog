/**
 * ProfileEditView - 프로필 편집 화면 렌더링 및 이벤트 처리
 * 
 * 🎯 책임:
 * - 프로필 편집 화면 UI 렌더링
 * - 프로필 편집 화면 이벤트 바인딩
 * - 프로필 데이터 편집 및 저장 관리
 * 
 * 🔗 관계:
 * - 상위 뷰: ProfileView (profile.edit로 접근)
 * - 접근 경로: HubView → 햄버거 메뉴 → ProfileView → 프로필 편집 버튼 → ProfileEditView
 * - 독립적이지만 ProfileView를 통해서만 접근 가능한 하위 뷰
 * 
 * @class ProfileEditView
 * @version 1.0.0
 * @since 2024-12-29
 */
import { EventManager } from '../../../modules/utils/event-manager.js';

class ProfileEditView {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
        this.isInitialized = false;
        
        // 편집 상태 관리
        this.isEditing = false;
        this.hasUnsavedChanges = false;
        this.originalData = {};
        this.currentData = {};
    }

    /**
     * 프로필 편집 화면을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    async render(container) {
        this.container = container;
        // 프로필 편집 뷰 CSS 네임스페이스 클래스 추가
        this.container.classList.add('profile-edit-view');
        this.container.innerHTML = this.getProfileEditHTML();
        this.bindEvents();
        
        // 사용자 정보 로드 및 폼에 채우기
        await this.loadUserData();
        
        this.isInitialized = true;
    }

    /**
     * 프로필 편집 화면 HTML을 생성합니다
     * @returns {string} HTML 문자열
     */
    getProfileEditHTML() {
        return `
            <div class="my-logs-container">
                <div class="my-logs-header">
                    <div class="header-with-back">
                        <button class="back-btn" id="back-to-profile">◀ 뒤로</button>
                        <div class="header-content">
                            <h1 class="my-logs-title">✏️ 프로필 편집</h1>
                            <p class="my-logs-subtitle">프로필 정보를 수정하세요</p>
                        </div>
                    </div>
                </div>
                
                <!-- 프로필 사진 섹션 -->
                <div class="hub-section profile-photo-section">
                    <div class="section-header">
                        <h2 class="section-title">📷 프로필 사진</h2>
                    </div>
                    <div class="profile-photo-content">
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
                        <div class="avatar-options">
                            <h3 class="avatar-options-title">기본 프로필 선택</h3>
                            <div class="avatar-options-grid">
                                <button class="avatar-option" data-avatar="✈️" title="비행기">✈️</button>
                                <button class="avatar-option" data-avatar="🌍" title="지구본">🌍</button>
                                <button class="avatar-option" data-avatar="🎒" title="여행가방">🎒</button>
                                <button class="avatar-option" data-avatar="📷" title="카메라">📷</button>
                                <button class="avatar-option" data-avatar="🗺️" title="지도">🗺️</button>
                                <button class="avatar-option" data-avatar="🏖️" title="해변">🏖️</button>
                                <button class="avatar-option" data-avatar="🏔️" title="산">🏔️</button>
                                <button class="avatar-option" data-avatar="🌆" title="도시">🌆</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 기본 정보 섹션 -->
                <div class="hub-section profile-info-section">
                    <div class="section-header">
                        <h2 class="section-title">📋 기본 정보</h2>
                    </div>
                    <div class="profile-info-content">
                        <div class="form-group">
                            <label for="profile-name-input" class="form-label">
                                이름
                                <span class="required-indicator">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="profile-name-input" 
                                class="form-input" 
                                placeholder="이름을 입력하세요"
                                maxlength="20"
                                required
                            >
                            <div class="form-error" id="name-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="profile-bio-input" class="form-label">바이오</label>
                            <textarea 
                                id="profile-bio-input" 
                                class="form-textarea" 
                                placeholder="자신을 소개해주세요 (선택사항)" 
                                rows="3"
                                maxlength="100"
                            ></textarea>
                            <div class="form-char-count" id="bio-char-count">0/100</div>
                        </div>
                        
                        <div class="form-group">
                            <label for="profile-country-input" class="form-label">
                                거주국
                                <span class="required-indicator">*</span>
                            </label>
                            <select id="profile-country-input" class="form-select" required>
                                <option value="">거주국을 선택하세요</option>
                                <option value="KR">🇰🇷 대한민국</option>
                                <option value="US">🇺🇸 미국</option>
                                <option value="JP">🇯🇵 일본</option>
                                <option value="CN">🇨🇳 중국</option>
                                <option value="GB">🇬🇧 영국</option>
                                <option value="DE">🇩🇪 독일</option>
                                <option value="FR">🇫🇷 프랑스</option>
                                <option value="IT">🇮🇹 이탈리아</option>
                                <option value="ES">🇪🇸 스페인</option>
                                <option value="CA">🇨🇦 캐나다</option>
                                <option value="AU">🇦🇺 호주</option>
                                <option value="SG">🇸🇬 싱가포르</option>
                                <option value="TH">🇹🇭 태국</option>
                                <option value="VN">🇻🇳 베트남</option>
                                <option value="ID">🇮🇩 인도네시아</option>
                                <option value="MY">🇲🇾 말레이시아</option>
                                <option value="PH">🇵🇭 필리핀</option>
                                <option value="IN">🇮🇳 인도</option>
                                <option value="BR">🇧🇷 브라질</option>
                                <option value="MX">🇲🇽 멕시코</option>
                                <option value="RU">🇷🇺 러시아</option>
                                <option value="other">기타</option>
                            </select>
                            <div class="form-error" id="country-error"></div>
                        </div>
                    </div>
                </div>
                
                <!-- 저장/취소 버튼 -->
                <div class="profile-edit-actions">
                    <button class="save-btn primary" id="save-profile-edit" disabled>저장</button>
                    <button class="cancel-btn" id="cancel-profile-edit">취소</button>
                </div>
                
                <!-- 변경사항 확인 모달 (스켈레톤) -->
                <div class="unsaved-changes-modal" id="unsaved-changes-modal" style="display: none;">
                    <div class="modal-overlay">
                        <div class="modal-content">
                            <h3 class="modal-title">저장하지 않은 변경사항</h3>
                            <p class="modal-message">변경사항이 저장되지 않았습니다. 정말로 나가시겠습니까?</p>
                            <div class="modal-actions">
                                <button class="modal-btn secondary" id="modal-cancel">계속 편집</button>
                                <button class="modal-btn danger" id="modal-discard">변경사항 버리기</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 프로필 편집 화면의 이벤트를 바인딩합니다
     */
    bindEvents() {
        // 뒤로가기 버튼
        const backBtn = document.getElementById('back-to-profile');
        if (backBtn) {
            this.eventManager.add(backBtn, 'click', () => {
                this.onBackToProfile();
            });
        }
        
        
        // 하단 저장 버튼
        const saveBtn = document.getElementById('save-profile-edit');
        if (saveBtn) {
            this.eventManager.add(saveBtn, 'click', () => {
                this.onSaveProfile();
            });
        }
        
        // 취소 버튼
        const cancelBtn = document.getElementById('cancel-profile-edit');
        if (cancelBtn) {
            this.eventManager.add(cancelBtn, 'click', () => {
                this.onCancelEdit();
            });
        }
        
        // 프로필 사진 관련 이벤트
        this.bindProfilePhotoEvents();
        
        // 폼 입력 이벤트
        this.bindFormEvents();
        
        // 변경사항 확인 모달 이벤트
        this.bindModalEvents();
    }

    /**
     * 프로필 사진 관련 이벤트를 바인딩합니다
     */
    bindProfilePhotoEvents() {
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
        
        // 기본 아바타 옵션들
        const avatarOptions = document.querySelectorAll('.avatar-option');
        avatarOptions.forEach(option => {
            this.eventManager.add(option, 'click', (e) => {
                this.selectDefaultAvatar(e.target.dataset.avatar);
            });
        });
    }

    /**
     * 폼 입력 이벤트를 바인딩합니다
     */
    bindFormEvents() {
        // 이름 입력
        const nameInput = document.getElementById('profile-name-input');
        if (nameInput) {
            this.eventManager.add(nameInput, 'input', () => {
                this.validateName();
                this.checkForChanges();
            });
        }
        
        // Bio 입력
        const bioInput = document.getElementById('profile-bio-input');
        if (bioInput) {
            this.eventManager.add(bioInput, 'input', () => {
                this.updateBioCharCount();
                this.checkForChanges();
            });
        }
        
        // 거주국 선택
        const countrySelect = document.getElementById('profile-country-input');
        if (countrySelect) {
            this.eventManager.add(countrySelect, 'change', () => {
                this.validateCountry();
                this.checkForChanges();
            });
        }
    }

    /**
     * 변경사항 확인 모달 이벤트를 바인딩합니다
     */
    bindModalEvents() {
        const modal = document.getElementById('unsaved-changes-modal');
        const cancelBtn = document.getElementById('modal-cancel');
        const discardBtn = document.getElementById('modal-discard');
        
        if (cancelBtn) {
            this.eventManager.add(cancelBtn, 'click', () => {
                this.hideUnsavedChangesModal();
            });
        }
        
        if (discardBtn) {
            this.eventManager.add(discardBtn, 'click', () => {
                this.discardChanges();
            });
        }
        
        if (modal) {
            this.eventManager.add(modal, 'click', (e) => {
                if (e.target === modal) {
                    this.hideUnsavedChangesModal();
                }
            });
        }
    }

    /**
     * 프로필 데이터를 로드합니다
     */
    loadProfileData() {
        try {
            // 현재 사용자 정보 로드
            this.loadUserProfileData();
            
            // 로컬 저장된 프로필 데이터 로드
            const savedData = localStorage.getItem('travelLog_profile');
            if (savedData) {
                const profileData = JSON.parse(savedData);
                this.originalData = { ...profileData };
                this.currentData = { ...profileData };
                this.populateForm(profileData);
            } else {
                // 기본값 설정
                this.originalData = {
                    name: '여행자',
                    bio: 'I am new to TravelLog.',
                    residenceCountry: '',
                    avatar: null
                };
                this.currentData = { ...this.originalData };
                this.populateForm(this.originalData);
            }
        } catch (error) {
            console.error('프로필 데이터 로드 실패:', error);
            this.dispatchEvent('showMessage', {
                type: 'error',
                message: '프로필 데이터를 불러오는데 실패했습니다.'
            });
        }
    }

    /**
     * 사용자 정보를 로드하고 폼에 채웁니다
     */
    async loadUserData() {
        try {
            // 현재 사용자 정보 로드
            const userData = await this.getCurrentUserData();
            
            // 로컬 저장된 프로필 데이터 로드
            const savedData = localStorage.getItem('travelLog_profile');
            let profileData = {};
            
            if (savedData) {
                profileData = JSON.parse(savedData);
            }
            
            // 사용자 정보와 로컬 데이터 병합 (사용자 정보 우선)
            const mergedData = {
                name: userData.name || profileData.name || '여행자',
                bio: profileData.bio || 'I am new to TravelLog.',
                residenceCountry: userData.residenceCountry || profileData.residenceCountry || '',
                avatar: profileData.avatar || null,
                defaultAvatar: profileData.defaultAvatar || '✈️'
            };
            
            // 원본 데이터와 현재 데이터 설정
            this.originalData = { ...mergedData };
            this.currentData = { ...mergedData };
            
            // 폼에 데이터 채우기
            this.populateForm(mergedData);
            
        } catch (error) {
            console.error('사용자 데이터 로드 실패:', error);
            this.dispatchEvent('showMessage', {
                type: 'error',
                message: '사용자 정보를 불러오는데 실패했습니다.'
            });
        }
    }

    /**
     * 현재 사용자 정보를 가져옵니다
     * @returns {Promise<Object>} 사용자 데이터
     */
    async getCurrentUserData() {
        try {
            let userData = {
                name: '여행자',
                residenceCountry: ''
            };
            
            // AuthController를 통한 사용자 정보 가져오기
            if (window.appManager && window.appManager.authManager && window.appManager.authManager.authController) {
                const currentUser = window.appManager.authManager.authController.getCurrentUser();
                if (currentUser) {
                    // 회원가입 시 입력한 이름 가져오기
                    if (currentUser.user_metadata && currentUser.user_metadata.full_name) {
                        userData.name = currentUser.user_metadata.full_name;
                    }
                    
                    // 회원가입 시 선택한 거주국 가져오기
                    if (currentUser.user_metadata && currentUser.user_metadata.residence_country) {
                        userData.residenceCountry = currentUser.user_metadata.residence_country;
                    }
                }
            }
            
            return userData;
            
        } catch (error) {
            console.error('현재 사용자 정보 가져오기 실패:', error);
            return {
                name: '여행자',
                residenceCountry: ''
            };
        }
    }

    /**
     * 실제 사용자 정보에서 프로필 데이터를 로드합니다 (기존 메서드 유지)
     */
    loadUserProfileData() {
        try {
            if (window.appManager && window.appManager.authManager && window.appManager.authManager.authController) {
                const currentUser = window.appManager.authManager.authController.getCurrentUser();
                if (currentUser && currentUser.user_metadata && currentUser.user_metadata.full_name) {
                    this.originalData.name = currentUser.user_metadata.full_name;
                    this.currentData.name = currentUser.user_metadata.full_name;
                }
            }
        } catch (error) {
            console.error('사용자 프로필 데이터 로드 실패:', error);
        }
    }

    /**
     * 폼에 데이터를 채웁니다
     * @param {Object} data - 프로필 데이터
     */
    populateForm(data) {
        const nameInput = document.getElementById('profile-name-input');
        const bioInput = document.getElementById('profile-bio-input');
        const countrySelect = document.getElementById('profile-country-input');
        
        if (nameInput) {
            nameInput.value = data.name || '';
        }
        
        if (bioInput) {
            bioInput.value = data.bio || '';
            this.updateBioCharCount();
        }
        
        if (countrySelect) {
            countrySelect.value = data.residenceCountry || '';
        }
        
        // 아바타 설정
        if (data.avatar) {
            this.updateProfileImage(data.avatar);
        } else if (data.defaultAvatar) {
            this.selectDefaultAvatar(data.defaultAvatar);
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
            this.currentData.avatar = e.target.result;
            this.currentData.defaultAvatar = null; // 커스텀 이미지 사용 시 기본 아바타 해제
            this.checkForChanges();
        };
        reader.readAsDataURL(file);
    }

    /**
     * 기본 아바타를 선택합니다
     * @param {string} avatar - 아바타 이모지
     */
    selectDefaultAvatar(avatar) {
        // 아바타 옵션 버튼들 업데이트
        const avatarOptions = document.querySelectorAll('.avatar-option');
        avatarOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.avatar === avatar) {
                option.classList.add('selected');
            }
        });
        
        // 프로필 아바타 업데이트
        const placeholder = document.querySelector('.profile-avatar-placeholder');
        const profileImage = document.querySelector('.profile-image');
        
        if (placeholder) {
            placeholder.textContent = avatar;
            placeholder.style.display = 'block';
        }
        
        if (profileImage) {
            profileImage.style.display = 'none';
        }
        
        this.currentData.defaultAvatar = avatar;
        this.currentData.avatar = null; // 기본 아바타 사용 시 커스텀 이미지 해제
        this.checkForChanges();
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
     * 이름 유효성을 검사합니다
     */
    validateName() {
        const nameInput = document.getElementById('profile-name-input');
        const errorElement = document.getElementById('name-error');
        
        if (!nameInput || !errorElement) return;
        
        const name = nameInput.value.trim();
        
        if (!name) {
            this.showFieldError('name-error', '이름을 입력해주세요.');
            return false;
        }
        
        if (name.length < 2) {
            this.showFieldError('name-error', '이름은 최소 2자 이상이어야 합니다.');
            return false;
        }
        
        this.clearFieldError('name-error');
        return true;
    }

    /**
     * 거주국 유효성을 검사합니다
     */
    validateCountry() {
        const countrySelect = document.getElementById('profile-country-input');
        const errorElement = document.getElementById('country-error');
        
        if (!countrySelect || !errorElement) return;
        
        const country = countrySelect.value;
        
        if (!country) {
            this.showFieldError('country-error', '거주국을 선택해주세요.');
            return false;
        }
        
        this.clearFieldError('country-error');
        return true;
    }

    /**
     * Bio 글자 수를 업데이트합니다
     */
    updateBioCharCount() {
        const bioInput = document.getElementById('profile-bio-input');
        const charCount = document.getElementById('bio-char-count');
        
        if (bioInput && charCount) {
            const count = bioInput.value.length;
            charCount.textContent = `${count}/100`;
            
            if (count > 100) {
                charCount.classList.add('over-limit');
            } else {
                charCount.classList.remove('over-limit');
            }
        }
    }

    /**
     * 필드 오류를 표시합니다
     * @param {string} errorId - 오류 요소 ID
     * @param {string} message - 오류 메시지
     */
    showFieldError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * 필드 오류를 제거합니다
     * @param {string} errorId - 오류 요소 ID
     */
    clearFieldError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    /**
     * 변경사항이 있는지 확인합니다
     */
    checkForChanges() {
        const nameInput = document.getElementById('profile-name-input');
        const bioInput = document.getElementById('profile-bio-input');
        const countrySelect = document.getElementById('profile-country-input');
        
        if (!nameInput || !bioInput || !countrySelect) return;
        
        const currentData = {
            name: nameInput.value.trim(),
            bio: bioInput.value.trim(),
            residenceCountry: countrySelect.value,
            avatar: this.currentData.avatar,
            defaultAvatar: this.currentData.defaultAvatar
        };
        
        this.hasUnsavedChanges = JSON.stringify(currentData) !== JSON.stringify(this.originalData);
        
        // 저장 버튼 활성화/비활성화
        const saveBtn = document.getElementById('save-profile-edit');
        if (saveBtn) {
            saveBtn.disabled = !this.hasUnsavedChanges;
        }
    }

    /**
     * 뒤로가기 버튼 클릭
     */
    onBackToProfile() {
        if (this.hasUnsavedChanges) {
            this.showUnsavedChangesModal();
        } else {
            this.navigateToProfile();
        }
    }

    /**
     * 취소 버튼 클릭
     */
    onCancelEdit() {
        if (this.hasUnsavedChanges) {
            this.showUnsavedChangesModal();
        } else {
            this.navigateToProfile();
        }
    }

    /**
     * 저장 버튼 클릭
     */
    onSaveProfile() {
        if (!this.validateForm()) {
            return;
        }
        
        this.saveProfileData();
    }

    /**
     * 폼 유효성을 검사합니다
     * @returns {boolean} 유효성 검사 결과
     */
    validateForm() {
        const isNameValid = this.validateName();
        const isCountryValid = this.validateCountry();
        
        return isNameValid && isCountryValid;
    }

    /**
     * 프로필 데이터를 저장합니다
     */
    saveProfileData() {
        const nameInput = document.getElementById('profile-name-input');
        const bioInput = document.getElementById('profile-bio-input');
        const countrySelect = document.getElementById('profile-country-input');
        
        if (!nameInput || !bioInput || !countrySelect) return;
        
        const profileData = {
            name: nameInput.value.trim(),
            bio: bioInput.value.trim(),
            residenceCountry: countrySelect.value,
            avatar: this.currentData.avatar,
            defaultAvatar: this.currentData.defaultAvatar
        };
        
        try {
            localStorage.setItem('travelLog_profile', JSON.stringify(profileData));
            
            // 원본 데이터 업데이트
            this.originalData = { ...profileData };
            this.hasUnsavedChanges = false;
            
            // 저장 버튼 비활성화
            const saveBtn = document.getElementById('save-profile-edit');
            if (saveBtn) {
                saveBtn.disabled = true;
            }
            
            this.dispatchEvent('showMessage', {
                type: 'success',
                message: '프로필이 저장되었습니다.'
            });
            
            // 프로필 뷰로 이동
            setTimeout(() => {
                this.navigateToProfile();
            }, 1000);
            
        } catch (error) {
            console.error('프로필 저장 실패:', error);
            this.dispatchEvent('showMessage', {
                type: 'error',
                message: '프로필 저장에 실패했습니다.'
            });
        }
    }

    /**
     * 변경사항 확인 모달을 표시합니다
     */
    showUnsavedChangesModal() {
        const modal = document.getElementById('unsaved-changes-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    /**
     * 변경사항 확인 모달을 숨깁니다
     */
    hideUnsavedChangesModal() {
        const modal = document.getElementById('unsaved-changes-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 변경사항을 버리고 프로필 뷰로 이동합니다
     */
    discardChanges() {
        this.hideUnsavedChangesModal();
        this.navigateToProfile();
    }

    /**
     * 프로필 뷰로 이동합니다
     * 상위 뷰인 ProfileView로 복귀
     */
    navigateToProfile() {
        this.dispatchEvent('navigate', { view: 'profile' });
    }

    /**
     * 커스텀 이벤트를 발생시킵니다
     * @param {string} eventName - 이벤트 이름
     * @param {Object} detail - 이벤트 상세 정보
     */
    dispatchEvent(eventName, detail) {
        if (this.container) {
            const event = new CustomEvent(`profileEditView:${eventName}`, { detail });
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
        this.isInitialized = false;
        this.hasUnsavedChanges = false;
        this.originalData = {};
        this.currentData = {};
    }
}

export { ProfileEditView };
