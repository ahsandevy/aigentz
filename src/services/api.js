import axios from 'axios';

// Get backend API base URL from environment variable
// VITE_API_BASE_URL should be set in .env file (e.g., http://localhost:8000)
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Use VITE_API_BASE_URL if set, otherwise use relative URL in dev (via proxy) or default in production
const API_BASE_URL = VITE_API_BASE_URL
    ? `${VITE_API_BASE_URL}/api/analytics`
    : import.meta.env.PROD
        ? 'http://localhost:8000/api/analytics'
        : '/api/analytics';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const AGENT_BASE_URL = VITE_API_BASE_URL
    ? `${VITE_API_BASE_URL}/api/agent`
    : import.meta.env.PROD
        ? 'http://localhost:8000/api/agent'
        : '/api/agent';

const agentApi = axios.create({
    baseURL: AGENT_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
    getBudgetReallocationRecommendation: async (days = 7, signal) => {
        try {
            const response = await api.get('/budget-reallocation/recommendation', { params: { days }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching budget reallocation recommendation:', error);
            throw error;
        }
    },

    // Creative Analysis Recommendation
    getCreativeAnalysisRecommendation: async (days = 7, signal) => {
        try {
            const response = await api.get('/creative-analysis/recommendation', { params: { days }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching creative analysis recommendation:', error);
            throw error;
        }
    },

    // Placement Optimization Recommendation
    getPlacementOptimizationRecommendation: async (days = 7, signal) => {
        try {
            const response = await api.get('/placement-optimization/recommendation', { params: { days }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching placement optimization recommendation:', error);
            throw error;
        }
    },

    // Audience Optimization Recommendation
    getAudienceOptimizationRecommendation: async (days = 7, signal) => {
        try {
            const response = await api.get('/audience-optimization/recommendation', { params: { days }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching audience optimization recommendation:', error);
            throw error;
        }
    },

    // Bidding Strategy Optimization Recommendation
    getBiddingStrategyOptimizationRecommendation: async (days = 7, signal) => {
        try {
            const response = await api.get('/bidding-strategy-optimization/recommendation', { params: { days }, signal });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error('Error fetching bidding strategy optimization recommendation:', error);
            throw error;
        }
    },

    // Dayparting Optimization Recommendation
    getDaypartingOptimizationRecommendation: async (days = 7, signal) => {
        try {
            const response = await api.get('/dayparting/recommendation', { params: { days }, signal });
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
    getExecutiveBrief: async (days = 7, forceRefresh = false, signal) => {
        try {
            const params = { days };
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
const getOrCreateSessionId = () => {
    const STORAGE_KEY = 'agent_session_id';
    let sessionId = localStorage.getItem(STORAGE_KEY);

    if (!sessionId) {
        // Generate a UUID v4
        sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        localStorage.setItem(STORAGE_KEY, sessionId);
    }

    return sessionId;
};

export const agentAPI = {
    // Get current session ID (useful for debugging)
    getSessionId: () => getOrCreateSessionId(),

    // Clear session to start fresh conversation
    clearSession: () => {
        localStorage.removeItem('agent_session_id');
    },

    chatWithAgent: async (query, signal) => {
        try {
            const sessionId = getOrCreateSessionId();
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

export default api;