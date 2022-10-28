import { screen, render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ContentHighlightsDashboard from '../ContentHighlightsDashboard';

describe('<ContentHighlightsDashboard>', () => {
  it('Displays ZeroState on empty highlighted content list', () => {
    render(<ContentHighlightsDashboard />);
    expect(screen.getByText('You haven\'t created any "highlights" collections yet.')).toBeTruthy();
  });
  it('Displays New Highlight Modal on button click with no highlighted content list', () => {
    render(<ContentHighlightsDashboard />);
    const newHighlight = screen.getByText('New Highlight');
    fireEvent.click(newHighlight);
    expect(screen.getByText('Create a title for the highlight collection')).toBeInTheDocument();
  });
});
