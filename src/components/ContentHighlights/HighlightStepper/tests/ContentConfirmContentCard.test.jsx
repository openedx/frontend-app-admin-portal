import React, { useState } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import algoliasearch from 'algoliasearch/lite';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import ContentConfirmContentCard from '../ContentConfirmContentCard';
import { testCourseData, testCourseAggregation, FOOTER_TEXT_BY_CONTENT_TYPE } from '../../data/constants';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import { configuration } from '../../../../config';

const mockStore = configureMockStore();
const initialState = {
  portalConfiguration:
    {
      enterpriseSlug: 'test-enterprise',
    },
};

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
        {testCourseData.map((original) => <ContentConfirmContentCard original={original} />)}
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
    fireEvent.click(deleteButton[0]);
    for (let i = 0; i < testCourseData.length; i++) {
      if (i === 0) {
        expect(screen.queryByText(testCourseData[i].title)).not.toBeInTheDocument();
        // eslint-disable-next-line max-len
        expect(screen.queryByText(testCourseData[i].firstEnrollablePaidSeatPrice, { exact: false })).not.toBeInTheDocument();
        // eslint-disable-next-line max-len
        expect(screen.queryAllByText(FOOTER_TEXT_BY_CONTENT_TYPE[testCourseData[i].contentType], { exact: false }).length).toBe(testCourseData.length - 1);
        expect(screen.queryAllByText(testCourseData[i].partners[0].name).length).toBe(testCourseData.length - 1);
      } else {
        expect(screen.getByText(testCourseData[i].title)).toBeInTheDocument();
        expect(screen.getByText(testCourseData[i].firstEnrollablePaidSeatPrice, { exact: false })).toBeInTheDocument();
        // eslint-disable-next-line max-len
        expect(screen.queryAllByText(FOOTER_TEXT_BY_CONTENT_TYPE[testCourseData[i].contentType], { exact: false }).length).toBe(testCourseData.length - 1);
        expect(screen.queryAllByText(testCourseData[i].partners[0].name).length).toBe(testCourseData.length - 1);
      }
    }
  });
});
