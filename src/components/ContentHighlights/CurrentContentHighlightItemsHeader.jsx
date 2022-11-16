import React from 'react';
import { Button, ActionRow } from '@edx/paragon';
import { useParams } from 'react-router-dom';
import ContentHighlightHelmet from './ContentHighlightHelmet';

const CurrentContentHighlightItemsHeader = () => {
  const { highlightUUID } = useParams();

  const highlightTitle = highlightUUID;

  const titleName = `${highlightTitle} - Highlights`;

  return (
    <>
      <ContentHighlightHelmet title={titleName} />
      <ActionRow className="mb-4.5">
        <h2 className="m-0">
          {highlightTitle}
        </h2>
        <ActionRow.Spacer />
        <Button variant="outline-primary">Delete Highlight</Button>
      </ActionRow>
    </>
  );
};

export default CurrentContentHighlightItemsHeader;
