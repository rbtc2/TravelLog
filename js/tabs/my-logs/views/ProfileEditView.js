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
import { ProfileEditEventHandler } from './profile-edit/ProfileEditEventHandler.js';

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
        
        // 이벤트 처리 모듈
        this.eventHandler = new ProfileEditEventHandler();
        
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
        
        // HTML 렌더링 (항상 새로 렌더링)
        this.container.innerHTML = this.renderer.getProfileEditHTML();
        
        // 모듈 콜백 설정
        this.formManager.setCallbacks({
            onValidationChange: (fieldName, isValid, message) => {
                const errorId = this.formManager.fieldConfig[fieldName].errorElementId;
                if (isValid) {
                    this.renderer.clearFieldError(errorId);
                } else {
                    this.renderer.showFieldError(errorId, message);
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
                    this.renderer.updateProfileImage(value);
                } else if (type === 'default') {
                    this.renderer.selectDefaultAvatar(value);
                }
            }
        });
        
        this.dataManager.setCallbacks({
            onDataLoad: (profileData) => {
                this.formManager.populateForm(profileData);
            },
            onDataSave: (profileData) => {
                this.formManager.initializeFormData(profileData);
                if (this.container) {
                    const event = new CustomEvent(`profileEditView:showMessage`, { 
                        detail: { type: 'success', message: '프로필이 성공적으로 저장되었습니다!' }
                    });
                    this.container.dispatchEvent(event);
                }
            },
            onError: (message, error) => {
                if (this.container) {
                    const event = new CustomEvent(`profileEditView:showMessage`, { 
                        detail: { type: 'error', message: message }
                    });
                    this.container.dispatchEvent(event);
                }
            },
            onLoadingChange: (isLoading) => {
                const saveBtn = document.getElementById('save-profile-edit');
                if (saveBtn) {
                    saveBtn.disabled = isLoading;
                    saveBtn.textContent = isLoading ? '저장 중...' : '저장';
                }
            }
        });
        
        this.eventHandler.setCallbacks({
            onBackToProfile: () => {
                if (this.formManager.hasChanges()) {
                    this.renderer.showUnsavedChangesModal();
                } else {
                    if (this.container) {
                        const event = new CustomEvent(`profileEditView:navigate`, { detail: { view: 'profile' } });
                        this.container.dispatchEvent(event);
                    }
                }
            },
            onSaveProfile: async () => {
                if (!this.formManager.validateForm()) return;
                const profileData = this.formManager.getFormData();
                try {
                    await this.dataManager.saveProfileData(profileData);
                    setTimeout(() => {
                        if (this.container) {
                            const event1 = new CustomEvent(`profileEditView:refreshUserData`);
                            const event2 = new CustomEvent(`profileEditView:refreshHubProfile`);
                            this.container.dispatchEvent(event1);
                            this.container.dispatchEvent(event2);
                        }
                        if (this.container) {
                        const event = new CustomEvent(`profileEditView:navigate`, { detail: { view: 'profile' } });
                        this.container.dispatchEvent(event);
                    }
                    }, 1000);
                } catch (error) {
                    console.error('프로필 저장 실패:', error);
                    if (this.container) {
                        const event = new CustomEvent(`profileEditView:showMessage`, { 
                            detail: { type: 'error', message: '프로필 저장에 실패했습니다.' }
                        });
                        this.container.dispatchEvent(event);
                    }
                }
            },
            onImageUpload: (event) => {
                const file = event.target.files[0];
                if (!file || file.size > 5 * 1024 * 1024 || !file.type.startsWith('image/')) {
                    if (this.container) {
                        const event = new CustomEvent(`profileEditView:showMessage`, { 
                            detail: { type: 'error', message: '이미지 파일만 업로드할 수 있습니다. (5MB 이하)' }
                        });
                        this.container.dispatchEvent(event);
                    }
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.renderer.updateProfileImage(e.target.result);
                    this.formManager.updateFormData({
                        avatar: e.target.result,
                        defaultAvatar: null
                    });
                };
                reader.readAsDataURL(file);
            },
            onDefaultAvatarSelect: (avatar) => {
                this.renderer.selectDefaultAvatar(avatar);
                this.formManager.updateFormData({
                    defaultAvatar: avatar,
                    avatar: null
                });
            },
            onFormValidation: (fieldName, event) => {
                switch (fieldName) {
                    case 'name': this.formManager.validateName(); break;
                    case 'country': this.formManager.validateCountry(); break;
                    case 'bio': this.formManager.validateBio(); break;
                }
            },
            onFormChange: (event) => {
                this.formManager.checkForChanges();
            },
            onUnsavedChanges: (event) => {
                if (this.formManager.hasChanges()) {
                    this.renderer.updateSaveButtonState(true);
                }
            },
            onShowMessage: (data) => {
                if (this.container) {
                    const event = new CustomEvent(`profileEditView:showMessage`, { detail: data });
                    this.container.dispatchEvent(event);
                }
            }
        });
        
        // 이벤트 핸들러를 통해 모든 이벤트 바인딩
        this.eventHandler.bindAllEvents(this.container);
        
        // 추가 이벤트들
        const cancelBtn = document.getElementById('cancel-profile-edit');
        if (cancelBtn) {
            this.eventManager.add(cancelBtn, 'click', () => {
                if (this.formManager.hasChanges()) {
                    this.renderer.showUnsavedChangesModal();
                } else {
                    if (this.container) {
                        const event = new CustomEvent(`profileEditView:navigate`, { detail: { view: 'profile' } });
                        this.container.dispatchEvent(event);
                    }
                }
            });
        }
        
        // 변경사항 확인 모달 이벤트
        const modal = document.getElementById('unsaved-changes-modal');
        const modalCancelBtn = document.getElementById('modal-cancel');
        const modalDiscardBtn = document.getElementById('modal-discard');
        
        if (modalCancelBtn) {
            this.eventManager.add(modalCancelBtn, 'click', () => {
                this.renderer.hideUnsavedChangesModal();
            });
        }
        
        if (modalDiscardBtn) {
            this.eventManager.add(modalDiscardBtn, 'click', () => {
                this.renderer.hideUnsavedChangesModal();
                this.navigateToProfile();
            });
        }
        
        if (modal) {
            this.eventManager.add(modal, 'click', (e) => {
                if (e.target === modal) {
                    this.renderer.hideUnsavedChangesModal();
                }
            });
        }
        
        // 사용자 정보 로드 및 폼에 채우기
        try {
            await this.dataManager.loadUserProfileData();
        } catch (error) {
            console.error('사용자 데이터 로드 실패:', error);
            if (this.container) {
                const event = new CustomEvent(`profileEditView:showMessage`, { 
                    detail: { type: 'error', message: '사용자 정보를 불러오는데 실패했습니다.' }
                });
                this.container.dispatchEvent(event);
            }
        }
        
        this.isInitialized = true;
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
        if (this.eventHandler) {
            this.eventHandler.cleanup();
        }
        this.container = null;
        this.isInitialized = false;
    }
}

export { ProfileEditView };
