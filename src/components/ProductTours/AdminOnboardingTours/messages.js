import { defineMessages } from '@edx/frontend-platform/i18n';

export const TRACK_LEARNER_PROGRESS_TITLE = 'Track Learner Progress';
export const VIEW_ENROLLMENTS_INSIGHT_TITLE = 'View enrollment insights';

const messages = defineMessages({
  collapsibleTitle: {
    id: 'admin.portal.productTours.collapsible.title',
    defaultMessage: 'Quick Start Guide',
    description: 'Title for the product tours collapsible component.',
  },
  collapsibleIntro: {
    id: 'admin.portal.productTours.adminOnboarding.collapsible.intro',
    defaultMessage: 'Select any item in the guide to learn more about your administrative portal.',
    description: 'Introductory text at the top of the product tours collapsible component.',
  },
  questionIconTooltip: {
    id: 'admin.portal.productTours.adminOnboarding.questionIcon.Tooltip',
    defaultMessage: 'Quick Start Guide',
    description: 'Tooltip for the question icon in the product tours component.',
  },
  welcomeModalNewUserTitle: {
    id: 'admin.portal.productTours.adminOnboarding.welcomeModal.title.new',
    defaultMessage: 'Welcome!',
    description: 'Title for the welcome modal for new users.',
  },
  welcomeModalNewUserBody: {
    id: 'admin.portal.productTours.adminOnboarding.welcomeModal.body.new',
    defaultMessage: 'We\'re excited to show you the edX administrative portal.'
    + ' Use our {bold_tag}Quick Start Guide{bold_tag} to get step-by-step guidance on what our portal can do for you.',
    description: 'Body for the welcome modal for new users.',

  },
  welcomeModalExistingUserTitle: {
    id: 'admin.portal.productTours.adminOnboarding.welcomeModal.title.existing',
    defaultMessage: 'Hello!',
    description: 'Title for the welcome modal for existing users.',
  },
  welcomeModalExistingUserBody: {
    id: 'admin.portal.productTours.adminOnboarding.welcomeModal.body.existing',
    defaultMessage: 'We\'ve launched a new {bold_tag}Quick Start Guide{bold_tag}, which provides'
    + ' step-by-step guidance on what our portal can do for you.',
    description: 'Body for the welcome modal for existing users.',
  },
  dismissConfirmationBody: {
    id: 'admin.portal.productTours.adminOnboarding.dismiss.modal.body',
    defaultMessage: 'You haven\'t completed all the steps yet. You can revisit the guide anytime--just '
    + 'click the help icon in the bottom right corner.',
    description: 'Body for the dismiss confirmation modal.',
  },
  dismissConfirmationTitle: {
    id: 'admin.portal.productTours.adminOnboarding.dismiss.modal.title',
    defaultMessage: 'Are you sure?',
    description: 'Title for the dismiss confirmation modal.',
  },
  trackLearnerProgressStepOneTitle: {
    id: 'adminPortal.productTours.adminOnboarding.trackLearnerProgress.title.1',
    defaultMessage: TRACK_LEARNER_PROGRESS_TITLE,
    description: 'Title for the learner progress tracking step',
  },
  trackLearnerProgressStepOneBody: {
    id: 'adminPortal.productTours.adminOnboarding.trackLearnerProgress.body.1',
    defaultMessage: 'Track learner activity and progress across courses with the Learner Progress Report.',
    description: 'Description for the learner progress tracking step one',
  },
  trackLearnerProgressStepTwoBody: {
    id: 'adminPortal.productTours.adminOnboarding.trackLearnerProgress.body.2',
    defaultMessage: 'Get a high-level view of learner enrollments, course completions, and more.',
    description: 'Description for the learner progress tracking step two',
  },
  trackLearnerProgressStepThreeBody: {
    id: 'adminPortal.productTours.adminOnboarding.trackLearnerProgress.body.3',
    defaultMessage: 'Get a quick AI-generated overview of your learner analytics with just one click.',
    description: 'Description for the learner progress tracking step three',
  },
  trackLearnerProgressStepFourBody: {
    id: 'adminPortal.productTours.adminOnboarding.trackLearnerProgress.body.4',
    defaultMessage: 'Scroll down for a detailed, twice-daily updated progress report.',
    description: 'Description for the learner progress tracking step four',
  },
  trackLearnerProgressStepFiveBody: {
    id: 'adminPortal.productTours.adminOnboarding.trackLearnerProgress.body.5',
    defaultMessage: 'Access the full Learner Progress Report here.',
    description: 'Description for the learner progress tracking step five',
  },
  trackLearnerProgressStepSixBody: {
    id: 'adminPortal.productTours.adminOnboarding.trackLearnerProgress.body.6',
    defaultMessage: 'Filter results by course, start date, or learner email.',
    description: 'Description for the learner progress tracking step six',
  },
  trackLearnerProgressStepSevenBody: {
    id: 'adminPortal.productTours.adminOnboarding.trackLearnerProgress.body.7',
    defaultMessage: 'Export the report as a CSV to gain insights and organize data efficiently.',
    description: 'Description for the learner progress tracking step seven',
  },
  trackLearnerProgressStepEightBody: {
    id: 'adminPortal.productTours.adminOnboarding.trackLearnerProgress.body.8',
    defaultMessage: 'View module-level details for Executive Education courses.',
    description: 'Description for the learner progress tracking step eight',
  },
  viewEnrollmentInsights: {
    id: 'adminPortal.productTours.adminOnboarding.viewEnrollmentInsights.title.1',
    defaultMessage: VIEW_ENROLLMENTS_INSIGHT_TITLE,
    description: 'Title for the analytics step',
  },
  viewEnrollmentInsightsStepOneBody: {
    id: 'adminPortal.productTours.adminOnboarding.viewEnrollmentInsights.body.1',
    defaultMessage: 'Explore insights about your learners and their enrollments. '
    + 'Adjust date ranges, granularity, and analytics type to view data on enrollments, engagement '
    + 'completions, leaderboards, and skills tracking.',
    description: 'Description for the analytics tracking step one',
  },
  viewEnrollmentInsightsStepTwoBody: {
    id: 'adminPortal.productTours.adminOnboarding.viewEnrollmentInsights.body.2',
    defaultMessage: 'Adjust the date range and granularity to customize the data displayed below.',
    description: 'Description for the analytics tracking step two',
  },
  viewEnrollmentInsightsStepThreeBody: {
    id: 'adminPortal.productTours.adminOnboarding.viewEnrollmentInsights.body.3',
    defaultMessage: 'See quick metrics for Enrollments, Distinct Courses, Daily Sessions, Learning Hours, and '
    + 'completions at a glance.',
    description: 'Description for the analytics tracking step three',
  },
  viewEnrollmentInsightsStepFourBody: {
    id: 'adminPortal.productTours.adminOnboarding.viewEnrollmentInsights.body.4',
    defaultMessage: 'Use the Enrollments, Engagements, and Completions tabs to view learner activity from different '
    + 'perspectives. Scroll down for a breakdown of metrics by Course, Subject, and Individual.',
    description: 'Description for the analytics tracking step four',
  },
  viewEnrollmentInsightsStepFiveBody: {
    id: 'adminPortal.productTours.adminOnboarding.viewEnrollmentInsights.body.5',
    defaultMessage: 'See your top learners ranked by learning hours. Download the CSV for more detailed insights. Only '
    + 'learners who completed a course and at least one engagement activity are included',
    description: 'Description for the analytics tracking step five',
  },
  viewEnrollmentInsightsStepSixBody: {
    id: 'adminPortal.productTours.adminOnboarding.viewEnrollmentInsights.body.6',
    defaultMessage: 'Discover the most in-demand skills in your organization based on course enrollments and completions. '
    + 'Use these insights to understand learner interests and skill development trends.',
    description: 'Description for the analytics tracking step six',
  },
});

export default messages;
