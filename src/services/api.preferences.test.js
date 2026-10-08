import { afterEach, describe, expect, it, vi } from 'vitest';
import { conversationAPI, conversationApi } from './api.js';

afterEach(() => vi.restoreAllMocks());

describe('conversation API presentation fields', () => {
  it('sends the selected style during creation', async () => {
    const post = vi.spyOn(conversationApi, 'post').mockResolvedValue({ data: { id: 'c1' } });
    await conversationAPI.create('act_1', 'Title', 'thread_1', 'simple');
    expect(post).toHaveBeenCalledWith('/conversations', { account_id: 'act_1', title: 'Title', thread_id: 'thread_1', explanation_style: 'simple' });
  });

  it('omits unselected styles and preserves explicit null', async () => {
    const post = vi.spyOn(conversationApi, 'post').mockResolvedValue({ data: {} });
    await conversationAPI.create('act_1');
    expect(post).toHaveBeenLastCalledWith('/conversations', { account_id: 'act_1' });
    await conversationAPI.create('act_1', null, null, null);
    expect(post).toHaveBeenLastCalledWith('/conversations', { account_id: 'act_1', explanation_style: null });
  });

  it('passes cancellation when loading preferences alongside history', async () => {
    const signal = new AbortController().signal;
    const get = vi.spyOn(conversationApi, 'get').mockResolvedValue({ data: { explanation_style: 'balanced' } });
    await conversationAPI.get('c1', 'act_1', signal);
    expect(get).toHaveBeenCalledWith('/conversations/c1', { params: { account_id: 'act_1' }, signal });
  });
});
