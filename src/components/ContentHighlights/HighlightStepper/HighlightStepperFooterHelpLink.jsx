import React from 'react';
import {
  Hyperlink,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useContextSelector } from 'use-context-selector';
import { connect } from 'react-redux';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import EVENT_NAMES from '../../../eventTracking';

const HighlightStepperFooterHelpLink = ({ enterpriseId }) => {
  const stepperModal = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal,
  );
  const trackEvent = () => {
    const trackInfo = {
      stepper_modal: {
        highlight_title: stepperModal.highlightTitle,
        current_selected_row_ids: stepperModal.currentSelectedRowIds,
        current_selected_row_ids_length: Object.keys(stepperModal.currentSelectedRowIds).length,
        is_stepper_modal_open: stepperModal.isOpen,
      },
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.STEPPER_HYPERLINK_CLICK}.clicked`,
      trackInfo,
    );
  };
  return (
    <div>
      <Hyperlink
        onClick={trackEvent}
        target="_blank"
        destination={process.env.ENTERPRISE_SUPPORT_PROGRAM_OPTIMIZATION_URL}
        className="small"
      >
        Help Center: Program Optimization
      </Hyperlink>
    </div>
  );
};

HighlightStepperFooterHelpLink.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(HighlightStepperFooterHelpLink);
