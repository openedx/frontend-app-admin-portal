import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'courseCard.relatedSkillsHeading': {
    id: 'courseCard.relatedSkillsHeading',
    defaultMessage: 'Related skills',
    description: 'Heading of related skills section',
  },
  'courseCard.aLaCarteBadge': {
    id: 'courseCard.aLaCarteBadge',
    defaultMessage: 'A la carte',
    description: 'Badge text for the `A La Carte` catalog badge.',
  },
  'courseCard.businessBadge': {
    id: 'courseCard.businessBadge',
    defaultMessage: 'Business',
    description: 'Badge text for the `Business` catalog badge.',
  },
  'courseCard.priceNotAvailable': {
    id: 'courseCard.priceNotAvailable',
    defaultMessage: ' Not Available',
    description:
      'When a course price is not available, notify learners that there is no data available to display.',
  },
});

export default messages;
