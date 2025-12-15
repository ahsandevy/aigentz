/**
 * API Service for communicating with FastAPI backend
 * All endpoints support optional days parameter for date range filtering
 */
import axios from 'axios';

const API_BASE = '/api/analytics';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Helper to add days param if provided
const withDays = (days) => days ? `?days=${days}` : '';
const andDays = (days) => days ? `&days=${days}` : '';

export const analyticsAPI = {
    // Data Status Check
    checkDataStatus: async (days = 5) => {
        const response = await api.get(`/data-status?days=${days}`);
        return response.data;
    },

    // Summary
    getSummary: async (days) => {
        const response = await api.get(`/summary${withDays(days)}`);
        return response.data;
    },

    // Campaigns
    getCampaigns: async () => {
        const response = await api.get('/campaigns');
        return response.data;
    },

    getCampaignStats: async (days) => {
        const response = await api.get(`/campaign-stats${withDays(days)}`);
        return response.data;
    },

    getCampaignStatusDistribution: async () => {
        const response = await api.get('/campaign-status-distribution');
        return response.data;
    },

    getCampaignObjectiveDistribution: async () => {
        const response = await api.get('/campaign-objective-distribution');
        return response.data;
    },

    getCampaignSpendPurchases: async (days) => {
        const response = await api.get(`/campaign-spend-purchases${withDays(days)}`);
        return response.data;
    },

    // Ads
    getAds: async () => {
        const response = await api.get('/ads');
        return response.data;
    },

    getAdStatusDistribution: async () => {
        const response = await api.get('/ad-status-distribution');
        return response.data;
    },

    getTopAds: async (limit = 50, days) => {
        const response = await api.get(`/top-ads?limit=${limit}${andDays(days)}`);
        return response.data;
    },

    getQualityRankingDistribution: async (days) => {
        const response = await api.get(`/quality-ranking-distribution${withDays(days)}`);
        return response.data;
    },

    // Breakdowns
    getAgeBreakdown: async (days) => {
        const response = await api.get(`/age${withDays(days)}`);
        return response.data;
    },

    getGenderBreakdown: async (days) => {
        const response = await api.get(`/gender${withDays(days)}`);
        return response.data;
    },

    getAgeGenderBreakdown: async (days) => {
        const response = await api.get(`/age-gender${withDays(days)}`);
        return response.data;
    },

    getPlatformBreakdown: async (days) => {
        const response = await api.get(`/platform${withDays(days)}`);
        return response.data;
    },

    getDeviceBreakdown: async (days) => {
        const response = await api.get(`/device${withDays(days)}`);
        return response.data;
    },

    getRegionBreakdown: async (days) => {
        const response = await api.get(`/region${withDays(days)}`);
        return response.data;
    },

    getDailyTrend: async (days) => {
        const response = await api.get(`/daily-trend${withDays(days)}`);
        return response.data;
    },

    getAudiences: async () => {
        const response = await api.get('/audiences');
        return response.data;
    },

    // Refresh - with smart caching
    refreshData: async (days = 5, force = false) => {
        const response = await api.post(`/refresh?days=${days}&force=${force}`);
        return response.data;
    },
};

export default analyticsAPI;
