/**
 * 일정 수정 모듈
 * 기존 일정 데이터를 유지하면서 수정할 수 있는 기능을 제공합니다.
 */

import { createCountrySelector } from './ui-components/country-selector.js';

class LogEditModule {
    constructor() {
        this.currentLog = null;
        this.modal = null;
        this.countrySelector = null;
    }
    
    /**
     * 수정 모달을 표시합니다
     * @param {Object} log - 수정할 일정 데이터
     * @param {Function} onSave - 저장 완료 시 호출될 콜백 함수
     */
    showEditModal(log, onSave) {
        this.currentLog = log;
        
        // 기존 모달이 있으면 제거
        const existingModal = document.querySelector('.edit-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        this.modal = document.createElement('div');
        this.modal.className = 'edit-modal';
        this.modal.innerHTML = this.renderEditForm(log);
        
        // 모달을 body에 추가하고 스크롤을 맨 위로 이동
        document.body.appendChild(this.modal);
        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
        
        // 초기 날짜 제약 조건 설정
        this.setInitialDateConstraints();
        
        this.bindModalEvents(onSave);
    }
    
    /**
     * 초기 날짜 제약 조건을 설정합니다
     */
    setInitialDateConstraints() {
        const startDateInput = this.modal.querySelector('#edit-start-date');
        const endDateInput = this.modal.querySelector('#edit-end-date');
        
        if (startDateInput && endDateInput) {
            // 시작일의 최대값을 종료일로 설정
            startDateInput.max = endDateInput.value;
            // 종료일의 최소값을 시작일로 설정
            endDateInput.min = startDateInput.value;
        }
    }
    
    /**
     * 수정 폼을 렌더링합니다
     */
    renderEditForm(log) {
        const startDate = new Date(log.startDate);
        const endDate = new Date(log.endDate);
        
        return `
            <div class="modal-overlay"></div>
            <div class="modal-content edit-modal-content">
                <div class="modal-header">
                    <div class="modal-header-content">
                        <div>
                            <h3>일정 수정</h3>
                            <p class="modal-subtitle">${log.country} ${log.city} 여행 일정을 수정하세요</p>
                        </div>
                        <button class="modal-close-btn" id="close-edit-modal" title="닫기" aria-label="모달 닫기">✕</button>
                    </div>
                </div>
                <div class="modal-body">
                    <form id="edit-log-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-country">국가 *</label>
                                <div id="edit-country-selector-container" class="country-selector-wrapper"></div>
                                <input type="hidden" id="edit-country" name="country" value="${log.country}" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-city">도시 *</label>
                                <input type="text" id="edit-city" name="city" value="${log.city}" required ${!log.country ? 'disabled' : ''} placeholder="${!log.country ? '국가를 먼저 선택해주세요' : '도시를 입력하세요'}">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-start-date">시작일 *</label>
                                <input type="date" id="edit-start-date" name="startDate" value="${log.startDate}" max="${log.endDate}" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-end-date">종료일 *</label>
                                <input type="date" id="edit-end-date" name="endDate" value="${log.endDate}" min="${log.startDate}" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-purpose">목적 *</label>
                                <select id="edit-purpose" name="purpose" required>
                                    <option value="tourism" ${log.purpose === 'tourism' ? 'selected' : ''}>관광/여행</option>
                                    <option value="business" ${log.purpose === 'business' ? 'selected' : ''}>업무/출장</option>
                                    <option value="family" ${log.purpose === 'family' ? 'selected' : ''}>가족/지인 방문</option>
                                    <option value="study" ${log.purpose === 'study' ? 'selected' : ''}>학업</option>
                                    <option value="work" ${log.purpose === 'work' ? 'selected' : ''}>취업/근로</option>
                                    <option value="training" ${log.purpose === 'training' ? 'selected' : ''}>파견/연수</option>
                                    <option value="event" ${log.purpose === 'event' ? 'selected' : ''}>행사/컨퍼런스</option>
                                    <option value="volunteer" ${log.purpose === 'volunteer' ? 'selected' : ''}>봉사활동</option>
                                    <option value="medical" ${log.purpose === 'medical' ? 'selected' : ''}>의료</option>
                                    <option value="transit" ${log.purpose === 'transit' ? 'selected' : ''}>경유/환승</option>
                                    <option value="research" ${log.purpose === 'research' ? 'selected' : ''}>연구/학술</option>
                                    <option value="immigration" ${log.purpose === 'immigration' ? 'selected' : ''}>이주/정착</option>
                                    <option value="other" ${log.purpose === 'other' ? 'selected' : ''}>기타</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="edit-rating">평점 *</label>
                                <select id="edit-rating" name="rating" required>
                                    <option value="1" ${log.rating === '1' ? 'selected' : ''}>1점</option>
                                    <option value="2" ${log.rating === '2' ? 'selected' : ''}>2점</option>
                                    <option value="3" ${log.rating === '3' ? 'selected' : ''}>3점</option>
                                    <option value="4" ${log.rating === '4' ? 'selected' : ''}>4점</option>
                                    <option value="5" ${log.rating === '5' ? 'selected' : ''}>5점</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-travel-style">여행 스타일</label>
                                <select id="edit-travel-style" name="travelStyle">
                                    <option value="">선택 안함</option>
                                    <option value="solo" ${log.travelStyle === 'solo' ? 'selected' : ''}>솔로 여행</option>
                                    <option value="couple" ${log.travelStyle === 'couple' ? 'selected' : ''}>커플 여행</option>
                                    <option value="group" ${log.travelStyle === 'group' ? 'selected' : ''}>단체 여행</option>
                                    <option value="family" ${log.travelStyle === 'family' ? 'selected' : ''}>가족 여행</option>
                                    <option value="friends" ${log.travelStyle === 'friends' ? 'selected' : ''}>친구와 함께</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-memo">메모</label>
                            <textarea id="edit-memo" name="memo" rows="4" placeholder="여행에 대한 메모를 작성하세요..." maxlength="300">${log.memo || ''}</textarea>
                            <div class="memo-char-count">
                                <span id="memo-char-display">${(log.memo || '').length}</span>/300
                            </div>
                        </div>
                        
                        <div class="form-info">
                            <p>📝 작성일: ${new Date(log.createdAt).toLocaleDateString('ko-KR')}</p>
                            ${log.updatedAt ? `<p>✏️ 수정일: ${new Date(log.updatedAt).toLocaleDateString('ko-KR')}</p>` : ''}
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn cancel-btn" id="cancel-edit">취소</button>
                    <button class="modal-btn confirm-btn" id="confirm-edit">저장</button>
                </div>
            </div>
        `;
    }
    
    /**
     * 모달 이벤트를 바인딩합니다
     */
    bindModalEvents(onSave) {
        const cancelBtn = this.modal.querySelector('#cancel-edit');
        const confirmBtn = this.modal.querySelector('#confirm-edit');
        const closeBtn = this.modal.querySelector('#close-edit-modal');
        const overlay = this.modal.querySelector('.modal-overlay');
        const form = this.modal.querySelector('#edit-log-form');
        
        const closeModal = () => {
            if (this.modal) {
                this.modal.remove();
                this.modal = null;
            }
            this.currentLog = null;
            document.body.style.overflow = ''; // 배경 스크롤 복원
        };
        
        cancelBtn.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        confirmBtn.addEventListener('click', () => {
            if (this.validateForm(form)) {
                const updatedData = this.getFormData(form);
                console.log('LogEditModule: 편집 완료, 콜백 호출', {
                    logId: this.currentLog.id,
                    updatedData: updatedData
                });
                onSave(this.currentLog.id, updatedData);
                closeModal();
            }
        });
        overlay.addEventListener('click', closeModal);
        
        // ESC 키로 모달 닫기
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && this.modal) {
                closeModal();
                document.removeEventListener('keydown', handleEscKey);
            }
        };
        document.addEventListener('keydown', handleEscKey);
        
        // 날짜 유효성 검사
        const startDateInput = this.modal.querySelector('#edit-start-date');
        const endDateInput = this.modal.querySelector('#edit-end-date');
        
        // 시작일 변경 시 종료일의 최소값 설정
        startDateInput.addEventListener('change', () => {
            const startDate = startDateInput.value;
            endDateInput.min = startDate;
            
            // 현재 종료일이 시작일보다 이전이면 시작일로 설정
            if (endDateInput.value && endDateInput.value < startDate) {
                endDateInput.value = startDate;
            }
        });
        
        // 종료일 변경 시 시작일의 최대값 설정
        endDateInput.addEventListener('change', () => {
            const endDate = endDateInput.value;
            startDateInput.max = endDate;
            
            // 현재 시작일이 종료일보다 이후면 종료일로 설정
            if (startDateInput.value && startDateInput.value > endDate) {
                startDateInput.value = endDate;
            }
        });
        
        // 메모 글자 수 카운터
        const memoTextarea = this.modal.querySelector('#edit-memo');
        const memoCharDisplay = this.modal.querySelector('#memo-char-display');
        
        if (memoTextarea && memoCharDisplay) {
            const updateCharCount = () => {
                const currentLength = memoTextarea.value.length;
                memoCharDisplay.textContent = currentLength;
                
                // 글자 수에 따른 색상 변경
                if (currentLength >= 280) {
                    memoCharDisplay.style.color = '#e53e3e'; // 빨간색
                } else if (currentLength >= 250) {
                    memoCharDisplay.style.color = '#dd6b20'; // 주황색
                } else {
                    memoCharDisplay.style.color = 'var(--text-muted)'; // 기본색
                }
            };
            
            memoTextarea.addEventListener('input', updateCharCount);
            memoTextarea.addEventListener('keyup', updateCharCount);
        }
        
        // CountrySelector 초기화 및 이벤트 바인딩
        this.initializeCountrySelector(this.currentLog.country);
    }
    
    /**
     * 폼 유효성을 검사합니다
     */
    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        // 국가 선택 확인 (CountrySelector 사용)
        const countryInput = form.querySelector('#edit-country');
        if (countryInput && !countryInput.value.trim()) {
            countryInput.classList.add('error');
            isValid = false;
        } else if (countryInput) {
            countryInput.classList.remove('error');
        }
        
        // 날짜 유효성 검사
        const startDate = new Date(form.startDate.value);
        const endDate = new Date(form.endDate.value);
        
        if (startDate > endDate) {
            alert('종료일은 시작일과 같거나 이후의 날짜여야 합니다.');
            isValid = false;
            // 에러가 있는 필드에 시각적 표시
            form.startDate.classList.add('error');
            form.endDate.classList.add('error');
        } else {
            // 에러가 없으면 에러 표시 제거
            form.startDate.classList.remove('error');
            form.endDate.classList.remove('error');
        }
        
        return isValid;
    }
    
    /**
     * 폼 데이터를 가져옵니다
     */
    getFormData(form) {
        const formData = new FormData(form);
        return {
            country: formData.get('country'),
            city: formData.get('city'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            purpose: formData.get('purpose'),
            rating: formData.get('rating'),
            travelStyle: formData.get('travelStyle') || null,
            memo: formData.get('memo') || null,
            updatedAt: new Date().toISOString()
        };
    }
    
    /**
     * 모달을 닫습니다
     */
    closeModal() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
        this.currentLog = null;
        document.body.style.overflow = ''; // 배경 스크롤 복원
    }
    
    /**
     * CountrySelector를 초기화합니다
     * @param {string} currentCountry - 현재 선택된 국가명
     */
    async initializeCountrySelector(currentCountry) {
        try {
            const container = this.modal.querySelector('#edit-country-selector-container');
            if (!container) {
                console.error('LogEditModule: 국가 선택기 컨테이너를 찾을 수 없습니다.');
                return;
            }
            
            // CountrySelector 생성
            this.countrySelector = await createCountrySelector(container, {
                placeholder: '국가를 검색하세요',
                selectedCountry: currentCountry ? { nameKo: currentCountry } : null,
                showFlags: true,
                showEnglishNames: true
            });
            
            // 국가 선택 이벤트 리스너
            container.addEventListener('country-selected', (event) => {
                const selectedCountry = event.detail;
                console.log('LogEditModule: 국가 선택됨', selectedCountry);
                
                // 숨겨진 입력 필드에 국가명 업데이트
                const hiddenInput = this.modal.querySelector('#edit-country');
                if (hiddenInput) {
                    hiddenInput.value = selectedCountry.nameKo;
                }
                
                // 도시 입력 필드 활성화
                const cityInput = this.modal.querySelector('#edit-city');
                if (cityInput) {
                    cityInput.disabled = false;
                    cityInput.placeholder = '도시를 입력하세요';
                }
                
                // 에러 상태 제거
                this.clearFieldError('country');
            });
            
            // 현재 국가가 있으면 CountrySelector에 설정
            if (currentCountry && this.countrySelector) {
                // CountriesManager에서 국가 정보 조회
                const { countriesManager } = await import('../data/countries-manager.js');
                const country = countriesManager.getCountryByName(currentCountry);
                if (country) {
                    this.countrySelector.selectCountry(country);
                }
            }
            
        } catch (error) {
            console.error('LogEditModule: CountrySelector 초기화 실패:', error);
        }
    }
    
    /**
     * 필드 에러를 제거합니다
     * @param {string} fieldName - 에러를 제거할 필드명
     */
    clearFieldError(fieldName) {
        const field = this.modal.querySelector(`#edit-${fieldName}`);
        if (field) {
            field.classList.remove('error');
        }
    }
    
    /**
     * 모듈을 정리합니다
     */
    cleanup() {
        // CountrySelector 정리
        if (this.countrySelector) {
            this.countrySelector.destroy();
            this.countrySelector = null;
        }
        
        this.closeModal();
        this.currentLog = null;
        // 배경 스크롤 복원
        document.body.style.overflow = '';
    }
}

export default LogEditModule;
