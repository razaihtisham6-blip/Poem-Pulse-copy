import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultsPage from '../ResultsPage';

test('“Next” button invokes callback once', async () => {
  const onBack = jest.fn();
  const results = { relative_frequency: { alpha: 0.1 }, ratings: null, cluster: null, sensorimotor: null };

  render(<ResultsPage results={results} onBack={onBack} />);

  await userEvent.click(screen.getByRole('button', { name: /next/i }));
  expect(onBack).toHaveBeenCalledTimes(1);
});


