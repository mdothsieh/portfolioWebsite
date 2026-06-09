import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { RevealText } from './RevealText';

function setReducedMotion(reduce: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: reduce && query.includes('reduce'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

afterEach(() => setReducedMotion(false));

describe('RevealText', () => {
  // The core SEO/accessibility contract: the full text is always in the DOM,
  // regardless of animation state.
  it('renders the complete text content', () => {
    const { container } = render(<RevealText text="Hello brave new world" />);
    expect(container.textContent).toBe('Hello brave new world');
  });

  it('preserves internal whitespace exactly', () => {
    const text = 'a   b\tc'; // multiple spaces + a tab
    const { container } = render(<RevealText text={text} />);
    expect(container.textContent).toBe(text);
  });

  it('renders nothing harmful for an empty string', () => {
    const { container } = render(<RevealText text="" />);
    expect(container.textContent).toBe('');
  });

  it('renders whitespace-only text without crashing', () => {
    const { container } = render(<RevealText text="   " />);
    expect(container.textContent).toBe('   ');
  });

  it('handles special characters and emoji', () => {
    const text = 'C++ & 网易云音乐 🎧 — done.';
    const { container } = render(<RevealText text={text} />);
    expect(container.textContent).toBe(text);
  });

  it('wraps each word in an animatable .rt-word span', () => {
    const { container } = render(<RevealText text="one two three" />);
    const words = container.querySelectorAll('.rt-word');
    expect(words).toHaveLength(3);
    expect([...words].map((w) => w.textContent)).toEqual(['one', 'two', 'three']);
  });

  it('applies the accent class to matching words, case- and punctuation-insensitively', () => {
    const { container } = render(
      <RevealText text="joining Flex Ltd for Summer 2026." accentWords={['flex', 'ltd', '2026']} />,
    );
    const accented = [...container.querySelectorAll('.rt-word')]
      .filter((w) => w.classList.contains('text-rose-400'))
      .map((w) => w.textContent);
    expect(accented).toEqual(['Flex', 'Ltd', '2026.']);
  });

  it('does not accent words when no accentWords are given', () => {
    const { container } = render(<RevealText text="plain heading here" />);
    expect(container.querySelectorAll('.text-rose-400')).toHaveLength(0);
  });

  it('reaches the shown state when in view (motion allowed)', () => {
    const { container } = render(<RevealText text="reveal me" />);
    const wrapper = container.querySelector('.reveal-text');
    // ImmediateIntersectionObserver (vitest.setup) fires on observe.
    expect(wrapper?.getAttribute('data-shown')).toBe('true');
  });

  it('shows immediately under prefers-reduced-motion', () => {
    setReducedMotion(true);
    const { container } = render(<RevealText text="no motion please" />);
    const wrapper = container.querySelector('.reveal-text');
    expect(wrapper?.getAttribute('data-shown')).toBe('true');
    expect(container.textContent).toBe('no motion please');
  });

  it('merges a custom className onto the wrapper', () => {
    const { container } = render(<RevealText text="x" className="font-serif text-5xl" />);
    const wrapper = container.querySelector('.reveal-text');
    expect(wrapper).toHaveClass('font-serif', 'text-5xl');
  });
});
