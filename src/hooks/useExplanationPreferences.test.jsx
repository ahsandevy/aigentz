import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExplanationPreferences } from './useExplanationPreferences.js';
import { explanationPreferenceAPI } from '../services/explanationPreferences.js';

vi.mock('../services/explanationPreferences.js', () => ({
  DEFAULT_EXPLANATION_STYLE: 'technical',
  isExplanationStyle: (value) => ['simple', 'balanced', 'technical'].includes(value),
  explanationPreferenceAPI: { getDefault: vi.fn(), getConversation: vi.fn(), saveDefault: vi.fn(), saveConversation: vi.fn() },
}));
const props = { userId: 'user-1', conversationId: null, accountId: 'act_1' };
const deferred = () => { let resolve; const promise = new Promise((r) => { resolve = r; }); return { promise, resolve }; };
const ready = async (result) => waitFor(() => expect(result.current.loading).toBe(false));

beforeEach(() => {
  vi.resetAllMocks();
  explanationPreferenceAPI.getDefault.mockResolvedValue({ explanation_style: 'technical' });
  explanationPreferenceAPI.getConversation.mockResolvedValue({ explanation_style: null, effective_explanation_style: 'technical' });
});

describe('explanation preferences', () => {
  it('does not retry a style update for a deleted conversation', async () => {
    explanationPreferenceAPI.saveConversation.mockRejectedValue({ response: { status: 404 } });
    const { result } = renderHook(() => useExplanationPreferences({ ...props, conversationId: 'deleted' }));
    await ready(result);
    await act(() => result.current.changeStyle('simple'));
    expect(result.current.unavailable).toBe(true);
    expect(result.current.error).toContain('start a new chat');
    expect(result.current.getRequestFields()).toEqual({});
    await act(() => result.current.changeStyle('balanced'));
    expect(explanationPreferenceAPI.saveConversation).toHaveBeenCalledTimes(1);
  });

  it('reports an unavailable conversation and recovers after selecting a new chat', async () => {
    explanationPreferenceAPI.getConversation.mockRejectedValue({ response: { status: 404 } });
    const { result, rerender } = renderHook((p) => useExplanationPreferences(p), {
      initialProps: { ...props, conversationId: 'deleted' },
    });
    await ready(result);
    expect(result.current.unavailable).toBe(true);
    expect(result.current.error).toContain('no longer available');
    rerender(props);
    await ready(result);
    expect(result.current.unavailable).toBe(false);
    expect(result.current.error).toBe('');
    await act(() => result.current.changeStyle('simple'));
    expect(result.current.getRequestFields()).toEqual({ explanation_style: 'simple' });
  });

  it('inherits the user default without resending a style on every request', async () => {
    explanationPreferenceAPI.getDefault.mockResolvedValue({ explanation_style: 'balanced' });
    const { result } = renderHook(() => useExplanationPreferences(props));
    await ready(result);
    expect(result.current.style).toBe('balanced');
    expect(result.current.getRequestFields()).toEqual({});
  });

  it('keeps a new conversation selection pending for creation and first message', async () => {
    const { result, rerender } = renderHook((p) => useExplanationPreferences(p), { initialProps: props });
    await ready(result);
    await act(() => result.current.changeStyle('simple'));
    expect(result.current.getRequestFields()).toEqual({ explanation_style: 'simple' });
    act(() => result.current.adoptConversation({ id: 'new', explanation_style: 'simple', effective_explanation_style: 'simple' }));
    rerender({ ...props, conversationId: 'new' });
    await ready(result);
    expect(result.current.style).toBe('simple');
    expect(result.current.getRequestFields()).toEqual({ explanation_style: 'simple' });
    expect(explanationPreferenceAPI.getConversation).not.toHaveBeenCalled();
  });

  it('restores an explicit override and immediately saves an existing conversation selection', async () => {
    explanationPreferenceAPI.getConversation.mockResolvedValue({ explanation_style: 'simple', effective_explanation_style: 'simple' });
    explanationPreferenceAPI.saveConversation.mockResolvedValue({ explanation_style: 'balanced', effective_explanation_style: 'balanced' });
    const { result } = renderHook(() => useExplanationPreferences({ ...props, conversationId: 'c1' }));
    await ready(result);
    expect(result.current.style).toBe('simple');
    await act(() => result.current.changeStyle('balanced'));
    expect(explanationPreferenceAPI.saveConversation).toHaveBeenCalledWith('c1', 'balanced', expect.any(AbortSignal));
    expect(result.current.getRequestFields()).toEqual({});
  });

  it('retains failed saves in the next message and surfaces an error', async () => {
    explanationPreferenceAPI.saveConversation.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useExplanationPreferences({ ...props, conversationId: 'c1' }));
    await ready(result);
    await act(() => result.current.changeStyle('simple'));
    expect(result.current.style).toBe('simple');
    expect(result.current.error).toContain('Could not save');
    expect(result.current.getRequestFields()).toEqual({ explanation_style: 'simple' });
  });

  it('clears an override with null and sends reset only when that save fails', async () => {
    explanationPreferenceAPI.saveConversation.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useExplanationPreferences({ ...props, conversationId: 'c1' }));
    await ready(result);
    await act(() => result.current.useDefault());
    expect(explanationPreferenceAPI.saveConversation).toHaveBeenCalledWith('c1', null, expect.any(AbortSignal));
    expect(result.current.getRequestFields()).toEqual({ reset_explanation_style: true });
  });

  it('saves the future default without clearing an explicit conversation override', async () => {
    explanationPreferenceAPI.getConversation.mockResolvedValue({ explanation_style: 'simple', effective_explanation_style: 'simple' });
    explanationPreferenceAPI.saveDefault.mockResolvedValue({ explanation_style: 'simple' });
    const { result } = renderHook(() => useExplanationPreferences({ ...props, conversationId: 'c1' }));
    await ready(result);
    await act(() => result.current.saveDefault());
    expect(result.current.savedStyle).toBe('simple');
    expect(result.current.override).toBe('simple');
    expect(explanationPreferenceAPI.saveConversation).not.toHaveBeenCalled();
  });

  it('ignores fetch results from an old conversation', async () => {
    const old = deferred();
    explanationPreferenceAPI.getConversation.mockImplementation((id) => id === 'old' ? old.promise : Promise.resolve({ explanation_style: 'balanced', effective_explanation_style: 'balanced' }));
    const { result, rerender } = renderHook((p) => useExplanationPreferences(p), { initialProps: { ...props, conversationId: 'old' } });
    rerender({ ...props, conversationId: 'new' });
    await ready(result);
    await act(() => old.resolve({ explanation_style: 'simple', effective_explanation_style: 'simple' }));
    expect(result.current.style).toBe('balanced');
  });

  it('ignores saves after switching conversations or logging out', async () => {
    const old = deferred();
    explanationPreferenceAPI.saveConversation.mockReturnValue(old.promise);
    const { result, rerender } = renderHook((p) => useExplanationPreferences(p), { initialProps: { ...props, conversationId: 'old' } });
    await ready(result);
    let saving;
    act(() => { saving = result.current.changeStyle('simple'); });
    rerender({ ...props, userId: null, conversationId: null });
    await act(() => old.resolve({ explanation_style: 'simple', effective_explanation_style: 'simple' }));
    await saving;
    expect(result.current.style).toBe('technical');
    expect(result.current.getRequestFields()).toEqual({});
  });

  it('applies natural-language stream preferences without overriding the next message', async () => {
    const { result } = renderHook(() => useExplanationPreferences({ ...props, conversationId: 'c1' }));
    await ready(result);
    act(() => result.current.applyPresentationEvent({ type: 'presentation_preference', explanation_style: 'simple', conversation_explanation_style: 'simple', saved_explanation_style: 'technical', source: 'message', saved: true }, 'c1'));
    expect(result.current.style).toBe('simple');
    expect(result.current.savedStyle).toBe('technical');
    expect(result.current.getRequestFields()).toEqual({});
    act(() => result.current.applyPresentationEvent({ type: 'presentation_preference', explanation_style: 'balanced', saved: true }, 'other'));
    expect(result.current.style).toBe('simple');
  });

  it('keeps stream persistence failures pending and displays the warning', async () => {
    const { result } = renderHook(() => useExplanationPreferences({ ...props, conversationId: 'c1' }));
    await ready(result);
    act(() => result.current.applyPresentationEvent({ type: 'presentation_preference', explanation_style: 'simple', conversation_explanation_style: 'simple', source: 'message', saved: false, conversation_saved: false, warning: 'Save unavailable' }, 'c1'));
    expect(result.current.error).toBe('Save unavailable');
    expect(result.current.getRequestFields()).toEqual({ explanation_style: 'simple' });
  });

  it('does not treat an ordinary saved=false event as a persistence failure', async () => {
    const { result } = renderHook(() => useExplanationPreferences({ ...props, conversationId: 'c1' }));
    await ready(result);
    act(() => result.current.applyPresentationEvent({ type: 'presentation_preference', explanation_style: 'technical', conversation_explanation_style: null, saved_explanation_style: 'technical', source: 'default', saved: false, conversation_saved: true }, 'c1'));
    expect(result.current.error).toBe('');
    expect(result.current.getRequestFields()).toEqual({});
  });

  it('does not resend inherited defaults when no conversation is stored yet', async () => {
    const { result } = renderHook(() => useExplanationPreferences(props));
    await ready(result);
    act(() => result.current.applyPresentationEvent({ type: 'presentation_preference', explanation_style: 'technical', conversation_explanation_style: null, saved_explanation_style: 'technical', source: 'default', saved: false, conversation_saved: false }, null));
    expect(result.current.error).toBe('');
    expect(result.current.getRequestFields()).toEqual({});
  });

  it('does not let an initial fetch overwrite a newer stream preference', async () => {
    const loading = deferred();
    explanationPreferenceAPI.getConversation.mockReturnValue(loading.promise);
    const { result } = renderHook(() => useExplanationPreferences({ ...props, conversationId: 'c1' }));
    act(() => result.current.applyPresentationEvent({ type: 'presentation_preference', explanation_style: 'simple', conversation_explanation_style: 'simple', saved_explanation_style: 'technical', conversation_saved: true }, 'c1'));
    await act(() => loading.resolve({ explanation_style: null, effective_explanation_style: 'technical' }));
    expect(result.current.loading).toBe(false);
    expect(result.current.style).toBe('simple');
  });

  it('ignores an old user’s default save and stream after logout', async () => {
    const saving = deferred();
    explanationPreferenceAPI.saveDefault.mockReturnValue(saving.promise);
    const { result, rerender } = renderHook((p) => useExplanationPreferences(p), { initialProps: { ...props, conversationId: 'c1' } });
    await ready(result);
    const oldStream = result.current.applyPresentationEvent;
    let task;
    act(() => { task = result.current.saveDefault(); });
    rerender({ ...props, userId: null, conversationId: null });
    await act(() => saving.resolve({ explanation_style: 'simple' }));
    await task;
    act(() => oldStream({ type: 'presentation_preference', explanation_style: 'simple', conversation_saved: true }, 'c1'));
    expect(result.current.style).toBe('technical');
    expect(result.current.savedStyle).toBe('technical');
    expect(result.current.error).toBe('');
  });

  it('keeps an unsaved selection visible if saving the future default fails', async () => {
    explanationPreferenceAPI.saveDefault.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useExplanationPreferences(props));
    await ready(result);
    await act(() => result.current.changeStyle('simple'));
    await act(() => result.current.saveDefault());
    expect(result.current.style).toBe('simple');
    expect(result.current.savedStyle).toBe('technical');
    expect(result.current.error).toContain('Could not save your default');
    expect(result.current.getRequestFields()).toEqual({ explanation_style: 'simple' });
  });
});
