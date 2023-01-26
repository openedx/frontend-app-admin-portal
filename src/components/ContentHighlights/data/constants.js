/* eslint-disable import/no-extraneous-dependencies */
import parse from 'html-react-parser';
import sanitizeHTML from 'sanitize-html';
/* eslint-enable import/no-extraneous-dependencies */

// Sanitizes HTML and parses the string as HTML
export const sanitizeAndParseHTML = (htmlString) => {
  const sanitizedHTML = sanitizeHTML(htmlString);
  return parse(sanitizedHTML);
};

/* START LOCAL TESTING CONSTANTS */
// Set to false before pushing PR!! otherwise set to true to enable local testing of ContentHighlights components
// Test will fail as additional check to ensure this is set to false before pushing PR
export const TEST_FLAG = false;
// Test entepriseId for Content Highlights to display card selections and confirmation
export const testEnterpriseId = 'f23ccd7d-fbbb-411a-824e-c2861942aac0';
// function that passes through enterpriseId if TEST_FLAG is false, otherwise returns local testing enterpriseId
export const ENABLE_TESTING = (enterpriseId, enableTest = TEST_FLAG) => {
  if (enableTest) {
    return testEnterpriseId;
  }
  return enterpriseId;
};
/* END LOCAL TESTING CONSTANTS */

// Default Card Grid columnSizes
export const HIGHLIGHTS_CARD_GRID_COLUMN_SIZES = {
  xs: 12,
  md: 6,
  lg: 4,
  xl: 3,
};

// Tab titles
export const TAB_TITLES = {
  highlights: 'Highlights',
  catalogVisibility: 'Catalog Visibility',
};

// Max length of highlight title in stepper
export const MAX_HIGHLIGHT_TITLE_LENGTH = 60;

// Max highlight sets per enteprise curation
export const MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION = 8;

// Max number of content items per highlight set
export const MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET = 12;

// Max number of content items displayed from search results
export const MAX_PAGE_SIZE = 24;

// Stepper Step Labels
export const STEPPER_STEP_LABELS = {
  CREATE_TITLE: 'Create a title',
  SELECT_CONTENT: 'Select content',
  CONFIRM_PUBLISH: 'Confirm and publish',
};

// Stepper Step Text that match testing components
export const STEPPER_STEP_TEXT = {
  HEADER_TEXT: {
    createTitle: 'Create a title for your highlight',
    selectContent: 'Add content to your highlight',
    confirmContent: 'Confirm your selections',
  },
  SUB_TEXT: {
    createTitle: `Create a unique title for your highlight. This title is visible
                  to your learners and helps them navigate to relevant content.`,
    selectContent: (highlightTitle) => sanitizeAndParseHTML(`Select up to <strong>${MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET}</strong> items for "${highlightTitle}".
                                              Courses in learners&apos; portal appear in the order of selection.`),
    confirmContent: (highlightTitle) => `Review content selections for "${highlightTitle}"`,
  },
  PRO_TIP_TEXT: {
    createTitle: `Pro tip: we recommend naming your highlight collection to reflect skills
              it aims to develop, or to draw the attention of specific groups it targets.
              For example, "Recommended for Marketing" or "Develop Leadership Skills".`,
    selectContent: `Pro tip: a highlight can include courses similar to each other for your learners to choose from,
                    or courses that vary in subtopics to help your learners master a larger topic`,
  },
  ALERT_MODAL_TEXT: {
    title: 'Lose Progress?',
    content: 'If you exit now, any changes you\'ve made will be lost.',
    buttons: {
      exit: 'Exit',
      cancel: 'Cancel',
    },
  },
};

// Header text extracted into constant to maintain passing test on changes
export const HEADER_TEXT = {
  currentContent: 'Highlights',
  catalogVisibility: 'Catalog Visibility',
  zeroStateHighlights: 'You haven\'t created any highlights yet.',
  SUB_TEXT: {
    catalogVisibility: 'Choose a visibility for your catalog.',
    currentContent: `Create up to ${MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION} highlights for your learners.`,
    zeroStateHighlights: 'Create and recommend content collections to your learners, enabling them to quickly locate content relevant to them.',
  },
  PRO_TIP_TEXT: {
    catalogVisibility: 'Pro tip: regardless of your choice, learners will be able to see all highlight collections.',
  },
};

// Button text extracted from constant to maintain passing test on changes
export const BUTTON_TEXT = {
  createNewHighlight: 'New',
  catalogVisibility: 'New highlight',
  zeroStateCreateNewHighlight: 'New highlight',
  catalogVisibilityRadio1: 'Learners can view and enroll into all courses in your catalog',
  catalogVisibilityRadio2: 'Learners can only view and enroll into highlighted courses',
};

// Button text for stepper help center button
export const STEPPER_HELP_CENTER_FOOTER_BUTTON_TEXT = 'Help Center: Program Optimization';

// Alert Text extracted from constant to maintain passing test on changes
export const ALERT_TEXT = {
  HEADER_TEXT: {
    catalogVisibility: 'No highlights created',
    catalogVisibilityAPI: 'Catalog visibility not updated',
    currentContent: 'Highlight limit reached',
  },
  SUB_TEXT: {
    catalogVisibility: 'At least one highlight has to be created to make a selection',
    catalogVisibilityAPI: 'Something went wrong when updating your setting. Please try again.',
    currentContent: 'Delete at least one highlight to create a new one.',
  },
  GLOBAL_ALERT_TEXT: {
    message: 'Are you sure? Your data will not be saved.',
  },
  TOAST_TEXT: {
    catalogVisibility: 'Catalog visibility settings updated.',
  },
};

// Default footer values based on API response for ContentHighlightCardItem
export const FOOTER_TEXT_BY_CONTENT_TYPE = {
  course: 'Course',
  program: 'Program',
  learnerpathway: 'Pathway',
};

export const LEARNER_PORTAL_CATALOG_VISIBILITY = {
  ALL_CONTENT: {
    value: 'ALL_CONTENT',
    canOnlyViewHighlightSets: false,
  },
  HIGHLIGHTED_CONTENT: {
    value: 'HIGHLIGHTED_CONTENT',
    canOnlyViewHighlightSets: true,
  },
};

// Empty Content and Error Messages
export const DEFAULT_ERROR_MESSAGE = {
  EMPTY_HIGHLIGHT_SET: 'There is no highlighted content for this highlight collection.',
  // eslint-disable-next-line quotes
  EMPTY_SELECTEDROWIDS: `You don't have any highlighted content selected. Go back to the previous step to select content.`,
  EXCEEDS_HIGHLIGHT_TITLE_LENGTH: `Titles may only be ${MAX_HIGHLIGHT_TITLE_LENGTH} characters or less`,
};
