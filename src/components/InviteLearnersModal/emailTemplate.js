import { getSubscriptionContactText } from '../../utils';

const emailTemplate = {
  greeting: 'Congratulations!',
  body: `{ENTERPRISE_NAME} has partnered with edX to give you an unlimited subscription to learn on edX!  Take the best courses in the most in-demand subject areas and upskill for a new career opportunity.  Earn a professional certificate, start a program or just learn for fun.
{LICENSE_ACTIVATION_LINK}

So you don’t have to search for this link, bookmark your learning portal now to have easy access to your subscription in the future.

{LEARNER_PORTAL_LINK}
`,
  closing: getSubscriptionContactText,
};

export default emailTemplate;
