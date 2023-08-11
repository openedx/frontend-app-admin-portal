import { configuration } from '../../../config';
import { ALERT_TEXT, FOOTER_TEXT_BY_CONTENT_TYPE } from './constants';

// Highlight Card logic for footer text
export const getContentHighlightCardFooter = ({ price, contentType }) => {
  const formattedContentType = FOOTER_TEXT_BY_CONTENT_TYPE[contentType?.toLowerCase()];
  if (!price) {
    return formattedContentType;
  }
  return `$${price} · ${formattedContentType}`;
};

// Generate URLs for about pages from the enterprise learner portal
export function generateAboutPageUrl({ enterpriseSlug, contentType, contentKey }) {
  if (!contentType || !contentKey) {
    return undefined;
  }
  const { ENTERPRISE_LEARNER_PORTAL_URL } = configuration;
  const aboutPageBase = `${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}`;
  if (contentType === 'learnerpathway') {
    return `${aboutPageBase}/search/${contentKey}`;
  }
  return `${aboutPageBase}/${contentType}/${contentKey}`;
}

export function extractHighlightSetUUID(highlightSets) {
  return highlightSets.map((set) => set.uuid);
}

export function preventUnload(e) {
  e.preventDefault();
  e.returnValue = ALERT_TEXT.GLOBAL_ALERT_TEXT.message;
}
