/**
 * ProfileEditRenderer - 프로필 편집 UI 렌더링 전용 클래스
 * 
 * 🎯 책임:
 * - 프로필 편집 화면 HTML 생성
 * - 프로필 이미지 UI 업데이트
 * - 기본 아바타 선택 UI 업데이트
 * - 필드 오류 표시/제거
 * 
 * 🔗 관계:
 * - ProfileEditView에서 사용되는 UI 렌더링 전용 모듈
 * - 순수 UI 로직만 담당, 비즈니스 로직은 포함하지 않음
 * 
 * @class ProfileEditRenderer
 * @version 1.0.0
 * @since 2025-09-30
 */

class ProfileEditRenderer {
    constructor() {
        // 기본 아바타 옵션들 (성능을 위해 상수로 정의)
        this.avatarOptions = ['✈️', '🌍', '🎒', '📷', '🗺️', '🏖️', '🏔️', '🌆'];
        
        // DOM 요소 캐시 (성능 최적화)
        this.cachedElements = new Map();
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
                                ${this.generateAvatarOptionsHTML()}
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
     * 기본 아바타 옵션들의 HTML을 생성합니다
     * @returns {string} 아바타 옵션 HTML
     */
    generateAvatarOptionsHTML() {
        return this.avatarOptions.map(avatar => 
            `<button class="avatar-option" data-avatar="${avatar}" title="${this.getAvatarTitle(avatar)}">${avatar}</button>`
        ).join('');
    }

    /**
     * 아바타 이모지에 대한 제목을 반환합니다
     * @param {string} avatar - 아바타 이모지
     * @returns {string} 아바타 제목
     */
    getAvatarTitle(avatar) {
        const titles = {
            '✈️': '비행기',
            '🌍': '지구본',
            '🎒': '여행가방',
            '📷': '카메라',
            '🗺️': '지도',
            '🏖️': '해변',
            '🏔️': '산',
            '🌆': '도시'
        };
        return titles[avatar] || avatar;
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
     * 기본 아바타를 선택합니다
     * @param {string} avatar - 아바타 이모지
     */
    selectDefaultAvatar(avatar) {
        console.log('ProfileEditRenderer.selectDefaultAvatar called with:', avatar);
        
        // 아바타 옵션 버튼들 업데이트 (캐시 사용하지 않고 직접 쿼리)
        const avatarOptions = document.querySelectorAll('.avatar-option');
        console.log('Found avatar options:', avatarOptions.length);
        avatarOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.avatar === avatar) {
                option.classList.add('selected');
                console.log('Selected avatar option:', option.dataset.avatar);
            }
        });
        
        // 프로필 아바타 업데이트 (캐시 사용하지 않고 직접 쿼리)
        const placeholder = document.querySelector('.profile-avatar-placeholder');
        const profileImage = document.querySelector('.profile-image');
        
        console.log('Placeholder element:', placeholder);
        console.log('Profile image element:', profileImage);
        
        if (placeholder) {
            placeholder.textContent = avatar;
            placeholder.style.display = 'block';
            console.log('Updated placeholder with:', avatar);
        }
        
        if (profileImage) {
            profileImage.style.display = 'none';
            console.log('Hidden profile image');
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
     * Bio 글자 수를 업데이트합니다
     * @param {number} count - 현재 글자 수
     */
    updateBioCharCount(count) {
        const charCount = document.getElementById('bio-char-count');
        if (charCount) {
            charCount.textContent = `${count}/100`;
            
            if (count > 100) {
                charCount.classList.add('over-limit');
            } else {
                charCount.classList.remove('over-limit');
            }
        }
    }

    /**
     * 저장 버튼의 활성화 상태를 업데이트합니다
     * @param {boolean} enabled - 활성화 여부
     */
    updateSaveButtonState(enabled) {
        const saveBtn = document.getElementById('save-profile-edit');
        if (saveBtn) {
            saveBtn.disabled = !enabled;
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
     * 캐시된 DOM 요소를 가져옵니다 (성능 최적화)
     * @param {string} selector - CSS 선택자
     * @returns {HTMLElement|null} DOM 요소
     */
    getCachedElement(selector) {
        // 캐시를 사용하지 않고 항상 최신 DOM을 쿼리
        return document.querySelector(selector);
    }

    /**
     * DOM 요소 캐시를 초기화합니다
     */
    clearCache() {
        this.cachedElements.clear();
    }

    /**
     * Renderer 정리
     */
    cleanup() {
        this.clearCache();
    }
}

export { ProfileEditRenderer };
