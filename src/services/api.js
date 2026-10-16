import axios from 'axios';
import { getOrCreateSessionId } from './session.js';

// ── Bearer token fallback for browsers that block third-party cookies ──
// Stored in sessionStorage so it survives page refresh but not tab close.
// AuthContext sets/clears this; axios interceptor reads it.
const TOKEN_KEY = 'access_token';

export function setAccessToken(token) {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
}

function _getAccessToken() {
    return sessionStorage.getItem(TOKEN_KEY);
}

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Shared config for all axios instances: send HttpOnly auth cookies
const axiosDefaults = {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
};

const API_BASE_URL = VITE_API_BASE_URL
    ? `${VITE_API_BASE_URL}/api/analytics`
    : import.meta.env.PROD
        ? 'http://localhost:8000/api/analytics'
        : '/api/analytics';

const api = axios.create({ baseURL: API_BASE_URL, ...axiosDefaults });

const AGENT_BASE_URL = VITE_API_BASE_URL
    ? `${VITE_API_BASE_URL}/api/agent`
    : import.meta.env.PROD
        ? 'http://localhost:8000/api/agent'
        : '/api/agent';

export const agentApi = axios.create({ baseURL: AGENT_BASE_URL, ...axiosDefaults });

// Request interceptor: attach Bearer token as cookie bypass fallback.
// Response interceptor: auto-refresh on 401, retry original request.
function setupAuthInterceptor(instance) {
    // ── Request: attach access token as Bearer header ──
    instance.interceptors.request.use(config => {
        const token = _getAccessToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // ── Response: 401 → refresh + retry ──
    instance.interceptors.response.use(
        response => response,
        async (error) => {
            if (error.response?.status === 401 && !error.config._retry) {
                error.config._retry = true;
                try {
                    const refreshUrl = VITE_API_BASE_URL
                        ? `${VITE_API_BASE_URL}/api/auth/refresh`
                        : '/api/auth/refresh';
                    const refreshRes = await axios.post(refreshUrl, {}, { withCredentials: true });
                    // Store the new access token from refresh response
                    if (refreshRes.data?.access_token) {
                        setAccessToken(refreshRes.data.access_token);
                    }
                    return instance(error.config);
                } catch (refreshError) {
                    setAccessToken(null);
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
}

setupAuthInterceptor(api);
setupAuthInterceptor(agentApi);

export const analyticsAPI = {
    // Header Metrics
    getHeaderMetrics: async (days, signal) => {
        try {
            const response = await api.get('/header-metrics', { params: { days }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching header metrics:', error);
            throw error;
        }
    },

    // Summary
    getSummary: async (days, signal) => {
        try {
            const response = await api.get('/summary', { params: { days }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching summary:', error);
            throw error;
        }
    },

    getDailyTrend: async (days, signal) => {
        const response = await api.get('/daily-trend', { params: { days }, signal });
        return response.data;
    },

    getPlatformBreakdown: async (days, signal) => {
        const response = await api.get('/platform', { params: { days }, signal });
        return response.data;
    },

    getAgeBreakdown: async (days, signal) => {
        const response = await api.get('/age', { params: { days }, signal });
        return response.data;
    },

    getTopAds: async (days, signal) => {
        const response = await api.get('/top-ads', { params: { days, limit: 8 }, signal });
        return response.data;
    },

    // Campaigns
    getCampaigns: async (signal) => {
        try {
            const response = await api.get('/campaigns', { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching campaigns:', error);
            throw error;
        }
    },

    // MCP dropdown data
    getMcpCampaigns: async (signal) => {
        try {
            const response = await api.get('/meta/campaigns', { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching MCP campaigns:', error);
            throw error;
        }
    },

    getMcpAccounts: async (signal) => {
        try {
            const response = await api.get('/meta/accounts', { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching MCP accounts:', error);
            throw error;
        }
    },

    // Header metrics filtered by selected dropdown values.
    // If campaign is selected, fetch campaign-level header metrics.
    // Account is currently reserved for future backend support.
    getHeaderMetricsBySelection: async (days, campaign = 'total', account = 'total', signal) => {
        try {
            let response;
            const params = account === 'total' ? { days } : { days };
            if (campaign && campaign !== 'total') {
                response = await api.get(`/campaign/${campaign}/header-metrics`, {
                    params,
                    signal
                });
            } else {
                response = await api.get('/header-metrics', {
                    params,
                    signal
                });
            }
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching filtered header metrics:', error);
            throw error;
        }
    },

    // Refresh Data (no days: backend uses "since last sync" or 90 days on first run)
    // force=true for full 90-day re-sync
    refreshData: async (force = false, signal) => {
        try {
            const params = force ? { force: true } : {};
            const response = await api.post('/refresh', null, { params, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error("Error refreshing data:", error);
            throw error;
        }
    },

    // Data status (last_synced_date, etc.) for "Last synced" UI
    getDataStatus: async (signal) => {
        try {
            const response = await api.get('/data-status', { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching data status:', error);
            throw error;
        }
    },

    // Performance Explorer
    getPerformanceExplorer: async (days, signal) => {
        try {
            const response = await api.get('/performance-explorer', { params: { days }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching performance explorer data:', error);
            throw error;
        }
    },

    getPerformanceAdSets: async (days, signal) => {
        try {
            const response = await api.get('/performance-explorer/adsets', { params: { days }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching performance explorer adsets:', error);
            throw error;
        }
    },

    getPerformanceAds: async (days, signal) => {
        try {
            const response = await api.get('/performance-explorer/ads', { params: { days }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching performance ads:', error);
            throw error;
        }
    },

    // AI Recommendation
    getAIRecommendation: async (campaignId, days, signal) => {
        try {
            const response = await api.get(`/campaign/${campaignId}/ai-recommendation`, { params: { days }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching AI recommendation:', error);
            throw error;
        }
    },


    getAdSetAIRecommendation: async (adsetId, days) => {
        try {
            const response = await api.get(`/adset/${adsetId}/ai-recommendation`, { params: { days } });
            return response.data;
        } catch (error) {
            console.error('Error fetching adset AI recommendation:', error);
            throw error;
        }
    },

    getAdAIAnalysis: async (adId, days) => {
        try {
            const response = await api.get(`/performance-explorer/ads/${adId}/ai-analysis`, { params: { days } });
            return response.data;
        } catch (error) {
            console.error('Error fetching ad AI analysis:', error);
            throw error;
        }
    },


    getPerformanceAudiences: async (days, refreshAudienceIds = null, signal) => {

        try {
            const params = { days };
            if (refreshAudienceIds && refreshAudienceIds.length > 0) {
                params.refresh_audience_ids = Array.isArray(refreshAudienceIds)
                    ? refreshAudienceIds.join(',')
                    : refreshAudienceIds;
            }
            const response = await api.get('/performance-explorer/audiences', { params, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching performance audiences:', error);
            throw error;
        }
    },

    refreshAudienceLLM: async (audienceId, days, signal) => {
        try {
            const response = await api.post(
                `/performance-explorer/audiences/${audienceId}/refresh-llm`,
                null,
                { params: { days }, signal }
            );
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error refreshing audience LLM:', error);
            throw error;
        }
    },

    getAudienceAIRecommendation: async (audienceData, signal) => {
        try {
            const response = await api.post('/audience/ai-recommendation', audienceData, { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching audience AI recommendation:', error);
            throw error;
        }
    },

    getEfficiencyDrivers: async (days, signal) => {
        try {
            const response = await api.get('/efficiency-drivers', { params: { days }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching efficiency drivers:', error);
            throw error;
        }
    },

    // Budget Reallocation Recommendation
    getBudgetReallocationRecommendation: async (signal) => {
        try {
            const response = await api.get('/budget-reallocation/recommendation', { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching budget reallocation recommendation:', error);
            throw error;
        }
    },

    // Creative Analysis Recommendation
    getCreativeAnalysisRecommendation: async (signal) => {
        try {
            const response = await api.get('/creative-analysis/recommendation', { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching creative analysis recommendation:', error);
            throw error;
        }
    },

    // Placement Optimization Recommendation
    getPlacementOptimizationRecommendation: async (signal) => {
        try {
            const response = await api.get('/placement-optimization/recommendation', { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching placement optimization recommendation:', error);
            throw error;
        }
    },

    // Audience Optimization Recommendation
    getAudienceOptimizationRecommendation: async (signal) => {
        try {
            const response = await api.get('/audience-optimization/recommendation', { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching audience optimization recommendation:', error);
            throw error;
        }
    },

    // Bidding Strategy Optimization Recommendation
    getBiddingStrategyOptimizationRecommendation: async (signal) => {
        try {
            const response = await api.get('/bidding-strategy-optimization/recommendation', { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching bidding strategy optimization recommendation:', error);
            throw error;
        }
    },

    // Dayparting Optimization Recommendation
    getDaypartingOptimizationRecommendation: async (signal) => {
        try {
            const response = await api.get('/dayparting/recommendation', { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching dayparting optimization recommendation:', error);
            throw error;
        }
    },

    // Get All Recommendations Priorities
    getAllRecommendationsPriorities: async (days = 7, signal) => {
        try {
            const response = await api.get('/ai-recommendations/all', { params: { days }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching all recommendations priorities:', error);
            throw error;
        }
    },

    // Executive Brief
    getExecutiveBrief: async (forceRefresh = false, signal) => {
        try {
            const params = {};
            if (forceRefresh) {
                params.force_refresh = true;
            }
            const response = await api.get('/executive-brief', { params, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching executive brief:', error);
            throw error;
        }
    },

    // Weekly Summary
    getWeeklySummary: async (days = 7, signal) => {
        try {
            const response = await api.get('/weekly-summary', { params: { days }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching weekly summary:', error);
            throw error;
        }
    },

    // Board Ready Summary
    getBoardReadySummary: async (days = 7, forceRefresh = false, signal) => {
        try {
            const params = { days };
            if (forceRefresh) {
                params.force_refresh = true;
            }
            const response = await api.get('/executive-brief/board-ready-summary', { params, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching board-ready summary:', error);
            throw error;
        }
    },

    // Recommendation Execution
    simulateRecommendation: async (recommendationId, tokenBearer = null, signal) => {
        try {
            const body = {};
            if (tokenBearer) {
                body.token_bearer = tokenBearer;
            }
            const response = await api.post(`/recommendations/${recommendationId}/simulate`, body, { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error simulating recommendation:', error);
            throw error;
        }
    },

    approveRecommendation: async (recommendationId, tokenBearer = null, signal) => {
        try {
            const body = {};
            if (tokenBearer) {
                body.token_bearer = tokenBearer;
            }
            const response = await api.post(`/recommendations/${recommendationId}/approve`, body, { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error approving recommendation:', error);
            throw error;
        }
    },

    revertExecution: async (executionId, tokenBearer = null, signal) => {
        try {
            const body = {};
            if (tokenBearer) {
                body.token_bearer = tokenBearer;
            }
            const response = await api.post(`/recommendations/executions/${executionId}/revert`, body, { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error reverting execution:', error);
            throw error;
        }
    },

    getRecommendationsHistory: async (status = null, days = 7, signal) => {
        try {
            const params = { days };
            if (status) {
                params.status = status;
            }
            const response = await api.get('/recommendations/history', { params, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching recommendations history:', error);
            throw error;
        }
    },

    // Get Applied Recommendations
    getAppliedRecommendations: async (limit = 50, signal) => {
        try {
            const response = await api.get('/recommendations/applied', { params: { limit }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching applied recommendations:', error);
            throw error;
        }
    }
};

// Session ID management for agent conversation isolation
// Now unified in services/session.js — kept for backward compatibility
const _getSessionId = () => getOrCreateSessionId();

export const agentAPI = {
    // Get current session ID (useful for debugging)
    getSessionId: () => _getSessionId(),

    // Clear session to start fresh conversation
    clearSession: () => {
        localStorage.removeItem('ascend_agent_session_id');
    },

    chatWithAgent: async (query, signal) => {
        try {
            const sessionId = _getSessionId();
            const response = await agentApi.post('/chat', {
                query,
                session_id: sessionId
            }, { signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error chatting with agent:', error);
            throw error;
        }
    }
};

// ============ Conversation API ============

const CONVERSATION_BASE_URL = VITE_API_BASE_URL
    ? `${VITE_API_BASE_URL}/api`
    : import.meta.env.PROD
        ? 'http://localhost:8000/api'
        : '/api';

export const conversationApi = axios.create({
    baseURL: CONVERSATION_BASE_URL,
    ...axiosDefaults,
});
setupAuthInterceptor(conversationApi);

export const conversationAPI = {
    /** List conversations for an ad account. */
    list: async (accountId, page = 1, pageSize = 20, search = '') => {
        const params = {
            account_id: accountId,
            page,
            page_size: pageSize,
        };
        if (search) params.search = search;
        const res = await conversationApi.get('/conversations', { params });
        return res.data;
    },

    /** Get a single conversation with its messages. */
    get: async (conversationId, accountId, signal) => {
        const res = await conversationApi.get(`/conversations/${conversationId}`, {
            params: { account_id: accountId },
            signal,
        });
        return res.data;
    },

    /** Create a new conversation for an ad account. */
    create: async (accountId, title = null, threadId = null, explanationStyle = undefined) => {
        const body = { account_id: accountId };
        if (explanationStyle !== undefined) body.explanation_style = explanationStyle;
        if (title) body.title = title;
        if (threadId) body.thread_id = threadId;
        const res = await conversationApi.post('/conversations', body);
        return res.data;
    },

    /** Rename a conversation. */
    rename: async (conversationId, accountId, title) => {
        const res = await conversationApi.patch(`/conversations/${conversationId}`, {
            account_id: accountId,
            title,
        });
        return res.data;
    },

    /** Soft-delete a conversation. */
    delete: async (conversationId, accountId) => {
        const res = await conversationApi.delete(`/conversations/${conversationId}`, {
            data: { account_id: accountId },
        });
        return res.data;
    },

    /** Get recommendations extracted from a conversation. */
    getRecommendations: async (conversationId, accountId, signal) => {
        const res = await conversationApi.get(
            `/conversations/${conversationId}/recommendations`,
            { params: { account_id: accountId }, signal }
        );
        return res.data;
    },
};

/** Message-level operations. */
export const messageAPI = {
    /** Delete a single message from a conversation. */
    delete: async (conversationId, messageId, accountId) => {
        const res = await conversationApi.delete(
            `/conversations/${conversationId}/messages/${messageId}`,
            { data: { account_id: accountId } }
        );
        return res.data;
    },
};

export default api;
