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

// eslint-disable-next-line react/prop-types
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

describe('<HighlightStepperConfirmContent />', () => {
  it('renders the content', () => {
    renderWithRouter(
      <HighlightStepperConfirmContentWrapper currentSelectedRowIds={testCourseAggregation}>
        <HighlightStepperConfirmContent enterpriseId={enterpriseId} />
      </HighlightStepperConfirmContentWrapper>,
    );
    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    expect(screen.getByText('blp')).toBeInTheDocument();
    expect(screen.getByText('bla')).toBeInTheDocument();
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
