import React, { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import algoliasearch from 'algoliasearch/lite';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import ContentConfirmContentCard from '../ContentConfirmContentCard';
import { testCourseData, testCourseAggregation, FOOTER_TEXT_BY_CONTENT_TYPE } from '../../data/constants';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import { configuration } from '../../../../config';
import { useContentHighlightsContext } from '../../data/hooks';

const mockStore = configureMockStore();
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
  // eslint-disable-next-line react/prop-types
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
    searchClient,
  });
  return (
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
  it('deletes the correct content', () => {
    renderWithRouter(<ContentHighlightContentCardWrapper />);
    const deleteButton = screen.getAllByRole('button', { 'aria-label': 'Delete' });
    userEvent.click(deleteButton[0]);
    expect(mockDeleteSelectedRowId).toHaveBeenCalledWith(testCourseData[0].aggregationKey);
  });
});
