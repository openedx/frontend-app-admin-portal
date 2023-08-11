/* eslint-disable react/prop-types */
import { screen } from '@testing-library/dom';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import React from 'react';
import userEvent from '@testing-library/user-event';
import {
  BUTTON_TEXT, ALERT_TEXT, STEPPER_STEP_TEXT,
} from '../../data/constants';
import ContentHighlightCatalogVisibilityAlert from '../ContentHighlightCatalogVisibilityAlert';
import ContentHighlightStepper from '../../HighlightStepper/ContentHighlightStepper';
import { initialStateValue as initialEnterpriseAppContextValue } from '../../../../data/tests/EnterpriseAppTestData/context';
import {
  ContentHighlightsContext, testCourseHighlightsData, initialStateValue,
} from '../../../../data/tests/ContentHighlightsTestData';

const mockHighlightSetResponse = testCourseHighlightsData;

const ContentHighlightCatalogVisibilityAlertWrapper = ({
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
      },
    },
  },
  value = {
    ...initialStateValue,
    contentHighlights: mockHighlightSetResponse,
  },
}) => (
  <ContentHighlightsContext enterpriseAppContextValue={enterpriseAppContextValue} value={value}>
    <ContentHighlightCatalogVisibilityAlert />
    <ContentHighlightStepper />
  </ContentHighlightsContext>
);
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
      <ContentHighlightCatalogVisibilityAlertWrapper value={
        {
          ...initialStateValue,
          catalogVisibilityAlertOpen: true,
        }
      }
      />,
    );
    expect(screen.getByText(ALERT_TEXT.HEADER_TEXT.catalogVisibilityAPI)).toBeTruthy();
    expect(screen.getByText(ALERT_TEXT.SUB_TEXT.catalogVisibilityAPI)).toBeTruthy();
  });
  it('renders no highlights alert when highlight sets length is 0', () => {
    renderWithRouter(
      <ContentHighlightCatalogVisibilityAlertWrapper enterpriseAppContextValue={initialEnterpriseAppContextValue} />,
    );
    expect(screen.getByText(ALERT_TEXT.HEADER_TEXT.catalogVisibility)).toBeTruthy();
    expect(screen.getByText(ALERT_TEXT.SUB_TEXT.catalogVisibility)).toBeTruthy();
    expect(screen.getByText(BUTTON_TEXT.catalogVisibility)).toBeTruthy();
  });
  it('renders null when nothing is triggering it', () => {
    renderWithRouter(<ContentHighlightCatalogVisibilityAlertWrapper />);
    expect(screen.queryByText(ALERT_TEXT.HEADER_TEXT.catalogVisibility)).toBeNull();
    expect(screen.queryByText(ALERT_TEXT.HEADER_TEXT.catalogVisibilityAPI)).toBeNull();
  });
  it('renders no highlight sets alert and opens stepper modal', () => {
    renderWithRouter(
      <ContentHighlightCatalogVisibilityAlertWrapper enterpriseAppContextValue={initialEnterpriseAppContextValue} />,
    );
    expect(screen.getByText(ALERT_TEXT.HEADER_TEXT.catalogVisibility)).toBeTruthy();
    expect(screen.getByText(ALERT_TEXT.SUB_TEXT.catalogVisibility)).toBeTruthy();
    expect(screen.getByText(BUTTON_TEXT.catalogVisibility)).toBeTruthy();
    const openStepperModalButton = screen.getByText(BUTTON_TEXT.catalogVisibility);
    expect(screen.queryByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeFalsy();

    userEvent.click(openStepperModalButton);

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeTruthy();
  });
});
