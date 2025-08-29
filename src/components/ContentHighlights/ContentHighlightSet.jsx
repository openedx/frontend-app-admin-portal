import { Container } from '@openedx/paragon';
import { useParams } from 'react-router-dom';
import React from 'react';
import ContentHighlightsCardItemContainer from './ContentHighlightsCardItemsContainer';
import CurrentContentHighlightItemsHeader from './CurrentContentHighlightItemsHeader';
import { useHighlightSet } from './data/hooks';

const ContentHighlightSet = () => {
  const { highlightSetUUID } = useParams();
  const { highlightSet, isLoading, updateHighlightSet } = useHighlightSet(highlightSetUUID);
  return (
    <Container className="mt-5">
      <CurrentContentHighlightItemsHeader isLoading={isLoading} highlightTitle={highlightSet?.title} />
      <ContentHighlightsCardItemContainer
        isLoading={isLoading}
        highlightedContent={highlightSet?.highlightedContent}
        updateHighlightSet={updateHighlightSet}
      />
    </Container>
  );
};

export default ContentHighlightSet;
