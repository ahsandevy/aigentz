import axios from 'axios';

// Use relative URL in development (via Vite proxy) or absolute URL in production
const API_BASE_URL = import.meta.env.PROD
    ? 'http://localhost:8000/api/analytics'
    : '/api/analytics';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const AGENT_BASE_URL = import.meta.env.PROD
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
    getHeaderMetrics: async (days) => {
        try {
            const response = await api.get('/header-metrics', { params: { days } });
            return response.data;
        } catch (error) {
            console.error('Error fetching header metrics:', error);
            throw error;
        }
    },

    // Summary
    getSummary: async (days) => {
        try {
            const response = await api.get('/summary', { params: { days } });
            return response.data;
        } catch (error) {
            console.error('Error fetching summary:', error);
            throw error;
        }
    },

    // Campaigns
    getCampaigns: async () => {
        try {
            const response = await api.get('/campaigns');
            return response.data;
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            throw error;
        }
    },

    // Refresh Data
    refreshData: async (days) => {
        try {
            const response = await api.post('/refresh', null, { params: { days } });
            return response.data;
        } catch (error) {
            console.error("Error refreshing data:", error);
            throw error;
        }
    },

    // Performance Explorer
    getPerformanceExplorer: async (days) => {
        try {
            const response = await api.get('/performance-explorer', { params: { days } });
            return response.data;
        } catch (error) {
            console.error('Error fetching performance explorer data:', error);
            throw error;
        }
    },

    getPerformanceAdSets: async (days) => {
        try {
            const response = await api.get('/performance-explorer/adsets', { params: { days } });
            return response.data;
        } catch (error) {
            console.error('Error fetching performance explorer adsets:', error);
            throw error;
        }
    },

    getPerformanceAds: async (days) => {
        try {
            const response = await api.get('/performance-explorer/ads', { params: { days } });
            return response.data;
        } catch (error) {
            console.error('Error fetching performance ads:', error);
            throw error;
        }
    },

    // AI Recommendation
    getAIRecommendation: async (campaignId, days) => {
        try {
            const response = await api.get(`/campaign/${campaignId}/ai-recommendation`, { params: { days } });
            return response.data;
        } catch (error) {
            console.error('Error fetching AI recommendation:', error);
            throw error;
        }
    },

    getPerformanceAudiences: async (days) => {
        try {
            const response = await api.get('/performance-explorer/audiences', { params: { days } });
            return response.data;
        } catch (error) {
            console.error('Error fetching performance audiences:', error);
            throw error;
        }
    },

    getAudienceAIRecommendation: async (audienceData) => {
        try {
            const response = await api.post('/audience/ai-recommendation', audienceData);
            return response.data;
        } catch (error) {
            console.error('Error fetching audience AI recommendation:', error);
            throw error;
        }
    },

    getEfficiencyDrivers: async (days) => {
        try {
            const response = await api.get('/efficiency-drivers', { params: { days } });
            return response.data;
        } catch (error) {
            console.error('Error fetching efficiency drivers:', error);
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

    chatWithAgent: async (query) => {
        try {
            const sessionId = getOrCreateSessionId();
            const response = await agentApi.post('/chat', {
                query,
                session_id: sessionId
            });
            return response.data;
        } catch (error) {
            console.error('Error chatting with agent:', error);
            throw error;
        }
    }
};

export default api;
