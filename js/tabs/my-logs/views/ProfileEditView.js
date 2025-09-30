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
import { ProfileEditRenderer } from './profile-edit/ProfileEditRenderer.js';
import { ProfileEditFormManager } from './profile-edit/ProfileEditFormManager.js';
import { ProfileEditDataManager } from './profile-edit/ProfileEditDataManager.js';

class ProfileEditView {
    constructor(controller) {
        this.controller = controller;
        this.eventManager = new EventManager();
        this.container = null;
        this.isInitialized = false;
        
        // UI 렌더링 모듈
        this.renderer = new ProfileEditRenderer();
        
        // 폼 관리 모듈
        this.formManager = new ProfileEditFormManager();
        
        // 데이터 관리 모듈
        this.dataManager = new ProfileEditDataManager();
        
        // 편집 상태 관리
        this.isEditing = false;
    }

    /**
     * 프로필 편집 화면을 렌더링합니다
     * @param {HTMLElement} container - 렌더링할 컨테이너
     */
    async render(container) {
        this.container = container;
        // 프로필 편집 뷰 CSS 네임스페이스 클래스 추가
        this.container.classList.add('profile-edit-view');
        this.container.innerHTML = this.renderer.getProfileEditHTML();
        
        // 모듈 콜백 설정
        this.setupFormManagerCallbacks();
        this.setupDataManagerCallbacks();
        
        this.bindEvents();
        
        // 사용자 정보 로드 및 폼에 채우기
        await this.loadUserData();
        
        this.isInitialized = true;
    }

    /**
     * 폼 매니저 콜백을 설정합니다
     */
    setupFormManagerCallbacks() {
        this.formManager.setCallbacks({
            onValidationChange: (fieldName, isValid, message) => {
                if (isValid) {
                    this.renderer.clearFieldError(this.formManager.fieldConfig[fieldName].errorElementId);
                } else {
                    this.renderer.showFieldError(this.formManager.fieldConfig[fieldName].errorElementId, message);
                }
            },
            onDataChange: (hasChanges, formData) => {
                this.renderer.updateSaveButtonState(hasChanges);
            },
            onErrorChange: (elementId, content, isOverLimit) => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.textContent = content;
                    if (isOverLimit) {
                        element.classList.add('over-limit');
                    } else {
                        element.classList.remove('over-limit');
                    }
                }
            },
            onAvatarChange: (type, value) => {
                if (type === 'image') {
                    this.updateProfileImage(value);
                } else if (type === 'default') {
                    this.renderer.selectDefaultAvatar(value);
                }
            }
        });
    }

    /**
     * 데이터 매니저 콜백을 설정합니다
     */
    setupDataManagerCallbacks() {
        this.dataManager.setCallbacks({
            onDataLoad: (profileData) => {
                // 폼 매니저에 데이터 설정
                this.formManager.populateForm(profileData);
            },
            onDataSave: (profileData) => {
                // 저장 완료 후 폼 매니저에 알림
                this.formManager.initializeFormData(profileData);
                
                // 성공 메시지 표시
                this.dispatchEvent('showMessage', {
                    type: 'success',
                    message: '프로필이 성공적으로 저장되었습니다!'
                });
            },
            onError: (message, error) => {
                // 오류 메시지 표시
                this.dispatchEvent('showMessage', {
                    type: 'error',
                    message: message
                });
            },
            onLoadingChange: (isLoading) => {
                // 로딩 상태에 따른 UI 업데이트
                const saveBtn = document.getElementById('save-profile-edit');
                if (saveBtn) {
                    saveBtn.disabled = isLoading;
                    saveBtn.textContent = isLoading ? '저장 중...' : '저장';
                }
            }
        });
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
                this.formManager.validateName();
                this.formManager.checkForChanges();
            });
        }
        
        // Bio 입력
        const bioInput = document.getElementById('profile-bio-input');
        if (bioInput) {
            this.eventManager.add(bioInput, 'input', () => {
                this.formManager.updateBioCharCount();
                this.formManager.checkForChanges();
            });
        }
        
        // 거주국 선택
        const countrySelect = document.getElementById('profile-country-input');
        if (countrySelect) {
            this.eventManager.add(countrySelect, 'change', () => {
                this.formManager.validateCountry();
                this.formManager.checkForChanges();
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
            // 데이터 매니저를 통해 프로필 데이터 로드
            await this.dataManager.loadUserProfileData();
        } catch (error) {
            console.error('사용자 데이터 로드 실패:', error);
            this.dispatchEvent('showMessage', {
                type: 'error',
                message: '사용자 정보를 불러오는데 실패했습니다.'
            });
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
            // 폼 매니저를 통해 데이터 업데이트
            this.formManager.updateFormData({
                avatar: e.target.result,
                defaultAvatar: null // 커스텀 이미지 사용 시 기본 아바타 해제
            });
        };
        reader.readAsDataURL(file);
    }

    /**
     * 기본 아바타를 선택합니다
     * @param {string} avatar - 아바타 이모지
     */
    selectDefaultAvatar(avatar) {
        this.renderer.selectDefaultAvatar(avatar);
        
        // 폼 매니저를 통해 데이터 업데이트
        this.formManager.updateFormData({
            defaultAvatar: avatar,
            avatar: null // 기본 아바타 사용 시 커스텀 이미지 해제
        });
    }

    /**
     * 프로필 이미지를 업데이트합니다
     * @param {string} imageData - 이미지 데이터 URL
     */
    updateProfileImage(imageData) {
        this.renderer.updateProfileImage(imageData);
    }


    /**
     * 필드 오류를 표시합니다
     * @param {string} errorId - 오류 요소 ID
     * @param {string} message - 오류 메시지
     */
    showFieldError(errorId, message) {
        this.renderer.showFieldError(errorId, message);
    }

    /**
     * 필드 오류를 제거합니다
     * @param {string} errorId - 오류 요소 ID
     */
    clearFieldError(errorId) {
        this.renderer.clearFieldError(errorId);
    }


    /**
     * 뒤로가기 버튼 클릭
     */
    onBackToProfile() {
        if (this.formManager.hasChanges()) {
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
    async onSaveProfile() {
        if (!this.validateForm()) {
            return;
        }
        
        await this.saveProfileData();
    }

    /**
     * 폼 유효성을 검사합니다
     * @returns {boolean} 유효성 검사 결과
     */
    validateForm() {
        return this.formManager.validateForm();
    }

    /**
     * 프로필 데이터를 저장합니다
     */
    async saveProfileData() {
        const profileData = this.formManager.getFormData();
        
        try {
            // 데이터 매니저를 통해 프로필 데이터 저장
            await this.dataManager.saveProfileData(profileData);
            
            // 프로필 뷰로 이동 (사용자 정보 새로고침 포함)
            setTimeout(() => {
                this.navigateToProfileWithRefresh();
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
        this.renderer.showUnsavedChangesModal();
    }

    /**
     * 변경사항 확인 모달을 숨깁니다
     */
    hideUnsavedChangesModal() {
        this.renderer.hideUnsavedChangesModal();
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
     * 프로필 뷰로 이동하면서 사용자 정보를 새로고침합니다
     * 프로필 편집 완료 후 업데이트된 정보가 반영되도록 함
     */
    navigateToProfileWithRefresh() {
        // 사용자 정보 새로고침 이벤트 발생 (ProfileView용)
        this.dispatchEvent('refreshUserData');
        
        // HubView에서도 프로필 데이터 새로고침하도록 이벤트 발생
        this.dispatchEvent('refreshHubProfile');
        
        // 프로필 뷰로 이동
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
        if (this.renderer) {
            this.renderer.cleanup();
        }
        if (this.formManager) {
            this.formManager.cleanup();
        }
        if (this.dataManager) {
            this.dataManager.cleanup();
        }
        this.container = null;
        this.isInitialized = false;
    }
}

export { ProfileEditView };
