import { useMemo } from 'react';
import { screen, fireEvent } from '@testing-library/react';
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
  highlightSetUUID: 'test-uuid',
  enterpriseSlug: 'test-enterprise-slug',
  itemCount: 0,
  imageCapSrc: 'http://fake.image',
  isPublished: true,
};

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise',
  },
  highlightSetUUID: 'test-uuid',
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
    renderWithRouter(<ContentHighlightSetCardWrapper {...mockData} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  it('Displays the stepper modal on click of the draft status', () => {
    const props = {
      ...mockData,
      isPublished: false,
    };
    renderWithRouter(<ContentHighlightSetCardWrapper {...props} />);
    fireEvent.click(screen.getByText('Test Title'));
    expect(screen.getByText(STEPPER_STEP_TEXT.createTitle)).toBeInTheDocument();
  });
});
