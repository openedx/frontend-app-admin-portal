/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import algoliasearch from 'algoliasearch/lite';
import userEvent from '@testing-library/user-event';
import ContentHighlightSetCard from '../ContentHighlightSetCard';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import CurrentContentHighlightHeader from '../CurrentContentHighlightHeader';
import { configuration } from '../../../config';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import { BUTTON_TEXT, HEADER_TEXT, MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION } from '../data/constants';

const mockStore = configureMockStore([thunk]);

const mockData = {
  title: 'Test Title',
  highlightSetUUID: 'test-uuid',
  enterpriseSlug: 'test-enterprise-slug',
  itemCount: 0,
  imageCapSrc: 'http://fake.image',
  isPublished: true,
  trackEvent: jest.fn(),
};

const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    enterpriseCuration: {
      highlightSets: mockData,
    },
  },
};

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const mockMultipleData = [];
for (let i = 0; i < MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION; i++) {
  mockMultipleData.push({
    ...mockData,
    title: `Test Title ${i}`,
    highlightSetUUID: `test-uuid-${i}`,
  });
}
const initialState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
    enterpriseSlug: 'test-enterprise',
  },
  highlightSetUUID: 'test-uuid',
};

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const ContentHighlightSetCardWrapper = ({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  data = mockData,
}) => {
  const [isArray, setIsArray] = useState(false);
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
  useEffect(() => {
    if (data.length > 0) {
      setIsArray(true);
    }
  }, [data.length]);
  return (
    <Provider store={mockStore(initialState)}>
      <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
        <ContentHighlightsContext.Provider value={contextValue}>
          <CurrentContentHighlightHeader />
          {!isArray && <ContentHighlightSetCard {...data} />}
          {isArray && data.map((highlight) => (
            <ContentHighlightSetCard {...highlight} />
          ))}
        </ContentHighlightsContext.Provider>
      </EnterpriseAppContext.Provider>
    </Provider>
  );
};

describe('<ContentHighlightSetCard>', () => {
  it('Displays the title of the highlight set', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  it('opens model and sends segment event', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper />);
    const newHighlightButton = screen.getByText(BUTTON_TEXT.createNewHighlight);
    userEvent.click(newHighlightButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });
  it('renders correct text when less then max curations', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper />);
    expect(screen.getByText(BUTTON_TEXT.createNewHighlight)).toBeInTheDocument();
    expect(screen.getByText(HEADER_TEXT.SUB_TEXT.maxHighlights)).toBeInTheDocument();
  });
  it('renders correct text when more then or equal to max curations', () => {
    const updatedEnterpriseAppContextValue = {
      enterpriseCuration: {
        enterpriseCuration: {
          highlightSets: mockMultipleData,
        },
      },
    };
    renderWithRouter(
      <ContentHighlightSetCardWrapper
        enterpriseAppContextValue={updatedEnterpriseAppContextValue}
        data={mockMultipleData}
      />,
    );

    expect(screen.queryByText(BUTTON_TEXT.createNewHighlight)).not.toBeInTheDocument();
    expect(screen.queryByText(HEADER_TEXT.SUB_TEXT.maxHighlights)).not.toBeInTheDocument();
    expect(screen.getByText(HEADER_TEXT.SUB_TEXT.maxHighlightsReached)).toBeInTheDocument();
  });
});
