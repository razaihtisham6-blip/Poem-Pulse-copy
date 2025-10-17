import { render, screen } from '@testing-library/react';
import ResultsPage from '../ResultsPage';

test('No results fallback renders with no panels or buttons', () => {
  render(<ResultsPage results={null} />);

  // Fallback text is visible
  expect(screen.getByText(/no results received\./i)).toBeInTheDocument();

  // No panels or Next button are rendered in fallback
  expect(screen.queryByRole('heading', { name: /word frequency analysis/i })).toBeNull();
  expect(screen.queryByRole('heading', { name: /semantic clustering visualization/i })).toBeNull();
  expect(screen.queryByRole('heading', { name: /sentiment analysis/i })).toBeNull();
  expect(screen.queryByRole('button', { name: /next/i })).toBeNull();
});


