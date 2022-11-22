import React, { useContext } from 'react';
import {
  Button, ActionRow,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { ContentHighlightsContext } from './ContentHighlightsContext';
import { toggleStepperModalAction } from './data/actions';

const CurrentContentHighlightHeader = () => {
  const { dispatch } = useContext(ContentHighlightsContext);
  return (
    <ActionRow>
      <h2 className="m-0">
        Highlights
      </h2>
      <ActionRow.Spacer />
      <Button
        iconBefore={Add}
        onClick={() => dispatch(toggleStepperModalAction({ isOpen: true }))}
      >
        New
      </Button>
    </ActionRow>
  );
};
export default CurrentContentHighlightHeader;
