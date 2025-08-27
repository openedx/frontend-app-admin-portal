import { defineMessages } from '@edx/frontend-platform/i18n';

export const ORGANIZE_LEARNERS_TITLE = 'Organize learners';
export const TRACK_LEARNER_PROGRESS_TITLE = 'Track Learner Progress';
export const VIEW_ENROLLMENTS_INSIGHT_TITLE = 'View enrollment insights';
export const ADMINISTER_SUBSCRIPTIONS_TITLE = 'Administer subscriptions';
export const ALLOCATE_LEARNING_BUDGET_TITLE = 'Allocate learning budget';
export const CUSTOMIZE_REPORTS_TITLE = 'Customize Reports';
export const SET_UP_PREFERENCES_TITLE = 'Set Up Preferences';

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
  organizeLearnersStepOneTitle: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.title.1',
    defaultMessage: ORGANIZE_LEARNERS_TITLE,
    description: 'Title for the organize learners flow step one',
  },
  organizeLearnersStepOneBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.body.1',
    defaultMessage: 'Create learner groups, view all learners in your organization, and access individual learner profiles—all in one place.',
    description: 'Description for the organize learners flow step one',
  },
  organizeLearnersStepOneNoMembersBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.noLearners.body.1',
    defaultMessage: 'Once learners join the organization, you can create learner groups, view all learners in your organization, and access individual learner profiles—all in one place.',
    description: 'Description for the organize learners flow step one if there are no enterprise members',
  },
  organizeLearnersStepTwoBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.body.2',
    defaultMessage: 'View all learners in your organization. Search by name and access profiles to track progress and view learning access.',
    description: 'Description for the organize learners flow step two',
  },
  organizeLearnersStepThreeBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.body.3',
    defaultMessage: '"View more" allows you to see the learner\'s full profile with enrollments, access type, and group'
    + ' memberships at a glance.',
    description: 'Description for the organize learners flow step three',
  },
  organizeLearnersStepFourBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.body.4',
    defaultMessage: 'Organize learners by creating groups for tracking and assignments.',
    description: 'Description for the organize learners flow step four',
  },
  organizeLearnersStepFiveBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.body.5',
    defaultMessage: 'When you\'re ready, use "Create Group" to get started.',
    description: 'Description for the organize learners flow step five',
  },
  organizeLearnersWithGroupsStepFourBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.withGroups.body.4',
    defaultMessage: 'View, manage, and create your learner groups here.',
    description: 'Description for the organize learners flow with groups step four',
  },
  organizeLearnersWithGroupsStepFiveBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.withGroups.body.5',
    defaultMessage: '“Create Group" allows you to add more learner groups.',
    description: 'Description for the organize learners flow with groups step five',
  },
  organizeLearnersWithGroupsStepSixBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.withGroups.body.6',
    defaultMessage: '"View group" allows you to edit group details, add and remove learners, or track learner\'s progress.',
    description: 'Description for the organize learners flow with groups step six',
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

  administerSubscriptionsTitle: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.title',
    defaultMessage: ADMINISTER_SUBSCRIPTIONS_TITLE,
    description: 'Title for the administer subscriptions step',
  },
  administerSubscriptionsStepOneBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.1',
    defaultMessage: 'Manage your subscription plans and give learners access to self-enroll in courses. '
    + 'Invite learners, track, usage, and manage licenses--all in one place.',
    description: 'Description for the administer subscriptions flow step one',
  },
  administerSubscriptionsStepTwoBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.2',
    defaultMessage: 'The list below shows active and expired subscription plans for you to view and manage.',
    description: 'Description for the administer subscriptions flow step two',
  },
  administerSubscriptionsStepThreeBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.3',
    defaultMessage: '"Manage learners" allows you to view more details about a plan. Let\'s view your learners now.',
    description: 'Description for the administer subscriptions flow step three',
  },
  administerSubscriptionsStepFourBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.4',
    defaultMessage: 'On the subscription plan details page, you can check the expiration date, invite learners, and manage licenses.',
    description: 'Description for the administer subscriptions flow step four',
  },
  administerSubscriptionsStepFiveBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.5',
    defaultMessage: '"Invite Learners" allows you to invite learners to your subscription plan.',
    description: 'Description for the administer subscriptions flow step five',
  },
  administerSubscriptionsStepSixBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.6',
    defaultMessage: 'The License Allocation section lets you see invited learners, track license status, and revoke licenses as needed.',
    description: 'Description for the administer subscriptions flow step six',
  },
  administerSubscriptionsStepSevenBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.7',
    defaultMessage: 'Use filters to sort invited learners by license status or search by email address.',
    description: 'Description for the administer subscriptions flow step seven',
  },
  administerSubscriptionsStepEightBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.8',
    defaultMessage: 'To view more plans, navigate back to Subscription Management using this button or the main menu.',
    description: 'Description for the administer subscriptions flow step eight',
  },
  allocateLearningBudgetTitle: {
    id: 'adminPortal.productTours.adminOnboarding.allocateLearningBudget.title',
    defaultMessage: ALLOCATE_LEARNING_BUDGET_TITLE,
    description: 'Description for the allocate learning budgets flow step one title',
  },
  allocateLearningBudgetStepOneBody: {
    id: 'adminPortal.productTours.adminOnboarding.allocateLearningBudget.body.1',
    defaultMessage: 'Manage Learner Credit budgets to invite learners to enroll or assign courses directly.',
    description: 'Description for the allocate learning budgets flow step one body',
  },
  allocateLearningBudgetStepTwoBody: {
    id: 'adminPortal.productTours.adminOnboarding.allocateLearningBudget.body.2',
    defaultMessage: 'Use search and filters to quickly find the budget you\'re looking for.',
    description: 'Description for the allocate learning budgets flow step two',
  },
  allocateLearningBudgetStepThreeBody: {
    id: 'adminPortal.productTours.adminOnboarding.allocateLearningBudget.body.3',
    defaultMessage: 'Let\'s view your Assignment budget.',
    description: 'Description for the allocate learning budgets flow step three',
  },
  allocateAssignmentBudgetStepFourBody: {
    id: 'adminPortal.productTours.adminOnboarding.allocateAssignmentBudget.body.4',
    defaultMessage: 'The budget detail card provides an overview of your budget, including its type, expiration date, and balance.',
    description: 'Description for the allocate learning budgets flow step four',
  },
  allocateAssignmentBudgetStepFiveBody: {
    id: 'adminPortal.productTours.adminOnboarding.allocateAssignmentBudget.body.5',
    defaultMessage: '"New Assignment" allows you to assign courses from your catalog.',
    description: 'Description for the allocate learning budgets flow step five',
  },
  allocateAssignmentBudgetZeroStateStepSixBody: {
    id: 'adminPortal.productTours.adminOnboarding.allocateAssignmentBudgetZeroState.body.6',
    defaultMessage: 'Once learners are using this budget, you\'ll be able to track all activity, including enrollment'
    + ' spending on the "Activity" tab.',
    description: 'Description for the allocate learning budgets flow step six zero state',
  },
  allocateAssignmentBudgetStepSixBody: {
    id: 'adminPortal.productTours.adminOnboarding.allocateAssignmentBudget.body.6',
    defaultMessage: 'Expand "Utilization Details" to see a breakdown of spent funds and pending assignments.',
    description: 'Description for the allocate learning budgets flow step six',
  },
  allocateAssignmentBudgetStepSevenBody: {
    id: 'adminPortal.productTours.adminOnboarding.allocateAssignmentBudget.body.7',
    defaultMessage: 'Track all budget activity, including pending assignments and enrollment spending.',
    description: 'Description for the allocate learning budgets flow step seven',
  },
  allocateAssignmentBudgetStepEightBody: {
    id: 'adminPortal.productTours.adminOnboarding.allocateAssignmentBudget.body.8',
    defaultMessage: 'The Assigned table helps you monitor learner assignments, send reminders, or cancel as needed.',
    description: 'Description for the allocate learning budgets flow step eight',
  },
  allocateAssignmentBudgetStepNineBody: {
    id: 'adminPortal.productTours.adminOnboarding.allocateAssignmentBudget.body.9',
    defaultMessage: 'The Spent table allows you to review spending details for this budget.',
    description: 'Description for the allocate learning budgets flow step nine',
  },
  allocateAssignmentBudgetStepTenBody: {
    id: 'adminPortal.productTours.adminOnboarding.allocateAssignmentBudget.body.10',
    defaultMessage: 'Use the Catalog tab to browse available courses and assign them directly to learners.',
    description: 'Description for the allocate learning budgets flow step ten',
  },
  allocateAssignmentBudgetStepElevenBody: {
    id: 'adminPortal.productTours.adminOnboarding.allocateAssignmentBudget.body.11',
    defaultMessage: 'To view more budgets, return to Learner Credit Management using the breadcrumbs or left-hand navigation.',
    description: 'Description for the allocate learning budgets flow step eleven',
  },
  administerSubscriptionsStepNineBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.9',
    defaultMessage: 'Review and manage course requests from your learners.',
    description: 'Description for the administer subscriptions flow step nine',
  },
  viewCustomizeReportsTitle: {
    id: 'adminPortal.productTours.adminOnboarding.customizeReports.title',
    defaultMessage: 'Customize reports',
    description: 'Title for the customize reports step',
  },
  viewCustomizeReports: {
    id: 'adminPortal.productTours.adminOnboarding.customizeReports.title.1',
    defaultMessage: 'Automate reporting on learner engagement, progress, and catalog activity. Set up reports to be delivered '
      + 'to your email daily, weekly, or monthly for easy tracking.',
    description: 'Description for the customize reports step',
  },
  viewSetUpPreferencesTitle: {
    id: 'adminPortal.productTours.adminOnboarding.setUpPreferences.title',
    defaultMessage: 'Set up preferences',
    description: 'Title for the set up preferences step',
  },
  viewSetUpPreferences: {
    id: 'adminPortal.productTours.adminOnboarding.setUpPreferences.title.1',
    defaultMessage: 'Customize and configure your portal to fit your organization\'s needs. Set up branding, '
      + 'manage learner access, enable SSO, and integrate learning platforms—all in one place.',
    description: 'Description for the set up preferences step',
  },
  completeTourModalTitle: {
    id: 'adminPortal.productTours.adminOnboarding.completeTour.modalTitle',
    defaultMessage: 'Great job!',
    description: 'Description for the complete tour modal title',
  },
  completeTourModal: {
    id: 'adminPortal.productTours.adminOnboarding.completeTour.modal',
    defaultMessage: 'You\'ve completed the Quick Start Guide and are ready to administer learning. Need a refresher? Access this guide anytime from the help icon below.',
    description: 'Description for the complete tour modal',
  },
});

export default messages;
