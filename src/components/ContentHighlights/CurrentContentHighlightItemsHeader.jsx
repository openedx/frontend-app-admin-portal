import React from 'react';
import { ActionRow } from '@edx/paragon';
import { useParams } from 'react-router-dom';
import ContentHighlightHelmet from './ContentHighlightHelmet';
import DeleteHighlightSet from './DeleteHighlightSet';

const CurrentContentHighlightItemsHeader = () => {
  const { highlightSetUUID } = useParams();

  const highlightTitle = highlightSetUUID;

  const titleName = `${highlightTitle} - Highlights`;

  return (
    <>
      <ContentHighlightHelmet title={titleName} />
      <ActionRow className="mb-4.5">
        <h2 className="m-0">
          {highlightTitle}
        </h2>
        <ActionRow.Spacer />
        <DeleteHighlightSet />
      </ActionRow>
    </>
  );
};

export default CurrentContentHighlightItemsHeader;
