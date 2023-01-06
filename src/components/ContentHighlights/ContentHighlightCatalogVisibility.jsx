import { Container } from '@edx/paragon';
import PropTypes from 'prop-types';
import ContentHighlightCatalogVisibilityAlert from './ContentHighlightCatalogVisibilityAlert';
import ContentHighlightCatalogVisibilityHeader from './ContentHighlightCatalogVisibilityHeader';
import ContentHighlightCatalogVisibilityRadioInput from './ContentHighlightCatalogVisibilityRadioInput';

const ContentHighlightCatalogVisibility = ({ createdSet }) => (
  <Container>
    <ContentHighlightCatalogVisibilityHeader />
    {!createdSet && <ContentHighlightCatalogVisibilityAlert />}
    <ContentHighlightCatalogVisibilityRadioInput />
  </Container>
);

ContentHighlightCatalogVisibility.propTypes = {
  createdSet: PropTypes.bool.isRequired,
};

export default ContentHighlightCatalogVisibility;
