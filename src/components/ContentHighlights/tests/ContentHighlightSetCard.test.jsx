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
import { IntlProvider } from '@edx/frontend-platform/i18n';
import ContentHighlightSetCard from '../ContentHighlightSetCard';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import CurrentContentHighlightHeader from '../CurrentContentHighlightHeader';
import { configuration } from '../../../config';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import {
  BUTTON_TEXT,
  MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION,
  STEPPER_STEP_TEXT,
  NEW_ARCHIVED_CONTENT_ALERT_DISMISSED_COOKIE_NAME,
} from '../data/constants';

const mockStore = configureMockStore([thunk]);

const mockData = [{
  title: 'Test Title',
  highlightSetUUID: 'test-uuid',
  enterpriseSlug: 'test-enterprise-slug',
  itemCount: 0,
  imageCapSrc: 'http://fake.image',
  isPublished: true,
  onClick: jest.fn(),
}];

const mockEnterpriseHighlightedSets = [
  {
    uuid: 'test-uuid',
    isPublished: true,
    highlightedContent: [
      {
        uuid: 'test-content-uuid',
        contentKey: 'test-content-key',
        contentType: 'course',
        courseRunStatuses: [
          'archived',
        ],
      },
    ],
  },
  {
    uuid: 'test-highlight-set2',
    isPublished: true,
    highlightedContent: [
      {
        uuid: 'test-content2-uuid',
        contentKey: 'test-content2-key',
        contentType: 'program',
        courseRunStatuses: [
          'archived',
        ],
      },
      {
        uuid: 'test-content3-uuid',
        contentKey: 'test-content3-key',
        contentType: 'course',
        courseRunStatuses: [
          'archived',
        ],
      },
    ],
  },
];

const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    enterpriseCuration: {
      highlightSets: mockData,
    },
    enterpriseHighlightedSets: mockEnterpriseHighlightedSets,
    isNewArchivedContent: false,
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
      <IntlProvider locale="en">
        <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
          <ContentHighlightsContext.Provider value={contextValue}>
            <CurrentContentHighlightHeader />
            {data.map((highlight) => (
              <ContentHighlightSetCard key={uuidv4()} {...highlight} />
            ))}
          </ContentHighlightsContext.Provider>
        </EnterpriseAppContext.Provider>
      </IntlProvider>
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
    expect(screen.queryByText('Highlight limit reached')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete at least one highlight to create a new one.')).not.toBeInTheDocument();
  });
  it('renders correct text when more than or equal to max curations', async () => {
    const updatedEnterpriseAppContextValue = {
      enterpriseCuration: {
        enterpriseCuration: {
          highlightSets: mockMultipleData,
        },
        isNewArchivedContent: false,
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
    expect(screen.queryByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).not.toBeInTheDocument();
    expect(screen.getByText('Highlight limit reached')).toBeInTheDocument();
    expect(screen.getByText('Delete at least one highlight to create a new one.')).toBeInTheDocument();

    const dismissButton = screen.getByText('Dismiss');
    expect(dismissButton).toBeInTheDocument();
    // Trigger Dismiss
    userEvent.click(dismissButton);
    // Verify Dismiss
    await waitFor(() => { expect(screen.queryByText('Highlight limit reached')).not.toBeInTheDocument(); });
    expect(screen.queryByText('Delete at least one highlight to create a new one.')).not.toBeInTheDocument();
  });
  it('does not render archived course alert', () => {
    renderWithRouter(
      <ContentHighlightSetCardWrapper />,
    );
    expect(screen.queryByText('Needs Review: Archived Course(s)')).not.toBeInTheDocument();
  });
  it('renders archived course alert and sets local storage on dismiss', async () => {
    const updatedEnterpriseAppContextValue = {
      enterpriseCuration: {
        enterpriseCuration: {
          highlightSets: mockData,
        },
        enterpriseHighlightedSets: mockEnterpriseHighlightedSets,
        isNewArchivedContent: true,
        dispatch: jest.fn(),
      },
    };
    renderWithRouter(
      <ContentHighlightSetCardWrapper
        enterpriseAppContextValue={updatedEnterpriseAppContextValue}
      />,
    );
    expect(screen.getByText('Needs Review: Archived Course(s)')).toBeInTheDocument();
    const dismissButton = screen.getByText('Dismiss');
    expect(dismissButton).toBeInTheDocument();
    global.localStorage.setItem(`${NEW_ARCHIVED_CONTENT_ALERT_DISMISSED_COOKIE_NAME}-test-highlight-set2`, 'test-content2-key');
    userEvent.click(dismissButton);
    const resultCookieHighlightSet1 = global.localStorage.getItem(`${NEW_ARCHIVED_CONTENT_ALERT_DISMISSED_COOKIE_NAME}-test-uuid`);
    const resultCookieHighlightSet2 = global.localStorage.getItem(`${NEW_ARCHIVED_CONTENT_ALERT_DISMISSED_COOKIE_NAME}-test-highlight-set2`);
    await waitFor(() => { expect(resultCookieHighlightSet1).toEqual('test-content-key'); });
    // checks that a new content key is added to existing highlight set in localStorage
    await waitFor(() => { expect(resultCookieHighlightSet2).toEqual('test-content2-key,test-content3-key'); });
    expect(screen.queryByText('Needs Review: Archived Course(s)')).not.toBeInTheDocument();
  });
});
