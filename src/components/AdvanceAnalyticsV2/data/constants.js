export const advancedAnalyticsV2QueryKeys = {
  chartCSV: (enterpriseId, chartName) => [...advancedAnalyticsV2QueryKeys.all, 'chartCSV', enterpriseId, chartName],
};

export const CHART_TYPES = {
  // Charts types for Skills tab
  BUBBLE: 'bubble',
  TOP_SKILLS_ENROLLMENT: 'top_skills_enrollment',
  TOP_SKILLS_COMPLETION: 'top_skills_completion',

  // Charts types for Completions tab
  COMPLETIONS_OVER_TIME: 'completions_over_time',
  TOP_COURSES_BY_COMPLETIONS: 'top_courses_by_completions',
  TOP_SUBJECTS_BY_COMPLETIONS: 'top_subjects_by_completions',

  // Charts types for Enrollments tab
  ENROLLMENTS_OVER_TIME: 'enrollments_over_time',
  TOP_COURSES_BY_ENROLLMENTS: 'top_courses_by_enrollments',
  TOP_SUBJECTS_BY_ENROLLMENTS: 'top_subjects_by_enrollments',
  INDIVIDUAL_ENROLLMENTS: 'individual_enrollments',

  // Charts types for Engagements tab
  ENGAGEMENTS_OVER_TIME: 'engagements_over_time',
  TOP_COURSES_BY_ENGAGEMENTS: 'top_courses_by_engagements',
  TOP_SUBJECTS_BY_ENGAGEMENTS: 'top_subjects_by_engagements',
  INDIVIDUAL_ENGAGEMENTS: 'individual_engagements',
};

export const ANALYTICS_TABS = {
  SKILLS: 'skills',
  COMPLETIONS: 'completions',
  ENROLLMENTS: 'enrollments',
  LEADERBOARD: 'leaderboard',
  ENGAGEMENTS: 'engagements',
};

export const analyticsDataTableKeys = {
  leaderboard: 'leaderboardTable',
  enrollments: 'enrollmentsTable',
  engagements: 'engagementsTable',
  completions: 'completionsTable',
};

const analyticsDefaultKeys = ['admin-analytics'];

const generateKey = (key, enterpriseUUID, requestOptions) => [
  ...analyticsDefaultKeys,
  key,
  enterpriseUUID,
].concat(Object.values(requestOptions));

// Query Key factory for the admin analytics module, intended to be used with `@tanstack/react-query`.
// Inspired by https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories.
export const advanceAnalyticsQueryKeys = {
  all: analyticsDefaultKeys,
  skills: (enterpriseUUID, requestOptions) => (
    generateKey('skills', enterpriseUUID, requestOptions)
  ),
  completions: (enterpriseUUID, requestOptions) => (
    generateKey('completions', enterpriseUUID, requestOptions)
  ),
  engagements: (enterpriseUUID, requestOptions) => (
    generateKey('engagements', enterpriseUUID, requestOptions)
  ),
  enrollments: (enterpriseUUID, requestOptions) => (
    generateKey('enrollments', enterpriseUUID, requestOptions)
  ),
  enrollmentsTable: (enterpriseUUID, requestOptions) => (
    generateKey(analyticsDataTableKeys.enrollments, enterpriseUUID, requestOptions)
  ),
  engagementsTable: (enterpriseUUID, requestOptions) => (
    generateKey(analyticsDataTableKeys.engagements, enterpriseUUID, requestOptions)
  ),
  completionsTable: (enterpriseUUID, requestOptions) => (
    generateKey(analyticsDataTableKeys.completions, enterpriseUUID, requestOptions)
  ),
  leaderboardTable: (enterpriseUUID, requestOptions) => (
    generateKey(analyticsDataTableKeys.leaderboard, enterpriseUUID, requestOptions)
  ),
  aggregates: (enterpriseUUID, requestOptions) => (
    generateKey('aggregates', enterpriseUUID, requestOptions)
  ),
};

export const skillsColorMap = {
  'business-management': '#4A1D90',
  communication: '#DCD6F7',
  'computer-science': '#BE219A',
  'data-analysis-statistics': '#F27A68',
  engineering: '#E7D39A',
  other: 'grey',
};

export const skillsTypeColorMap = {
  'Common Skill': '#6574A6',
  'Specialized Skill': '#FEAF00',
  'Hard Skill': '#DC267F',
  'Soft Skill': '#638FFF',
  Certification: '#FE6100',
};

export const chartColorMap = { certificate: '#3669C9', audit: '#06262B' };
