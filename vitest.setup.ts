import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

// jsdom implements neither of these; our reveal components depend on both.
// Defaults: motion allowed (matchMedia → matches:false) and IntersectionObserver
// fires immediately so reveal components reach their "shown" state in tests.
// Individual tests override window.matchMedia to exercise reduced-motion.

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
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

class ImmediateIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
  private cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
  }
  observe(target: Element) {
    this.cb(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this,
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
window.IntersectionObserver = ImmediateIntersectionObserver as unknown as typeof IntersectionObserver;
