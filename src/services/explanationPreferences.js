import { agentApi, conversationApi } from './api.js';

export const EXPLANATION_STYLES = ['simple', 'balanced', 'technical'];
export const DEFAULT_EXPLANATION_STYLE = 'technical';
export const isExplanationStyle = (value) => EXPLANATION_STYLES.includes(value);

export const explanationPreferenceAPI = {
  async getConversation(conversationId, signal) {
    const { data } = await conversationApi.get(
      `/conversations/${encodeURIComponent(conversationId)}/preferences`, { signal },
    );
    return data;
  },
  async getDefault(signal) {
    const { data } = await agentApi.get('/preferences', { signal });
    return data;
  },
  async saveDefault(style, signal) {
    const { data } = await agentApi.patch('/preferences', { explanation_style: style }, { signal });
    return data;
  },
  async saveConversation(conversationId, style, signal) {
    const { data } = await conversationApi.patch(
      `/conversations/${encodeURIComponent(conversationId)}/preferences`,
      { explanation_style: style }, { signal },
    );
    return data;
  },
};
