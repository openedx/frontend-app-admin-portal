import { useState } from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import algoliasearch from 'algoliasearch/lite';
import ContentHighlightSetCard from '../ContentHighlightSetCard';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import CurrentContentHighlightHeader from '../CurrentContentHighlightHeader';
import { configuration } from '../../../config';

const mockStore = configureMockStore([thunk]);

const mockData = {
  title: 'Test Title',
  highlightSetUUID: 'test-uuid',
  enterpriseSlug: 'test-enterprise-slug',
  itemCount: 0,
  imageCapSrc: 'http://fake.image',
  isPublished: true,
};

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise',
  },
  highlightSetUUID: 'test-uuid',
};

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const ContentHighlightSetCardWrapper = (props) => {
  const contextValue = useState({
    stepperModal: {
      isOpen: false,
      highlightTitle: null,
      titleStepValidationError: null,
      currentSelectedRowIds: {},
    },
    contentHighlights: [],
    searchClient,
  });
  return (
    <ContentHighlightsContext.Provider value={contextValue}>
      <Provider store={mockStore(initialState)}>
        <CurrentContentHighlightHeader />
        <ContentHighlightSetCard {...props} />
      </Provider>
    </ContentHighlightsContext.Provider>
  );
};

describe('<ContentHighlightSetCard>', () => {
  it('Displays the title of the highlight set', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper {...mockData} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
