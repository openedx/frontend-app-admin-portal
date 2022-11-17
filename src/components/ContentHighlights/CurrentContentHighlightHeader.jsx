import React, { useContext } from 'react';
import {
  Button, ActionRow,
} from '@edx/paragon';
import ContentHighlightStepper from './HighlightStepper/ContentHighlightStepper';
import { ContentHighlightsContext } from './ContentHighlightsContext';
import { toggleStepperModalAction } from './data/actions';

const CurrentContentHighlightHeader = () => {
  const { dispatch, stepperModal: { isOpen } } = useContext(ContentHighlightsContext);

  return (
    <>
      <ActionRow>
        <h2 className="m-0">
          Highlight collections
        </h2>
        <ActionRow.Spacer />
        <Button
          onClick={
            () => {
              dispatch(toggleStepperModalAction({ isOpen: true }));
            }
          }
        >
          New Highlight
        </Button>
      </ActionRow>
      <ContentHighlightStepper isModalOpen={isOpen} />
    </>
  );
};
export default CurrentContentHighlightHeader;
