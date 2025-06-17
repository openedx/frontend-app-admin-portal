import React, { FC } from 'react';
import { connect } from 'react-redux';
import { ProductTour } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import useLearnerProgressTour from './useLearnerProgressTour';
import CheckpointOverlay from '../CheckpointOverlay';
import '../_ProductTours.scss';

interface AdminOnboardingToursProps {
  isOpen: boolean;
  onClose: () => void;
  enterpriseSlug: string;
  targetSelector: string;
}

interface RootState {
  portalConfiguration: {
    enterpriseSlug: string;
  };
}

const AdminOnboardingTours: FC<AdminOnboardingToursProps> = ({
  isOpen,
  onClose,
  enterpriseSlug,
  targetSelector,
}) => {
  const learnerProgressStep = useLearnerProgressTour({ enterpriseSlug });

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
          defaultMessage="Complete"
          description="Text for the end button"
        />
      ),
      onDismiss: onClose,
      onEnd: onClose,
      onEscape: onClose,
      checkpoints: [learnerProgressStep],
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

const mapStateToProps = (state: RootState) => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(AdminOnboardingTours);
