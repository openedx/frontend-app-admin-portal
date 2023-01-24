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
    confirmContent: (highlightTitle) => `Review content selections for "${highlightTitle}"`,
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
  SUB_TEXT: {
    currentContent: `Create up to ${MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION} highlights for your learners.`,
  },
};

// Button text extracted from constant to maintain passing test on changes
export const BUTTON_TEXT = {
  createNewHighlight: 'New',
  zeroStateCreateNewHighlight: 'New highlight',
};

// Button text for stepper help center button
export const STEPPER_HELP_CENTER_FOOTER_BUTTON_TEXT = 'Help Center: Program Optimization';

// Alert Text extracted from constant to maintain passing test on changes
export const ALERT_TEXT = {
  HEADER_TEXT: {
    currentContent: 'Highlight limit reached',
  },
  SUB_TEXT: {
    currentContent: 'Delete at least one highlight to create a new one.',
  },
  GLOBAL_ALERT_TEXT: {
    message: 'Are you sure? Your data will not be saved.',
  },
};

// Default footer values based on API response for ContentHighlightCardItem
export const FOOTER_TEXT_BY_CONTENT_TYPE = {
  course: 'Course',
  program: 'Program',
  learnerpathway: 'Pathway',
};

// Empty Content and Error Messages
export const DEFAULT_ERROR_MESSAGE = {
  EMPTY_HIGHLIGHT_SET: 'There is no highlighted content for this highlight collection.',
  // eslint-disable-next-line quotes
  EMPTY_SELECTEDROWIDS: `You don't have any highlighted content selected. Go back to the previous step to select content.`,
  EXCEEDS_HIGHLIGHT_TITLE_LENGTH: `Titles may only be ${MAX_HIGHLIGHT_TITLE_LENGTH} characters or less`,
};
