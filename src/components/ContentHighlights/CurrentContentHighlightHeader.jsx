
import React, { useContext, useState, useEffect } from 'react';

import {
  Button, ActionRow, Alert,
} from '@edx/paragon';

import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import { useContextSelector } from 'use-context-selector';
import { useContentHighlightsContext } from './data/hooks';
import { ContentHighlightsContext } from './ContentHighlightsContext';
import EVENT_NAMES from '../../eventTracking';

import { Add, Info } from '@edx/paragon/icons';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { useContentHighlightsContext } from './data/hooks';
import {
  BUTTON_TEXT, HEADER_TEXT, MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION, ALERT_TEXT,
} from './data/constants';

const CurrentContentHighlightHeader = ({ enterpriseId }) => {
  const {
    enterpriseCuration: {
      enterpriseCuration: {
        highlightSets,
      },
    },
  } = useContext(EnterpriseAppContext);
  const { openStepperModal } = useContentHighlightsContext();
  const isStepperModalOpen = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.isOpen);

  const [maxHighlightsReached, setMaxHighlightsReached] = useState(false);
  const [showMaxHighlightsAlert, setShowMaxHighlightsAlert] = useState(false);

  const createNewHighlight = () => {
    if (maxHighlightsReached) {
      setShowMaxHighlightsAlert(true);
    } else {
      openStepperModal();
      const trackInfo = {
      highlight_sets: highlightSets,
      number_of_highlight_sets: highlightSets.length,
      stepperModal: {
        is_stepper_modal_open: !isStepperModalOpen,
      },
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.NEW_HIGHLIGHT}.clicked`,
      trackInfo,
    );
    }
  };
  useEffect(() => {
    // using greater than or equal as an additional buffer as opposed to exactly equal
    if (highlightSets.length >= MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION) {
      setMaxHighlightsReached(true);
    } else {
      setMaxHighlightsReached(false);
    }
  }, [highlightSets]);

  return (
    <>
      <ActionRow>
        <h2 className="m-0">
          {HEADER_TEXT.currentContent}
        </h2>
        <ActionRow.Spacer />

        <Button
          iconBefore={Add}
          onClick={createNewHighlight}
        >
          {BUTTON_TEXT.createNewHighlight}
        </Button>
      </ActionRow>
      <p>
        {HEADER_TEXT.SUB_TEXT.currentContent}
      </p>
      <Alert
        variant="danger"
        icon={Info}
        dismissible
        closeLabel="Dismiss"
        show={showMaxHighlightsAlert}
        onClose={() => setShowMaxHighlightsAlert(false)}
      >
        <Alert.Heading>
          {ALERT_TEXT.HEADER_TEXT.currentContent}
        </Alert.Heading>
        <p>
          {ALERT_TEXT.SUB_TEXT.currentContent}
        </p>
      </Alert>
    </>
  );
};

CurrentContentHighlightHeader.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(CurrentContentHighlightHeader);
