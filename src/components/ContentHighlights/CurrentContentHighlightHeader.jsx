import React from 'react';
import {
  Button, ActionRow,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';

import { useContentHighlightsContext } from './data/hooks';
import { BUTTON_TEXT, HEADER_TEXT } from './data/constants';

const CurrentContentHighlightHeader = () => {
  const { openStepperModal } = useContentHighlightsContext();

  return (
    <ActionRow>
      <h2 className="m-0">
        {HEADER_TEXT.currentContent}
      </h2>
      <ActionRow.Spacer />
      <Button
        iconBefore={Add}
        onClick={openStepperModal}
      >
        {BUTTON_TEXT.createNewHighlight}
      </Button>
    </ActionRow>
  );
};
export default CurrentContentHighlightHeader;
