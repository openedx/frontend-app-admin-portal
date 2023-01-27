/* eslint-disable react/prop-types */
import { screen, waitFor } from '@testing-library/dom';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-test-renderer';
import { useContentHighlightsContext } from '../../data/hooks';
import ContentHighlightCatalogVisibilityRadioInput from '../ContentHighlightCatalogVisibilityRadioInput';
import { BUTTON_TEXT, LEARNER_PORTAL_CATALOG_VISIBILITY } from '../../data/constants';
import { initialStateValue as initialEnterpriseAppContextValue } from '../../../../data/tests/EnterpriseAppTestData/context';
import { ContentHighlightsContext, testCourseHighlightsData, initialStateValue } from '../../../../data/tests/ContentHighlightsTestData';
import EnterpriseCatalogApiService from '../../../../data/services/EnterpriseCatalogApiService';

const mockHighlightSetResponse = testCourseHighlightsData;

const ContentHighlightCatalogVisibilityRadioInputWrapper = ({
  enterpriseAppContextValue = {
    value: {
      ...initialEnterpriseAppContextValue,
      enterpriseCuration: {
        ...initialEnterpriseAppContextValue.enterpriseCuration,
        enterpriseCuration: {
          ...initialEnterpriseAppContextValue.enterpriseCuration.enterpriseCuration,
          highlightSets: mockHighlightSetResponse,
          canOnlyViewHighlightSets: false,
        },
        updateEnterpriseCuration: jest.fn(),
        dispatch: jest.fn(),
      },
    },
  },
  value = initialStateValue,
}) => (
  <ContentHighlightsContext enterpriseAppContextValue={enterpriseAppContextValue} value={value}>
    <ContentHighlightCatalogVisibilityRadioInput />
  </ContentHighlightsContext>
);

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
    renderWithRouter(<ContentHighlightCatalogVisibilityRadioInputWrapper />);

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
    }));

    expect(EnterpriseCatalogApiService.updateEnterpriseCurationConfig).toHaveBeenCalledTimes(1);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });
  it('Spinner 1 shows on radio 1 click', async () => {
    EnterpriseCatalogApiService.updateEnterpriseCurationConfig.mockResolvedValue({
      data: {
        canOnlyViewHighlightSets: false,
      },
    });
    const viewingOnlyHighlightedContentContext = {
      value: {
        ...initialEnterpriseAppContextValue,
        enterpriseCuration: {
          ...initialEnterpriseAppContextValue.enterpriseCuration,
          enterpriseCuration: {
            ...initialEnterpriseAppContextValue.enterpriseCuration.enterpriseCuration,
            highlightSets: mockHighlightSetResponse,
            canOnlyViewHighlightSets: true,
          },
          updateEnterpriseCuration: jest.fn(),
          dispatch: jest.fn(),
        },
      },
    };
    renderWithRouter(
      <ContentHighlightCatalogVisibilityRadioInputWrapper
        enterpriseAppContextValue={viewingOnlyHighlightedContentContext}
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
    }));

    expect(EnterpriseCatalogApiService.updateEnterpriseCurationConfig).toHaveBeenCalledTimes(1);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });
  it('checks SetDefault', () => {
    const viewingOnlyHighlightedContentContext = {
      value: {
        ...initialEnterpriseAppContextValue,
        enterpriseCuration: {
          ...initialEnterpriseAppContextValue.enterpriseCuration,
          enterpriseCuration: {
            ...initialEnterpriseAppContextValue.enterpriseCuration.enterpriseCuration,
            canOnlyViewHighlightSets: true,
          },
          updateEnterpriseCuration: jest.fn(),
          dispatch: jest.fn(),
        },
      },
    };
    renderWithRouter(
      <ContentHighlightCatalogVisibilityRadioInputWrapper
        enterpriseAppContextValue={viewingOnlyHighlightedContentContext}
      />,
    );
  });
});
