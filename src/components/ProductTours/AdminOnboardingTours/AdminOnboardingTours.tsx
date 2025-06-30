import React, { FC, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ProductTour } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import useLearnerProgressTour from './useLearnerProgressTour';
import CheckpointOverlay from '../CheckpointOverlay';
import '../_ProductTours.scss';
import useOrganizeLearnersTour from './useOrganizeLearnersTour';

interface Insights {
  learner_engagement?: any;
  learner_progress?: any;
}

interface AdminOnboardingToursProps {
  selectedTour: string;
  isOpen: boolean;
  onClose: () => void;
  targetSelector: string;
  adminUuid: string,
  setTarget: Function,
  enterpriseSlug: string;
  enterpriseId: string;
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
    enterpriseId: string;
  };
  enterpriseCustomerAdmin: {
    uuid: string;
  }
}

const AdminOnboardingTours: FC<AdminOnboardingToursProps> = ({
  selectedTour,
  isOpen,
  onClose,
  targetSelector,
  setTarget,
  adminUuid,
  enterpriseSlug,
  enterpriseId,
  insights,
  insightsLoading,
}) => {
  const aiButtonVisible = (insights?.learner_engagement && insights?.learner_progress) && !insightsLoading;
  const [currentStep, setCurrentStep] = useState(0);
  const learnerProgressSteps = useLearnerProgressTour({ enterpriseSlug, adminUuid, aiButtonVisible });
  const organizeLearnersSteps = useOrganizeLearnersTour({ enterpriseSlug, adminUuid, enterpriseId });

  useEffect(() => {
    // if (selectedTour === messages.TRACK_LEARNER_PROGRESS_TITLE) {
    //   const nextTarget = learnerProgressSteps[currentStep].target.replace('#', '');
    // } else if (selectedTour === messages.ORGANIZE_LEARNERS_TITLE)
    //   const nextTarget = organizeLearnersSteps[currentStep].target.replace('#', '');
    // }
    if (organizeLearnersSteps[currentStep]) {
      const nextTarget = organizeLearnersSteps[currentStep].target.replace('#', '');
      setTarget(nextTarget);

    }
    // setTarget(nextTarget);
  }, [currentStep, learnerProgressSteps, setTarget]);

  const tours = [
    {
      tourId: 'admin-onboarding-tour',
      enabled: isOpen,
      startingIndex: currentStep,
      advanceButtonText: (
        <FormattedMessage
          id="adminPortal.productTours.adminOnboarding.next"
          defaultMessage="Next"
          description="Text for the next button"
        />
      ),
      backButtonText: (
        <FormattedMessage
          id="adminPortal.productTours.adminOnboarding.back"
          defaultMessage="Back"
          description="Text for the back button"
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
      checkpoints: organizeLearnersSteps.map((step, index) => ({
        ...step,
        onAdvance: () => {
          setCurrentStep(index + 1);
          step.onAdvance();
        },
      })),
    },
  ];

  return (
    <>
      <CheckpointOverlay target={targetSelector} />
      <ProductTour
        tours={tours}
      />
    </>
  );
};

AdminOnboardingTours.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  targetSelector: PropTypes.string.isRequired,
  setTarget: PropTypes.func.isRequired,
  adminUuid: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  insights: PropTypes.shape({
    learner_engagement: PropTypes.shape({}),
    learner_progress: PropTypes.shape({}),
  }).isRequired,
  insightsLoading: PropTypes.bool.isRequired,
};
const mapStateToProps = (state: RootState) => ({
  adminUuid: state.enterpriseCustomerAdmin.uuid,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseId: state.portalConfiguration.enterpriseId,
  insights: state.dashboardInsights.insights,
  insightsLoading: state.dashboardInsights.loading,
});
export default connect(mapStateToProps)(AdminOnboardingTours);
