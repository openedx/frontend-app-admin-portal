import React, { FC, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ProductTour } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import useAdminOnboardingTour from './useAdminOnboardingTour';
import CheckpointOverlay from '../CheckpointOverlay';
import '../_ProductTours.scss';
import useCreateOrganizeLearnersFlow from './useCreateOrganizeLearnersFlow';
import { TRACK_LEARNER_PROGRESS_TITLE, ORGANIZE_LEARNERS_TITLE } from './messages';
import { TourStep } from '../types';

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

  // const [selectedFlowSteps, setSelectedFlowSteps] = useState<Array<TourStep> | null>(null);
  const adminOnboardingSteps = useAdminOnboardingTour({
    enterpriseSlug,
    adminUuid,
    aiButtonVisible,
    targetSelector,
  });

  // const organizeLearnersSteps = useCreateOrganizeLearnersFlow({ enterpriseSlug, adminUuid, enterpriseId });
  //  const selectedFlowSteps: () => Array<TourStep> = () => {
  //   if (selectedTour === ORGANIZE_LEARNERS_TITLE) {
  //     return organizeLearnersSteps;
  //   }
  //   return learnerProgressSteps;
  // };



  const learnerProgressSteps = useLearnerProgressTour({ enterpriseSlug, adminUuid, aiButtonVisible });

  useEffect(() => {
    if (adminOnboardingSteps[currentStep]) {
      const nextTarget = adminOnboardingSteps[currentStep].target;
      const targetWithoutPrefix = nextTarget.replace(/^[.#]/, '');
      setTarget(targetWithoutPrefix);
    }
  }, [currentStep, adminOnboardingSteps, setTarget]);

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
      checkpoints: adminOnboardingSteps.map((step, index) => ({
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
      <CheckpointOverlay target={adminOnboardingSteps[currentStep]?.target || targetSelector} />
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
