/* eslint-disable react/prop-types */
import { screen } from '@testing-library/dom';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import React, { useState } from 'react';
import thunk from 'redux-thunk';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { camelCaseObject } from '@edx/frontend-platform';
import userEvent from '@testing-library/user-event';
import { EnterpriseAppContext } from '../../../EnterpriseApp/EnterpriseAppContextProvider';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import {
  TEST_COURSE_HIGHLIGHTS_DATA, STEPPER_STEP_TEXT,
} from '../../data/constants';
import ContentHighlightCatalogVisibilityAlert from '../ContentHighlightCatalogVisibilityAlert';
import ContentHighlightStepper from '../../HighlightStepper/ContentHighlightStepper';

const mockStore = configureMockStore([thunk]);
const mockHighlightSetResponse = camelCaseObject(TEST_COURSE_HIGHLIGHTS_DATA);

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise',
    enterpriseId: 'test-enterprise-id',
  },
};

const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    enterpriseCuration: {
      highlightSets: mockHighlightSetResponse,
      canOnlyViewHighlightSets: false,
    },
  },
};
const noHighlightsAppContext = {
  ...initialEnterpriseAppContextValue,
  enterpriseCuration: {
    enterpriseCuration: {
      highlightSets: [],
    },
  },
};

const ContentHighlightCatalogVisibilityAlertWrapper = ({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  highlightSets = [],
  catalogVisibility = false,
}) => {
  const contextValue = useState({
    contentHighlights: highlightSets,
    catalogVisibilityAlertOpen: catalogVisibility,
    stepperModal: {
      isOpen: false,
      highlightTitle: null,
      titleStepValidationError: null,
      currentSelectedRowIds: {},
    },
  });

  return (
    <IntlProvider locale="en">
      <Provider store={mockStore(initialState)}>
        <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
          <ContentHighlightsContext.Provider value={contextValue}>
            <ContentHighlightCatalogVisibilityAlert />
            <ContentHighlightStepper />
          </ContentHighlightsContext.Provider>
        </EnterpriseAppContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

describe('ContentHighlightCatalogVisibilityAlert', () => {
  it('renders API response failure when catalogVisibilityAlertOpen context true', () => {
    renderWithRouter(
      <ContentHighlightCatalogVisibilityAlertWrapper catalogVisibility />,
    );
    expect(screen.getByText('Catalog visibility not updated')).toBeTruthy();
    expect(screen.getByText('Something went wrong when updating your setting. Please try again.')).toBeTruthy();
  });
  it('renders no highlights alert when highlight sets length is 0', () => {
    renderWithRouter(
      <ContentHighlightCatalogVisibilityAlertWrapper enterpriseAppContextValue={noHighlightsAppContext} />,
    );
    expect(screen.getByText('No highlights created')).toBeTruthy();
    expect(screen.getByText('At least one highlight has to be created to make a selection')).toBeTruthy();
    expect(screen.getByText('New highlight')).toBeTruthy();
  });
  it('renders null when nothing is triggering it', () => {
    renderWithRouter(<ContentHighlightCatalogVisibilityAlertWrapper />);
    expect(screen.queryByText('No highlights created')).toBeNull();
    expect(screen.queryByText('Something went wrong when updating your setting. Please try again.')).toBeNull();
  });
  it('renders no highlight sets alert and opens stepper modal', () => {
    renderWithRouter(
      <ContentHighlightCatalogVisibilityAlertWrapper enterpriseAppContextValue={noHighlightsAppContext} />,
    );
    expect(screen.getByText('No highlights created')).toBeTruthy();
    expect(screen.getByText('At least one highlight has to be created to make a selection')).toBeTruthy();
    expect(screen.getByText('New highlight')).toBeTruthy();
    const openStepperModalButton = screen.getByText('New highlight');
    expect(screen.queryByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeFalsy();

    userEvent.click(openStepperModalButton);

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeTruthy();
  });
});
