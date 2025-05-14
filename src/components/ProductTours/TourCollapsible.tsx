import React, { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import {
  IconButton, Icon, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import { Question } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import FloatingCollapsible from '../FloatingCollapsible';
import messages from './messages';
import { dismissOnboardingTour, reopenOnboardingTour } from '../../data/actions/enterpriseCustomerAdmin';

interface Props {
  onboardingTourCompleted: boolean;
  onboardingTourDismissed: boolean;
  dismissOnboardingTour: () => void;
  reopenOnboardingTour: () => void;
}

const TourCollapsible: FC<Props> = (
  {
    onboardingTourCompleted = true,
    onboardingTourDismissed = true,
    dismissOnboardingTour: dismissTour,
    reopenOnboardingTour: reopenTour,
  },
) => {
  const intl = useIntl();
  const [showCollapsible, setShowCollapsible] = useState(!onboardingTourCompleted && !onboardingTourDismissed);

  const handleDismiss = () => {
    setShowCollapsible(false);
    dismissTour();
  };

  const handleReopenTour = () => {
    setShowCollapsible(true);
    reopenTour();
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
            onClick={handleReopenTour}
          />
        </OverlayTrigger>
      )}
    </>
  );
};

const mapStateToProps = state => ({
  onboardingTourCompleted: state.enterpriseCustomerAdmin.onboardingTourCompleted as boolean,
  onboardingTourDismissed: state.enterpriseCustomerAdmin.onboardingTourDismissed as boolean,
});

const mapDispatchToProps = dispatch => ({
  dismissOnboardingTour: () => {
    dispatch(dismissOnboardingTour());
  },
  reopenOnboardingTour: () => {
    dispatch(reopenOnboardingTour());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TourCollapsible);
