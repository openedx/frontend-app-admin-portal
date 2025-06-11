import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ProductTour } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import useLearnerProgressTour from './useLearnerProgressTour';
import CheckpointOverlay from '../CheckpointOverlay';
import '../_ProductTours.scss';

interface Insights {
  learner_engagement?: any;
  learner_progress?: any;
}

interface AdminOnboardingToursProps {
  isOpen: boolean;
  onClose: () => void;
  targetSelector: string;
  enterpriseSlug: string;
  insights: Insights;
  insightsLoading: boolean;
}

interface RootState {
  dashboardInsights: {
    insights: Insights;
    loading: boolean;
  };
  portalConfiguration: {
    enterpriseSlug: string;
  };

}

const AdminOnboardingTours: FC<AdminOnboardingToursProps> = ({
  isOpen,
  onClose,
  targetSelector,
  enterpriseSlug,
  insights,
  insightsLoading,
}) => {
  const aiButtonVisible = (insights?.learner_engagement && insights?.learner_progress) && !insightsLoading;
  const learnerProgressSteps = useLearnerProgressTour({ enterpriseSlug, aiButtonVisible });

  const tours = [
    {
      tourId: 'admin-onboarding-tour',
      enabled: isOpen,
      startingIndex: 0,
      advanceButtonText: (
        <FormattedMessage
          id="adminPortal.productTours.adminOnboarding.next"
          defaultMessage="Next"
          description="Text for the next button"
        />
      ),
      dismissButtonText: (
        <FormattedMessage
          id="adminPortal.productTours.adminOnboarding.dismiss"
          defaultMessage="Dismiss"
          description="Text for the dismiss button"
        />
      ),
      endButtonText: (
        <FormattedMessage
          id="adminPortal.productTours.adminOnboarding.end"
          defaultMessage="Keep going"
          description="Text for the end button"
        />
      ),
      onDismiss: onClose,
      onEnd: onClose,
      onEscape: onClose,
      checkpoints: learnerProgressSteps,
    },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <CheckpointOverlay target={`#${targetSelector}`} />
      <ProductTour
        tours={tours}
      />
    </>
  );
};

AdminOnboardingTours.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  targetSelector: PropTypes.any.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  insights: PropTypes.shape({
    learner_engagement: PropTypes.any,
    learner_progress: PropTypes.any,
  }).isRequired,
  insightsLoading: PropTypes.any.isRequired,
};

const mapStateToProps = (state: RootState) => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  insights: state.dashboardInsights.insights,
  insightsLoading: state.dashboardInsights.loading,
});

export default connect(mapStateToProps)(AdminOnboardingTours);
