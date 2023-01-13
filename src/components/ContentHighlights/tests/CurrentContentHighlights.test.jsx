import { useState } from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import algoliasearch from 'algoliasearch/lite';
import CurrentContentHighlights from '../CurrentContentHighlights';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { BUTTON_TEXT } from '../data/constants';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import { configuration } from '../../../config';

const mockStore = configureMockStore([thunk]);

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise',
  },
};

const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    enterpriseCuration: {
      highlightSets: [],
    },
  },
};

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

/* eslint-disable react/prop-types */
const CurrentContentHighlightsWrapper = ({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  ...props
}) => {
/* eslint-enable react/prop-types */
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
    <Provider store={mockStore(initialState)}>
      <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
        <ContentHighlightsContext.Provider value={contextValue}>
          <CurrentContentHighlights {...props} />
        </ContentHighlightsContext.Provider>
      </EnterpriseAppContext.Provider>
    </Provider>
  );
};

describe('<CurrentContentHighlights>', () => {
  it('Displays the header title', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText(BUTTON_TEXT.createNewHighlight)).toBeInTheDocument();
  });
  it('Displays the header button', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText(BUTTON_TEXT.createNewHighlight)).toBeInTheDocument();
  });

  describe('ContentHighlightSetCardContainer', () => {
    const exampleHighlightSet = {
      uuid: 'fake-uuid',
      title: 'Test Highlight Set',
      isPublished: false,
      highlightedContentUuids: [],
    };
    it('Displays no highlight set cards', () => {
      renderWithRouter(<CurrentContentHighlightsWrapper />);
      expect(screen.queryByText('Published')).not.toBeInTheDocument();
      expect(screen.queryByText('Drafts')).not.toBeInTheDocument();
    });
    it('Displays draft highlight set cards', () => {
      renderWithRouter(
        <CurrentContentHighlightsWrapper
          enterpriseAppContextValue={{
            enterpriseCuration: {
              enterpriseCuration: {
                highlightSets: [exampleHighlightSet],
              },
            },
          }}
        />,
      );
      expect(screen.getByText('Drafts')).toBeInTheDocument();
      expect(screen.getByText(exampleHighlightSet.title)).toBeInTheDocument();
    });
    it('Displays published highlight set cards', () => {
      renderWithRouter(
        <CurrentContentHighlightsWrapper
          enterpriseAppContextValue={{
            enterpriseCuration: {
              enterpriseCuration: {
                highlightSets: [{
                  ...exampleHighlightSet,
                  isPublished: true,
                }],
              },
            },
          }}
        />,
      );
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText(exampleHighlightSet.title)).toBeInTheDocument();
    });
  });
});
