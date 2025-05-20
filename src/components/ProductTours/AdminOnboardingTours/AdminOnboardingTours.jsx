import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ProductTour } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import learnerProgressTour from './learnerProgressTour';
import CheckpointOverlay from '../CheckpointOverlay';
import '../ProductTour.scss';

const AdminOnboardingTours = ({ 
  isOpen, 
  onClose, 
  enterpriseSlug, 
  enterpriseFeatures,
  targetSelector 
}) => {

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
      checkpoints: [
        learnerProgressTour({ enterpriseSlug }),
      ],
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
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
  enterpriseFeatures: PropTypes.shape({
    enterpriseAdminOnboardingEnabled: PropTypes.bool.isRequired,
  }),
  targetSelector: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

export default connect(mapStateToProps)(AdminOnboardingTours);
