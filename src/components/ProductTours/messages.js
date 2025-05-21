import { defineMessages } from '@edx/frontend-platform/i18n';

export const TRACK_LEARNER_PROGRESS_TITLE = 'Track Learner Progress';

const messages = defineMessages({
  collapsibleTitle: {
    id: 'admin.portal.productTours.collapsible.title',
    defaultMessage: 'Quick Start Guide',
    description: 'Title for the product tours collapsible component.',
  },
  collapsibleIntro: {
    id: 'admin.portal.productTours.collapsible.intro',
    defaultMessage: 'Select any item in the guide to learn more about your administrative portal.',
    description: 'Introductory text at the top of the product tours collapsible component.',
  },
  questionIconTooltip: {
    id: 'admin.portal.productTours.questionIcon.Tooltip',
    defaultMessage: 'Quick Start Guide',
    description: 'Tooltip for the question icon in the product tours component.',
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
