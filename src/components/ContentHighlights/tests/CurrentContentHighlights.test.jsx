import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { useReducer, useMemo } from 'react';
import CurrentContentHighlights from '../CurrentContentHighlights';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import {
  contentHighlightsReducer,
  initialContentHighlightsState,
} from '../data/reducer';
import { STEPPER_STEP_TEXT } from '../data/constants';

const mockStore = configureMockStore([thunk]);

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise-id',
  },
};

const CurrentContentHighlightsWrapper = (props) => {
  const [
    contentHighlightsState,
    dispatch,
  ] = useReducer(contentHighlightsReducer, initialContentHighlightsState);
  const value = useMemo(() => ({
    ...contentHighlightsState,
    dispatch,
  }), [contentHighlightsState]);
  return (
    <ContentHighlightsContext.Provider value={value}>
      <Provider store={mockStore(initialState)}>
        <CurrentContentHighlights {...props} />
      </Provider>
    </ContentHighlightsContext.Provider>
  );
};

describe('<CurrentContentHighlights>', () => {
  it('Displays the header title', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText('Active Highlights')).toBeInTheDocument();
  });
  it('Displays the header button', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText('New Highlight')).toBeInTheDocument();
  });
  it('Displays the stepper modal on click of the header button', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    fireEvent.click(screen.getByText('New Highlight'));
    expect(screen.getByText(STEPPER_STEP_TEXT.createTitle)).toBeInTheDocument();
  });

  /* TODO: Currently the ContentHighlightSetCardContainer is hard coded with data, test to be updated */
  it('Displays the ContentHighlightSetCardContainer', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText('Dire Core')).toBeInTheDocument();
  });
});
