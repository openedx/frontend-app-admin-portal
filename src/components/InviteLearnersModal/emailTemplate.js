import { getSubscriptionContactText } from '../../utils';

const emailTemplate = {
  greeting: 'Congratulations!',
  body: `{ENTERPRISE_NAME} has partnered with edX to give you an unlimited subscription to learn on edX!  Take the best courses in the most in-demand subject areas and upskill for a new career opportunity.  Earn a professional certificate, start a program or just learn for fun.
{LICENSE_ACTIVATION_LINK}

About edX

Since 2012, edX has been committed to increasing access to high-quality education for everyone, everywhere. By harnessing the transformative power of education through online learning, edX empowers learners to unlock their potential and become changemakers.

We are excited to welcome you to our growing community of over 35 million users and 15 thousand instructors from 160 partner universities and organizations.
`,
  closing: getSubscriptionContactText,
};

export default emailTemplate;
