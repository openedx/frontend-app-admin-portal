import { Container } from '@edx/paragon';
import { useParams } from 'react-router-dom';
import React from 'react';
import ContentHighlightsCardItemContainer from './ContentHighlightsCardItemsContainer';
import CurrentContentHighlightItemsHeader from './CurrentContentHighlightItemsHeader';
import { useHighlightSet } from './data/hooks';

const ContentHighlightSet = () => {
  const { highlightSetUUID } = useParams();
  const { highlightSet, isLoading } = useHighlightSet(highlightSetUUID);
  return (
    <Container fluid className="mt-5">
      <CurrentContentHighlightItemsHeader isLoading={isLoading} highlightTitle={highlightSet?.title} />
      <ContentHighlightsCardItemContainer isLoading={isLoading} highlightedContent={highlightSet?.highlightedContent} />
    </Container>
  );
};

export default ContentHighlightSet;
