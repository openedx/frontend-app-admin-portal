import React from 'react';
import {
  Button, ActionRow,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';

import { useContentHighlightsContext } from './data/hooks';

const CurrentContentHighlightHeader = () => {
  const { openStepperModal } = useContentHighlightsContext();

  return (
    <ActionRow>
      <h2 className="m-0">
        Highlights
      </h2>
      <ActionRow.Spacer />
      <Button
        iconBefore={Add}
        onClick={openStepperModal}
      >
        New
      </Button>
    </ActionRow>
  );
};
export default CurrentContentHighlightHeader;
