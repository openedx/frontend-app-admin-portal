import { Container } from '@edx/paragon';
import ContentHighlightsCardItemContainer from './ContentHighlightsCardItemsContainer';
import CurrentContentHighlightItemsHeader from './CurrentContentHighlightItemsHeader';

function ContentHighlightSet() {
  return (
    <Container fluid className="mt-5">
      <CurrentContentHighlightItemsHeader />
      <ContentHighlightsCardItemContainer />
    </Container>
  );
}

export default ContentHighlightSet;
