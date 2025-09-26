import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ProductTour } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useLocation } from 'react-router-dom';
import AdminOnboardingTour from './flows/AdminOnboardingTour';
import CheckpointOverlay from '../CheckpointOverlay';
import '../_ProductTours.scss';
import { RESET_TARGETS } from './constants';

interface AdminOnboardingToursProps {
  adminUuid: string,
  enterpriseId: string;
  enterpriseSlug: string;
  isOpen: boolean;
  onClose: () => void;
  setTarget: Function,
  targetSelector: string;
  enablePortalLearnerCreditManagementScreen: boolean;
  enterpriseFeatures: {
    topDownAssignmentRealTimeLcm: boolean;
  };
}

interface RootState {
  enterpriseCustomerAdmin: {
    uuid: string;
  };
  portalConfiguration: {
    enterpriseSlug: string;
    enablePortalLearnerCreditManagementScreen: boolean;
    enterpriseId: string;
    enterpriseFeatures: {
      topDownAssignmentRealTimeLcm: boolean;
    };
  };
}

const AdminOnboardingTours: FC<AdminOnboardingToursProps> = ({
  enterpriseFeatures,
  enablePortalLearnerCreditManagementScreen,
  adminUuid, enterpriseId, enterpriseSlug, isOpen, onClose, setTarget, targetSelector,
}) => {
  const intl = useIntl();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const prevPathnameRef = useRef(location.pathname);
  const adminOnboardingSteps = AdminOnboardingTour({
    enterpriseFeatures,
    enablePortalLearnerCreditManagementScreen,
    adminUuid,
    currentStep,
    setCurrentStep,
    enterpriseId,
    enterpriseSlug,
    onClose,
    targetSelector,
  });

  // Reset step for use case where we need to navigate to a different page but still on the same flow
  useEffect(() => {
    if (RESET_TARGETS.includes(targetSelector)) {
      setCurrentStep(0);
    }
  }, [targetSelector]);

  // Handle target setting for both page transitions and step changes
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    const currentPathname = location.pathname;
    const isPageTransition = prevPathname !== currentPathname;

    if (isPageTransition) {
      // Page transition: clear target immediately, then set after delay
      setTarget('');
      setTimeout(() => {
        if (adminOnboardingSteps[currentStep]) {
          const nextTarget = adminOnboardingSteps[currentStep].target;
          const targetWithoutPrefix = nextTarget.replace(/^[.#]/, '');
          setTarget(targetWithoutPrefix);
        }
      }, 200);
      prevPathnameRef.current = currentPathname;
    } else {
      // Step change on same page: set target immediately
      let timeId: any;
      if (adminOnboardingSteps[currentStep]) {
        const nextTarget = adminOnboardingSteps[currentStep].target;
        const targetWithoutPrefix = nextTarget.replace(/^[.#]/, '');
        setTarget(targetWithoutPrefix);
      }
      return () => clearTimeout(timeId);
    }
  }, [location.pathname, currentStep, adminOnboardingSteps, setTarget]);

  const tours = [
    {
      tourId: 'admin-onboarding-tour',
      enabled: isOpen,
      startingIndex: currentStep,
      advanceButtonText: intl.formatMessage({
        id: 'adminPortal.productTours.adminOnboarding.next',
        defaultMessage: 'Next',
        description: 'Text for the next button',
      }),
      backButtonText: intl.formatMessage({
        id: 'adminPortal.productTours.adminOnboarding.back',
        defaultMessage: 'Back',
        description: 'Text for the back button',
      }),
      endButtonText: intl.formatMessage({
        id: 'adminPortal.productTours.adminOnboarding.end',
        defaultMessage: 'Keep going',
        description: 'Text for the end button',
      }),
      onDismiss: onClose,
      onEnd: onClose,
      onEscape: onClose,
      checkpoints: adminOnboardingSteps,
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
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setTarget: PropTypes.func.isRequired,
  targetSelector: PropTypes.string.isRequired,
};
const mapStateToProps = (state: RootState) => ({
  adminUuid: state.enterpriseCustomerAdmin.uuid,
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enablePortalLearnerCreditManagementScreen: state.portalConfiguration.enablePortalLearnerCreditManagementScreen,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});
export default connect(mapStateToProps)(AdminOnboardingTours);
