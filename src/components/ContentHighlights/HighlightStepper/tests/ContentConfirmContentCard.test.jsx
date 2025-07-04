import React, { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import algoliasearch from 'algoliasearch/lite';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import ContentConfirmContentCard from '../ContentConfirmContentCard';
import { testCourseData, testCourseAggregation, FOOTER_TEXT_BY_CONTENT_TYPE } from '../../data/constants';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import { configuration } from '../../../../config';
import { useContentHighlightsContext } from '../../data/hooks';

const mockStore = configureMockStore();

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const initialState = {
  portalConfiguration:
    {
      enterpriseSlug: 'test-enterprise',
    },
};
testCourseData.forEach((element, index) => {
  if (!element.objectID) {
    testCourseData[index].objectID = index + 1;
  }
});
const mockDeleteSelectedRowId = jest.fn();
jest.mock('../../data/hooks');
useContentHighlightsContext.mockReturnValue({
  deleteSelectedRowId: mockDeleteSelectedRowId,
});

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const ContentHighlightContentCardWrapper = ({

  store = mockStore(initialState),
}) => {
  const contextValue = useState({
    stepperModal: {
      isOpen: false,
      highlightTitle: null,
      titleStepValidationError: null,
      currentSelectedRowIds: testCourseAggregation,
    },
    contentHighlights: [],
    algolia: {
      searchClient,
      securedAlgoliaApiKey: null,
      isLoading: false,
    },
  });
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <ContentHighlightsContext.Provider value={contextValue}>
          {testCourseData.map((original) => (
            <ContentConfirmContentCard
              original={original}
              key={original.aggregationKey}
            />
          ))}
        </ContentHighlightsContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

describe('<ContentConfirmContentCard />', () => {
  it('renders the correct content', () => {
    renderWithRouter(<ContentHighlightContentCardWrapper />);
    for (let i = 0; i < testCourseData.length; i++) {
      expect(screen.getByText(testCourseData[i].title)).toBeInTheDocument();
      expect(screen.getByText(testCourseData[i].firstEnrollablePaidSeatPrice, { exact: false })).toBeInTheDocument();
      // eslint-disable-next-line max-len
      expect(screen.queryAllByText(FOOTER_TEXT_BY_CONTENT_TYPE[testCourseData[i].contentType], { exact: false })).toBeTruthy();
      expect(screen.queryAllByText(testCourseData[i].partners[0].name)).toBeTruthy();
    }
  });
  it('deletes the correct content and sends first track event of the mock', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ContentHighlightContentCardWrapper />);
    const deleteButton = screen.getAllByRole('button', { 'aria-label': 'Delete' });
    await user.click(deleteButton[0]);
    expect(mockDeleteSelectedRowId).toHaveBeenCalledWith(testCourseData[0].aggregationKey);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });
  it('sends second track event of the mock on click of hyperlink', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ContentHighlightContentCardWrapper />);
    const hyperlinkTitle = screen.getAllByTestId('hyperlink-title')[0];
    await user.click(hyperlinkTitle);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });
});
