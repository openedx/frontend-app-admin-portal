import { defineMessages } from '@edx/frontend-platform/i18n';

export const TRACK_LEARNER_PROGRESS_TITLE = 'Track learner progress';
export const ORGANIZE_LEARNERS_TITLE = 'Organize learners';

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
    defaultMessage:  ORGANIZE_LEARNERS_TITLE,
    description: 'Title for the organize learners flow step one',
  },
  organizeLearnersStepOneBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.body.1',
    defaultMessage: 'Create learner groups, view all learners in your organization, and access individual learner profiles—all in one place.',
    description: 'Description for the organize learners flow step one',
  },
  organizeLearnersStepTwoBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.body.2',
    defaultMessage: 'Organize learners by creating groups for tracking and assignments.',
    description: 'Description for the organize learners flow step two',
  },
  organizeLearnersStepThreeBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.body.3',
    defaultMessage: 'When you\'re ready, use "Create Group" to get started.',
    description: 'Description for the organize learners flow step three',
  },
  organizeLearnersStepFourBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.body.4',
    defaultMessage: 'View all learners in your organization. Search by name and access profiles to track progress and view learning access.',
    description: 'Description for the organize learners flow step four',
  },
  organizeLearnersStepFiveBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.body.5',
    defaultMessage: 'View key details about this learner, including their name, email, join date, and course enrollments.',
    description: 'Description for the organize learners flow step five',
  },
  organizeLearnersStepSixBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.body.6',
    defaultMessage: '"View more" allows you to see the learner\'s full profile. Let\'s take you there now!',
    description: 'Description for the organize learners flow step six',
  },
  organizeLearnersStepSevenBody: {
    id: 'adminPortal.productTours.adminOnboarding.organizeLearners.body.7',
    defaultMessage: 'View a learner\'s enrollments, access type, and group memberships at a glance.',
    description: 'Description for the organize learners flow step seven',
  },
});

export default messages;
