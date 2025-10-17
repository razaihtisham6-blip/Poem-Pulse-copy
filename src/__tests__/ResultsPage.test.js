import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultsPage from '../ResultsPage';

describe('ResultsPage', () => {
  test('frequency list sorting toggle changes item order', async () => {
    const results = {
      relative_frequency: { cherry: 0.3, apple: 0.2, banana: 0.1 },
      ratings: null,
      cluster: null,
      sensorimotor: null,
    };

    render(<ResultsPage results={results} onBack={() => {}} />);

    const panelHeading = screen.getByRole('heading', { name: /word frequency analysis/i });
    const panel = panelHeading.closest('.results-panel');
    expect(panel).not.toBeNull();

    // Descending is default: expect first item to be cherry (0.3)
    let items = within(panel).getAllByRole('listitem');
    expect(items[0].textContent).toMatch(/cherry/i);

    // Toggle to Ascending
    const sortSelect = within(panel).getByLabelText(/sort/i);
    await userEvent.selectOptions(sortSelect, 'Ascending');

    // After ascending: expect first item to be banana (0.1)
    items = within(panel).getAllByRole('listitem');
    expect(items[0].textContent).toMatch(/banana/i);
  });
});

