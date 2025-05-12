import React, { useState } from 'react';
import { bool } from 'prop-types';
import { connect } from 'react-redux';

import {
  IconButton, Icon, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import { Question } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import FloatingCollapsible from '../FloatingCollapsible';
import messages from './messages';

const TourCollapsible = ({ onboardingTourCompleted = true, onboardingTourDismissed = true }) => {
  const intl = useIntl();
  const [collapsibleOpen, setCollapsibleOpen] = useState(!onboardingTourCompleted && !onboardingTourDismissed);
  return (
    <>
      {collapsibleOpen && (
      <FloatingCollapsible>
        <div>Product Tours Checklist</div>
      </FloatingCollapsible>
      )}
      {!collapsibleOpen && (
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
            onClick={() => setCollapsibleOpen(true)}
          />
        </OverlayTrigger>
      )}
    </>
  );
};
TourCollapsible.propTypes = {
  onboardingTourCompleted: bool,
  onboardingTourDismissed: bool,
};

const mapStateToProps = state => ({
  onboardingTourCompleted: state.enterpriseCustomerAdmin.onboardingTourCompleted,
  onboardingTourDismissed: state.enterpriseCustomerAdmin.onboardingTourDismissed,
});

export default connect(mapStateToProps)(TourCollapsible);
