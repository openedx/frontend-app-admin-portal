import React, { FC, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ProductTour } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import useLearnerProgressTour from './useLearnerProgressTour';
import CheckpointOverlay from '../CheckpointOverlay';
import '../_ProductTours.scss';

interface AdminOnboardingToursProps {
  isOpen: boolean;
  onClose: () => void;
  targetSelector: string;
  adminUuid: string,
  setTarget: Function,
  enterpriseSlug: string;
}

interface RootState {
  portalConfiguration: {
    enterpriseSlug: string;
  };
  enterpriseCustomerAdmin: {
    uuid: string;
  }
}

const AdminOnboardingTours: FC<AdminOnboardingToursProps> = ({
  isOpen,
  onClose,
  targetSelector,
  adminUuid,
  setTarget,
  enterpriseSlug,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const learnerProgressSteps = useLearnerProgressTour({ enterpriseSlug, adminUuid });

  useEffect(() => {
    if (learnerProgressSteps[currentStep]) {
      const nextTarget = learnerProgressSteps[currentStep].target.replace('#', '');
      setTarget(nextTarget);
    }
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
      checkpoints: learnerProgressSteps.map((step, index) => ({
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
};

const mapStateToProps = (state: RootState) => ({
  adminUuid: state.enterpriseCustomerAdmin.uuid,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(AdminOnboardingTours);
