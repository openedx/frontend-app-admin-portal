import { screen, render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import CurrentContentHighlights from '../CurrentContentHighlights';

const mockStore = configureMockStore([thunk]);

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise-id',
  },
};

const CurrentContentHighlightsWrapper = (props) => (
  <MemoryRouter>
    <Provider store={mockStore(initialState)}>
      <CurrentContentHighlights {...props} />
    </Provider>
  </MemoryRouter>
);

describe('<CurrentContentHighlights>', () => {
  it('Displays the header title', () => {
    render(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText('Active Highlights')).toBeInTheDocument();
  });
  it('Displays the header button', () => {
    render(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText('New Highlight')).toBeInTheDocument();
  });
  it('Displays the stepper modal on click of the header button', () => {
    render(<CurrentContentHighlightsWrapper />);
    fireEvent.click(screen.getByText('New Highlight'));
    expect(screen.getByText('Create a title for the highlight collection')).toBeInTheDocument();
  });

  /* Currently the ContentHighlightSetCardContainer is hard coded with data, test to be updated */
  it('Displays the ContentHighlightSetCardContainer', () => {
    render(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText('Dire Core')).toBeInTheDocument();
  });
});
