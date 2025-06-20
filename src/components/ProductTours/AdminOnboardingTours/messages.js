import { defineMessages } from '@edx/frontend-platform/i18n';

export const TRACK_LEARNER_PROGRESS_TITLE = 'Track Learner Progress';

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
    id: 'adminPortal.productTours.adminOnboarding.trackLearnerProgress.title',
    defaultMessage: TRACK_LEARNER_PROGRESS_TITLE,
    description: 'Title for the learner progress tracking step',
  },
  trackLearnerProgressStepOneBody: {
    id: 'adminPortal.productTours.adminOnboarding.trackLearnerProgress.body',
    defaultMessage: 'Track learner activity and progress across courses with the Learner Progress Report.',
    description: 'Description for the learner progress tracking step one',
  },
});

export default messages;
