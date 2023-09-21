/* eslint-disable import/prefer-default-export */
import { hasFeatureFlagEnabled } from '@edx/frontend-enterprise-utils';
import { SEARCH_FACET_FILTERS } from '@edx/frontend-enterprise-catalog-search';

export const FEATURE_ENABLE_PROGRAMS = 'ENABLE_PROGRAMS';
export const FEATURE_PROGRAM_TYPE_FACET = 'ENABLE_PROGRAM_TYPE_FACET';
export const FEATURE_EXEC_ED_INCLUSION = 'ENABLE_EXEC_ED_INCLUSION';

const features = {
  ENABLE_PROGRAMS:
    process.env.FEATURE_ENABLE_PROGRAMS === 'true'
    || hasFeatureFlagEnabled(FEATURE_ENABLE_PROGRAMS),
  PROGRAM_TYPE_FACET:
    process.env.FEATURE_PROGRAM_TYPE_FACET === 'true'
    || hasFeatureFlagEnabled(FEATURE_PROGRAM_TYPE_FACET),
  EXEC_ED_INCLUSION:
    process.env.EXEC_ED_INCLUSION === 'true'
    || hasFeatureFlagEnabled(FEATURE_EXEC_ED_INCLUSION),
};

export const PAGE_TITLE = 'edX Enterprise Catalogs';

/**
 * Event names to use for tracking
 * Spec: https://openedx.atlassian.net/wiki/spaces/AN/pages/2624455676/Enterprise+public+catalog+Event+Design
 */
export const TRACKING_APP_NAME = 'admin-portal';
// end: tracking related
export const QUERY_TITLE_REFINEMENT = 'enterprise_catalog_query_titles';
export const AVAILABILITY_REFINEMENT = 'availability';
export const AVAILABILITY_REFINEMENT_DEFAULTS = [
  'Available Now',
  'Starting Soon',
  'Upcoming',
];

// Facet filters
export const CONTENT_TYPE_REFINEMENT = 'content_type';
export const COURSE_TYPE_REFINEMENT = 'course_type';
export const LEARNING_TYPE_REFINEMENT = 'learning_type';

// Page refinement settings
export const HIDE_CARDS_REFINEMENT = 'hide_cards';
export const HIDE_PRICE_REFINEMENT = 'hide_price';
export const NUM_RESULTS_PER_PAGE = 40;

// Learning types
export const CONTENT_TYPE_COURSE = 'course';
export const CONTENT_TYPE_PROGRAM = 'program';
export const EXEC_ED_TITLE = 'Executive Education';

// Page metric settings
export const NUM_RESULTS_PROGRAM = 4;
export const NUM_RESULTS_COURSE = 8;

export const COURSE_TITLE = 'Courses';
export const PROGRAM_TITLE = 'Programs';

export const NO_RESULTS_DECK_ITEM_COUNT = 4;
export const NO_RESULTS_PAGE_ITEM_COUNT = 1;
export const NO_RESULTS_PAGE_SIZE = 4;

// Descriptions
export const EDX_COURSE_TITLE_DESC = 'Self paced online learning from world-class academic institutions and corporate partners.';
export const TWOU_EXEC_ED_TITLE_DESC = 'Immersive, instructor led online short courses designed to develop interpersonal, analytical, and critical thinking skills.';
export const PROGRAM_TITLE_DESC = 'Multi-course bundled learning for skills mastery and to earn credentials such as Professional Certificates, MicroBachelors™, MicroMasters®, and Master’s Degrees.';

export const EXEC_COURSE_TYPE = 'executive-education-2u';

const OVERRIDE_FACET_FILTERS = [];
if (features.PROGRAM_TYPE_FACET) {
  const PROGRAM_TYPE_FACET_OVERRIDE = {
    overrideSearchKey: 'title',
    overrideSearchValue: 'Program',
    updatedFacetFilterValue: {
      attribute: 'program_type',
      title: 'Program',
      isSortedAlphabetical: true,
      typeaheadOptions: {
        placeholder: 'Find a program...',
        ariaLabel: 'Type to find a program',
        minLength: 3,
      },
    },
  };
  OVERRIDE_FACET_FILTERS.push(PROGRAM_TYPE_FACET_OVERRIDE);
}

OVERRIDE_FACET_FILTERS.forEach(
  ({ overrideSearchKey, overrideSearchValue, updatedFacetFilterValue }) => {
    SEARCH_FACET_FILTERS.find((facetFilter, index) => {
      if (facetFilter[overrideSearchKey] === overrideSearchValue) {
        SEARCH_FACET_FILTERS[index] = updatedFacetFilterValue;
        return true;
      }
      return false;
    });
  },
);

export { SEARCH_FACET_FILTERS };
