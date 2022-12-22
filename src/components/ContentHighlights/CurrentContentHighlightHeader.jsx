import React, { useContext, useState, useEffect } from 'react';
import {
  Button, ActionRow,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import { useContextSelector } from 'use-context-selector';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { useContentHighlightsContext } from './data/hooks';
import {
  BUTTON_TEXT, HEADER_TEXT, MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION,
} from './data/constants';
import { ContentHighlightsContext } from './ContentHighlightsContext';
import EVENT_NAMES from '../../eventTracking';

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
  const handleNewHighlightClick = () => {
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
  };
    // Preliminiary logic for the header text given max sets reached
  const [maxHighlightsReached, setMaxHighlightsReached] = useState(false);
  const [headerSubText, setHeaderSubtext] = useState('');
  useEffect(() => {
    if (highlightSets.length === MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION) {
      setHeaderSubtext(HEADER_TEXT.SUB_TEXT.maxHighlightsReached);
      setMaxHighlightsReached(true);
    } else {
      setHeaderSubtext(HEADER_TEXT.SUB_TEXT.maxHighlights);
      setMaxHighlightsReached(false);
    }
  }, [highlightSets, setHeaderSubtext, setMaxHighlightsReached]);

  return (
    <>
      <ActionRow>
        <h2 className="m-0">
          {HEADER_TEXT.currentContent}
        </h2>
        <ActionRow.Spacer />
        {!maxHighlightsReached && (
        <Button
          iconBefore={Add}
          onClick={handleNewHighlightClick}
        >
          {BUTTON_TEXT.createNewHighlight}
        </Button>
        )}
      </ActionRow>
      <p>
        {headerSubText}
      </p>
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
