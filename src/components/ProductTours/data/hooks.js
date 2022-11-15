import { useContext, useState } from 'react';
import Cookies from 'universal-cookie';
import {
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  PORTAL_APPEARANCE_TOUR_COOKIE_NAME,
  LEARNER_CREDIT_COOKIE_NAME,
  HIGHLIGHTS_COOKIE_NAME,
} from '../constants';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';

const cookies = new Cookies();

export const usePortalAppearanceTour = ({ enablePortalAppearance }) => {
  const dismissedLearnerCreditTourCookie = cookies.get(PORTAL_APPEARANCE_TOUR_COOKIE_NAME);
  // Only show tour if feature is enabled, hide cookie is undefined or false or not in the settings page
  const showPortalAppearanceTour = enablePortalAppearance && !dismissedLearnerCreditTourCookie;
  const [portalAppearanceTourEnabled, setPortalAppearanceTourEnabled] = useState(showPortalAppearanceTour);
  return [portalAppearanceTourEnabled, setPortalAppearanceTourEnabled];
};

export const useBrowseAndRequestTour = ({
  enableLearnerPortal,
}) => {
  const { subsidyRequestConfiguration, enterpriseSubsidyTypesForRequests } = useContext(SubsidyRequestsContext);
  const dismissedBrowseAndRequestTourCookie = cookies.get(BROWSE_AND_REQUEST_TOUR_COOKIE_NAME);
  // Only show tour if the enterprise is eligible for the feature, browse and request tour cookie is undefined or false,
  // not in settings page, and subsidy requests are not already enabled
  const showBrowseAndRequestTour = enableLearnerPortal && enterpriseSubsidyTypesForRequests.length > 0
   && !dismissedBrowseAndRequestTourCookie && !subsidyRequestConfiguration?.subsidyRequestsEnabled;

  const [browseAndRequestTourEnabled, setBrowseAndRequestTourEnabled] = useState(showBrowseAndRequestTour);
  return [browseAndRequestTourEnabled, setBrowseAndRequestTourEnabled];
};

export const useLearnerCreditTour = () => {
  const { canManageLearnerCredit } = useContext(EnterpriseSubsidiesContext);
  const dismissedLearnerCreditTourCookie = cookies.get(LEARNER_CREDIT_COOKIE_NAME);
  // Only show tour if feature is enabled, the enterprise is eligible for the feature,
  // hide cookie is undefined or false, not in learner credit page
  const showLearnerCreditTour = canManageLearnerCredit && !dismissedLearnerCreditTourCookie;

  const [learnerCreditTourEnabled, setBrowseAndRequestTourEnabled] = useState(showLearnerCreditTour);
  return [learnerCreditTourEnabled, setBrowseAndRequestTourEnabled];
};

export const useHighlightsTour = (enableHighlights) => {
  const dismissedHighlightsTourCookie = cookies.get(HIGHLIGHTS_COOKIE_NAME);
  // Only show tour if feature is enabled, hide cookie is undefined or false or not in the settings page
  const showHighlightsTour = enableHighlights && !dismissedHighlightsTourCookie;
  const [highlightsTourEnabled, setHighlightsTourEnabled] = useState(showHighlightsTour);
  return [highlightsTourEnabled, setHighlightsTourEnabled];
};
