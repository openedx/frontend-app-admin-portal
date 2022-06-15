import { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform/config';
import Cookies from 'universal-cookie';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';
import {
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  LEARNER_CREDIT_COOKIE_NAME,
} from '../constants';
import { features } from '../../../config';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';

const cookies = new Cookies();

export const useBrowseAndRequestTour = () => {
  const history = useHistory();
  const inSettingsPage = history.location.pathname.includes(ROUTE_NAMES.settings);
  const { subsidyRequestConfiguration } = useContext(SubsidyRequestsContext);
  const isBrowseAndRequestEnabledForEnterprise = features.FEATURE_BROWSE_AND_REQUEST;
  const dismissedBrowseAndRequestTourCookie = cookies.get(BROWSE_AND_REQUEST_TOUR_COOKIE_NAME);
  // Only show tour if feature is enabled, the enterprise is eligible for the feature,
  // hide cookie is undefined or false, not in settings page, and subsidy requests are not already enabled
  const showBrowseAndRequestTour = isBrowseAndRequestEnabledForEnterprise
    && !dismissedBrowseAndRequestTourCookie && !inSettingsPage && !subsidyRequestConfiguration?.subsidyRequestsEnabled;
  return useState(showBrowseAndRequestTour);
};

export const useLearnerCreditTour = () => {
  const history = useHistory();
  const inLearnerCreditPage = history.location.pathname.includes(ROUTE_NAMES.learnerCredit);
  const { canManageLearnerCredit } = useContext(EnterpriseSubsidiesContext);
  const isLearnerCreditEnabled = getConfig().FEATURE_LEARNER_CREDIT_MANAGEMENT;
  const dismissedLearnerCreditTourCookie = cookies.get(LEARNER_CREDIT_COOKIE_NAME);
  // Only show tour if feature is enabled, the enterprise is eligible for the feature,
  // hide cookie is undefined or false, not in learner credit page
  const showLearnerCreditTour = isLearnerCreditEnabled && canManageLearnerCredit
    && !dismissedLearnerCreditTourCookie && !inLearnerCreditPage;
  return useState(showLearnerCreditTour);
};
