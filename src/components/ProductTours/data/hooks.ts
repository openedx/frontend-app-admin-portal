import { useContext } from 'react';
import {
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  PORTAL_APPEARANCE_TOUR_COOKIE_NAME,
  LEARNER_CREDIT_COOKIE_NAME,
  HIGHLIGHTS_COOKIE_NAME,
  LEARNER_DETAIL_PAGE_COOKIE_NAME,
} from '../constants';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';

/**
  useBrowseAndRequestTour returns true if
  - the enterprise is eligible for the feature
  - browse and request tour cookie is undefined or false
  - not in settings page
  - subsidy requests are not already enabled
 *  @param {boolean} enableLearnerPortal - if the learner portal is enabled for the customer
 *  @returns {boolean}
 */
export const useBrowseAndRequestTour = (enableLearnerPortal: boolean) : boolean => {
  const { subsidyRequestConfiguration, enterpriseSubsidyTypesForRequests } = useContext(SubsidyRequestsContext);
  const dismissedBrowseAndRequestTourCookie = global.localStorage.getItem(BROWSE_AND_REQUEST_TOUR_COOKIE_NAME);
  const showBrowseAndRequestTour = enableLearnerPortal && enterpriseSubsidyTypesForRequests.length > 0
   && !dismissedBrowseAndRequestTourCookie && !subsidyRequestConfiguration?.subsidyRequestsEnabled;
  return showBrowseAndRequestTour;
};

/**
  useHighlightsTour returns true if
  - feature is enabled
  - highlights tour cookie is undefined or false
 *  @param {boolean} enableHighlights - if highlights are enabled for the customer
 *  @returns {boolean}
 */
export const useHighlightsTour = (enableHighlights: boolean) : boolean => {
  const dismissedHighlightsTourCookie = global.localStorage.getItem(HIGHLIGHTS_COOKIE_NAME);
  const showHighlightsTour = enableHighlights && !dismissedHighlightsTourCookie;
  return showHighlightsTour;
};

/**
  useLearnerCreditTour returns true if
  - feature is enabled
  - the enterprise is eligible for the feature
  - learner credit tour cookie is undefined or false
 *  @returns {boolean}
 */
export const useLearnerCreditTour = () : boolean => {
  const { canManageLearnerCredit } = useContext(EnterpriseSubsidiesContext);
  const dismissedLearnerCreditTourCookie = global.localStorage.getItem(LEARNER_CREDIT_COOKIE_NAME);
  const showLearnerCreditTour = canManageLearnerCredit && !dismissedLearnerCreditTourCookie;
  return showLearnerCreditTour;
};

/**
  useLearnerDetailPageTour returns true if
  - feature is enabled
  - learner detail tour cookie is undefined or false
 *  @returns {boolean}
 */
export const useLearnerDetailPageTour = () : boolean => {
  const dismissedLearnerDetailTourCookie = global.localStorage.getItem(LEARNER_DETAIL_PAGE_COOKIE_NAME);
  // Only show tour if hide cookie is undefined or false or not in the settings page
  const showLearnerDetailPageTour = !dismissedLearnerDetailTourCookie;
  return showLearnerDetailPageTour;
};

/**
  usePortalAppearanceTour returns true if
  - feature is enabled
  - portal appearance tour cookie is undefined or false
 *  @param {boolean} enablePortalAppearance - if the portal appearance is enabled
 *  @returns {boolean}
 */
export const usePortalAppearanceTour = (enablePortalAppearance: boolean) : boolean => {
  const dismissedPortalAppearanceTourCookie = global.localStorage.getItem(PORTAL_APPEARANCE_TOUR_COOKIE_NAME);
  // Only show tour if feature is enabled, hide cookie is undefined or false or not in the settings page
  const showPortalAppearanceTour = enablePortalAppearance && !dismissedPortalAppearanceTourCookie;
  return showPortalAppearanceTour;
};
