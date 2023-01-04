import React, { useState } from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import algoliasearch from 'algoliasearch/lite';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import {
  testCourseAggregation,
  testCourseData,
} from '../../data/constants';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import { configuration } from '../../../../config';
import HighlightStepperSelectContent from '../HighlightStepperSelectContentSearch';

const mockStore = configureMockStore([thunk]);
jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});
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

// eslint-disable-next-line react/prop-types
const HighlightStepperSelectContentSearchWrapper = ({ children, currentSelectedRowIds = [] }) => {
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
    <IntlProvider locale="en">
      <Provider store={mockStore(initialState)}>
        <ContentHighlightsContext.Provider value={contextValue}>
          {children}
        </ContentHighlightsContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

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
      <HighlightStepperSelectContentSearchWrapper currentSelectedRowIds={testCourseAggregation}>
        <HighlightStepperSelectContent />
      </HighlightStepperSelectContentSearchWrapper>,
    );
    expect(screen.getByText(`${mockCourseData.length} selected (${mockCourseData.length} shown below)`, { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Clear selection')).toBeInTheDocument();
  });
  test('sends track event on click', async () => {
    renderWithRouter(
      <HighlightStepperSelectContentSearchWrapper currentSelectedRowIds={testCourseAggregation}>
        <HighlightStepperSelectContent />
      </HighlightStepperSelectContentSearchWrapper>,
    );
    const hyperlinkTitle = screen.getAllByTestId('hyperlink-title')[0];
    userEvent.click(hyperlinkTitle);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });
});
