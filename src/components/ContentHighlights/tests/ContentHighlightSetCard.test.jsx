import { screen, render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import {
  useReducer, useMemo,
} from 'react';
import ContentHighlightSetCard from '../ContentHighlightSetCard';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import CurrentContentHighlightHeader from '../CurrentContentHighlightHeader';
import {
  contentHighlightsReducer,
  initialContentHighlightsState,
} from '../data/reducer';
import { STEPPER_STEP_TEXT } from '../data/constants';

const mockStore = configureMockStore([thunk]);

const mockData = {
  title: 'Test Title',
  highlightUUID: 'test-uuid',
  enterpriseSlug: 'test-enterprise-slug',
};

const publishedData = {
  ...mockData,
  isPublished: true,
};

const unpublishedData = {
  ...mockData,
  isPublished: false,
};

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise-id',
  },
  highlightUUID: 'test-uuid',
};

const ContentHighlightSetCardWrapper = (props) => {
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
        <CurrentContentHighlightHeader />
        <ContentHighlightSetCard {...props} />
      </Provider>
    </ContentHighlightsContext.Provider>
  );
};

describe('<ContentHighlightSetCard>', () => {
  it('Displays the title of the highlight set', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper {...publishedData} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  it('Displays the published status of the highlight set', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper {...publishedData} />);
    expect(screen.getByText('Published')).toBeInTheDocument();
  });
  it('Displays the draft status of the highlight set', () => {
    render(<ContentHighlightSetCardWrapper {...unpublishedData} />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });
  it('Displays the stepper modal on click of the draft status', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper {...unpublishedData} />);
    fireEvent.click(screen.getByText('Test Title'));
    expect(screen.getByText(STEPPER_STEP_TEXT.createTitle)).toBeInTheDocument();
  });
});
