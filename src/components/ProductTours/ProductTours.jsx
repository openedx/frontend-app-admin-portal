import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';
import { ProductTour } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { features } from '../../config';
import portalAppearanceTour from './portalAppearanceTour';
import learnerCreditTour from './learnerCreditTour';
import learnerDetailPageTour from './learnerDetailPageTour';
import highlightsTour from './highlightsTour';
import browseAndRequestTour from './browseAndRequestTour';
import { disableAll, filterCheckpoints } from './data/utils';
import AdminOnboardingTours from './AdminOnboardingTours/AdminOnboardingTours';
import {
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  HIGHLIGHTS_COOKIE_NAME,
  LEARNER_CREDIT_COOKIE_NAME,
  LEARNER_DETAIL_PAGE_COOKIE_NAME,
  PORTAL_APPEARANCE_TOUR_COOKIE_NAME,
} from './constants';

import {
  useBrowseAndRequestTour, usePortalAppearanceTour, useLearnerCreditTour, useHighlightsTour,
  useLearnerDetailPageTour,
} from './data/hooks';
import TourCollapsible from './TourCollapsible';
import {
  ADMINISTER_SUBSCRIPTIONS_TARGETS,
  ALLOCATE_LEARNING_BUDGETS_TARGETS,
  ANALYTICS_INSIGHTS_TARGETS,
  ORGANIZE_LEARNER_TARGETS,
  TRACK_LEARNER_PROGRESS_TARGETS,
  CUSTOMIZE_REPORTS_SIDEBAR,
} from './AdminOnboardingTours/constants';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import OnboardingWelcomeModal from './AdminOnboardingTours/OnboardingWelcomeModal';
import useHydrateAdminOnboardingData from './AdminOnboardingTours/data/useHydrateAdminOnboardingData';

/**
 * All the logic here is for determining what ProductTours we should show.
 * All actual tour specific logic/content should live within the separate tour files.
 */
const ProductTours = ({
  enableLearnerPortal,
  enterpriseSlug,
  enterpriseId,
  onboardingEnabled,
  onboardingTourCompleted,
  onboardingTourDismissed,
}) => {
  const { isLoading } = useHydrateAdminOnboardingData(enterpriseId);
  const navigate = useNavigate();
  const { FEATURE_CONTENT_HIGHLIGHTS } = getConfig();
  const enablePortalAppearance = features.SETTINGS_PAGE_APPEARANCE_TAB;
  const [isAdminTourOpen, setIsAdminTourOpen] = useState(true);
  const [selectedTourTarget, setSelectedTourTarget] = useState(null);
  const [showCollapsible, setShowCollapsible] = useState(!onboardingTourCompleted && !onboardingTourDismissed);

  const enabledFeatures = {
    [BROWSE_AND_REQUEST_TOUR_COOKIE_NAME]: useBrowseAndRequestTour(enableLearnerPortal),
    [HIGHLIGHTS_COOKIE_NAME]: useHighlightsTour(FEATURE_CONTENT_HIGHLIGHTS),
    [LEARNER_CREDIT_COOKIE_NAME]: useLearnerCreditTour(),
    [LEARNER_DETAIL_PAGE_COOKIE_NAME]: useLearnerDetailPageTour(),
    [PORTAL_APPEARANCE_TOUR_COOKIE_NAME]: usePortalAppearanceTour(enablePortalAppearance),
  };
  const newFeatureTourCheckpoints = {
    [BROWSE_AND_REQUEST_TOUR_COOKIE_NAME]: browseAndRequestTour({ enterpriseSlug }),
    [HIGHLIGHTS_COOKIE_NAME]: highlightsTour({ enterpriseSlug }),
    [LEARNER_CREDIT_COOKIE_NAME]: learnerCreditTour({ enterpriseSlug }),
    [LEARNER_DETAIL_PAGE_COOKIE_NAME]: learnerDetailPageTour({ enterpriseSlug }),
    [PORTAL_APPEARANCE_TOUR_COOKIE_NAME]: portalAppearanceTour({ enterpriseSlug }),
  };
  const checkpointsArray = filterCheckpoints(newFeatureTourCheckpoints, enabledFeatures);
  const tours = [{
    tourId: 'newFeatureTour',
    backButtonText: 'Back',
    enabled: checkpointsArray?.length > 0,
    onEnd: () => disableAll(),
    checkpoints: checkpointsArray,
  }];

  const handleTourSelect = (targetId) => {
    if (targetId === TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR) {
      navigate(`/${enterpriseSlug}/admin/${ROUTE_NAMES.learners}/`);
    } else if (targetId === ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR) {
      navigate(`/${enterpriseSlug}/admin/${ROUTE_NAMES.peopleManagement}/`);
    } else if (targetId === ANALYTICS_INSIGHTS_TARGETS.SIDEBAR) {
      navigate(`/${enterpriseSlug}/admin/${ROUTE_NAMES.analytics}/`);
    } else if (targetId === ADMINISTER_SUBSCRIPTIONS_TARGETS.SIDEBAR) {
      navigate(`/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/`);
    } else if (targetId === ALLOCATE_LEARNING_BUDGETS_TARGETS.SIDEBAR) {
      navigate(`/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}/`);
    } else if (targetId === CUSTOMIZE_REPORTS_SIDEBAR) {
      navigate(`/${enterpriseSlug}/admin/${ROUTE_NAMES.reporting}/`);
    }
    setSelectedTourTarget(targetId);
    setIsAdminTourOpen(true);
    // collapsible will reopen on the last step of the flow
    setShowCollapsible(false);
  };

  const handleTourClose = () => {
    setShowCollapsible(true);
    setIsAdminTourOpen(false);
    setSelectedTourTarget(null);
  };

  return (
    <div className="product-tours">
      {onboardingEnabled && !isLoading && (
        <>
          <OnboardingWelcomeModal
            openAdminTour={setIsAdminTourOpen}
          />
          <TourCollapsible
            onTourSelect={handleTourSelect}
            setShowCollapsible={setShowCollapsible}
            showCollapsible={showCollapsible}
          />
        </>
      )}
      {isAdminTourOpen && selectedTourTarget ? (
        <AdminOnboardingTours
          isOpen={isAdminTourOpen}
          onClose={handleTourClose}
          setTarget={setSelectedTourTarget}
          targetSelector={selectedTourTarget}
        />
      ) : (
        <ProductTour
          tours={tours}
        />
      )}
    </div>
  );
};

ProductTours.propTypes = {
  enableLearnerPortal: PropTypes.bool.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  onboardingEnabled: PropTypes.bool.isRequired,
  onboardingTourCompleted: PropTypes.bool.isRequired,
  onboardingTourDismissed: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseId: state.portalConfiguration.enterpriseId,
  onboardingEnabled: state.portalConfiguration.enterpriseFeatures?.enterpriseAdminOnboardingEnabled || false,
  onboardingTourCompleted: state.enterpriseCustomerAdmin.onboardingTourCompleted,
  onboardingTourDismissed: state.enterpriseCustomerAdmin.onboardingTourDismissed,
});

export default connect(mapStateToProps)(ProductTours);
