import React from 'react';
import { Button, ActionRow } from '@edx/paragon';

function CurrentContentHighlightHeader() {
  return (
    <ActionRow className="mb-4.5">
      <h2 className="m-0">
        Active Highlights
      </h2>
      <ActionRow.Spacer />
      <Button>New Highlight</Button>
    </ActionRow>
  );
}

export default CurrentContentHighlightHeader;
