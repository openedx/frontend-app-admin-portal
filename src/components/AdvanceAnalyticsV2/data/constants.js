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
