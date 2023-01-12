import { useState } from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import algoliasearch from 'algoliasearch/lite';
import {
  BUTTON_TEXT, STEPPER_STEP_TEXT, ALERT_TEXT,
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

describe('<ContentHighlightsDashboard>', () => {
  it('Displays ZeroState on empty highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    expect(screen.getByText(ALERT_TEXT.HEADER_TEXT.catalogVisibility)).toBeInTheDocument();
    expect(screen.getByText(ALERT_TEXT.SUB_TEXT.catalogVisibility)).toBeInTheDocument();
  });

  it('Displays New highlight Modal on button click with no highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    const newHighlight = screen.getByText(BUTTON_TEXT.catalogVisibility);
    userEvent.click(newHighlight);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
  });

  it('Displays New highlight modal on button click with highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    const newHighlight = screen.getByText(BUTTON_TEXT.catalogVisibility, { exact: false });
    userEvent.click(newHighlight);
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

    userEvent.click(catalogVisibilityTab);
    expect(catalogVisibilityTab.classList.contains('active')).toBeTruthy();
    expect(highlightTab.classList.contains('active')).toBeFalsy();
  });
  it('Disabled Highlight tab when no highlight sets exist', () => {
    renderWithRouter(
      <ContentHighlightsDashboardWrapper />,
    );
    const [highlightTab, catalogVisibilityTab] = screen.getAllByRole('tab');

    expect(highlightTab.classList.contains('active')).toBeFalsy();
    expect(highlightTab.classList.contains('disabled')).toBeTruthy();
    expect(catalogVisibilityTab.classList.contains('active')).toBeTruthy();
  });
  it('Displays New highlight modal on button click with highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    const newHighlight = screen.getByText('New highlight');
    userEvent.click(newHighlight);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
  });
});
