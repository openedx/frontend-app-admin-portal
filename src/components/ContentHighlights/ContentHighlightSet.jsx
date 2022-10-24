import { Container } from '@edx/paragon';
import ContentHighlightsCardItemContainer from './ContentHighlightsCardItemsContainer';
import CurrentContentHighlightItemsHeader from './CurrentContentHighlightItemsHeader';

const ContentHighlightSet = () => (
  // use Params, get
  <Container fluid>
    <CurrentContentHighlightItemsHeader />
    <ContentHighlightsCardItemContainer />
  </Container>
);

export default ContentHighlightSet;
