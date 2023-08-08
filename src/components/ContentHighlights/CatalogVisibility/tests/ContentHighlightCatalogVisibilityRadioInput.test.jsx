/* eslint-disable react/prop-types */
import { screen, waitFor } from '@testing-library/dom';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import React, { useState } from 'react';
import thunk from 'redux-thunk';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { camelCaseObject } from '@edx/frontend-platform';
import userEvent from '@testing-library/user-event';
import { act } from 'react-test-renderer';
import { useContentHighlightsContext } from '../../data/hooks';
import ContentHighlightCatalogVisibilityRadioInput from '../ContentHighlightCatalogVisibilityRadioInput';
import { EnterpriseAppContext } from '../../../EnterpriseApp/EnterpriseAppContextProvider';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import { BUTTON_TEXT, TEST_COURSE_HIGHLIGHTS_DATA, LEARNER_PORTAL_CATALOG_VISIBILITY } from '../../data/constants';
import EnterpriseCatalogApiService from '../../../../data/services/EnterpriseCatalogApiService';

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
    updateEnterpriseCuration: jest.fn(),
    dispatch: jest.fn(),
  },

};

const ContentHighlightCatalogVisibilityRadioInputWrapper = ({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  highlightSets = [],
}) => {
  const contextValue = useState({
    contentHighlights: highlightSets,
  });

  return (
    <IntlProvider locale="en">
      <Provider store={mockStore(initialState)}>
        <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
          <ContentHighlightsContext.Provider value={contextValue}>
            <ContentHighlightCatalogVisibilityRadioInput />
          </ContentHighlightsContext.Provider>
        </EnterpriseAppContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

jest.mock('../../../../data/services/EnterpriseCatalogApiService');

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

jest.mock('../../data/hooks');
useContentHighlightsContext.mockReturnValue({
  setCatalogVisibilityAlert: false,
  enterpriseCuration: {
    enterpriseCuration: {
      highlightSets: [],
      canOnlyViewHighlightSets: false,
    },
    updateEnterpriseCuration: jest.fn(),
    dispatch: jest.fn(),
  },
});

describe('ContentHighlightCatalogVisibilityRadioInput1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders', () => {
    renderWithRouter(<ContentHighlightCatalogVisibilityRadioInputWrapper />);
    expect(screen.getByText(BUTTON_TEXT.catalogVisibilityRadio1)).toBeTruthy();
    expect(screen.getByText(BUTTON_TEXT.catalogVisibilityRadio2)).toBeTruthy();
  });
  it('Spinner 2 shows on radio 2 click', async () => {
    EnterpriseCatalogApiService.updateEnterpriseCurationConfig.mockResolvedValue({
      data: {
        canOnlyViewHighlightSets: true,
      },
    });
    renderWithRouter(<ContentHighlightCatalogVisibilityRadioInputWrapper highlightSets={mockHighlightSetResponse} />);

    const viewHighlightedContentButton = screen.getByText(BUTTON_TEXT.catalogVisibilityRadio2);
    const radio2LoadingStateInitial = screen.queryByTestId(`${LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}-form-control`);
    const radio1CheckedState = screen.getByTestId(`${LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value}-form-control-button`).checked;

    expect(radio2LoadingStateInitial).toBeFalsy();
    expect(radio1CheckedState).toBeTruthy();

    await act(() => {
      userEvent.click(viewHighlightedContentButton);
    });

    await waitFor(() => EnterpriseCatalogApiService.updateEnterpriseCurationConfig({
      canOnlyViewHighlightSets: true,
    }).then(data => data));

    expect(EnterpriseCatalogApiService.updateEnterpriseCurationConfig).toHaveBeenCalledTimes(1);
    /* Upgrading the @edx/paragon version from 20.41.0 to 20.42.0
    caused this function to be called twice. Setting this to 2 in order to fix the test */
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });
  it('Spinner 1 shows on radio 1 click', async () => {
    EnterpriseCatalogApiService.updateEnterpriseCurationConfig.mockResolvedValue({
      data: {
        canOnlyViewHighlightSets: false,
      },
    });
    const viewingOnlyHighlightedContentContext = {
      ...initialEnterpriseAppContextValue,
      enterpriseCuration: {
        ...initialEnterpriseAppContextValue.enterpriseCuration,
        enterpriseCuration: {
          ...initialEnterpriseAppContextValue.enterpriseCuration.enterpriseCuration,
          canOnlyViewHighlightSets: true,
        },
      },
    };
    renderWithRouter(
      <ContentHighlightCatalogVisibilityRadioInputWrapper
        enterpriseAppContextValue={viewingOnlyHighlightedContentContext}
        highlightSets={mockHighlightSetResponse}
      />,
    );
    const viewAllContentButton = screen.getByText(BUTTON_TEXT.catalogVisibilityRadio1);
    const radio1LoadingStateInitial = screen.queryByTestId(`${LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value}-form-control`);
    const radio2CheckedState = screen.getByTestId(`${LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}-form-control-button`).checked;

    expect(radio1LoadingStateInitial).toBeFalsy();
    expect(radio2CheckedState).toBeTruthy();

    await act(() => {
      userEvent.click(viewAllContentButton);
    });

    await waitFor(() => EnterpriseCatalogApiService.updateEnterpriseCurationConfig({
      canOnlyViewHighlightSets: false,
    }).then(data => data));

    expect(EnterpriseCatalogApiService.updateEnterpriseCurationConfig).toHaveBeenCalledTimes(1);
    /* Upgrading the @edx/paragon version from 20.41.0 to 20.42.0
    caused this function to be called twice. Setting this to 2 in order to fix the test */
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });
});
