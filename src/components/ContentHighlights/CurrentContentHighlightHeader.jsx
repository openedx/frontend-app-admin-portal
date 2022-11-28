import React from 'react';
import { useContextSelector } from 'use-context-selector';
import {
  Button, ActionRow,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';

import { ContentHighlightsContext } from './ContentHighlightsContext';

const CurrentContentHighlightHeader = () => {
  const setState = useContextSelector(ContentHighlightsContext, v => v[1]);

  const openHighlightStepperModal = () => setState(s => ({
    ...s,
    stepperModal: {
      ...s.stepperModal,
      isOpen: true,
    },
  }));

  return (
    <ActionRow>
      <h2 className="m-0">
        Highlights
      </h2>
      <ActionRow.Spacer />
      <Button
        iconBefore={Add}
        onClick={openHighlightStepperModal}
      >
        New
      </Button>
    </ActionRow>
  );
};
export default CurrentContentHighlightHeader;
