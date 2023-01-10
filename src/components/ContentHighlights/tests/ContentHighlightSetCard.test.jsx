/* eslint-disable react/prop-types */
import { useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import algoliasearch from 'algoliasearch/lite';
import userEvent from '@testing-library/user-event';
import { v4 as uuidv4 } from 'uuid';
import ContentHighlightSetCard from '../ContentHighlightSetCard';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import CurrentContentHighlightHeader from '../CurrentContentHighlightHeader';
import { configuration } from '../../../config';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import {
  BUTTON_TEXT, HEADER_TEXT, MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION, ALERT_TEXT, STEPPER_STEP_TEXT,
} from '../data/constants';

const mockStore = configureMockStore([thunk]);

const mockData = [{
  title: 'Test Title',
  highlightSetUUID: 'test-uuid',
  enterpriseSlug: 'test-enterprise-slug',
  itemCount: 0,
  imageCapSrc: 'http://fake.image',
  isPublished: true,
  trackEvent: jest.fn(),
}];

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
          <CurrentContentHighlightHeader />
          {data.map((highlight) => (
            <ContentHighlightSetCard key={uuidv4()} {...highlight} />
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
    expect(screen.getByText(HEADER_TEXT.SUB_TEXT.currentContent)).toBeInTheDocument();
  });
  it('renders correct text when more then or equal to max curations', async () => {
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
    const createNewHighlightButton = screen.getByText(BUTTON_TEXT.createNewHighlight);
    expect(createNewHighlightButton).toBeInTheDocument();
    // Trigger Alert
    userEvent.click(createNewHighlightButton);
    // Verify Alert
    expect(screen.queryByText(STEPPER_STEP_TEXT.createTitle)).not.toBeInTheDocument();
    expect(screen.getByText(ALERT_TEXT.HEADER_TEXT.currentContent)).toBeInTheDocument();
    expect(screen.getByText(ALERT_TEXT.SUB_TEXT.currentContent)).toBeInTheDocument();

    const dismissButton = screen.getByText('Dismiss');
    expect(dismissButton).toBeInTheDocument();
    // Trigger Dismiss
    userEvent.click(dismissButton);
    // Verify Dismiss
    await waitFor(() => { expect(screen.queryByText(ALERT_TEXT.HEADER_TEXT.currentContent)).not.toBeInTheDocument(); });
    expect(screen.queryByText(ALERT_TEXT.SUB_TEXT.currentContent)).not.toBeInTheDocument();
  });
});
