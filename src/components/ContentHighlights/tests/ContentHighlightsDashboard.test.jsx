import { useState } from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import algoliasearch from 'algoliasearch/lite';
import {
  BUTTON_TEXT, STEPPER_STEP_TEXT,
} from '../data/constants';
import ContentHighlightsDashboard from '../ContentHighlightsDashboard';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import { configuration } from '../../../config';
import ContentHighlightStepper from '../HighlightStepper/ContentHighlightStepper';

const mockStore = configureMockStore([thunk]);

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise',
    enterpriseId: 'test-enterprise-id',
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

const exampleHighlightSet = {
  uuid: 'fake-uuid',
  title: 'Test Highlight Set',
  isPublished: false,
  highlightedContentUuids: [],
};

/* eslint-disable react/prop-types */
const ContentHighlightsDashboardWrapper = ({
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
    <IntlProvider locale="en">
      <Provider store={mockStore(initialState)}>
        <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
          <ContentHighlightsContext.Provider value={contextValue}>
            <ContentHighlightsDashboard {...props} />
            <ContentHighlightStepper />
          </ContentHighlightsContext.Provider>
        </EnterpriseAppContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return {
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  };
});

describe('<ContentHighlightsDashboard>', () => {
  it('Displays ZeroState on empty highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    expect(screen.getByText("You haven't created any highlights yet.")).toBeInTheDocument();
    expect(screen.getByText('Create and recommend content collections to your learners, enabling them to quickly locate content relevant to them.')).toBeInTheDocument();
  });

  it('Displays New highlight Modal on button click with no highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    const newHighlight = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
    userEvent.click(newHighlight);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
  });
  it('Displays current highlights when data is populated', () => {
    renderWithRouter(
      <ContentHighlightsDashboardWrapper
        enterpriseAppContextValue={{
          enterpriseCuration: {
            enterpriseCuration: {
              highlightSets: [exampleHighlightSet],
            },
          },
        }}
      />,
    );
    expect(screen.getByText(exampleHighlightSet.title)).toBeInTheDocument();
  });
  it('Allows selection between tabs of dashboard, when highlight set exist', () => {
    renderWithRouter(
      <ContentHighlightsDashboardWrapper
        enterpriseAppContextValue={{
          enterpriseCuration: {
            enterpriseCuration: {
              highlightSets: [exampleHighlightSet],
            },
          },
        }}
      />,
    );
    const [highlightTab, catalogVisibilityTab] = screen.getAllByRole('tab');

    expect(highlightTab.classList.contains('active')).toBeTruthy();
    expect(catalogVisibilityTab.classList.contains('active')).toBeFalsy();

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    userEvent.click(catalogVisibilityTab);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);

    expect(catalogVisibilityTab.classList.contains('active')).toBeTruthy();
    expect(highlightTab.classList.contains('active')).toBeFalsy();
  });
  it('Displays New highlight modal on button click with highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    const newHighlight = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
    userEvent.click(newHighlight);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
  });
});
