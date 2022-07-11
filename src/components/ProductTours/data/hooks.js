import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';
import {
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  LEARNER_CREDIT_COOKIE_NAME,
} from '../constants';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';

const cookies = new Cookies();

export const useBrowseAndRequestTour = () => {
  const { enterpriseAppPage } = useParams();
  const inSettingsPage = enterpriseAppPage === ROUTE_NAMES.settings;

  const { subsidyRequestConfiguration } = useContext(SubsidyRequestsContext);
  const dismissedBrowseAndRequestTourCookie = cookies.get(BROWSE_AND_REQUEST_TOUR_COOKIE_NAME);
  // Only show tour if the enterprise is eligible for the feature, browse and request tour cookie is undefined or false,
  // not in settings page, and subsidy requests are not already enabled
  const showBrowseAndRequestTour = !dismissedBrowseAndRequestTourCookie
   && !inSettingsPage && !subsidyRequestConfiguration?.subsidyRequestsEnabled;

  const [browseAndRequestTourEnabled, setBrowseAndRequestTourEnabled] = useState(showBrowseAndRequestTour);
  return [browseAndRequestTourEnabled, setBrowseAndRequestTourEnabled];
};

export const useLearnerCreditTour = () => {
  const { enterpriseAppPage } = useParams();

  const inLearnerCreditPage = enterpriseAppPage === ROUTE_NAMES.learnerCredit;
  const { canManageLearnerCredit } = useContext(EnterpriseSubsidiesContext);
  const dismissedLearnerCreditTourCookie = cookies.get(LEARNER_CREDIT_COOKIE_NAME);
  // Only show tour if feature is enabled, the enterprise is eligible for the feature,
  // hide cookie is undefined or false, not in learner credit page
  const showLearnerCreditTour = canManageLearnerCredit
    && !dismissedLearnerCreditTourCookie && !inLearnerCreditPage;

  const [learnerCreditTourEnabled, setBrowseAndRequestTourEnabled] = useState(showLearnerCreditTour);
  return [learnerCreditTourEnabled, setBrowseAndRequestTourEnabled];
};
