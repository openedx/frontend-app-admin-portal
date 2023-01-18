import { Container } from '@edx/paragon';
import ContentHighlightCatalogVisibilityAlert from './ContentHighlightCatalogVisibilityAlert';
import ContentHighlightCatalogVisibilityHeader from './ContentHighlightCatalogVisibilityHeader';
import ContentHighlightCatalogVisibilityRadioInput from './ContentHighlightCatalogVisibilityRadioInput';

const ContentHighlightCatalogVisibility = () => (
  <Container>
    <ContentHighlightCatalogVisibilityHeader />
    <ContentHighlightCatalogVisibilityAlert />
    <ContentHighlightCatalogVisibilityRadioInput />
  </Container>
);

export default ContentHighlightCatalogVisibility;
