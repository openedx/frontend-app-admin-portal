import React, { useState, useEffect, useContext } from 'react';
import {
  Button, ActionRow, Alert,
} from '@edx/paragon';
import { Add, Info } from '@edx/paragon/icons';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { useContentHighlightsContext } from './data/hooks';
import {
  BUTTON_TEXT, HEADER_TEXT, MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION, ALERT_TEXT,
} from './data/constants';

const CurrentContentHighlightHeader = () => {
  const {
    enterpriseCuration: {
      enterpriseCuration: {
        highlightSets,
      },
    },
  } = useContext(EnterpriseAppContext);
  const { openStepperModal } = useContentHighlightsContext();
  // Preliminiary logic for the header text given max sets reached
  const [maxHighlightsReached, setMaxHighlightsReached] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const createNewHighlight = () => {
    if (maxHighlightsReached) {
      setShowAlert(true);
    } else {
      openStepperModal();
    }
  };
  useEffect(() => {
    // using greater than or equal as an additional buffer as opposed to exactly equal
    if (highlightSets.length >= MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION) {
      setMaxHighlightsReached(true);
    } else {
      setMaxHighlightsReached(false);
    }
  }, [highlightSets, setMaxHighlightsReached]);

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
        show={showAlert}
        onClose={() => setShowAlert(false)}
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
export default CurrentContentHighlightHeader;
