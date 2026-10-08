import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ExplanationStyleControl from './ExplanationStyleControl.jsx';

const preferences = () => ({
  style: 'technical', savedStyle: 'balanced', override: 'technical', loading: false,
  saving: false, error: '', changeStyle: vi.fn(), useDefault: vi.fn(), saveDefault: vi.fn(),
});
const openControl = () => fireEvent.click(screen.getByRole('button', { name: 'Explanation style' }));

describe('ExplanationStyleControl', () => {
  it('keeps the composer compact and reveals described options and default actions on demand', () => {
    const props = preferences();
    render(<ExplanationStyleControl preferences={props} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Explanation style' }).textContent).toContain('Technical');
    openControl();
    expect(screen.getByRole('dialog', { name: 'How should I explain things?' })).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: /^Technical/ }).checked).toBe(true);
    expect(screen.getByText('Plain language. Key terms explained. Detail when needed.')).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: /^Simple/ }));
    expect(props.changeStyle).toHaveBeenCalledWith('simple');
    fireEvent.click(screen.getByRole('button', { name: 'Make default for new chats' }));
    expect(props.saveDefault).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Use default' }));
    expect(props.useDefault).toHaveBeenCalledOnce();
  });

  it.each(['loading', 'saving', 'streaming', 'unavailable'])('disables the trigger while %s', (phase) => {
    render(<ExplanationStyleControl disabled={phase === 'streaming'} preferences={{ ...preferences(), [phase]: true }} />);
    expect(screen.getByRole('button', { name: 'Explanation style' }).disabled).toBe(true);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('announces failures and shows which default is active', () => {
    render(<ExplanationStyleControl preferences={{ ...preferences(), override: null, error: 'Unable to save' }} />);
    expect(screen.getByRole('alert').textContent).toBe('Unable to save');
    openControl();
    expect(screen.getByRole('status').textContent).toBe('Your default: Balanced · In use');
    expect(screen.getByRole('button', { name: 'Use default' }).disabled).toBe(true);
  });

  it('focuses the current option and returns focus to the trigger on Escape', () => {
    render(<ExplanationStyleControl preferences={preferences()} />);
    openControl();
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: /^Technical/ }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Explanation style' }));
  });

  it('dismisses on outside click and when focus leaves', () => {
    render(<><ExplanationStyleControl preferences={preferences()} /><button>Outside</button></>);
    openControl();
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    openControl();
    fireEvent.blur(screen.getByRole('radio', { name: /^Technical/ }), { relatedTarget: screen.getByRole('button', { name: 'Outside' }) });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('avoids redundant saves when the current style is already the default', () => {
    render(<ExplanationStyleControl preferences={{ ...preferences(), savedStyle: 'technical' }} />);
    openControl();
    expect(screen.getByRole('button', { name: 'Make default for new chats' }).disabled).toBe(true);
  });
});
