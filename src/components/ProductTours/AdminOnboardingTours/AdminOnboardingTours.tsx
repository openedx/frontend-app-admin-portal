import React, { FC, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ProductTour } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import useAdminOnboardingTour from './data/useAdminOnboardingTour';
import CheckpointOverlay from '../CheckpointOverlay';
import '../_ProductTours.scss';

interface Insights {
  learner_engagement?: any;
  learner_progress?: any;
}

interface AdminOnboardingToursProps {
  adminUuid: string,
  enterpriseSlug: string;
  insights: Insights;
  insightsLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  setTarget: Function,
  targetSelector: string;
}

interface RootState {
  dashboardInsights: {
    insights: Insights;
    loading: boolean;
  };
  enterpriseCustomerAdmin: {
    uuid: string;
  };
  portalConfiguration: {
    enterpriseSlug: string;
  };
}

const AdminOnboardingTours: FC<AdminOnboardingToursProps> = ({
  adminUuid, enterpriseSlug, insights, insightsLoading, isOpen, onClose, setTarget, targetSelector,
}) => {
  const aiButtonVisible = (insights?.learner_engagement && insights?.learner_progress) && !insightsLoading;
  const [currentStep, setCurrentStep] = useState(0);
  const adminOnboardingSteps = useAdminOnboardingTour({
    adminUuid, aiButtonVisible, currentStep, setCurrentStep, enterpriseSlug, targetSelector,
  });

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
      checkpoints: adminOnboardingSteps,
      // checkpoints: adminOnboardingSteps.map((step, index) => ({
      //   ...step,
      //   onAdvance: () => {
      //     setCurrentStep(index + 1);
      //     step.onAdvance();
      //   },
      // })),
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
  adminUuid: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  insights: PropTypes.shape({
    learner_engagement: PropTypes.shape({}),
    learner_progress: PropTypes.shape({}),
  }).isRequired,
  insightsLoading: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setTarget: PropTypes.func.isRequired,
  targetSelector: PropTypes.string.isRequired,
};
const mapStateToProps = (state: RootState) => ({
  adminUuid: state.enterpriseCustomerAdmin.uuid,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  insights: state.dashboardInsights.insights,
  insightsLoading: state.dashboardInsights.loading,
});
export default connect(mapStateToProps)(AdminOnboardingTours);
