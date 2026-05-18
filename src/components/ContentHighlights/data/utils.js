import { defineMessages } from '@edx/frontend-platform/i18n';
import { configuration } from '../../../config';

// Highlight Card logic for footer text
export const getContentHighlightCardFooter = ({ price, formattedContentType }) => {
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

// Shared highlight name error messages
export const highlightMessages = defineMessages({
  duplicateNameError: {
    id: 'highlights.highlight.name.duplicate.error',
    defaultMessage: 'A highlight with this name already exists. Please enter a unique name.',
    description: 'Error message when a highlight with the same name already exists.',
  },
  genericError: {
    id: 'highlights.highlight.name.generic.error.message',
    defaultMessage: "We're sorry. Something went wrong behind the scenes. Please try again, or reach out to customer support for help.",
    description: 'Generic error message when saving a highlight name fails.',
  },
});

// Checks for duplicate-name errors by matching the phrase
// "already exists" in validation messages.
export const isDuplicateNameApiError = (error) => (
  error?.response?.data?.title?.some?.(
    (msg) => msg.toLowerCase().includes('already exists'),
  ) || error?.response?.data?.non_field_errors?.some?.(
    (msg) => msg.toLowerCase().includes('already exists'),
  )
);

// Returns true if the trimmed title duplicates an existing one.
// Pass `excludeTitle` when editing to exclude the current title from the check.
export const hasDuplicateTitle = (trimmedTitle, existingTitles = [], excludeTitle = null) => (
  existingTitles.some((existing) => {
    const normalizedExisting = existing.toLowerCase();
    const normalizedNew = trimmedTitle.toLowerCase();
    const isMatch = normalizedExisting === normalizedNew;
    const isExcluded = excludeTitle && normalizedExisting === excludeTitle.toLowerCase();
    return isMatch && !isExcluded;
  })
);

export const getExistingHighlightTitles = (enterpriseCuration) => (
  (enterpriseCuration?.highlightSets || []).map((set) => set.title)
);
