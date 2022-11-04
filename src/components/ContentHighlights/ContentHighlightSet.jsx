import { Container } from '@edx/paragon';
import ContentHighlightsCardItemContainer from './ContentHighlightsCardItemsContainer';
import CurrentContentHighlightItemsHeader from './CurrentContentHighlightItemsHeader';

const ContentHighlightSet = () => (
  <>
    <Container fluid>
      <CurrentContentHighlightItemsHeader />
      <ContentHighlightsCardItemContainer />
    </Container>
  </>
);

export default ContentHighlightSet;
