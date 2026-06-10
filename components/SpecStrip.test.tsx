// Tests for components/SpecStrip.tsx (Vitest + Testing Library).
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpecStrip } from './SpecStrip';

describe('SpecStrip', () => {
  it('renders all four spec labels', () => {
    render(<SpecStrip />);
    const labels = screen.getAllByRole('term').map((el) => el.textContent);
    expect(labels).toEqual([
      'internships shipped',
      'throughput',
      'core stack',
      'available',
    ]);
  });

  it('shows the headline proof values', () => {
    const { container } = render(<SpecStrip />);
    expect(container.textContent).toContain('02');
    expect(container.textContent).toContain('+40%');
    expect(container.textContent).toContain('Summer 2027');
    expect(container.textContent).toContain('Kenmou');
  });

  it('paints the metric accents in the signature red', () => {
    const { container } = render(<SpecStrip />);
    const accents = [...container.querySelectorAll('.text-rose-400')].map(
      (el) => el.textContent,
    );
    expect(accents).toContain('+40%'); // whole value is accented
    expect(accents).toContain('2027'); // only the year fragment is accented
  });

  it('renders as a section element', () => {
    const { container } = render(<SpecStrip />);
    expect(container.querySelector('section')).not.toBeNull();
  });
});
