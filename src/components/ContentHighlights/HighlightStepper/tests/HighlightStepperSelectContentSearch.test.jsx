/* eslint-disable react/prop-types */
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import userEvent from '@testing-library/user-event';
import renderer from 'react-test-renderer';
import HighlightStepperSelectContent, { PriceTableCell } from '../HighlightStepperSelectContentSearch';
import {
  testCourseData,
  ContentHighlightsContext,
  initialStateValue,
  testCourseAggregation,
} from '../../../../data/tests/ContentHighlightsTestData';
import 'jest-canvas-mock';

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

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
      <ContentHighlightsContext>
        <HighlightStepperSelectContent />
      </ContentHighlightsContext>,
    );
    expect(screen.getByText(`Showing ${mockCourseData.length} of ${mockCourseData.length}`, { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Search courses')).toBeInTheDocument();
  });
  test('renders the search results with all selected', async () => {
    renderWithRouter(
      <ContentHighlightsContext value={
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
      </ContentHighlightsContext>,
    );
    expect(screen.getByText(`${mockCourseData.length} selected (${mockCourseData.length} shown below)`, { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Clear selection')).toBeInTheDocument();
  });
  test('sends track event on click', async () => {
    renderWithRouter(
      <ContentHighlightsContext>
        <HighlightStepperSelectContent />
      </ContentHighlightsContext>,
    );
    const hyperlinkTitle = screen.getAllByTestId('hyperlink-title')[0];
    userEvent.click(hyperlinkTitle);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });
  test('Control bar toggles', () => {
    renderWithRouter(
      <ContentHighlightsContext value={
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
      </ContentHighlightsContext>,
    );
    const controlBar = screen.getByTestId('icon-btn-val-list');
    expect(controlBar.getAttribute('aria-selected')).toEqual('false');
    userEvent.click(controlBar);
    expect(controlBar.getAttribute('aria-selected')).toEqual('true');
  });
});
describe('PriceTableCell', () => {
  it('renders correctly', () => {
    const row = {
      original: {
        firstEnrollablePaidSeatPrice: 100,
      },
    };
    const tree = renderer
      .create(<PriceTableCell row={row} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('returns null', () => {
    const row = {
      original: {
        firstEnrollablePaidSeatPrice: null,
      },
    };
    const tree = renderer
      .create(<PriceTableCell row={row} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
