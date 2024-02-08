import React, { useState } from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import algoliasearch from 'algoliasearch/lite';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import HighlightStepperConfirmContent, { BaseReviewContentSelections, SelectedContent } from '../HighlightStepperConfirmContent';
import {
  DEFAULT_ERROR_MESSAGE,
  testCourseAggregation,
  testCourseData,
} from '../../data/constants';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import { configuration } from '../../../../config';

const mockStore = configureMockStore([thunk]);
const enterpriseId = 'test-enterprise-id';
const initialState = {
  portalConfiguration:
    {
      enterpriseSlug: 'test-enterprise',
      enterpriseId,
    },
};

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const HighlightStepperConfirmContentWrapper = ({ children, currentSelectedRowIds = [] }) => {
  const contextValue = useState({
    stepperModal: {
      isOpen: false,
      highlightTitle: null,
      titleStepValidationError: null,
      currentSelectedRowIds,
    },
    contentHighlights: [],
    searchClient,
  });
  return (
    <Provider store={mockStore(initialState)}>
      <ContentHighlightsContext.Provider value={contextValue}>
        {children}
      </ContentHighlightsContext.Provider>
    </Provider>
  );
};

// testCourseDataAggregation is the course keys coming from the Algolia search results
const testCourseDataAggregation = testCourseData.map((element) => element.aggregationKey.split(':')[1]);
// testCourseAggregationCourses is the course keys coming from the user's expected selection order
const testCourseAggregationCourses = Object.keys(testCourseAggregation).map((element) => element.split(':')[1]);
// returns titles of sorted course data
const sortedTestCourseTitles = testCourseAggregationCourses.map(
  element => testCourseData[testCourseDataAggregation.indexOf(element)].title,
);

const mockCourseData = [...testCourseData];
jest.mock('react-instantsearch-dom', () => ({
  ...jest.requireActual('react-instantsearch-dom'),
  connectStateResults: Component => function connectStateResults(props) {
    return (
      <Component
        searchResults={{
          hits: mockCourseData,
          hitsPerPage: 25,
          nbHits: 2,
          nbPages: 1,
          page: 1,
        }}
        isSearchStalled={false}
        searchState={{
          page: 1,
        }}
        {...props}
      />
    );
  },
}));

describe('<HighlightStepperConfirmContent />', () => {
  it('renders the content', () => {
    renderWithRouter(
      <HighlightStepperConfirmContentWrapper currentSelectedRowIds={testCourseAggregation}>
        <HighlightStepperConfirmContent enterpriseId={enterpriseId} />
      </HighlightStepperConfirmContentWrapper>,
    );
    testCourseData.forEach((element) => {
      expect(screen.getByText(element.title)).toBeInTheDocument();
    });
  });
  it('renders the content in the correct order based on testCourseAggregationCourses', () => {
    const { container } = renderWithRouter(
      <HighlightStepperConfirmContentWrapper currentSelectedRowIds={testCourseAggregation}>
        <HighlightStepperConfirmContent enterpriseId={enterpriseId} />
      </HighlightStepperConfirmContentWrapper>,
    );
    container.querySelectorAll('div[data-testid="title-test"]').forEach((element, index) => {
      expect(element).toHaveTextContent(sortedTestCourseTitles[index]);
      expect(screen.getByText(sortedTestCourseTitles[index])).toBeInTheDocument();
    });
  });
});

describe('BaseReviewContentSelections', () => {
  it('returns skeleton while search stalled', () => {
    renderWithRouter(
      <HighlightStepperConfirmContentWrapper>
        <BaseReviewContentSelections isSearchStalled />
      </HighlightStepperConfirmContentWrapper>,
    );
    expect(screen.getAllByTestId('card-item-skeleton')).toBeTruthy();
  });
  it('should render selected card content', () => {
    renderWithRouter(
      <HighlightStepperConfirmContentWrapper>
        <BaseReviewContentSelections isSearchStalled={false} />
      </HighlightStepperConfirmContentWrapper>,
    );
    expect(screen.getByTestId('base-content-no-results')).toBeInTheDocument();
  });
});

describe('SelectedContent', () => {
  it('should not render anything when nothing is selected', () => {
    renderWithRouter(
      <HighlightStepperConfirmContentWrapper>
        <SelectedContent enterpriseId={enterpriseId} />
      </HighlightStepperConfirmContentWrapper>,
    );
    expect(screen.getByTestId('selected-content-no-results')).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_ERROR_MESSAGE.EMPTY_SELECTEDROWIDS)).toBeInTheDocument();
  });
});
