import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ChatInterface from './ChatInterface.jsx';
import { conversationAPI } from '../../services/api.js';
import { explanationPreferenceAPI } from '../../services/explanationPreferences.js';

vi.mock('../../context/AuthContext.jsx', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
vi.mock('./RecommendationPanel', () => ({ default: () => <aside>Recommendations retained</aside> }));
vi.mock('../../services/api.js', () => ({ conversationAPI: { get: vi.fn(), create: vi.fn() } }));
vi.mock('../../services/explanationPreferences.js', () => ({
  DEFAULT_EXPLANATION_STYLE: 'technical',
  isExplanationStyle: (value) => ['simple', 'balanced', 'technical'].includes(value),
  explanationPreferenceAPI: { getDefault: vi.fn(), getConversation: vi.fn(), saveDefault: vi.fn(), saveConversation: vi.fn() },
}));

function streamResponse(events) {
  let delivered = false;
  return { ok: true, body: { getReader: () => ({
    async read() {
      if (delivered) return { done: true };
      delivered = true;
      return { done: false, value: new TextEncoder().encode(events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join('')) };
    },
    cancel: vi.fn(),
  }) } };
}

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  explanationPreferenceAPI.getDefault.mockResolvedValue({ explanation_style: 'technical' });
  explanationPreferenceAPI.getConversation.mockResolvedValue({ explanation_style: null, effective_explanation_style: 'technical' });
  conversationAPI.get.mockResolvedValue({ thread_id: 'thread-1', explanation_style: null, effective_explanation_style: 'technical', messages: [{ id: 'old-message', role: 'ai', content: 'Historical analysis remains unchanged.' }] });
  vi.stubGlobal('fetch', vi.fn(async (url) => String(url).includes('/meta/accounts')
    ? { ok: true, json: async () => ({ data: [] }) }
    : streamResponse([
      { type: 'presentation_preference', explanation_style: 'simple', conversation_explanation_style: 'simple', saved_explanation_style: 'technical', source: 'message', saved: true },
      { type: 'text', content: 'A simpler new reply.' },
    ])));
});
afterEach(() => vi.unstubAllGlobals());

describe('chat presentation preference integration', () => {
  it('keeps Technical selected after switching from Simple between messages', async () => {
    let conversationStyle = 'simple';
    explanationPreferenceAPI.getConversation.mockResolvedValue({ explanation_style: 'simple', effective_explanation_style: 'simple' });
    explanationPreferenceAPI.saveConversation.mockImplementation(async (id, style) => {
      conversationStyle = style;
      return { id, explanation_style: style, effective_explanation_style: style };
    });
    fetch.mockImplementation(async (url) => String(url).includes('/meta/accounts')
      ? { ok: true, json: async () => ({ data: [] }) }
      : streamResponse([
        { type: 'presentation_preference', explanation_style: conversationStyle, conversation_explanation_style: conversationStyle, saved_explanation_style: 'technical', source: 'conversation', conversation_saved: true },
        { type: 'text', content: `Reply in ${conversationStyle}.` },
      ]));
    render(<ChatInterface activeConversationId="c1" />);
    const styleControl = screen.getByRole('button', { name: 'Explanation style' });
    await waitFor(() => expect(styleControl.disabled).toBe(false));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Review my campaign' } });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    await screen.findByText('Reply in simple.');
    await waitFor(() => expect(styleControl.disabled).toBe(false));
    fireEvent.click(styleControl);
    fireEvent.click(screen.getByRole('radio', { name: /^Technical/ }));
    await waitFor(() => {
      expect(styleControl.textContent).toContain('Technical');
      expect(styleControl.disabled).toBe(false);
    });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Review it again' } });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    await screen.findByText('Reply in technical.');
    expect(styleControl.textContent).toContain('Technical');
    expect(screen.getByText('Reply in simple.')).toBeTruthy();
    const requests = fetch.mock.calls.filter(([url]) => String(url).includes('/agent/chat'));
    expect(requests).toHaveLength(2);
    expect(requests.map(([, options]) => JSON.parse(options.body).session_id)).toEqual(['thread-1', 'thread-1']);
    expect(explanationPreferenceAPI.saveConversation).toHaveBeenCalledWith('c1', 'technical', expect.any(AbortSignal));
  });

  it('updates from an SSE event while preserving historical messages and recommendations', async () => {
    render(<ChatInterface activeConversationId="c1" />);
    await screen.findByText('Historical analysis remains unchanged.');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Explanation style' }).disabled).toBe(false));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Explain this simply' } });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', shiftKey: false });
    await screen.findByText('A simpler new reply.');
    expect(screen.getByRole('button', { name: 'Explanation style' }).textContent).toContain('Simple');
    expect(screen.getByText('Historical analysis remains unchanged.')).toBeTruthy();
    expect(screen.getByText('Recommendations retained')).toBeTruthy();
    expect(conversationAPI.get).toHaveBeenCalledOnce();
    expect(explanationPreferenceAPI.getConversation).toHaveBeenCalledWith('c1', expect.any(AbortSignal));
    const chat = fetch.mock.calls.find(([url]) => String(url).includes('/agent/chat'));
    expect(JSON.parse(chat[1].body)).not.toHaveProperty('explanation_style');
    expect(JSON.parse(chat[1].body)).not.toHaveProperty('reset_explanation_style');
  });

  it('sends a pending new-chat selection on both creation and first POST', async () => {
    conversationAPI.create.mockResolvedValue({ id: 'created', thread_id: 'thread-created', explanation_style: 'simple', effective_explanation_style: 'simple' });
    render(<ChatInterface onConversationCreated={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Explanation style' }).disabled).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'Explanation style' }));
    fireEvent.click(screen.getByRole('radio', { name: /^Simple/ }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Analyze my account' } });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    await screen.findByText('A simpler new reply.');
    expect(conversationAPI.create).toHaveBeenCalledWith(expect.any(String), 'Analyze my account', expect.any(String), 'simple');
    const chat = fetch.mock.calls.find(([url]) => String(url).includes('/agent/chat'));
    expect(JSON.parse(chat[1].body).explanation_style).toBe('simple');
  });
});

