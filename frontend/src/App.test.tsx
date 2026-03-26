import { render, screen } from '@testing-library/react';
import DashboardPage from '@/pages/DashboardPage';

test('renders dashboard page by default', () => {
  render(<DashboardPage />);
  expect(screen.getByText(/Operations Dashboard/i)).toBeInTheDocument();
});
