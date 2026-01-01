import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/analytics';

const api = axios.create({
    baseURL: API_BASE_URL,
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
    }
};

export default api;
