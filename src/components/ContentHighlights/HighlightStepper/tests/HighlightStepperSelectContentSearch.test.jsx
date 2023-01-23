/* eslint-disable react/prop-types */
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import userEvent from '@testing-library/user-event';
import HighlightStepperSelectContent from '../HighlightStepperSelectContentSearch';
import {
  testCourseData,
  ContentHighlightsContext,
  initialStateValue,
} from '../../../../data/tests/ContentHighlightsTestData';
import { testCourseAggregation } from '../../data/constants';
import 'jest-canvas-mock';

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

// eslint-disable-next-line react/prop-types
const HighlightStepperSelectContentSearchWrapper = ({
  children,
  value = initialStateValue,
}) => (
  <ContentHighlightsContext value={value}>
    {children}
  </ContentHighlightsContext>
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
          nbHits: mockCourseData.length,
          nbPages: 2,
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

describe('HighlightStepperSelectContentSearch', () => {
  test('renders the search results with nothing selected', async () => {
    renderWithRouter(
      <HighlightStepperSelectContentSearchWrapper>
        <HighlightStepperSelectContent />
      </HighlightStepperSelectContentSearchWrapper>,
    );
    expect(screen.getByText(`Showing ${mockCourseData.length} of ${mockCourseData.length}`, { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Search courses')).toBeInTheDocument();
  });
  test('renders the search results with all selected', async () => {
    renderWithRouter(
      <HighlightStepperSelectContentSearchWrapper value={
        {
          ...initialStateValue,
          stepperModal: {
            ...initialStateValue.stepperModal,
            currentSelectedRowIds: testCourseAggregation,
          },
        }
      }
      >
        <HighlightStepperSelectContent />
      </HighlightStepperSelectContentSearchWrapper>,
    );
    expect(screen.getByText(`${mockCourseData.length} selected (${mockCourseData.length} shown below)`, { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Clear selection')).toBeInTheDocument();
  });
  test('sends track event on click', async () => {
    renderWithRouter(
      <HighlightStepperSelectContentSearchWrapper>
        <HighlightStepperSelectContent />
      </HighlightStepperSelectContentSearchWrapper>,
    );
    const hyperlinkTitle = screen.getAllByTestId('hyperlink-title')[0];
    userEvent.click(hyperlinkTitle);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });
});
