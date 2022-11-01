import React, { useContext } from 'react';
import {
  Button, ActionRow,
} from '@edx/paragon';
import ContentHighlightStepper from './HighlightStepper/ContentHighlightStepper';
import { ContentHighlightsContext } from './ContentHighlightsContext';

const CurrentContentHighlightHeader = () => {
  const {
    isModalOpen, setIsModalOpen,
  } = useContext(ContentHighlightsContext);
  return (
    <>
      <ActionRow className="mb-4.5">
        <h2 className="m-0">
          Active Highlights
        </h2>
        <ActionRow.Spacer />
        <Button onClick={() => setIsModalOpen(true)}>New Highlight</Button>
      </ActionRow>
      <ContentHighlightStepper isOpen={isModalOpen} />
    </>
  );
};

export default CurrentContentHighlightHeader;
