import React, { useState } from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import algoliasearch from 'algoliasearch/lite';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import HighlightStepperConfirmContent, { BaseReviewContentSelections, SelectedContent } from '../HighlightStepperConfirmContent';
import {
  testCourseAggregation,
} from '../../data/constants';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import { configuration } from '../../../../config';

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const enterpriseId = 'test-enterprise-id';
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
    <ContentHighlightsContext.Provider value={contextValue}>
      {children}
    </ContentHighlightsContext.Provider>
  );
};

describe('<HighlightStepperConfirmContent />', () => {
  it('renders the content', () => {
    renderWithRouter(
      <HighlightStepperConfirmContentWrapper currentSelectedRowIds={testCourseAggregation}>
        <HighlightStepperConfirmContent enterpriseId={enterpriseId} />
      </HighlightStepperConfirmContentWrapper>,
    );
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
    expect(screen.getByTestId('skeleton-container')).toBeInTheDocument();
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
  });
});
