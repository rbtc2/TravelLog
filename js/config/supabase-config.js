/**
 * Supabase 설정 및 클라이언트 초기화
 * TravelLog 프로젝트용 Supabase 설정
 */

// Supabase 프로젝트 설정
export const SUPABASE_CONFIG = {
    url: 'https://mtnhipybjnlovlrsypjn.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bmhpcHliam5sb3ZscnN5cGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1OTc5NTgsImV4cCI6MjA3NDE3Mzk1OH0.Chx-r-6x5StcI6P-qrQ72XevFuJQAnBUqaA23gpL804',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bmhpcHliam5sb3ZscnN5cGpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTc3NDgwMCwiZXhwIjoyMDUxMzUwODAwfQ.placeholder' // 실제 service role key로 교체 필요
};

// Supabase 클라이언트 초기화
let supabaseClient = null;

/**
 * Supabase 클라이언트를 초기화하고 반환합니다
 * @returns {Object} Supabase 클라이언트 인스턴스
 */
export async function initializeSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }

    try {
        // 전역 Supabase 객체 사용
        if (typeof window !== 'undefined' && window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            });
        } else {
            // 동적 import로 폴백
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            });
        }

        console.log('Supabase 클라이언트가 초기화되었습니다.');
        return supabaseClient;
    } catch (error) {
        console.error('Supabase 클라이언트 초기화 실패:', error);
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
    }
}

/**
 * 현재 Supabase 클라이언트 인스턴스를 반환합니다
 * @returns {Object|null} Supabase 클라이언트 인스턴스 또는 null
 */
export function getSupabaseClient() {
    return supabaseClient;
}

/**
 * Supabase 연결 상태를 확인합니다
 * @returns {Promise<boolean>} 연결 상태
 */
export async function checkSupabaseConnection() {
    try {
        const client = await initializeSupabase();
        const { data, error } = await client.from('_supabase_migrations').select('*').limit(1);
        
        if (error) {
            console.warn('Supabase 연결 확인 중 오류:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Supabase 연결 확인 실패:', error);
        return false;
    }
}

/**
 * Supabase 설정 정보를 반환합니다
 * @returns {Object} 설정 정보
 */
export function getSupabaseConfig() {
    return {
        ...SUPABASE_CONFIG,
        isConfigured: !!SUPABASE_CONFIG.url && !!SUPABASE_CONFIG.anonKey
    };
}
