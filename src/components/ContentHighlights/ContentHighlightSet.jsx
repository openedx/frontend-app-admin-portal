import { Container } from '@edx/paragon';
import ContentHighlightSetContent from './ContentHighlightsCardItemsContainer';
import ContentHighlightSetHeader from './CurrentContentHighlightItemsHeader';

const ContentHighlightSet = () => (
  <>
    <Container fluid className="mt-5">
      <ContentHighlightSetHeader />
      <ContentHighlightSetContent />
    </Container>
  </>
);

export default ContentHighlightSet;
