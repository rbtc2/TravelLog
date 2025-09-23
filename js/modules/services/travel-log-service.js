/**
 * TravelLog 데이터 서비스
 * Supabase를 이용한 여행 로그 데이터 관리
 */

import { getSupabaseClient } from '../../config/supabase-config.js';
import { toastManager } from '../ui-components/toast-manager.js';

class TravelLogService {
    constructor() {
        this.client = null;
        this.isInitialized = false;
    }

    /**
     * 서비스를 초기화합니다
     */
    async initialize() {
        try {
            const { initializeSupabase } = await import('../../config/supabase-config.js');
            this.client = await initializeSupabase();
            this.isInitialized = true;
            console.log('TravelLog 서비스가 초기화되었습니다.');
        } catch (error) {
            console.error('TravelLog 서비스 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 모든 여행 로그를 가져옵니다
     * @param {Object} options - 옵션 (정렬, 필터링 등)
     * @returns {Promise<Array>} 여행 로그 목록
     */
    async getTravelLogs(options = {}) {
        if (!this.isInitialized) {
            throw new Error('서비스가 초기화되지 않았습니다.');
        }

        try {
            let query = this.client
                .from('travel_logs')
                .select('*')
                .order('created_at', { ascending: false });

            // 필터링 옵션 적용
            if (options.country) {
                query = query.eq('country', options.country);
            }

            if (options.year) {
                const startDate = `${options.year}-01-01`;
                const endDate = `${options.year}-12-31`;
                query = query.gte('start_date', startDate).lte('start_date', endDate);
            }

            if (options.purpose) {
                query = query.eq('purpose', options.purpose);
            }

            if (options.tags && options.tags.length > 0) {
                query = query.overlaps('tags', options.tags);
            }

            // 페이지네이션
            if (options.limit) {
                query = query.limit(options.limit);
            }

            if (options.offset) {
                query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(this.getErrorMessage(error));
            }

            return data || [];

        } catch (error) {
            console.error('여행 로그 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 특정 여행 로그를 가져옵니다
     * @param {string} id - 로그 ID
     * @returns {Promise<Object>} 여행 로그 정보
     */
    async getTravelLog(id) {
        if (!this.isInitialized) {
            throw new Error('서비스가 초기화되지 않았습니다.');
        }

        try {
            const { data, error } = await this.client
                .from('travel_logs')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                throw new Error(this.getErrorMessage(error));
            }

            return data;

        } catch (error) {
            console.error('여행 로그 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 새로운 여행 로그를 생성합니다
     * @param {Object} logData - 로그 데이터
     * @returns {Promise<Object>} 생성된 로그 정보
     */
    async createTravelLog(logData) {
        if (!this.isInitialized) {
            throw new Error('서비스가 초기화되지 않았습니다.');
        }

        try {
            const { data, error } = await this.client
                .from('travel_logs')
                .insert([logData])
                .select()
                .single();

            if (error) {
                throw new Error(this.getErrorMessage(error));
            }

            toastManager.show('여행 로그가 저장되었습니다.', 'success');
            return data;

        } catch (error) {
            console.error('여행 로그 생성 실패:', error);
            toastManager.show(error.message, 'error');
            throw error;
        }
    }

    /**
     * 여행 로그를 업데이트합니다
     * @param {string} id - 로그 ID
     * @param {Object} updates - 업데이트할 데이터
     * @returns {Promise<Object>} 업데이트된 로그 정보
     */
    async updateTravelLog(id, updates) {
        if (!this.isInitialized) {
            throw new Error('서비스가 초기화되지 않았습니다.');
        }

        try {
            const { data, error } = await this.client
                .from('travel_logs')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(this.getErrorMessage(error));
            }

            toastManager.show('여행 로그가 업데이트되었습니다.', 'success');
            return data;

        } catch (error) {
            console.error('여행 로그 업데이트 실패:', error);
            toastManager.show(error.message, 'error');
            throw error;
        }
    }

    /**
     * 여행 로그를 삭제합니다
     * @param {string} id - 로그 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteTravelLog(id) {
        if (!this.isInitialized) {
            throw new Error('서비스가 초기화되지 않았습니다.');
        }

        try {
            const { error } = await this.client
                .from('travel_logs')
                .delete()
                .eq('id', id);

            if (error) {
                throw new Error(this.getErrorMessage(error));
            }

            toastManager.show('여행 로그가 삭제되었습니다.', 'success');
            return true;

        } catch (error) {
            console.error('여행 로그 삭제 실패:', error);
            toastManager.show(error.message, 'error');
            throw error;
        }
    }

    /**
     * 여행 통계를 가져옵니다
     * @returns {Promise<Object>} 통계 정보
     */
    async getTravelStats() {
        if (!this.isInitialized) {
            throw new Error('서비스가 초기화되지 않았습니다.');
        }

        try {
            const { data, error } = await this.client
                .from('travel_logs')
                .select('country, start_date, end_date, rating, purpose');

            if (error) {
                throw new Error(this.getErrorMessage(error));
            }

            // 통계 계산
            const stats = {
                totalLogs: data.length,
                countries: [...new Set(data.map(log => log.country))].length,
                totalDays: data.reduce((sum, log) => {
                    if (log.start_date && log.end_date) {
                        const start = new Date(log.start_date);
                        const end = new Date(log.end_date);
                        const diffTime = Math.abs(end - start);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return sum + diffDays;
                    }
                    return sum;
                }, 0),
                averageRating: data.length > 0 
                    ? data.reduce((sum, log) => sum + (log.rating || 0), 0) / data.length 
                    : 0,
                purposes: data.reduce((acc, log) => {
                    if (log.purpose) {
                        acc[log.purpose] = (acc[log.purpose] || 0) + 1;
                    }
                    return acc;
                }, {}),
                countries: data.reduce((acc, log) => {
                    acc[log.country] = (acc[log.country] || 0) + 1;
                    return acc;
                }, {})
            };

            return stats;

        } catch (error) {
            console.error('여행 통계 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 국가별 여행 로그를 가져옵니다
     * @returns {Promise<Array>} 국가별 로그 목록
     */
    async getLogsByCountry() {
        if (!this.isInitialized) {
            throw new Error('서비스가 초기화되지 않았습니다.');
        }

        try {
            const { data, error } = await this.client
                .from('travel_logs')
                .select('country, id, title, start_date, end_date, rating')
                .order('country');

            if (error) {
                throw new Error(this.getErrorMessage(error));
            }

            // 국가별로 그룹화
            const groupedByCountry = data.reduce((acc, log) => {
                if (!acc[log.country]) {
                    acc[log.country] = [];
                }
                acc[log.country].push(log);
                return acc;
            }, {});

            return groupedByCountry;

        } catch (error) {
            console.error('국가별 로그 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 검색을 수행합니다
     * @param {string} query - 검색 쿼리
     * @param {Object} filters - 필터 옵션
     * @returns {Promise<Array>} 검색 결과
     */
    async searchLogs(query, filters = {}) {
        if (!this.isInitialized) {
            throw new Error('서비스가 초기화되지 않았습니다.');
        }

        try {
            let searchQuery = this.client
                .from('travel_logs')
                .select('*')
                .or(`title.ilike.%${query}%,content.ilike.%${query}%,country.ilike.%${query}%,city.ilike.%${query}%`)
                .order('created_at', { ascending: false });

            // 추가 필터 적용
            if (filters.country) {
                searchQuery = searchQuery.eq('country', filters.country);
            }

            if (filters.year) {
                const startDate = `${filters.year}-01-01`;
                const endDate = `${filters.year}-12-31`;
                searchQuery = searchQuery.gte('start_date', startDate).lte('start_date', endDate);
            }

            if (filters.tags && filters.tags.length > 0) {
                searchQuery = searchQuery.overlaps('tags', filters.tags);
            }

            const { data, error } = await searchQuery;

            if (error) {
                throw new Error(this.getErrorMessage(error));
            }

            return data || [];

        } catch (error) {
            console.error('검색 실패:', error);
            throw error;
        }
    }

    /**
     * Supabase 오류 메시지를 한국어로 변환합니다
     * @param {Object} error - Supabase 오류 객체
     * @returns {string} 한국어 오류 메시지
     */
    getErrorMessage(error) {
        const errorMessages = {
            'JWT expired': '세션이 만료되었습니다. 다시 로그인해주세요.',
            'Invalid JWT': '유효하지 않은 세션입니다. 다시 로그인해주세요.',
            'new row violates row-level security policy': '접근 권한이 없습니다.',
            'duplicate key value violates unique constraint': '이미 존재하는 데이터입니다.',
            'foreign key constraint fails': '관련된 데이터가 존재하지 않습니다.',
            'value too long for type': '입력한 값이 너무 깁니다.',
            'invalid input syntax': '입력 형식이 올바르지 않습니다.',
            'permission denied for table': '테이블 접근 권한이 없습니다.',
            'relation does not exist': '테이블이 존재하지 않습니다.',
            'column does not exist': '컬럼이 존재하지 않습니다.',
            'Network request failed': '네트워크 연결을 확인해주세요.',
            'Service unavailable': '서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'
        };

        return errorMessages[error.message] || error.message || '알 수 없는 오류가 발생했습니다.';
    }

    /**
     * 서비스를 정리합니다
     */
    cleanup() {
        this.client = null;
        this.isInitialized = false;
    }
}

// 싱글톤 인스턴스 생성
export const travelLogService = new TravelLogService();
