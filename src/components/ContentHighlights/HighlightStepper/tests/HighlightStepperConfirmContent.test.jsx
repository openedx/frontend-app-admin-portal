import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import HighlightStepperConfirmContent, { BaseReviewContentSelections, SelectedContent } from '../HighlightStepperConfirmContent';
import {
  DEFAULT_ERROR_MESSAGE,
} from '../../data/constants';
import { TEST_ENTERPRISE_ID } from '../../../../data/tests/constants';
import {
  testCourseData,
  ContentHighlightsContext,
  initialStateValue,
  testCourseAggregation,
} from '../../../../data/tests/ContentHighlightsTestData';
import 'jest-canvas-mock';

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
      <ContentHighlightsContext value={{
        ...initialStateValue,
        stepperModal: {
          ...initialStateValue.stepperModal,
          currentSelectedRowIds: testCourseAggregation,
        },
      }}
      >
        <HighlightStepperConfirmContent enterpriseId={TEST_ENTERPRISE_ID} />
      </ContentHighlightsContext>,
    );
    testCourseData.forEach((element) => {
      expect(screen.getByText(element.title)).toBeInTheDocument();
    });
  });
  it('renders the content in the correct order based on testCourseAggregationCourses', () => {
    const { container } = renderWithRouter(
      <ContentHighlightsContext>
        <HighlightStepperConfirmContent enterpriseId={TEST_ENTERPRISE_ID} />
      </ContentHighlightsContext>,
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
      <ContentHighlightsContext>
        <BaseReviewContentSelections isSearchStalled />
      </ContentHighlightsContext>,
    );
    expect(screen.getAllByTestId('card-item-skeleton')).toBeTruthy();
  });
  it('should render selected card content', () => {
    renderWithRouter(
      <ContentHighlightsContext>
        <BaseReviewContentSelections isSearchStalled={false} />
      </ContentHighlightsContext>,
    );
    expect(screen.getByTestId('base-content-no-results')).toBeInTheDocument();
  });
});

describe('SelectedContent', () => {
  it('should not render anything when nothing is selected', () => {
    renderWithRouter(
      <ContentHighlightsContext>
        <SelectedContent enterpriseId={TEST_ENTERPRISE_ID} />
      </ContentHighlightsContext>,
    );
    expect(screen.getByTestId('selected-content-no-results')).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_ERROR_MESSAGE.EMPTY_SELECTEDROWIDS)).toBeInTheDocument();
  });
});
