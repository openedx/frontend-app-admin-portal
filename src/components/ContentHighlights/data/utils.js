import { configuration } from '../../../config';
import { FOOTER_TEXT_BY_CONTENT_TYPE } from './constants';

// High Card logic for footer text
export const getContentHighlightCardFooter = ({ price, contentType }) => {
  const formattedContentType = FOOTER_TEXT_BY_CONTENT_TYPE[contentType?.toLowerCase()];
  if (!price) {
    return formattedContentType;
  }
  return `$${price} · ${formattedContentType}`;
};
// Generate URLs for about pages from the enterprise learner portal
export function generateAboutPageUrl({ enterpriseSlug, contentType, contentKey }) {
  const { ENTERPRISE_LEARNER_PORTAL_URL } = configuration;
  const aboutPageBase = `${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}`;
  if (contentType === 'learnerpathway') {
    return `${aboutPageBase}/search/${contentKey}`;
  }
  return `${aboutPageBase}/${contentType}/${contentKey}`;
}
