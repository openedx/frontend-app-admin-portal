import React, { useState } from 'react';
import { bool, func } from 'prop-types';
import { connect } from 'react-redux';

import {
  IconButton, Icon, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import { Question } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import FloatingCollapsible from '../FloatingCollapsible';
import messages from './messages';
import { dismissOnboardingTour } from '../../data/actions/enterpriseCustomerAdmin';

const TourCollapsible = (
  { onboardingTourCompleted = true, onboardingTourDismissed = true, dismissOnboardingTour: dismissTour },
) => {
  const intl = useIntl();
  const [showCollapsible, setShowCollapsible] = useState(!onboardingTourCompleted && !onboardingTourDismissed);

  const handleDismiss = () => {
    setShowCollapsible(false);
    dismissTour();
  };

  return (
    <>
      {showCollapsible && (
      <FloatingCollapsible title={intl.formatMessage(messages.collapsibleTitle)} onDismiss={handleDismiss}>
        <p className="small">{intl.formatMessage(messages.collapsibleIntro)}</p>
      </FloatingCollapsible>
      )}
      {!showCollapsible && (
        <OverlayTrigger
          placement="left"
          overlay={(
            <Tooltip id="product-tours-question-icon-tooltip">
              {intl.formatMessage(messages.questionIconTooltip)}
            </Tooltip>
      )}
        >
          <IconButton
            src={Question}
            className="info-button bottom-right-fixed"
            iconAs={Icon}
            alt="More details"
            size="lg"
            onClick={() => setShowCollapsible(true)}
          />
        </OverlayTrigger>
      )}
    </>
  );
};
TourCollapsible.propTypes = {
  onboardingTourCompleted: bool,
  onboardingTourDismissed: bool,
  dismissOnboardingTour: func.isRequired,
};

const mapStateToProps = state => ({
  onboardingTourCompleted: state.enterpriseCustomerAdmin.onboardingTourCompleted,
  onboardingTourDismissed: state.enterpriseCustomerAdmin.onboardingTourDismissed,
});

const mapDispatchToProps = dispatch => ({
  dismissOnboardingTour: () => {
    dispatch(dismissOnboardingTour());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TourCollapsible);
