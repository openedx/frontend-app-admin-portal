import { useContext } from 'react';
import {
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  PORTAL_APPEARANCE_TOUR_COOKIE_NAME,
  LEARNER_CREDIT_COOKIE_NAME,
  HIGHLIGHTS_COOKIE_NAME,
} from '../constants';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';

export const usePortalAppearanceTour = ({ enablePortalAppearance }) => {
  const dismissedPortalAppearanceTourCookie = global.localStorage.getItem(PORTAL_APPEARANCE_TOUR_COOKIE_NAME);
  // Only show tour if feature is enabled, hide cookie is undefined or false or not in the settings page
  const showPortalAppearanceTour = enablePortalAppearance && !dismissedPortalAppearanceTourCookie;
  return showPortalAppearanceTour;
};

export const useBrowseAndRequestTour = ({
  enableLearnerPortal,
}) => {
  const { subsidyRequestConfiguration, enterpriseSubsidyTypesForRequests } = useContext(SubsidyRequestsContext);
  const dismissedBrowseAndRequestTourCookie = global.localStorage.getItem(BROWSE_AND_REQUEST_TOUR_COOKIE_NAME);
  // Only show tour if the enterprise is eligible for the feature, browse and request tour cookie is undefined or false,
  // not in settings page, and subsidy requests are not already enabled
  const showBrowseAndRequestTour = enableLearnerPortal && enterpriseSubsidyTypesForRequests.length > 0
   && !dismissedBrowseAndRequestTourCookie && !subsidyRequestConfiguration?.subsidyRequestsEnabled;
  return showBrowseAndRequestTour;
};

export const useLearnerCreditTour = () => {
  const { canManageLearnerCredit } = useContext(EnterpriseSubsidiesContext);
  const dismissedLearnerCreditTourCookie = global.localStorage.getItem(LEARNER_CREDIT_COOKIE_NAME);
  // Only show tour if feature is enabled, the enterprise is eligible for the feature,
  // hide cookie is undefined or false, not in learner credit page
  const showLearnerCreditTour = canManageLearnerCredit && !dismissedLearnerCreditTourCookie;
  return showLearnerCreditTour;
};

export const useHighlightsTour = (enableHighlights) => {
  const dismissedHighlightsTourCookie = global.localStorage.getItem(HIGHLIGHTS_COOKIE_NAME);
  // Only show tour if feature is enabled, hide cookie is undefined or false or not in the settings page
  const showHighlightsTour = enableHighlights && !dismissedHighlightsTourCookie;
  return showHighlightsTour;
};
