import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  noBudgetActivityTitle: {
    id: 'learner.credit.management.empty.state.no.budget.activity.title',
    defaultMessage: 'No budget activity yet? Invite learners to browse the catalog and request content!',
    description: 'Title for the no budget activity empty state',
  },
  inviteLearners: {
    id: 'learner.credit.management.empty.state.invite.learners',
    defaultMessage: 'Invite learners',
    description: 'Title for the invite learners section',
  },
  stepOne: {
    id: 'learner.credit.management.empty.state.step.one',
    defaultMessage: '01',
    description: 'Step number for invite learners',
  },
  inviteLearnersDescription: {
    id: 'learner.credit.management.empty.state.invite.learners.description',
    defaultMessage: 'Use the Settings tab in this budget to select the authentication method that will allow learners to access the catalog.',
    description: 'Description for the invite learners section',
  },
  learnersFind: {
    id: 'learner.credit.management.empty.state.learners.find',
    defaultMessage: 'Learners find the right course',
    description: 'Title for the learners find section',
  },
  stepTwo: {
    id: 'learner.credit.management.empty.state.step.two',
    defaultMessage: '02',
    description: 'Step number for learners find course',
  },
  learnersFindDescription: {
    id: 'learner.credit.management.empty.state.learners.find.description',
    defaultMessage: 'Learners can then browse the catalog associated with this budget and request a course that aligns with their interests.',
    description: 'Description for the learners find section',
  },
  approveRequests: {
    id: 'learner.credit.management.empty.state.approve.requests',
    defaultMessage: 'Approve requests',
    description: 'Title for the approve requests section',
  },
  stepThree: {
    id: 'learner.credit.management.empty.state.step.three',
    defaultMessage: '03',
    description: 'Step number for approve requests',
  },
  approveRequestsDescription: {
    id: 'learner.credit.management.empty.state.approve.requests.description',
    defaultMessage: 'Once approved, the total cost of the requested course will be deducted from your budget, and you can track your spending right here!',
    description: 'Description for the approve requests section',
  },
  getStarted: {
    id: 'learner.credit.management.empty.state.get.started',
    defaultMessage: 'Get started',
    description: 'Button text to get started with the process',
  },
  findCourseIllustrationAlt: {
    id: 'learner.credit.management.empty.state.find.course.illustration.alt',
    defaultMessage: 'Find course illustration',
    description: 'Alt text for find course illustration',
  },
  inviteLearnerIllustrationAlt: {
    id: 'learner.credit.management.empty.state.invite.learner.illustration.alt',
    defaultMessage: 'Invite learner illustration',
    description: 'Alt text for invite learner illustration',
  },
  approveRequestIllustrationAlt: {
    id: 'learner.credit.management.empty.state.approve.request.illustration.alt',
    defaultMessage: 'Approve request illustration',
    description: 'Alt text for approve request illustration',
  },
});

export default messages;
