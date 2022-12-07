import React from 'react';
import { ActionRow } from '@edx/paragon';
import PropTypes from 'prop-types';
import ContentHighlightHelmet from './ContentHighlightHelmet';
import DeleteHighlightSet from './DeleteHighlightSet';

const CurrentContentHighlightItemsHeader = ({ highlightTitle }) => (
  <>
    <ContentHighlightHelmet title={`${highlightTitle} - Highlights`} />
    <ActionRow className="mb-4.5">
      <h2 className="m-0">
        {highlightTitle}
      </h2>
      <ActionRow.Spacer />
      <DeleteHighlightSet />
    </ActionRow>
  </>
);

CurrentContentHighlightItemsHeader.propTypes = {
  highlightTitle: PropTypes.string.isRequired,
};

export default CurrentContentHighlightItemsHeader;
