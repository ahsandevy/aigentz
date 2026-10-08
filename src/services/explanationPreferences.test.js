import { beforeEach, describe, expect, it, vi } from 'vitest';
import { agentApi, conversationApi } from './api.js';
import { explanationPreferenceAPI } from './explanationPreferences.js';

vi.mock('./api.js', () => ({
  agentApi: { get: vi.fn(), patch: vi.fn() },
  conversationApi: { get: vi.fn(), patch: vi.fn() },
}));

beforeEach(() => vi.resetAllMocks());

describe('preference API', () => {
  it('loads conversation metadata with cancellation instead of full history', async () => {
    const signal = new AbortController().signal;
    conversationApi.get.mockResolvedValue({ data: { explanation_style: 'simple', effective_explanation_style: 'simple' } });
    expect(await explanationPreferenceAPI.getConversation('conv/1', signal)).toEqual({ explanation_style: 'simple', effective_explanation_style: 'simple' });
    expect(conversationApi.get).toHaveBeenCalledWith('/conversations/conv%2F1/preferences', { signal });
  });
  it('uses authenticated agent transport for defaults with cancellation', async () => {
    const signal = new AbortController().signal;
    agentApi.get.mockResolvedValue({ data: { explanation_style: 'technical' } });
    agentApi.patch.mockResolvedValue({ data: { explanation_style: 'simple' } });
    expect(await explanationPreferenceAPI.getDefault(signal)).toEqual({ explanation_style: 'technical' });
    expect(agentApi.get).toHaveBeenCalledWith('/preferences', { signal });
    await explanationPreferenceAPI.saveDefault('simple', signal);
    expect(agentApi.patch).toHaveBeenCalledWith('/preferences', { explanation_style: 'simple' }, { signal });
  });

  it('encodes IDs and preserves null resets with the conversation transport', async () => {
    const signal = new AbortController().signal;
    conversationApi.patch.mockResolvedValue({ data: { explanation_style: null, effective_explanation_style: 'balanced' } });
    await explanationPreferenceAPI.saveConversation('conv/1', null, signal);
    expect(conversationApi.patch).toHaveBeenCalledWith('/conversations/conv%2F1/preferences', { explanation_style: null }, { signal });
  });
});
