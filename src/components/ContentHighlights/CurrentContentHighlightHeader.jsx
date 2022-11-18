import React, { useContext } from 'react';
import {
  Button, ActionRow,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import ContentHighlightStepper from './HighlightStepper/ContentHighlightStepper';
import { ContentHighlightsContext } from './ContentHighlightsContext';

function CurrentContentHighlightHeader() {
  const {
    isModalOpen, setIsModalOpen,
  } = useContext(ContentHighlightsContext);

  const handleNewClick = () => {
    setIsModalOpen(prevState => !prevState);
  };

  return (
    <>
      <ActionRow>
        <h2 className="m-0">
          Highlight collections
        </h2>
        <ActionRow.Spacer />
        <Button
          iconBefore={Add}
          onClick={handleNewClick}
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
}

export default CurrentContentHighlightHeader;
