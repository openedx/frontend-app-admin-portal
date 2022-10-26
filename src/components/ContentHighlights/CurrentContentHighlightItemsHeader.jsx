import React, { useState } from 'react';
import { Button, ActionRow } from '@edx/paragon';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { TEST_COURSE_HIGHLIHTS_DATA } from './data/constants';

const CurrentContentHighlightItemsHeader = () => {
  const { highlightUUID } = useParams();
  const [highlightTitle] = useState(TEST_COURSE_HIGHLIHTS_DATA.filter(
    highlights => highlights.uuid === highlightUUID,
  )[0].title);

  if (!highlightTitle) {
    return null;
  }

  const titleName = `${highlightTitle} - Highlights`;

  return (
    <>
      <Helmet>
        <title>{titleName}</title>
      </Helmet>
      <ActionRow className="mb-4.5">
        <h2 className="m-0">
          {highlightTitle}
        </h2>
        <ActionRow.Spacer />
        <Button>Delete Highlight</Button>
      </ActionRow>
    </>
  );
};

export default CurrentContentHighlightItemsHeader;
