import React, { useContext } from 'react';
import {
  Button, ActionRow,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import ContentHighlightStepper from './HighlightStepper/ContentHighlightStepper';
import { ContentHighlightsContext } from './ContentHighlightsContext';

const CurrentContentHighlightHeader = () => {
  const {
    isModalOpen, setIsModalOpen,
  } = useContext(ContentHighlightsContext);

  return (
    <>
      <ActionRow>
        <h2 className="m-0">
          Highlight collections
        </h2>
        <ActionRow.Spacer />
        <Button
          iconBefore={Add}
          onClick={setIsModalOpen}
        >
          New
        </Button>
      </ActionRow>
      <p>
        Create up to 8 highlight collections for your learners.
      </p>
      <ContentHighlightStepper isOpen={isModalOpen} />
    </>
  );
};

export default CurrentContentHighlightHeader;
