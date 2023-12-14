import React from 'react';
import { ActionRow, Skeleton } from '@openedx/paragon';
import PropTypes from 'prop-types';
import ContentHighlightHelmet from './ContentHighlightHelmet';
import DeleteHighlightSet from './DeleteHighlightSet';

const CurrentContentHighlightItemsHeader = ({ isLoading, highlightTitle }) => {
  if (isLoading) {
    return (
      <ActionRow data-testid="header-skeleton">
        <h2><Skeleton /></h2>
        <ActionRow.Spacer />
        <Skeleton />
      </ActionRow>
    );
  }
  return (
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
};

CurrentContentHighlightItemsHeader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  highlightTitle: PropTypes.string.isRequired,
};

export default CurrentContentHighlightItemsHeader;
