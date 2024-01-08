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
import { act } from 'react-dom/test-utils';
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

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../data/hooks');
useContentHighlightsContext.mockReturnValue({
  setCatalogVisibilityAlert: jest.fn(),
  enterpriseCuration: {
    enterpriseCuration: {
      highlightSets: [],
      canOnlyViewHighlightSets: false,
    },
    updateEnterpriseCuration: jest.fn(),
    dispatch: jest.fn(),
  },
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({
    pathname: '/enterprise/test-enterprise/content-highlights',
  }),
}));

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
    const mockUpdateEnterpriseCuration = jest.fn();
    const mockEnterpriseAppContextValue = {
      enterpriseCuration: {
        ...initialEnterpriseAppContextValue.enterpriseCuration,
        enterpriseCuration: {
          ...initialEnterpriseAppContextValue.enterpriseCuration.enterpriseCuration,
          highlightSets: [{ uuid: 'test-uuid' }],
        },
        updateEnterpriseCuration: mockUpdateEnterpriseCuration,
      },
    };
    mockUpdateEnterpriseCuration.mockResolvedValue({
      canOnlyViewHighlightSets: true,
    });
    renderWithRouter((
      <ContentHighlightCatalogVisibilityRadioInputWrapper
        highlightSets={mockHighlightSetResponse}
        enterpriseAppContextValue={mockEnterpriseAppContextValue}
      />
    ));

    const viewHighlightedContentButton = screen.getByText(BUTTON_TEXT.catalogVisibilityRadio2);
    const radio2LoadingStateInitial = screen.queryByTestId(`${LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}-form-control`);
    const radio1CheckedState = screen.getByTestId(`${LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value}-form-control-button`).checked;

    expect(radio2LoadingStateInitial).toBeFalsy();
    expect(radio1CheckedState).toBeTruthy();

    await act(async () => {
      userEvent.click(viewHighlightedContentButton);
    });

    await waitFor(() => {
      expect(mockUpdateEnterpriseCuration).toHaveBeenCalledTimes(1);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    });
  });
  it('Spinner 1 shows on radio 1 click', async () => {
    EnterpriseCatalogApiService.updateEnterpriseCurationConfig.mockResolvedValue({
      data: {
        canOnlyViewHighlightSets: false,
      },
    });
    const mockUpdateEnterpriseCuration = jest.fn();
    const viewingOnlyHighlightedContentContext = {
      ...initialEnterpriseAppContextValue,
      enterpriseCuration: {
        ...initialEnterpriseAppContextValue.enterpriseCuration,
        enterpriseCuration: {
          ...initialEnterpriseAppContextValue.enterpriseCuration.enterpriseCuration,
          canOnlyViewHighlightSets: true,
        },
        updateEnterpriseCuration: mockUpdateEnterpriseCuration,
      },
    };
    mockUpdateEnterpriseCuration.mockResolvedValue({
      canOnlyViewHighlightSets: true,
    });
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

    await act(async () => {
      userEvent.click(viewAllContentButton);
    });

    await waitFor(() => {
      expect(mockUpdateEnterpriseCuration).toHaveBeenCalledTimes(1);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    });
  });
});
