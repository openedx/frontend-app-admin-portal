import { Container } from '@edx/paragon';
import { useParams } from 'react-router-dom';
import React from 'react';
import ContentHighlightsCardItemContainer from './ContentHighlightsCardItemsContainer';
import CurrentContentHighlightItemsHeader from './CurrentContentHighlightItemsHeader';
import { useHighlightSetItems } from './data/hooks';

const ContentHighlightSet = () => {
  // const { enterpriseCuration: { enterpriseCuration } } = useContext(EnterpriseAppContext);
  const { highlightSetUUID } = useParams();
  const { highlightSetItems } = useHighlightSetItems(highlightSetUUID);
  return (
    <Container fluid className="mt-5">
      <CurrentContentHighlightItemsHeader highlightTitle={highlightSetItems?.title} />
      <ContentHighlightsCardItemContainer highlightedContent={highlightSetItems?.highlightedContent} />
    </Container>
  );
};

export default ContentHighlightSet;
