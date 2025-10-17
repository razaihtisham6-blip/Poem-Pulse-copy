import { render, screen } from '@testing-library/react';
import ResultsPage from '../ResultsPage';

test('Cluster image renders with alt text when provided', () => {
  const resultsWithCluster = {
    relative_frequency: null,
    ratings: null,
    cluster: { plot: 'BASE64...' },
    sensorimotor: null,
  };

  render(<ResultsPage results={resultsWithCluster} onBack={() => {}} />);

  // Image is present with the expected alt text
  expect(screen.getByAltText('Word clustering visualization')).toBeInTheDocument();
  // Fallback text should not be present when image is provided
  expect(screen.queryByText(/no clustering visualization available/i)).toBeNull();
});

test('Shows fallback message when cluster is absent', () => {
  const resultsWithoutCluster = {
    relative_frequency: null,
    ratings: null,
    cluster: null,
    sensorimotor: null,
  };

  render(<ResultsPage results={resultsWithoutCluster} onBack={() => {}} />);

  // Fallback message is shown
  expect(screen.getByText(/no clustering visualization available/i)).toBeInTheDocument();
  // No image should be present
  expect(screen.queryByAltText('Word clustering visualization')).toBeNull();
});


